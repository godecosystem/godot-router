import type { Pathname } from '$app/types';

type Icon = {
	/**
	 * The icon to display next to the title of a tab, group, or page.
	 * If the string matches an icon type, the icon Component will be rendered.
	 */
	icon?: string;
};

/**
 * Array of pages that can include 'loadRest' as the last element.
 * 'loadRest' will automatically load remaining markdown files from the filesystem.
 * If 'loadRest' is used, it MUST be the last item in the array and can only appear once.
 */
export type PageItems<TRole extends string = string> =
	| DocPage<TRole>[]
	| readonly [...DocPage<TRole>[], 'loadRest'];

/**
 * Access requirement for docs entries:
 * - `false` or omitted: public
 * - `true`: authenticated-only
 * - `"role"`: only users with that role
 * - `["roleA", "roleB"]`: any of these roles can access
 */
export type DocPrivateAccess<TRole extends string = string> = boolean | TRole | readonly TRole[];

export type DocPage<TRole extends string = string> = {
	/**
	 * The name of the page. This is displayed in the navigation sidebar.
	 */
	title: string;
	/**
	 * The slug of the page. This defaults to being created from the page title if not defined.
	 */
	slug?: string;
	/**
	 * The corresponding markdown file location for the page.\
	 * This defaults to `content/{tabTitle?}/{groupTitle?}/{pageTitle}.md` but can be overridden.
	 *
	 * Note that `tabTitle?` and `groupTitle?` are optional and will only be included if a tab or group is defined.
	 */
	fileName?: string;
	/**
	 * Determines if this page requires authentication/authorization.
	 * If not explicitly set, inherits the privacy setting from its parent group or tab.
	 * An explicit value at the page level overrides parent settings.
	 * - `true` means any authenticated user.
	 * - `"admin"` (or any string) means only users with that role.
	 * - `["admin", "editor"]` means any listed role can access.
	 */
	private?: DocPrivateAccess<TRole>;
} & Icon;

export type DocGroup<TRole extends string = string> = {
	/**
	 * The name of the group. This is used to categorize navigation pages.
	 * - If `showTitle` is `false`, this group text will not be displayed in the navigation sidebar.
	 * - If `combineHref` is `false`, this group name will not be added to the url path of a page.
	 */
	title: string;
	/**
	 * The corresponding markdown folder location for the group.\
	 * This defaults to `content/{tabTitle?}/{groupTitle}` but can be overridden.
	 *
	 * Note that `tabTitle?` is optional and will only be included if a tab is defined.
	 */
	folderPath?: string;
	/**
	 * Determines if the group title will be shown in the navigation sidebar.\
	 * This defaults to `true` but can be overridden.
	 */
	showTitle?: boolean;
	/**
	 * Determines if the group can be collapsed in the navigation sidebar.\
	 * This defaults to `true` but can be overridden.
	 */
	collapsible?: boolean;
	/**
	 * Determines if the group title will be used in the link.\
	 * This defaults to `true` but can be overridden.
	 * - If `true`, the link will be formatted as `/docs/{tabTitle?}/{groupTitle}/{pageTitle}`.
	 * - If `false`, the link will be formatted as `/docs/{tabTitle?}/{pageTitle}`.
	 *
	 * Note that `tabTitle?` is optional and will only be included if a tab is defined.
	 */
	combineHref?: boolean;
	/**
	 * A list of all pages to include in the group.
	 * - If `"auto"`, the pages will be automatically generated from the markdown files in the group folder defined by the `folderPath`.
	 * - Can include `'loadRest'` as the last element to load remaining markdown files from the filesystem.
	 */
	pages: PageItems<TRole> | 'auto';
	/**
	 * Determines if this group and its pages require authentication/authorization.
	 * If not explicitly set, inherits the privacy setting from its parent tab.
	 * An explicit value at the group level overrides the parent tab setting and can be overridden by page-level settings.
	 * - `true` means any authenticated user.
	 * - `"admin"` (or any string) means only users with that role.
	 * - `["admin", "editor"]` means any listed role can access.
	 */
	private?: DocPrivateAccess<TRole>;
} & Icon;

type DocTabBase<TRole extends string = string> = {
	/**
	 * The name of the tab. This is displayed in the header.
	 */
	title: string;
	/**
	 * The corresponding markdown folder location for the tab.\
	 * This defaults to `content/{tabTitle}` but can be overridden.
	 */
	folderPath?: string;
	/**
	 * Determines if the tab title will be used in the link.\
	 * This defaults to `true` but can be overridden.
	 * - If `true`, the link will be formatted as `/docs/{tabTitle}/{groupTitle?}/{pageTitle}`.
	 * - If `false`, the link will be formatted as `/docs/{groupTitle?}/{pageTitle}`.
	 *
	 * Note that `groupTitle?` is optional and will only be included if a group is defined.
	 */
	combineHref?: boolean;
	/**
	 * Determines if this tab and its groups/pages require authentication/authorization.
	 * An explicit value at this level can be overridden by group-level or page-level settings.
	 * - `true` means any authenticated user.
	 * - `"admin"` (or any string) means only users with that role.
	 * - `["admin", "editor"]` means any listed role can access.
	 */
	private?: DocPrivateAccess<TRole>;
} & Icon;

