<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { getSearch, type SearchResult } from '$ui/search-dialog';
	import siteConfig from '$lib/configuration/site.config';
	import ErrorPage from '../../+error.svelte';
	import DocIcon from '$components/icon';
	import Button from '$ui/button';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	const searchContext = getSearch();

	let results: null | SearchResult = $state(null);

	const updateResults = () => {
		const cleanQuery = page.url.pathname.replace('/docs/', '').trim();
		const queries = cleanQuery.split('/').filter(Boolean);
		results = searchContext.getResults(queries, 5);
	};

	onMount(() => {
		if (page.status !== 404) {
			results = null;
			return;
		}

		updateResults();
		return searchContext.onUpdate(updateResults);
	});
</script>

<svelte:head>
	<title>Error {page.status} - {siteConfig.name}</title>
</svelte:head>

<ErrorPage>
	{#if results && results.size}
		<div
			data-slot="card-content"
			class="space-y-6 border-t px-6 pt-6"
			transition:slide={{ duration: 300, axis: 'y' }}
		>
			<div class="text-center">Were you looking for?</div>
			<div class="flex flex-col gap-2">
				{#each results.entries() as [group, data] (group)}
					{#each data.items as { title, href, icon: Icon } (href)}
						<Button {href} variant="outline">
							{#if Icon}
								<div class="flex items-center gap-2">
									{#if typeof Icon === 'string'}
										<DocIcon name={Icon} class="size-4 shrink-0" />
									{:else}
										<Icon class="size-4 shrink-0" />
									{/if}
									<h3 class="font-medium">
										{title}
									</h3>
								</div>
							{:else}
								<h3 class="font-medium">
									{title}
								</h3>
							{/if}
							<ChevronRight class="ml-auto size-4 shrink-0" />
						</Button>
					{/each}
				{/each}
			</div>
		</div>
	{/if}
</ErrorPage>
