<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import * as Tooltip from '$ui/tooltip';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import Button from '$ui/button';
</script>

<Tooltip.Root>
	<Tooltip.Trigger
		onclick={toggleMode}
		aria-label="Toggle theme"
		class="relative flex items-center overflow-hidden"
	>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon">
				<Sun
					class="translate-y-0 transition-[translate,opacity]! dark:translate-y-full dark:opacity-0"
				/>
				<Moon
					class="absolute -translate-y-full opacity-0 transition-[translate,opacity]! dark:translate-y-0 dark:opacity-100"
				/>
			</Button>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content>Toggle Theme</Tooltip.Content>
</Tooltip.Root>
