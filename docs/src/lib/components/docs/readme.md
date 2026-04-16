> This folder location (`src/lib/components/docs`) contains components specific for `/docs` routes.

The below explains what each folder holds:

- header: Holds `header.svelte` component that is used in the `src/routes/(docs)/[...slug=docs]/+layout.svelte`. This contains a top header with logo, search, and utilities. Utilities include a theme-switch button, github link, and a mobile navigation button. If tabs are present, it also displays the tab buttons.
- body: Holds the `body.svelte` component that is used in the `src/routes/(docs)/[...slug=docs]/+layout.svelte`. This contains everything below the header, such as the left navigation sidebar, right table of contents sidebar, and the center section for the actual markdown page content.
- footer: Holds the `footer.svelte` component that is used in the `body.svelte` component. This contains a footer section that displays the next and previous buttons at the bottom of the page.
- patterns: Holds the `grid-pattern` component that is used in the `src/routes/(docs)/[...slug=docs]/+page.svelte`. This simply provides a document page with a grid pattern at the top, behind the title and description. This is imported in the `+page.svelte` instead of the `+layout.svelte` so it does not show on error pages.