# 📄 SvelDocs

SvelDocs is a free boilerplate project for creating documentation websites with Svelte 5 and Tailwind CSS 4.

> [!TIP]
> This boilerplate is the actual website itself. You can see the live result and documentation here: https://brandenn.github.io/SvelDocs/docs

SvelDocs is built for a quick and easy setup, but still leaves plenty of room for deep customization when you want to shape the experience to your own style and workflow.

> [!NOTE]
> This project assumes knowledge of web development and web frameworks. Familiarity with [Svelte](https://svelte.dev/) is a plus.

## ✨ Features

- Supports both Static Site Generation (SSG) and Server Side Rendering (SSR)
- Simple structure for adding tabs, groups, and pages
- Table of contents
- Built-in search
- Remark / Rehype plugin support
- Automatically generated `.md` and `llms.txt` routes for AI usage
- Syntax highlighted code blocks
- SEO support with generated `sitemap.xml`
- Accessibility and keyboard tab navigation
- Light and dark mode

## 🚀 Quick Start

Get up and running in three steps:

### 1) Clone the repository

```bash
git clone https://github.com/BranDenn/SvelDocs
cd SvelDocs
```

### 2) Install dependencies

Pick your package manager:

```bash
bun install
```

### 3) Start the development server

Run the dev server with your preferred package manager:

```bash
bun run dev
```

## ⚙️ Project Configuration

After the app is running, the main starting points are:

- `src/lib/configuration/site.config.ts` for global site settings
- `src/lib/configuration/docs.config.ts` for docs-specific settings
- `src/lib/server/navigation/doc-navigation.config.ts` for doc navigation tabs, groups, and pages

Add your own markdown content in the `content` folder. As a best practice, keep your folder structure aligned with your navigation structure.

## 📦 Build

Create a production build:

```bash
bun run build
```

Preview the production build locally:

```bash
bun run preview
```

## 🌐 Deployment

SvelDocs is built on SvelteKit. For deployment, install and configure the adapter that matches your target platform:

- https://svelte.dev/docs/kit/adapters
