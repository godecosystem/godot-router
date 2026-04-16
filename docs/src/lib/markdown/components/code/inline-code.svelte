<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, ...restProps }: HTMLAttributes<HTMLElement> = $props();
</script>

<code
	class="bg-primary text-foreground rounded border px-1 py-0.5 text-sm shadow-xs"
	{...restProps}
>
	{@render children?.()}
</code>
