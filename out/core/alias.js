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
const yaml = __importStar(require("js-yaml"));
class AliasManager {
    static async getMergedMap() {
        const files = await vscode.workspace.findFiles('byml-aliases.{yml,yaml}');
        if (files.length > 0) {
            try {
                const content = await vscode.workspace.fs.readFile(files[0]);
                const text = new TextDecoder().decode(content);
                const userMap = yaml.load(text);
                return userMap || {};
            }
            catch (e) { }
        }
        return {};
    }
    static async applyDisplayAliases(yamlStr) {
        let result = yamlStr;
        const map = await this.getMergedMap();
        // Sort keys by length descending to ensure longest match wins
        const sortedCodes = Object.keys(map).sort((a, b) => b.length - a.length);
        for (const code of sortedCodes) {
            const name = map[code];
            // Match the code followed by any word characters (suffixes like 00, _A)
            // Usage: "(['"]?)(Code(\w*))(['"]?)"
            const regex = new RegExp(`(['"]?)(${code}(\\w*))(['"]?)`, 'g');
            result = result.replace(regex, `$1$2 [${name}]$4`);
        }
        return result;
    }
    static async revertToInternal(yamlStr) {
        let result = yamlStr;
        const map = await this.getMergedMap();
        const sortedCodes = Object.keys(map).sort((a, b) => b.length - a.length);
        for (const code of sortedCodes) {
            const name = map[code];
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Match "FullCodename [Alias]" and revert to "FullCodename"
            const regex = new RegExp(`(${code}\\w*)\\s*\\[${escapedName}\\]`, 'g');
            result = result.replace(regex, '$1');
        }
        return result;
    }
}
exports.AliasManager = AliasManager;
//# sourceMappingURL=alias.js.map