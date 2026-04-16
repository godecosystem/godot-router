/**
 * Rehype plugin that normalizes MDX paragraph wrappers.
 *
 * Some MDX constructs are wrapped in extra <p> elements after remark->rehype
 * conversion, which can create invalid or awkward markup for block-like
 * components. This plugin unwraps those safe cases while preserving content.
 */

import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

type MdxJsxNode = {
	type?: string;
	name?: string;
	children?: unknown[];
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

/** True when a node is an MDX JSX component (PascalCase name). */
function isMdxComponentNode(node: unknown): boolean {
	if (typeof node !== 'object' || node === null) return false;
	const mdxNode = node as MdxJsxNode;
	if (!String(mdxNode.type ?? '').startsWith('mdxJsx')) return false;
	const name = typeof mdxNode.name === 'string' ? mdxNode.name : '';
	return /^[A-Z]/.test(name);
}

/**
 * Detects paragraphs that only contain MDX components (plus whitespace),
 * which can be safely unwrapped.
 */
function shouldUnwrapParagraph(node: Element): boolean {
	if (node.tagName !== 'p' || !Array.isArray(node.children)) {
		return false;
	}

	let hasComponent = false;

	for (const child of node.children) {
		if (isWhitespaceTextNode(child)) continue;
		if (isMdxComponentNode(child)) {
			hasComponent = true;
			continue;
		}

		return false;
	}

	return hasComponent;
}

/** True when node looks like an MDX JSX node in the rehype tree. */
function isMdxJsxNode(node: unknown): node is MdxJsxNode {
	if (typeof node !== 'object' || node === null) return false;
	return String((node as MdxJsxNode).type ?? '').startsWith('mdxJsx');
}

export default function rehypeNormalizeMdxParagraphs() {
	return (root: Root) => {
		visit(root, 'element', (node: Element, index, parent) => {
			if (!shouldUnwrapParagraph(node)) return;
			if (typeof index !== 'number' || !parent || !Array.isArray(parent.children)) return;

			const unwrappedChildren = (node.children ?? []).filter(
				(child) => !isWhitespaceTextNode(child)
			);
			parent.children.splice(index, 1, ...unwrappedChildren);
			return index + unwrappedChildren.length;
		});

		visit(root, (node: unknown) => {
			if (!isMdxJsxNode(node) || !Array.isArray(node.children)) {
				return;
			}

			const meaningfulChildren = node.children.filter((child) => !isWhitespaceTextNode(child));
			if (meaningfulChildren.length !== 1) {
				return;
			}

			const onlyChild = meaningfulChildren[0] as Partial<Element> | undefined;
			if (
				onlyChild?.type !== 'element' ||
				onlyChild.tagName !== 'p' ||
				!Array.isArray(onlyChild.children)
			) {
				return;
			}

			node.children = onlyChild.children;
		});
	};
}
