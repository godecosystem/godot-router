/**
 * Rehype plugin that promotes code fence metadata into a stable HTML attribute.
 *
 * `rehype-pretty-code` keeps fence metadata on `code.data.meta`. This plugin
 * mirrors that value to `code.properties['data-meta']` so downstream transforms
 * and runtime renderers can read it uniformly.
 */

import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

export default function rehypePromoteCodeMeta() {
	return (root: Root) => {
		visit(root, 'element', (node: Element) => {
			if (node.tagName !== 'code') return;

			const meta = typeof node.data?.meta === 'string' ? node.data.meta.trim() : '';
			if (!meta) return;

			const properties = node.properties ?? {};
			properties['data-meta'] = meta;
			node.properties = properties;
		});
	};
}
