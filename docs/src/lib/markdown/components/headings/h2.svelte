<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import H from './h.svelte';

	type Props = HTMLAttributes<HTMLHeadingElement> & {
		ignoreToc?: boolean;
	};

	let { children, class: className, ignoreToc = false, ...restProps }: Props = $props();
</script>

<H element="h2" {ignoreToc} class={cn('mt-10 text-2xl sm:text-3xl', className)} {...restProps}>
	{@render children?.()}
</H>
