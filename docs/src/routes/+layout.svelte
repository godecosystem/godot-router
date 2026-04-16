<script lang="ts">
	import '$css';
	import favicon from '$lib/assets/favicon.svg';
	import siteConfig from '$lib/configuration/site.config';
	import { ModeWatcher } from 'mode-watcher';
	import * as Tooltip from '$ui/tooltip';

	let { children } = $props();
</script>

<svelte:head>
	<meta property="og:site_name" content={siteConfig.name} />
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher defaultMode="dark" />

<Tooltip.Provider delayDuration={150} disableCloseOnTriggerClick={true}>
	{@render children?.()}
</Tooltip.Provider>
