<script lang="ts">
	import { cn } from '$utils';
	import type { ClassValue } from 'clsx';
	import type { SVGAttributes } from 'svelte/elements';
	import { getTOCContext } from './toc-context.svelte';

	type Props = {
		class?: ClassValue;
	} & Omit<SVGAttributes<SVGSVGElement>, 'role'>;

	let { class: className, ...restProps }: Props = $props();

	const toc = getTOCContext();

	const totalCount = $derived(toc.tocEntries.length - 1);
	const percentage = $derived.by(() => {
		if (totalCount <= 0) return 0;
		return Math.round((toc.activeIndex / totalCount) * 100);
	});

	const center = 12;
	const radius = 11;
	const circumference = $derived(2 * Math.PI * radius);
	const offset = $derived.by(() => {
		if (circumference === 0) return 0;
		return circumference * (1 - percentage / 100);
	});
</script>

<svg
	class={cn('size-4 shrink-0 -rotate-90', className)}
	viewBox="0 0 24 24"
	role="progressbar"
	aria-label="Reading progress"
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={percentage}
	aria-valuetext={`${percentage}% (${toc.activeIndex} of ${totalCount})`}
	{...restProps}
>
	<circle
		cx={center}
		cy={center}
		r={radius}
		fill="none"
		class="fill-none stroke-current/25 stroke-2"
	/>
	<circle
		cx={center}
		cy={center}
		r={radius}
		stroke-width={2}
		stroke-dasharray={circumference}
		stroke-dashoffset={offset}
		stroke-linecap="round"
		class="stroke-accent fill-none stroke-2 transition-[stroke-dashoffset] duration-500 ease-out"
	/>
</svg>
