---
description: Learn what pages are in Godot-Router, how to create them, and how to use them for file-based routing.
---

## What is a Page?

A **Page** is a scene that represents a route.

- Any non-group[^first] folder under `routes` can have a `+page.tscn` file.
- Pages can have a script (`+page.gd`) like any other scene.

[^first]: Normally, `+page.tscn` files are placed in regular folders under `routes`, not in group folders (folders named with parentheses, like `(menu)`). Group folders are used for organizing routes and do not create their own routes by default. However, if you want a route (such as `/`) to be handled by a page inside a group folder, you can place a `+page.tscn` there as an exception.

## Changing Pages

You can change to a new page or __route__ by calling the `Router.goto()` function. For example, if I wanted to load `routes/signup/+page.tscn` I can call `Router.goto("/signup")` on a button pressed script.

```gd
Router.goto("/signup")
```

## Accessing the Current Page

You can access the current page by using the `Router.page` variable or by connecting to the `Router.page_changed` signal. The page variable is a resource of the type `Page` that extends the `Route` resource.

<FileReader file="../godot/addons/godot-router/scripts/route.gd" title="addons/godot-router/scripts/route.gd" />

<FileReader file="../godot/addons/godot-router/scripts/page.gd" title="addons/godot-router/scripts/page.gd" />

### url

The `Page` saves the current url. This is useful for applying logic based on its condition. For example, you could show a back button on a `+layout.tscn` when not on the main page.

```gd title="routes/+layout.tscn"
extends Control

func _ready() -> void:
	Router.page_changed.connect(_on_page_changed)
	%BackButton.pressed.connect(Router.goto.bind("/"))

func _on_page_changed(page: Page) -> void:
	%BackButton.visible = page.url != "/"
```

### params

The `Page` saves params passed in from the url as a dictionary. You can pass in params with the url by setting a key-value pairs following a `?`. For example, `Router.goto("/user?id=123&q=username")` would result in params `{ "id": "123", "q": "username" }`.

### data

The `Page` saves data set via code from layouts or itself by calling `Router.set_data(node, data)`. This data will contain a merged dictionary of all the parent layouts.

```gd title="+layout.tscn"
func _ready() -> void:
    Router.set_data(self, { "show_button": true })
```

```gd title="+page.tscn"
func _ready() -> void:
    Router.set_data(self, { "show_button": false, "extra_data" : ... })
```

The latest routes take priority for the `Page.data`. In the above example, the `Page.data["show_button"]` would be `false` since it overrides its layout data.

Navigating to another page under that layout that does not have the "show_button" data would result in it going back to `true`.