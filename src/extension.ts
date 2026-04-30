import * as vscode from 'vscode';
import * as path from 'path';
import { PackFileSystemProvider } from './providers/packFsProvider.js';
import { BymlYamlProvider } from './providers/bymlFsProvider.js';
import { Logger } from './core/logger.js';

class BymlRedirectProvider implements vscode.CustomEditorProvider {
    async openCustomDocument(uri: vscode.Uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
        const virtualUri = vscode.Uri.from({
            scheme: 'byml-edit',
            path: document.uri.path + '.yaml',
            query: document.uri.toString()
        });
        await vscode.window.showTextDocument(virtualUri, { preview: true, preserveFocus: false });
        setTimeout(() => webviewPanel.dispose(), 100);
    }
    private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<any>();
    public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    public backupCustomDocument() { return Promise.resolve({ id: '', delete: () => { } }); }
    public saveCustomDocument() { return Promise.resolve(); }
    public saveCustomDocumentAs() { return Promise.resolve(); }
    public revertCustomDocument() { return Promise.resolve(); }
}

class SarcRedirectProvider implements vscode.CustomEditorProvider {
    constructor(private packFs: PackFileSystemProvider) { }

    async openCustomDocument(uri: vscode.Uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
        const checkAndToggle = () => {
            const tab = this.findTab(document.uri);
            if (tab && !tab.isPreview) {
                this.toggleSarc(document.uri);
                setTimeout(() => webviewPanel.dispose(), 50);
                return true;
            }
            return false;
        };
        if (!checkAndToggle()) {
            webviewPanel.webview.html = `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;color:#888;font-family:sans-serif;"><div>Double-click to Mount/Unmount Archive</div></body></html>`;
            const disposable = vscode.window.tabGroups.onDidChangeTabs(_ => {
                if (checkAndToggle()) disposable.dispose();
            });
            webviewPanel.onDidDispose(() => disposable.dispose());
        }
    }
    private findTab(uri: vscode.Uri): vscode.Tab | undefined {
        for (const group of vscode.window.tabGroups.all) {
            for (const tab of group.tabs) {
                if ((tab.input as any)?.uri?.toString() === uri.toString()) return tab;
            }
        }
        return undefined;
    }
    private toggleSarc(uri: vscode.Uri) {
        const sarcUri = vscode.Uri.parse(`sarc://${uri.fsPath}`);
        const folders = vscode.workspace.workspaceFolders || [];
        const existingFolder = folders.find(f => f.uri.toString() === sarcUri.toString());
        if (existingFolder) {
            this.packFs.unmount(sarcUri);
            vscode.workspace.updateWorkspaceFolders(existingFolder.index, 1);
        } else {
            vscode.workspace.updateWorkspaceFolders(folders.length, 0, {
                uri: sarcUri,
                name: `[Pack] ${path.basename(uri.fsPath)}`
            });
        }
    }
    private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<any>();
    public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    public backupCustomDocument() { return Promise.resolve({ id: '', delete: () => { } }); }
    public saveCustomDocument() { return Promise.resolve(); }
    public saveCustomDocumentAs() { return Promise.resolve(); }
    public revertCustomDocument() { return Promise.resolve(); }
}

export function activate(context: vscode.ExtensionContext) {
    // 0. Initialize Logger
    Logger.setChannel(vscode.window.createOutputChannel("BYML Lens"));

    try {
        const packFs = new PackFileSystemProvider();
        const bymlFs = new BymlYamlProvider();

        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('sarc', packFs, { isCaseSensitive: true }));
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('byml-edit', bymlFs, { isCaseSensitive: true }));
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.redirector', new BymlRedirectProvider()));
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.sarc-redirector', new SarcRedirectProvider(packFs)));
        
        // Push providers to subscriptions to ensure dispose() is called
        context.subscriptions.push(bymlFs);
        
        // ADDED: Compare with Original Binary
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.compareWithOriginal', async (uri: vscode.Uri) => {
            if (!uri) uri = vscode.window.activeTextEditor?.document.uri as vscode.Uri;
            if (!uri) return;

            const originalUri = uri; // Binary file on disk or in SARC
            const virtualUri = vscode.Uri.from({
                scheme: 'byml-edit',
                path: uri.path + '.yaml',
                query: uri.toString()
            });

            // We compare the virtual YAML (current) with the actual binary (transformed back to original)
            // But VS Code can't natively diff binary vs text. 
            // So we'll open a second virtual document but with a "readonly" tag to represent the "untouched" version.
            const baseUri = vscode.Uri.from({
                scheme: 'byml-edit',
                path: uri.path + '.original.yaml',
                query: uri.toString() // In readFile, we can check for .original.yaml and return unmodified data
            });

            await vscode.commands.executeCommand('vscode.diff', baseUri, virtualUri, `${path.basename(uri.fsPath)} (Original ↔ Modified)`);
        }));

        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.unmountPack', async (uri: vscode.Uri) => {
            const folder = vscode.workspace.workspaceFolders?.find(f => f.uri.toString() === uri.toString());
            if (folder) {
                packFs.unmount(uri);
                vscode.workspace.updateWorkspaceFolders(folder.index, 1);
            }
        }));

        Logger.info("BYML Lens Activated.");
    } catch (err: any) {
        Logger.error("Activation Failed", err);
    }
}

export function deactivate() {}
