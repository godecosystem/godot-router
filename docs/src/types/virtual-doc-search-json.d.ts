declare module 'virtual:doc-search-json' {
	import type { DocsManifestData } from '$lib/docs/server/types';

	const searchJsonData: DocsManifestData;
	export default searchJsonData;
}
