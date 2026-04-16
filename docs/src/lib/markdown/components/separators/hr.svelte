<script lang="ts">
	import { cn } from '$utils';
	import type { ClassValue } from 'svelte/elements';

	let { class: className }: { class: ClassValue } = $props();
</script>

<hr class={cn('my-8', className)} />
