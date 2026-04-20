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

/**
 * Double-Click Toggle Redirector for SARC files
 */
class SarcRedirectProvider implements vscode.CustomEditorProvider {
    async openCustomDocument(uri: vscode.Uri) { return { uri, dispose: () => { } }; }
    
    async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
        const checkAndToggle = () => {
            // Look for the tab corresponding to this document
            const tab = this.findTab(document.uri);
            
            if (tab && !tab.isPreview) {
                // It's a double-click (permanent tab) -> Trigger Toggle
                this.toggleSarc(document.uri);
                setTimeout(() => webviewPanel.dispose(), 50);
                return true;
            }
            return false;
        };

        // 1. Check immediately
        if (!checkAndToggle()) {
            // 2. If it's just a preview, show instructions and wait for it to become permanent
            webviewPanel.webview.html = `
                <html><body style="display:flex;align-items:center;justify-content:center;height:100vh;color:#888;font-family:sans-serif;">
                    <div>Double-click to Mount/Unmount Archive</div>
                </body></html>`;
            
            const disposable = vscode.window.tabGroups.onDidChangeTabs(e => {
                if (checkAndToggle()) {
                    disposable.dispose();
                }
            });
            webviewPanel.onDidDispose(() => disposable.dispose());
        }
    }

    private findTab(uri: vscode.Uri): vscode.Tab | undefined {
        for (const group of vscode.window.tabGroups.all) {
            for (const tab of group.tabs) {
                if ((tab.input as any)?.uri?.toString() === uri.toString()) {
                    return tab;
                }
            }
        }
        return undefined;
    }

    private toggleSarc(uri: vscode.Uri) {
        const sarcUri = vscode.Uri.parse(`sarc://${uri.fsPath}`);
        const existingFolder = vscode.workspace.workspaceFolders?.find(f => f.uri.toString() === sarcUri.toString());

        if (existingFolder) {
            vscode.workspace.updateWorkspaceFolders(existingFolder.index, 1);
            vscode.window.setStatusBarMessage('$(trash) Archive Unmounted', 2000);
            Logger.log(`Unmounted SARC: ${uri.fsPath}`);
        } else {
            vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders?.length || 0, 0, {
                uri: sarcUri,
                name: `Archive: ${vscode.workspace.asRelativePath(uri)}`
            });
            vscode.window.setStatusBarMessage('$(folder-opened) Archive Mounted', 2000);
            Logger.log(`Mounted SARC: ${uri.fsPath}`);
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
    Logger.init();
    try {
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('sarc', new PackFileSystemProvider(), { isCaseSensitive: true }));
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('byml-edit', new BymlYamlProvider(), { isCaseSensitive: true }));
        
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.redirector', new BymlRedirectProvider()));
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.sarc-redirector', new SarcRedirectProvider()));
        
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.openByml', async (uri: vscode.Uri) => {
            const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
            if (!targetUri) return;
            const virtualUri = vscode.Uri.from({ scheme: 'byml-edit', path: targetUri.path + '.yaml', query: targetUri.toString() });
            await vscode.window.showTextDocument(virtualUri, { preview: false });
        }));
        
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.unmountPack', async (uri: vscode.Uri) => {
            const folder = vscode.workspace.workspaceFolders?.find(f => f.uri.toString() === uri.toString());
            if (folder) vscode.workspace.updateWorkspaceFolders(folder.index, 1);
        }));

        Logger.log("BYML Inspector (v5 - Double-Click Mode) Activated.");
    } catch (err: any) {
        Logger.error("Activation Failed", err);
    }
}

export function deactivate() {}
