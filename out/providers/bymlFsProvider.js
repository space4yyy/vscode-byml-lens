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
exports.BymlYamlProvider = void 0;
const vscode = __importStar(require("vscode"));
const byml = __importStar(require("../core/byml.js"));
const logger_js_1 = require("../core/logger.js");
const alias_js_1 = require("../core/alias.js");
class BymlYamlProvider {
    _onDidChangeFile = new vscode.EventEmitter();
    onDidChangeFile = this._onDidChangeFile.event;
    getSourceUri(uri) {
        if (uri.query) {
            try {
                return vscode.Uri.parse(uri.query);
            }
            catch (e) { }
        }
        let path = uri.path;
        if (path.endsWith('.yaml'))
            path = path.slice(0, -5);
        return vscode.Uri.file(path);
    }
    watch(_uri, _options) {
        return new vscode.Disposable(() => { });
    }
    async stat(uri) {
        const sourceUri = this.getSourceUri(uri);
        try {
            const stats = await vscode.workspace.fs.stat(sourceUri);
            return { ...stats, type: vscode.FileType.File };
        }
        catch (err) {
            return { type: vscode.FileType.File, ctime: Date.now(), mtime: Date.now(), size: 0 };
        }
    }
    readDirectory(_uri) { return []; }
    createDirectory(_uri) { }
    async readFile(uri) {
        const sourceUri = this.getSourceUri(uri);
        try {
            const binaryData = await vscode.workspace.fs.readFile(sourceUri);
            let yamlStr = byml.bymlToYaml(new Uint8Array(binaryData));
            // Apply Visual Aliases
            yamlStr = alias_js_1.AliasManager.applyDisplayAliases(yamlStr);
            return new TextEncoder().encode(yamlStr);
        }
        catch (err) {
            logger_js_1.Logger.error(`Read failed`, err);
            return new TextEncoder().encode(`# BYML Inspector Error\n# Source: ${sourceUri.toString()}\n# Error: ${err.message}`);
        }
    }
    async writeFile(uri, content, _options) {
        const sourceUri = this.getSourceUri(uri);
        let yamlStr = new TextDecoder().decode(content);
        // Revert Aliases back to Codename
        yamlStr = alias_js_1.AliasManager.revertToInternal(yamlStr);
        try {
            const originalBinary = await vscode.workspace.fs.readFile(sourceUri);
            const encoded = byml.yamlToByml(yamlStr, new Uint8Array(originalBinary));
            await vscode.workspace.fs.writeFile(sourceUri, encoded);
            vscode.window.setStatusBarMessage('$(check) BYML Saved & Compressed', 3000);
        }
        catch (err) {
            logger_js_1.Logger.error(`Write failed`, err);
            vscode.window.showErrorMessage(`BYML Save Error: ${err.message}`);
            throw err;
        }
    }
    delete(_uri, _options) { }
    rename(_oldUri, _newUri, _options) { }
}
exports.BymlYamlProvider = BymlYamlProvider;
//# sourceMappingURL=bymlFsProvider.js.map