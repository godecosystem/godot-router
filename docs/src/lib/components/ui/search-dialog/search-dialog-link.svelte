<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Snippet } from 'svelte';
	import { getSearch, type ItemInputData } from './search-context.svelte';
	import Highlighter from '$ui/highlighter';
	import DocIcon from '$components/icon';
	import Button from '$ui/button';

	let {
		href,
		icon: Icon,
		title,
		children
	}: Pick<ItemInputData, 'href' | 'icon' | 'title'> & {
		children?: Snippet;
	} = $props();

	const searchContext = getSearch();
</script>

<Button {href} variant="outline" class="bg-secondary" data-search-dialog-link>
	<div class="flex flex-col gap-1">
		{#if Icon}
			<div class="flex items-center gap-2">
				{#if typeof Icon === 'string'}
					<DocIcon name={Icon} class="size-4 shrink-0" />
				{:else}
					<Icon class="size-4 shrink-0" />
				{/if}
				<h3 class="font-medium">
					<Highlighter text={title} query={searchContext.cleanQuery} />
				</h3>
			</div>
		{:else}
			<h3 class="font-medium">
				<Highlighter text={title} query={searchContext.cleanQuery} />
			</h3>
		{/if}
		{@render children?.()}
	</div>
	<ChevronRight class="ml-auto size-4 shrink-0" />
</Button>
