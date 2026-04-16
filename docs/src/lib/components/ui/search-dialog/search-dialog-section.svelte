<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getSearch } from './search-context.svelte';
	import Highlighter from '$ui/highlighter';
	import { type Component } from 'svelte';
	import DocIcon from '$components/icon';

	let {
		children,
		title,
		icon: Icon
	}: { children: Snippet; title: string; icon?: string | Component } = $props();

	const searchContext = getSearch();
</script>

<section class="group">
	<header class="pointer-events-none sticky top-0">
		{#if Icon}
			<div class="bg-background pointer-events-auto flex items-center gap-2 px-4 pt-4">
				{#if typeof Icon === 'string'}
					<DocIcon name={Icon} class="size-4 shrink-0" />
				{:else}
					<Icon class="size-4 shrink-0" />
				{/if}
				<h2 class="font-medium">
					<Highlighter text={title} query={searchContext.cleanQuery} />
				</h2>
			</div>
		{:else}
			<h2 class="bg-background pointer-events-auto px-4 pt-4 font-medium">
				<Highlighter text={title} query={searchContext.cleanQuery} />
			</h2>
		{/if}
		<div class="from-background sticky top-0 h-4 bg-linear-to-b"></div>
	</header>

	<div class="flex flex-col gap-2 px-4 pb-4 group-last-of-type:pb-0">
		{@render children?.()}
	</div>
</section>
