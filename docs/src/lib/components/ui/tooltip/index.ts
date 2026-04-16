import { Tooltip as TooltipPrimitive } from 'bits-ui';
import Trigger from './tooltip-trigger.svelte';
import Content from './tooltip-content.svelte';
import Root from './tooltip-root.svelte';

const Provider = TooltipPrimitive.Provider;

export {
	Root,
	Trigger,
	Content,
	Provider,
	//
	Root as Tooltip,
	Content as TooltipContent,
	Trigger as TooltipTrigger,
	Provider as TooltipProvider
};
