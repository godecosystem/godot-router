@tool
extends Node
class_name RouterSlot

func _notification(what: int) -> void:
	if what == NOTIFICATION_CHILD_ORDER_CHANGED:
		update_configuration_warnings()

func _get_configuration_warnings() -> PackedStringArray:
	if get_child_count() == 0:
		return PackedStringArray()

	return PackedStringArray([
		"RouterSlot currently has children. Router navigation will replace all children under this node at runtime."
	])
