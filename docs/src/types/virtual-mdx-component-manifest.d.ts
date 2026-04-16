declare module 'virtual:mdx-component-manifest' {
	import type { Component } from 'svelte';

	type ModuleExport = {
		default?: Component<any>;
	};

	const manifest: Record<string, ModuleExport | undefined>;
	export default manifest;
}
