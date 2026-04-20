import * as vscode from 'vscode';
import { SarcArchive } from '../core/sarc.js';
import * as path from 'path';
import { Logger } from '../core/logger.js';

export class PackFileSystemProvider implements vscode.FileSystemProvider {
    private _onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._onDidChangeFile.event;

    private archives = new Map<string, { archive: SarcArchive, isDirty: boolean }>();

    public isDirty(uri: vscode.Uri): boolean {
        const key = this.getArchiveKey(uri);
        return this.archives.get(key)?.isDirty || false;
    }

    private getArchiveKey(uri: vscode.Uri): string {
        const parts = uri.path.split('/');
        let archivePath = '';
        for (let i = 0; i < parts.length; i++) {
            if (!parts[i]) continue;
            archivePath = archivePath === '' ? '/' + parts[i] : path.join(archivePath, parts[i]);
            if (parts[i].toLowerCase().endsWith('.pack') || 
                parts[i].toLowerCase().endsWith('.pack.zs') || 
                parts[i].toLowerCase().endsWith('.sarc') ||
                parts[i].toLowerCase().endsWith('.sarc.zs')) {
                return vscode.Uri.file(archivePath).toString();
            }
        }
        return '';
    }

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
            this.archives.set(archiveKey, {
                archive: new SarcArchive(new Uint8Array(data)),
                isDirty: false
            });
        }

        return {
            archive: this.archives.get(archiveKey)!.archive,
            internalPath,
            archiveUri
        };
    }

    public async commitChanges(uri: vscode.Uri): Promise<void> {
        const archiveKey = uri.toString();
        const entry = this.archives.get(archiveKey);
        if (entry && entry.isDirty) {
            Logger.log(`Committing SARC changes to disk: ${uri.fsPath}`);
            const encoded = entry.archive.encode();
            await vscode.workspace.fs.writeFile(uri, encoded);
            entry.isDirty = false;
            Logger.log(`SARC saved successfully.`);
        }
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
            return { type: vscode.FileType.File, ctime: 0, mtime: 0, size: file.data.length };
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
        return file.data;
    }

    async writeFile(uri: vscode.Uri, content: Uint8Array, options: { readonly create: boolean; readonly overwrite: boolean; }): Promise<void> {
        const { archive, internalPath, archiveUri } = await this.getArchive(uri);
        const fileIdx = archive.files.findIndex(f => f.name === internalPath);
        if (fileIdx !== -1) {
            if (!options.overwrite) throw vscode.FileSystemError.FileExists(uri);
            archive.files[fileIdx].data = content;
        } else {
            if (!options.create) throw vscode.FileSystemError.FileNotFound(uri);
            archive.files.push({ name: internalPath, data: content });
        }
        
        // Mark as dirty, but don't save to disk yet (Performance optimization)
        const key = archiveUri.toString();
        const entry = this.archives.get(key);
        if (entry) entry.isDirty = true;

        Logger.log(`Updated file in memory: ${internalPath}. SARC marked as dirty.`);
        this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Changed, uri }]);
        
        vscode.window.setStatusBarMessage(`$(sync~spin) SARC Modified (Unsaved)`, 3000);
    }

    async delete(uri: vscode.Uri, _options: { readonly recursive: boolean; }): Promise<void> {
        const { archive, internalPath, archiveUri } = await this.getArchive(uri);
        archive.files = archive.files.filter(f => f.name !== internalPath && !f.name.startsWith(internalPath + '/'));
        
        const entry = this.archives.get(archiveUri.toString());
        if (entry) entry.isDirty = true;
        
        this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Deleted, uri }]);
    }

    rename(_oldUri: vscode.Uri, _newUri: vscode.Uri, _options: { readonly overwrite: boolean; }): void { }
}
