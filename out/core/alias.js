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
exports.AliasManager = void 0;
const vscode = __importStar(require("vscode"));
class AliasManager {
    /**
     * Loads user aliases from 'byml-aliases.json' in the workspace root.
     * All built-in mappings have been removed per user request.
     */
    static async getMergedMap() {
        const files = await vscode.workspace.findFiles('byml-aliases.json');
        if (files.length > 0) {
            try {
                const content = await vscode.workspace.fs.readFile(files[0]);
                const userMap = JSON.parse(new TextDecoder().decode(content));
                return userMap;
            }
            catch (e) {
                // Silent fail for bad JSON
            }
        }
        return {};
    }
    static async applyDisplayAliases(yaml) {
        let result = yaml;
        const map = await this.getMergedMap();
        for (const [code, name] of Object.entries(map)) {
            // Match the codename when it's a value (surrounded by spaces or quotes)
            const regex = new RegExp(`(['"]?)${code}(['"]?)`, 'g');
            result = result.replace(regex, `$1${code} [${name}]$2`);
        }
        return result;
    }
    static async revertToInternal(yaml) {
        let result = yaml;
        const map = await this.getMergedMap();
        for (const [code, name] of Object.entries(map)) {
            // Find "Codename [Alias]" and strip the alias part
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`${code}\\s*\\[${escapedName}\\]`, 'g');
            result = result.replace(regex, code);
        }
        return result;
    }
}
exports.AliasManager = AliasManager;
//# sourceMappingURL=alias.js.map