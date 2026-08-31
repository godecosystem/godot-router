const ALLOWED_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:/i;

function removeAsciiWhitespaceAndControls(value: string): string {
	return Array.from(value, (character) => character.codePointAt(0) ?? 0)
		.filter((codePoint) => codePoint > 0x20 && codePoint !== 0x7f)
		.map((codePoint) => String.fromCodePoint(codePoint))
		.join('');
}

export function getSafeMarkdownHref(href: string | null | undefined): string | undefined {
	if (href == null) return undefined;

	const trimmedHref = href.trim();
	if (!trimmedHref) return trimmedHref;

	const normalizedForSchemeCheck = removeAsciiWhitespaceAndControls(trimmedHref);
	const scheme = SCHEME_PATTERN.exec(normalizedForSchemeCheck)?.[0]?.toLowerCase();

	if (scheme && !ALLOWED_SCHEMES.has(scheme)) {
		return undefined;
	}

	return trimmedHref;
}
