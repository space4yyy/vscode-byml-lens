# Skill: BYML Lens (Nintendo Asset Orchestration)

This skill enables AI agents to read, modify, and repackage Nintendo game assets (.byml, .bgyml, .pack, .zs).

## Capabilities
- **Decompile**: Convert binary BYML/BGYML (including Zstd compressed) to human-readable YAML.
- **Recompile**: Encode YAML back into binary BYML with optional reference files for version matching.
- **Archive Management**: Unpack and Pack SARC archives while handling nested file structures.
- **AI-Optimized Workflow**: Automated bidirectional conversion between binary and text via the `--yaml` flag.

## Tooling
The primary interface is the `byml-lens` CLI tool.

### Installation
```bash
npm install -g .
```

## Command Reference

### 1. SARC Archive Operations
- **Extract and Decompile (Recommended for AI)**:
  `byml-lens unpack <archive.pack.zs> <output_dir> --yaml`
  *Extracts all files and automatically converts .bgyml/.byml to .yaml.*
- **Pack and Recompile (Recommended for AI)**:
  `byml-lens pack <input_dir> <new_archive.pack.zs> --zstd --yaml`
  *Packs a directory and automatically converts .byml.yaml back to binary.*

### 2. Individual File Operations
- **Binary to YAML**: `byml-lens deyaml <input.byml.zs> [output.yaml]`
- **YAML to Binary**: `byml-lens yaml2byml <input.yaml> <output.byml.zs> --reference <original.byml.zs>`

## Workflows for AI Agents

### Scenario: Modifying a game parameter inside a pack
1. **Unpack**: `byml-lens unpack data.pack.zs ./temp --yaml`
2. **Read/Edit**: Locate the target `.yaml` file inside `./temp`, read it, and apply changes.
3. **Repack**: `byml-lens pack ./temp modified_data.pack.zs --zstd --yaml`

### Important Rules for AI
1. **Always use `--yaml`** when unpacking if you intend to read or edit the content.
2. **Preserve Filenames**: When editing YAML files inside a folder, keep the `.byml.yaml` naming convention so the `pack` command can identify them.
3. **Zstd**: If the input ended in `.zs`, ensure the output also uses `--zstd`.
4. **Validation**: After repacking, you can run `deyaml` on the new file to verify the YAML structure is still valid.

---
Produced by **space4** with 🩵
