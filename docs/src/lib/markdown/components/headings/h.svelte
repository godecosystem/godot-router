<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import LinkIcon from '@lucide/svelte/icons/link';
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	type Props = {
		element: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
		ignoreToc?: boolean;
	} & HTMLAttributes<HTMLHeadingElement>;

	let {
		element = 'h2',
		ignoreToc = false,
		children,
		class: className,
		...restProps
	}: Props = $props();

	const isActive = $derived.by(() => {
		const id = restProps.id;
		if (!id) return false;
		return page.url.hash === `#${id}`;
	});
</script>

{#if ignoreToc}
	<svelte:element
		this={element}
		data-ignore-toc
		class={cn('w-fit font-bold', className)}
		{...restProps}
	>
		{@render children?.()}
	</svelte:element>
{:else}
	<svelte:element
		this={element}
		class={cn('group relative w-fit font-bold', className)}
		{...restProps}
	>
		<div class="absolute top-1/2 left-0 hidden -translate-x-full -translate-y-1/2 pr-4 lg:block">
			<a
				class={[
					'block rounded-md border p-1 transition-[opacity,background-color,color]',
					'bg-secondary hover:bg-primary focus-visible:bg-primary',
					'text-muted-foreground hover:text-foreground focus-visible:text-foreground',
					'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
				]}
				href="#{restProps.id}"
			>
				<LinkIcon class="size-4 shrink-0" />
			</a>
		</div>
		{@render children?.()}
		{#if isActive}
			<div
				class="bg-accent/25 absolute -inset-1 -z-1"
				in:slide={{ duration: 500, axis: 'x', easing: cubicOut }}
			></div>
		{/if}
	</svelte:element>
{/if}
