<script lang="ts">
	import { cn } from '$utils';
	import type { ClassValue } from 'clsx';
	import type { HTMLAttributes } from 'svelte/elements';
	import TableOfContentsIcon from '@lucide/svelte/icons/table-of-contents';

	type Props = {
		class?: ClassValue;
	} & HTMLAttributes<HTMLDivElement>;

	let { class: className, ...restProps }: Props = $props();
</script>

<div class={cn('flex items-center gap-2 text-sm', className)} {...restProps}>
	<TableOfContentsIcon class="size-4 shrink-0" />
	On this page
</div>
