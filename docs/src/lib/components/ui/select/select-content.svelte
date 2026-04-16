<script lang="ts">
	import {
		Select as SelectPrimitive,
		type WithoutChild,
		type WithoutChildrenOrChild
	} from 'bits-ui';
	import { SelectPortal } from './';
	import { cn } from '$utils';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		portalProps,
		children,
		preventScroll = true,
		...restProps
	}: WithoutChild<SelectPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof SelectPortal>>;
	} = $props();
</script>

<SelectPortal {...portalProps}>
	<SelectPrimitive.Content
		bind:ref
		{sideOffset}
		{preventScroll}
		data-slot="select-content"
		class={cn(
			'bg-secondary relative isolate z-50 min-w-36 overflow-x-hidden overflow-y-auto rounded-md border shadow-md',
			'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
			'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
			'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2',
			className
		)}
		{...restProps}
	>
		<SelectPrimitive.Viewport
			class={cn('h-(--bits-select-anchor-height) w-full min-w-(--bits-select-anchor-width) p-1')}
		>
			{@render children?.()}
		</SelectPrimitive.Viewport>
	</SelectPrimitive.Content>
</SelectPortal>
