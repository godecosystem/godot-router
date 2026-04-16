<script lang="ts">
	import Link from '$ui/link';
	import Logo from '$components/logo';
	import siteConfig from '$lib/configuration/site.config';
</script>

<Link
	href="/docs"
	class="hover:text-accent flex items-center gap-2 justify-self-start text-lg font-bold transition-colors"
>
	<Logo class="size-8" />
	{siteConfig.name}
</Link>
