<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, class: className, ...restProps }: HTMLAttributes<HTMLOListElement> = $props();
</script>

<ol class={cn('text-muted-foreground mt-4 list-decimal space-y-4 pl-4', className)} {...restProps}>
	{@render children?.()}
</ol>
