<script lang="ts">
	import Icon from '$components/icon';
	import {
		getDocNavigationContext,
		type GroupedPages,
		type NavigationPage
	} from '$lib/docs/client/doc-navigation-context.svelte';
	import * as Sheet from '$ui/sheet';
	import * as Select from '$ui/select';
	import * as Sidebar from '$ui/sidebar';
	import Logo from '../header/header-logo.svelte';

	const docNavigation = getDocNavigationContext();

	let selectedTabId = $derived(
		docNavigation.currentTab ? String(docNavigation.currentTab.id) : undefined
	);

	const selectedTab = $derived.by(() => {
		if (!selectedTabId) return docNavigation.currentTab;
		return (
			docNavigation.tabs.find((tab) => String(tab.id) === selectedTabId) ?? docNavigation.currentTab
		);
	});
</script>

<Sheet.Content side="right" showCloseButton={false}>
	<Sidebar.Header class="gap-4">
		<div class="flex flex-row items-center justify-between gap-4">
			<Logo />
			<Sheet.Close />
		</div>
		{#if docNavigation.tabs.length > 0}
			<Select.Root type="single" bind:value={selectedTabId}>
				<Select.Trigger>
					{#if selectedTab?.icon}
						<Icon name={selectedTab.icon} />
					{/if}
					<span class="truncate">{selectedTab?.title ?? 'Select section'}</span>
				</Select.Trigger>
				<Select.Content>
					{#each docNavigation.tabs as tab, index (index)}
						<Select.Item value={String(tab.id)} label={tab.title}>
							<span class="flex min-w-0 items-center gap-2">
								{#if tab.icon}
									<Icon name={tab.icon} class="size-4 shrink-0" />
								{/if}
								<span class="truncate">{tab.title}</span>
							</span>
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{/if}
	</Sidebar.Header>

	<Sidebar.Content>
		{#if docNavigation.getMode(selectedTab) === 'group'}
			{@const data = docNavigation.getData(selectedTab) as GroupedPages[]}
			{#each data as navGroup, index (index)}
				{#if navGroup.showTitle}
					<Sidebar.Group collapsible={navGroup.collapsible}>
						<Sidebar.GroupLabel hasActive={navGroup.id === docNavigation.currentGroup?.id}>
							{#if navGroup.icon}
								<Icon name={navGroup.icon} />
							{/if}
							{navGroup.title}
						</Sidebar.GroupLabel>
						{@render groupMenu(navGroup)}
					</Sidebar.Group>
				{:else}
					{@render groupMenu(navGroup)}
				{/if}
			{/each}
		{:else if docNavigation.getMode(selectedTab) === 'page'}
			<Sidebar.Menu>
				{@const data = docNavigation.getData(selectedTab) as NavigationPage[]}
				{#each data as navPage, index (index)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							href={navPage.href}
							isActive={navPage.slug === docNavigation.currentPage?.slug}
						>
							{#if navPage.icon}
								<Icon name={navPage.icon} class="size-4 shrink-0" />
							{/if}
							{navPage.title}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		{:else}
			<Sidebar.Menu></Sidebar.Menu>
		{/if}
	</Sidebar.Content>

	<Sidebar.Footer />
</Sheet.Content>

{#snippet groupMenu(navGroup: GroupedPages)}
	<Sidebar.Menu>
		{#each navGroup.pages as pageItem, index (index)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					href={pageItem.href}
					isActive={pageItem.slug === docNavigation.currentPage?.slug}
				>
					{#if pageItem.icon}
						<Icon name={pageItem.icon} class="size-4 shrink-0" />
					{/if}
					{pageItem.title}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
{/snippet}
