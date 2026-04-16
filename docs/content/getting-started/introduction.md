---
title: What is Godot-Router?
description: Godot-Router is a free addon for Godot that helps organize files and manage navigation between scenes.
---

import { Tree, TreeFolder, TreeFile } from '$ui/tree';

## Overview

Godot-Router is the Godot version of web development file based routing systems, drawing heavy inspiration from [SvelteKit](https://svelte.dev/docs/kit/routing). This allows for an organized file system and simple navigation between scenes or _routes_. 

Below is an example folder structure of a godot project tailored to Godot-Router. You can expand the `(menu)` and `(game)` group folders to see the _routes_.

<Tree>
    <TreeFolder name="addons" noInteraction />
    <TreeFolder name="routes" open>
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

Lets say I wanted to have multiple different setting pages: _audio_, _gameplay_, _controls_. It would be typical to create scenes for each, and then have one _settings_ scene that includes the three scenes. Then, I would have to create a script that toggles the visibility of each setting scene.

This isn't entirely difficult to do... but it can be time consuming and results in coupling.

---

With Godot-Router, you can define a folder and a `+page.tscn` for each scene like in the file example above. These pages would be completely independent, just define what nodes go on that page. 

Then, the `(settings)` folder can have a `+layout.tscn` that wraps all those setting pages, like with a tab bar. This tab bar would simply contain buttons that call a `Router.goto()` function, like `Router.goto("/gameplay")` to go to the _gameplay_ settings.

Continue reading the documentation to gain a better understand of how pages, layouts, and routing works more in depth.