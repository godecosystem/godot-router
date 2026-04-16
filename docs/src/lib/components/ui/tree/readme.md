# Tree Component

A hierarchical tree structure component system for displaying nested file-like or menu-like structures.

## Files

- `tree.svelte`: Main tree container component that sets up the tree context
- `tree-folder.svelte`: Collapsible folder / parent node in the tree hierarchy
- `tree-file.svelte`: Leaf node / file item in the tree (non-expandable)
- `tree-context.svelte.ts`: Manages `TreeLevelContext` (hierarchy depth) and `TreeOpenContext` (open / closed state) shared across `tree-folder.svelte` and `tree-file.svelte`
- `index.ts`: Barrel export for easy importing all tree components
