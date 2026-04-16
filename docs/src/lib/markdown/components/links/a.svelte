<script lang="ts">
	import Link from '$ui/link';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let { href, children, ...restProps }: HTMLAnchorAttributes = $props();

	const isExternal = $derived(!href?.startsWith('/') && !href?.startsWith('#'));
</script>

<Link
	{href}
	{...restProps}
	class={[
		isExternal && 'inline-flex items-center gap-1',
		'text-accent underline-offset-2 hover:underline'
	]}
>
	{@render children?.()}{#if isExternal}<ExternalLink class="size-[1em]" />{/if}</Link
>
