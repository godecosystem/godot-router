export type AiProviderLink = {
	id: 'chatgpt' | 'claude';
	name: string;
	buildUrl: (prompt: string) => URL;
};

export const aiProviderLinks: AiProviderLink[] = [
	{
		id: 'chatgpt',
		name: 'ChatGPT',
		buildUrl: (prompt) => new URL(`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`)
	},
	{
		id: 'claude',
		name: 'Claude',
		buildUrl: (prompt) => new URL(`https://claude.ai/new?q=${encodeURIComponent(prompt)}`)
	}
];

export function getMarkdownPageUrl(pageUrl: URL): URL {
	const markdownUrl = new URL(pageUrl);
	const pathname = markdownUrl.pathname.replace(/\/$/, '');
	markdownUrl.pathname = pathname.endsWith('.md') ? pathname : `${pathname}.md`;
	markdownUrl.search = '';
	markdownUrl.hash = '';
	return markdownUrl;
}

export function getAiProviderUrl(provider: AiProviderLink, pageUrl: URL): URL {
	const prompt = `Read and explain this docs page: ${getMarkdownPageUrl(pageUrl).href}`;
	const providerUrl = provider.buildUrl(prompt);

	if (providerUrl.protocol !== 'https:') {
		throw new Error(`AI provider URLs must use HTTPS: ${provider.name}`);
	}

	return providerUrl;
}
