<script lang="ts">
	import SEO from '$components/seo';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { page } from '$app/state';
	import { Link } from '$ui/link';
	import BlueprintRenderer from '$lib/markdown/renderer';
	import { getDocNavigationContext } from '$lib/docs/client/doc-navigation-context.svelte';
	import type { Component } from 'svelte';
	import mdxComponentManifest from 'virtual:mdx-component-manifest';
	import GridPattern from '$components/docs/patterns/grid-pattern.svelte';
	import { CopyButton } from '$ui/copy-button';
	import ButtonGroup from '$ui/button-group';
	import Button from '$ui/button';
	import { getTOCContext } from '$ui/table-of-contents';
	import type { Root as HastRoot } from 'hast';
	import type { Snippet } from 'svelte';

	type PageData = {
		ast: HastRoot;
		imports?: Record<string, string>;
		title: string;
		description?: string;
		tocEntries?: Array<{ id: string; text: string; level: number }>;
	};

	let { data }: { data: PageData } = $props();

	const componentImports = $derived(data.imports ?? {});

	type MdxModule = Record<string, unknown> & { default?: unknown };
	type MdxManifest = Record<string, MdxModule | undefined>;

	const resolvedMdxComponents = $derived.by(() => {
		const resolved: Record<string, unknown> = {};
		const manifest = mdxComponentManifest as MdxManifest;

		for (const [name, source] of Object.entries(componentImports)) {
			const module = manifest[source];
			if (!module) continue;

			const componentExport = module[name];
			if (typeof componentExport === 'function') {
				resolved[name] = componentExport as Component<any>;
			}

			if (!resolved[name] && typeof module.default === 'function') {
				resolved[name] = module.default as Component<any>;
			}

			// Keep the full module for namespace lookups like Steps.Root.
			resolved[`$module:${name}`] = module;
		}

		return resolved;
	});

	const docNavigation = getDocNavigationContext();
	const toc = getTOCContext();

	let mdCopied = $state(false);

	type AiProvider = {
		name: string;
		urlPrefix: string;
		icon: Snippet;
	};

	const aiProviders: AiProvider[] = [
		{ name: 'ChatGPT', urlPrefix: 'https://chatgpt.com/?q=', icon: ChatGptIcon },
		{ name: 'Claude', urlPrefix: 'https://claude.ai/new?q=', icon: ClaudeIcon },
		{ name: 'Gemini', urlPrefix: 'https://gemini.google.com/app?prompt=', icon: GeminiIcon }
	];

	function getAiProviderHref(urlPrefix: string) {
		const prompt = `Read and explain this docs page: ${page.url.href}.md`;
		return `${urlPrefix}${encodeURIComponent(prompt)}`;
	}

	async function getPageMarkdown() {
		const response = await fetch(`${page.url.pathname}.md`);

		if (!response.ok) {
			throw new Error('Failed to fetch markdown');
		}

		return response.text();
	}
</script>

<SEO title={data.title} description={data.description} type="article" />

<GridPattern
	class="absolute top-0 left-1/2 -z-1 h-64 w-7xl -translate-x-1/2 mask-[radial-gradient(ellipse_at_center,black,transparent)] opacity-50"
	width={40}
	height={40}
	strokeDashArray="4 2"
/>

