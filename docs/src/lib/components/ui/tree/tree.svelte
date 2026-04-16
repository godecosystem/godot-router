<script lang="ts">
	import { cn } from '$utils';
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setTreeLevel, setTreeOpen } from './tree-context.svelte';
	import Button from '$ui/button';

	type Props = {
		open?: boolean | null;
		toolbar?: boolean;
		noInteraction?: boolean;
	} & WithElementRef<HTMLAttributes<HTMLUListElement>>;

	let {
		ref = $bindable(null),
		open = $bindable(null),
		noInteraction = false,
		toolbar = false,
		class: className,
		children,
		...restProps
	}: Props = $props();

	setTreeLevel();
	setTreeOpen({
		getOpen: () => open,
		setOpen: (value) => (open = value),
		getNoInteraction: () => noInteraction
	});
</script>

<div class="overflow-hidden rounded-md border">
	{#if toolbar}
		<div class="scrollbar-thin max-h-96 overflow-auto">
			<div
				class="bg-secondary sticky top-0 z-1 flex items-center gap-2 px-2 pt-2 text-sm font-medium"
			>
				<Button variant="outline" size="sm" onclick={() => (open = true)}>Expand All</Button>
				<Button variant="outline" size="sm" onclick={() => (open = false)}>Collapse All</Button>
			</div>
			{@render tree()}
		</div>
	{:else}
		{@render tree('max-h-96 overflow-auto scrollbar-thin')}
	{/if}
</div>

{#snippet tree(cls?: string)}
	<ul class={cn('bg-secondary p-4 [&_svg]:size-4 [&_svg]:shrink-0', cls, className)} {...restProps}>
		{@render children?.()}
	</ul>
{/snippet}
