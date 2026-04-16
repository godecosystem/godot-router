import type { DocPrivateAccess } from '$lib/docs/server/navigation/define-doc-navigation';
import type {
	DocNavigationParams,
	NavigationGroup,
	NavigationPage,
	NavigationTab
} from '$lib/docs/client/doc-navigation-context.svelte';
import type { MarkdownAstResult } from '$lib/docs/server/types/markdown';

export type DocSearchItem = {
	href: string;
	title: string;
	description: string;
	keywords?: string[];
	icon?: string;
};

export type ManifestNavigationPage = NavigationPage & {
	slug: string;
	filepath: string;
	title: string;
	icon?: string;
	private: DocPrivateAccess | false;
};

export type BuiltDocRecord = ManifestNavigationPage & {
	markdown: MarkdownAstResult;
};

export type DocsManifestData = {
	tabs: Map<number, Omit<NavigationTab, 'id'>>;
	groups: Map<number, Omit<NavigationGroup, 'id'>>;
	pages: Map<string, BuiltDocRecord>;
};

export type DocLayoutData = {
	navigation: DocNavigationParams;
	searchGroups: Array<{
		title: string;
		icon?: string;
		items: DocSearchItem[];
	}>;
};
