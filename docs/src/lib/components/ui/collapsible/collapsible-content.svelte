<script lang="ts" module>
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import type { SlideParams, TransitionConfig } from 'svelte/transition';

	function createSlide(defaultParams: SlideParams = {}) {
		return (node: Element, params: SlideParams = {}): TransitionConfig => {
			return slide(node, { ...defaultParams, ...params });
		};
	}

	export const collapsibleSlide = createSlide({ duration: 300, axis: 'y', easing: cubicOut });
</script>

<script lang="ts">
	import { Collapsible as CollapsiblePrimitive } from 'bits-ui';
	import { cn } from '$utils';

	let {
		ref = $bindable(null),
		class: className,
		child: ChildSnippet,
		children,
		...restProps
	}: CollapsiblePrimitive.ContentProps = $props();
</script>

<CollapsiblePrimitive.Content
	bind:ref
	forceMount
	hiddenUntilFound
	data-slot="collapsible-content"
	class={cn(className)}
	{...restProps}
>
	{#snippet child({ props, open })}
		{#if ChildSnippet}
			{@render ChildSnippet({ props, open })}
		{:else if open}
			<div {...props} transition:collapsibleSlide>
				{@render children?.()}
			</div>
		{/if}
	{/snippet}
</CollapsiblePrimitive.Content>
