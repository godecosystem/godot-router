<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { setSteps } from './steps-context.svelte';
	import { cn } from '$utils';

	let {
		start = 1,
		class: className,
		children,
		...restProps
	}: HTMLAttributes<HTMLOListElement> & {
		start?: number;
	} = $props();

	setSteps(() => start);
</script>

<ol data-slot="steps" class={cn('flex flex-col gap-4', className)} {...restProps}>
	{@render children?.()}
</ol>
