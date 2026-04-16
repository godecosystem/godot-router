/**
 * Rehype plugin that promotes `data-language` to a plain `language` prop and
 * stamps a plain `hasCode` boolean onto `<pre>` elements. This lets the runtime
 * component receive both values as direct props (no data-attribute gymnastics)
 * while still having them available at SSR time to prevent flashes of content.
 */

import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

export default function rehypeMarkPreHasCode() {
	return (root: Root) => {
		visit(root, 'element', (node: Element) => {
			if (node.tagName !== 'pre') return;

			node.properties = node.properties ?? {};

			// Promote data-language → plain language prop and remove the original
			// so it doesn't leak into ...restProps. The template re-adds it explicitly.
			const lang = node.properties['data-language'];
			if (lang !== undefined) {
				node.properties['language'] = lang;
				delete node.properties['data-language'];
			}

			const code = node.children.find(
				(child): child is Element => child.type === 'element' && child.tagName === 'code'
			);

			node.properties['hasCode'] = code && code.children.length > 0;

			// Hoist data-line-numbers-max-digits from the code child to a plain
			// numeric prop on <pre> so the component can set --w via style: directive.
			const rawDigits = code?.properties?.['data-line-numbers-max-digits'];
			const maxDigits = rawDigits === undefined ? Number.NaN : Number(rawDigits);
			if (Number.isFinite(maxDigits) && maxDigits > 0) {
				node.properties['lineNumbersMaxDigits'] = maxDigits;
			}
		});
	};
}
