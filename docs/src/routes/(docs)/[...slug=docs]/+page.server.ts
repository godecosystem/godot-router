import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { canAccessDoc } from '$lib/docs/server/docs-access';
import { getDocsData, getDocPageData } from '$lib/docs/server/docs-data';
export { prerender, entries } from '$lib/docs/server/docs-data';

export const load: PageServerLoad = async ({ locals, params }) => {
	const docData = getDocsData(params.slug);

	// replace `false` with `locals` for checking authentication
	if (!canAccessDoc(false, docData.private)) {
		error(404, 'Document not found');
	}

	const pageData = getDocPageData(docData);
	return pageData;
};
