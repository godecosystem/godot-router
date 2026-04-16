// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Component } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';

declare module 'virtual:icon-manifest' {
	const manifest: Record<string, Component<SVGAttributes<SVGSVGElement>> | undefined>;
	export default manifest;
}

declare global {
	namespace App {
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
