<script lang="ts">
	import { escapeRegex } from '$utils';

	type Props = {
		text: string;
		query: string;
	};

	let { text, query }: Props = $props();

	const lowerQuery = $derived(query.toLowerCase());

	let parts = $derived.by(() => {
		if (!query) return [text];

		try {
			const regex = new RegExp(`(${escapeRegex(lowerQuery)})`, 'gi');
			return text.split(regex);
		} catch (e) {
			return [text];
		}
	});
</script>

{#each parts as part, index (index)}
	{#if part.toLowerCase() === lowerQuery}
		<mark>{part}</mark>
	{:else}
		{part}
	{/if}
{/each}
