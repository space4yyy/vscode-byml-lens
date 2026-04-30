# BYML Lens Agent Skill

This skill enables AI agents to read, modify, and repackage Nintendo game assets (.byml, .bgyml, .pack, .zs) with production-grade stability and hardware compatibility.

## Capabilities

- **Intelligent Decompilation**: Convert binary BYML/BGYML to multi-document YAML. The first document (`_byml_metadata`) automatically preserves version, endianness, and precise numeric types.
- **Reference-Free Recompilation**: Encode YAML back into binary BYML using the embedded metadata header. No manual reference files are required to maintain technical standards (e.g., Splatoon 3's 8-byte alignment).
- **Archive Management**: Mount/Unmount SARC archives. Supports file-level modification and physical deletion of files/folders directly from the editor sidebar.
- **Optimized Workflow**: Automatic Zstd handling and metadata inheritance ensure assets remain compatible with real hardware and Ryujinx.

## Workflow SOP: Stage Modding

### 1. Project Initialization
- Open the workspace containing your `romfs` structure.
- Use `make install-ext` to ensure the latest version is active in Antigravity/VS Code.

### 2. SARC Surgery
- **Mounting**: Double-click `.pack.zs` files to mount them as virtual directories.
- **Conflict Resolution**: Directly delete conflicting folders (like `Banc` in `Params.pack.zs`) using the context menu.
- **Asset Injection**: 
  - **Layout**: Copy YAML content from source `bcett.byml` to target.
  - **Ocean**: Inject ocean parameters with their *original* names to satisfy `OceanRef` pointers in rendering configs.
  - **Sky/Atmosphere**: Swap `RenderingDay.bgyml` to sync lighting/skybox.
  - **Reference Fix**: If you rename an asset (e.g., `Ocean`), globally update all string references in the parent RD/SceneParam files.

### 3. Graffiti Removal
- **Preferred Method**: Locate the scene's `SceneParam.bgyml`.
- **Action**: Delete the `SceneGraffitiPlacementData` entry from the `Components` dictionary. This cleanly strips the graffiti subsystem from the stage.

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
