import config from '../../src/lib/docs/server/navigation/doc-navigation.config';
import path from 'node:path';
import type {
	DocPrivateAccess,
	DocGroup,
	DocPage,
	DocTab,
	PageItems
} from '../../src/lib/docs/server/navigation/define-doc-navigation';
import type {
	NavigationGroup,
	NavigationTab
} from '../../src/lib/docs/client/doc-navigation-context.svelte';
import type { ManifestNavigationPage } from '../../src/lib/docs/server/types';
import { toPosixPath } from './utils';

type NavigationTabMapItem = Omit<NavigationTab, 'id'>;
type NavigationGroupMapItem = Omit<NavigationGroup, 'id'>;

export class DocEntries {
	private readonly rawMarkdownByPath: Record<string, string>;
	private readonly markdownFolderPath: string;

	// hold tabs, groups, and pages in separate maps for easy lookup and to maintain insertion order
	public readonly tabs = new Map<number, NavigationTabMapItem>();
	public readonly groups = new Map<number, NavigationGroupMapItem>();
	public readonly pages = new Map<string, ManifestNavigationPage>();

	// counters to generate unique IDs for tabs and groups
	private nextTabId = 0;
	private nextGroupId = 0;

	public constructor(rawMarkdownByPath: Record<string, string>, markdownFolderPath: string) {
		this.rawMarkdownByPath = rawMarkdownByPath;
		this.markdownFolderPath = markdownFolderPath;
		this.collectTabs();
		this.collectGroups();
		this.collectPages();
	}

	private normalizeSegment(value: string): string {
		return value
			.trim()
			.toLowerCase()
			.replaceAll(/[^a-z0-9\s-]/g, '')
			.replaceAll(/\s+/g, '-')
			.replaceAll(/-+/g, '-');
	}

	private trimSlashes(value: string | null | undefined): string {
		return (value ?? '').replaceAll(/^\/+|\/+$/g, '');
	}

	private normalizePathInput(value: string | null | undefined): string {
		const raw = (value ?? '').trim();
		if (!raw) return '';

		const normalized = path.normalize(raw);
		if (path.isAbsolute(normalized)) {
			return normalized.replaceAll('\\', '/');
		}

		return this.trimSlashes(normalized.replaceAll('\\', '/'));
	}

	private normalizeRouteSlug(slugParam: string | null | undefined): string {
		const trimmed = this.trimSlashes(slugParam);
		if (!trimmed) return 'docs';
		return trimmed.startsWith('docs') ? trimmed : `docs/${trimmed}`;
	}

	private normalizeFileName(page: DocPage): string {
		const raw = page.fileName?.trim() ? page.fileName : `${this.normalizeSegment(page.title)}.md`;
		return raw.replace(/\.(md|mdx)$/i, '');
	}

	private resolveRouteSlug(page: DocPage, tab?: DocTab, group?: DocGroup): string {
		if (page.slug) {
			return page.slug;
		}

		const parts: string[] = ['docs'];

		if (tab && tab.combineHref !== false) {
			parts.push(this.normalizeSegment(tab.title));
		}

		if (group && group.combineHref !== false) {
			parts.push(this.normalizeSegment(group.title));
		}

		parts.push(this.normalizeSegment(page.title));
		return parts.join('/');
	}

	private resolveFolderSegments(tab?: DocTab, group?: DocGroup): string[] {
		const segments: string[] = [];

		if (tab) {
			segments.push(this.normalizePathInput(tab.folderPath ?? this.normalizeSegment(tab.title)));
		}

		if (group) {
			segments.push(
				this.normalizePathInput(group.folderPath ?? this.normalizeSegment(group.title))
			);
		}

		return segments.filter(Boolean);
	}

	private resolveFilePath(fileName: string, folderSegments: string[]): string {
		const normalizedFileName = this.normalizePathInput(fileName);
		if (path.isAbsolute(normalizedFileName)) {
			return normalizedFileName;
		}

		const hasPathSegments = normalizedFileName.includes('/');

		if (!hasPathSegments) {
			return toPosixPath(
				path.resolve(this.markdownFolderPath, ...folderSegments, normalizedFileName)
			);
		}

		const markdownRoot = path.basename(this.markdownFolderPath);
		const prefixedRoot = `${markdownRoot}/`;
		const relativeFromRoot = normalizedFileName.startsWith(prefixedRoot)
			? normalizedFileName.slice(prefixedRoot.length)
			: normalizedFileName;

		return toPosixPath(path.resolve(this.markdownFolderPath, relativeFromRoot));
	}

	private formatFileNameAsTitle(fileName: string): string {
		return fileName
			.replaceAll(/[-_]/g, ' ')
			.replace(/^./, (char) => char.toUpperCase())
			.replaceAll(/\s+(.)/g, (_, char) => ` ${char.toUpperCase()}`);
	}

	private resolvePageAccess(
		page: DocPage,
		group?: DocGroup,
		tab?: DocTab
	): DocPrivateAccess | false {
		if (page.private !== undefined) {
			return page.private;
		}

		if (group?.private !== undefined) {
			return group.private;
		}

		if (tab?.private !== undefined) {
			return tab.private;
		}

		return false;
	}

	private createTab(tab: DocTab): number {
		const tabId = this.nextTabId++;
		const mode: NavigationTabMapItem['mode'] = 'groups' in tab ? 'group' : 'page';

		this.tabs.set(tabId, {
			title: tab.title,
			href: '',
			mode,
			...(tab.icon ? { icon: tab.icon } : {})
		});

		return tabId;
	}

