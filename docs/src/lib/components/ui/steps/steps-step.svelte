<script lang="ts">
	import type { Snippet } from 'svelte';
	import { StepTitle, StepBody } from './';

	type Props = {
		title: string;
		children: Snippet;
		id?: string;
	};

	let { title, children, id }: Props = $props();
</script>

<StepTitle {id}>
	{title}
</StepTitle>

<StepBody>
	{@render children?.()}
</StepBody>
