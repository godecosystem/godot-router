<script lang="ts" module>
	import { cn } from '$utils';
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';

	export const buttonVariants = tv({
		base: 'rounded-md flex items-center justify-center gap-2 font-medium transition-all [&_svg]:pointer-events-none [&_svg]:shrink-0',
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xs',
				destructive: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow',
				outline:
					'bg-background text-muted-foreground hover:bg-secondary hover:text-foreground border shadow disabled:hover:bg-secondary/90 aria-disabled:hover:bg-secondary/90 focus-visible:bg-secondary focus-visible:text-foreground',
				ghost:
					'bg-background hover:bg-secondary rounded-sm hover:shadow text-muted-foreground hover:text-foreground focus-visible:bg-secondary focus-visible:text-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
				foreground: 'bg-foreground hover:bg-foreground/90 shadow-xs text-background'
			},
			size: {
				default: 'gap-2 px-4 py-2 [&_svg]:size-4 text-sm',
				sm: 'gap-2 px-2 py-1.5 [&_svg]:size-3.5 text-xs',
				lg: 'gap-2 px-6 py-3 [&_svg]:size-4.5 text-base',
				icon: 'p-2 [&_svg]:size-4',
				'icon-sm': 'p-1.5 [&_svg]:size-3.5',
				'icon-lg': 'p-2.5 [&_svg]:size-4.5'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
			unstyled?: boolean;
		};
</script>

<script lang="ts">
	import Link from '$ui/link';

	let {
		class: className,
		variant = 'default',
		size = 'default',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		unstyled = false,
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<Link
		{ref}
		data-slot="button"
		class={cn(!unstyled && buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? 'link' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</Link>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(!unstyled && buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
