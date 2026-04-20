import * as vscode from 'vscode';
import * as byml from '../core/byml.js';
import { Logger } from '../core/logger.js';

export class BymlYamlProvider implements vscode.FileSystemProvider {
    private _onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._onDidChangeFile.event;

    /**
     * Resolves the source URI. 
     * We now look at the query string to see if the original URI was preserved.
     */
    private getSourceUri(uri: vscode.Uri): vscode.Uri {
        if (uri.query) {
            try {
                return vscode.Uri.parse(uri.query);
            } catch (e) {
                Logger.error("Failed to parse source URI from query", e);
            }
        }
        
        // Fallback: strip .yaml and assume file scheme
        let path = uri.path;
        if (path.endsWith('.yaml')) {
            path = path.slice(0, -5);
        }
        return vscode.Uri.file(path);
    }

    watch(_uri: vscode.Uri, _options: { readonly recursive: boolean; readonly excludes: readonly string[]; }): vscode.Disposable {
        return new vscode.Disposable(() => { });
    }

    async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
        const sourceUri = this.getSourceUri(uri);
        try {
            const stats = await vscode.workspace.fs.stat(sourceUri);
            return { ...stats, type: vscode.FileType.File };
        } catch (err) {
            return { type: vscode.FileType.File, ctime: Date.now(), mtime: Date.now(), size: 0 };
        }
    }

    readDirectory(_uri: vscode.Uri): [string, vscode.FileType][] { return []; }
    createDirectory(_uri: vscode.Uri): void { }

    async readFile(uri: vscode.Uri): Promise<Uint8Array> {
        const sourceUri = this.getSourceUri(uri);
        Logger.log(`Reading BYML from source: ${sourceUri.toString()}`);
        
        try {
            const binaryData = await vscode.workspace.fs.readFile(sourceUri);
            const yamlStr = byml.bymlToYaml(new Uint8Array(binaryData));
            return new TextEncoder().encode(yamlStr);
        } catch (err: any) {
            Logger.error(`Decryption/Parsing failed for ${sourceUri.toString()}`, err);
            return new TextEncoder().encode(`# BYML Inspector Error\n# Source: ${sourceUri.toString()}\n# Error: ${err.message}`);
        }
    }

    async writeFile(uri: vscode.Uri, content: Uint8Array, _options: { readonly create: boolean; readonly overwrite: boolean; }): Promise<void> {
        const sourceUri = this.getSourceUri(uri);
        const yamlStr = new TextDecoder().decode(content);
        
        try {
            const originalBinary = await vscode.workspace.fs.readFile(sourceUri);
            const encoded = byml.yamlToByml(yamlStr, new Uint8Array(originalBinary));
            await vscode.workspace.fs.writeFile(sourceUri, encoded);
            vscode.window.setStatusBarMessage('$(check) BYML Saved Successfully', 3000);
        } catch (err: any) {
            Logger.error(`Write failed for ${sourceUri.toString()}`, err);
            vscode.window.showErrorMessage(`BYML Save Error: ${err.message}`);
            throw err;
        }
    }

    delete(_uri: vscode.Uri, _options: { readonly recursive: boolean; }): void { }
    rename(_oldUri: vscode.Uri, _newUri: vscode.Uri, _options: { readonly overwrite: boolean; }): void { }
}
