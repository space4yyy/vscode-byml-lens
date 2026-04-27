# Skill: BYML Lens (Nintendo Asset Orchestration)

This skill enables AI agents to read, modify, and repackage Nintendo game assets (.byml, .bgyml, .pack, .zs).

## Capabilities
- **Decompile/Recompile**: Automated bidirectional conversion between binary and YAML via `--yaml`.
- **Smart Hybrid Packing**: Efficiently repacks SARC by preserving raw binaries for unedited files.
- **256-Byte Alignment**: Ensures hardware-level memory alignment for Splatoon 3 and other modern games.

## Command Reference

### 1. Archive Operations
- **Unpack**: `byml-lens unpack <archive.pack.zs> <output_dir> --yaml`
  *Generates both .byml (Original) and .byml.yaml (Editable).*
- **Pack**: `byml-lens pack <input_dir> <new_archive.pack.zs> --zstd`
  *Priority: Binary > YAML. Use Smart Hybrid rules.*

## Operational Rules (CRITICAL)

### 1. How to Trigger Re-compilation
In v0.2.4+, the `pack` command uses **Smart Hybrid Mode**.
- **Rule**: If a folder contains both `file.byml` and `file.byml.yaml`, the **Binary (.byml) is preferred** for safety.
- **Action for Agent**: After editing a YAML file, you **MUST delete the corresponding binary file** (e.g., `rm path/to/file.bgyml`) before running the `pack` command. Failure to do this will result in your changes being ignored.

### 2. Ensuring Tool Integrity
Always ensure the CLI tool is built from the current source:
- **Action**: Run `npm run bundle && npm install -g .` if any core logic in `src/` has changed.

### 3. SARC Alignment
- The tool automatically enforces 256-byte alignment per file. Do not manually pad files.

### 4. Cleanup & Safety
- **Setup**: Use a dedicated subdirectory (e.g., `./temp_edit`).
- **Cleanup**: Programmatically delete the temp directory ONLY after a successful `pack` command.
- **Atomic Failure**: If `pack` fails, preserve the directory for user inspection.

---
Produced by **space4** with 🩵
