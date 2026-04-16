<script lang="ts">
	import { setSearch, type Search } from './search-context.svelte';
	import { SearchDialogContent } from './';
	import * as Dialog from '$ui/dialog';
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { onNavigate } from '$app/navigation';

	type Props = DialogPrimitive.RootProps & {
		onInit?: (ctx: Search) => void;
	};

	let { open = $bindable(false), onInit = () => {}, children, ...restProps }: Props = $props();

	const search = setSearch({
		getOpen: () => open,
		setOpen: (value: boolean) => (open = value) // sync state
	});

	onNavigate(() => {
		search.query = '';
		open = false;
	});

	$effect(() => {
		onInit(search);
	});
</script>

<svelte:window onkeydown={search.handleShortcutKeydown} />

<Dialog.Root bind:open {...restProps}>
	{@render children?.()}
	<SearchDialogContent />
</Dialog.Root>
