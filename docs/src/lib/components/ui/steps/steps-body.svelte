<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$utils';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	data-slot="step-body"
	class={cn('ml-3 space-y-4 border-l py-3 pl-6', className)}
	{...restProps}
>
	{@render children?.()}
</div>
