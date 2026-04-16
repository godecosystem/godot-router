import fs from 'node:fs';
import path from 'node:path';
import type { PluginOption } from 'vite';
import { toPosixPath } from './processed-docs/utils.js';

const VIRTUAL_ICON_MANIFEST_ID = 'virtual:icon-manifest';
const RESOLVED_VIRTUAL_ICON_MANIFEST_ID = '\0virtual:icon-manifest';

type IconManifestOptions = {
	files: string[];
	iconPackage: string;
};

const EMOJI_PATTERN = /[\p{Extended_Pictographic}\p{Regional_Indicator}\u{FE0F}\u{20E3}]/u;

function escapeString(value: string): string {
	const escapedBackslash = String.raw`\\`;
	const escapedSingleQuote = String.raw`\'`;
	return value.replaceAll('\\', escapedBackslash).replaceAll("'", escapedSingleQuote);
}

function extractIcons(source: string): string[] {
	const matches = source.matchAll(/\bicon\s*:\s*['"]([^'"\n\r]+)['"]/g);
	const icons = new Set<string>();

	for (const match of matches) {
		const iconName = match[1]?.trim();
		if (iconName && !EMOJI_PATTERN.test(iconName)) {
			icons.add(iconName);
		}
	}

	return [...icons].sort((a, b) => a.localeCompare(b));
}

function generateModuleSource(filePaths: string[], iconPackage: string): string {
	const sourceFiles = filePaths.filter((filePath) => fs.existsSync(filePath));

	if (sourceFiles.length === 0) {
		return 'export default {};';
	}

	const icons = new Set<string>();
	for (const filePath of sourceFiles) {
		const source = fs.readFileSync(filePath, 'utf-8');
		for (const iconName of extractIcons(source)) {
			icons.add(iconName);
		}
	}

	const lines: string[] = [];
	lines.push('const manifest = {};');
	let importIndex = 0;

	for (const iconName of [...icons].sort((a, b) => a.localeCompare(b))) {
		const importName = `icon_${importIndex++}`;
		lines.push(
			`import ${importName} from '${escapeString(iconPackage)}/${escapeString(iconName)}';`,
			`manifest['${escapeString(iconName)}'] = ${importName};`
		);
	}

	lines.push('export default manifest;');
	return lines.join('\n');
}

function getMissingFilePaths(filePaths: string[]): string[] {
	return filePaths.filter((filePath) => !fs.existsSync(filePath));
}

export function iconManifest(options: IconManifestOptions): PluginOption {
	const absoluteFilePaths = options.files.map((filePath) =>
		toPosixPath(path.resolve(process.cwd(), filePath))
	);
	const iconPackage = options.iconPackage.trim();
	const watchedFiles = new Set(absoluteFilePaths);

	return {
		name: 'vite-plugin-icon-manifest',
		resolveId(id) {
			if (id === VIRTUAL_ICON_MANIFEST_ID) {
				return RESOLVED_VIRTUAL_ICON_MANIFEST_ID;
			}

			return null;
		},
		load(id) {
			if (id !== RESOLVED_VIRTUAL_ICON_MANIFEST_ID) {
				return null;
			}

			const missingFilePaths = getMissingFilePaths(absoluteFilePaths);
			if (missingFilePaths.length > 0) {
				this.error(
					`The following icon lookup file${missingFilePaths.length === 1 ? ' is' : 's are'} missing: ${missingFilePaths.join(', ')}`
				);
			}

			return generateModuleSource(absoluteFilePaths, iconPackage);
		},
		handleHotUpdate(ctx) {
			if (!watchedFiles.has(toPosixPath(path.resolve(ctx.file)))) {
				return;
			}

			const virtualModule = ctx.server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ICON_MANIFEST_ID);
			if (virtualModule) {
				ctx.server.moduleGraph.invalidateModule(virtualModule);
			}
		}
	};
}
