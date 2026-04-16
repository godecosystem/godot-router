import { createContext } from 'svelte';

export class TreeLevelContext {
	readonly level: number = 1;

	constructor(level: number) {
		this.level = level;
	}
}

const [getTreeLevel, setLevel] = createContext<TreeLevelContext>();

export { getTreeLevel };

export function setTreeLevel(level: number = 0) {
	return setLevel(new TreeLevelContext(level));
}

export type OpenProps = {
	getOpen: () => boolean | null;
	setOpen: (open: boolean | null) => void;
	getNoInteraction: () => boolean;
};

export class TreeOpenContext {
	readonly #getOpen: OpenProps['getOpen'];
	readonly #setOpen: OpenProps['setOpen'];
	readonly #getNoInteraction: OpenProps['getNoInteraction'];

	constructor(props: OpenProps) {
		this.#getOpen = props.getOpen;
		this.#setOpen = props.setOpen;
		this.#getNoInteraction = props.getNoInteraction;
	}

	get open(): ReturnType<OpenProps['getOpen']> {
		return this.#getOpen();
	}

	set open(open: ReturnType<OpenProps['getOpen']>) {
		this.#setOpen(open);
	}

	get noInteraction(): ReturnType<OpenProps['getNoInteraction']> {
		return this.#getNoInteraction();
	}

	clear() {
		this.#setOpen(null);
	}
}

const [getTreeOpen, setOpen] = createContext<TreeOpenContext>();

export { getTreeOpen };

export function setTreeOpen(props: OpenProps) {
	return setOpen(new TreeOpenContext(props));
}
