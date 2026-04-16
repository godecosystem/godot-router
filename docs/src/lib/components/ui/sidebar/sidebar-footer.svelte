<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$utils';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

{#if children}
	<div class="pointer-events-none sticky bottom-0 z-10">
		<div class="from-background h-4 shrink-0 bg-linear-to-t"></div>
		<div
			bind:this={ref}
			data-slot="sidebar-footer"
			class={cn('bg-background pointer-events-auto flex flex-col gap-2 p-4', className)}
			{...restProps}
		>
			{@render children()}
		</div>
	</div>
{:else}
	<div
		class="from-background pointer-events-none sticky bottom-0 z-10 h-4 shrink-0 bg-linear-to-t"
	></div>
{/if}
