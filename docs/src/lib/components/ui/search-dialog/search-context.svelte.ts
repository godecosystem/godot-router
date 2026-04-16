import { createContext, type Component } from 'svelte';
import { Document } from 'flexsearch';
import type { Pathname } from '$app/types';
import { stripContent } from '$utils';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

export const SEARCH_KEYBOARD_SHORTCUT = 'k';

export type SearchProps = {
	getOpen: () => boolean;
	setOpen: (open: boolean) => void;
};

export type SearchQuery = string | string[];
export type SearchResult = ReturnType<Search['getResults']>;

/**
 * Search props for flexsearch Document indexing.
 */
export type IndexData = {
	href: Pathname;
	group: string;
	title: string;
	description: string;
	keywords?: string[];
};

/**
 * Item data that can be added to search used in the `addItem` function
 */
export type ItemInputData = {
	icon?: string | Component;
} & IndexData;

/**
 * Group data that can be added to search used in the `addGroup` function
 */
export type GroupInputData = {
	title: string;
	icon?: string | Component;
	items: Omit<ItemInputData, 'group'>[];
};

/**
 * Output data for search results grouped by group title used in the `getResults` function
 */
export type OutputData = {
	icon?: string | Component;
	items: Omit<ItemInputData, 'group' | 'keywords'>[];
};

export class Search {
	// dialog
	readonly #getOpen: SearchProps['getOpen'];
	readonly #setOpen: SearchProps['setOpen'];
	readonly #updateCallbacks = new SvelteSet<() => void>();

	// search
	public index = this.createSearchIndex();

	// store data locally to ensure consistency and O(1) retrieval of data
	// allows for data that flexsearch doesn't provide (like custom types such as Components for icons)
	private readonly itemMap = new SvelteMap<Pathname, Omit<ItemInputData, 'href'>>();
	private readonly groupMap = new SvelteMap<string, Omit<GroupInputData, 'title' | 'items'>>();

	public query = $state('');
	public cleanQuery = $derived(this.query.replaceAll(/\s+/g, ' ').trim());
	public results = $derived(this.getResults(this.cleanQuery));

	constructor(props: SearchProps) {
		this.#getOpen = props.getOpen;
		this.#setOpen = props.setOpen;
	}

	private createSearchIndex() {
		return new Document<IndexData>({
			tokenize: 'full',
			document: {
				id: 'href',
				index: ['group', 'title', 'description', 'keywords']
			}
		});
	}

	public addGroup(...data: GroupInputData[]) {
		for (const group of data) {
			this.groupMap.set(group.title, { icon: group.icon });

			for (const item of group.items) {
				this.addItem({ group: group.title, ...item });
			}
		}
	}

	public addItem(...data: ItemInputData[]) {
		for (const item of data) {
			const { href, icon, ...rest } = item;
			this.itemMap.set(href, { icon, ...rest });
			this.index.add({ href, ...rest });
		}
	}

	public getDefaultResults() {
		const groupedResults: SvelteMap<string, OutputData> = new SvelteMap();

		for (const [href, data] of this.itemMap.entries()) {
			if (!groupedResults.has(data.group)) {
				const groupData = this.groupMap.get(data.group);
				groupedResults.set(data.group, { items: [], ...groupData });
			}

			const items = groupedResults.get(data.group)?.items;
			items?.push({ href, ...data });
		}

		return groupedResults;
	}

	private normalizeQueries(query: SearchQuery): string[] {
		if (Array.isArray(query)) {
			return [...new SvelteSet(query.map((value) => value.trim()).filter(Boolean))];
		}

		const clean = query.trim();
		return clean ? [clean] : [];
	}

	private getSnippetMatch(text: string, queries: string[]): string {
		const lowerText = text.toLowerCase();
		return queries.find((query) => lowerText.includes(query.toLowerCase())) ?? queries[0] ?? '';
	}

	public getResults(q: SearchQuery, limit = 10) {
		// create a map to group the results
		const groupedResults: SvelteMap<string, OutputData> = new SvelteMap();
		const queries = this.normalizeQueries(q);

		if (!queries.length) return groupedResults;

		const uniqueHrefs = new SvelteSet<Pathname>();

		for (const query of queries) {
			// return most relevant results for each query term
			const indexResults = this.index.search(query, {
				limit,
				merge: true,
				enrich: false
			});

			for (const result of indexResults) {
				if (uniqueHrefs.size >= limit) break;
				const href = result.id as Pathname;
				uniqueHrefs.add(href);
			}

			if (uniqueHrefs.size >= limit) break;
		}

		for (const href of uniqueHrefs) {
			const data = this.itemMap.get(href);

			if (!data) continue;

			if (!groupedResults.has(data.group)) {
				const groupData = this.groupMap.get(data.group);
				groupedResults.set(data.group, { items: [], ...groupData });
			}

			const items = groupedResults.get(data.group)?.items;

			items?.push({
				href,
				title: data.title,
				description: stripContent(
					data.description,
					this.getSnippetMatch(data.description, queries)
				),
				icon: data.icon
			});
		}

		return groupedResults;
	}

	public clearSearch() {
		this.index.clear();
		this.itemMap.clear();
		this.groupMap.clear();
		this.query = '';
	}

	public onUpdate(callback: () => void) {
		this.#updateCallbacks.add(callback);

		return () => {
			this.#updateCallbacks.delete(callback);
		};
	}

	public signalUpdate() {
		for (const callback of this.#updateCallbacks) {
			callback();
		}
	}

	get open(): boolean {
		return this.#getOpen();
	}

	set open(value: boolean) {
		this.#setOpen(value);
	}

	public toggle = () => (this.open = !this.open);

	public handleShortcutKeydown = (e: KeyboardEvent) => {
		if (e.key === SEARCH_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			this.toggle();
		}
	};
}

const [getSearch, set] = createContext<Search>();

export { getSearch };

export function setSearch(props: SearchProps) {
	return set(new Search(props));
}
