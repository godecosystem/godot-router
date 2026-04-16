import fs from 'node:fs';
import path from 'node:path';
import type { Root, Code } from 'mdast';
import type { Node, Parent } from 'unist';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';
import type { Transformer } from 'unified';

type AttrValue = string | boolean;
type AttrMap = Record<string, AttrValue>;
const REGEX_LITERAL_REGEX = /^\/(.*)\/([a-z]*)$/i;

function toPosixPath(filePath: string): string {
	return filePath.replaceAll('\\', '/');
}

function escapeCodeMetaValue(value: string): string {
	return value.replaceAll('"', String.raw`\"`);
}

/**
 * Remark plugin that replaces a <FileReader file="..." /> MDX/HTML tag
 * with a fenced `code` node containing the referenced file's contents.
 */
// Helper utilities moved outside the transformer so they are easier to test
// and the transformer remains small and focused.

// MDX JSX attribute node shapes we expect from the mdx parser.
interface MdxJsxChildText {
	type?: string;
	value?: string;
}

interface MdxJsxAttributeNode {
	type: 'mdxJsxAttribute';
	name?: string;
	value?: string | MdxJsxChildText[] | { value?: string } | null;
}

interface MdxJsxExpressionAttributeNode {
	type: 'mdxJsxExpressionAttribute';
	name?: string;
	value?: string | { value?: string } | null;
}

type MdxAttribute = MdxJsxAttributeNode | MdxJsxExpressionAttributeNode;

interface MdxJsxElementNode extends Node {
	type: 'mdxJsxFlowElement' | 'mdxJsxTextElement';
	// mdx AST may set `name` to `string` or `null` depending on parser,
	// accept both to remain compatible with library types.
	name: string | null;
	attributes?: MdxAttribute[] | undefined | null;
	children?: unknown[] | undefined | null;
}

function parseMdxAttributes(attributes?: MdxAttribute[]): AttrMap {
	const out: AttrMap = {};
	if (!Array.isArray(attributes)) return out;

	for (const raw of attributes) {
		if (raw.type === 'mdxJsxAttribute') {
			const name = String(raw.name ?? '');
			const val = raw.value;

			if (val === undefined || val === null) {
				out[name] = true;
				continue;
			}

			if (typeof val === 'string') {
				out[name] = val;
				continue;
			}

			if (Array.isArray(val)) {
				out[name] = val.map((c) => (typeof c.value === 'string' ? c.value : '')).join('');
				continue;
			}

			// object with a `value` property
			const inner = (val as { value?: string }).value ?? String(val);
			if (inner === 'true') out[name] = true;
			else if (inner === 'false') out[name] = false;
			else out[name] = inner;
			continue;
		}

		if (raw.type === 'mdxJsxExpressionAttribute') {
			const name = String(raw.name ?? '');
			const inner = raw.value;
			const val =
				typeof inner === 'object' && inner !== null
					? ((inner as { value?: string }).value ?? inner)
					: inner;
			if (val === 'true') out[name] = true;
			else if (val === 'false') out[name] = false;
			else out[name] = (val ?? '') as string;
		}
	}

	return out;
}

function parseHtmlAttributes(value: string): AttrMap {
	const out: AttrMap = {};
	const m = value.match(/<FileReader\s*([^>]*)\/?>(?:<\/FileReader>)?/i);
	if (!m) return out;
	const attrs = m[1] ?? '';
	const re = /([A-Za-z0-9_:-]+)(?:\s*=\s*(?:"([^\"]*)"|'([^']*)'|([^\s"'>/]+)))?/g;
	let mm: RegExpExecArray | null;
	while ((mm = re.exec(attrs))) {
		const name = mm[1];
		const val = mm[2] ?? mm[3] ?? mm[4];
		out[name] = val ?? true;
	}

	return out;
}

function resolveFile(fileRef: string): string | null {
	if (!fileRef) return null;

	try {
		if (path.isAbsolute(fileRef)) {
			return fs.existsSync(fileRef) ? fileRef : null;
		}
		const repoResolved = toPosixPath(path.resolve(process.cwd(), fileRef));
		return fs.existsSync(repoResolved) ? repoResolved : null;
	} catch (err) {
		// avoid throwing in the transformer — report and continue
		console.error('remark-file-reader.resolveFile error', err);
		return null;
	}
}

function trimTrailingBlankLines(content: string): string {
	let s = content.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
	s = s.replaceAll(/(\n\s*)+$/g, '');
	return s;
}

function parseRegexSourceAndFlags(
	rawRegex: string,
	rawFlags: AttrValue | undefined,
	file?: VFile
): { source: string; flags: string } | null {
	let source = rawRegex.trim();
	let flags = String(rawFlags ?? '').trim();

	const literalMatch = REGEX_LITERAL_REGEX.exec(source);
	if (literalMatch) {
		source = literalMatch[1] ?? '';
		if (!flags) flags = literalMatch[2] ?? '';
	}

	flags = Array.from(new Set(flags.split(''))).join('');

	if (!source) {
		if (file) file.message("FileReader: 'regex' pattern is empty");
		return null;
	}

	if (!/^[dgimsuvy]*$/i.test(flags)) {
		if (file) file.message(`FileReader: invalid regexFlags '${flags}'`);
		return null;
	}

	return { source, flags };
}

