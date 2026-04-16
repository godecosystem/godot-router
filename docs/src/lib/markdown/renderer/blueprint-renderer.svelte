<script lang="ts">
	import BlueprintRenderer from './blueprint-renderer.svelte';
	import type { RootContent } from 'hast';
	import { VOID_ELEMENTS, getMappedRenderer, getMdxProps } from './utils';

	let {
		node,
		parentElement,
		componentAliases = {},
		resolvedComponents = {}
	}: {
		node: RootContent;
		parentElement?: string;
		componentAliases?: Record<string, string[]>;
		resolvedComponents?: Record<string, unknown>;
	} = $props();
</script>

{#if node.type === 'text'}
	{node.value}
{:else if node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement'}
	{@const mappedMdxRenderer = node.name
		? getMappedRenderer(node, node.name, {
				parentElement,
				componentAliases,
				resolvedComponents
			})
		: null}
	{#if mappedMdxRenderer}
		{@const MdxComponent = mappedMdxRenderer.component}
		{@const mdxName = node.name ?? undefined}
		{@const mdxProps = mappedMdxRenderer.inheritNodeProps ? getMdxProps(node.attributes) : {}}
		<MdxComponent {...mdxProps} {...mappedMdxRenderer.props}>
			{#each node.children ?? [] as child, i (`${node.name ?? 'mdx'}-${i}`)}
				<BlueprintRenderer
					node={child}
					parentElement={mdxName}
					{componentAliases}
					{resolvedComponents}
				/>
			{/each}
		</MdxComponent>
	{:else if node.name}
		<svelte:element this={node.name} {...getMdxProps(node.attributes)}>
			{#each node.children ?? [] as child, i (`${node.name}-${i}`)}
				<BlueprintRenderer
					node={child}
					parentElement={node.name ?? undefined}
					{componentAliases}
					{resolvedComponents}
				/>
			{/each}
		</svelte:element>
	{/if}
{:else if node.type === 'element'}
	{@const elementName = node.tagName ?? 'div'}
	{@const mappedElementRenderer = getMappedRenderer(node, elementName, {
		parentElement,
		componentAliases,
		resolvedComponents
	})}
	{@const isVoidElement = VOID_ELEMENTS.has(elementName)}
	{#if mappedElementRenderer}
		{@const ElementComponent = mappedElementRenderer.component}
		{@const elementProps = mappedElementRenderer.inheritNodeProps ? (node.properties ?? {}) : {}}
		<ElementComponent {...elementProps} {...mappedElementRenderer.props}>
			{#each node.children ?? [] as child, i (`${elementName}-${i}`)}
				<BlueprintRenderer
					node={child}
					parentElement={elementName}
					{componentAliases}
					{resolvedComponents}
				/>
			{/each}
		</ElementComponent>
	{:else if isVoidElement}
		<svelte:element this={elementName} {...node.properties ?? {}} />
	{:else}
		<svelte:element this={elementName} {...node.properties ?? {}}>
			{#each node.children ?? [] as child, i (`${elementName}-${i}`)}
				<BlueprintRenderer
					node={child}
					parentElement={elementName}
					{componentAliases}
					{resolvedComponents}
				/>
			{/each}
		</svelte:element>
	{/if}
{/if}
