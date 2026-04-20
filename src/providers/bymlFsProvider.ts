import * as vscode from 'vscode';
import * as byml from '../core/byml.js';
import { Logger } from '../core/logger.js';

export class BymlYamlProvider implements vscode.FileSystemProvider {
    private _onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._onDidChangeFile.event;

    private getPhysicalUri(uri: vscode.Uri): vscode.Uri {
        let path = uri.path;
        if (path.endsWith('.yaml')) {
            path = path.slice(0, -5);
        }
        const result = vscode.Uri.file(path);
        Logger.log(`Mapping virtual URI to physical`, { from: uri.toString(), to: result.toString() });
        return result;
    }

    watch(_uri: vscode.Uri, _options: { readonly recursive: boolean; readonly excludes: readonly string[]; }): vscode.Disposable {
        return new vscode.Disposable(() => { });
    }

    async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
        Logger.log(`Stat called for: ${uri.toString()}`);
        const physicalUri = this.getPhysicalUri(uri);
        try {
            const stats = await vscode.workspace.fs.stat(physicalUri);
            return { ...stats, type: vscode.FileType.File };
        } catch (err) {
            Logger.log(`Stat failed (likely new file)`, { path: physicalUri.fsPath });
            return { type: vscode.FileType.File, ctime: Date.now(), mtime: Date.now(), size: 0 };
        }
    }

    readDirectory(_uri: vscode.Uri): [string, vscode.FileType][] { return []; }
    createDirectory(_uri: vscode.Uri): void { }

    async readFile(uri: vscode.Uri): Promise<Uint8Array> {
        Logger.log(`ReadFile triggering for: ${uri.toString()}`);
        const physicalUri = this.getPhysicalUri(uri);
        
        try {
            const binaryData = await vscode.workspace.fs.readFile(physicalUri);
            Logger.log(`Successfully read physical file. Size: ${binaryData.length} bytes`);
            
            const yamlStr = byml.bymlToYaml(new Uint8Array(binaryData));
            Logger.log(`Successfully converted BYML to YAML. Length: ${yamlStr.length} chars`);
            
            return new TextEncoder().encode(yamlStr);
        } catch (err: any) {
            Logger.error(`ReadFile failed`, err);
            return new TextEncoder().encode(`# BYML Inspector Error\n# Failed to decode: ${err.message}`);
        }
    }

    async writeFile(uri: vscode.Uri, content: Uint8Array, _options: { readonly create: boolean; readonly overwrite: boolean; }): Promise<void> {
        Logger.log(`WriteFile triggering for: ${uri.toString()}`);
        const physicalUri = this.getPhysicalUri(uri);
        const yamlStr = new TextDecoder().decode(content);
        
        try {
            const originalBinary = await vscode.workspace.fs.readFile(physicalUri);
            const encoded = byml.yamlToByml(yamlStr, new Uint8Array(originalBinary));
            await vscode.workspace.fs.writeFile(physicalUri, encoded);
            Logger.log(`Successfully encoded and saved BYML binary to: ${physicalUri.fsPath}`);
            vscode.window.setStatusBarMessage('$(check) BYML Saved Successfully', 3000);
        } catch (err: any) {
            Logger.error(`WriteFile failed`, err);
            vscode.window.showErrorMessage(`BYML Save Error: ${err.message}`);
            throw err;
        }
    }

    delete(_uri: vscode.Uri, _options: { readonly recursive: boolean; }): void { }
    rename(_oldUri: vscode.Uri, _newUri: vscode.Uri, _options: { readonly overwrite: boolean; }): void { }
}
