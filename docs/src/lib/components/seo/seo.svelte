<script lang="ts">
	import { page } from '$app/state';
	import siteConfig from '$lib/configuration/site.config';

	type Props = {
		title: string;
		description?: string;
		image?: string;
		type?: string;
		publishedTime?: string;
		modifiedTime?: string;
	};

	let {
		title,
		description,
		image,
		type = 'website',
		publishedTime,
		modifiedTime
	}: Props = $props();

	const url = $derived(siteConfig.origin + page.url.pathname);
	const fullTitle = $derived(title + ' - ' + siteConfig.name);
	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': type,
		name: fullTitle,
		url: url,
		description: description,
		image: image
	});
</script>

<svelte:head>
	<!-- title -->
	{#if fullTitle}
		<title>{fullTitle}</title>
		<meta property="og:title" content={fullTitle} />
		<meta name="twitter:title" content={fullTitle} />
	{/if}

	<!-- description -->
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
		<meta name="twitter:description" content={description} />
	{/if}

	<!-- URL -->
	<meta property="og:url" content={url} />
	<link rel="canonical" href={url} />

	<!-- Type -->
	<meta property="og:type" content={type} />

	<!-- Image -->
	{#if image}
		<meta property="og:image" content={image} />
		<meta name="twitter:image" content={image} />
	{/if}

	<!-- publish time -->
	{#if publishedTime}
		<meta property="article:published_time" content={publishedTime} />
	{/if}

	<!-- modify time -->
	{#if modifiedTime}
		<meta property="article:modified_time" content={modifiedTime} />
	{/if}

	<svelte:element this={'script'} type="application/ld+json">
		{JSON.stringify(jsonLd, null, '\t')}
	</svelte:element>
</svelte:head>
