<script lang="ts">
	import * as Dialog from '$ui/dialog';
	import * as Tooltip from '$ui/tooltip';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { cn } from '$utils';
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import Button from '$ui/button';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: TooltipPrimitive.TriggerProps = $props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger bind:ref class={cn('md:hidden', className)} {...restProps}>
		{#snippet child({ props: tooltipProps })}
			<Dialog.Trigger {...tooltipProps}>
				{#snippet child({ props: dialogProps })}
					<Button variant="ghost" size="icon" {...dialogProps}>
						<SearchIcon />
					</Button>
				{/snippet}
			</Dialog.Trigger>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content>Search</Tooltip.Content>
</Tooltip.Root>
