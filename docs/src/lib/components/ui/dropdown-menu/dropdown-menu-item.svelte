<script lang="ts">
	import { cn } from '$utils';
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DropdownMenuPrimitive.ItemProps & { href?: string } = $props();
</script>

<DropdownMenuPrimitive.Item
	bind:ref
	data-slot="dropdown-menu-item"
	class={cn(
		'relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none',
		'data-disabled:pointer-events-none data-disabled:opacity-50',
		'data-highlighted:bg-secondary transition-[background-color]',
		"[&>svg]:text-muted-foreground hover:[&>svg]:text-foreground [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>svg]:transition-[color]",
		className
	)}
	{...restProps}
/>
