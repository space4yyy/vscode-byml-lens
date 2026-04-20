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
class BymlYamlProvider {
    _onDidChangeFile = new vscode.EventEmitter();
    onDidChangeFile = this._onDidChangeFile.event;
    getPhysicalUri(uri) {
        let path = uri.path;
        if (path.endsWith('.yaml')) {
            path = path.slice(0, -5);
        }
        const result = vscode.Uri.file(path);
        logger_js_1.Logger.log(`Mapping virtual URI to physical`, { from: uri.toString(), to: result.toString() });
        return result;
    }
    watch(_uri, _options) {
        return new vscode.Disposable(() => { });
    }
    async stat(uri) {
        logger_js_1.Logger.log(`Stat called for: ${uri.toString()}`);
        const physicalUri = this.getPhysicalUri(uri);
        try {
            const stats = await vscode.workspace.fs.stat(physicalUri);
            return { ...stats, type: vscode.FileType.File };
        }
        catch (err) {
            logger_js_1.Logger.log(`Stat failed (likely new file)`, { path: physicalUri.fsPath });
            return { type: vscode.FileType.File, ctime: Date.now(), mtime: Date.now(), size: 0 };
        }
    }
    readDirectory(_uri) { return []; }
    createDirectory(_uri) { }
    async readFile(uri) {
        logger_js_1.Logger.log(`ReadFile triggering for: ${uri.toString()}`);
        const physicalUri = this.getPhysicalUri(uri);
        try {
            const binaryData = await vscode.workspace.fs.readFile(physicalUri);
            logger_js_1.Logger.log(`Successfully read physical file. Size: ${binaryData.length} bytes`);
            const yamlStr = byml.bymlToYaml(new Uint8Array(binaryData));
            logger_js_1.Logger.log(`Successfully converted BYML to YAML. Length: ${yamlStr.length} chars`);
            return new TextEncoder().encode(yamlStr);
        }
        catch (err) {
            logger_js_1.Logger.error(`ReadFile failed`, err);
            return new TextEncoder().encode(`# BYML Inspector Error\n# Failed to decode: ${err.message}`);
        }
    }
    async writeFile(uri, content, _options) {
        logger_js_1.Logger.log(`WriteFile triggering for: ${uri.toString()}`);
        const physicalUri = this.getPhysicalUri(uri);
        const yamlStr = new TextDecoder().decode(content);
        try {
            const originalBinary = await vscode.workspace.fs.readFile(physicalUri);
            const encoded = byml.yamlToByml(yamlStr, new Uint8Array(originalBinary));
            await vscode.workspace.fs.writeFile(physicalUri, encoded);
            logger_js_1.Logger.log(`Successfully encoded and saved BYML binary to: ${physicalUri.fsPath}`);
            vscode.window.setStatusBarMessage('$(check) BYML Saved Successfully', 3000);
        }
        catch (err) {
            logger_js_1.Logger.error(`WriteFile failed`, err);
            vscode.window.showErrorMessage(`BYML Save Error: ${err.message}`);
            throw err;
        }
    }
    delete(_uri, _options) { }
    rename(_oldUri, _newUri, _options) { }
}
exports.BymlYamlProvider = BymlYamlProvider;
//# sourceMappingURL=bymlFsProvider.js.map