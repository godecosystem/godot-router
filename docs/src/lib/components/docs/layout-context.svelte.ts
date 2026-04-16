import { createContext, tick } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import { afterNavigate } from '$app/navigation';

export class DocLayoutContext {
	public offsetTop: number = $state(0);

	public readonly attachMainElement: Attachment<HTMLElement> = (element) => {
		const breakpoints = [...this.getBreakpoints(), 0].sort((a, b) => b - a);
		let currentBreakpoint: number = -1;

		const updateOffset = () =>
			(this.offsetTop = element.getBoundingClientRect().top + window.pageYOffset);

		const resizeObserver = new ResizeObserver(() => {
			for (const breakpoint of breakpoints) {
				if (window.innerWidth >= breakpoint) {
					if (currentBreakpoint === breakpoint) return;
					currentBreakpoint = breakpoint;
					updateOffset();
					break;
				}
			}
		});

		const root = document.documentElement;
		resizeObserver.observe(root);

		afterNavigate(({ type }) => {
			if (type !== 'link') return;
			tick().then(() => updateOffset());
		});

		return () => {
			resizeObserver.disconnect();
			this.offsetTop = 0;
		};
	};

	private getBreakpoints() {
		const tailwindBreakpointKeys = ['--breakpoint-sm', '--breakpoint-lg', '--breakpoint-xl'];

		const root = document.documentElement;
		const rootStyles = getComputedStyle(root);

		const tailwindBreakpointValues = tailwindBreakpointKeys.map((key) => {
			const propertyValue = rootStyles.getPropertyValue(key);
			return propertyValue;
		});

		// create a temporary div to accurately calculate the pixel size
		const measurement = document.createElement('div');
		measurement.style.position = 'absolute';
		measurement.style.visibility = 'hidden';
		measurement.style.pointerEvents = 'none';
		measurement.style.blockSize = '0';
		measurement.style.padding = '0';
		measurement.style.border = '0';
		measurement.style.overflow = 'hidden';

		document.body.appendChild(measurement);

		const pixelBreakpoints = tailwindBreakpointValues.map((value) => {
			measurement.style.inlineSize = value;
			const computed = getComputedStyle(measurement).inlineSize;
			return Number.parseFloat(computed);
		});

		measurement.remove();

		return pixelBreakpoints;
	}
}

const [getDocLayoutContext, set] = createContext<DocLayoutContext>();

export { getDocLayoutContext };

export function setDocLayoutContext() {
	return set(new DocLayoutContext());
}
