<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$utils';
	import './tabs.css';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
	bind:ref
	data-slot="tabs-list"
	class={cn('relative inline-flex w-fit items-center justify-center', className)}
	{...restProps}
>
	<div
		aria-hidden="true"
		data-slot="tabs-list-indicator"
		class="bg-background pointer-events-none absolute hidden rounded-md border border-transparent shadow-sm"
	></div>
	{@render children?.()}
</TabsPrimitive.List>
