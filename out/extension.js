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
    async openCustomDocument(uri) {
        return { uri, dispose: () => { } };
    }
    async resolveCustomEditor(document, webviewPanel) {
        logger_js_1.Logger.log(`Redirecting binary click to YAML: ${document.uri.toString()}`);
        const virtualUri = vscode.Uri.from({
            scheme: 'byml-edit',
            path: document.uri.path + '.yaml'
        });
        await vscode.window.showTextDocument(virtualUri, { preview: true, preserveFocus: false });
        webviewPanel.dispose();
    }
    _onDidChangeCustomDocument = new vscode.EventEmitter();
    onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    backupCustomDocument(_document, _context, _token) {
        return Promise.resolve({ id: '', delete: () => { } });
    }
    saveCustomDocument() { return Promise.resolve(); }
    saveCustomDocumentAs() { return Promise.resolve(); }
    revertCustomDocument() { return Promise.resolve(); }
}
function activate(context) {
    logger_js_1.Logger.init();
    try {
        const packFs = new packFsProvider_js_1.PackFileSystemProvider();
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('sarc', packFs, { isCaseSensitive: true }));
        const bymlFs = new bymlFsProvider_js_1.BymlYamlProvider();
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('byml-edit', bymlFs, { isCaseSensitive: true }));
        const redirectProvider = new BymlRedirectProvider();
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.redirector', redirectProvider));
        const openCommand = vscode.commands.registerCommand('byml-inspector.openByml', async (uri) => {
            let targetUri = uri;
            if (!targetUri) {
                targetUri = vscode.window.activeTextEditor?.document.uri;
            }
            if (!targetUri)
                return;
            const virtualUri = vscode.Uri.from({ scheme: 'byml-edit', path: targetUri.path + '.yaml' });
            await vscode.window.showTextDocument(virtualUri, { preview: false });
        });
        context.subscriptions.push(openCommand);
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.mountPack', async (uri) => {
            if (!uri)
                return;
            const sarcUri = vscode.Uri.parse(`sarc://${uri.fsPath}`);
            vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders?.length || 0, 0, {
                uri: sarcUri,
                name: `Archive: ${vscode.workspace.asRelativePath(uri)}`
            });
        }));
        logger_js_1.Logger.log("BYML Inspector (v2 - Redirect Mode) Activated.");
    }
    catch (err) {
        logger_js_1.Logger.error("Activation Failed", err);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map