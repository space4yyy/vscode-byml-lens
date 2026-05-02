# BYML Lens Agent Skill

This skill enables AI agents to read, modify, and repackage Nintendo game assets (.byml, .bgyml, .pack, .zs) with production-grade stability and hardware compatibility.

## Capabilities

- **Intelligent Decompilation**: Convert binary BYML/BGYML to multi-document YAML. The first document (`_byml_metadata`) automatically preserves version, endianness, and precise numeric types.
- **Reference-Free Recompilation**: Encode YAML back into binary BYML using the embedded metadata header. No manual reference files are required to maintain technical standards (e.g., Splatoon 3's 8-byte alignment).
- **Archive Management**: Mount/Unmount SARC archives. Supports file-level modification and physical deletion of files/folders directly from the editor sidebar.
- **Optimized Workflow**: Automatic Zstd handling and metadata inheritance ensure assets remain compatible with real hardware and Ryujinx.

## Workflow SOP: Salmon Run Stage Modding (Advanced)

This refined process ensures maximum stability and eliminates residue when using "鬼头刀度假区" (Vss_Hiagari04) as a base.

### 1. Asset Groundwork
- **Asset Base**: Always use `Vss_Hiagari04.pack.zs` as the foundation.
- **Layout Injection**: Replace `Banc/Vss_Hiagari04.bcett.byml` with the target Salmon map's layout.
- **Ocean Refactor**: 
    - Copy the Salmon map's ocean file (e.g., `Cop_Default`) to `Gyml/Vss_Hiagari03Water.game__gfx__parameter__Ocean.bgyml`.
    - Note: Keeping the *internal filename* expected by the base map minimizes rendering crashes.

### 2. Rendering & Environment
- **RenderingDay Injection**: Swap the base map's `RenderingDay.bgyml` with the Salmon map's version.
- **Ocean Reference Patch**: Use `deyaml` on the new `RenderingDay`, replace all occurrences of the original ocean name (e.g., `Cop_Default`) with `Vss_Hiagari03Water`, then recompile.

### 3. Graffiti: The "Zero-Residue" Strategy
To prevent base map stickers from remaining and to avoid path-related crashes:
- **Auxiliary Purge**: Replace all base auxiliary graffiti files (`Pnt`, `Tcl`, `Var`, `Vcl`, `Vgl`, `Vlf`) with empty 8-byte aligned BYMLs.
- **Decision Branch**:
    - **Case A: Stage has original graffiti**:
        1. Copy the Salmon map's `_Cmn.byml` to `Vss_Hiagari04_Cmn.byml`.
        2. **Path Redirection**: `deyaml` the `GraffitiPlacementData.bgyml`. Replace the source path string (e.g., `Cop_Shakehighway_Cmn`) with `Vss_Hiagari04_Cmn`. This is critical for preventing "Asset Not Found" crashes.
    - **Case B: Stage has NO original graffiti**:
        1. Inject an empty `_Cmn.byml`.
        2. **SceneParam Surgery**: `deyaml` the `Vss_Hiagari04.engine__scene__SceneParam.bgyml`. Completely delete the `SceneGraffitiPlacementData` entry from the `Components` dictionary.

### 4. Technical Hard-Line
- **Alignment**: Every BYML file (Version 7) must have a final file size that is a multiple of 8 bytes.
- **Zstd**: SARC archives must be Zstd-compressed (`-z`) for hardware compatibility.
- **Params**: Always clear the `Banc` folder in `Params.pack.zs`.

## CLI Usage Guidelines

- **Automatic Metadata**: BYML-Lens now injects `_byml_metadata` into YAML headers by default. **Always preserve this block** to ensure binary consistency.
- **Simplified Commands**:
  - Decompile: `byml-lens deyaml <file.zs>`
  - Recompile: `byml-lens yaml2byml <file.yaml> <output.byml>` (Auto-detects all parameters).
- **Zstd Support**: Use `-z` for Zstd compression to ensure game engine compatibility.
- **Binary Integrity**: The compiler uses the `type_map` in metadata to ensure numeric precision (Float32 vs Float64, etc.), preventing "type loss" crashes.

## Developer Quick-Start (Makefile)

- `make bundle`: Build the CLI and extension.
- `make package`: Generate the VSIX installer.
- `make install-ext`: Build, package, and force-install to Antigravity.
- `make test-unit`: Run rapid core logic tests.
- `make clean`: Wipe `out`, `dist`, and `temp` directories.
