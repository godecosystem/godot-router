<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '$utils';

	let {
		ref = $bindable(null),
		sideOffset = 4,
		portalProps,
		class: className,
		...restProps
	}: DropdownMenuPrimitive.ContentProps & {
		portalProps?: DropdownMenuPrimitive.PortalProps;
	} = $props();
</script>

<DropdownMenuPrimitive.Portal {...portalProps}>
	<DropdownMenuPrimitive.Content
		bind:ref
		data-slot="dropdown-menu-content"
		{sideOffset}
		collisionPadding={8}
		class={cn(
			'scrollbar-thin bg-background z-50 min-w-8 overflow-x-hidden overflow-y-auto rounded-sm border p-1 shadow-md outline-none',
			'max-h-(--bits-dropdown-menu-content-available-height) origin-(--bits-dropdown-menu-content-transform-origin)',
			'data-[side=bottom]:slide-in-from-top-2',
			'data-[side=left]:slide-in-from-right-2',
			'data-[side=right]:slide-in-from-left-2',
			'data-[side=top]:slide-in-from-bottom-2',
			'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
			'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
			className
		)}
		{...restProps}
	/>
</DropdownMenuPrimitive.Portal>
