<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setTOCContext, type TOCProps } from './toc-context.svelte';
	import { dev } from '$app/environment';

	type Props = {
		debug?: boolean;
		children?: Snippet;
	} & TOCProps;

	let {
		selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
		initialEntries = [],
		highlightParentLevels = 5,
		observerOptions,
		detectIfReachedBottom = true,
		reachedBottomObserverOptions = { threshold: 1 },
		debug = false,
		children
	}: Props = $props();

	/**
	 * Converts IntersectionObserver rootMargin to CSS inset
	 * by reversing the signs of the values.
	 */
	function rootMarginToInset(rootMargin: IntersectionObserverInit['rootMargin']): string {
		if (!rootMargin) {
			return '0px 0px 0px 0px';
		}

		return rootMargin
			.split(' ')
			.map((value) => {
				if (value === '0' || value === '0px' || value === '0%') return '0';
				// Flip the sign: if it starts with '-', remove it; otherwise, add it.
				return value.startsWith('-') ? value.slice(1) : `-${value}`;
			})
			.join(' ');
	}

	const toc = setTOCContext({
		getSelectors: () => selectors,
		getHighlightParentLevels: () => highlightParentLevels,
		getInitialEntries: () => initialEntries,
		getObserverOptions: () => observerOptions,
		getDetectIfReachedBottom: () => detectIfReachedBottom,
		getReachedBottomObserverOptions: () => reachedBottomObserverOptions
	});

	$effect(() => {
		toc.update();
		return () => toc.destroy();
	});
</script>

{#if dev && debug}
	<div
		class="pointer-events-none fixed z-20 border border-red-500/50"
		style={`inset: ${rootMarginToInset(observerOptions?.rootMargin)};`}
	></div>

	{#if detectIfReachedBottom}
		<div
			class="pointer-events-none fixed z-20 border border-blue-500/50"
			style={`inset: ${rootMarginToInset(reachedBottomObserverOptions?.rootMargin)};`}
		>
			<div class="absolute bottom-0 left-1/2 -translate-x-1/2 bg-blue-500/50 p-2 text-xs">
				Reached Bottom: {toc.reachedBottom}
			</div>
		</div>
	{/if}
{/if}

{@render children?.()}
