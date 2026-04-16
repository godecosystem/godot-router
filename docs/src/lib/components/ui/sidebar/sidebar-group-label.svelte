<script lang="ts">
	import { cn } from '$utils';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Snippet } from 'svelte';
	import { CollapsibleTrigger } from '$ui/collapsible';
	import { getSidebarGroupCollapsibleContext } from './sidebar-group-collapsible-context';

	let {
		ref = $bindable(null),
		children,
		child,
		class: className,
		hasActive = false,
		...restProps
	}: {
		ref?: HTMLElement | null;
		children?: Snippet;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		class?: string;
		hasActive?: boolean;
		[key: string]: unknown;
	} = $props();

	const mergedProps = $derived({
		class: cn(
			'group/sidebar-group-label flex items-center gap-2 p-2 text-xs font-medium tracking-wider text-muted-foreground [&>svg]:size-3.5 [&>svg]:shrink-0',
			className
		),
		'data-slot': 'sidebar-group-label',
		'data-sidebar': 'group-label',
		...restProps
	});

	const sidebar = getSidebarGroupCollapsibleContext();
	const isCollapsible = !!sidebar?.isCollapsible;

	const collapsibleProps = $derived.by(() => {
		if (!isCollapsible) return mergedProps;
		return {
			...mergedProps,
			class: cn(
				mergedProps.class,
				'hover:text-foreground transition-[color,box-shadow] focus-visible:text-foreground rounded-sm'
			)
		};
	});
</script>

{#if isCollapsible}
	<CollapsibleTrigger bind:ref {...collapsibleProps}>
		<div
			class={cn(
				'bg-accent size-1 rounded-full transition-[margin,translate,opacity]',
				hasActive ? '' : '-mr-3 -translate-x-2 opacity-0'
			)}
		></div>
		{@render children?.()}
		<ChevronRight
			class="ml-auto transition-[rotate] group-data-[state=open]/sidebar-group-label:rotate-90"
		/>
	</CollapsibleTrigger>
{:else if child}
	{@render child({ props: mergedProps })}
{:else}
	<div bind:this={ref} {...mergedProps}>
		{@render children?.()}
	</div>
{/if}
