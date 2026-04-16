import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

const Root = DropdownMenuPrimitive.Root;
const Portal = DropdownMenuPrimitive.Portal;

export { Root, Root as DropdownMenuRoot };
export { Portal, Portal as DropdownMenuPortal };
export { default as Item, default as DropdownMenuItem } from './dropdown-menu-item.svelte';
export { default as Trigger, default as DropdownMenuTrigger } from './dropdown-menu-trigger.svelte';
export { default as Content, default as DropdownMenuContent } from './dropdown-menu-content.svelte';
