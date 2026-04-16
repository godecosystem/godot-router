# Sidebar Component

A multi-part sidebar/navigation component system with menu groups, items, and collapsible sections.

## Files

- `sidebar.svelte`: Main sidebar container component
- `sidebar-container.svelte`: Content wrapper for the sidebar
- `sidebar-header.svelte`: Header section of the sidebar (typically contains logo / branding)
- `sidebar-footer.svelte`: Footer section of the sidebar (typically contains user info or actions)
- `sidebar-content.svelte`: Main scrollable content area of the sidebar
- `sidebar-menu.svelte`: Container for menu items and groups
- `sidebar-menu-item.svelte`: Individual menu item / link in the sidebar
- `sidebar-menu-button.svelte`: Button element (e.g., toggle or action) within the menu
- `sidebar-group.svelte`: Grouping container for related menu items
- `sidebar-group-label.svelte`: Label / header for a menu group
- `sidebar-group-collapsible-context.ts`: Manages collapsible state for sidebar groups in `sidebar-group.svelte`
- `index.ts`: Barrel export for easy importing all sidebar components
