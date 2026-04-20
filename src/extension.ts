import * as vscode from 'vscode';
import { PackFileSystemProvider } from './providers/packFsProvider.js';
import { BymlYamlProvider } from './providers/bymlFsProvider.js';
import { Logger } from './core/logger.js';

class BymlRedirectProvider implements vscode.CustomEditorProvider {
    async openCustomDocument(uri: vscode.Uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
        const virtualUri = vscode.Uri.from({ scheme: 'byml-edit', path: document.uri.path + '.yaml', query: document.uri.toString() });
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
        const sarcUri = vscode.Uri.parse(`sarc://${document.uri.fsPath}`);
        const existingFolder = vscode.workspace.workspaceFolders?.find(f => f.uri.toString() === sarcUri.toString());

        if (existingFolder) {
            // Check for unsaved changes before unmounting
            if (this.packFs.isDirty(document.uri)) {
                const choice = await vscode.window.showWarningMessage(
                    `Archive '${vscode.workspace.asRelativePath(document.uri)}' has unsaved changes.`,
                    { modal: true },
                    'Save and Unmount',
                    'Discard and Unmount'
                );

                if (choice === 'Save and Unmount') {
                    await this.packFs.commitChanges(document.uri);
                    vscode.workspace.updateWorkspaceFolders(existingFolder.index, 1);
                } else if (choice === 'Discard and Unmount') {
                    vscode.workspace.updateWorkspaceFolders(existingFolder.index, 1);
                } else {
                    // Cancelled
                    webviewPanel.dispose();
                    return;
                }
            } else {
                vscode.workspace.updateWorkspaceFolders(existingFolder.index, 1);
            }
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
        const packFs = new PackFileSystemProvider();
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('sarc', packFs, { isCaseSensitive: true }));
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('byml-edit', new BymlYamlProvider(), { isCaseSensitive: true }));
        
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.redirector', new BymlRedirectProvider()));
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.sarc-redirector', new SarcRedirectProvider(packFs)));
        
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.openByml', async (uri: vscode.Uri) => {
            const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
            if (!targetUri) return;
            const virtualUri = vscode.Uri.from({ scheme: 'byml-edit', path: targetUri.path + '.yaml', query: targetUri.toString() });
            await vscode.window.showTextDocument(virtualUri, { preview: false });
        }));
        
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.unmountPack', async (uri: vscode.Uri) => {
            // Re-use the redirector's logic by artificially opening the custom editor or just simple unmount
            const folder = vscode.workspace.workspaceFolders?.find(f => f.uri.toString() === uri.toString());
            if (folder) vscode.workspace.updateWorkspaceFolders(folder.index, 1);
        }));

        Logger.log("BYML Inspector (v6 - Staging Mode) Activated.");
    } catch (err: any) {
        Logger.error("Activation Failed", err);
    }
}
export function deactivate() {}
