extends Node

signal transition_requested(old_branch: Node, new_branch: Node, slot: Node)
signal page_changed(new_page: Page)

const BASE_PATH: String = "res://routes/"
const LAYOUT_NAME: String = "+layout"
const LAYOUT_SCENE: String = LAYOUT_NAME + ".tscn"
const PAGE_NAME: String = "+page"
const PAGE_SCENE: String = PAGE_NAME + ".tscn"

## URL <-> filesystem route map (group folders are stripped from URL keys)
var _url_to_fs: Dictionary[String, String] = {}

## Current page information
var page: Page = Page.new()
var _active_routes: Dictionary[String, Route] = {}

func _ready() -> void:
	_build_route_index()
	_bootstrap_initial_scene()

func goto(raw_url: String, instance_override: Node = null) -> void:
	var parsed: Dictionary = _parse_url(raw_url)
	var url_path: String = _normalize_url(parsed["path"])
	var params: Dictionary[String, String] = parsed["params"]

	if url_path == page.url:
		page.params = params
		return

	assert(_url_to_fs.has(url_path), 'Router: route not found for URL: "%s"')

	var route_path: String = _url_to_fs[url_path]
	var new_segments: PackedStringArray = route_path.split("/", false)

	var old_route_path: String = _url_to_fs.get(page.url, "")
	var old_segments: PackedStringArray = old_route_path.split("/", false)

	var div_idx: int = 0
	while div_idx < old_segments.size() and div_idx < new_segments.size() and old_segments[div_idx] == new_segments[div_idx]:
		div_idx += 1

	var target_slot: Node = null
	if div_idx < old_segments.size():
		var segment: String = _get_path_up_to(old_segments, div_idx + 1)
		var layout_path: String = BASE_PATH + segment.path_join(LAYOUT_SCENE)
		var page_path: String = BASE_PATH + segment.path_join(PAGE_SCENE)
		if _active_routes.has(layout_path):
			target_slot = _active_routes[layout_path].node
		elif _active_routes.has(page_path):
			target_slot = _active_routes[page_path].node
	elif div_idx > 0:
		var segment: String = _get_path_up_to(new_segments, div_idx)
		var page_path: String = BASE_PATH + segment.path_join(PAGE_SCENE)
		var layout_path: String = BASE_PATH + segment.path_join(LAYOUT_SCENE)
		if _active_routes.has(page_path):
			target_slot = _active_routes[page_path].node
		elif _active_routes.has(layout_path):
			target_slot = _active_routes[layout_path].node

	# 4. Build the new branch
	var first_new_node: Node = null
	var current_parent: Node = target_slot
	# Build layouts, then final page (leaf layouts are valid and loaded before +page)
	if target_slot == null:
		var root_layout_path: String = BASE_PATH + LAYOUT_SCENE
		if FileAccess.file_exists(root_layout_path):
			var root_layout: Node = load(root_layout_path).instantiate()
			_apply_debug_route_name(root_layout)
			_register_route_entry(root_layout)
			first_new_node = root_layout
			current_parent = _find_slot(root_layout)

	for depth in range(div_idx + 1, new_segments.size() + 1):
		var layout_segment: String = _get_path_up_to(new_segments, depth)
		var layout_path: String = BASE_PATH + layout_segment.path_join(LAYOUT_SCENE)
		if not FileAccess.file_exists(layout_path):
			continue

		var layout_instance: Node = load(layout_path).instantiate()
		_apply_debug_route_name(layout_instance)
		_register_route_entry(layout_instance)

		if first_new_node == null:
			first_new_node = layout_instance
		else:
			_mount_into_outlet(current_parent, layout_instance)

		current_parent = _find_slot(layout_instance)

	var page_segment: String = _get_path_up_to(new_segments, new_segments.size())
	var page_path: String = BASE_PATH + page_segment.path_join(PAGE_SCENE)
	if not FileAccess.file_exists(page_path):
		push_error("Router: missing page scene at '%s'" % page_path)
		return

	var page_instance: Node = null
	if instance_override:
		assert(is_instance_valid(instance_override), "Router: instance_override is not a valid node.")
		assert(instance_override.scene_file_path == page_path, "Router: instance_override must have the same path of the expected page.\ninstance_override path: %s\npage path: %s" % [instance_override.scene_file_path, page_path])
		page_instance = instance_override
	else:
		page_instance = load(page_path).instantiate()

	_apply_debug_route_name(page_instance)
	_register_route_entry(page_instance)

	if first_new_node == null:
		first_new_node = page_instance
	else:
		_mount_into_outlet(current_parent, page_instance)

	_prune_active_routes(old_segments, new_segments, div_idx)
	_rebuild_current_page(url_path, params)

	if target_slot == null:
		# if first load, then attach to tree root
		_attach_child_safe(get_tree().root, first_new_node)
	else:
		# replace the slot with a the new node
		_replace_slot_safe(target_slot, first_new_node)

