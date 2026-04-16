<script lang="ts" module>
	export type Side = 'top' | 'right' | 'bottom' | 'left';
</script>

<script lang="ts">
	import { Dialog as SheetPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { SheetOverlay, SheetPortal, SheetClose } from './';
	import { cn } from '$utils';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		side = 'right',
		showCloseButton = true,
		portalProps,
		children,
		...restProps
	}: WithoutChildrenOrChild<SheetPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof SheetPortal>>;
		side?: Side;
		showCloseButton?: boolean;
		children: Snippet;
	} = $props();
</script>

<SheetPortal {...portalProps}>
	<SheetOverlay />
	<SheetPrimitive.Content
		bind:ref
		data-slot="sheet-content"
		data-side={side}
		class={cn(
			'bg-background data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fixed z-50 flex flex-col bg-clip-padding text-sm shadow-lg transition duration-300 ease-in-out',
			side === 'left' &&
				'data-[state=open]:slide-in-from-left-full data-[state=closed]:slide-out-to-left-full inset-y-0 left-0 h-full w-[min(calc(100vw+1px),24rem)] overflow-y-auto border-r',
			side === 'right' &&
				'data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full inset-y-0 right-0 h-full w-[min(calc(100vw+1px),24rem)] overflow-y-auto border-l',
			side === 'top' &&
				'data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-top-full inset-x-0 top-0 h-auto border-b',
			side === 'bottom' &&
				'data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full inset-x-0 bottom-0 h-auto border-t',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		{#if showCloseButton}
			<SheetClose class="absolute top-4 right-4" />
		{/if}
	</SheetPrimitive.Content>
</SheetPortal>
