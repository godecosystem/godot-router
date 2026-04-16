import { createContext } from 'svelte';
import { page } from '$app/state';
import { goto, afterNavigate } from '$app/navigation';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import type { Attachment } from 'svelte/attachments';

type TOCItem = {
	index: number;
	level: number;
	text: string;
	id: string;
	heading: HTMLHeadingElement | null;
	parents: Set<string>;
	prevId?: string;
	isIntersectingPriority?: boolean;
};

export type TOCSeedEntry = {
	id: string;
	text: string;
	level?: number;
	tagLevel?: number;
};

export type TOCProps = {
	selectors?: ('h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6')[];
	initialEntries?: TOCSeedEntry[];
	highlightParentLevels?: 0 | 1 | 2 | 3 | 4 | 5;
	observerOptions?: IntersectionObserverInit;
	detectIfReachedBottom?: boolean;
	reachedBottomObserverOptions?: IntersectionObserverInit;
};

export type TOCContextProps = {
	getSelectors: () => NonNullable<TOCProps['selectors']>;
	getInitialEntries: () => NonNullable<TOCProps['initialEntries']>;
	getHighlightParentLevels: () => NonNullable<TOCProps['highlightParentLevels']>;
	getObserverOptions: () => TOCProps['observerOptions'];
	getDetectIfReachedBottom: () => NonNullable<TOCProps['detectIfReachedBottom']>;
	getReachedBottomObserverOptions: () => TOCProps['reachedBottomObserverOptions'];
};

export class TOCContext {
	#containerElement: HTMLElement | null = $state(null);

	readonly #getSelectors: TOCContextProps['getSelectors'];
	readonly #getHighlightParentLevels: TOCContextProps['getHighlightParentLevels'];
	readonly #getInitialEntries: TOCContextProps['getInitialEntries'];
	readonly #getObserverOptions: TOCContextProps['getObserverOptions'];
	readonly #getDetectIfReachedBottom: TOCContextProps['getDetectIfReachedBottom'];
	readonly #getReachedBottomObserverOptions: TOCContextProps['getReachedBottomObserverOptions'];

	readonly #toc = new SvelteMap<string, TOCItem>();
	readonly #warnedDuplicateIds = new SvelteSet<string>();

	#reachedBottom = $state(false);
	#mostRecentKey = $state<string | null>(null);
	#lastKey = $state<string | null>(null);
	#lastScrollTop = 0;
	#priorityViewObserver: IntersectionObserver | null = null;
	#reachedBottomObserver: IntersectionObserver | null = null;

