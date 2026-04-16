<script lang="ts">
	import MenuIcon from '@lucide/svelte/icons/menu';
	import { onNavigate } from '$app/navigation';
	import Logo from './header-logo.svelte';
	import Github from './github.svelte';
	import { cn } from '$utils';
	import Icon from '$components/icon';
	import { MobileSidebar } from '$components/docs/sidebar';
	import { getDocNavigationContext } from '$lib/docs/client/doc-navigation-context.svelte';
	import ThemeSwitch from './theme-switch.svelte';
	import Button from '$ui/button';
	import * as Sheet from '$ui/sheet';
	import {
		SearchDialogTriggerDesktop,
		SearchDialogTriggerMobile
	} from '$components/ui/search-dialog';
	import Link from '$ui/link';

	const docNavigation = getDocNavigationContext();

	let mobileNavigationOpen = $state(false);

	onNavigate(() => {
		mobileNavigationOpen = false;
	});
</script>

<header
	class="bg-background sticky top-0 z-30 border-b-[length:var(--spacing-docs-header-main-border)]"
>
	<nav
		class="h-docs-header-main bg-background isolate container flex items-center justify-between gap-4 px-4 md:grid md:grid-cols-3"
	>
		<Logo />
		<SearchDialogTriggerDesktop class="max-w-64 justify-self-center" />
		<div class="flex items-center gap-2 justify-self-end">
			<SearchDialogTriggerMobile />
			<ThemeSwitch />
			<Github />
			<Button
				variant="ghost"
				size="icon"
				onclick={() => (mobileNavigationOpen = !mobileNavigationOpen)}
				class="lg:hidden"
			>
				<MenuIcon />
				<span class="sr-only">Open navigation</span>
			</Button>
		</div>
	</nav>

	<!-- optional tab navigation -->
	{#if docNavigation.tabs.length > 0}
		<div class={cn('h-docs-header-tabs container hidden items-center gap-4 px-4 sm:flex')}>
			{#each docNavigation.tabs as tab, index (index)}
				{@const active = docNavigation.currentTab?.href === tab.href}
				<Link
					href={tab.href}
					class={cn(
						'text-muted-foreground hidden h-full items-center gap-2 text-sm font-medium transition-colors sm:flex',
						active
							? 'text-accent border-accent h-[calc(100%+1px)] border-b'
							: 'hover:text-foreground'
					)}
				>
					{#if tab.icon}
						<Icon name={tab.icon} class="size-4 shrink-0" />
					{/if}
					{tab.title}
				</Link>
			{/each}
		</div>
	{/if}
</header>

<Sheet.Root bind:open={mobileNavigationOpen}>
	<MobileSidebar />
</Sheet.Root>
