import * as vscode from 'vscode';

export class AliasManager {
    private static readonly BUILTIN_MAP: Record<string, string> = {
        "Vss_AutoWalk00": "Mincemeat Metalworks",
        "Vss_BigSlope00": "Undertow Spillway",
        "Vss_Carousel": "Wahoo World",
        "Vss_Crank02": "Hammerhead Bridge",
        "Vss_Cross00": "Barnacle & Dime",
        "Vss_District00": "Hagglefish Market",
        "Vss_Factory00": "Sturgeon Shipyard",
        "Vss_Hiagari04": "Eeltail Alley",
        "Vss_Jyoheki03": "Flounder Heights",
        "Vss_Kaisou03": "Museum d'Alfonsino",
        "Vss_Kaisou04": "Museum d'Alfonsino",
        "Vss_Line03": "Mahi-Mahi Resort",
        "Vss_Manbou00": "Manta Maria",
        "Vss_Nagasaki03": "Shipshape Cargo Co.",
        "Vss_Pillar03": "Inkblot Art Academy",
        "Vss_Pivot03": "Crableg Capital",
        "Vss_Propeller00": "Ancho-V Games",
        "Vss_Ruins03": "Um'ami Ruins",
        "Vss_Scrap00": "Scorch Gorge",
        "Vss_Scrap01": "Scorch Gorge",
        "Vss_Section00": "Brinewater Springs",
        "Vss_Section01": "Brinewater Springs",
        "Vss_Spider00": "TarTar Rig",
        "Vss_Temple00": "Mincemeat Metalworks",
        "Vss_Temple01": "Mincemeat Metalworks",
        "Vss_Twist00": "Humpback Pump Track",
        "Vss_Upland03": "MakoMart",
        "Vss_Wave03": "Bluefin Depot",
        "Vss_Yagara": "Ika Ice",
        "Vss_Yunohana": "Scorch Gorge"
    };

    /**
     * Loads user aliases from 'byml-aliases.json' in the workspace root.
     */
    private static async getMergedMap(): Promise<Record<string, string>> {
        const map = { ...this.BUILTIN_MAP };
        
        const files = await vscode.workspace.findFiles('byml-aliases.json');
        if (files.length > 0) {
            try {
                const content = await vscode.workspace.fs.readFile(files[0]);
                const userMap = JSON.parse(new TextDecoder().decode(content));
                Object.assign(map, userMap);
            } catch (e) {
                // Silent fail for bad JSON
            }
        }
        return map;
    }

    public static async applyDisplayAliases(yaml: string): Promise<string> {
        let result = yaml;
        const map = await this.getMergedMap();
        for (const [code, name] of Object.entries(map)) {
            const regex = new RegExp(`(['"]?)${code}(['"]?)`, 'g');
            result = result.replace(regex, `$1${code} [${name}]$2`);
        }
        return result;
    }

    public static async revertToInternal(yaml: string): Promise<string> {
        let result = yaml;
        const map = await this.getMergedMap();
        for (const [code, name] of Object.entries(map)) {
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`${code}\\s*\\[${escapedName}\\]`, 'g');
            result = result.replace(regex, code);
        }
        return result;
    }
}
