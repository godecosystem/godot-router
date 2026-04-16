extends Control

@export var use_sub_threads: bool = true

var _target_url: String = ""
var _target_scene_path: String = ""

var tween: Tween

func _ready() -> void:
	set_process(false)

	_target_url = Router.page.params.get("target", "")
	if _target_url == "":
		push_error('Loader: missing required query param "target"')
		Router.goto("/")
		return

	_target_scene_path = Router.get_page_scene_path(_target_url)
	if _target_scene_path == "":
		push_error('Loader: route not found for target "%s"' % _target_url)
		Router.goto("/")
		return

	var request_result: int = ResourceLoader.load_threaded_request(_target_scene_path, "", use_sub_threads)
	if request_result != OK:
		push_error('Loader: failed to start threaded load for "%s"' % _target_scene_path)
		Router.goto("/")
		return

	set_process(true)

func _process(_delta: float) -> void:
	var progress: Array = []
	var status: ResourceLoader.ThreadLoadStatus = ResourceLoader.load_threaded_get_status(_target_scene_path, progress)
	if progress.size() > 0:
		var progress_value: float = progress[0] * 100.0

		if $ProgressBar.value == progress_value:
			return

		if tween:
			tween.kill()

		tween = create_tween()
		tween.tween_property(%ProgressBar, "value", progress_value, 0.1)

	if status == ResourceLoader.THREAD_LOAD_IN_PROGRESS:
		return

	set_process(false)

	if status != ResourceLoader.THREAD_LOAD_LOADED:
		push_error('Loader: threaded load failed for "%s"' % _target_scene_path)
		Router.goto("/")
		return

	var loaded_resource: Resource = ResourceLoader.load_threaded_get(_target_scene_path)
	if loaded_resource == null or not (loaded_resource is PackedScene):
		push_error('Loader: loaded resource is not a PackedScene for "%s"' % _target_scene_path)
		Router.goto("/")
		return

	var instance: Node = loaded_resource.instantiate()

	if tween.is_running():
		await tween.finished

	Router.goto(_target_url, instance)
