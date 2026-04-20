import * as vscode from 'vscode';
import { PackFileSystemProvider } from './providers/packFsProvider.js';
import { BymlYamlProvider } from './providers/bymlFsProvider.js';
import { Logger } from './core/logger.js';

class BymlRedirectProvider implements vscode.CustomEditorProvider {
    async openCustomDocument(uri: vscode.Uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
        // We pass the full original URI in the query string to preserve scheme (file vs sarc)
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
    async openCustomDocument(uri: vscode.Uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
        webviewPanel.webview.html = "<html><body></body></html>";
        const sarcUri = vscode.Uri.parse(`sarc://${document.uri.fsPath}`);
        const existingFolder = vscode.workspace.workspaceFolders?.find(f => f.uri.toString() === sarcUri.toString());
        if (existingFolder) {
            vscode.workspace.updateWorkspaceFolders(existingFolder.index, 1);
        } else {
            vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders?.length || 0, 0, {
                uri: sarcUri,
                name: `Archive: ${vscode.workspace.asRelativePath(document.uri)}`
            });
        }
        setTimeout(() => webviewPanel.dispose(), 100);
    }
    private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<any>();
    public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    public backupCustomDocument() { return Promise.resolve({ id: '', delete: () => { } }); }
    public saveCustomDocument() { return Promise.resolve(); }
    public saveCustomDocumentAs() { return Promise.resolve(); }
    public revertCustomDocument() { return Promise.resolve(); }
}

export function activate(context: vscode.ExtensionContext) {
    Logger.init();
    try {
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('sarc', new PackFileSystemProvider(), { isCaseSensitive: true }));
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('byml-edit', new BymlYamlProvider(), { isCaseSensitive: true }));
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.redirector', new BymlRedirectProvider()));
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.sarc-redirector', new SarcRedirectProvider()));
        
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.openByml', async (uri: vscode.Uri) => {
            const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
            if (!targetUri) return;
            const virtualUri = vscode.Uri.from({ 
                scheme: 'byml-edit', 
                path: targetUri.path + '.yaml',
                query: targetUri.toString() 
            });
            await vscode.window.showTextDocument(virtualUri, { preview: false });
        }));
        
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.unmountPack', async (uri: vscode.Uri) => {
            const folder = vscode.workspace.workspaceFolders?.find(f => f.uri.toString() === uri.toString());
            if (folder) vscode.workspace.updateWorkspaceFolders(folder.index, 1);
        }));
        Logger.log("BYML Inspector (v5 - SARC Aware) Activated.");
    } catch (err: any) {
        Logger.error("Activation Failed", err);
    }
}
export function deactivate() {}
