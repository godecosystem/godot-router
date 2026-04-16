<script lang="ts">
	import { page } from '$app/state';
	import siteConfig from '$lib/configuration/site.config';
	import * as Card from '$ui/card';
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<svelte:head>
	<title>Error {page.status} - {siteConfig.name}</title>
</svelte:head>

<div class="flex grow flex-col items-center justify-center gap-4 p-4">
	<h1 class="text-center text-2xl font-medium">Oops! Something went wrong.</h1>
	<Card.Root class="w-full max-w-md">
		<Card.Header class="text-center">
			<Card.Title class="text-xl">{page.error ? page.status : 404}</Card.Title>
			<Card.Description>{page.error ? page.error.message : 'Page not found'}</Card.Description>
		</Card.Header>
		{@render children?.()}
	</Card.Root>
</div>
