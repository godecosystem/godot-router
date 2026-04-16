import { error } from '@sveltejs/kit';
import searchJsonData from 'virtual:doc-search-json';
import type {
	NavigationGroup,
	NavigationPage,
	NavigationTab
} from '$lib/docs/client/doc-navigation-context.svelte';
import docNavigationConfig from '$lib/docs/server/navigation/doc-navigation.config';
import type { DocNavigationConfig } from '$lib/docs/server/navigation/define-doc-navigation';
import type {
	BuiltDocRecord,
	DocLayoutData,
	DocSearchItem,
	DocsManifestData
} from '$lib/docs/server/types';
import type { EntryGenerator } from '../../../routes/(docs)/[...slug=docs]/$types';

type FlatDocRecord = BuiltDocRecord & { slug: string };
type NavigationDocPage = NavigationPage & { slug: string };

function getAllDocRecords(): FlatDocRecord[] {
	const pages = Array.from(searchJsonData.pages.entries()).map(([slug, page]) => ({
		...page,
		slug
	}));
	return pages;
}

type DocSearchGroup = DocLayoutData['searchGroups'][number];
type ManifestTab = NavigationTab;
type ManifestGroup = NavigationGroup;

function applyPrevNextAcrossAllPages<T extends { slug: string; prev?: string; next?: string }>(
	pages: T[]
) {
	for (let i = 0; i < pages.length; i++) {
		pages[i].prev = i > 0 ? pages[i - 1]?.slug : undefined;
		pages[i].next = i < pages.length - 1 ? pages[i + 1]?.slug : undefined;
	}
}

function applyPrevNextWithinTabs<
	T extends { slug: string; tabId?: number; prev?: string; next?: string }
>(pages: T[], pagesByTab: Map<number | string, number[]>) {
	for (const indexes of pagesByTab.values()) {
		for (let i = 0; i < indexes.length; i++) {
			const current = indexes[i];
			const prev = indexes[i - 1];
			const next = indexes[i + 1];
			const prevSlug = prev === undefined ? undefined : pages[prev]?.slug;
			const nextSlug = next === undefined ? undefined : pages[next]?.slug;
			pages[current].prev = prevSlug;
			pages[current].next = nextSlug;
		}
	}
}

function applyDocPrevNext<T extends { slug: string; tabId?: number; prev?: string; next?: string }>(
	pages: T[]
) {
	const pagesByTab = new Map<number | string, number[]>();

	for (let index = 0; index < pages.length; index++) {
		const tabId = pages[index].tabId ?? '__default';
		const indexes = pagesByTab.get(tabId);
		if (indexes) {
			indexes.push(index);
		} else {
			pagesByTab.set(tabId, [index]);
		}
	}

	applyPrevNextWithinTabs(pages, pagesByTab);
}

function filterNavigationTabs(pages: NavigationPage[], tabs: ManifestTab[]): ManifestTab[] {
	const pageHrefsByTab = new Map<number, string[]>();

	for (const page of pages) {
		if (page.tabId === undefined) {
			continue;
		}

		const hrefs = pageHrefsByTab.get(page.tabId);
		if (hrefs) {
			hrefs.push(page.href);
		} else {
			pageHrefsByTab.set(page.tabId, [page.href]);
		}
	}

	return tabs
		.filter((tab) => pageHrefsByTab.has(tab.id))
		.map((tab) => ({
			...tab,
			href: pageHrefsByTab.get(tab.id)?.[0] ?? tab.href
		}));
}

function toSearchItem(page: BuiltDocRecord): DocSearchItem {
	const { metadata, content } = page.markdown;
	const title = [page.title, metadata.title ? `(${metadata.title})` : ''].filter(Boolean).join(' ');
	const description = [metadata.description, content.search].filter(Boolean).join(' ');
	const keywords = Array.from(new Set(metadata.keywords)).filter(Boolean);

	return {
		href: page.href,
		title,
		description,
		...(keywords.length ? { keywords } : {}),
		...(page.icon ? { icon: page.icon } : {})
	};
}

function toSearchItems(pages: BuiltDocRecord[]): DocSearchItem[] {
	return pages.map((page) => toSearchItem(page));
}

function createGroupedSearchGroup(
	title: string,
	pages: BuiltDocRecord[],
	icon?: string
): DocSearchGroup | null {
	const items = toSearchItems(pages);
	if (!items.length) {
		return null;
	}

	return {
		title,
		...(icon ? { icon } : {}),
		items
	};
}

