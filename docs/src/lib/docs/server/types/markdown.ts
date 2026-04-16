import type { Root as HastRoot } from 'hast';

export type MarkdownMetadata = {
	title?: string;
	description?: string;
	keywords?: string[];
};

export type TableOfContentsHeading = {
	id: string;
	text: string;
	tagLevel: number;
};

export type MarkdownContent = {
	raw: string;
	search: string;
};

export type MarkdownAstResult = {
	metadata: MarkdownMetadata;
	tableOfContents: TableOfContentsHeading[];
	content: MarkdownContent;
	imports: Record<string, string>;
	ast: HastRoot;
};
