import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Escapes special characters in a string for use in a regular expression.
 * @param input The string to escape.
 * @returns The escaped string.
 */
export function escapeRegex(input: string): string {
	return input.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * Strips content and adds ellipses if over the character limit.
 * @param text The text to strip.
 * @param match The substring to match.
 * @param totalCharacters The total number of characters to include.
 * @param maxFront The maximum number of characters to include before the match.
 * @returns The stripped content.
 */
export function stripContent(
	text: string,
	match: string,
	totalCharacters: number = 80,
	maxFront: number = 20
) {
	const regex = new RegExp(`(${escapeRegex(match)})`, 'gi');
	const foundPosition: number = text.search(regex);

	// subtract 20 characters from front
	const start = foundPosition > totalCharacters ? Math.max(0, foundPosition - maxFront) : 0;

	// subtract from start to get remaining characters
	totalCharacters -= foundPosition - start;

	// add remaining characters to get end position
	const end: number = foundPosition + totalCharacters;

	// if there was more content at the beginning, then have leading ...
	let newContent = start > 0 ? '... ' : '';
	newContent += text.substring(start, end);

	// if there was more content at the end, then have trailing ...
	if (text.length > end) newContent += ' ...';

	return newContent;
}
