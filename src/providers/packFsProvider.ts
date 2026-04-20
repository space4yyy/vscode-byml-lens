import * as vscode from 'vscode';
import { SarcArchive } from '../core/sarc.js';
import * as path from 'path';
import { Logger } from '../core/logger.js';

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

        if (!found) {
            Logger.error(`Archive boundary not found in path: ${uri.path}`);
            throw vscode.FileSystemError.FileNotFound(uri);
        }

        const archiveUri = vscode.Uri.file(archivePath);
        const archiveKey = archiveUri.toString();

        if (!this.archives.has(archiveKey)) {
            Logger.log(`Loading new SARC archive: ${archiveUri.fsPath}`);
            try {
                const data = await vscode.workspace.fs.readFile(archiveUri);
                const archive = new SarcArchive(new Uint8Array(data));
                this.archives.set(archiveKey, archive);
                Logger.log(`SARC loaded successfully. Files: ${archive.files.length}`);
            } catch (err: any) {
                Logger.error(`Failed to load SARC: ${err.message}`);
                throw err;
            }
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
        try {
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
        } catch (err) {
            throw err;
        }
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
        this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Changed, uri }]);
        // Note: save is disabled until encode is implemented
    }

    async delete(uri: vscode.Uri, _options: { readonly recursive: boolean; }): Promise<void> {
        const { archive, internalPath } = await this.getArchive(uri);
        archive.files = archive.files.filter(f => f.name !== internalPath && !f.name.startsWith(internalPath + '/'));
        this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Deleted, uri }]);
    }

    rename(_oldUri: vscode.Uri, _newUri: vscode.Uri, _options: { readonly overwrite: boolean; }): void { }
}
