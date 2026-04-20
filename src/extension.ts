import * as vscode from 'vscode';
import { PackFileSystemProvider } from './providers/packFsProvider.js';
import { BymlYamlProvider } from './providers/bymlFsProvider.js';
import { Logger } from './core/logger.js';

/**
 * Redirector for BYML files (Binary -> Virtual YAML)
 */
class BymlRedirectProvider implements vscode.CustomEditorProvider {
    async openCustomDocument(uri: vscode.Uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
        const virtualUri = vscode.Uri.from({ scheme: 'byml-edit', path: document.uri.path + '.yaml' });
        await vscode.window.showTextDocument(virtualUri, { preview: true, preserveFocus: false });
        
        // Delay disposal slightly to avoid "OverlayWebview disposed" error
        setTimeout(() => webviewPanel.dispose(), 100);
    }
    private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<any>();
    public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    public backupCustomDocument() { return Promise.resolve({ id: '', delete: () => { } }); }
    public saveCustomDocument() { return Promise.resolve(); }
    public saveCustomDocumentAs() { return Promise.resolve(); }
    public revertCustomDocument() { return Promise.resolve(); }
}

/**
 * Redirector for SARC files (Toggle Mount/Unmount)
 */
class SarcRedirectProvider implements vscode.CustomEditorProvider {
    async openCustomDocument(uri: vscode.Uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
        Logger.log(`Toggling SARC mount for: ${document.uri.toString()}`);
        
        // Set empty HTML to avoid flickering
        webviewPanel.webview.html = "<html><body></body></html>";

        const sarcUri = vscode.Uri.parse(`sarc://${document.uri.fsPath}`);
        const existingFolder = vscode.workspace.workspaceFolders?.find(f => f.uri.toString() === sarcUri.toString());

        if (existingFolder) {
            vscode.workspace.updateWorkspaceFolders(existingFolder.index, 1);
            vscode.window.setStatusBarMessage('$(trash) Archive Unmounted', 2000);
        } else {
            vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders?.length || 0, 0, {
                uri: sarcUri,
                name: `Archive: ${vscode.workspace.asRelativePath(document.uri)}`
            });
            vscode.window.setStatusBarMessage('$(folder-opened) Archive Mounted', 2000);
        }

        // Delay disposal to allow VS Code to finalize the editor creation process
        setTimeout(() => {
            webviewPanel.dispose();
        }, 100);
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
            let targetUri = uri || vscode.window.activeTextEditor?.document.uri;
            if (!targetUri) return;
            const virtualUri = vscode.Uri.from({ scheme: 'byml-edit', path: targetUri.path + '.yaml' });
            await vscode.window.showTextDocument(virtualUri, { preview: false });
        }));

        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.unmountPack', async (uri: vscode.Uri) => {
            const folder = vscode.workspace.workspaceFolders?.find(f => f.uri.toString() === uri.toString());
            if (folder) vscode.workspace.updateWorkspaceFolders(folder.index, 1);
        }));

        Logger.log("BYML Inspector (v4 - Stable Toggle) Activated.");

    } catch (err: any) {
        Logger.error("Activation Failed", err);
    }
}

export function deactivate() {}
