<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import H from './h.svelte';

	type Props = HTMLAttributes<HTMLHeadingElement> & {
		ignoreToc?: boolean;
	};

	let { children, class: className, ignoreToc = false, ...restProps }: Props = $props();
</script>

<H element="h1" {ignoreToc} class={cn('mt-12 text-3xl sm:text-4xl', className)} {...restProps}>
	{@render children?.()}
</H>