func get_page_scene_path(url: String) -> String:
	var route_path: String = _url_to_fs.get(url, "")
	assert(route_path, 'Router: url "%s" does not have an associated route path.' % url)
	return BASE_PATH + route_path.path_join(PAGE_SCENE)

func set_data(node: Node, data: Dictionary[String, Variant]) -> void:
	assert(node and is_instance_valid(node), "Router: Cannot set page.data on an invalid node.")
	var scene_path: String = node.scene_file_path
	assert(scene_path != "", "Router: Cannot set page.data for node without a scene_file_path.")
	assert(_active_routes.has(scene_path), "Router: Cannot set page.data for an inactive route node.")
	assert(_active_routes[scene_path].node == node, "Router: Cannot set page.data for an inactive route node.")

	_active_routes[scene_path].data = data

func _parse_url(raw_url: String) -> Dictionary:
	var params: Dictionary[String, String] = {}
	var url: String = raw_url
	if "?" in raw_url:
		var parts: PackedStringArray = raw_url.split("?", true, 1)
		url = parts[0]
		for pair: String in parts[1].split("&"):
			var kv: PackedStringArray = pair.split("=")
			if kv.size() == 2: params[kv[0]] = kv[1].uri_decode()
	return {"path": url, "params": params}

func _normalize_url(path: String) -> String:
	var clean: String = path.simplify_path().strip_edges()
	while clean.begins_with("/"):
		clean = clean.trim_prefix("/")
	while clean.ends_with("/"):
		clean = clean.trim_suffix("/")
	return "/" + clean if clean != "" else "/"

func _get_path_up_to(segments: PackedStringArray, idx: int) -> String:
	return "/".join(segments.slice(0, idx))

func _find_slot(node: Node) -> Node:
	var nested_slot: RouterSlot = node.find_child("RouterSlot", true, false)
	assert(nested_slot, 'Router: slot could not be found in node "%s".' % node)
	return nested_slot

func _attach_child_safe(parent: Node, child: Node) -> void:
	if parent.is_inside_tree():
		parent.call_deferred("add_child", child)
	else:
		parent.add_child(child)

func _mount_into_outlet(outlet: Node, new_node: Node) -> void:
	if outlet is RouterSlot:
		_replace_slot_safe(outlet, new_node)
	else:
		_attach_child_safe(outlet, new_node)

func _replace_slot_safe(slot_node: Node, new_node: Node) -> void:
	var slot_parent: Node = slot_node.get_parent()
	assert(slot_parent, 'Router: slot "%s" must have a parent.' % slot_node)

	var old_index: int = slot_node.get_index()
	_do_replace_slot(slot_parent, slot_node, new_node, old_index)

func _do_replace_slot(parent: Node, old_slot: Node, new_node: Node, old_index: int) -> void:
	if not is_instance_valid(parent) or not is_instance_valid(new_node):
		return

	if is_instance_valid(old_slot):
		parent.remove_child(old_slot)
		old_slot.queue_free()

	parent.add_child(new_node)
	parent.move_child(new_node, mini(old_index, parent.get_child_count() - 1))

func _rebuild_current_page(url: String, params: Dictionary[String, String]) -> void:
	var p_path: String = BASE_PATH + _url_to_fs[url] + "/" + PAGE_SCENE
	var p_route: Route = _active_routes[p_path]

	var data: Dictionary[String, Variant] = {}
	for route: Route in _active_routes.values():
		data.merge(route.data, true)

	page.url = url
	page.node = p_route.node
	page.params = params
	page.data = data

	page_changed.emit.call_deferred(page)

