<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="sidebar-container"
	class={cn('flex min-h-full w-64 flex-col', className)}
	{...restProps}
>
	{@render children?.()}
</div>
