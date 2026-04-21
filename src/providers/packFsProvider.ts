import * as vscode from 'vscode';
import * as byml from '../core/byml.js';
import { SarcArchive } from '../core/sarc.js';
import { Logger } from '../core/logger.js';
import * as path from 'path';

export class PackFileSystemProvider implements vscode.FileSystemProvider {
    private _onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._onDidChangeFile.event;

    private archives = new Map<string, SarcArchive>();

    private async getArchive(uri: vscode.Uri): Promise<{ archive: SarcArchive, internalPath: string, archiveUri: vscode.Uri }> {
        const parts = uri.path.split('/');
        let archivePath = '';
        let internalPath = '';
        let found = false;

        for (let i = 0; i < parts.length; i++) {
            if (!parts[i]) continue;
            archivePath = archivePath === '' ? '/' + parts[i] : path.join(archivePath, parts[i]);
            if (parts[i].toLowerCase().endsWith('.pack') || 
                parts[i].toLowerCase().endsWith('.pack.zs') || 
                parts[i].toLowerCase().endsWith('.sarc') ||
                parts[i].toLowerCase().endsWith('.sarc.zs')) {
                internalPath = parts.slice(i + 1).join('/');
                found = true;
                break;
            }
        }

        if (!found) throw vscode.FileSystemError.FileNotFound(uri);

        const archiveUri = vscode.Uri.file(archivePath);
        const archiveKey = archiveUri.toString();

        if (!this.archives.has(archiveKey)) {
            const data = await vscode.workspace.fs.readFile(archiveUri);
            this.archives.set(archiveKey, new SarcArchive(new Uint8Array(data)));
        }

        return {
            archive: this.archives.get(archiveKey)!,
            internalPath,
            archiveUri
        };
    }

    watch(_uri: vscode.Uri, _options: { readonly recursive: boolean; readonly excludes: readonly string[]; }): vscode.Disposable {
        return new vscode.Disposable(() => { });
    }

    async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
        const { archive, internalPath } = await this.getArchive(uri);
        if (internalPath === '' || internalPath === '/') {
            return { type: vscode.FileType.Directory, ctime: 0, mtime: 0, size: 0 };
        }
        const file = archive.files.find(f => f.name === internalPath);
        if (file) {
            // For BYML files, we pretend they are text files for the search engine
            const ext = path.extname(internalPath).toLowerCase();
            const isByml = ext === '.byml' || ext === '.bgyml';
            return { 
                type: vscode.FileType.File, 
                ctime: 0, 
                mtime: 0, 
                size: isByml ? file.data.length * 5 : file.data.length // Estimate YAML size
            };
        }
        const isDir = archive.files.some(f => f.name.startsWith(internalPath + '/'));
        if (isDir) {
            return { type: vscode.FileType.Directory, ctime: 0, mtime: 0, size: 0 };
        }
        throw vscode.FileSystemError.FileNotFound(uri);
    }

    async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
        const { archive, internalPath } = await this.getArchive(uri);
        const prefix = internalPath === '' ? '' : (internalPath.endsWith('/') ? internalPath : internalPath + '/');
        const entries = new Map<string, vscode.FileType>();
        for (const file of archive.files) {
            if (file.name.startsWith(prefix)) {
                const relative = file.name.substring(prefix.length);
                const slashIdx = relative.indexOf('/');
                if (slashIdx === -1) {
                    if (relative) entries.set(relative, vscode.FileType.File);
                } else {
                    const dirName = relative.substring(0, slashIdx);
                    if (dirName) entries.set(dirName, vscode.FileType.Directory);
                }
            }
        }
        return Array.from(entries.entries());
    }

    createDirectory(_uri: vscode.Uri): void { }

    async readFile(uri: vscode.Uri): Promise<Uint8Array> {
        const { archive, internalPath } = await this.getArchive(uri);
        const file = archive.files.find(f => f.name === internalPath);
        if (!file) throw vscode.FileSystemError.FileNotFound(uri);

        // SEARCH ENGINE HACK:
        // If a BYML file is requested and the caller expects text, we return YAML.
        // VS Code's search engine will now "see" the YAML content!
        const ext = path.extname(internalPath).toLowerCase();
        if (ext === '.byml' || ext === '.bgyml') {
            try {
                const yamlStr = byml.bymlToYaml(file.data);
                return new TextEncoder().encode(yamlStr);
            } catch (e) {
                return file.data;
            }
        }

        return file.data;
    }

    async writeFile(uri: vscode.Uri, content: Uint8Array, options: { readonly create: boolean; readonly overwrite: boolean; }): Promise<void> {
        const { archive, internalPath, archiveUri } = await this.getArchive(uri);
        
        const ext = path.extname(internalPath).toLowerCase();
        let finalData = content;

        if (ext === '.byml' || ext === '.bgyml') {
            try {
                // If it's YAML text from the editor, encode it
                const text = new TextDecoder().decode(content);
                if (text.includes(':')) { // Simple YAML check
                    const originalFile = archive.files.find(f => f.name === internalPath);
                    finalData = byml.yamlToByml(text, originalFile?.data);
                }
            } catch (e) { }
        }

        const fileIdx = archive.files.findIndex(f => f.name === internalPath);
        if (fileIdx !== -1) {
            if (!options.overwrite) throw vscode.FileSystemError.FileExists(uri);
            archive.files[fileIdx].data = finalData;
        } else {
            if (!options.create) throw vscode.FileSystemError.FileNotFound(uri);
            archive.files.push({ name: internalPath, data: finalData });
        }

        try {
            const encoded = archive.encode();
            await vscode.workspace.fs.writeFile(archiveUri, encoded);
            this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Changed, uri }]);
            vscode.window.setStatusBarMessage('$(check) SARC Saved', 2000);
        } catch (err: any) {
            vscode.window.showErrorMessage(`Failed to write to pack: ${err.message}`);
        }
    }

    async delete(uri: vscode.Uri, _options: { readonly recursive: boolean; }): Promise<void> {
        const { archive, internalPath, archiveUri } = await this.getArchive(uri);
        archive.files = archive.files.filter(f => f.name !== internalPath && !f.name.startsWith(internalPath + '/'));
        try {
            const encoded = archive.encode();
            await vscode.workspace.fs.writeFile(archiveUri, encoded);
            this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Deleted, uri }]);
        } catch (err: any) { }
    }

    rename(_oldUri: vscode.Uri, _newUri: vscode.Uri, _options: { readonly overwrite: boolean; }): void { }
}
