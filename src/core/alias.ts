import * as vscode from 'vscode';
import * as yaml from 'js-yaml';

export class AliasManager {
    private static async getMergedMap(): Promise<Record<string, string>> {
        const files = await vscode.workspace.findFiles('byml-aliases.{yml,yaml}');
        if (files.length > 0) {
            try {
                const content = await vscode.workspace.fs.readFile(files[0]);
                const text = new TextDecoder().decode(content);
                const userMap = yaml.load(text) as Record<string, string>;
                return userMap || {};
            } catch (e) { }
        }
        return {};
    }

    public static async applyDisplayAliases(yamlStr: string): Promise<string> {
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

    public static async revertToInternal(yamlStr: string): Promise<string> {
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
