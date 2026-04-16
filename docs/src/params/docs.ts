export function match(value: string) {
	return value.split('/').at(0) === 'docs';
}
