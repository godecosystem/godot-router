<script lang="ts">
	import { mergeProps, type WithElementRef } from 'bits-ui';
	import { cn } from '$utils';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { CollapsibleContent, collapsibleSlide } from '$ui/collapsible';
	import { getSidebarGroupCollapsibleContext } from './sidebar-group-collapsible-context';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLUListElement>> = $props();

	const mergedProps = $derived({
		class: cn('flex w-full min-w-0 flex-col gap-px', className),
		'data-slot': 'sidebar-menu',
		...restProps
	});

	const sidebar = getSidebarGroupCollapsibleContext();
	const isCollapsible = !!sidebar?.isCollapsible;

	const setRef: Attachment<HTMLUListElement> = (node) => {
		ref = node;

		return () => {
			if (ref === node) {
				ref = null;
			}
		};
	};
</script>

{#if isCollapsible}
	<CollapsibleContent>
		{#snippet child({ props, open })}
			{#if open}
				<ul {...mergeProps(mergedProps, props)} transition:collapsibleSlide {@attach setRef}>
					{@render children?.()}
				</ul>
			{/if}
		{/snippet}
	</CollapsibleContent>
{:else}
	<ul {...mergedProps} {@attach setRef}>
		{@render children?.()}
	</ul>
{/if}
