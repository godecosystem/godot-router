type MdxComponentImportMap = Record<string, string>;

type MdastNode = {
	type?: string;
	value?: string;
	children?: MdastNode[];
	[key: string]: unknown;
};

const RE_DEFAULT_IMPORT = /^import\s+(?:type\s+)?([\w$]+)\s+from\s+['"]([^'"\n\r]+)['"]/;
const RE_NAMED_IMPORT = /^import\s+\{([^}]+)\}\s+from\s+['"]([^'"\n\r]+)['"]/;
const RE_MIXED_IMPORT = /^import\s+([\w$]+)\s*,\s*\{([^}]+)\}\s+from\s+['"]([^'"\n\r]+)['"]/;
const RE_NAMESPACE_IMPORT = /^import\s+\*\s+as\s+([\w$]+)\s+from\s+['"]([^'"\n\r]+)['"]/;

function applyDefaultImport(imports: MdxComponentImportMap, localName: string, source: string) {
	if (!localName.trim() || !source.trim()) return;
	imports[localName] = source;
}

function applyNamedImports(imports: MdxComponentImportMap, specifierBlock: string, source: string) {
	for (const specifier of specifierBlock.split(',')) {
		const cleanedSpecifier = specifier.trim().replace(/^type\s+/, '');
		if (!cleanedSpecifier) continue;

		const parts = cleanedSpecifier.split(/\s+as\s+/);
		const localName = (parts[1] ?? parts[0]).trim();
		if (!localName) continue;

		imports[localName] = source;
	}
}

function applyNamespaceImport(imports: MdxComponentImportMap, clause: string, source: string) {
	const namespaceMatch = /^\*\s+as\s+([\w$]+)$/.exec(clause.trim());
	if (!namespaceMatch) return;
	applyDefaultImport(imports, namespaceMatch[1], source);
}

function splitImportClause(clause: string): { defaultPart?: string; remainder?: string } {
	let braceDepth = 0;
	for (let i = 0; i < clause.length; i++) {
		const char = clause[i];
		if (char === '{') braceDepth++;
		if (char === '}') braceDepth = Math.max(0, braceDepth - 1);
		if (char === ',' && braceDepth === 0) {
			return {
				defaultPart: clause.slice(0, i).trim(),
				remainder: clause.slice(i + 1).trim()
			};
		}
	}

	return { defaultPart: clause.trim() };
}

function applyImportStatement(imports: MdxComponentImportMap, statement: string) {
	const match = /^import\s+([\s\S]*?)\s+from\s+['"]([^'"\n\r]+)['"]\s*;?\s*$/m.exec(
		statement.trim()
	);
	if (!match) return;

	const clause = match[1].trim();
	const source = match[2].trim();
	if (!clause || !source) return;

	if (clause.startsWith('{') && clause.endsWith('}')) {
		applyNamedImports(imports, clause.slice(1, -1), source);
		return;
	}

	if (clause.startsWith('*')) {
		applyNamespaceImport(imports, clause, source);
		return;
	}

	const split = splitImportClause(clause);
	if (
		split.defaultPart &&
		/^[\w$]+$/.test(split.defaultPart) &&
		!split.defaultPart.startsWith('type ')
	) {
		applyDefaultImport(imports, split.defaultPart, source);
	}

	if (!split.remainder) return;

	if (split.remainder.startsWith('{') && split.remainder.endsWith('}')) {
		applyNamedImports(imports, split.remainder.slice(1, -1), source);
		return;
	}

	if (split.remainder.startsWith('*')) {
		applyNamespaceImport(imports, split.remainder, source);
	}
}

function applyImportBlock(imports: MdxComponentImportMap, block: string) {
	const importMatches = block.matchAll(
		/import\s+(?:type\s+)?[\s\S]*?\s+from\s+['"][^'"\n\r]+['"]\s*;?/gm
	);

	for (const match of importMatches) {
		const statement = match[0]?.trim();
		if (!statement) continue;
		applyImportStatement(imports, statement);
	}
}

export function extractImportDataFromMdast(root: MdastNode): { imports: MdxComponentImportMap } {
	const imports: MdxComponentImportMap = {};

	for (const child of root.children ?? []) {
		if (child.type !== 'mdxjsEsm' || typeof child.value !== 'string') continue;
		applyImportBlock(imports, child.value);
	}

	return { imports };
}

export function stripMdxEsmNodes(root: MdastNode): void {
	if (!Array.isArray(root.children)) return;
	root.children = root.children.filter((child) => child.type !== 'mdxjsEsm');
}

export function extractImportDataFromRaw(rawContent: string): { imports: MdxComponentImportMap } {
	const imports: MdxComponentImportMap = {};
	const lines = rawContent.split('\n');
	let inCodeFence = false;

	for (const line of lines) {
		const trimmed = line.trim();
		if (/^(`{3,}|~{3,})/.test(trimmed)) {
			inCodeFence = !inCodeFence;
			continue;
		}
		if (inCodeFence || !/^import\s/.test(trimmed)) continue;

		const mixedMatch = RE_MIXED_IMPORT.exec(trimmed);
		if (mixedMatch) {
			applyDefaultImport(imports, mixedMatch[1], mixedMatch[3]);
			applyNamedImports(imports, mixedMatch[2], mixedMatch[3]);
			continue;
		}

		const defaultMatch = RE_DEFAULT_IMPORT.exec(trimmed);
		if (defaultMatch) {
			applyDefaultImport(imports, defaultMatch[1], defaultMatch[2]);
			continue;
		}

		const namedMatch = RE_NAMED_IMPORT.exec(trimmed);
		if (namedMatch) {
			applyNamedImports(imports, namedMatch[1], namedMatch[2]);
			continue;
		}

		const namespaceMatch = RE_NAMESPACE_IMPORT.exec(trimmed);
		if (namespaceMatch) {
			applyNamespaceImport(imports, `* as ${namespaceMatch[1]}`, namespaceMatch[2]);
		}
	}

	return { imports };
}

export function stripImportLines(content: string): string {
	const lines = content.split('\n');
	let inCodeFence = false;

	return lines
		.filter((line) => {
			const trimmed = line.trim();
			if (/^(`{3,}|~{3,})/.test(trimmed)) {
				inCodeFence = !inCodeFence;
				return true;
			}
			if (inCodeFence) return true;
			return !/^import\s/.test(trimmed);
		})
		.join('\n');
}
