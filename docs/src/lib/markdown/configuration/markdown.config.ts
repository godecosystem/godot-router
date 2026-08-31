import { defineConfig } from './define-config.ts';

// remark plugins
import remarkGfm from 'remark-gfm';
import remarkFileReader from '../plugins/remark/remark-file-reader.ts';
import remarkRehype from 'remark-rehype';

// rehype plugins
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypePromoteCodeMeta from '../plugins/rehype/promote-code-meta.ts';
import rehypeNormalizeMdxParagraphs from '../plugins/rehype/normalize-mdx-paragraphs.ts';
import rehypeMarkPreHasCode from '../plugins/rehype/mark-pre-has-code.ts';
import rehypeTransformCodeGroup from '../plugins/rehype/transform-code-group.ts';
import rehypeClassnameToClass from '../plugins/rehype/classname-to-class.ts';
import rehypeTrimCodeLineWhitespace from '../plugins/rehype/trim-code-line-whitespace.ts';

// other plugins / options
import { transformerNotationDiff } from '@shikijs/transformers';

const markdownConfig = defineConfig({
	extensions: ['.md', '.mdx'],
	remarkPlugins: [
		remarkGfm,
		remarkFileReader,
		[
			remarkRehype,
			{
				footnoteBackContent: '↩\uFE0E'
			}
		]
	],
	rehypePlugins: [
		rehypeSlug,
		[
			rehypePrettyCode,
			{
				theme: {
					light: 'github-light',
					dark: 'github-dark'
				},
				keepBackground: false,
				transformers: [transformerNotationDiff()]
			}
		],
		rehypeTrimCodeLineWhitespace,
		rehypeClassnameToClass,
		rehypePromoteCodeMeta,
		rehypeMarkPreHasCode,
		rehypeTransformCodeGroup,
		rehypeNormalizeMdxParagraphs
	]
});

export default markdownConfig;
