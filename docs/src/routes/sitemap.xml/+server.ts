import type { RequestHandler } from './$types';
import { getPublicDocEntries } from '$lib/docs/server/docs-data';
import siteConfig from '$lib/configuration/site.config';

export const prerender = true;

export const GET: RequestHandler = () => {
	const baseUrl = siteConfig.origin;
	const now = new Date().toISOString();
	const docUrls = getPublicDocEntries().map(
		(entry) =>
			`	<url>
		<loc>${baseUrl}${entry.href}</loc>
		<lastmod>${now}</lastmod>
	</url>`
	);

	const body = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>${baseUrl}</loc>
		<lastmod>${now}</lastmod>
	</url>
${docUrls.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
