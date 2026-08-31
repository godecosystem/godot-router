<script lang="ts">
	import Link from '$ui/link';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { getSafeMarkdownHref } from './safe-href';

	let { href, children, ...restProps }: HTMLAnchorAttributes = $props();

	const safeHref = $derived(getSafeMarkdownHref(href));
	const isExternal = $derived(
		Boolean(safeHref && !safeHref.startsWith('/') && !safeHref.startsWith('#'))
	);
</script>

<Link
	href={safeHref}
	{...restProps}
	class={[
		isExternal && 'inline-flex items-center gap-1',
		'text-accent underline-offset-2 hover:underline'
	]}
>
	{@render children?.()}{#if isExternal}<ExternalLink class="size-[1em]" />{/if}</Link
>
