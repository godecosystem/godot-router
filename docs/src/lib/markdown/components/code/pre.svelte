<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { CopyButtonTooltip } from '$ui/copy-button';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$utils';

	type Props = WithElementRef<HTMLAttributes<HTMLPreElement>> & {
		language?: string;
		hasCode?: boolean;
		lineNumbersMaxDigits?: number;
	};

	let {
		ref = $bindable(null),
		children,
		language = '',
		hasCode = false,
		lineNumbersMaxDigits = 1,
		class: className,
		...restProps
	}: Props = $props();

	let scrollbarWidth = $state(0);

	$effect(() => {
		if (ref) {
			scrollbarWidth = ref.offsetWidth - ref.clientWidth;
		}
	});
</script>

<div class="group relative">
	<pre
		bind:this={ref}
		data-language={language}
		class={cn(
			'scrollbar-thin bg-secondary max-h-96 overflow-auto py-4 text-sm focus-visible:ring-0',
			className
		)}
		style="--lineNumbersMaxDigits: {lineNumbersMaxDigits}ch;"
		{...restProps}>{@render children?.()}</pre>
	{#if language || hasCode}
		<div
			class="bg-secondary/50 pointer-events-none absolute top-0 flex items-center gap-1 p-1 transition-[background-color] group-hover:bg-transparent"
			style="right: {scrollbarWidth}px;"
		>
			{#if language}
				<span class="p-1 text-xs transition-opacity group-hover:opacity-0">
					.{language}
				</span>
			{/if}
			{#if hasCode}
				<CopyButtonTooltip
					class="pointer-events-auto"
					content={() => ref?.textContent?.trim() ?? ''}
				/>
			{/if}
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "$css";

	:global {
		code[data-theme*=' '],
		code[data-theme*=' '] span {
			color: var(--shiki-light);
		}

		.dark code[data-theme*=' '],
		.dark code[data-theme*=' '] span {
			color: var(--shiki-dark);
		}

		[data-rehype-pretty-code-figure] {
			@apply has-[pre:focus-visible]:ring-accent/50 has-[pre:focus-visible]:border-accent overflow-hidden rounded-md border shadow-xs transition-[border-color,box-shadow] has-[pre:focus-visible]:ring-2;
		}
		[data-rehype-pretty-code-title] {
			@apply bg-primary border-b p-2 text-sm font-bold;
		}
		[data-rehype-pretty-code-caption] {
			@apply text-muted-foreground bg-primary border-t p-2 text-sm;
		}
		[data-line] {
			@apply inline-block px-4 hover:bg-[color-mix(in_oklch,currentColor,transparent_90%)];
		}
		[data-line].diff.remove {
			@apply bg-red-500/10 opacity-75 hover:bg-[color-mix(in_oklch,var(--color-red-500),transparent_80%)];
		}
		[data-line].diff.add {
			@apply bg-green-500/10 hover:bg-[color-mix(in_oklch,var(--color-green-500),transparent_80%)];
		}
		[data-line-numbers] {
			counter-reset: line;
		}
		[data-line-numbers] > [data-line] {
			@apply pl-0;
		}
		[data-line-numbers] > [data-line]::before {
			counter-increment: line;
			content: counter(line);
			@apply text-muted-foreground/75;
		}
		[data-line-numbers-max-digits] {
			& > [data-line]:hover::before {
				@apply text-foreground bg-[color-mix(in_oklch,currentColor,transparent_90%)];
			}
			& > [data-line]::before {
				width: calc(var(--lineNumbersMaxDigits) + 2rem);
				@apply bg-secondary sticky left-0 mr-4 inline-block border-r px-4 text-right;
			}
		}
		[data-highlighted-line] {
			@apply bg-accent/10! hover:bg-[color-mix(in_oklch,var(--color-accent),transparent_80%)]!;
		}
	}
</style>
