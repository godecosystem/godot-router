<script lang="ts">
	import { cn } from '$utils';
	import type { WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type CardProps = WithElementRef<HTMLAttributes<HTMLElement>> & {
		child?: Snippet<[{ props: HTMLAttributes<HTMLElement> }]>;
	};

	let {
		ref = $bindable(null),
		class: className,
		children,
		child,
		...restProps
	}: CardProps = $props();

	const cardProps = $derived({
		...restProps,
		'data-slot': 'card',
		class: cn(
			'flex flex-col gap-6 rounded-sm border bg-secondary py-6 text-card-foreground shadow',
			className
		)
	});
</script>

{#if child}
	{@render child({ props: cardProps })}
{:else}
	<div bind:this={ref} {...cardProps}>
		{@render children?.()}
	</div>
{/if}
