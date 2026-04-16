<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import H from './h.svelte';

	type Props = HTMLAttributes<HTMLHeadingElement> & {
		ignoreToc?: boolean;
	};

	let { children, class: className, ignoreToc = false, ...restProps }: Props = $props();
</script>

<H element="h4" {ignoreToc} class={cn('mt-6 text-lg sm:text-xl', className)} {...restProps}>
	{@render children?.()}
</H>
