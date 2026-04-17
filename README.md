# Godot-Router

> File-based routing for Godot, inspired by SvelteKit.

## Overview

Godot-Router is a free and open-source addon for Godot 4.x that brings file-based routing to your Godot projects. Organize your scenes and navigation using folders and naming conventions, just like modern web frameworks.

## Features

- 📁 File-based routing using folders and file names
- 🧩 Layouts and nested layouts for shared UI
- 🔗 Simple navigation with `Router.goto()`
- 🗂️ Group folders for advanced layout control (e.g., `(app)`, `(marketing)`)
- ⚡ Automatic route parameter and query string support
- 🛠️ Easy integration and configuration

## Installation

1. Download or clone this repository into your Godot project's `addons` folder.
2. Enable the Godot-Router addon in **Project > Project Settings > Plugins**.

## Quick Start

1. Create a `routes` folder in your project root.
2. Add folders and `+page.tscn` files for each route (e.g., `routes/main/+page.tscn`).
3. (Optional) Add `+layout.tscn` files for shared UI in any folder.
4. Set your main scene to a page (e.g., `routes/main/+page.tscn`).
5. Use `Router.goto("/main")` in your scripts to navigate.

## Example Structure

```text
routes/
	(app)/
		dashboard/
			+page.tscn
		item/
			+page.tscn
		+layout.tscn
	(marketing)/
		about/
			+page.tscn
		testimonials/
			+page.tscn
		+layout.tscn
	admin/
		+page.tscn
	+layout.tscn
```

## Documentation

- [Documentation](https://godecosystem.github.io/godot-router/docs)

## License

MIT License
