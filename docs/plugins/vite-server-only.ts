// scripts/vite-plugin-server-guard.ts
import type { Plugin } from 'vite';
import path from 'node:path';
import { toPosixPath } from './processed-docs/utils.js';

interface GuardOptions {
	folders?: string[];
	files?: string[];
}

function stripQueryAndHash(id: string): string {
	return id.split('?')[0].split('#')[0];
}

function toAbsolutePath(fileId: string, projectRoot: string): string {
	return path.isAbsolute(fileId)
		? toPosixPath(path.normalize(fileId))
		: toPosixPath(path.resolve(projectRoot, fileId));
}

function isServerImporter(importer: string): boolean {
	const normalized = toPosixPath(path.normalize(importer));

	// Allow any module nested in a conventional "server" folder.
	if (normalized.includes('/server/')) {
		return true;
	}

	// SvelteKit server modules.
	return (
		/(?:^|[/\\])(?:\+page|\+layout|hooks)\.server\.[cm]?[jt]s$/.test(normalized) ||
		/(?:^|[/\\])\+server\.[cm]?[jt]s$/.test(normalized)
	);
}

function isBuildToolImporter(importer: string, projectRoot: string): boolean {
	const absoluteImporter = toAbsolutePath(importer, projectRoot);

	const pluginsRoot = toPosixPath(path.join(projectRoot, 'plugins'));

	if (absoluteImporter === pluginsRoot || absoluteImporter.startsWith(pluginsRoot + '/')) {
		return true;
	}

	return /[/\\]vite\.config\.[cm]?[jt]s$/.test(absoluteImporter);
}

/**
 * Vite plugin to strictly enforce server-only folders and specific files in SvelteKit.
 */
export function protectServerAssets(options: GuardOptions): Plugin {
	const projectRoot = toPosixPath(process.cwd());
	const srcRoot = toPosixPath(path.join(projectRoot, 'src'));

	// Normalize all provided paths to absolute for reliable comparison
	const protectedFolders = (options.folders || []).map((f) =>
		toPosixPath(path.resolve(projectRoot, f))
	);
	const protectedFiles = (options.files || []).map((f) =>
		toPosixPath(path.resolve(projectRoot, f))
	);

	return {
		name: 'vite-plugin-sveltekit-server-guard',
		enforce: 'pre',
		async resolveId(source, importer, options) {
			if (!importer) {
				return null;
			}

			const importerId = stripQueryAndHash(importer);

			// Ignore Vite virtual importers.
			if (importerId.startsWith('\0')) {
				return null;
			}

			const resolved = await this.resolve(source, importer, {
				...options,
				skipSelf: true
			});
			const resolvedSourceId = stripQueryAndHash(resolved?.id ?? '');

			// Only guard real file imports. Virtual and bare IDs are not filesystem assets.
			if (
				!resolvedSourceId ||
				resolvedSourceId.startsWith('\0') ||
				!path.isAbsolute(resolvedSourceId)
			) {
				return null;
			}

			const resolvedSource = toPosixPath(path.normalize(resolvedSourceId));

			// Check 1: Is it in a protected folder?
			const isInProtectedFolder = protectedFolders.some(
				(folder) => resolvedSource.startsWith(folder + '/') || resolvedSource === folder
			);

			// Check 2: Is it a specifically protected file?
			const isProtectedFile = protectedFiles.some(
				(file) => resolvedSource === file || resolvedSource.startsWith(file + '.')
			);

			if (isInProtectedFolder || isProtectedFile) {
				const absoluteImporter = toAbsolutePath(importerId, projectRoot);

				// Only enforce runtime leak checks for app source modules.
				// Non-source importers (e.g. index.html) can appear during Vite resolution.
				const isSourceImporter =
					absoluteImporter === srcRoot || absoluteImporter.startsWith(srcRoot + '/');
				if (!isSourceImporter) {
					return null;
				}

				const isServerContext = isServerImporter(importerId);
				const isBuildToolContext = isBuildToolImporter(importerId, projectRoot);

				if (!isServerContext && !isBuildToolContext) {
					throw new Error(
						`\n[SECURITY VIOLATION] Unsafe Server-Only Import!\n` +
							`-----------------------------------------------\n` +
							`Protected Resource: ${resolvedSource}\n` +
							`Attempted by:       ${importerId}\n` +
							`-----------------------------------------------\n` +
							`Action: Move this logic to a client-safe file or ensure the importer is a .server module.\n`
					);
				}
			}
			return null;
		}
	};
}
