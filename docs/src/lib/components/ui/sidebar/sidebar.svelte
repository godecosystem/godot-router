<script lang="ts">
	// import * as Sheet from '$lib/components/ui/sheet/index';
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

<!-- The aside is a wrapper that allows the inside div to stay the same size regardless of if the scrollbar is present or not -->
<aside
	bind:this={ref}
	data-slot="sidebar"
	class={cn('scrollbar-thin sticky h-dvh shrink-0 overflow-x-hidden', className)}
	{...restProps}
>
	{@render children?.()}
</aside>
