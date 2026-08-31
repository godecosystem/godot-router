import { describe, expect, test } from 'bun:test';
import {
	aiProviderLinks,
	getAiProviderUrl,
	getMarkdownPageUrl,
	type AiProviderLink
} from './ai-provider-links';

describe('getMarkdownPageUrl', () => {
	test('preserves a deployment base path and removes query and fragment data', () => {
		const pageUrl = new URL(
			'https://example.com/SvelDocs/docs/getting-started/?view=compact#install'
		);

		expect(getMarkdownPageUrl(pageUrl).href).toBe(
			'https://example.com/SvelDocs/docs/getting-started.md'
		);
	});

	test('does not duplicate an existing markdown suffix', () => {
		const pageUrl = new URL('https://example.com/docs/introduction.md');

		expect(getMarkdownPageUrl(pageUrl).href).toBe('https://example.com/docs/introduction.md');
	});
});

describe('getAiProviderUrl', () => {
	test.each(aiProviderLinks)('encodes the markdown URL for $name', (provider) => {
		const providerUrl = getAiProviderUrl(
			provider,
			new URL('https://example.com/docs/caf%C3%A9 guide')
		);
		const prompt = providerUrl.searchParams.get(provider.name === 'Gemini' ? 'prompt' : 'q');

		expect(prompt).toBe(
			'Read and explain this docs page: https://example.com/docs/caf%C3%A9%20guide.md'
		);
	});

	test('rejects providers that do not use HTTPS', () => {
		const provider: AiProviderLink = {
			id: 'chatgpt',
			name: 'Unsafe',
			buildUrl: () => new URL('http://example.com')
		};

		expect(() => getAiProviderUrl(provider, new URL('https://example.com/docs'))).toThrow(
			'AI provider URLs must use HTTPS: Unsafe'
		);
	});
});
