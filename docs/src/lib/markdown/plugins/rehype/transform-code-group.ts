/**
 * Rehype plugin that rewrites <CodeGroup> blocks into CodeGroup component primitives.
 *
 * Input:
 * <CodeGroup contextId="js-pkg-managers">
 *     ```bash title="bun"
 *     ...
 *     ```
 * </CodeGroup>
 *
 * Output:
 * <CodeGroup contextId="js-pkg-managers" value="bun">
 *     <CodeGroupList>
 * 	       <CodeGroupTrigger value="bun">bun</CodeGroupTrigger>
 *     </CodeGroupList>
 *     <CodeGroupContent value="bun">
 *         ```bash
 *         ...
 *         ```
 *     </CodeGroupContent>
 * </CodeGroup>
 */

import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

type MdxAttribute = {
	type: 'mdxJsxAttribute';
	name: string;
	value?: unknown;
};

type MdxJsxFlowElement = {
	type: 'mdxJsxFlowElement';
	name?: string;
	attributes?: MdxAttribute[];
	children?: unknown[];
};

type TabBlock = {
	title: string;
	value: string;
	node: unknown;
};

/** True when a node is a text node containing only whitespace. */
function isWhitespaceTextNode(node: unknown): boolean {
	return (
		typeof node === 'object' &&
		node !== null &&
		(node as { type?: unknown }).type === 'text' &&
		typeof (node as { value?: unknown }).value === 'string' &&
		(node as { value: string }).value.trim() === ''
	);
}

/** True when a node is a rehype element node. */
function isElementNode(node: unknown): node is Element {
	return (
		typeof node === 'object' &&
		node !== null &&
		(node as { type?: unknown }).type === 'element' &&
		typeof (node as { tagName?: unknown }).tagName === 'string'
	);
}

/** True when a node is an mdx JSX flow element with the requested name. */
function isNamedMdxFlowElement(node: unknown, name: string): node is MdxJsxFlowElement {
	return (
		typeof node === 'object' &&
		node !== null &&
		(node as { type?: unknown }).type === 'mdxJsxFlowElement' &&
		(node as { name?: unknown }).name === name
	);
}

/** Extract `title="..."` from code metadata. */
function parseTitleFromMeta(meta: string): string | null {
	const match = /(?:^|\s)title=(?:"([^"]+)"|'([^']+)'|([^\s]+))/.exec(meta);
	const value = match?.[1] ?? match?.[2] ?? match?.[3] ?? '';
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
}

/** Remove `title=...` from metadata after it is consumed for tab labels. */
function removeTitleFromMeta(meta: string): string {
	return meta
		.replaceAll(/(?:^|\s)title=(?:"[^"]+"|'[^']+'|[^\s]+)/g, ' ')
		.replaceAll(/\s+/g, ' ')
		.trim();
}

/**
 * Removes the pretty-code title node and strips title metadata from nested code.
 */
function normalizeCodeBlockNode(node: unknown): void {
	if (!isElementNode(node)) return;

	const properties = node.properties ?? {};
	if ('data-rehype-pretty-code-title' in properties) {
		(node as unknown as { __remove__: boolean }).__remove__ = true;
		return;
	}

	if (node.tagName === 'code') {
		const meta = typeof properties['data-meta'] === 'string' ? properties['data-meta'] : '';
		if (meta) {
			const nextMeta = removeTitleFromMeta(meta);
			if (nextMeta) {
				properties['data-meta'] = nextMeta;
			} else {
				delete properties['data-meta'];
			}
			node.properties = properties;
		}
	}

	if (!Array.isArray(node.children)) return;

	for (const child of node.children) {
		normalizeCodeBlockNode(child);
	}

	node.children = node.children.filter((child) => {
		if (typeof child !== 'object' || child === null) return true;
		return !(child as { __remove__?: boolean }).__remove__;
	});
}

/** Find the first nested <code> node. */
function findCodeNode(node: unknown): Element | null {
	if (!isElementNode(node)) return null;
	if (node.tagName === 'code') return node;

	for (const child of node.children ?? []) {
		const found = findCodeNode(child);
		if (found) return found;
	}

	return null;
}

/** Build a typed mdx JSX attribute node. */
function mdxAttr(name: string, value: unknown): MdxAttribute {
	return {
		type: 'mdxJsxAttribute',
		name,
		value
	};
}

/** Build a mdx JSX flow node. */
function mdxFlow(name: string, attributes: MdxAttribute[] = [], children: unknown[] = []) {
	return {
		type: 'mdxJsxFlowElement' as const,
		name,
		attributes,
		children
	};
}

/**
 * Factory for the CodeGroup -> CodeGroup component transform plugin.
 */
export default function rehypeTransformCodeGroup() {
	return (root: Root) => {
		visit(root, (node: unknown) => {
			if (!isNamedMdxFlowElement(node, 'CodeGroup')) return;
			if (!Array.isArray(node.children)) return;

			const candidateChildren = node.children.filter((child) => !isWhitespaceTextNode(child));
			if (candidateChildren.length === 0) return;

			const usedValues = new Set<string>();
			const blocks: TabBlock[] = [];

			for (const candidate of candidateChildren) {
				const codeNode = findCodeNode(candidate);
				if (!codeNode) continue;

				const properties = codeNode.properties ?? {};
				const meta = typeof properties['data-meta'] === 'string' ? properties['data-meta'] : '';
				const parsedTitle = meta ? parseTitleFromMeta(meta) : null;
				const title = parsedTitle ?? `Tab ${blocks.length + 1}`;

				let value = title;
				let duplicateCounter = 2;
				while (usedValues.has(value)) {
					value = `${title}-${duplicateCounter}`;
					duplicateCounter += 1;
				}
				usedValues.add(value);

				normalizeCodeBlockNode(candidate);

				blocks.push({
					title,
					value,
					node: candidate
				});
			}

			if (blocks.length === 0) return;

			const codeGroupAttributes = Array.isArray(node.attributes) ? [...node.attributes] : [];
			const listNode = mdxFlow(
				'CodeGroupList',
				[],
				blocks.map((block) =>
					mdxFlow(
						'CodeGroupTrigger',
						[mdxAttr('value', block.value)],
						[
							{
								type: 'text',
								value: block.title
							}
						]
					)
				)
			);

			const contentNodes = blocks.map((block) =>
				mdxFlow('CodeGroupContent', [mdxAttr('value', block.value)], [block.node])
			);

			node.name = 'CodeGroup';
			node.attributes = codeGroupAttributes;
			node.children = [listNode, ...contentNodes];
		});
	};
}
