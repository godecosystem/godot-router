<script lang="ts">
	import { mergeProps } from 'bits-ui';
	import * as Tooltip from '$ui/tooltip';
	import CopyButton from './copy-button.svelte';
	import type { CopyButtonProps } from './copy-button.svelte';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CheckIcon from '@lucide/svelte/icons/check';

	type Props = CopyButtonProps;

	let {
		class: className,
		content,
		timeout = 3000,
		variant = 'outline',
		size = 'icon-sm',
		children,
		...restProps
	}: Props = $props();

	let copied = $state(false);
</script>

<Tooltip.Root>
	<Tooltip.Trigger class={className}>
		{#snippet child({ props })}
			{@const { onclick, ...mergedProps } = mergeProps(props, restProps)}
			<CopyButton {content} {timeout} {variant} {size} {...mergedProps} bind:copied>
				{#if children}
					{@render children({ copied })}
				{:else if copied}
					<CheckIcon />
				{:else}
					<CopyIcon />
				{/if}
			</CopyButton>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content>
		{#if copied}
			Copied!
		{:else}
			Copy to clipboard
		{/if}
	</Tooltip.Content>
</Tooltip.Root>
