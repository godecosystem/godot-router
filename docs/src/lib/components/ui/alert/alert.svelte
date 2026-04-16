<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { cn } from '$utils';

	import Info from '@lucide/svelte/icons/info';
	import Lightbulb from '@lucide/svelte/icons/lightbulb';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import OctagonAlert from '@lucide/svelte/icons/octagon-alert';

	const Icons = {
		note: { icon: Info, class: 'dark:text-blue-400 text-blue-600' },
		tip: { icon: Lightbulb, class: 'dark:text-green-400 text-green-600' },
		warning: { icon: TriangleAlert, class: 'dark:text-yellow-400 text-yellow-600' },
		caution: { icon: OctagonAlert, class: 'dark:text-red-400 text-red-600' }
	};

	interface Props {
		class?: ClassValue;
		children?: Snippet;
		title?: string;
		icon?: Component;
		type: keyof typeof Icons;
	}

	let { class: className, children, title, icon, type }: Props = $props();

	const Icon: Component = $derived(icon ?? Icons[type].icon);
	const Title: string = $derived(title ?? type.charAt(0).toUpperCase() + type.slice(1));
</script>

<div
	role="alert"
	class={cn(
		'grid gap-1 rounded-lg border border-current/25 bg-current/5 fill-current p-4',
		Icons[type].class,
		className
	)}
>
	<div class="flex items-center gap-2 font-medium text-inherit">
		<Icon class="size-[1em] stroke-[2.5]"></Icon>
		{Title}
	</div>
	<p class="leading-8">{@render children?.()}</p>
</div>