func _prune_active_routes(old_segments: PackedStringArray, new_segments: PackedStringArray, div_idx: int) -> void:
	var keys_to_remove: Array[String] = []

	for key: String in _active_routes.keys():
		# Keep root layout always
		if key == BASE_PATH + LAYOUT_SCENE:
			continue

		# Extract the filesystem directory from the route key (remove .tscn suffix and filename)
		var route_path: String = key.trim_prefix(BASE_PATH).trim_suffix("/" + LAYOUT_SCENE).trim_suffix("/" + PAGE_SCENE)

		var route_segments: PackedStringArray = PackedStringArray()
		if route_path != "":
			route_segments = route_path.split("/", false)

		# Check if this route is on the active path
		var is_on_path: bool = true
		for i in range(route_segments.size()):
			if i >= new_segments.size() or route_segments[i] != new_segments[i]:
				is_on_path = false
				break

		if is_on_path:
			# If this is a page that has been replaced by deeper layouts, remove it
			if key.ends_with("/" + PAGE_SCENE) and route_segments.size() < new_segments.size():
				keys_to_remove.append(key)
		else:
			# Not on the active path at all, remove it
			keys_to_remove.append(key)

	for key in keys_to_remove:
		_active_routes.erase(key)

func _apply_debug_route_name(node: Node) -> void:
	if not OS.is_debug_build():
		return

	var scene_path: String = node.scene_file_path
	var debug_prefix: String = ""
	if scene_path.ends_with("/" + PAGE_SCENE):
		debug_prefix = PAGE_NAME
	elif scene_path.ends_with("/" + LAYOUT_SCENE):
		debug_prefix = LAYOUT_NAME

	if debug_prefix == "" or node.name.begins_with(debug_prefix):
		return

	node.name = "%s %s" % [debug_prefix, node.name]

func _register_route_entry(node: Node) -> void:
	var p: Route = Route.new()
	p.node = node
	_active_routes[node.scene_file_path] = p

func _build_route_index() -> void:
	_url_to_fs.clear()
	_scan_route_dir(BASE_PATH, "")

func _scan_route_dir(abs_dir: String, rel_dir: String) -> void:
	var dir: DirAccess = DirAccess.open(abs_dir)
	if dir == null:
		return

	dir.list_dir_begin()
	while true:
		var entry: String = dir.get_next()
		if entry == "":
			break
		if entry.begins_with("."):
			continue

		var next_abs: String = abs_dir.path_join(entry)
		if dir.current_is_dir():
			var next_rel: String = rel_dir.path_join(entry) if rel_dir != "" else entry
			_scan_route_dir(next_abs, next_rel)
		elif entry == PAGE_SCENE:
			var url: String = _fs_path_to_url(rel_dir)
			_url_to_fs[url] = rel_dir
	dir.list_dir_end()

func _fs_path_to_url(fs_path: String) -> String:
	if fs_path == "":
		return "/"

	var filter_function: Callable = func(s: String):
		if s.begins_with("(") and s.ends_with(")"):
			return
		return s

	var parts: Array = fs_path.split("/", false)
	var filtered_parts: PackedStringArray = parts.filter(filter_function)

	if filtered_parts.is_empty():
		return "/"

	return "/" + "/".join(filtered_parts)

func _scene_path_to_fs_path(scene_path: String) -> String:
	if not scene_path.begins_with(BASE_PATH):
		return ""
	if not scene_path.ends_with("/" + PAGE_SCENE):
		return ""
	return scene_path.trim_prefix(BASE_PATH).trim_suffix("/" + PAGE_SCENE)

func _bootstrap_initial_scene() -> void:
	var current: Node = get_tree().current_scene
	if current == null:
		return

	var fs_path: String = _scene_path_to_fs_path(current.scene_file_path)
	if fs_path == "":
		return

	current.queue_free()
	var url: String = _fs_path_to_url(fs_path)
	goto(url)
