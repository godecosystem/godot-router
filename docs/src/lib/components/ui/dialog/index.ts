import { Dialog as DialogPrimitive } from 'bits-ui';

const Root = DialogPrimitive.Root;
const Portal = DialogPrimitive.Portal;

export { Root, Root as Dialog };
export { Portal, Portal as DialogPortal };
export { default as Overlay, default as DialogOverlay } from './dialog-overlay.svelte';
export { default as Content, default as DialogContent } from './dialog-content.svelte';
export { default as Trigger, default as DialogTrigger } from './dialog-trigger.svelte';
export { default as Close, default as DialogClose } from './dialog-close.svelte';
