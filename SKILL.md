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

## 💻 CLI Cheat Sheet

| Task | Command |
| :--- | :--- |
| **Decompile** | `byml-lens deyaml <input.byml.zs> <output.yaml>` |
| **Recompile** | `byml-lens yaml2byml <input.yaml> <output.byml.zs>` |
| **Unpack SARC** | `byml-lens unpack <input.pack.zs> <out_dir> [--yaml]` |
| **Pack SARC** | `byml-lens pack <src_dir> <output.pack.zs> [-z] [--yaml]` |
