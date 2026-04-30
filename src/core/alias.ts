import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import { AliasLogic } from './aliasLogic.js';

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
        const map = await this.getMergedMap();
        return AliasLogic.applyDisplayAliases(yamlStr, map);
    }

    public static async revertToInternal(yamlStr: string): Promise<string> {
        const map = await this.getMergedMap();
        return AliasLogic.revertToInternal(yamlStr, map);
    }
}
