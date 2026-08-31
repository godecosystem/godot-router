<script lang="ts">
	import SEO from '$components/seo';
	import { Logo, GitHub } from '$components/logo';
	import BookIcon from '@lucide/svelte/icons/book-text';

	import Button from '$components/ui/button';

	import siteConfig from '$lib/configuration/site.config';
	import docsConfig from '$lib/configuration/docs.config';

	const descriptionSentences = siteConfig.description.split('.').filter(Boolean);
</script>

<SEO title="Home" description={siteConfig.description} />

<div class="grid grow content-center justify-items-center gap-8 p-8">
	<h1 class="flex items-center gap-3 text-center text-3xl font-bold">
		<Logo class="h-8" />
		<span>{siteConfig.name}</span>
	</h1>
	<div class="text-muted-foreground max-w-lg space-y-4 text-center text-lg">
		{#each descriptionSentences as sentence, index (index)}
			<p>{sentence}.</p>
		{/each}
	</div>
	<div class="flex items-center gap-2">
		<Button href="/docs" class="relative" variant="foreground">
			<BookIcon class="size-4 shrink-0" />
			View Docs
		</Button>
		<Button href={docsConfig.github}>
			<GitHub />
			View GitHub
		</Button>
	</div>
</div>
