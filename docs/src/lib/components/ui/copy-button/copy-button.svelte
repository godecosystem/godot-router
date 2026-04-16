<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import type { ButtonProps } from '$ui/button';

	export type CopyButtonChildSnippetProps = { copied: boolean };

	export type CopyButtonProps = Omit<ButtonProps, 'children'> & {
		class?: ClassValue;
		content: string | (() => string | Promise<string>);
		timeout?: number;
		copied?: boolean;
		children?: Snippet<[CopyButtonChildSnippetProps]>;
	};
</script>

<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { Button } from '$ui/button';

	let {
		class: className,
		content,
		timeout = 3000,
		copied = $bindable(false),
		variant = 'outline',
		size = 'default',
		children,
		...restProps
	}: CopyButtonProps = $props();

	async function copyToClipboard() {
		if (copied) return;

		try {
			const textToCopy = typeof content === 'function' ? await content() : content;
			await navigator.clipboard.writeText(textToCopy);
			if (timeout > 0) {
				copied = true;
				setTimeout(() => (copied = false), timeout);
			}
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	}
</script>

<Button onclick={copyToClipboard} {variant} {size} class={className} {...restProps}>
	{#if children}
		{@render children({ copied })}
	{:else if copied}
		<CheckIcon />
		Copied!
	{:else}
		<CopyIcon />
		Copy
	{/if}
</Button>
