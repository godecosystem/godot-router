# Table of Contents Component

A component system for rendering a table of contents, typically displaying document headings with optional scroll progress indicator.

## Files

- `toc-provider.svelte`: Provider component that sets up context and state for the table of contents
- `toc-nav.svelte`: Main navigation container for the list of headings
- `toc-list.svelte`: List container for individual headings
- `toc-label.svelte`: Individual heading / link item in the table of contents
- `toc-radial-progress.svelte`: Visual progress indicator (radial) showing reading position
- `toc-context.svelte.ts`: Manages heading index, scroll position tracking, and intersection observer state shared across `toc-provider.svelte`, `toc-nav.svelte`, and `toc-label.svelte`
- `index.ts`: Barrel export for easy importing all table-of-contents components