{#snippet ChatGptIcon()}
	<svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<title>OpenAI</title>
		<path
			d="M21.55 10.004a5.416 5.416 0 00-.478-4.501c-1.217-2.09-3.662-3.166-6.05-2.66A5.59 5.59 0 0010.831 1C8.39.995 6.224 2.546 5.473 4.838A5.553 5.553 0 001.76 7.496a5.487 5.487 0 00.691 6.5 5.416 5.416 0 00.477 4.502c1.217 2.09 3.662 3.165 6.05 2.66A5.586 5.586 0 0013.168 23c2.443.006 4.61-1.546 5.361-3.84a5.553 5.553 0 003.715-2.66 5.488 5.488 0 00-.693-6.497v.001zm-8.381 11.558a4.199 4.199 0 01-2.675-.954c.034-.018.093-.05.132-.074l4.44-2.53a.71.71 0 00.364-.623v-6.176l1.877 1.069c.02.01.033.029.036.05v5.115c-.003 2.274-1.87 4.118-4.174 4.123zM4.192 17.78a4.059 4.059 0 01-.498-2.763c.032.02.09.055.131.078l4.44 2.53c.225.13.504.13.73 0l5.42-3.088v2.138a.068.068 0 01-.027.057L9.9 19.288c-1.999 1.136-4.552.46-5.707-1.51h-.001zM3.023 8.216A4.15 4.15 0 015.198 6.41l-.002.151v5.06a.711.711 0 00.364.624l5.42 3.087-1.876 1.07a.067.067 0 01-.063.005l-4.489-2.559c-1.995-1.14-2.679-3.658-1.53-5.63h.001zm15.417 3.54l-5.42-3.088L14.896 7.6a.067.067 0 01.063-.006l4.489 2.557c1.998 1.14 2.683 3.662 1.529 5.633a4.163 4.163 0 01-2.174 1.807V12.38a.71.71 0 00-.363-.623zm1.867-2.773a6.04 6.04 0 00-.132-.078l-4.44-2.53a.731.731 0 00-.729 0l-5.42 3.088V7.325a.068.068 0 01.027-.057L14.1 4.713c2-1.137 4.555-.46 5.707 1.513.487.833.664 1.809.499 2.757h.001zm-11.741 3.81l-1.877-1.068a.065.065 0 01-.036-.051V6.559c.001-2.277 1.873-4.122 4.181-4.12.976 0 1.92.338 2.671.954-.034.018-.092.05-.131.073l-4.44 2.53a.71.71 0 00-.365.623l-.003 6.173v.002zm1.02-2.168L12 9.25l2.414 1.375v2.75L12 14.75l-2.415-1.375v-2.75z"
		></path>
	</svg>
{/snippet}

{#snippet ClaudeIcon()}
	<svg
		viewBox="0 0 24 24"
		fill="currentColor"
		xmlns="http://www.w3.org/2000/svg"
		class="size-4.5"
		aria-hidden="true"
	>
		<path
			d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"
		/>
	</svg>
{/snippet}

{#snippet GeminiIcon()}
	<svg
		viewBox="0 0 24 24"
		fill="currentColor"
		xmlns="http://www.w3.org/2000/svg"
		class="size-4.5"
		aria-hidden="true"
	>
		<path
			d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"
		/>
	</svg>
{/snippet}

<article class="grow">
	<header class="flex flex-col items-start gap-2">
		{#if docNavigation.currentGroup}
			<span class="text-accent text-sm font-medium">{docNavigation.currentGroup.title}</span>
		{/if}
		<h1 class="text-3xl font-extrabold sm:text-4xl">{data.title}</h1>
		{#if data.description}
			<p class="text-muted-foreground sm:text-lg">{data.description}</p>
		{/if}
		<ButtonGroup>
			<CopyButton bind:copied={mdCopied} content={getPageMarkdown} size="sm" class="bg-secondary">
				{#snippet children({ copied })}
					{#if copied}
						<CheckIcon />
						Page Copied!
					{:else}
						<CopyIcon />
						Copy Page
					{/if}
				{/snippet}
			</CopyButton>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="bg-secondary data-[state=open]:text-foreground data-[state=open]:bg-primary group"
				>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="icon-sm" aria-label="More Options">
							<ChevronDownIcon
								class="transition-[translate] group-data-[state=open]:translate-y-px"
							/>
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					class="[&>[data-slot=dropdown-menu-item]>svg]:size-7.5 [&>[data-slot=dropdown-menu-item]>svg]:rounded-md [&>[data-slot=dropdown-menu-item]>svg]:border [&>[data-slot=dropdown-menu-item]>svg]:p-1.5"
				>
					<DropdownMenu.Item>
						{#snippet child({ props })}
							{@const { onclick, ...restProps } = props}
							<CopyButton bind:copied={mdCopied} content={getPageMarkdown} unstyled {...restProps}>
								{#snippet children({ copied })}
									{#if copied}
										<CheckIcon />
									{:else}
										<CopyIcon />
									{/if}

									<div class="flex flex-col items-start">
										{#if copied}
											Page Copied!
										{:else}
											Copy Page
										{/if}
										<span class="text-muted-foreground text-xs">Copy page as Markdown for LLMs</span
										>
									</div>
								{/snippet}
							</CopyButton>
						{/snippet}
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						{#snippet child({ props })}
							<Link href={`/${page.params.slug!.replace(/\/$/, '')}.md`} target="_blank" {...props}>
								<svg
									width="18"
									height="18"
									viewBox="0 0 18 18"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									stroke="currentColor"
									stroke-width="1.5"
								>
									<path
										d="M15.25 3.75H2.75C1.64543 3.75 0.75 4.64543 0.75 5.75V12.25C0.75 13.3546 1.64543 14.25 2.75 14.25H15.25C16.3546 14.25 17.25 13.3546 17.25 12.25V5.75C17.25 4.64543 16.3546 3.75 15.25 3.75Z"
									></path>
									<path d="M8.75 11.25V6.75H8.356L6.25 9.5L4.144 6.75H3.75V11.25"></path>
									<path d="M11.5 9.5L13.25 11.25L15 9.5"></path>
									<path d="M13.25 11.25V6.75"></path>
								</svg>
								<div class="flex flex-col">
									<div class="flex items-center gap-1">
										View as Markdown
										<ArrowUpRightIcon class="text-muted-foreground size-3 shrink-0" />
									</div>
									<span class="text-muted-foreground text-xs">View this page as plain text</span>
								</div>
							</Link>
						{/snippet}
					</DropdownMenu.Item>
					{#each aiProviders as provider (provider.name)}
						<DropdownMenu.Item>
							{#snippet child({ props })}
								<Link
									href={getAiProviderHref(provider.urlPrefix)}
									target="_blank"
									rel="noreferrer"
									{...props}
								>
									{@render provider.icon()}
									<div class="flex flex-col">
										<div class="flex items-center gap-1">
											Open in {provider.name}
											<ArrowUpRightIcon class="text-muted-foreground size-3 shrink-0" />
										</div>
										<span class="text-muted-foreground text-xs">Search with this page URL</span>
									</div>
								</Link>
							{/snippet}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</ButtonGroup>
	</header>

	<hr class="border-border my-4" />

	<div
		{@attach toc.attachContainerElement}
		class="**:[[id]]:scroll-mt-[max(calc(var(--spacing-docs-header)+var(--spacing-docs-content-header)+1.5rem),25dvh)] [&>*:not([class*='mt-']):not([class*='my-']):not([class*='m-'])]:mt-4"
	>
		{#each data.ast.children ?? [] as node, i (`node-${i}`)}
			<BlueprintRenderer {node} resolvedComponents={resolvedMdxComponents} />
		{/each}
	</div>
</article>
