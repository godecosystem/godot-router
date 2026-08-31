import { afterEach, describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inferCodeLanguage, resolveFileReference } from './remark-file-reader';

const temporaryDirectories: string[] = [];

function createTemporaryDirectory() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sveldocs-file-reader-'));
	temporaryDirectories.push(directory);
	return directory;
}

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});

describe('inferCodeLanguage', () => {
	test('defaults extensionless files and dotfiles to text', () => {
		expect(inferCodeLanguage('LICENSE')).toBe('txt');
		expect(inferCodeLanguage('.templatesyncignore')).toBe('txt');
	});

	test('uses the file extension when present', () => {
		expect(inferCodeLanguage('src/app.ts')).toBe('ts');
		expect(inferCodeLanguage('.env.example')).toBe('example');
	});
});

describe('resolveFileReference', () => {
	test('allows sibling-project traversal by default', () => {
		const workspace = createTemporaryDirectory();
		const docsRoot = path.join(workspace, 'docs');
		const appFile = path.join(workspace, 'app', 'src', 'game.ts');
		fs.mkdirSync(docsRoot, { recursive: true });
		fs.mkdirSync(path.dirname(appFile), { recursive: true });
		fs.writeFileSync(appFile, 'export const game = true;');

		expect(resolveFileReference('../app/src/game.ts', { cwd: docsRoot })).toEqual({
			status: 'resolved',
			path: appFile
		});
	});

	test('allows absolute external paths by default', () => {
		const docsRoot = createTemporaryDirectory();
		const externalRoot = createTemporaryDirectory();
		const externalFile = path.join(externalRoot, 'shared.ts');
		fs.writeFileSync(externalFile, 'export const shared = true;');

		expect(resolveFileReference(externalFile, { cwd: docsRoot })).toEqual({
			status: 'resolved',
			path: externalFile
		});
	});

	test('allows files under any configured root', () => {
		const workspace = createTemporaryDirectory();
		const docsRoot = path.join(workspace, 'docs');
		const appRoot = path.join(workspace, 'app');
		const appFile = path.join(appRoot, 'src', 'game.ts');
		fs.mkdirSync(docsRoot, { recursive: true });
		fs.mkdirSync(path.dirname(appFile), { recursive: true });
		fs.writeFileSync(appFile, 'export const game = true;');

		expect(
			resolveFileReference('../app/src/game.ts', {
				cwd: docsRoot,
				allowedRoots: ['.', '../app']
			})
		).toEqual({ status: 'resolved', path: appFile });
	});

	test('denies traversal outside configured roots', () => {
		const workspace = createTemporaryDirectory();
		const docsRoot = path.join(workspace, 'docs');
		const secretFile = path.join(workspace, 'secret.txt');
		fs.mkdirSync(docsRoot, { recursive: true });
		fs.writeFileSync(secretFile, 'secret');

		expect(resolveFileReference('../secret.txt', { cwd: docsRoot, allowedRoots: ['.'] })).toEqual({
			status: 'denied'
		});
	});

	test('does not confuse sibling path prefixes with descendants', () => {
		const workspace = createTemporaryDirectory();
		const allowedRoot = path.join(workspace, 'app');
		const siblingFile = path.join(workspace, 'app-private', 'secret.txt');
		fs.mkdirSync(allowedRoot, { recursive: true });
		fs.mkdirSync(path.dirname(siblingFile), { recursive: true });
		fs.writeFileSync(siblingFile, 'secret');

		expect(
			resolveFileReference(siblingFile, { cwd: workspace, allowedRoots: [allowedRoot] })
		).toEqual({ status: 'denied' });
	});

	test('denies symlinks that escape configured roots', () => {
		const workspace = createTemporaryDirectory();
		const docsRoot = path.join(workspace, 'docs');
		const externalRoot = createTemporaryDirectory();
		const externalFile = path.join(externalRoot, 'secret.txt');
		fs.mkdirSync(docsRoot, { recursive: true });
		fs.writeFileSync(externalFile, 'secret');
		fs.symlinkSync(externalFile, path.join(docsRoot, 'linked-secret.txt'));

		expect(
			resolveFileReference('linked-secret.txt', { cwd: docsRoot, allowedRoots: ['.'] })
		).toEqual({ status: 'denied' });
	});

	test('reports missing files separately', () => {
		const docsRoot = createTemporaryDirectory();

		expect(resolveFileReference('missing.ts', { cwd: docsRoot, allowedRoots: ['.'] })).toEqual({
			status: 'missing'
		});
	});
});
