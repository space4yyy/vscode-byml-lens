import * as vscode from 'vscode';
import * as byml from '../core/byml.js';
import { Logger } from '../core/logger.js';
import { AliasManager } from '../core/alias.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class BymlYamlProvider implements vscode.FileSystemProvider {
    private _onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._onDidChangeFile.event;

    // Cache to store the location of the initial "Original" binary files on disk
    private shadowCache = new Map<string, string>();
    private tempDir: string;

    constructor() {
        this.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'byml-shadow-'));
        Logger.info(`Shadow backup directory initialized at: ${this.tempDir}`);
    }

    private getSourceUri(uri: vscode.Uri): { uri: vscode.Uri, isOriginal: boolean } {
        let isOriginal = false;
        let pathStr = uri.path;

        if (pathStr.endsWith('.original.yaml')) {
            isOriginal = true;
            pathStr = pathStr.slice(0, -14);
        } else if (pathStr.endsWith('.yaml')) {
            pathStr = pathStr.slice(0, -5);
        }

        if (uri.query) {
            return { uri: vscode.Uri.parse(uri.query), isOriginal };
        }
        return { uri: vscode.Uri.file(pathStr), isOriginal };
    }

    /**
     * Creates a one-time shadow backup of the file if it doesn't exist.
     */
    private async ensureShadowBackup(sourceUri: vscode.Uri) {
        const key = sourceUri.toString();
        if (!this.shadowCache.has(key)) {
            try {
                const data = await vscode.workspace.fs.readFile(sourceUri);
                const shadowPath = path.join(this.tempDir, Buffer.from(key).toString('hex').slice(-16) + '.bin');
                fs.writeFileSync(shadowPath, data);
                this.shadowCache.set(key, shadowPath);
                Logger.info(`Created shadow backup for: ${sourceUri.fsPath}`);
            } catch (e) {
                Logger.error(`Failed to create shadow backup`, e);
            }
        }
    }

    watch(_uri: vscode.Uri, _options: { readonly recursive: boolean; readonly excludes: readonly string[]; }): vscode.Disposable {
        return new vscode.Disposable(() => { });
    }

    async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
        const { uri: sourceUri } = this.getSourceUri(uri);
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
        const { uri: sourceUri, isOriginal } = this.getSourceUri(uri);
        
        try {
            let binaryData: Uint8Array;
            
            if (isOriginal) {
                // Read from Shadow Backup on disk (low memory usage)
                const shadowPath = this.shadowCache.get(sourceUri.toString());
                if (shadowPath && fs.existsSync(shadowPath)) {
                    binaryData = fs.readFileSync(shadowPath);
                    Logger.info(`Reading from shadow backup for Diff: ${sourceUri.fsPath}`);
                } else {
                    // Fallback if no backup yet
                    binaryData = await vscode.workspace.fs.readFile(sourceUri);
                }
            } else {
                // Read from live disk
                binaryData = await vscode.workspace.fs.readFile(sourceUri);
                // Trigger shadow backup for first-time live read
                await this.ensureShadowBackup(sourceUri);
            }

            let yamlStr = byml.bymlToYaml(new Uint8Array(binaryData));
            yamlStr = await AliasManager.applyDisplayAliases(yamlStr);
            return new TextEncoder().encode(yamlStr);
        } catch (err: any) {
            return new TextEncoder().encode(`# BYML Lens Error\n# Source: ${sourceUri.toString()}\n# Error: ${err.message}`);
        }
    }

    async writeFile(uri: vscode.Uri, content: Uint8Array, _options: { readonly create: boolean; readonly overwrite: boolean; }): Promise<void> {
        const { uri: sourceUri } = this.getSourceUri(uri);
        let yamlStr = new TextDecoder().decode(content);
        yamlStr = await AliasManager.revertToInternal(yamlStr);
        
        try {
            const encoded = byml.yamlToByml(yamlStr);
            await vscode.workspace.fs.writeFile(sourceUri, encoded);
            vscode.window.setStatusBarMessage('$(check) BYML Saved', 2000);
        } catch (err: any) {
            vscode.window.showErrorMessage(`BYML Save Error: ${err.message}`);
            throw err;
        }
    }

    delete(_uri: vscode.Uri): void { }
    rename(_oldUri: vscode.Uri, _newUri: vscode.Uri): void { }

    public dispose() {
        if (fs.existsSync(this.tempDir)) {
            fs.rmSync(this.tempDir, { recursive: true, force: true });
        }
    }
}
