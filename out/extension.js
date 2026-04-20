"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const packFsProvider_js_1 = require("./providers/packFsProvider.js");
const bymlFsProvider_js_1 = require("./providers/bymlFsProvider.js");
const logger_js_1 = require("./core/logger.js");
class BymlRedirectProvider {
    async openCustomDocument(uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document, webviewPanel) {
        const virtualUri = vscode.Uri.from({ scheme: 'byml-edit', path: document.uri.path + '.yaml', query: document.uri.toString() });
        await vscode.window.showTextDocument(virtualUri, { preview: true, preserveFocus: false });
        setTimeout(() => webviewPanel.dispose(), 100);
    }
    _onDidChangeCustomDocument = new vscode.EventEmitter();
    onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    backupCustomDocument() { return Promise.resolve({ id: '', delete: () => { } }); }
    saveCustomDocument() { return Promise.resolve(); }
    saveCustomDocumentAs() { return Promise.resolve(); }
    revertCustomDocument() { return Promise.resolve(); }
}
class SarcRedirectProvider {
    packFs;
    constructor(packFs) {
        this.packFs = packFs;
    }
    async openCustomDocument(uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document, webviewPanel) {
        const sarcUri = vscode.Uri.parse(`sarc://${document.uri.fsPath}`);
        const existingFolder = vscode.workspace.workspaceFolders?.find(f => f.uri.toString() === sarcUri.toString());
        if (existingFolder) {
            // Check for unsaved changes before unmounting
            if (this.packFs.isDirty(document.uri)) {
                const choice = await vscode.window.showWarningMessage(`Archive '${vscode.workspace.asRelativePath(document.uri)}' has unsaved changes.`, { modal: true }, 'Save and Unmount', 'Discard and Unmount');
                if (choice === 'Save and Unmount') {
                    await this.packFs.commitChanges(document.uri);
                    vscode.workspace.updateWorkspaceFolders(existingFolder.index, 1);
                }
                else if (choice === 'Discard and Unmount') {
                    vscode.workspace.updateWorkspaceFolders(existingFolder.index, 1);
                }
                else {
                    // Cancelled
                    webviewPanel.dispose();
                    return;
                }
            }
            else {
                vscode.workspace.updateWorkspaceFolders(existingFolder.index, 1);
            }
        }
        else {
            vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders?.length || 0, 0, {
                uri: sarcUri,
                name: `Archive: ${vscode.workspace.asRelativePath(document.uri)}`
            });
        }
        setTimeout(() => webviewPanel.dispose(), 100);
    }
    _onDidChangeCustomDocument = new vscode.EventEmitter();
    onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    backupCustomDocument() { return Promise.resolve({ id: '', delete: () => { } }); }
    saveCustomDocument() { return Promise.resolve(); }
    saveCustomDocumentAs() { return Promise.resolve(); }
    revertCustomDocument() { return Promise.resolve(); }
}
function activate(context) {
    logger_js_1.Logger.init();
    try {
        const packFs = new packFsProvider_js_1.PackFileSystemProvider();
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('sarc', packFs, { isCaseSensitive: true }));
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('byml-edit', new bymlFsProvider_js_1.BymlYamlProvider(), { isCaseSensitive: true }));
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.redirector', new BymlRedirectProvider()));
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.sarc-redirector', new SarcRedirectProvider(packFs)));
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.openByml', async (uri) => {
            const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
            if (!targetUri)
                return;
            const virtualUri = vscode.Uri.from({ scheme: 'byml-edit', path: targetUri.path + '.yaml', query: targetUri.toString() });
            await vscode.window.showTextDocument(virtualUri, { preview: false });
        }));
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.unmountPack', async (uri) => {
            // Re-use the redirector's logic by artificially opening the custom editor or just simple unmount
            const folder = vscode.workspace.workspaceFolders?.find(f => f.uri.toString() === uri.toString());
            if (folder)
                vscode.workspace.updateWorkspaceFolders(folder.index, 1);
        }));
        logger_js_1.Logger.log("BYML Inspector (v6 - Staging Mode) Activated.");
    }
    catch (err) {
        logger_js_1.Logger.error("Activation Failed", err);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map