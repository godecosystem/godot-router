<script lang="ts">
	import { cn } from '$utils';
	import type { ClassValue } from 'clsx';
	import type { HTMLAttributes } from 'svelte/elements';
	import Link from '$ui/link';
	import { getTOCContext } from './toc-context.svelte';

	type Props = {
		class?: ClassValue;
	} & HTMLAttributes<HTMLUListElement>;

	let { class: className, ...restProps }: Props = $props();

	const toc = getTOCContext();
</script>

<ul class={cn('text-sm', className)} {...restProps}>
	{#each toc.tocEntries as [key, item] (key)}
		{@const isActive = key === toc.activeKey}
		{@const isParent = toc.highlightParents && (toc.activeItem?.parents.has(key) ?? false)}
		<Link
			href="#{key}"
			aria-current={isActive ? 'location' : undefined}
			class={cn(
				'transition-font text-muted-foreground block border-l py-1 pr-4 transition-[color,border-color,box-shadow]',
				!isActive && !isParent && 'hover:text-foreground focus-visible:border-border',
				isParent && 'text-accent border-accent/75',
				isActive && 'text-accent border-accent font-medium'
			)}
			style={`padding-left: ${item.level}rem`}
		>
			{item.text}
		</Link>
	{/each}
</ul>
