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
const path = __importStar(require("path"));
const packFsProvider_js_1 = require("./providers/packFsProvider.js");
const bymlFsProvider_js_1 = require("./providers/bymlFsProvider.js");
const logger_js_1 = require("./core/logger.js");
class BymlRedirectProvider {
    async openCustomDocument(uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document, webviewPanel) {
        const virtualUri = vscode.Uri.from({
            scheme: 'byml-edit',
            path: document.uri.path + '.yaml',
            query: document.uri.toString()
        });
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
    async openCustomDocument(uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document, webviewPanel) {
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
                if (checkAndToggle())
                    disposable.dispose();
            });
            webviewPanel.onDidDispose(() => disposable.dispose());
        }
    }
    findTab(uri) {
        for (const group of vscode.window.tabGroups.all) {
            for (const tab of group.tabs) {
                if (tab.input?.uri?.toString() === uri.toString())
                    return tab;
            }
        }
        return undefined;
    }
    toggleSarc(uri) {
        const sarcUri = vscode.Uri.parse(`sarc://${uri.fsPath}`);
        const folders = vscode.workspace.workspaceFolders || [];
        const existingFolder = folders.find(f => f.uri.toString() === sarcUri.toString());
        if (existingFolder) {
            vscode.workspace.updateWorkspaceFolders(existingFolder.index, 1);
        }
        else {
            vscode.workspace.updateWorkspaceFolders(folders.length, 0, {
                uri: sarcUri,
                name: `[Pack] ${path.basename(uri.fsPath)}`
            });
        }
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
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('sarc', new packFsProvider_js_1.PackFileSystemProvider(), { isCaseSensitive: true }));
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('byml-edit', new bymlFsProvider_js_1.BymlYamlProvider(), { isCaseSensitive: true }));
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.redirector', new BymlRedirectProvider()));
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.sarc-redirector', new SarcRedirectProvider()));
        // ADDED: Compare with Original Binary
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.compareWithOriginal', async (uri) => {
            if (!uri)
                uri = vscode.window.activeTextEditor?.document.uri;
            if (!uri)
                return;
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
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.unmountPack', async (uri) => {
            const folder = vscode.workspace.workspaceFolders?.find(f => f.uri.toString() === uri.toString());
            if (folder)
                vscode.workspace.updateWorkspaceFolders(folder.index, 1);
        }));
        logger_js_1.Logger.log("BYML Inspector Activated with Diff support.");
    }
    catch (err) {
        logger_js_1.Logger.error("Activation Failed", err);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map