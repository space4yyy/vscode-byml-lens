import * as vscode from 'vscode';

export class AliasManager {
    /**
     * Loads user aliases from 'byml-aliases.json' in the workspace root.
     * All built-in mappings have been removed per user request.
     */
    private static async getMergedMap(): Promise<Record<string, string>> {
        const files = await vscode.workspace.findFiles('byml-aliases.json');
        if (files.length > 0) {
            try {
                const content = await vscode.workspace.fs.readFile(files[0]);
                const userMap = JSON.parse(new TextDecoder().decode(content));
                return userMap;
            } catch (e) {
                // Silent fail for bad JSON
            }
        }
        return {};
    }

    public static async applyDisplayAliases(yaml: string): Promise<string> {
        let result = yaml;
        const map = await this.getMergedMap();
        for (const [code, name] of Object.entries(map)) {
            // Match the codename when it's a value (surrounded by spaces or quotes)
            const regex = new RegExp(`(['"]?)${code}(['"]?)`, 'g');
            result = result.replace(regex, `$1${code} [${name}]$2`);
        }
        return result;
    }

    public static async revertToInternal(yaml: string): Promise<string> {
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
