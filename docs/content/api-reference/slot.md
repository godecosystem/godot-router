---
title: Slot.gd
description: Learn about the Slot node, what it does, and why it's needed.
---

## What is a Slot?

A slot is a node placed in a `+layout.tscn` used as a placeholder for pages or nested layouts. This effectively tells where a page should go to preserve its location in the scene tree.

It uses a custom class to allow adding to the scene directly and offers a `@tool` script to provide possible error messages.

## File

Below is the entire code of the `Slot.gd` file.

<FileReader file="../godot/addons/godot-router/scripts/slot.gd" title="slot.gd" showLineNumbers />