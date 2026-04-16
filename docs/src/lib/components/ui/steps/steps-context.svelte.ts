import { createContext } from 'svelte';

/**
 * Class used to auto increment step number.
 * A $state.raw array of ids was the only way to preserve the numbers with vite's hot module reload
 */
export class StepsContext {
	readonly #start: number = 1;
	#steps: string[] = $state.raw([]);

	constructor(start: () => number) {
		this.#start = start();
	}

	registerStep(id: string) {
		this.#steps.push(id);
	}

	removeStep(id: string) {
		this.#steps = this.#steps.filter((step) => step !== id);
	}

	getStep(id: string) {
		return this.#steps.indexOf(id) + this.#start;
	}
}

const [getSteps, set] = createContext<StepsContext>();

export { getSteps };

export function setSteps(start: () => number) {
	return set(new StepsContext(start));
}
