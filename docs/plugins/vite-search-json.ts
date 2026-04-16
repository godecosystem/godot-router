import fs from 'node:fs';
import path from 'node:path';
import type { PluginOption } from 'vite';
import { getMarkdownData } from './processed-docs/markdown-to-ast.js';
import { DocEntries } from './processed-docs/collect-doc-entries.js';
import { toPosixPath, MARKDOWN_EXTENSIONS } from './processed-docs/utils.js';
import type {
	BuiltDocRecord,
	DocsManifestData,
	ManifestNavigationPage
} from '$lib/docs/server/types';

const VIRTUAL_SEARCH_JSON_ID = 'virtual:doc-search-json';
const RESOLVED_VIRTUAL_SEARCH_JSON_ID = '\0virtual:doc-search-json';

type DocSearchJsonOptions = {
	markdownFolderPath: string;
};

export function isMarkdownModulePath(filePath: string): boolean {
	return MARKDOWN_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function getMarkdownRecord(rootPath: string): Record<string, string> {
	const map = new Map<string, string>();

	function addMarkdownFile(filePath: string) {
		if (!isMarkdownModulePath(filePath)) {
			return;
		}

		const fileContent = fs.readFileSync(filePath, 'utf-8');
		map.set(toPosixPath(filePath), fileContent);
	}

	function walk(filePath: string) {
		if (!fs.existsSync(filePath)) return;

		const stat = fs.statSync(filePath);
		if (stat.isFile()) {
			addMarkdownFile(filePath);
			return;
		}

		const entries = fs.readdirSync(filePath, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(filePath, entry.name);
			if (entry.isDirectory()) {
				walk(fullPath);
			} else {
				addMarkdownFile(fullPath);
			}
		}
	}

	walk(rootPath);

	return Object.fromEntries(map);
}

async function createPagesWithDocData(
	navigationPages: Map<string, ManifestNavigationPage>,
	rawMarkdownByPath: Record<string, string>
): Promise<Map<string, BuiltDocRecord>> {
	const pages = new Map<string, BuiltDocRecord>();

	for (const [href, page] of navigationPages.entries()) {
		const raw = rawMarkdownByPath[page.filepath];

		if (raw === undefined) continue;
		const markdown = await getMarkdownData(raw);

		pages.set(href, {
			...page,
			markdown
		});
	}

	return pages;
}

async function generateSearchData(markdownFolderPath: string): Promise<DocsManifestData> {
	markdownFolderPath = toPosixPath(markdownFolderPath);

	// get all markdown files in the configured markdown folder
	// this is a map of { filepath: fileContent }
	const rawMarkdownByPath = getMarkdownRecord(markdownFolderPath);

	// get doc entries from config and match with markdown files
	const docEntries = new DocEntries(rawMarkdownByPath, markdownFolderPath);

	const pages = await createPagesWithDocData(docEntries.pages, rawMarkdownByPath);

	const manifest: DocsManifestData = {
		tabs: docEntries.tabs,
		groups: docEntries.groups,
		pages
	};

	return manifest;
}

export function docSearchJson(options: DocSearchJsonOptions): PluginOption {
	let searchData: DocsManifestData | null = null;

	const absoluteMarkdownFolderPath = toPosixPath(
		path.resolve(process.cwd(), options.markdownFolderPath)
	);

	return {
		name: 'vite-plugin-doc-search-json',
		resolveId(id) {
			if (id === VIRTUAL_SEARCH_JSON_ID) {
				return RESOLVED_VIRTUAL_SEARCH_JSON_ID;
			}
		},
		async load(id) {
			if (id !== RESOLVED_VIRTUAL_SEARCH_JSON_ID) {
				return null;
			}

			searchData ??= await generateSearchData(absoluteMarkdownFolderPath);

			const tabs = JSON.stringify(Array.from(searchData.tabs.entries()));
			const groups = JSON.stringify(Array.from(searchData.groups.entries()));
			const pages = JSON.stringify(Array.from(searchData.pages.entries()));
			return `export default { tabs: new Map(${tabs}), groups: new Map(${groups}), pages: new Map(${pages}) };`;
		},
		handleHotUpdate(ctx) {
			const absoluteFilePath = toPosixPath(path.resolve(ctx.file));
			const isWithinConfiguredPath =
				absoluteFilePath === absoluteMarkdownFolderPath ||
				absoluteFilePath.startsWith(absoluteMarkdownFolderPath + '/');

			const isContentFile = isWithinConfiguredPath && isMarkdownModulePath(absoluteFilePath);

			if (!isContentFile) {
				return;
			}

			// Invalidate cached search data on content change
			searchData = null;

			const virtualModule = ctx.server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_SEARCH_JSON_ID);
			if (virtualModule) {
				ctx.server.moduleGraph.invalidateModule(virtualModule);
			}
		}
	};
}
