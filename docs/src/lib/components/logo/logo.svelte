<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$utils';

	let { class: className, ...restProps }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	height="16"
	width="16"
	viewBox="0 0 64 64"
	class={cn('shrink-0', className)}
	{...restProps}
>
	<rect x="8" y="8" width="48" height="48" rx="8" class="fill-accent" />
	<rect x="14" y="28" width="36" height="8" rx="4" fill="white" />
	<circle cx="32" cy="32" r="8" fill="white" />
</svg>
