<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLThAttributes } from 'svelte/elements';

	let { children, class: className, ...restProps }: HTMLThAttributes = $props();
</script>

<th class={cn('p-4 not-first:border-l', className)} {...restProps}>
	{@render children?.()}
</th>
