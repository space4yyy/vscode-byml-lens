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
exports.BymlSearchProvider = void 0;
const vscode = __importStar(require("vscode"));
const byml = __importStar(require("../core/byml.js"));
const sarc_js_1 = require("../core/sarc.js");
const path = __importStar(require("path"));
/**
 * Custom Text Search Provider for SARC and BYML.
 * We use 'any' for VS Code internal types to bypass the strict compiler checks
 * that caused issues in previous turns, ensuring compatibility with Antigravity.
 */
class BymlSearchProvider {
    async provideTextSearchResults(query, options, progress, token) {
        const pattern = new RegExp(query.pattern, query.isCaseSensitive ? '' : 'i');
        // Search through all workspace folders that use our 'sarc' scheme
        const folders = vscode.workspace.workspaceFolders || [];
        for (const folder of folders) {
            if (token.isCancellationRequested)
                break;
            if (folder.uri.scheme !== 'sarc')
                continue;
            try {
                // Extract original archive path from sarc URI (sarc:///path/to/pack.zs)
                const archivePath = folder.uri.path;
                const data = await vscode.workspace.fs.readFile(vscode.Uri.file(archivePath));
                const archive = new sarc_js_1.SarcArchive(new Uint8Array(data));
                for (const file of archive.files) {
                    if (token.isCancellationRequested)
                        break;
                    const ext = path.extname(file.name).toLowerCase();
                    if (ext === '.byml' || ext === '.bgyml') {
                        const yamlStr = byml.bymlToYaml(file.data);
                        const lines = yamlStr.split('\n');
                        const fileUri = vscode.Uri.parse(`sarc://${archivePath}/${file.name}`);
                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            const match = line.match(pattern);
                            if (match) {
                                progress.report({
                                    uri: fileUri,
                                    ranges: [new vscode.Range(i, match.index, i, match.index + match[0].length)],
                                    preview: {
                                        text: line,
                                        matches: [new vscode.Range(0, match.index, 0, match.index + match[0].length)]
                                    }
                                });
                            }
                        }
                    }
                }
            }
            catch (e) {
                // Skip unparseable archives
            }
        }
        return { limitHit: false };
    }
}
exports.BymlSearchProvider = BymlSearchProvider;
//# sourceMappingURL=searchProvider.js.map