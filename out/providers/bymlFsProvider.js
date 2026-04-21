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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class BymlYamlProvider {
    _onDidChangeFile = new vscode.EventEmitter();
    onDidChangeFile = this._onDidChangeFile.event;
    // Cache to store the location of the initial "Original" binary files on disk
    shadowCache = new Map();
    tempDir;
    constructor() {
        this.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'byml-shadow-'));
        logger_js_1.Logger.log(`Shadow backup directory initialized at: ${this.tempDir}`);
    }
    getSourceUri(uri) {
        let isOriginal = false;
        let pathStr = uri.path;
        if (pathStr.endsWith('.original.yaml')) {
            isOriginal = true;
            pathStr = pathStr.slice(0, -14);
        }
        else if (pathStr.endsWith('.yaml')) {
            pathStr = pathStr.slice(0, -5);
        }
        if (uri.query) {
            return { uri: vscode.Uri.parse(uri.query), isOriginal };
        }
        return { uri: vscode.Uri.file(pathStr), isOriginal };
    }
    /**
     * Creates a one-time shadow backup of the file if it doesn't exist.
     */
    async ensureShadowBackup(sourceUri) {
        const key = sourceUri.toString();
        if (!this.shadowCache.has(key)) {
            try {
                const data = await vscode.workspace.fs.readFile(sourceUri);
                const shadowPath = path.join(this.tempDir, Buffer.from(key).toString('hex').slice(-16) + '.bin');
                fs.writeFileSync(shadowPath, data);
                this.shadowCache.set(key, shadowPath);
                logger_js_1.Logger.log(`Created shadow backup for: ${sourceUri.fsPath}`);
            }
            catch (e) {
                logger_js_1.Logger.error(`Failed to create shadow backup`, e);
            }
        }
    }
    watch(_uri, _options) {
        return new vscode.Disposable(() => { });
    }
    async stat(uri) {
        const { uri: sourceUri } = this.getSourceUri(uri);
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
        const { uri: sourceUri, isOriginal } = this.getSourceUri(uri);
        try {
            let binaryData;
            if (isOriginal) {
                // Read from Shadow Backup on disk (low memory usage)
                const shadowPath = this.shadowCache.get(sourceUri.toString());
                if (shadowPath && fs.existsSync(shadowPath)) {
                    binaryData = fs.readFileSync(shadowPath);
                    logger_js_1.Logger.log(`Reading from shadow backup for Diff: ${sourceUri.fsPath}`);
                }
                else {
                    // Fallback if no backup yet
                    binaryData = await vscode.workspace.fs.readFile(sourceUri);
                }
            }
            else {
                // Read from live disk
                binaryData = await vscode.workspace.fs.readFile(sourceUri);
                // Trigger shadow backup for first-time live read
                await this.ensureShadowBackup(sourceUri);
            }
            let yamlStr = byml.bymlToYaml(new Uint8Array(binaryData));
            yamlStr = await alias_js_1.AliasManager.applyDisplayAliases(yamlStr);
            return new TextEncoder().encode(yamlStr);
        }
        catch (err) {
            return new TextEncoder().encode(`# BYML Lens Error\n# Source: ${sourceUri.toString()}\n# Error: ${err.message}`);
        }
    }
    async writeFile(uri, content, _options) {
        const { uri: sourceUri } = this.getSourceUri(uri);
        let yamlStr = new TextDecoder().decode(content);
        yamlStr = await alias_js_1.AliasManager.revertToInternal(yamlStr);
        try {
            const originalBinary = await vscode.workspace.fs.readFile(sourceUri);
            const encoded = byml.yamlToByml(yamlStr, new Uint8Array(originalBinary));
            await vscode.workspace.fs.writeFile(sourceUri, encoded);
            vscode.window.setStatusBarMessage('$(check) BYML Saved', 2000);
        }
        catch (err) {
            vscode.window.showErrorMessage(`BYML Save Error: ${err.message}`);
            throw err;
        }
    }
    delete(_uri) { }
    rename(_oldUri, _newUri) { }
    dispose() {
        if (fs.existsSync(this.tempDir)) {
            fs.rmSync(this.tempDir, { recursive: true, force: true });
        }
    }
}
exports.BymlYamlProvider = BymlYamlProvider;
//# sourceMappingURL=bymlFsProvider.js.map