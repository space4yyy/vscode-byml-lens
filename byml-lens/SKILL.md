---
name: byml-lens
description: Expert tool for Nintendo asset orchestration. Handles BYML v7, SARC archives, and Zstd compression. Use when you need to read, modify, or repackage Nintendo game files (.byml, .bgyml, .pack, .zs).
---

# BYML Lens (Nintendo Asset Orchestration)

This skill enables AI agents to read, modify, and repackage Nintendo game assets (.byml, .bgyml, .pack, .zs).

## Capabilities
- **Decompile/Recompile**: Automated bidirectional conversion between binary and YAML via `--yaml`.
- **Archive Management**: Unpack and Pack SARC archives with Zstd support.
- **Smart Cleanup**: Mandatory instructions for managing intermediate workspace directories.

## Command Reference

### 1. Archive Operations
- **Unpack**: `byml-lens unpack <archive.pack.zs> <output_dir> --yaml`
- **Pack**: `byml-lens pack <input_dir> <new_archive.pack.zs> --zstd --yaml`

### 2. File Operations
- **Binary to YAML**: `byml-lens deyaml <input.byml.zs> [output.yaml]`
- **YAML to Binary**: `byml-lens yaml2byml <input.yaml> <output.byml.zs> --reference <original.byml.zs>`

## Workflows & Safety

### Scenario: Editing an Archive
1. **Setup**: Create a unique temporary directory, e.g., `./temp_edit_area`.
2. **Unpack**: `byml-lens unpack data.pack.zs ./temp_edit_area --yaml`
3. **Action**: Read and modify the `.yaml` files inside.
4. **Repack**: `byml-lens pack ./temp_edit_area data.pack.zs --zstd --yaml`
5. **Cleanup (Mandatory)**: Delete the temporary directory immediately after successful repacking.
   `run_shell_command("rm -rf ./temp_edit_area")`

### Safety Rules
1. **Temporary Scoping**: Always unpack into a dedicated subdirectory, never the workspace root.
2. **Atomic Cleanup**: If the `pack` command fails, do NOT delete the directory so the user can inspect the error. Only delete after a successful `pack`.
3. **Filename Integrity**: Keep `.byml.yaml` extensions so the tool can identify binary targets.

---
Produced by **space4** with 🩵
