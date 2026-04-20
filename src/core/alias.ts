import * as vscode from 'vscode';
import * as yaml from 'js-yaml';

export class AliasManager {
    /**
     * Loads user aliases from 'byml-aliases.yml' or 'byml-aliases.yaml' in the workspace root.
     */
    private static async getMergedMap(): Promise<Record<string, string>> {
        // Look for .yml first, then .yaml
        const files = await vscode.workspace.findFiles('byml-aliases.{yml,yaml}');
        if (files.length > 0) {
            try {
                const content = await vscode.workspace.fs.readFile(files[0]);
                const text = new TextDecoder().decode(content);
                const userMap = yaml.load(text) as Record<string, string>;
                return userMap || {};
            } catch (e) {
                // Silent fail for bad YAML
            }
        }
        return {};
    }

    public static async applyDisplayAliases(yamlStr: string): Promise<string> {
        let result = yamlStr;
        const map = await this.getMergedMap();
        for (const [code, name] of Object.entries(map)) {
            // Match the codename when it's a value (surrounded by spaces or quotes)
            const regex = new RegExp(`(['"]?)${code}(['"]?)`, 'g');
            result = result.replace(regex, `$1${code} [${name}]$2`);
        }
        return result;
    }

    public static async revertToInternal(yamlStr: string): Promise<string> {
        let result = yamlStr;
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
