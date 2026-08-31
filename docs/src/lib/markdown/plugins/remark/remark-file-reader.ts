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

export type RemarkFileReaderOptions = {
	allowedRoots?: string[];
};

type FileResolution =
	| { status: 'resolved'; path: string }
	| { status: 'missing' }
	| { status: 'denied' };

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
	attributes?: MdxAttribute[] | null;
	children?: unknown[] | null;
}

function parseBoolean(value: string): AttrValue {
	if (value === 'true') return true;
	if (value === 'false') return false;
	return value;
}

function getMdxAttributeValue(attribute: MdxAttribute): AttrValue {
	const value = attribute.value;
	if (value === undefined || value === null) return true;
	if (typeof value === 'string') return parseBoolean(value);
	if (Array.isArray(value)) return value.map((child) => child.value ?? '').join('');
	return parseBoolean(value.value ?? '');
}

function parseMdxAttributes(attributes?: MdxAttribute[]): AttrMap {
	const result: AttrMap = {};
	for (const attribute of attributes ?? []) {
		if (!attribute.name) continue;
		result[attribute.name] = getMdxAttributeValue(attribute);
	}
	return result;
}

function getOpeningTag(value: string): string | null {
	const start = value.toLowerCase().indexOf('<filereader');
	if (start === -1) return null;

	let quote = '';
	for (let index = start; index < value.length; index++) {
		const character = value[index];
		if ((character === '"' || character === "'") && (!quote || quote === character)) {
			quote = quote ? '' : character;
		} else if (character === '>' && !quote) {
			return value.slice(start + '<FileReader'.length, index);
		}
	}
	return null;
}

function isAttributeNameCharacter(character: string): boolean {
	return /[A-Za-z0-9_:-]/.test(character);
}

function parseHtmlAttributes(value: string): AttrMap {
	const source = getOpeningTag(value);
	const result: AttrMap = {};
	if (source === null) return result;

	let index = 0;
	while (index < source.length) {
		while (/\s|\//.test(source[index] ?? '')) index++;
		const nameStart = index;
		while (isAttributeNameCharacter(source[index] ?? '')) index++;
		const name = source.slice(nameStart, index);
		if (!name) {
			index++;
			continue;
		}

		while (/\s/.test(source[index] ?? '')) index++;
		if (source[index] !== '=') {
			result[name] = true;
			continue;
		}

		index++;
		while (/\s/.test(source[index] ?? '')) index++;
		const quote = source[index] === '"' || source[index] === "'" ? source[index++] : '';
		const valueStart = index;
		while (
			index < source.length &&
			(quote ? source[index] !== quote : !/\s|\//.test(source[index] ?? ''))
		) {
			index++;
		}
		result[name] = source.slice(valueStart, index);
		if (quote) index++;
	}

	return result;
}

function isWithinRoot(filePath: string, rootPath: string): boolean {
	const relativePath = path.relative(rootPath, filePath);
	return (
		relativePath === '' ||
		(!relativePath.startsWith(`..${path.sep}`) &&
			relativePath !== '..' &&
			!path.isAbsolute(relativePath))
	);
}

export function resolveFileReference(
	fileRef: string,
	options: RemarkFileReaderOptions & { cwd?: string } = {}
): FileResolution {
	if (!fileRef) return { status: 'missing' };

	const cwd = options.cwd ?? process.cwd();
	const resolvedPath = path.resolve(cwd, fileRef);
	if (!fs.existsSync(resolvedPath)) return { status: 'missing' };

	const realFilePath = fs.realpathSync(resolvedPath);
	if (options.allowedRoots === undefined) {
		return { status: 'resolved', path: toPosixPath(realFilePath) };
	}

	const allowed = options.allowedRoots.some((root) => {
		const resolvedRoot = path.resolve(cwd, root);
		if (!fs.existsSync(resolvedRoot)) return false;

		return isWithinRoot(realFilePath, fs.realpathSync(resolvedRoot));
	});

	return allowed ? { status: 'resolved', path: toPosixPath(realFilePath) } : { status: 'denied' };
}

function trimTrailingBlankLines(content: string): string {
	const lines = content.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n');
	while (lines.at(-1)?.trim() === '') lines.pop();
	return lines.join('\n');
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

function readAndTrimFile(resolved: string, file?: VFile): string | null {
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

export function inferCodeLanguage(fileRef: string): string {
	return path.extname(fileRef).replace(/^\./, '') || 'txt';
}

function createCodeNode(fileRef: string, content: string, attrs: AttrMap): Code {
	const ext = inferCodeLanguage(fileRef);
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
	options: RemarkFileReaderOptions,
	file?: VFile
) {
	const fileRef = String(fileRefRaw ?? '').trim();
	if (!fileRef) {
		if (file) file.message("<FileReader> missing 'file' attribute");
		return;
	}

	const resolution = resolveFileReference(fileRef, options);
	if (resolution.status === 'missing') {
		if (file) file.message(`FileReader: file not found: ${fileRef}`);
		else console.error('FileReader: file not found', fileRef);
		return;
	}
	if (resolution.status === 'denied') {
		if (file) file.message(`FileReader: file is outside the configured allowedRoots: ${fileRef}`);
		else console.error('FileReader: file is outside the configured allowedRoots', fileRef);
		return;
	}

	const content = readAndTrimFile(resolution.path, file);
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

export default function remarkFileReader(options: RemarkFileReaderOptions = {}): Transformer<Root> {
	return (tree: Root, file?: VFile) => {
		visit(tree, (node: Node, index?: number | null, parent?: Parent | null) => {
			if (!parent || typeof index !== 'number' || !Array.isArray(parent.children)) return;

			if (isMdxJsxElement(node)) {
				if (node.name !== 'FileReader') return;

				const attrs = parseMdxAttributes(node.attributes ?? undefined);
				const fileRef = String(attrs.file ?? '').trim();
				return processAttrsAndReplace(attrs, fileRef, parent, index, options, file);
			}

			if (node.type === 'html') {
				const html = String((node as Node & { value?: string }).value ?? '');
				if (!/<FileReader\b/i.test(html)) return;

				const attrs = parseHtmlAttributes(html);
				const fileRef = String(attrs.file ?? '').trim();
				return processAttrsAndReplace(attrs, fileRef, parent, index, options, file);
			}
		});
	};
}
