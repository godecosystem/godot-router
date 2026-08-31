import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { canAccessDoc } from '$lib/docs/server/docs-access';
import { getDocsData, getDocPageData } from '$lib/docs/server/docs-data';
export { prerender, entries } from '$lib/docs/server/docs-data';

export const load: PageServerLoad = async ({ params }) => {
	const docData = getDocsData(params.slug);

	// Add `locals` to the load parameters and replace `false` to enable authentication.
	if (!canAccessDoc(false, docData.private)) {
		error(404, 'Document not found');
	}

	const pageData = getDocPageData(docData);
	return pageData;
};
