---
title: What is Godot-Router?
description: Godot-Router is a free addon for Godot that helps organize files and manage navigation between scenes.
---

import { Tree, TreeFolder, TreeFile } from '$ui/tree';


## What is Godot-Router?

Godot-Router brings file-based routing to Godot, inspired by [SvelteKit](https://svelte.dev/docs/kit/routing). It lets you organize your project by folder and file names, making navigation between scenes simple and your project structure easy to follow.

Below is an example folder structure for a Godot project using Godot-Router. You can expand the `(menu)` and `(game)` group folders to see the routes:

<Tree>
    <TreeFolder name="addons" noInteraction />
    <TreeFolder name="routes" open noInteraction>
        <TreeFolder name="(menu)">
            <TreeFolder name="(settings)">
                <TreeFolder name="audio">
                    <TreeFile name="+page.tscn"/>
                </TreeFolder>
                <TreeFolder name="gameplay">
                    <TreeFile name="+page.tscn"/>
                </TreeFolder>
                <TreeFile name="+layout.tscn"/>
            </TreeFolder>
            <TreeFile name="+layout.tscn"/>
            <TreeFile name="+page.tscn"/>
        </TreeFolder>
        <TreeFolder name="(game)">
            <TreeFolder name="level-1">
                <TreeFile name="+page.tscn"/>
            </TreeFolder>
            <TreeFolder name="level-2">
                <TreeFile name="+page.tscn"/>
            </TreeFolder>
            <TreeFolder name="level-3">
                <TreeFile name="+page.tscn"/>
            </TreeFolder>
            <TreeFile name="+layout.tscn"/>
        </TreeFolder>
        <TreeFile name="+layout.tscn"/>
    </TreeFolder>
    <TreeFile name="icon.svg"/>
</Tree>

You will notice two consistent file names in the above example: `+page.tscn` and `+layout.tscn`. In short, `+page.tscn` files are the actual scene _routes_, and `+layout.tscn` files are scenes that wrap all routes within its folder.

## Why Is This Useful?

Without Godot-Router, managing multiple related scenes (like audio, gameplay, and controls settings) often means creating one big scene and writing scripts to show or hide each part. This can get complicated and tightly coupled.

With Godot-Router, you simply create a folder and a `+page.tscn` for each setting. Each page is independent. A `+layout.tscn` in the folder can add shared UI, like a tab bar, and use `Router.goto()` to switch between pages. This keeps your project organized and your code simple.

## Ready to Dive In?

Head over to the [Quick Start](/docs/quick-start) section to start using Godot-Router quickly.

OR

Explore the rest of the documentation to see Godot-Router's options and capabilities.

