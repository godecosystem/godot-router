<script lang="ts">
	import { Dialog as SheetPrimitive } from 'bits-ui';
	import Button from '$lib/components/ui/button';
	import XIcon from '@lucide/svelte/icons/x';

	let { ref = $bindable(null), ...restProps }: SheetPrimitive.CloseProps = $props();
</script>

<SheetPrimitive.Close bind:ref data-slot="sheet-close" {...restProps}>
	{#snippet child({ props })}
		<Button variant="ghost" size="icon" {...props}>
			<XIcon />
			<span class="sr-only">Close</span>
		</Button>
	{/snippet}
</SheetPrimitive.Close>
