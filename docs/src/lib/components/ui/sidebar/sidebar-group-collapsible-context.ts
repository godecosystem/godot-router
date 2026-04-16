import { getContext, hasContext, setContext } from 'svelte';

const SIDEBAR_GROUP_COLLAPSIBLE_CONTEXT = Symbol('sidebar-group-collapsible');

export type SidebarProps = {
	getIsCollapsible: () => boolean;
};

export class Sidebar {
	readonly #getIsCollapsible: SidebarProps['getIsCollapsible'];

	constructor(props: SidebarProps) {
		this.#getIsCollapsible = props.getIsCollapsible;
	}

	get isCollapsible(): boolean {
		return this.#getIsCollapsible();
	}
}

export function setSidebarGroupCollapsibleContext(props: SidebarProps) {
	return setContext(SIDEBAR_GROUP_COLLAPSIBLE_CONTEXT, new Sidebar(props));
}

export function getSidebarGroupCollapsibleContext() {
	if (!hasContext(SIDEBAR_GROUP_COLLAPSIBLE_CONTEXT)) {
		return null;
	}

	return getContext<Sidebar>(SIDEBAR_GROUP_COLLAPSIBLE_CONTEXT);
}
