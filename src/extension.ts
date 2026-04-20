import * as vscode from 'vscode';
import { PackFileSystemProvider } from './providers/packFsProvider.js';
import { BymlYamlProvider } from './providers/bymlFsProvider.js';
import { Logger } from './core/logger.js';

class BymlRedirectProvider implements vscode.CustomEditorProvider {
    async openCustomDocument(uri: vscode.Uri) {
        return { uri, dispose: () => { } };
    }

    async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
        Logger.log(`Redirecting binary click to YAML: ${document.uri.toString()}`);
        const virtualUri = vscode.Uri.from({
            scheme: 'byml-edit',
            path: document.uri.path + '.yaml'
        });
        await vscode.window.showTextDocument(virtualUri, { preview: true, preserveFocus: false });
        webviewPanel.dispose();
    }

    private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<any>();
    public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    public backupCustomDocument(_document: vscode.CustomDocument, _context: any, _token: any): Thenable<vscode.CustomDocumentBackup> {
        return Promise.resolve({ id: '', delete: () => { } });
    }
    public saveCustomDocument() { return Promise.resolve(); }
    public saveCustomDocumentAs() { return Promise.resolve(); }
    public revertCustomDocument() { return Promise.resolve(); }
}

export function activate(context: vscode.ExtensionContext) {
    Logger.init();

    try {
        const packFs = new PackFileSystemProvider();
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('sarc', packFs, { isCaseSensitive: true }));

        const bymlFs = new BymlYamlProvider();
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('byml-edit', bymlFs, { isCaseSensitive: true }));

        const redirectProvider = new BymlRedirectProvider();
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.redirector', redirectProvider));

        const openCommand = vscode.commands.registerCommand('byml-inspector.openByml', async (uri: vscode.Uri) => {
            let targetUri = uri;
            if (!targetUri) {
                targetUri = vscode.window.activeTextEditor?.document.uri as vscode.Uri;
            }
            if (!targetUri) return;
            const virtualUri = vscode.Uri.from({ scheme: 'byml-edit', path: targetUri.path + '.yaml' });
            await vscode.window.showTextDocument(virtualUri, { preview: false });
        });
        context.subscriptions.push(openCommand);

        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.mountPack', async (uri: vscode.Uri) => {
            if (!uri) return;
            const sarcUri = vscode.Uri.parse(`sarc://${uri.fsPath}`);
            vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders?.length || 0, 0, {
                uri: sarcUri,
                name: `Archive: ${vscode.workspace.asRelativePath(uri)}`
            });
        }));

        Logger.log("BYML Inspector (v2 - Redirect Mode) Activated.");

    } catch (err: any) {
        Logger.error("Activation Failed", err);
    }
}

export function deactivate() {}
