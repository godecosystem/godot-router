<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import FileIcon from '@lucide/svelte/icons/file';
	import { getTreeLevel } from './tree-context.svelte';

	type Props = {
		name: string;
	} & HTMLAttributes<HTMLLIElement>;

	let { name }: Props = $props();

	const treeLevelCtx = getTreeLevel();
</script>

<li
	class="text-muted-foreground hover:text-foreground hover:bg-primary peer flex w-full items-center gap-2 rounded py-1 transition-colors"
	style="padding-left: {treeLevelCtx.level * 1.5 + 0.5}rem;"
>
	<FileIcon />
	{name}
</li>
