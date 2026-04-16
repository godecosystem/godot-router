<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, class: className, ...restProps }: HTMLAttributes<HTMLParagraphElement> = $props();
</script>

<p class={cn('text-muted-foreground leading-8', className)} {...restProps}>
	{@render children?.()}
</p>
