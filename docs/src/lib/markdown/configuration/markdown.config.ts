import { defineConfig } from './define-config';

// remark plugins
import remarkGfm from 'remark-gfm';
import remarkFileReader from '../plugins/remark/remark-file-reader';
import remarkRehype from 'remark-rehype';

// rehype plugins
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypePromoteCodeMeta from '../plugins/rehype/promote-code-meta';
import rehypeNormalizeMdxParagraphs from '../plugins/rehype/normalize-mdx-paragraphs';
import rehypeMarkPreHasCode from '../plugins/rehype/mark-pre-has-code';
import rehypeTransformCodeGroup from '../plugins/rehype/transform-code-group';
import rehypeClassnameToClass from '../plugins/rehype/classname-to-class';
import rehypeTrimCodeLineWhitespace from '../plugins/rehype/trim-code-line-whitespace';

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
