export class AliasLogic {
    public static applyDisplayAliases(yamlStr: string, map: Record<string, string>): string {
        let result = yamlStr;
        // Sort keys by length descending to ensure longest match wins
        const sortedCodes = Object.keys(map).sort((a, b) => b.length - a.length);

        for (const code of sortedCodes) {
            const name = map[code];
            // JS-YAML with quotingType: '"' will output strings as "value"
            // We only replace inside double quotes to avoid hitting keys or comments
            const regex = new RegExp(`"(${code}(\\w*))"`, 'g');
            result = result.replace(regex, `"$1 [${name}]"`);
        }
        return result;
    }

    public static revertToInternal(yamlStr: string, map: Record<string, string>): string {
        let result = yamlStr;
        const sortedCodes = Object.keys(map).sort((a, b) => b.length - a.length);

        for (const code of sortedCodes) {
            const name = map[code];
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Revert "Codename [Alias]" back to "Codename" inside quotes
            const regex = new RegExp(`"(${code}\\w*)\\s*\\[${escapedName}\\]"`, 'g');
            result = result.replace(regex, `"$1"`);
        }
        return result;
    }
}
