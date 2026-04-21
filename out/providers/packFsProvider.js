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
const byml = __importStar(require("../core/byml.js"));
const sarc_js_1 = require("../core/sarc.js");
const path = __importStar(require("path"));
class PackFileSystemProvider {
    _onDidChangeFile = new vscode.EventEmitter();
    onDidChangeFile = this._onDidChangeFile.event;
    archives = new Map();
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
            this.archives.set(archiveKey, new sarc_js_1.SarcArchive(new Uint8Array(data)));
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
            return { type: vscode.FileType.Directory, ctime: 0, mtime: 0, size: 0 };
        }
        const file = archive.files.find(f => f.name === internalPath);
        if (file) {
            // For BYML files, we pretend they are text files for the search engine
            const ext = path.extname(internalPath).toLowerCase();
            const isByml = ext === '.byml' || ext === '.bgyml';
            return {
                type: vscode.FileType.File,
                ctime: 0,
                mtime: 0,
                size: isByml ? file.data.length * 5 : file.data.length // Estimate YAML size
            };
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
        // SEARCH ENGINE HACK:
        // If a BYML file is requested and the caller expects text, we return YAML.
        // VS Code's search engine will now "see" the YAML content!
        const ext = path.extname(internalPath).toLowerCase();
        if (ext === '.byml' || ext === '.bgyml') {
            try {
                const yamlStr = byml.bymlToYaml(file.data);
                return new TextEncoder().encode(yamlStr);
            }
            catch (e) {
                return file.data;
            }
        }
        return file.data;
    }
    async writeFile(uri, content, options) {
        const { archive, internalPath, archiveUri } = await this.getArchive(uri);
        const ext = path.extname(internalPath).toLowerCase();
        let finalData = content;
        if (ext === '.byml' || ext === '.bgyml') {
            try {
                // If it's YAML text from the editor, encode it
                const text = new TextDecoder().decode(content);
                if (text.includes(':')) { // Simple YAML check
                    const originalFile = archive.files.find(f => f.name === internalPath);
                    finalData = byml.yamlToByml(text, originalFile?.data);
                }
            }
            catch (e) { }
        }
        const fileIdx = archive.files.findIndex(f => f.name === internalPath);
        if (fileIdx !== -1) {
            if (!options.overwrite)
                throw vscode.FileSystemError.FileExists(uri);
            archive.files[fileIdx].data = finalData;
        }
        else {
            if (!options.create)
                throw vscode.FileSystemError.FileNotFound(uri);
            archive.files.push({ name: internalPath, data: finalData });
        }
        try {
            const encoded = archive.encode();
            await vscode.workspace.fs.writeFile(archiveUri, encoded);
            this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Changed, uri }]);
            vscode.window.setStatusBarMessage('$(check) SARC Saved', 2000);
        }
        catch (err) {
            vscode.window.showErrorMessage(`Failed to write to pack: ${err.message}`);
        }
    }
    async delete(uri, _options) {
        const { archive, internalPath, archiveUri } = await this.getArchive(uri);
        archive.files = archive.files.filter(f => f.name !== internalPath && !f.name.startsWith(internalPath + '/'));
        try {
            const encoded = archive.encode();
            await vscode.workspace.fs.writeFile(archiveUri, encoded);
            this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Deleted, uri }]);
        }
        catch (err) { }
    }
    rename(_oldUri, _newUri, _options) { }
}
exports.PackFileSystemProvider = PackFileSystemProvider;
//# sourceMappingURL=packFsProvider.js.map