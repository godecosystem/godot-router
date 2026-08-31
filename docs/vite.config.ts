import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { iconManifest } from './plugins/vite-icon-manifest.ts';
import { mdxComponentManifest } from './plugins/vite-mdx-component-manifest.ts';
import { docSearchJson } from './plugins/vite-search-json.ts';
import { protectServerAssets } from './plugins/vite-server-only.ts';

export default defineConfig({
	plugins: [
		iconManifest({
			files: ['src/lib/docs/server/navigation/doc-navigation.config.ts'],
			iconPackage: '@lucide/svelte/icons'
		}),
		mdxComponentManifest(),
		docSearchJson({ markdownFolderPath: 'content' }),
		tailwindcss(),
		sveltekit(),
		protectServerAssets({ folders: ['src/lib/docs/server'], files: [] })
	]
});
