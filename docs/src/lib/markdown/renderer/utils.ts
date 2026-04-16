import type { Component } from 'svelte';
import type { RootContent } from 'hast';
import astNodeRenderers from '../components';
import { isNodeResolver, type AstNodeRendererResult } from '../components';

const componentMap = {
	...astNodeRenderers
};

export const VOID_ELEMENTS = new Set([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'keygen',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr'
]);

export type ResolvedRenderer = {
	component: Component<any>;
	props: Record<string, unknown>;
	inheritNodeProps: boolean;
};

type EstreeNode = {
	type?: string;
	value?: unknown;
	name?: string;
	operator?: string;
	argument?: EstreeNode;
	expressions?: EstreeNode[];
	quasis?: Array<{ value?: { cooked?: string } }>;
	properties?: Array<{
		type?: string;
		key?: EstreeNode;
		value?: EstreeNode;
		computed?: boolean;
		kind?: string;
	}>;
	elements?: Array<EstreeNode | null>;
	body?: Array<{ type?: string; expression?: EstreeNode }>;
};

type MdxAttributeValueExpression = {
	type?: string;
	value?: string;
	data?: {
		estree?: EstreeNode;
	};
};

type MdxJsxAttribute = {
	name?: string;
	value?: unknown;
};

const UNRESOLVED_MDX_EXPRESSION = Symbol('UNRESOLVED_MDX_EXPRESSION');

type RendererOptions = {
	parentElement?: string;
	componentAliases?: Record<string, string[]>;
	resolvedComponents?: Record<string, unknown>;
};

function isRenderableComponent(value: unknown): value is Component<any> {
	return typeof value === 'function';
}

function getAliasCandidates(key: string, componentAliases: Record<string, string[]>): string[] {
	return Array.from(new Set([key, ...(componentAliases[key] ?? [])]));
}

function getResolvedComponentCandidate(
	key: string,
	resolvedComponents: Record<string, unknown>
): unknown {
	const direct = resolvedComponents[key];
	if (direct !== undefined) return direct;

	if (!key.includes('.')) return undefined;

	const [rootKey, ...pathParts] = key.split('.');
	if (!rootKey || pathParts.length === 0) return undefined;

	let current: unknown = resolvedComponents[rootKey];
	if (
		(typeof current !== 'object' || current === null) &&
		resolvedComponents[`$module:${rootKey}`]
	) {
		current = resolvedComponents[`$module:${rootKey}`];
	}

	for (const part of pathParts) {
		if (typeof current !== 'object' || current === null) return undefined;
		current = (current as Record<string, unknown>)[part];
	}

	return current;
}

function resolveObjectKey(node: EstreeNode | undefined): string | null {
	if (!node) return null;

	if (node.type === 'Identifier' && typeof node.name === 'string') {
		return node.name;
	}

	if (
		node.type === 'Literal' &&
		(typeof node.value === 'string' || typeof node.value === 'number')
	) {
		return String(node.value);
	}

	return null;
}

function resolveUnaryExpression(node: EstreeNode): unknown {
	const resolvedArgument = resolveEstreeExpression(node.argument);
	if (resolvedArgument === UNRESOLVED_MDX_EXPRESSION) {
		return UNRESOLVED_MDX_EXPRESSION;
	}

	if (node.operator === '-' && typeof resolvedArgument === 'number') {
		return -resolvedArgument;
	}

	if (node.operator === '+' && typeof resolvedArgument === 'number') {
		return resolvedArgument;
	}

	if (node.operator === '!') {
		return !resolvedArgument;
	}

	return UNRESOLVED_MDX_EXPRESSION;
}

function resolveTemplateLiteral(node: EstreeNode): unknown {
	if ((node.expressions?.length ?? 0) > 0) {
		return UNRESOLVED_MDX_EXPRESSION;
	}

	return (node.quasis ?? []).map((quasi) => quasi.value?.cooked ?? '').join('');
}

function resolveArrayExpression(node: EstreeNode): unknown {
	const values: unknown[] = [];

	for (const element of node.elements ?? []) {
		if (element === null) {
			values.push(undefined);
			continue;
		}

		const resolvedElement = resolveEstreeExpression(element);
		if (resolvedElement === UNRESOLVED_MDX_EXPRESSION) {
			return UNRESOLVED_MDX_EXPRESSION;
		}

		values.push(resolvedElement);
	}

	return values;
}

