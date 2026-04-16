<script lang="ts">
	import * as Sidebar from '$ui/sidebar';
	import { cn } from '$utils';
	import {
		getDocNavigationContext,
		type GroupedPages,
		type NavigationPage
	} from '$lib/docs/client/doc-navigation-context.svelte';
	import Icon from '$components/icon';

	const docNavigation = getDocNavigationContext();
</script>

<Sidebar.Root
	class={cn(
		'border-r-[length:var(--b-width)] [--b-width:1px]',
		'transition-[margin-left,opacity,visibility] duration-300 lg:transition-[margin-left,opacity]',
		'-ml-[calc(16rem+var(--b-width))] lg:ml-0',
		'overflow-y-hidden lg:overflow-y-auto',
		'invisible lg:visible',
		'opacity-0 lg:opacity-100',
		'bg-background top-docs-header h-[calc(100dvh-var(--spacing-docs-header))]'
	)}
>
	<Sidebar.Container>
		<Sidebar.Header />
		<Sidebar.Content>
			{#if docNavigation.getMode() === 'group'}
				{@const data = docNavigation.getData() as GroupedPages[]}
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
			{:else if docNavigation.getMode() === 'page'}
				<Sidebar.Menu>
					{@const data = docNavigation.getData() as NavigationPage[]}
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
	</Sidebar.Container>
</Sidebar.Root>

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
