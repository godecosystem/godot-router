<script lang="ts">
	import './docs.css';
	import { Header, Body } from '$components/docs';
	import { setDocNavigationContext } from '$lib/docs/client/doc-navigation-context.svelte';
	import { createSharedValueContext } from '$ui/shared-value-context.svelte';
	import type { Pathname } from '$app/types';
	import * as TOC from '$ui/table-of-contents';
	import { SearchDialogProvider } from '$ui/search-dialog';
	import { page } from '$app/state';
	import { setDocLayoutContext } from '$lib/components/docs/layout-context.svelte';

	let { data, children } = $props();

	// Create shared context for tabs and code groups
	createSharedValueContext({
		id: 'js-pkg-managers',
		initialValue: 'bun',
		useLocalStorage: true
	});

	setDocNavigationContext(() => data.navigation ?? { tabs: [], groups: [], pages: [] });

	const docLayoutContext = setDocLayoutContext();

	type DocsPageData = {
		tocEntries?: TOC.TOCSeedEntry[];
	};

	const initialTocEntries = $derived.by(
		() => (page.data as DocsPageData | undefined)?.tocEntries ?? []
	);
</script>

<SearchDialogProvider
	onInit={(search) => {
		search.clearSearch();

		for (const group of data.searchGroups ?? []) {
			search.addGroup({
				title: group.title,
				icon: group.icon,
				items: group.items.map((item) => ({
					href: item.href as Pathname,
					title: item.title,
					description: item.description,
					keywords: item.keywords,
					icon: item.icon
				}))
			});
		}

		search.signalUpdate();
	}}
>
	<Header />

	<TOC.Provider
		initialEntries={initialTocEntries}
		observerOptions={{ rootMargin: `-${docLayoutContext.offsetTop}px 0px -50% 0px` }}
		reachedBottomObserverOptions={{
			threshold: 1,
			rootMargin: `-${docLayoutContext.offsetTop}px 0px -24px 0px`
		}}
		debug={false}
	>
		<Body>
			{@render children?.()}
		</Body>
	</TOC.Provider>
</SearchDialogProvider>
