---
title: Group Folders
description: Learn how to use group folders denoted with parentheses to organize routes and layouts without affecting URLs in Godot-Router.
---

## What are Groups?

In Godot-Router, you can organize your routes using group folders — directories whose names are wrapped in parentheses, like `(app)` or `(marketing)`. 

These folders do not affect the URL path of the routes inside them, but they let you group related routes under a shared layout or for organizational clarity.

## Example Structure

import { Tree, TreeFolder, TreeFile } from '$ui/tree';

<Tree>
	<TreeFolder name="routes" open noInteraction>
		<TreeFolder name="(app)">
			<TreeFolder name="dashboard">
				<TreeFile name="+page.tscn" />
			</TreeFolder>
			<TreeFolder name="item">
				<TreeFile name="+page.tscn" />
			</TreeFolder>
			<TreeFile name="+layout.tscn" />
		</TreeFolder>
		<TreeFolder name="(marketing)">
			<TreeFolder name="about">
				<TreeFile name="+page.tscn" />
			</TreeFolder>
			<TreeFolder name="testimonials">
				<TreeFile name="+page.tscn" />
			</TreeFolder>
			<TreeFile name="+layout.tscn" />
		</TreeFolder>
		<TreeFolder name="admin">
			<TreeFile name="+page.tscn" />
		</TreeFolder>
		<TreeFile name="+layout.tscn" />
	</TreeFolder>
</Tree>

In this example, routes like `/dashboard` and `/item` will use the `(app)` layout, while `/about` and `/testimonials` will use the `(marketing)` layout. The group folder names do not appear in the URL.

## Pages in Group Folders

You can also put a `+page.tscn` directly inside a group folder. For example, if you want the root route `/` to use the `(app)` or `(marketing)` layout, you can place a `+page.tscn` in the group folder.