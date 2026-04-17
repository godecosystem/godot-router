extends Control

func _ready() -> void:
	Router.page_changed.connect(_on_page_changed)
	%BackButton.pressed.connect(Router.goto.bind("/"))

func _on_page_changed(page: Page) -> void:
	%BackButton.visible = page.url != "/"
