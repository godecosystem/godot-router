---
title: FAQ
description: Frequently asked questions and answers about Godot-Router.
---

### What is Godot-Router?

Godot-Router is a file-based routing addon for Godot, inspired by [SvelteKit](https://svelte.dev/docs/kit/routing). It lets you organize scenes and navigation using folders and file names.

### How do I add a new route?

Create a folder under `routes` and add a `+page.tscn` file inside it.. The folder name becomes the route path.

### How do I share UI between pages?

Add a `+layout.tscn` file in a folder. All pages and subfolders will be wrapped by this layout.
Add a `RouterSlot` node to the layout where you want pages to appear.

### How do I navigate between pages?

Call `Router.goto("/path")` in your scripts to change routes.

### How can I pass down data from layouts to pages?

Call `Router.set_data(node, data)` in your layout script. The data will be merged into `Router.page` for the child page.

### Can I use parameters in routes?

Yes, you can pass parameters as string key-value pairs in the `Router.goto` function like `Router.goto("/user?id=123&q=username")`. Access these parameters via `Router.page.params`.

### What version of godot does this work on?

Godot-Router is designed for Godot 4.x.

### Do I need to manually add the Router autoload?

No. Enabling the addon will add the Router singleton automatically.
