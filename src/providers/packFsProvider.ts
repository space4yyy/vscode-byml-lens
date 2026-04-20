import * as vscode from 'vscode';
import { SarcArchive } from '../core/sarc.js';
import * as path from 'path';

export class PackFileSystemProvider implements vscode.FileSystemProvider {
    private _onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._onDidChangeFile.event;

    private archives = new Map<string, SarcArchive>();

    // Scheme: sarc
    // URI: sarc://path/to/archive.pack/internal/path/to/file.bin

    private async getArchive(uri: vscode.Uri): Promise<{ archive: SarcArchive, internalPath: string, archiveUri: vscode.Uri }> {
        // Find the boundary between the physical file and internal path
        // For simplicity, we assume the first part that ends with .pack or .pack.zs is the archive
        const parts = uri.path.split('/');
        let archivePath = '';
        let internalPath = '';
        let found = false;

        for (let i = 0; i < parts.length; i++) {
            archivePath = path.join(archivePath, parts[i]);
            if (parts[i].endsWith('.pack') || parts[i].endsWith('.pack.zs') || parts[i].endsWith('.sarc')) {
                internalPath = parts.slice(i + 1).join('/');
                found = true;
                break;
            }
        }

        if (!found) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }

        const archiveUri = vscode.Uri.file(archivePath);
        const archiveKey = archiveUri.toString();

        if (!this.archives.has(archiveKey)) {
            const data = await vscode.workspace.fs.readFile(archiveUri);
            this.archives.set(archiveKey, new SarcArchive(data));
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
            return {
                type: vscode.FileType.Directory,
                ctime: 0,
                mtime: 0,
                size: 0
            };
        }

        // Check if it's a file
        const file = archive.files.find(f => f.name === internalPath);
        if (file) {
            return {
                type: vscode.FileType.File,
                ctime: 0,
                mtime: 0,
                size: file.data.length
            };
        }

        // Check if it's a directory
        const isDir = archive.files.some(f => f.name.startsWith(internalPath + '/'));
        if (isDir) {
            return {
                type: vscode.FileType.Directory,
                ctime: 0,
                mtime: 0,
                size: 0
            };
        }

        throw vscode.FileSystemError.FileNotFound(uri);
    }

    async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
        const { archive, internalPath } = await this.getArchive(uri);
        const prefix = internalPath === '' ? '' : internalPath + '/';
        
        const entries = new Map<string, vscode.FileType>();
        
        for (const file of archive.files) {
            if (file.name.startsWith(prefix)) {
                const relative = file.name.substring(prefix.length);
                const slashIdx = relative.indexOf('/');
                if (slashIdx === -1) {
                    entries.set(relative, vscode.FileType.File);
                } else {
                    entries.set(relative.substring(0, slashIdx), vscode.FileType.Directory);
                }
            }
        }

        return Array.from(entries.entries());
    }

    createDirectory(_uri: vscode.Uri): void | Thenable<void> {
        throw new Error('Method not implemented.');
    }

    async readFile(uri: vscode.Uri): Promise<Uint8Array> {
        const { archive, internalPath } = await this.getArchive(uri);
        const file = archive.files.find(f => f.name === internalPath);
        if (!file) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        return file.data;
    }

    async writeFile(uri: vscode.Uri, content: Uint8Array, options: { readonly create: boolean; readonly overwrite: boolean; }): Promise<void> {
        const { archive, internalPath, archiveUri } = await this.getArchive(uri);
        
        const fileIdx = archive.files.findIndex(f => f.name === internalPath);
        if (fileIdx !== -1) {
            if (!options.overwrite) {
                throw vscode.FileSystemError.FileExists(uri);
            }
            archive.files[fileIdx].data = content;
        } else {
            if (!options.create) {
                throw vscode.FileSystemError.FileNotFound(uri);
            }
            archive.files.push({ name: internalPath, data: content });
        }

        this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Changed, uri }]);
        
        // Automatically save the archive back to disk
        // Note: For large archives, we might want to debouncing this or use a manual save command
        const encoded = archive.encode();
        await vscode.workspace.fs.writeFile(archiveUri, encoded);
    }

    async delete(uri: vscode.Uri, _options: { readonly recursive: boolean; }): Promise<void> {
        const { archive, internalPath, archiveUri } = await this.getArchive(uri);
        
        const initialCount = archive.files.length;
        archive.files = archive.files.filter(f => f.name !== internalPath && !f.name.startsWith(internalPath + '/'));
        
        if (archive.files.length === initialCount) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }

        this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Deleted, uri }]);
        
        const encoded = archive.encode();
        await vscode.workspace.fs.writeFile(archiveUri, encoded);
    }

    rename(_oldUri: vscode.Uri, _newUri: vscode.Uri, _options: { readonly overwrite: boolean; }): void | Thenable<void> {
        throw new Error('Method not implemented.');
    }
}
