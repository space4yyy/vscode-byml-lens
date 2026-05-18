# BYML Lens Agent Skill

This skill enables AI agents to read, modify, and repackage Nintendo game assets (.byml, .bgyml, .pack, .zs) with production-grade stability and hardware compatibility.

## 🛠 Prerequisites & Auto-Setup

Upon activation, the agent **MUST** ensure the `byml-lens` environment is ready. **No repository cloning is required.**

1.  **Detect CLI**: Run `byml-lens --version` to check if the tool is installed.
2.  **Auto-Install**: If the command is missing, run:
    ```bash
    npm install -g byml-lens
    ```
3.  **Verify**: Confirm installation by running `byml-lens --help`.

## 🧠 Agent Usage Guidelines

As an AI agent, you should prioritize these patterns to maintain data integrity:

- **Metadata is Sacred**: When using `byml-lens deyaml`, the resulting YAML contains a `_byml_metadata` block. **NEVER** remove or modify this block unless explicitly instructed. It ensures the binary remains valid (alignment, endianness, version).
- **Atomic Operations**: Use the CLI for batch processing. Ensure paths are absolute or correctly relative to the workspace.
- **Cleanup**: Always delete temporary files created during `deyaml` or `unpack` operations after the task is verified.

## 🚀 Capabilities

- **Intelligent Decompilation**: Convert binary BYML/BGYML to multi-document YAML with precise type mapping.
- **Reference-Free Recompilation**: Encode YAML back into binary BYML using the embedded metadata header.
- **Archive Management**: Mount/Unmount SARC archives. Supports file-level modification and physical deletion.
- **Optimized Workflow**: Automatic Zstd handling (`.zs`) and metadata inheritance.

## 🌊 Workflow SOP: Salmon Run Stage Modding

This process ensures maximum stability for Salmon map mods using "鬼头刀度假区" (Vss_Hiagari04) as a base.

### 1. Asset Groundwork
- **Asset Base**: Use `Vss_Hiagari04.pack.zs`.
- **Layout**: Replace `Banc/Vss_Hiagari04.bcett.byml` with target layout.
- **Ocean**: Copy target ocean to `Gyml/Vss_Hiagari03Water.game__gfx__parameter__Ocean.bgyml`.

### 2. Environment Sync
- **Rendering**: Swap `RenderingDay.bgyml` with target version.
- **Patching**: `deyaml` the new `RenderingDay`, replace original ocean strings with `Vss_Hiagari03Water`, then recompile.

### 3. Graffiti "Zero-Residue" Strategy
- **Auxiliary Purge**: Replace all base graffiti files (`Pnt`, `Tcl`, etc.) with empty 8-byte aligned BYMLs.
- **Path Redirection**: `deyaml` the `GraffitiPlacementData.bgyml`. Redirect source paths to local renamed versions (e.g., `Vss_Hiagari04_Cmn`) to prevent crashes.

### 4. Technical Hard-Line
- **8-Byte Alignment**: Mandatory for BYML Version 7.
- **Zstd Compression**: Use `-z` flag during `pack` for hardware compatibility.
- **Clean Params**: Always empty the `Banc` directory in `Params.pack.zs`.

## 💻 CLI Cheat Sheet

| Task | Command |
| :--- | :--- |
| **Decompile** | `byml-lens deyaml <input.byml.zs> <output.yaml>` |
| **Recompile** | `byml-lens yaml2byml <input.yaml> <output.byml.zs>` |
| **Unpack SARC** | `byml-lens unpack <input.pack.zs> <out_dir> [--yaml]` |
| **Pack SARC** | `byml-lens pack <src_dir> <output.pack.zs> [-z] [--yaml]` |
