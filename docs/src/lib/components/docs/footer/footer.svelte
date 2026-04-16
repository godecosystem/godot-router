<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import siteConfig from '$lib/configuration/site.config';
	import Button from '$ui/button';
	import { getDocNavigationContext } from '$lib/docs/client/doc-navigation-context.svelte';
	import Github from '../header/github.svelte';
	import ThemeSwitch from '../header/theme-switch.svelte';

	const docNavigation = getDocNavigationContext();
</script>

<footer class="flex flex-col gap-4 text-sm">
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		{#if docNavigation.prevPage}
			<Button
				href={docNavigation.prevPage.href}
				variant="outline"
				class="group flex-col items-start p-4"
			>
				<div
					class="text-foreground group-hover:text-accent flex items-center gap-2 transition-[gap] group-hover:gap-4"
				>
					<ArrowLeft class="size-4 shrink-0 transition-[color]" />
					<span class="transition-[color]">{docNavigation.prevPage.title}</span>
				</div>
				<p class="text-muted-foreground w-full truncate text-start">
					{docNavigation.prevPage.description}
				</p>
			</Button>
		{/if}
		{#if docNavigation.nextPage}
			<Button
				href={docNavigation.nextPage.href}
				variant="outline"
				class="group flex-col items-end p-4 sm:col-2"
			>
				<div
					class="text-foreground group-hover:text-accent flex items-center gap-2 transition-[gap] group-hover:gap-4"
				>
					<span class="transition-[color]">{docNavigation.nextPage.title}</span>
					<ArrowRight class="size-4 shrink-0 transition-[color]" />
				</div>
				<p class="text-muted-foreground w-full truncate text-end">
					{docNavigation.nextPage.description}
				</p>
			</Button>
		{/if}
	</div>
	<hr />
	<div class="flex flex-wrap items-center justify-between gap-2">
		<span class="font-medium">{siteConfig.name}</span>
		<div class="flex items-center gap-2">
			<ThemeSwitch />
			<Github />
		</div>
	</div>
</footer>
