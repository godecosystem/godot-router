import markdownConfig from '../../src/lib/markdown/configuration/markdown.config.js';

export const MARKDOWN_EXTENSIONS = new Set(
	(markdownConfig.extensions ?? []).map((extension) => extension.toLowerCase())
);

export function toPosixPath(filePath: string): string {
	return filePath.replaceAll('\\', '/');
}