export type DocTabGroupsConfig<TRole extends string = string> = DocTabBase<TRole> & {
	/**
	 * A list of groups to include in this tab.
	 * - If `"auto"`, groups are generated from this tab folder.
	 */
	groups: DocGroup<TRole>[] | 'auto';
	/**
	 * Mutually exclusive with `groups` at the tab level.
	 */
	pages?: never;
};

export type DocTabPagesConfig<TRole extends string = string> = DocTabBase<TRole> & {
	/**
	 * A list of pages to include directly in this tab.
	 * - If `"auto"`, pages are generated from this tab folder.
	 * - Can include `'loadRest'` as the last element to load remaining pages.
	 */
	pages: PageItems<TRole> | 'auto';
	/**
	 * Mutually exclusive with `pages` at the tab level.
	 */
	groups?: never;
};

export type DocTab<TRole extends string = string> =
	| DocTabGroupsConfig<TRole>
	| DocTabPagesConfig<TRole>;

/**
 * Root navigation config when docs are organized by tabs.
 */
export type DocNavigationTabsConfig<TRole extends string = string> = {
	/**
	 * A list of tabs to include in the docs navigation.
	 * - If `"auto"`, tabs are generated from the filesystem.
	 */
	tabs: DocTab<TRole>[] | 'auto';
	/**
	 * Enables previous/next page links that can continue across tab boundaries.
	 * This option only applies to tab-based navigation.
	 * - Defaults to `false` when omitted.
	 */
	tabNextPrev?: boolean;
	/**
	 * Mutually exclusive with `tabs` at the root level.
	 */
	groups?: never;
	/**
	 * Mutually exclusive with `tabs` at the root level.
	 */
	pages?: never;
};

/**
 * Root navigation config when docs are organized by groups.
 */
export type DocNavigationGroupsConfig<TRole extends string = string> = {
	/**
	 * A list of groups to include in the docs navigation.
	 * - If `"auto"`, groups are generated from the filesystem.
	 */
	groups: DocGroup<TRole>[] | 'auto';
	/**
	 * Mutually exclusive with `groups` at the root level.
	 */
	tabs?: never;
	/**
	 * Mutually exclusive with `groups` at the root level.
	 */
	pages?: never;
	/**
	 * `tabNextPrev` is only supported in tab-based navigation mode.
	 */
	tabNextPrev?: never;
};

/**
 * Root navigation config when docs are organized as a flat list of pages.
 */
export type DocNavigationPagesConfig<TRole extends string = string> = {
	/**
	 * A list of pages to include in the docs navigation.
	 * - If `"auto"`, pages are generated from the filesystem.
	 */
	pages: DocPage<TRole>[] | 'auto';
	/**
	 * Mutually exclusive with `pages` at the root level.
	 */
	tabs?: never;
	/**
	 * Mutually exclusive with `pages` at the root level.
	 */
	groups?: never;
	/**
	 * `tabNextPrev` is only supported in tab-based navigation mode.
	 */
	tabNextPrev?: never;
};

/**
 * The root structure for documentation navigation.
 * Exactly one mode can be defined: tabs, groups, or pages.
 */
export type DocNavigationConfig<TRole extends string = string> =
	| DocNavigationTabsConfig<TRole>
	| DocNavigationGroupsConfig<TRole>
	| DocNavigationPagesConfig<TRole>;

/**
 * Validates that 'loadRest' appears at most once and only as the last item in an array.
 * @throws Error if validation fails
 */
export function validatePageItems<TRole extends string = string>(
	pages: PageItems<TRole> | 'auto' | undefined
): void {
	if (!pages || pages === 'auto' || typeof pages === 'string') {
		return;
	}

	let loadRestCount = 0;
	let loadRestIndex = -1;

	for (let i = 0; i < pages.length; i++) {
		if (pages[i] === 'loadRest') {
			loadRestCount++;
			loadRestIndex = i;
		}
	}

	if (loadRestCount > 1) {
		throw new Error("'loadRest' can only appear once in pages array");
	}

	if (loadRestCount === 1 && loadRestIndex !== pages.length - 1) {
		throw new Error("'loadRest' must be the last item in pages array");
	}
}

function validateTabConfig<TRole extends string = string>(tab: DocTab<TRole>): void {
	if ('pages' in tab) {
		validatePageItems(tab.pages);
	}
	if ('groups' in tab) {
		validateGroupsConfig(tab.groups);
	}
}

function validateTabsConfig<TRole extends string = string>(
	tabs: DocTab<TRole>[] | 'auto' | undefined
): void {
	if (tabs && Array.isArray(tabs)) {
		for (const tab of tabs) {
			validateTabConfig(tab);
		}
	}
}

function validateGroupsConfig<TRole extends string = string>(
	groups: DocGroup<TRole>[] | 'auto' | undefined
): void {
	if (groups && Array.isArray(groups)) {
		for (const group of groups) {
			validatePageItems(group.pages);
		}
	}
}

/**
 * Defines the documentation navigation configuration with type safety and validation.
 */
export function defineDocNavigation<TRole extends string = string>(
	config: DocNavigationConfig<TRole>
): DocNavigationConfig<TRole> {
	if ('tabs' in config) {
		validateTabsConfig(config.tabs);
	}

	if ('groups' in config) {
		validateGroupsConfig(config.groups);
	}

	if ('pages' in config) {
		validatePageItems(config.pages);
	}

	return config;
}
