<script lang="ts">
	import * as Dialog from '$ui/dialog';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { SEARCH_KEYBOARD_SHORTCUT } from './search-context.svelte';
	import { cn } from '$utils';
	import { Dialog as DialogPrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DialogPrimitive.TriggerProps = $props();
</script>

<Dialog.Trigger
	bind:ref
	class={cn(
		'group bg-secondary hover:border-accent/50 hover:bg-muted isolate hidden w-full items-center gap-2 rounded-full border px-2 py-1 text-xs font-medium shadow-md transition-[color,box-shadow,border-color] md:flex',
		className
	)}
	{...restProps}
>
	<SearchIcon
		class="text-muted-foreground group-hover:text-foreground group-focus-visible:text-foreground size-4 shrink-0 transition-[color]"
	/>
	<span
		class="text-muted-foreground group-hover:text-foreground group-focus-visible:text-foreground transition-[color]"
	>
		Search...
	</span>
	<div class="text-muted-foreground ml-auto flex items-center gap-0.5">
		<kbd>{navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl'}</kbd>
		<kbd>{SEARCH_KEYBOARD_SHORTCUT}</kbd>
	</div>
</Dialog.Trigger>
