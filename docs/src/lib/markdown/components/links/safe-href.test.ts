import { describe, expect, test } from 'bun:test';
import { getSafeMarkdownHref } from './safe-href';

describe('getSafeMarkdownHref', () => {
	test.each([
		'/docs/getting-started',
		'../guides/server-side-rendering',
		'#configuration',
		'https://example.com/docs',
		'http://localhost:5173/docs',
		'//cdn.example.com/asset',
		'mailto:docs@example.com',
		'tel:+15551234567'
	])('allows %s', (href) => {
		expect(getSafeMarkdownHref(href)).toBe(href);
	});

	test.each([
		'javascript:alert(1)',
		'java\nscript:alert(1)',
		' data:text/html,<script>alert(1)</script> ',
		'vbscript:msgbox(1)',
		'file:///etc/passwd'
	])('rejects %s', (href) => {
		expect(getSafeMarkdownHref(href)).toBeUndefined();
	});

	test('preserves an empty link target', () => {
		expect(getSafeMarkdownHref('  ')).toBe('');
	});

	test('handles a missing link target', () => {
		expect(getSafeMarkdownHref(undefined)).toBeUndefined();
	});
});
