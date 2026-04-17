---
title: Router.gd
description: Learn about the Router autoload singleton, its API, and how to change it if neccessary.
---

## What is the Router Autoload?

The **Router** is a singleton (autoload) added to your project by the Godot-Router addon. It manages navigation, route changes, and provides a global API for routing.

## How It’s Registered

When you enable the addon, it automatically adds the Router as an autoload singleton:

- Name: `Router`
- Path: `res://addons/godot-router/scripts/router.gd`

## Main API

#### Variables

- `Router.page` — The current page object, with properties like `url`, `params`, `node`, and `data`.

#### Functions

- `Router.goto(path: String) -> void` — Navigate to a route.
- `Router.set_data(node: Node, data: Dictionary[String, Variant]) -> void` — Set data for a specific route node such as `+layout.tscn` or `+page.tscn`

#### Signals

- `page_changed(new_page: Page)` — Emitted when the route changes.
- `transition_requested` — Emitted for animated transitions.

## Why Use the Router Singleton?

- Centralized navigation logic
- Easy access from any script
- Consistent route management

## Configuration

Although not advised, it is technically possible to change the addon since it's code is directly in your project. If you simply want to change things like the naming conventions, you can edit the variables at the top of the file.

```gd title="Router.gd"
const BASE_PATH: String = "res://routes/"
const LAYOUT_NAME: String = "+layout"
const LAYOUT_SCENE: String = LAYOUT_NAME + ".tscn"
const PAGE_NAME: String = "+page"
const PAGE_SCENE: String = PAGE_NAME + ".tscn"
```

## File

Below is the entire code of the `Router.gd` file.

<FileReader file="../godot/addons/godot-router/scripts/router.gd" title="router.gd" showLineNumbers />