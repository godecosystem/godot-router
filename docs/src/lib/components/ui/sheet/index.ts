import { Dialog as SheetPrimitive } from 'bits-ui';

const Root = SheetPrimitive.Root;
const Portal = SheetPrimitive.Portal;

export { Root, Root as Sheet };
export { Portal, Portal as SheetPortal };
export { default as Overlay, default as SheetOverlay } from './sheet-overlay.svelte';
export { default as Content, default as SheetContent } from './sheet-content.svelte';
export { default as Trigger, default as SheetTrigger } from './sheet-trigger.svelte';
export { default as Close, default as SheetClose } from './sheet-close.svelte';
