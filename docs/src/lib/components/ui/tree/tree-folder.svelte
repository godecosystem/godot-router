<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import * as Collapsible from '$ui/collapsible';
	import FolderClosedIcon from '@lucide/svelte/icons/folder-closed';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import { setTreeLevel, getTreeLevel, getTreeOpen } from './tree-context.svelte';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	type Props = {
		open?: boolean;
		name: string;
		noInteraction?: boolean;
	} & HTMLAttributes<HTMLLIElement>;

	let { open = $bindable(false), name, noInteraction = false, children }: Props = $props();

	const treeLevelCtx = getTreeLevel();
	setTreeLevel(treeLevelCtx.level + 1);

	const treeOpenCtx = getTreeOpen();

	if (treeOpenCtx.open !== null) open = treeOpenCtx.open;
	if (treeOpenCtx.noInteraction) noInteraction = true;

	$effect.pre(() => {
		if (treeOpenCtx.open !== null) {
			open = treeOpenCtx.open;
		}
	});

	$effect.pre(() => {
		if (open !== treeOpenCtx.open && treeOpenCtx.open !== null) {
			treeOpenCtx.clear();
		}
	});
</script>

<Collapsible.Root
	bind:open={
		() => open,
		(v: boolean) => {
			if (!noInteraction) open = v;
		}
	}
	data-level={treeLevelCtx.level}
>
	<Collapsible.Trigger
		class={[
			'peer group text-muted-foreground hover:text-foreground hover:bg-primary flex w-full items-center gap-2 rounded py-1 pr-2 transition-colors',
			noInteraction ? 'cursor-not-allowed' : ''
		]}
		style="padding-left: {treeLevelCtx.level * 1.5 + 0.5}rem;"
	>
		<ChevronRightIcon class="transition-[rotate] group-data-[state=open]:rotate-90" />
		{#if open}
			<FolderOpenIcon />
		{:else}
			<FolderClosedIcon />
		{/if}
		{name}
	</Collapsible.Trigger>
	<Collapsible.Content class="peer-hover:*:data-tree-border:bg-muted-foreground relative">
		{#snippet child({ props })}
			<ul {...props}>
				{@render children?.()}
				<div
					data-tree-border
					class="bg-border peer-hover:bg-muted-foreground absolute top-0 bottom-0 w-px transition-[background-color]"
					style="left: {treeLevelCtx.level * 1.5 + 1}rem;"
				></div>
			</ul>
		{/snippet}
	</Collapsible.Content>
</Collapsible.Root>