function extractByRegex(content: string, attrs: AttrMap, file?: VFile): string | null {
	const rawRegex = String(attrs.regex ?? '').trim();
	if (!rawRegex) {
		if (file) file.message("FileReader: 'regex' is empty");
		return null;
	}

	const parsed = parseRegexSourceAndFlags(rawRegex, attrs.regexFlags, file);
	if (!parsed) return null;

	try {
		const regex = new RegExp(parsed.source, parsed.flags);
		const match = regex.exec(content);
		if (!match) {
			if (file)
				file.message(
					`FileReader: regex did not match any content: /${parsed.source}/${parsed.flags}`
				);
			return null;
		}

		if (match.length > 1 && typeof match[1] === 'string') {
			return match[1];
		}

		return match[0];
	} catch (err) {
		if (file)
			file.message(
				`FileReader: invalid regex /${parsed.source}/${parsed.flags}: ${String((err as Error).message ?? err)}`
			);
		return null;
	}
}

function extractContent(content: string, attrs: AttrMap, file?: VFile): string | null {
	let extracted = content;

	if (attrs.regex !== undefined) {
		const byRegex = extractByRegex(extracted, attrs, file);
		if (byRegex === null) return null;
		extracted = byRegex;
	}

	return extracted;
}

function buildMeta(attrs: AttrMap, fileRef: string): string | undefined {
	const parts: string[] = [];

	const highlight = attrs.highlight ?? '';
	const h = String(highlight ?? '').trim();
	if (h) parts.push(h.startsWith('{') && h.endsWith('}') ? h : `{${h}}`);

	const show = attrs.showLineNumbers ?? attrs.showlineNumbers ?? attrs.showLines ?? attrs.show;
	if (show === true || String(show) === 'true' || show === '') parts.push('showLineNumbers');

	const rawTitle = attrs.title ?? fileRef;
	const titleStr = String(rawTitle ?? '').trim() || String(fileRef);
	if (titleStr) parts.push(`title="${escapeCodeMetaValue(titleStr)}"`);

	const caption = attrs.caption ?? '';
	if (caption) parts.push(`caption="${escapeCodeMetaValue(String(caption))}"`);

	return parts.length ? parts.join(' ') : undefined;
}

function readAndTrimFile(resolved: string, file?: VFile, fileRef?: string): string | null {
	try {
		return trimTrailingBlankLines(fs.readFileSync(resolved, 'utf8'));
	} catch (err) {
		if (file)
			file.message(
				`FileReader: failed to read ${resolved}: ${String((err as Error).message ?? err)}`
			);
		else console.error('FileReader: failed to read', resolved, err);
		return null;
	}
}

function createCodeNode(fileRef: string, content: string, attrs: AttrMap): Code {
	const ext = path.extname(fileRef).replace(/^\./, '') || undefined;
	const meta = buildMeta(attrs, fileRef);
	return { type: 'code', lang: ext, meta, value: content } as Code;
}

function replaceWithCode(parent: Parent, index: number, codeNode: Code) {
	parent.children.splice(index, 1, codeNode);
}

function processAttrsAndReplace(
	attrs: AttrMap,
	fileRefRaw: string,
	parent: Parent,
	index: number,
	file?: VFile
) {
	const fileRef = String(fileRefRaw ?? '').trim();
	if (!fileRef) {
		if (file) file.message("<FileReader> missing 'file' attribute");
		return;
	}

	const resolved = resolveFile(fileRef);
	if (!resolved) {
		if (file) file.message(`FileReader: file not found or not absolute: ${fileRef}`);
		else console.error('FileReader: file not found', fileRef);
		return;
	}

	const content = readAndTrimFile(resolved, file, fileRef);
	if (content === null) return;
	const extracted = extractContent(content, attrs, file);
	if (extracted === null) return;

	const codeNode = createCodeNode(fileRef, trimTrailingBlankLines(extracted), attrs);
	replaceWithCode(parent, index, codeNode);
	return index + 1;
}

function isMdxJsxElement(node: Node): node is MdxJsxElementNode {
	return node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';
}

export default function remarkFileReader(): Transformer<Root> {
	return (tree: Root, file?: VFile) => {
		visit(tree, (node: Node, index?: number | null, parent?: Parent | null) => {
			if (!parent || typeof index !== 'number' || !Array.isArray(parent.children)) return;

			if (isMdxJsxElement(node)) {
				if (node.name !== 'FileReader') return;

				const attrs = parseMdxAttributes(node.attributes ?? undefined);
				const fileRef = String(attrs.file ?? '').trim();
				return processAttrsAndReplace(attrs, fileRef, parent, index, file);
			}

			if (node.type === 'html') {
				const html = String((node as Node & { value?: string }).value ?? '');
				if (!/<FileReader\b/i.test(html)) return;

				const attrs = parseHtmlAttributes(html);
				const fileRef = String(attrs.file ?? '').trim();
				return processAttrsAndReplace(attrs, fileRef, parent, index, file);
			}
		});
	};
}
