<script lang="ts">
	import { cn } from '$utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, class: className, ...restProps }: HTMLAttributes<HTMLLIElement> = $props();
</script>

<li class={cn('pl-2', className)} {...restProps}>
	{@render children?.()}
</li>

<style lang="postcss">
	@reference "$css";

	:global {
		li.task-list-item {
			@apply -ml-6.5 list-none;

			input[type='checkbox'] {
				@apply mr-2;
			}
		}
	}
</style>
