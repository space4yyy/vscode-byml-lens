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
exports.PackFileSystemProvider = void 0;
const vscode = __importStar(require("vscode"));
const sarc_js_1 = require("../core/sarc.js");
const path = __importStar(require("path"));
const logger_js_1 = require("../core/logger.js");
class PackFileSystemProvider {
    _onDidChangeFile = new vscode.EventEmitter();
    onDidChangeFile = this._onDidChangeFile.event;
    archives = new Map();
    isDirty(uri) {
        const key = this.getArchiveKey(uri);
        return this.archives.get(key)?.isDirty || false;
    }
    getArchiveKey(uri) {
        const parts = uri.path.split('/');
        let archivePath = '';
        for (let i = 0; i < parts.length; i++) {
            if (!parts[i])
                continue;
            archivePath = archivePath === '' ? '/' + parts[i] : path.join(archivePath, parts[i]);
            if (parts[i].toLowerCase().endsWith('.pack') ||
                parts[i].toLowerCase().endsWith('.pack.zs') ||
                parts[i].toLowerCase().endsWith('.sarc') ||
                parts[i].toLowerCase().endsWith('.sarc.zs')) {
                return vscode.Uri.file(archivePath).toString();
            }
        }
        return '';
    }
    async getArchive(uri) {
        const parts = uri.path.split('/');
        let archivePath = '';
        let internalPath = '';
        let found = false;
        for (let i = 0; i < parts.length; i++) {
            if (!parts[i])
                continue;
            archivePath = archivePath === '' ? '/' + parts[i] : path.join(archivePath, parts[i]);
            if (parts[i].toLowerCase().endsWith('.pack') ||
                parts[i].toLowerCase().endsWith('.pack.zs') ||
                parts[i].toLowerCase().endsWith('.sarc') ||
                parts[i].toLowerCase().endsWith('.sarc.zs')) {
                internalPath = parts.slice(i + 1).join('/');
                found = true;
                break;
            }
        }
        if (!found)
            throw vscode.FileSystemError.FileNotFound(uri);
        const archiveUri = vscode.Uri.file(archivePath);
        const archiveKey = archiveUri.toString();
        if (!this.archives.has(archiveKey)) {
            const data = await vscode.workspace.fs.readFile(archiveUri);
            this.archives.set(archiveKey, {
                archive: new sarc_js_1.SarcArchive(new Uint8Array(data)),
                isDirty: false
            });
        }
        return {
            archive: this.archives.get(archiveKey).archive,
            internalPath,
            archiveUri
        };
    }
    async commitChanges(uri) {
        const archiveKey = uri.toString();
        const entry = this.archives.get(archiveKey);
        if (entry && entry.isDirty) {
            logger_js_1.Logger.log(`Committing SARC changes to disk: ${uri.fsPath}`);
            const encoded = entry.archive.encode();
            await vscode.workspace.fs.writeFile(uri, encoded);
            entry.isDirty = false;
            logger_js_1.Logger.log(`SARC saved successfully.`);
        }
    }
    watch(_uri, _options) {
        return new vscode.Disposable(() => { });
    }
    async stat(uri) {
        const { archive, internalPath } = await this.getArchive(uri);
        if (internalPath === '' || internalPath === '/') {
            return { type: vscode.FileType.Directory, ctime: 0, mtime: 0, size: 0 };
        }
        const file = archive.files.find(f => f.name === internalPath);
        if (file) {
            return { type: vscode.FileType.File, ctime: 0, mtime: 0, size: file.data.length };
        }
        const isDir = archive.files.some(f => f.name.startsWith(internalPath + '/'));
        if (isDir) {
            return { type: vscode.FileType.Directory, ctime: 0, mtime: 0, size: 0 };
        }
        throw vscode.FileSystemError.FileNotFound(uri);
    }
    async readDirectory(uri) {
        const { archive, internalPath } = await this.getArchive(uri);
        const prefix = internalPath === '' ? '' : (internalPath.endsWith('/') ? internalPath : internalPath + '/');
        const entries = new Map();
        for (const file of archive.files) {
            if (file.name.startsWith(prefix)) {
                const relative = file.name.substring(prefix.length);
                const slashIdx = relative.indexOf('/');
                if (slashIdx === -1) {
                    if (relative)
                        entries.set(relative, vscode.FileType.File);
                }
                else {
                    const dirName = relative.substring(0, slashIdx);
                    if (dirName)
                        entries.set(dirName, vscode.FileType.Directory);
                }
            }
        }
        return Array.from(entries.entries());
    }
    createDirectory(_uri) { }
    async readFile(uri) {
        const { archive, internalPath } = await this.getArchive(uri);
        const file = archive.files.find(f => f.name === internalPath);
        if (!file)
            throw vscode.FileSystemError.FileNotFound(uri);
        return file.data;
    }
    async writeFile(uri, content, options) {
        const { archive, internalPath, archiveUri } = await this.getArchive(uri);
        const fileIdx = archive.files.findIndex(f => f.name === internalPath);
        if (fileIdx !== -1) {
            if (!options.overwrite)
                throw vscode.FileSystemError.FileExists(uri);
            archive.files[fileIdx].data = content;
        }
        else {
            if (!options.create)
                throw vscode.FileSystemError.FileNotFound(uri);
            archive.files.push({ name: internalPath, data: content });
        }
        // Mark as dirty, but don't save to disk yet (Performance optimization)
        const key = archiveUri.toString();
        const entry = this.archives.get(key);
        if (entry)
            entry.isDirty = true;
        logger_js_1.Logger.log(`Updated file in memory: ${internalPath}. SARC marked as dirty.`);
        this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Changed, uri }]);
        vscode.window.setStatusBarMessage(`$(sync~spin) SARC Modified (Unsaved)`, 3000);
    }
    async delete(uri, _options) {
        const { archive, internalPath, archiveUri } = await this.getArchive(uri);
        archive.files = archive.files.filter(f => f.name !== internalPath && !f.name.startsWith(internalPath + '/'));
        const entry = this.archives.get(archiveUri.toString());
        if (entry)
            entry.isDirty = true;
        this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Deleted, uri }]);
    }
    rename(_oldUri, _newUri, _options) { }
}
exports.PackFileSystemProvider = PackFileSystemProvider;
//# sourceMappingURL=packFsProvider.js.map