declare module 'virtual:icon-manifest' {
	import type { Component } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';

	const manifest: Record<string, Component<SVGAttributes<SVGSVGElement>> | undefined>;
	export default manifest;
}
