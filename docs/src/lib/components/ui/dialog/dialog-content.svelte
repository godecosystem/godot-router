<script lang="ts" module>
	export const contentClass = [
		'flex flex-col gap-4',
		'transition-[max-width,max-height,top] w-full max-w-[calc(100%-2rem)] sm:max-w-xl',
		'max-h-[min(32rem,calc(100%-2rem))]',
		'overflow-auto scroll-thin fixed top-1/2 left-1/2 z-40 -translate-1/2 border bg-background rounded-md p-4 shadow-lg',
		'data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in',
		'data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out'
	];
</script>

<script lang="ts">
	import { Dialog as DialogPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import * as Dialog from './';
	import { cn } from '$utils';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		hideClose = false,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		portalProps?: DialogPrimitive.PortalProps;
		children: Snippet;
		hideClose?: boolean;
	} = $props();
</script>

<Dialog.Portal {...portalProps}>
	<Dialog.Overlay />
	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-content"
		class={cn(contentClass, className)}
		{...restProps}
	>
		{@render children?.()}
		{#if !hideClose}
			<DialogPrimitive.Close
				class="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
			>
				<XIcon class="size-5 shrink-0" />
				<span class="sr-only">Close</span>
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</Dialog.Portal>
