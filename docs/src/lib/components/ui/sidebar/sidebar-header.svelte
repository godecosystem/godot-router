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
	<div class="pointer-events-none sticky top-0 z-10">
		<div
			bind:this={ref}
			data-slot="sidebar-header"
			class={cn('bg-background pointer-events-auto flex flex-col gap-2 p-4', className)}
			{...restProps}
		>
			{@render children()}
		</div>
		<div class="from-background h-4 shrink-0 bg-linear-to-b"></div>
	</div>
{:else}
	<div
		class="from-background pointer-events-none sticky top-0 z-10 h-4 shrink-0 bg-linear-to-b"
	></div>
{/if}
