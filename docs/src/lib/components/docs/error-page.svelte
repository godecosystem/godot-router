<script lang="ts">
	import { page } from '$app/state';
	import * as Card from '$ui/card';
	import type { Snippet } from 'svelte';

	let { suggestions }: { suggestions?: Snippet } = $props();
</script>

<div class="flex grow flex-col items-center justify-center gap-4 p-4">
	<h1 class="text-center text-2xl font-medium">Oops! Something went wrong.</h1>
	<Card.Root class="w-full max-w-md">
		<Card.Header class="text-center">
			<Card.Title class="text-xl">{page.error ? page.status : 404}</Card.Title>
			<Card.Description>{page.error ? page.error.message : 'Page not found'}</Card.Description>
		</Card.Header>
		{@render suggestions?.()}
	</Card.Root>
</div>
