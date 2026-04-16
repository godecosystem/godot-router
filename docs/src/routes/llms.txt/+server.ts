import type { RequestHandler } from './$types';
import { getPublicDocEntries } from '$lib/docs/server/docs-data';
import siteConfig from '$lib/configuration/site.config';

export const prerender = true;

export const GET: RequestHandler = () => {
	const baseUrl = siteConfig.origin;

	const publicDocs = getPublicDocEntries().map((entry) => {
		let txt = `- [${entry.title}](${baseUrl}${entry.href}.md)`;
		const metadata = entry.markdown.metadata;
		if (metadata.description) {
			txt += `: ${metadata.description}`;
		}
		return txt;
	});

	const body = `# ${siteConfig.name}
> ${siteConfig.description}

## Documents
${publicDocs.join('\n')}
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
