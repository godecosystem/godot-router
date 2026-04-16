<script lang="ts">
	// wrapper component to make sure tooltip closes when disabled
	import { Tooltip as TooltipPrimitive } from 'bits-ui';

	let { open = $bindable(false), ...restProps }: TooltipPrimitive.RootProps = $props();

	$effect(() => {
		if (restProps.disabled === true) open = false;
	});
</script>

<TooltipPrimitive.Root bind:open {...restProps} />
