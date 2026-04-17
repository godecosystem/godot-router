---
description: Learn how layouts provide shared UI and logic, and how slots are used to insert pages or nested layouts in Godot-Router.
---

import { Tree, TreeFolder, TreeFile } from '$ui/tree';

## What is a Layout?

A **Layout** is a scene that wraps one or more pages within a folder. Layouts are used for shared UI and logic, such as headers, navigation bars, or backgrounds.

- Any folder under `routes` can have a `+layout.tscn` file.
- The layout scene will wrap all pages and subfolders within that folder.
- Layouts can be nested for more complex structures.
- Layouts can have a script (`+layout.gd`) like any other scene.

## Slots in Layouts

A **Slot** or more specifically a **RouterSlot** is a special node in a layout scene that acts as a placeholder for child pages or nested layouts. When navigation occurs, Godot-Router automatically "slots in" the appropriate page or layout at the slot's position in the scene tree.

### Using a Slot

Godot-Router includes a custom **RouterSlot** node to be inserted into your layouts. Only one **RouterSlot** should be present in a `+layout.tscn`.

```text
+Layout (Node)
├ Header (Control)
├ RouterSlot (Node) <-- Page or nested layout will be inserted here
└ Footer (Control)
```

This allows you to build layouts with shared UI (like headers / footers) while keeping the main content dynamic and routed.

## Nested Layouts

Layouts can be nested by placing `+layout.tscn` files in subfolders. Each layout wraps its child pages and layouts, allowing for modular UI.

<Tree open>
    <TreeFolder name="routes">
        <TreeFolder name="(menu)">
            <TreeFolder name="(settings)">
                <TreeFolder name="audio">
                    <TreeFile name="+page.tscn"/>
                </TreeFolder>
            </TreeFolder>
            <TreeFile name="+layout.tscn"/>
        </TreeFolder>
        <TreeFile name="+layout.tscn"/>
    </TreeFolder>
</Tree>

In the above example, the `/audio` route would inherit the `routes/+layout.tscn`, `routes/(menu)/+layout.tscn` and `routes/(menu)/(settings)/+layout.tscn`.