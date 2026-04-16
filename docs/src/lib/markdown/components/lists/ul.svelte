<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, class: className, ...restProps }: HTMLAttributes<HTMLUListElement> = $props();
</script>

<ul class={cn('text-muted-foreground mt-4 list-disc space-y-4 pl-4', className)} {...restProps}>
	{@render children?.()}
</ul>
