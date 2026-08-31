import type { LayoutServerLoad } from './$types';
import { canAccessDoc } from '$lib/docs/server/docs-access';
import { getDocLayoutData } from '$lib/docs/server/docs-data';

export const load: LayoutServerLoad = async () => {
	// Add `locals` to the load parameters and replace `false` to enable authentication.
	const { navigation, searchGroups } = getDocLayoutData((doc) => canAccessDoc(false, doc.private));

	return {
		navigation,
		searchGroups
	};
};
