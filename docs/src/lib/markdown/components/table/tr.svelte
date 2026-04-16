<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, class: className, ...restProps }: HTMLAttributes<HTMLTableRowElement> = $props();
</script>

<tr class={cn('hover:bg-border/25 transition-[background-color]', className)} {...restProps}>
	{@render children?.()}
</tr>
