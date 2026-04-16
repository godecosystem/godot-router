<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$utils';
	import { getSharedValueContext } from '../shared-value-context.svelte';

	let {
		ref = $bindable(null),
		value = $bindable(''),
		contextId,
		class: className,
		...restProps
	}: TabsPrimitive.RootProps & { contextId?: string } = $props();

	// getSharedValueContext handles errors and returns undefined if no contextId is provided
	const ctx = getSharedValueContext<string>(() => contextId);

	const resolvedValue = $derived(ctx ? ctx.value : value);

	function onValueChange(v: string) {
		value = v;
		if (ctx) ctx.value = v;
	}
</script>

<TabsPrimitive.Root
	bind:ref
	value={resolvedValue}
	{onValueChange}
	data-slot="code-group"
	class={cn('bg-primary flex flex-col gap-2 rounded-lg border p-2 shadow', className)}
	{...restProps}
/>
