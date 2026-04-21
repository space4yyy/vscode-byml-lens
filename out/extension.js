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
/**
 * Redirector for BYML files (Binary -> Virtual YAML)
 */
class BymlRedirectProvider {
    async openCustomDocument(uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document, webviewPanel) {
        logger_js_1.Logger.log(`BYML Redirector: Opening YAML view for ${document.uri.fsPath}`);
        const virtualUri = vscode.Uri.from({
            scheme: 'byml-edit',
            path: document.uri.path + '.yaml',
            query: document.uri.toString()
        });
        try {
            await vscode.window.showTextDocument(virtualUri, { preview: true, preserveFocus: false });
        }
        catch (err) {
            logger_js_1.Logger.error("Failed to open YAML document", err);
        }
        finally {
            // Must dispose or VS Code hangs with a loading bar
            setTimeout(() => webviewPanel.dispose(), 100);
        }
    }
    _onDidChangeCustomDocument = new vscode.EventEmitter();
    onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    backupCustomDocument() { return Promise.resolve({ id: '', delete: () => { } }); }
    saveCustomDocument() { return Promise.resolve(); }
    saveCustomDocumentAs() { return Promise.resolve(); }
    revertCustomDocument() { return Promise.resolve(); }
}
/**
 * Double-Click Toggle Redirector for SARC files
 */
class SarcRedirectProvider {
    async openCustomDocument(uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document, webviewPanel) {
        const checkAndToggle = () => {
            const tab = this.findTab(document.uri);
            if (tab && !tab.isPreview) {
                logger_js_1.Logger.log(`SARC Redirector: Double-click detected for ${document.uri.fsPath}`);
                this.toggleSarc(document.uri);
                setTimeout(() => webviewPanel.dispose(), 100);
                return true;
            }
            return false;
        };
        if (!checkAndToggle()) {
            webviewPanel.webview.html = `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;color:#888;font-family:sans-serif;background-color:transparent;"><div>Double-click to Mount/Unmount Archive</div></body></html>`;
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
                const input = tab.input;
                if (input?.uri?.toString() === uri.toString())
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
            vscode.window.setStatusBarMessage('$(trash) Unmounted', 2000);
        }
        else {
            vscode.workspace.updateWorkspaceFolders(folders.length, 0, {
                uri: sarcUri,
                name: `[Pack] ${path.basename(uri.fsPath)}`
            });
            vscode.window.setStatusBarMessage('$(folder-opened) Mounted', 2000);
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
        // Register editors
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.redirector', new BymlRedirectProvider()));
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.sarc-redirector', new SarcRedirectProvider()));
        // Register manual commands
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.openByml', async (uri) => {
            const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
            if (!targetUri)
                return;
            const virtualUri = vscode.Uri.from({ scheme: 'byml-edit', path: targetUri.path + '.yaml', query: targetUri.toString() });
            await vscode.window.showTextDocument(virtualUri, { preview: false });
        }));
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.unmountPack', async (uri) => {
            const folder = vscode.workspace.workspaceFolders?.find(f => f.uri.toString() === uri.toString());
            if (folder)
                vscode.workspace.updateWorkspaceFolders(folder.index, 1);
        }));
        logger_js_1.Logger.log("BYML Inspector Activated (Emergency Recovery).");
    }
    catch (err) {
        logger_js_1.Logger.error("Activation Failed", err);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map