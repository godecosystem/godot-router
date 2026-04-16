import matter from 'gray-matter';
import type { Root as HastRoot, Element as HastElement, Text as HastText } from 'hast';
import type { Root as MdastRoot } from 'mdast';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkStringify from 'remark-stringify';
import remarkRehype, { type Options as RemarkRehypeOptions } from 'remark-rehype';
import markdownConfig from '../../src/lib/markdown/configuration/markdown.config';
import type {
	MarkdownAstResult,
	MarkdownMetadata,
	TableOfContentsHeading
} from '../../src/lib/docs/server/types';
import { extractImportDataFromRaw, stripImportLines } from './mdx-import-utils.js';
import { visit } from 'unist-util-visit';

const MDX_PASS_THROUGH = ['mdxJsxFlowElement', 'mdxJsxTextElement'] as const;

function getRemarkRehypeOptions(plugins: unknown[] | undefined): RemarkRehypeOptions {
	for (const plugin of plugins ?? []) {
		if (Array.isArray(plugin) && plugin[0] === remarkRehype) {
			return (plugin[1] as RemarkRehypeOptions) ?? {};
		}

		if (plugin === remarkRehype) {
			return {};
		}
	}

	return {};
}

function extractTextFromAstNode(node: HastRoot | HastElement): string {
	if (!node) return '';

	const buffer: string[] = [];

	visit(node, 'text', (textNode: HastText) => {
		const value = typeof textNode.value === 'string' ? textNode.value.trim() : '';

		if (value) {
			buffer.push(value);
		}
	});

	return buffer.join(' ').replaceAll(/\s+/g, ' ').trim();
}

function extractTextFromAst(ast: HastRoot): string {
	return extractTextFromAstNode(ast);
}

function extractTocHeadingsFromAst(tree: HastRoot): TableOfContentsHeading[] {
	const headingNodes: Map<string, TableOfContentsHeading> = new Map();

	visit(tree, (node) => {
		const isHeading = node.type === 'element' && /^h[1-6]$/.test(node.tagName);
		if (isHeading) {
			const id = typeof node.properties?.id === 'string' ? node.properties.id : '';
			const tocIgnore = node.properties?.['data-toc-ignore'];
			const text = extractTextFromAstNode(node);

			if (!id || tocIgnore === 'true' || !text) {
				return;
			}

			if (headingNodes.has(id)) {
				return;
			}

			headingNodes.set(id, {
				id,
				text,
				tagLevel: Number(node.tagName.slice(1))
			});

			return;
		}

		const isMdxJsx = node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';
		if (isMdxJsx) {
			// may want to support extracting headings from MDX components in the future, but for now we will ignore them since it's not clear how to handle them in a consistent way.
			return;
		}
	});

	return Array.from(headingNodes.values());
}

export async function getMarkdownData(rawMarkdown: string): Promise<MarkdownAstResult> {
	const { data, content: rawContent } = matter(rawMarkdown);
	const metadata = data as MarkdownMetadata;
	const contentWithoutImports = stripImportLines(rawContent);

	const remarkPlugins = markdownConfig.remarkPlugins ?? [];
	const rehypePlugins = markdownConfig.rehypePlugins ?? [];

	const remarkPluginsWithoutBridge = remarkPlugins.filter((plugin) => {
		if (Array.isArray(plugin)) return plugin[0] !== remarkRehype;
		return plugin !== remarkRehype;
	});

	// setup remark processor
	const remarkProcessor = unified()
		.use([remarkParse, remarkMdx, ...remarkPluginsWithoutBridge])
		.freeze();

	const configuredBridgeOptions = getRemarkRehypeOptions(remarkPlugins);
	const passThrough: NonNullable<RemarkRehypeOptions['passThrough']> = Array.from(
		new Set([...(configuredBridgeOptions.passThrough ?? []), ...MDX_PASS_THROUGH])
	);
	const rehypeOptions: RemarkRehypeOptions = {
		...configuredBridgeOptions,
		passThrough
	};

	// Use remark-rehype in mutate mode so the run() result is HAST.
	const fullProcessor = remarkProcessor()
		.use(remarkRehype, rehypeOptions)
		.use(rehypePlugins)
		.freeze();

	// get transformed raw content (markdown content with remark plugins applied) first
	const transformedRawContent = String(
		await remarkProcessor().use(remarkStringify).process(contentWithoutImports)
	);

	const mdast = fullProcessor.parse(contentWithoutImports) as MdastRoot;
	const mdxImportData = extractImportDataFromRaw(rawContent);
	const hast = await fullProcessor.run(mdast);

	const content = {
		raw: transformedRawContent,
		search: extractTextFromAst(hast)
	};

	return {
		metadata,
		content,
		tableOfContents: extractTocHeadingsFromAst(hast),
		imports: mdxImportData.imports,
		ast: hast
	};
}
