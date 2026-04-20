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
class PackFileSystemProvider {
    _onDidChangeFile = new vscode.EventEmitter();
    onDidChangeFile = this._onDidChangeFile.event;
    archives = new Map();
    // Scheme: sarc
    // URI: sarc://path/to/archive.pack/internal/path/to/file.bin
    async getArchive(uri) {
        // Find the boundary between the physical file and internal path
        // For simplicity, we assume the first part that ends with .pack or .pack.zs is the archive
        const parts = uri.path.split('/');
        let archivePath = '';
        let internalPath = '';
        let found = false;
        for (let i = 0; i < parts.length; i++) {
            archivePath = path.join(archivePath, parts[i]);
            if (parts[i].endsWith('.pack') || parts[i].endsWith('.pack.zs') || parts[i].endsWith('.sarc')) {
                internalPath = parts.slice(i + 1).join('/');
                found = true;
                break;
            }
        }
        if (!found) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        const archiveUri = vscode.Uri.file(archivePath);
        const archiveKey = archiveUri.toString();
        if (!this.archives.has(archiveKey)) {
            const data = await vscode.workspace.fs.readFile(archiveUri);
            this.archives.set(archiveKey, new sarc_js_1.SarcArchive(data));
        }
        return {
            archive: this.archives.get(archiveKey),
            internalPath,
            archiveUri
        };
    }
    watch(_uri, _options) {
        return new vscode.Disposable(() => { });
    }
    async stat(uri) {
        const { archive, internalPath } = await this.getArchive(uri);
        if (internalPath === '' || internalPath === '/') {
            return {
                type: vscode.FileType.Directory,
                ctime: 0,
                mtime: 0,
                size: 0
            };
        }
        // Check if it's a file
        const file = archive.files.find(f => f.name === internalPath);
        if (file) {
            return {
                type: vscode.FileType.File,
                ctime: 0,
                mtime: 0,
                size: file.data.length
            };
        }
        // Check if it's a directory
        const isDir = archive.files.some(f => f.name.startsWith(internalPath + '/'));
        if (isDir) {
            return {
                type: vscode.FileType.Directory,
                ctime: 0,
                mtime: 0,
                size: 0
            };
        }
        throw vscode.FileSystemError.FileNotFound(uri);
    }
    async readDirectory(uri) {
        const { archive, internalPath } = await this.getArchive(uri);
        const prefix = internalPath === '' ? '' : internalPath + '/';
        const entries = new Map();
        for (const file of archive.files) {
            if (file.name.startsWith(prefix)) {
                const relative = file.name.substring(prefix.length);
                const slashIdx = relative.indexOf('/');
                if (slashIdx === -1) {
                    entries.set(relative, vscode.FileType.File);
                }
                else {
                    entries.set(relative.substring(0, slashIdx), vscode.FileType.Directory);
                }
            }
        }
        return Array.from(entries.entries());
    }
    createDirectory(_uri) {
        throw new Error('Method not implemented.');
    }
    async readFile(uri) {
        const { archive, internalPath } = await this.getArchive(uri);
        const file = archive.files.find(f => f.name === internalPath);
        if (!file) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        return file.data;
    }
    async writeFile(uri, content, options) {
        const { archive, internalPath, archiveUri } = await this.getArchive(uri);
        const fileIdx = archive.files.findIndex(f => f.name === internalPath);
        if (fileIdx !== -1) {
            if (!options.overwrite) {
                throw vscode.FileSystemError.FileExists(uri);
            }
            archive.files[fileIdx].data = content;
        }
        else {
            if (!options.create) {
                throw vscode.FileSystemError.FileNotFound(uri);
            }
            archive.files.push({ name: internalPath, data: content });
        }
        this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Changed, uri }]);
        // Automatically save the archive back to disk
        // Note: For large archives, we might want to debouncing this or use a manual save command
        const encoded = archive.encode();
        await vscode.workspace.fs.writeFile(archiveUri, encoded);
    }
    async delete(uri, _options) {
        const { archive, internalPath, archiveUri } = await this.getArchive(uri);
        const initialCount = archive.files.length;
        archive.files = archive.files.filter(f => f.name !== internalPath && !f.name.startsWith(internalPath + '/'));
        if (archive.files.length === initialCount) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Deleted, uri }]);
        const encoded = archive.encode();
        await vscode.workspace.fs.writeFile(archiveUri, encoded);
    }
    rename(_oldUri, _newUri, _options) {
        throw new Error('Method not implemented.');
    }
}
exports.PackFileSystemProvider = PackFileSystemProvider;
//# sourceMappingURL=packFsProvider.js.map