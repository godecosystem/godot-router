<script lang="ts">
	import * as Sidebar from '$ui/sidebar';
	import { cn } from '$utils';
	import * as TOC from '$ui/table-of-contents';
	import Button from '$ui/button';

	import CircleArrowUpIcon from '@lucide/svelte/icons/circle-arrow-up';

	const toc = TOC.getTOCContext();
</script>

<Sidebar.Root
	class={cn(
		'border-l-[length:var(--b-width)] [--b-width:1px]',
		'transition-[margin-right,opacity,visibility] duration-300 xl:transition-[margin-right,opacity]',
		'-mr-[calc(16rem+var(--b-width))] xl:mr-0',
		'overflow-hidden xl:overflow-y-auto',
		'invisible xl:visible',
		'opacity-0 xl:opacity-100',
		'bg-background top-docs-header h-[calc(100dvh-var(--spacing-docs-header))]'
	)}
>
	<Sidebar.Container>
		<Sidebar.Header />
		<Sidebar.Content>
			{#if toc.tocEntries.length > 0}
				<TOC.Nav>
					<TOC.Label />
					<TOC.List />
				</TOC.Nav>
			{/if}
		</Sidebar.Content>
		<Sidebar.Footer>
			<Button
				variant="ghost"
				class="justify-start"
				onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			>
				<CircleArrowUpIcon />
				<span>Back to top</span>
			</Button>
		</Sidebar.Footer>
	</Sidebar.Container>
</Sidebar.Root>
