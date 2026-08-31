<script lang="ts">
	import { page } from '$app/state';
	import siteConfig from '$lib/configuration/site.config';
	import ErrorPage from '$components/docs/error-page.svelte';
</script>

<svelte:head>
	<title>Error {page.status} - {siteConfig.name}</title>
</svelte:head>
<ErrorPage />
