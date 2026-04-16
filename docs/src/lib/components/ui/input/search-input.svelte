<script lang="ts">
	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';
	import { Input } from './';
	import { cn } from '$utils';
	import { type WithElementRef } from 'bits-ui';
	import type { HTMLInputAttributes, HTMLInputTypeAttribute, ClassValue } from 'svelte/elements';
	import * as Tooltip from '$ui/tooltip';

	type InputType = Exclude<HTMLInputTypeAttribute, 'file'>;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, 'type'> &
			({ type: 'file'; files?: FileList } | { type?: InputType; files?: undefined })
	> & {
		wrapperClass?: ClassValue;
	};

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		wrapperClass,
		...restProps
	}: Props = $props();

	const hasValue = $derived.by(() => {
		if (value == null) return false;
		return String(value).length > 0;
	});
</script>

<div class={cn('relative w-full', wrapperClass)}>
	<Input
		bind:ref
		bind:value
		type="search"
		placeholder="Search..."
		autocomplete="off"
		spellcheck="false"
		class={cn('peer truncate pr-8 pl-8', className)}
		{...restProps}
	/>
	<SearchIcon
		class="text-muted-foreground peer-hover:text-foreground peer-focus-visible:text-foreground pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 transition-colors"
	/>
	{#if hasValue}
		<Tooltip.Root>
			<Tooltip.Trigger
				onclick={() => (value = '')}
				class="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 transition-colors"
			>
				<XIcon class="size-4" />
			</Tooltip.Trigger>
			<Tooltip.Content>Clear Search</Tooltip.Content>
		</Tooltip.Root>
	{/if}
</div>
