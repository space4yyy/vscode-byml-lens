export interface AliasMap {
    [codename: string]: string;
}

export class AliasManager {
    // Built-in common mappings for Splatoon 3 (based on your files)
    private static readonly BUILTIN_MAP: AliasMap = {
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
     * Converts Codenames in YAML to Display Names.
     * Example: "Vss_AutoWalk00" -> "Vss_AutoWalk00 (Mincemeat Metalworks)"
     */
    public static applyDisplayAliases(yaml: string): string {
        let result = yaml;
        for (const [code, name] of Object.entries(this.BUILTIN_MAP)) {
            // Match the codename when it's a value (surrounded by spaces or quotes)
            const regex = new RegExp(`(['"]?)${code}(['"]?)`, 'g');
            result = result.replace(regex, `$1${code} [${name}]$2`);
        }
        return result;
    }

    /**
     * Reverts Display Names back to pure Codenames for binary saving.
     * Example: "Vss_AutoWalk00 [Mincemeat Metalworks]" -> "Vss_AutoWalk00"
     */
    public static revertToInternal(yaml: string): string {
        let result = yaml;
        for (const [code, name] of Object.entries(this.BUILTIN_MAP)) {
            // Find "Codename [Alias]" and strip the alias part
            // We use a robust regex that handles potential quotes
            const regex = new RegExp(`${code}\\s*\\[${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g');
            result = result.replace(regex, code);
        }
        return result;
    }
}
