<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLTdAttributes } from 'svelte/elements';

	let { children, class: className, ...restProps }: HTMLTdAttributes = $props();
</script>

<td
	class={cn('[&>code]:text-accent border-t p-4 leading-6 not-first:border-l', className)}
	{...restProps}
>
	{@render children?.()}
</td>
