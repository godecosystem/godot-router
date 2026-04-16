import type { PluggableList } from 'unified';

export type MarkdownConfig = {
	extensions: string[];
	remarkPlugins?: PluggableList;
	rehypePlugins?: PluggableList;
};

export function defineConfig(config: MarkdownConfig): MarkdownConfig {
	return config;
}
