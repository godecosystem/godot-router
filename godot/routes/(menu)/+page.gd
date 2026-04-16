extends PanelContainer

func _ready() -> void:
	%Button.pressed.connect(Router.goto.bind("/loader?target=/heavy-level"))
	%Button2.pressed.connect(Router.goto.bind("/audio"))
	%Button3.pressed.connect(get_tree().quit)
