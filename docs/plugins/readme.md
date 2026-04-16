# Plugins

This folder contains the custom Vite plugins that power SvelDocs-specific behavior.

These plugins are registered in [vite.config.ts](../vite.config.ts) and are responsible for generating virtual modules, scanning content, and transforming documentation data into structures the app can consume at runtime.

## Plugin Overview

### `vite-icon-manifest.ts`

Builds a virtual icon manifest from one or more source files that contain `icon: '...'` entries.

What it does:

- Scans the configured `files: string[]`
- Extracts icon names from `icon` properties
- Validates those names against the configured `iconPackage`
- Generates the `virtual:icon-manifest` module
- Invalidates the virtual module when any watched source file changes

Why it exists:

- Keeps navigation and content configs as the single source of truth for icon names
- Avoids manually importing every icon component
- Makes the icon library configurable at the Vite plugin level

This plugin is also required to allow server-defined icons to be used on the client. For example, Doc Navigation stores icons as string values because server-side configuration cannot pass component instances to the client. The manifest acts as the bridge that maps those icon strings to actual client-renderable icon components.

### `vite-mdx-component-manifest.ts`

Builds a virtual manifest of component imports referenced by markdown or MDX content.

What it does:

- Walks the configured content directory
- Reads `.md` and `.mdx` files
- Extracts import sources used in content files
- Generates the `virtual:mdx-component-manifest` module
- Invalidates the manifest when content files change

Why it exists:

- Gives the docs renderer a centralized lookup for imported markdown components
- Prevents repeated manual wiring between content imports and runtime rendering

### `vite-search-json.ts`

Builds the documentation search/navigation data used by the app.

What it does:

- Reads markdown content under `content`
- Collects doc entries and navigation metadata
- Converts markdown into parsed document records
- Derives search metadata such as title, description, keywords, and icon
- Generates the `virtual:doc-search-json` module
- Clears cached search data on content updates

Why it exists:

- Keeps search and navigation derived from the actual documentation files
- Centralizes doc metadata processing in one place
- Lets routes consume prebuilt structured docs data instead of rebuilding it in app code

## `processed-docs`

The `processed-docs` folder contains lower-level helpers used by the higher-level Vite plugins.

Current helpers:

- `collect-doc-entries.ts`: collects doc pages and navigation entries from content paths
- `markdown-to-ast.ts`: parses markdown into a structured representation
- `types.ts`: shared types for generated docs data

This subfolder is where the heavier document-processing logic lives. The top-level Vite plugins mostly orchestrate file watching, virtual modules, and integration with Vite.

## Virtual Modules

These plugins currently provide the following virtual modules:

- `virtual:icon-manifest`
- `virtual:mdx-component-manifest`
- `virtual:doc-search-json`

Those virtual modules are imported elsewhere in the app as if they were normal modules, but their contents are generated dynamically by the Vite plugins in this folder.