	public readonly tocEntries = $derived(Array.from(this.#toc.entries()));

	public readonly routeHashKey = $derived.by(() => {
		const hash = page.url.hash.replace('#', '');
		return hash && this.#toc.has(hash) ? hash : null;
	});

	public readonly activeKey = $derived.by(() => {
		if (this.routeHashKey) return this.routeHashKey;
		if (this.#reachedBottom && this.#lastKey) return this.#lastKey;

		let intersectingKey: string | null = null;
		for (const [key, item] of this.tocEntries) {
			if (item.isIntersectingPriority) intersectingKey = key;
		}

		if (intersectingKey) return intersectingKey;
		if (this.#mostRecentKey && this.#toc.has(this.#mostRecentKey)) return this.#mostRecentKey;
		return this.tocEntries[0]?.[0] ?? null;
	});

	public readonly activeItem = $derived.by(() => {
		if (!this.activeKey) return null;
		return this.#toc.get(this.activeKey) ?? null;
	});

	public readonly activeIndex = $derived.by(() => {
		if (!this.activeKey) return 0;
		return this.#toc.get(this.activeKey)?.index ?? 0;
	});

	public readonly hasEntries = $derived(this.#toc.size > 0);

	constructor(props: TOCContextProps) {
		this.#getSelectors = props.getSelectors;
		this.#getHighlightParentLevels = props.getHighlightParentLevels;
		this.#getInitialEntries = props.getInitialEntries;
		this.#getObserverOptions = props.getObserverOptions;
		this.#getDetectIfReachedBottom = props.getDetectIfReachedBottom;
		this.#getReachedBottomObserverOptions = props.getReachedBottomObserverOptions;
		this.applyInitialEntries();

		afterNavigate(({ type }) => {
			if (type === 'link') {
				this.update();
			}
		});
	}

	get highlightParents() {
		return this.#getHighlightParentLevels();
	}

	get reachedBottom() {
		return this.#reachedBottom;
	}

	private getHeadingTopOffset(heading: HTMLHeadingElement) {
		const headingTop = heading.getBoundingClientRect().top;
		const containerTop = this.#containerElement?.getBoundingClientRect().top ?? 0;
		return headingTop - containerTop - window.pageYOffset;
	}

	private buildParentSet(stack: Array<{ id: string; level: number }>) {
		const parentIds = new SvelteSet<string>();
		const highlightLevels = this.#getHighlightParentLevels();
		if (highlightLevels <= 0) return parentIds;

		for (let index = stack.length - 1; index >= 0; index -= 1) {
			if (parentIds.size >= highlightLevels) break;
			parentIds.add(stack[index].id);
		}

		return parentIds;
	}

	private getSeedEntryTagLevel(entry: TOCSeedEntry) {
		const rawLevel = entry.tagLevel ?? entry.level;
		const level = Number(rawLevel);
		if (!Number.isFinite(level)) return 1;
		return Math.min(6, Math.max(1, Math.floor(level)));
	}

	readonly priorityIntersectionCallback = (entries: IntersectionObserverEntry[]) => {
		entries.forEach((entry) => {
			const id = entry.target.id;
			const item = this.#toc.get(id);
			if (!item) return;

			const currentScrollTop = window.scrollY;
			const scrolledUp = currentScrollTop < this.#lastScrollTop;
			this.#lastScrollTop = currentScrollTop;

			this.#toc.set(id, { ...item, isIntersectingPriority: entry.isIntersecting });

			if (entry.isIntersecting) {
				this.#mostRecentKey = id;
				return;
			}

			if (id === this.routeHashKey && !entry.isIntersecting) {
				goto('', { noScroll: true, replaceState: true });
				return;
			}

			const currentLastKey = this.#lastKey;
			const currentLastItem = currentLastKey ? this.#toc.get(currentLastKey) : null;
			if (currentLastKey && currentLastItem?.prevId === id && this.#reachedBottom) {
				this.#mostRecentKey = currentLastKey;
				return;
			}

			if (item.prevId && scrolledUp) {
				const previous = this.#toc.get(item.prevId);
				if (previous && !previous.isIntersectingPriority) this.#mostRecentKey = previous.id;
			}
		});
	};

	readonly bottomIntersectionCallback = (entries: IntersectionObserverEntry[]) => {
		entries.forEach((entry) => {
			if (this.#toc.size === 0 || !this.#lastKey) return;

			this.#reachedBottom = entry.isIntersecting;

			if (entry.isIntersecting) {
				this.#mostRecentKey = this.#lastKey;
				return;
			}

			if (this.#lastKey === this.routeHashKey && !entry.isIntersecting) {
				goto('', { noScroll: true, replaceState: true });
				return;
			}

			const currentLastItem = this.#toc.get(this.#lastKey);
			if (!currentLastItem || currentLastItem.isIntersectingPriority) return;
			if (this.#mostRecentKey !== this.#lastKey || !currentLastItem.prevId) return;

			let initialKey: string | null = null;
			for (const [key, { heading }] of this.#toc) {
				if (!heading) continue;
				const top = this.getHeadingTopOffset(heading);
				if (top <= 0) initialKey = key;
			}

			this.#mostRecentKey = initialKey;
		});
	};

	public update() {
		const container = this.#containerElement;
		if (!container) {
			this.reset();
			return;
		}

		const headings = [
			...container.querySelectorAll(this.#getSelectors().join(', '))
		] as HTMLHeadingElement[];

		this.#priorityViewObserver?.disconnect();
		this.#priorityViewObserver = new IntersectionObserver(
			this.priorityIntersectionCallback,
			this.#getObserverOptions()
		);

		this.#reachedBottomObserver?.disconnect();
		this.#reachedBottomObserver = null;
		if (this.#getDetectIfReachedBottom()) {
			const lastElementChild = container.lastElementChild;
			if (lastElementChild) {
				this.#reachedBottomObserver = new IntersectionObserver(
					this.bottomIntersectionCallback,
					this.#getReachedBottomObserverOptions()
				);
				this.#reachedBottomObserver.observe(lastElementChild);
			}
		}

		const filteredHeadings = headings.filter(
			(heading) => heading.dataset.ignoreToc !== 'true' && heading.id
		);

		const stack: Array<{ id: string; level: number }> = [];
		const seenIds = new SvelteSet<string>();
		const nextEntries: Array<[string, TOCItem]> = [];
		let initialKey: string | null = null;
		let previousId: string | undefined;
		let finalKey: string | null = null;

		filteredHeadings.forEach((heading) => {
			const level = Number(heading.tagName.slice(1));
			while (stack.length > 0 && level <= (stack.at(-1)?.level ?? 0)) stack.pop();

			const id = heading.id;
			if (seenIds.has(id)) {
				if (!this.#warnedDuplicateIds.has(id)) {
					console.warn(`Duplicate heading id "${id}" was ignored in table-of-contents.`);
					this.#warnedDuplicateIds.add(id);
				}
				return;
			}

			const item: TOCItem = {
				index: nextEntries.length,
				id,
				text: heading.textContent?.trim() ?? '',
				level: stack.length + 1,
				heading,
				parents: this.buildParentSet(stack),
				prevId: previousId
			};

			nextEntries.push([id, item]);
			seenIds.add(id);
			stack.push({ id, level });
			this.#priorityViewObserver?.observe(heading);

			const top = this.getHeadingTopOffset(heading);
			if (top <= 0) initialKey = id;

			previousId = id;
			finalKey = id;
		});

		this.#toc.clear();
		for (const [key, item] of nextEntries) {
			this.#toc.set(key, item);
		}

		this.#reachedBottom = false;
		this.#mostRecentKey = initialKey;
		this.#lastKey = finalKey;
	}

	public destroy() {
		this.#priorityViewObserver?.disconnect();
		this.#priorityViewObserver = null;
		this.#reachedBottomObserver?.disconnect();
		this.#reachedBottomObserver = null;
		this.reset();
	}

	private reset() {
		this.#toc.clear();
		this.#reachedBottom = false;
		this.#mostRecentKey = null;
		this.#lastKey = null;
	}

	private applyInitialEntries() {
		const initialEntries = this.#getInitialEntries();
		if (initialEntries.length === 0) return;

		const nextEntries: Array<[string, TOCItem]> = [];
		const stack: Array<{ id: string; level: number }> = [];
		const seenIds = new SvelteSet<string>();
		let previousId: string | undefined;
		let finalKey: string | null = null;

		for (const entry of initialEntries) {
			const id = entry.id.trim();
			if (!id || seenIds.has(id)) continue;

			const level = this.getSeedEntryTagLevel(entry);
			while (stack.length > 0 && level <= (stack.at(-1)?.level ?? 0)) stack.pop();

			const item: TOCItem = {
				index: nextEntries.length,
				id,
				text: entry.text.trim() || id,
				level: stack.length + 1,
				heading: null,
				parents: this.buildParentSet(stack),
				prevId: previousId
			};

			nextEntries.push([id, item]);
			seenIds.add(id);
			stack.push({ id, level });
			previousId = id;
			finalKey = id;
		}

		if (nextEntries.length === 0) return;

		this.#toc.clear();
		for (const [key, item] of nextEntries) {
			this.#toc.set(key, item);
		}

		this.#mostRecentKey = this.routeHashKey;
		this.#lastKey = finalKey;
	}

	public readonly attachContainerElement: Attachment<HTMLElement> = (element) => {
		this.#containerElement = element;
		return () => {
			this.#containerElement = null;
		};
	};
}

const [getTOCContext, set] = createContext<TOCContext>();

export { getTOCContext };

export function setTOCContext(props: TOCContextProps) {
	return set(new TOCContext(props));
}
