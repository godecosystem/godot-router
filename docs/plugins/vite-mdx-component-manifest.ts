import fs from 'node:fs';
import path from 'node:path';
import type { PluginOption } from 'vite';
import { toPosixPath } from './processed-docs/utils.js';

const VIRTUAL_MDX_COMPONENT_MANIFEST_ID = 'virtual:mdx-component-manifest';
const RESOLVED_VIRTUAL_MDX_COMPONENT_MANIFEST_ID = '\0virtual:mdx-component-manifest';

function collectContentFiles(root: string): string[] {
	if (!fs.existsSync(root)) return [];

	const files: string[] = [];
	const stack: string[] = [root];

	while (stack.length > 0) {
		const current = stack.pop();
		if (!current) continue;

		for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
			const fullPath = path.join(current, entry.name);

			if (entry.isDirectory()) {
				stack.push(fullPath);
				continue;
			}

			if (/\.(md|mdx)$/i.test(entry.name)) {
				files.push(fullPath);
			}
		}
	}

	return files;
}

function extractImportSources(markdownSource: string): string[] {
	const sources = new Set<string>();
	const strippedSource = markdownSource
		.replaceAll(/```[\s\S]*?```/g, '')
		.replaceAll(/`[^`]*`/g, '')
		.replaceAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
	const importMatches = strippedSource.matchAll(
		/^\s*import\s+(?:type\s+)?(?:[\w*${}\s,]+)\s+from\s+['"]([^'"\n\r]+)['"]/gm
	);

	for (const match of importMatches) {
		const source = match[1]?.trim();
		if (source) {
			sources.add(source);
		}
	}

	return [...sources];
}

function generateModuleSource(contentRootPath: string): string {
	const contentFiles = collectContentFiles(contentRootPath);
	const sources = new Set<string>();

	for (const filePath of contentFiles) {
		const source = fs.readFileSync(filePath, 'utf-8');
		for (const importSource of extractImportSources(source)) {
			sources.add(importSource);
		}
	}

	const sortedSources = [...sources].sort((a, b) => a.localeCompare(b));
	if (sortedSources.length === 0) {
		return 'const manifest = {};\nexport default manifest;';
	}

	const lines: string[] = [];
	lines.push('const manifest = {};');

	for (const [index, importSource] of sortedSources.entries()) {
		const importName = `mdxModule_${index}`;
		lines.push(
			`import * as ${importName} from ${JSON.stringify(importSource)};`,
			`manifest[${JSON.stringify(importSource)}] = ${importName};`
		);
	}

	lines.push('export default manifest;');
	return lines.join('\n');
}

export function mdxComponentManifest(options?: { contentPath?: string }): PluginOption {
	const contentPath = options?.contentPath ?? 'content';
	const absoluteContentPath = toPosixPath(path.resolve(process.cwd(), contentPath));

	return {
		name: 'vite-plugin-mdx-component-manifest',
		resolveId(id) {
			if (id === VIRTUAL_MDX_COMPONENT_MANIFEST_ID) {
				return RESOLVED_VIRTUAL_MDX_COMPONENT_MANIFEST_ID;
			}

			return null;
		},
		load(id) {
			if (id !== RESOLVED_VIRTUAL_MDX_COMPONENT_MANIFEST_ID) {
				return null;
			}

			return generateModuleSource(absoluteContentPath);
		},
		handleHotUpdate(ctx) {
			const absoluteFilePath = toPosixPath(path.resolve(ctx.file));
			const isContentFile =
				absoluteFilePath.startsWith(absoluteContentPath + '/') &&
				/\.(md|mdx)$/i.test(absoluteFilePath);

			if (!isContentFile) {
				return;
			}

			const virtualModule = ctx.server.moduleGraph.getModuleById(
				RESOLVED_VIRTUAL_MDX_COMPONENT_MANIFEST_ID
			);

			if (virtualModule) {
				ctx.server.moduleGraph.invalidateModule(virtualModule);
			}
		}
	};
}
