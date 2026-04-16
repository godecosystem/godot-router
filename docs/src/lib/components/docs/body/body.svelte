<script lang="ts">
	import { NavigationSidebar, TOCSidebar } from '$components/docs/sidebar';
	import { getDocNavigationContext } from '$lib/docs/client/doc-navigation-context.svelte';
	import * as TOC from '$ui/table-of-contents';
	import * as Collapsible from '$ui/collapsible';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { Footer } from '$components/docs';
	import type { Snippet } from 'svelte';
	import { getDocLayoutContext } from '$lib/components/docs/layout-context.svelte';

	const docNavigation = getDocNavigationContext();
	const toc = TOC.getTOCContext();

	type Props = {
		children?: Snippet;
	};

	let { children }: Props = $props();

	const docLayoutContext = getDocLayoutContext();
</script>

<div
	class="relative container flex min-w-0 grow overflow-x-clip"
	data-docs-tabs={docNavigation.tabs.length > 0}
	data-docs-toc={toc.tocEntries.length > 0}
>
	<NavigationSidebar />

	<div class="flex min-w-0 grow flex-col wrap-break-word">
		<div class="top-docs-header pointer-events-none sticky z-10">
			{#if toc.tocEntries.length > 0}
				<Collapsible.Root
					class="bg-background h-docs-content-header pointer-events-auto border-b xl:hidden"
				>
					<Collapsible.Trigger
						class="h-docs-content-header-toc text-muted-foreground group hover:text-foreground flex w-full items-center gap-2 px-4 py-2 text-sm transition-[color]"
					>
						<TOC.RadialProgress class="mr-2" />
						<!-- {#if docNavigation.currentGroup}
							<span class="block lg:hidden">{docNavigation.currentGroup?.title}</span>
							<ChevronRightIcon class="block size-4 shrink-0 lg:hidden" />
						{/if} -->
						<div class="flex min-w-0 items-center gap-2">
							<div class="flex shrink-0 items-center gap-2 lg:hidden">
								<span>{docNavigation.currentPage?.title}</span>
								<ChevronRightIcon class="size-4 shrink-0" />
							</div>
							<span class="truncate">{toc.activeItem?.text}</span>
						</div>
						<ChevronRightIcon
							class=" ml-auto size-4 shrink-0 transition-[rotate] group-data-[state=open]:rotate-90"
						/>
					</Collapsible.Trigger>
					<Collapsible.Content
						class="scrollbar-thin bg-background isolate max-h-[min(16rem,calc(100dvh-var(--spacing-docs-header)-var(--spacing-docs-content-header-toc)))] overflow-y-auto border-t border-b"
					>
						<div class="from-background sticky top-0 h-4 shrink-0 bg-linear-to-b"></div>
						<TOC.Nav class="px-4">
							<TOC.Label />
							<TOC.List />
						</TOC.Nav>
						<div class="from-background sticky bottom-0 h-4 shrink-0 bg-linear-to-t"></div>
					</Collapsible.Content>
				</Collapsible.Root>
			{:else}
				<div
					class="bg-background h-docs-content-header text-muted-foreground pointer-events-auto flex items-center gap-2 border-b px-4 py-2 text-sm lg:hidden"
				>
					{#if docNavigation.currentGroup}
						<span>{docNavigation.currentGroup?.title}</span>
						<ChevronRightIcon class="size-4 shrink-0" />
					{/if}
					<span class="truncate">{docNavigation.currentPage?.title}</span>
				</div>
			{/if}
			<div class="from-background h-6 bg-linear-to-b"></div>
		</div>
		<main
			class="relative flex min-w-0 grow flex-col gap-16 overflow-hidden px-6 transition-[padding] lg:px-14 lg:py-8"
			{@attach docLayoutContext.attachMainElement}
		>
			{@render children?.()}
			<Footer />
		</main>
		<div class="from-background pointer-events-none sticky bottom-0 z-1 h-6 bg-linear-to-t"></div>
	</div>

	<TOCSidebar />
</div>
