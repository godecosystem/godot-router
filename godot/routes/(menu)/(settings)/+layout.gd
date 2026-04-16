extends MarginContainer

func _ready() -> void:
	%Button.pressed.connect(Router.goto.bind("/audio"))
	%Button2.pressed.connect(Router.goto.bind("/controls"))
	%Button3.pressed.connect(Router.goto.bind("/gameplay"))
