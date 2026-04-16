import type { Component } from 'svelte';
import type { RootContent } from 'hast';
import H1 from './headings/h1.svelte';
import H2 from './headings/h2.svelte';
import H3 from './headings/h3.svelte';
import H4 from './headings/h4.svelte';
import H5 from './headings/h5.svelte';
import H6 from './headings/h6.svelte';
import Pre from './code/pre.svelte';
import InlineCode from './code/inline-code.svelte';
import A from './links/a.svelte';
import Table from './table/table.svelte';
import Thead from './table/thead.svelte';
import Tbody from './table/tbody.svelte';
import Tr from './table/tr.svelte';
import Th from './table/th.svelte';
import Td from './table/td.svelte';
import Hr from './separators/hr.svelte';
import P from './text/p.svelte';
import Blockquote from './code/blockquote.svelte';
import Ol from './lists/ol.svelte';
import Ul from './lists/ul.svelte';
import Li from './lists/li.svelte';
import { CodeGroup, CodeGroupContent, CodeGroupList, CodeGroupTrigger } from '$ui/code-group';

export type MarkdownNodeComponent = Component<any>;

export type AstNodeContext = {
	node: RootContent;
	parentElement?: string;
};

export type AstNodeRendererResult =
	| MarkdownNodeComponent
	| {
			component: MarkdownNodeComponent;
			props?: Record<string, unknown>;
			inheritNodeProps?: boolean;
	  }
	| null
	| undefined;

const AST_NODE_RESOLVER = Symbol('AST_NODE_RESOLVER');

export type AstNodeResolver = ((context: AstNodeContext) => AstNodeRendererResult) & {
	[AST_NODE_RESOLVER]: true;
};

export type AstNodeRenderer =
	| MarkdownNodeComponent
	| AstNodeResolver
	| ((context: AstNodeContext) => AstNodeRendererResult);
export type AstNodeRendererMap = Record<string, AstNodeRenderer>;

export function defineNodeResolver(
	resolver: (context: AstNodeContext) => AstNodeRendererResult
): AstNodeResolver {
	return Object.assign(resolver, { [AST_NODE_RESOLVER]: true as const });
}

export function isNodeResolver(
	value: AstNodeRenderer | null | undefined
): value is AstNodeResolver {
	return Boolean(value && AST_NODE_RESOLVER in value);
}

// Helper to provide proper typing for resolver functions
const resolver = (fn: (context: AstNodeContext) => AstNodeRendererResult): AstNodeResolver => {
	return Object.assign(fn, { [AST_NODE_RESOLVER]: true as const });
};

export const astNodeRenderers = {
	h1: H1,
	h2: H2,
	h3: H3,
	h4: H4,
	h5: H5,
	h6: H6,
	pre: Pre,
	code: resolver((context) => {
		if (context.parentElement === 'pre') return null;
		return { component: InlineCode, inheritNodeProps: true };
	}),
	a: A,
	table: Table,
	thead: Thead,
	tbody: Tbody,
	tr: Tr,
	th: Th,
	td: Td,
	hr: Hr,
	p: P,
	blockquote: Blockquote,
	ol: Ol,
	ul: Ul,
	li: Li,
	CodeGroup,
	CodeGroupList,
	CodeGroupTrigger,
	CodeGroupContent
} satisfies AstNodeRendererMap;

export default astNodeRenderers;