	private createGroup(group: DocGroup, tabId?: number): number {
		const groupId = this.nextGroupId++;
		const groupData: NavigationGroupMapItem = {
			title: group.title,
			showTitle: group.showTitle ?? true,
			collapsible: group.collapsible ?? true,
			...(group.icon ? { icon: group.icon } : {})
		};
		if (tabId !== undefined) {
			groupData.tabId = tabId;
		}
		this.groups.set(groupId, groupData);

		return groupId;
	}

	private addEntry(
		page: DocPage,
		options: { tab?: DocTab; group?: DocGroup; tabId?: number; groupId?: number } = {}
	) {
		const { tab, group, tabId, groupId } = options;

		// get the slug
		const routeSlug = this.resolveRouteSlug(page, tab, group);

		const folderSegments = this.resolveFolderSegments(tab, group);

		// if filename was defined, then use it, otherwise generate from title
		const fileName = page.fileName?.trim()
			? page.fileName
			: `${this.normalizeSegment(page.title)}.md`;

		// get the whole file path by combining markdown folder, optional tab/group folders, and filename
		const filepath = this.resolveFilePath(fileName, folderSegments);

		const privateAccess = this.resolvePageAccess(page, group, tab);
		const href = `/${routeSlug}`;

		if (tabId !== undefined) {
			const tabData = this.tabs.get(tabId);
			if (tabData?.href === '') {
				tabData.href = href;
			}
		}

		const pageData: ManifestNavigationPage = {
			slug: routeSlug,
			href,
			title: page.title,
			filepath,
			private: privateAccess,
			...(page.icon ? { icon: page.icon } : {})
		};

		if (tabId !== undefined) {
			pageData.tabId = tabId;
		}

		if (groupId !== undefined) {
			pageData.groupId = groupId;
		}

		this.pages.set(routeSlug, pageData);
	}

	private expandLoadRest(explicitPages: DocPage[], tab?: DocTab, group?: DocGroup): DocPage[] {
		const explicitFileNames = new Set(
			explicitPages.map(
				(page) => this.normalizeFileName(page).split('/').pop()?.toLowerCase() ?? ''
			)
		);

		const matchingFiles = new Map<string, string>();
		const pathSegments = this.resolveFolderSegments(tab, group);

		if (pathSegments.length === 0) {
			return [];
		}

		for (const filePath of Object.keys(this.rawMarkdownByPath)) {
			const pathCheck = pathSegments.every((segment) => filePath.includes(segment));
			if (!pathCheck) continue;

			const fullFileName = filePath.split('/').pop() ?? '';
			const strippedName = fullFileName.replace(/\.(md|mdx)$/i, '').toLowerCase();

			if (explicitFileNames.has(strippedName) || strippedName === 'index') {
				continue;
			}

			matchingFiles.set(strippedName, fullFileName);
		}

		return Array.from(matchingFiles.entries())
			.sort(([a], [b]) => a.localeCompare(b))
			.map(
				([strippedName, fullFileName]) =>
					({
						title: this.formatFileNameAsTitle(strippedName),
						fileName: fullFileName
					}) satisfies DocPage
			);
	}

	private expandConfiguredPages(pages: PageItems, tab?: DocTab, group?: DocGroup): DocPage[] {
		const explicitPages: DocPage[] = [];
		let hasLoadRest = false;

		for (const item of pages) {
			if (item === 'loadRest') {
				hasLoadRest = true;
				continue;
			}

			explicitPages.push(item);
		}

		if (!hasLoadRest) {
			return explicitPages;
		}

		return [...explicitPages, ...this.expandLoadRest(explicitPages, tab, group)];
	}

	private getPagesForGroup(group: DocGroup, tab?: DocTab): DocPage[] {
		if (group.pages === 'auto') {
			return this.expandLoadRest([], tab, group);
		}

		return this.expandConfiguredPages(group.pages, tab, group);
	}

	private getPagesForTab(tab: DocTab): DocPage[] {
		if ('pages' in tab && tab.pages === 'auto') {
			return this.expandLoadRest([], tab);
		}

		if ('pages' in tab && tab.pages && tab.pages !== 'auto') {
			return this.expandConfiguredPages(tab.pages, tab);
		}

		return [];
	}

	private addGroupEntries(group: DocGroup, tabId?: number, tab?: DocTab) {
		const pages = this.getPagesForGroup(group, tab);
		if (pages.length === 0) {
			return;
		}

		const groupId = this.createGroup(group, tabId);

		for (const page of pages) {
			this.addEntry(page, { tab, group, tabId, groupId });
		}
	}

	private addTabEntries(tab: DocTab) {
		const tabId = this.createTab(tab);

		if ('groups' in tab && tab.groups && tab.groups !== 'auto') {
			for (const group of tab.groups) {
				this.addGroupEntries(group, tabId, tab);
			}
			return;
		}

		for (const page of this.getPagesForTab(tab)) {
			this.addEntry(page, { tab, tabId });
		}
	}

	private collectTabs() {
		// if there are no explicit tabs, return early
		if (!('tabs' in config)) return;

		const tabs = !config.tabs || config.tabs === 'auto' ? [] : config.tabs;
		for (const tab of tabs) {
			this.addTabEntries(tab);
		}
	}

	private collectGroups() {
		// if there are no explicit groups, return early
		if (!('groups' in config) || !config.groups || config.groups === 'auto') return;

		for (const group of config.groups) {
			this.addGroupEntries(group);
		}
	}

	private collectPages() {
		// if there are no explicit pages, return early
		if (!('pages' in config) || !config.pages || config.pages === 'auto') return;

		for (const page of config.pages) {
			this.addEntry(page);
		}
	}
}
