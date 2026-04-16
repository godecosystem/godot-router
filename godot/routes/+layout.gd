extends Node

var tween: Tween

func _ready() -> void:
	Router.page_changed.connect(_on_page_changed)
	Router.transition_requested.connect(_transition)
	%Transition.hide()

func _on_page_changed(page: Page):
	%CurrentPageLabel.text = page.url

func _transition(old_branch: Node, new_branch: Node, slot: Node):
	prints("OLD BRANCH:", old_branch)
	prints("NEW BRANCH:", new_branch)
	prints("SLOT:", slot)

	#if tween:
		#tween.kill()
#
	#%Transition.color.a = 0.0
	#%Transition.show()
	#tween = create_tween()
	#tween.tween_property(%Transition, "color:a", 1.0, 0.5)
	#await tween.finished
