@tool
extends EditorPlugin

const AUTOLOAD_NAME: String = "Router"
const AUTOLOAD_PATH: String = "res://addons/godot-router/scripts/router.gd"
const SLOT_TYPE_NAME: String = "RouterSlot"
const SLOT_BASE_TYPE: String = "Node"
const SLOT_SCRIPT: Script = preload("res://addons/godot-router/scripts/slot.gd")
const SLOT_ICON: Texture2D = preload("res://addons/godot-router/scripts/router_slot.svg")

func _enter_tree() -> void:
	# Ensure the Router singleton exists when the plugin is enabled.
	if not ProjectSettings.has_setting("autoload/%s" % AUTOLOAD_NAME):
		add_autoload_singleton(AUTOLOAD_NAME, AUTOLOAD_PATH)

	# Register RouterSlot in the Create Node dialog.
	add_custom_type(SLOT_TYPE_NAME, SLOT_BASE_TYPE, SLOT_SCRIPT, SLOT_ICON)

func _exit_tree() -> void:
	remove_custom_type(SLOT_TYPE_NAME)
