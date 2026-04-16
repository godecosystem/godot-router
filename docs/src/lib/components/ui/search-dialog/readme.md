# Search Dialog Component

A complex multi-part search dialog component system with various trigger types and content sections.

## Files

- `search-dialog-provider.svelte`: Provider component that manages search dialog state and context
- `search-dialog-content.svelte`: Main content container for the search dialog
- `search-dialog-section.svelte`: Grouping container for search results sections
- `search-dialog-link.svelte`: Individual result item / link in the search results
- `search-dialog-trigger-desktop.svelte`: Desktop-specific trigger button for opening search
- `search-dialog-trigger-mobile.svelte`: Mobile-specific trigger button for opening search
- `search-context.svelte.ts`: Manages search dialog open / close state and flexsearch document index shared across `search-dialog-provider.svelte`, trigger, and content components
- `index.ts`: Barrel export for easy importing all search-dialog components
