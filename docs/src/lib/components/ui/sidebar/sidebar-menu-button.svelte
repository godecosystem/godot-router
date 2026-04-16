<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';
	export const sidebarMenuButtonVariants = tv({
		base: 'flex items-center gap-2 rounded-sm transition-[color,background-color,box-shadow] [&>svg]:size-4 [&>svg]:shrink-0',
		variants: {
			variant: {
				default:
					'text-muted-foreground hover:bg-primary hover:text-foreground focus-visible:bg-primary focus-visible:text-foreground data-[active=true]:bg-accent/10 data-[active=true]:text-foreground'
			},
			size: {
				default: 'px-3 py-1.5 text-sm'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});
	export type SidebarMenuButtonVariant = VariantProps<typeof sidebarMenuButtonVariants>['variant'];
	export type SidebarMenuButtonSize = VariantProps<typeof sidebarMenuButtonVariants>['size'];
</script>

<script lang="ts">
	import { cn } from '$utils';
	import { mergeProps, type WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Link from '$ui/link';

	type SidebarMenuButtonElement = HTMLElement;
	type SidebarMenuButtonAttributes = HTMLAttributes<HTMLElement>;

	let {
		ref = $bindable(null),
		class: className,
		children,
		child,
		variant = 'default',
		size = 'default',
		isActive = false,
		href,
		...restProps
	}: WithElementRef<SidebarMenuButtonAttributes, SidebarMenuButtonElement> & {
		isActive?: boolean;
		href?: string;
		variant?: SidebarMenuButtonVariant;
		size?: SidebarMenuButtonSize;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

	const buttonProps = $derived({
		class: cn(sidebarMenuButtonVariants({ variant, size }), className),
		'data-slot': 'sidebar-menu-button',
		'data-size': size,
		'data-active': isActive,
		...restProps
	});
</script>

{#snippet Button({ props }: { props?: Record<string, unknown> })}
	{@const mergedProps = mergeProps(buttonProps, props)}
	{#if child}
		{@render child({ props: mergedProps })}
	{:else if href}
		<Link bind:ref {href} {...mergedProps}>
			{@render children?.()}
		</Link>
	{:else}
		<button bind:this={ref} {...mergedProps}>
			{@render children?.()}
		</button>
	{/if}
{/snippet}

{@render Button({})}
