/**
 * Rehype plugin that converts a classname property to class for proper injection into svelte components.
 */

import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

export default function rehypePromoteCodeMeta() {
	return (root: Root) => {
		visit(root, 'element', (node: Element) => {
			const properties = node.properties ?? {};
			const className = properties.className;
			if (className != null && properties.class == null) {
				properties.class = Array.isArray(className)
					? className.filter((value): value is string => typeof value === 'string').join(' ')
					: String(className);
				delete properties.className;
				node.properties = properties;
			}
		});
	};
}
