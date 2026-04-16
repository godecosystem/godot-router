# Markdown Library

This folder contains the global markdown/MDX configuration used across the app.

It covers:

- Which markdown extensions are supported
- The shared remark/rehype plugin pipeline
- The AST-to-Svelte renderer used by docs pages
- The default component mappings for markdown elements

## Configuration

- `configuration/markdown.config.ts`: Main markdown config (extensions + plugin pipeline).
- `configuration/define-config.ts`: Typed helper for markdown config.

## Components

- `components`: Default renderer map and UI wrappers for markdown nodes.
- `components/headings`: Heading renderers (`h1`-`h6`) with anchor links and TOC-friendly markup.
- `components/code`: Code renderers (`pre`, inline `code`, blockquote) and pretty-code styling support.
- `components/table`: Table element renderers (`table`, `thead`, `tbody`, `tr`, `th`, `td`).
- `components/text`: Text/list renderers (`p`, `ol`, `ul`).
- `components/links`: Link renderer for markdown anchors.
- `components/separators`: Separator renderers like `hr`.

## Renderer

- `renderer/blueprint-renderer.svelte`: Main recursive AST renderer component.
- `renderer/utils.ts`: Resolver and renderer-map utilities used by the renderer component.
- `renderer/index.ts`: Entry point that exports `blueprint-renderer.svelte` as default.

## Plugins

- `plugins`: Custom markdown transforms used by the global config.
- `plugins/remark`: Remark-stage transforms (for example `remark-file-reader` for `<FileReader />`).
- `plugins/rehype`: Rehype-stage transforms for code metadata, code groups, and MDX paragraph normalization.

## Rendering Flow (High Level)

1. Markdown/MDX is parsed with the global config in `configuration/markdown.config.ts`.
2. Remark plugins transform markdown-first concerns.
3. Rehype plugins normalize and enrich HTML/MDX AST nodes.
4. `renderer/blueprint-renderer.svelte` resolves AST nodes to components from `components/index.ts`.

This setup keeps markdown behavior centralized so docs routes share one consistent rendering and plugin pipeline.
