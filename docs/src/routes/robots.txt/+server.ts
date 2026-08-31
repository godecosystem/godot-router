import type { RequestHandler } from './$types';
import siteConfig from '$lib/configuration/site.config';

export const prerender = true;

export const GET: RequestHandler = () => {
	const baseUrl = siteConfig.origin;

	const body = `User-agent: *
Disallow:

Sitemap: ${baseUrl}/sitemap.xml
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