function createSingleTabSearchGroups(
	tab: ManifestTab,
	tabPages: BuiltDocRecord[],
	groups: ManifestGroup[]
): DocSearchGroup[] {
	if (tab.mode === 'group') {
		return groups
			.filter((item) => item.tabId === tab.id)
			.map((group) =>
				createGroupedSearchGroup(
					group.title,
					tabPages.filter((page) => page.groupId === group.id),
					group.icon
				)
			)
			.filter((group): group is DocSearchGroup => Boolean(group));
	}

	const searchGroup = createGroupedSearchGroup(
		tab.title,
		tabPages.filter((page) => page.groupId === undefined),
		tab.icon
	);

	return searchGroup ? [searchGroup] : [];
}

function createTabSearchGroups(
	pages: BuiltDocRecord[],
	tabs: ManifestTab[],
	groups: ManifestGroup[]
): DocSearchGroup[] {
	const searchGroups: DocSearchGroup[] = [];

	for (const tab of tabs) {
		const tabPages = pages.filter((page) => page.tabId === tab.id);
		searchGroups.push(...createSingleTabSearchGroups(tab, tabPages, groups));
	}

	return searchGroups;
}

function createStandaloneGroupSearchGroups(
	pages: BuiltDocRecord[],
	groups: ManifestGroup[]
): DocSearchGroup[] {
	return groups
		.map((group) =>
			createGroupedSearchGroup(
				group.title,
				pages.filter((page) => page.groupId === group.id),
				group.icon
			)
		)
		.filter((group): group is DocSearchGroup => Boolean(group));
}

function createSearchGroups(
	pages: BuiltDocRecord[],
	tabs: ManifestTab[],
	groups: ManifestGroup[]
): DocSearchGroup[] {
	if (tabs.length) {
		return createTabSearchGroups(pages, tabs, groups);
	}

	if (groups.length) {
		return createStandaloneGroupSearchGroups(pages, groups);
	}

	const items = toSearchItems(pages);
	if (!items.length) {
		return [];
	}

	return [{ title: 'Documentation', items }];
}

export function getDocLayoutData(filter: (doc: BuiltDocRecord) => boolean = () => true) {
	const manifest: DocsManifestData = searchJsonData;
	const tabs = Array.from(manifest.tabs.entries())
		.map(([id, tab]) => ({ id, ...tab }))
		.sort((a, b) => a.id - b.id);
	const groups = Array.from(manifest.groups.entries())
		.map(([id, group]) => ({ id, ...group }))
		.sort((a, b) => a.id - b.id);
	const allManifestPages = Array.from(manifest.pages.entries()).map(([slug, page]) => ({
		...page,
		slug
	}));
	const visibleManifestPages = allManifestPages.filter((page) => filter(page));
	const visiblePages: NavigationDocPage[] = visibleManifestPages.map(
		({ markdown, filepath: _filepath, private: _private, ...page }) => ({
			...page,
			description: markdown.metadata.description,
			prev: undefined,
			next: undefined
		})
	);
	const config = docNavigationConfig as DocNavigationConfig;
	const tabNextPrevEnabled = 'tabs' in config && config.tabNextPrev === true;

	if (tabNextPrevEnabled) {
		applyPrevNextAcrossAllPages(visiblePages);
	} else {
		applyDocPrevNext(visiblePages);
	}

	const navigationTabs = filterNavigationTabs(visiblePages, tabs);
	const visibleGroupIds = new Set(
		visiblePages
			.map((page) => page.groupId)
			.filter((groupId): groupId is number => groupId !== undefined)
	);
	const navigationGroups: NavigationGroup[] = groups.filter((group) =>
		visibleGroupIds.has(group.id)
	);

	return {
		navigation: {
			tabs: navigationTabs,
			groups: navigationGroups,
			pages: visiblePages
		},
		searchGroups: createSearchGroups(visibleManifestPages, navigationTabs, navigationGroups)
	};
}

export function getPublicDocEntries() {
	const data = getAllDocRecords();

	const filtered = data.flatMap((doc) => {
		const { private: isPrivate, ...docData } = doc;
		if (isPrivate !== false) return [];
		return [docData];
	});

	return filtered;
}

export const entries: EntryGenerator = () => {
	return getPublicDocEntries().map((doc) => ({ slug: doc.slug }));
};

export function isAllPublic() {
	const allDocs = getAllDocRecords();
	return allDocs.every((doc) => doc.private === false);
}

export const prerender: true | 'auto' = isAllPublic() ? true : 'auto';

export function getDocsData(slug: string): BuiltDocRecord {
	const data = searchJsonData.pages.get(slug);

	if (!data) {
		throw error(404, 'Document not found');
	}

	return data;
}

export function getDocPageData(doc: BuiltDocRecord) {
	const { metadata, ast, imports, tableOfContents } = doc.markdown;

	if (!ast) {
		throw error(500, 'Document AST was not generated');
	}

	return {
		ast,
		imports,
		title: metadata.title ?? doc.title,
		description: metadata.description,
		tocEntries: tableOfContents
	} as const;
}
