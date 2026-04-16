/**
 * Rehype plugin that trims formatter-introduced whitespace from highlighted
 * code lines produced by `rehype-pretty-code`.
 *
 * Specifically, this removes formatting artifacts around token spans inside
 * `span[data-line]` nodes and trims trailing whitespace on the final token.
 */

import type { Element, ElementContent, Root, Text } from 'hast';
import { visit } from 'unist-util-visit';

function isTextNode(node: unknown): node is Text {
	return typeof node === 'object' && node !== null && (node as { type?: unknown }).type === 'text';
}

function isElementNode(node: unknown): node is Element {
	return (
		typeof node === 'object' &&
		node !== null &&
		(node as { type?: unknown }).type === 'element' &&
		typeof (node as { tagName?: unknown }).tagName === 'string'
	);
}

function containsLineBreak(value: string): boolean {
	return /[\r\n]/.test(value);
}

function isFormattingWhitespace(value: string): boolean {
	return /^[\t \r\n]+$/.test(value) && /[\r\n]/.test(value);
}

function trimEdgeTextNodes(
	children: ElementContent[],
	shouldTrim: (value: string) => boolean
): ElementContent[] {
	let start = 0;
	let end = children.length;

	while (start < end) {
		const child = children[start];
		if (!isTextNode(child) || !shouldTrim(child.value)) break;
		start += 1;
	}

	while (end > start) {
		const child = children[end - 1];
		if (!isTextNode(child) || !shouldTrim(child.value)) break;
		end -= 1;
	}

	if (start === 0 && end === children.length) return children;
	return children.slice(start, end);
}

function findBoundaryTextNode(node: ElementContent, fromEnd = false): Text | null {
	if (isTextNode(node)) return node;
	if (!isElementNode(node)) return null;

	const iterable = fromEnd ? [...node.children].reverse() : node.children;
	for (const child of iterable) {
		const found = findBoundaryTextNode(child, fromEnd);
		if (found) return found;
	}

	return null;
}

function trimBoundaryTokenText(children: ElementContent[]): void {
	const first = children[0];
	if (first) {
		const text = findBoundaryTextNode(first);
		if (text) {
			const leading = /^[\t \r\n]+/.exec(text.value)?.[0] ?? '';
			if (leading && containsLineBreak(leading)) {
				text.value = text.value.slice(leading.length);
			}
		}
	}

	const last = children.at(-1);
	if (last) {
		const text = findBoundaryTextNode(last, true);
		if (text) {
			text.value = text.value.replace(/[\t \r\n]+$/, '');
		}
	}
}

function hasNonWhitespaceContent(node: ElementContent): boolean {
	if (isTextNode(node)) {
		return node.value.trim() !== '';
	}

	if (!isElementNode(node)) return false;
	return node.children.some((child) => hasNonWhitespaceContent(child));
}

export default function rehypeTrimCodeLineWhitespace() {
	return (root: Root) => {
		visit(root, 'element', (node: Element) => {
			if (node.tagName !== 'span') return;

			const properties = node.properties ?? {};
			if (!Object.hasOwn(properties, 'data-line')) return;
			if (!Array.isArray(node.children) || node.children.length === 0) return;
			if (!node.children.some((child) => hasNonWhitespaceContent(child))) return;

			const trimmedChildren = trimEdgeTextNodes(node.children, isFormattingWhitespace);
			if (trimmedChildren.length === 0) {
				node.children = trimmedChildren;
				return;
			}

			trimBoundaryTokenText(trimmedChildren);
			node.children = trimEdgeTextNodes(trimmedChildren, (value) => value === '');
		});
	};
}
