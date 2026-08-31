import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { canAccessDoc } from '$lib/docs/server/docs-access';
import { getDocsData } from '$lib/docs/server/docs-data';
export { prerender, entries } from '$lib/docs/server/docs-data';

export const GET: RequestHandler = async ({ params }) => {
	const docData = getDocsData(params.slug);

	// Add `locals` to the request parameters and replace `false` to enable authentication.
	if (!canAccessDoc(false, docData.private)) {
		throw error(404, 'Document not found');
	}

	let txt = `# ${docData.title}`;

	const metadata = docData.markdown.metadata;
	if (metadata.description) {
		txt += `\n\n> ${metadata.description}`;
	}

	const body = `${txt}\n\n${docData.markdown.content.raw}`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	});
};
