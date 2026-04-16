<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSteps } from './steps-context.svelte';
	import { cn } from '$utils';

	let { class: className, children, id, ...restProps }: HTMLAttributes<HTMLLIElement> = $props();

	// the below is required for the steps to increment correctly with vite's hot module reload
	const ctxId = crypto.randomUUID();
	const stepsCtx = getSteps();
	stepsCtx.registerStep(ctxId);

	const index = $derived(stepsCtx.getStep(ctxId));

	$effect(() => {
		return () => {
			stepsCtx.removeStep(ctxId);
		};
	});
</script>

<li
	data-slot="step-title"
	class={cn('text-foreground flex items-center gap-3', className)}
	{...restProps}
>
	<span
		data-slot="step-index"
		aria-hidden="true"
		class="bg-secondary grid size-6 shrink-0 place-content-center rounded-full border text-xs font-semibold"
	>
		{index}
	</span>
	<h6 {id} class="font-medium">
		{@render children?.()}
	</h6>
</li>
