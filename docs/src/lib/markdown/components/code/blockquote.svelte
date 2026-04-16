<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, class: className, ...restProps }: HTMLAttributes<HTMLElement> = $props();
</script>

<blockquote class={cn('border-l-4 pl-4 font-medium italic', className)} {...restProps}>
	{@render children?.()}
</blockquote>
