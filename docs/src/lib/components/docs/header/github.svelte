<script lang="ts">
	import docConfig from '$lib/configuration/docs.config';
	import Button from '$ui/button';
	import * as Tooltip from '$ui/tooltip';
	import { GitHub } from '$components/logo';
</script>

<Tooltip.Root>
	<Tooltip.Trigger aria-label="GitHub repository">
		{#snippet child({ props })}
			<Button href={docConfig.github} variant="ghost" size="icon" {...props}>
				<GitHub />
			</Button>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content>GitHub Repository</Tooltip.Content>
</Tooltip.Root>
