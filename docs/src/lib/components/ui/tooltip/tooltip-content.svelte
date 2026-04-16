<script lang="ts">
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	import { fly } from 'svelte/transition';

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 8,
		side = 'top',
		children,
		...restProps
	}: TooltipPrimitive.ContentProps = $props();

	function getXY(side: TooltipPrimitive.ContentProps['side'] | unknown) {
		switch (side) {
			case 'top':
				return { x: 0, y: sideOffset };
			case 'bottom':
				return { x: 0, y: -sideOffset };
			case 'left':
				return { x: sideOffset, y: 0 };
			case 'right':
				return { x: -sideOffset, y: 0 };
			default:
				return { x: 0, y: 0 };
		}
	}
</script>

<TooltipPrimitive.Portal>
	<TooltipPrimitive.Content
		forceMount
		bind:ref
		data-slot="tooltip-content"
		collisionPadding={8}
		{sideOffset}
		{side}
		class={cn('bg-primary z-50 rounded border px-2 py-1 text-xs shadow', className)}
		{...restProps}
	>
		{#snippet child({ wrapperProps, props, open })}
			{#if open}
				<div {...wrapperProps}>
					<div {...props} transition:fly={{ duration: 150, ...getXY(props['data-side']) }}>
						{@render children?.()}
					</div>
				</div>
			{/if}
		{/snippet}
	</TooltipPrimitive.Content>
</TooltipPrimitive.Portal>
