import { Select as SelectPrimitive } from 'bits-ui';

const Root = SelectPrimitive.Root;
const Portal = SelectPrimitive.Portal;

export { Root, Root as Select };
export { Portal, Portal as SelectPortal };
export { default as Trigger, default as SelectTrigger } from './select-trigger.svelte';
export { default as Content, default as SelectContent } from './select-content.svelte';
export { default as Item, default as SelectItem } from './select-item.svelte';
