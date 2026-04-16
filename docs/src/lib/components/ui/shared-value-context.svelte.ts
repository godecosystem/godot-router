import { setContext, getContext } from 'svelte';

export type CreateSharedValueContextOptions<T = string> = {
	id: string;
	initialValue: T;
	useLocalStorage?: boolean;
	serialize?: (value: T) => string;
	deserialize?: (value: string) => T;
};

export class SharedValueContext<T = string> {
	#value = $state<T>(undefined as T);
	readonly #id: string;
	readonly #useLocalStorage: boolean;
	readonly #serialize: (value: T) => string;
	readonly #deserialize: (value: string) => T;

	constructor(options: CreateSharedValueContextOptions<T>) {
		this.#id = options.id;
		this.#useLocalStorage = options.useLocalStorage ?? false;
		this.#serialize = options.serialize ?? String;
		this.#deserialize = options.deserialize ?? ((v: string) => v as T);
		this.#value = this.#resolveInitialValue(options.initialValue);
	}

	get value() {
		return this.#value;
	}

	set value(v: T) {
		this.#value = v;
		if (this.#useLocalStorage && globalThis.window !== undefined) {
			globalThis.window.localStorage.setItem(this.#id, this.#serialize(v));
		}
	}

	#resolveInitialValue(initialValue: T) {
		if (!this.#useLocalStorage || globalThis.window === undefined) {
			return initialValue;
		}

		const storedValue = globalThis.window.localStorage.getItem(this.#id);
		return storedValue ? this.#deserialize(storedValue) : initialValue;
	}
}

export function createSharedValueContext<T = string>(options: CreateSharedValueContextOptions<T>) {
	const ctx = new SharedValueContext(options);
	setContext(options.id, ctx);
	return ctx;
}

export function getSharedValueContext<T = string>(
	id: () => string | undefined
): SharedValueContext<T> | undefined {
	const resolvedId = id();
	if (!resolvedId) return undefined;

	const ctx = getContext<SharedValueContext<T>>(resolvedId);
	if (!ctx) {
		throw new Error(
			`[SharedValueContext] No context found for contextId "${resolvedId}". Did you call createSharedValueContext('${resolvedId}') in a parent component?`
		);
	}
	return ctx;
}