function resolveObjectExpression(node: EstreeNode): unknown {
	const result: Record<string, unknown> = {};

	for (const property of node.properties ?? []) {
		if (
			property?.type !== 'Property' ||
			property.computed ||
			property.kind === 'get' ||
			property.kind === 'set'
		) {
			return UNRESOLVED_MDX_EXPRESSION;
		}

		const key = resolveObjectKey(property.key);
		if (!key) return UNRESOLVED_MDX_EXPRESSION;

		const resolvedValue = resolveEstreeExpression(property.value);
		if (resolvedValue === UNRESOLVED_MDX_EXPRESSION) {
			return UNRESOLVED_MDX_EXPRESSION;
		}

		result[key] = resolvedValue;
	}

	return result;
}

function resolveEstreeExpression(node: EstreeNode | undefined): unknown {
	if (!node?.type) return UNRESOLVED_MDX_EXPRESSION;

	switch (node.type) {
		case 'Literal':
			return node.value;

		case 'Identifier':
			return node.name === 'undefined' ? undefined : UNRESOLVED_MDX_EXPRESSION;

		case 'UnaryExpression':
			return resolveUnaryExpression(node);

		case 'TemplateLiteral':
			return resolveTemplateLiteral(node);

		case 'ArrayExpression':
			return resolveArrayExpression(node);

		case 'ObjectExpression':
			return resolveObjectExpression(node);

		default:
			return UNRESOLVED_MDX_EXPRESSION;
	}
}

function resolveMdxAttributeValue(value: unknown): unknown {
	if (!value || typeof value !== 'object') return value;

	const expressionValue = value as MdxAttributeValueExpression;
	if (expressionValue.type !== 'mdxJsxAttributeValueExpression') {
		return value;
	}

	const expressionStatement = expressionValue.data?.estree?.body?.[0];
	const resolvedExpression = resolveEstreeExpression(expressionStatement?.expression);

	if (resolvedExpression !== UNRESOLVED_MDX_EXPRESSION) {
		return resolvedExpression;
	}

	return expressionValue.value;
}

export function getMdxProps(attrs: MdxJsxAttribute[] = []) {
	return attrs.reduce<Record<string, unknown>>(
		(acc: Record<string, unknown>, attr: MdxJsxAttribute) => {
			if (!attr?.name) return acc;
			acc[attr.name] = attr.value == null ? true : resolveMdxAttributeValue(attr.value);
			return acc;
		},
		{}
	);
}

function toResolvedRenderer(renderResult: unknown): ResolvedRenderer | null {
	if (!renderResult) return null;

	if (typeof renderResult === 'object' && 'component' in renderResult) {
		const component = (renderResult as { component?: unknown }).component;
		if (!isRenderableComponent(component)) return null;

		return {
			component,
			props: (renderResult as { props?: Record<string, unknown> }).props ?? {},
			inheritNodeProps: (renderResult as { inheritNodeProps?: boolean }).inheritNodeProps ?? true
		};
	}

	if (!isRenderableComponent(renderResult)) return null;

	return {
		component: renderResult,
		props: {},
		inheritNodeProps: true
	};
}

export function getMappedRenderer(
	node: RootContent,
	key: string,
	{ parentElement, componentAliases = {}, resolvedComponents = {} }: RendererOptions
): ResolvedRenderer | null {
	for (const candidate of getAliasCandidates(key, componentAliases)) {
		const resolvedCandidate = getResolvedComponentCandidate(candidate, resolvedComponents);
		const resolvedRenderer = toResolvedRenderer(resolvedCandidate);
		if (resolvedRenderer) {
			return resolvedRenderer;
		}

		const mapped = componentMap[candidate as keyof typeof componentMap];
		if (!mapped) continue;

		if (isNodeResolver(mapped)) {
			return toResolvedRenderer(mapped({ node, parentElement }));
		}

		return toResolvedRenderer(mapped as AstNodeRendererResult);
	}

	return null;
}
