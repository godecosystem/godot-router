<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { cn } from '$utils';
	import IconManifest from 'virtual:icon-manifest';

	type Props = {
		name: string;
	} & SVGAttributes<SVGSVGElement>;

	let { name, class: className, ...restProps }: Props = $props();

	const Icon = $derived.by(() => {
		if (!(name in IconManifest)) {
			console.warn(`[icon-manifest] Icon key not found in manifest: ${name}`);
			return undefined;
		}

		return IconManifest[name];
	});
</script>

{#if Icon}
	<Icon class={cn('size-4 shrink-0', className)} {...restProps} />
{:else if /^\p{RGI_Emoji}$/v.test(name)}
	{name}
{/if}
