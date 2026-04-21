# BYML Lens

BYML Lens is an Antigravity/VS Code extension specifically designed for high-frequency editing and auditing of BYML, SARC, and Zstandard (.zs) compressed files. It provides a lightning-fast and seamless asset editing experience by transparently mapping binary files to native text views.

## Core Features

- **🚀 Click-to-Edit**: Automatically intercepts `.byml`, `.bgyml`, and `.pack.zs` binary files, instantly converting them into highlighted YAML text.
- **📦 SARC Virtualization**: Double-click any `.pack` archive to mount it as a virtual directory. Add, modify, or delete internal files as if they were in a normal folder.
- **⚡️ Transparent Zstd Support**: All read and write operations automatically detect and handle Zstandard compression. No manual decompression or re-compression required.
- **🎨 Visual Alias System**: Use a `byml-aliases.yml` in your workspace root to dynamically replace cryptic codenames (e.g., `Vss_AutoWalk00`) with friendly names (e.g., `Lemuria Hub`). Aliases are automatically reverted upon saving to maintain data integrity.
- **💎 Native Integration**: Fully compatible with editor themes. Supports line numbers, full-text search, multi-cursor editing, and indentation guides.

## Usage

### 1. Editing BYML/BGYML
- **Open**: Click any binary file ending in `.byml`, `.bgyml`, or `.zs` in the Explorer.
- **Edit**: The file opens as a native YAML document with full syntax highlighting.
- **Save**: Press `Cmd+S` (Mac) or `Ctrl+S` (Win). The extension automatically handles binary encoding and Zstd compression before writing back to disk.

### 2. Mounting SARC (.pack)
- **Mount**: Double-click a `.pack` or `.pack.zs` file. A virtual directory named `Archive: [filename]` will appear in your workspace.
- **Unmount**: Double-click the same file again, or right-click the virtual folder and select "Unmount .pack Archive".

### 3. Custom Aliases
- Create `byml-aliases.yml` in your project root:
  ```yaml
  Vss_AutoWalk00: Lemuria Hub
  Vss_BigSlope00: Brinewater Springs
  ```
- Re-open a BYML file to see the IDs automatically replaced with your custom names.

## Development & Build

### Recommended Development Workflow
For active development, use the built-in VS Code debugger:
1. **Open the project** in Antigravity or VS Code.
2. **Press `F5`** to launch the "Extension Development Host".
3. This opens a new window with your latest code active, supporting breakpoints and live logs.

### Build from Source
1. **Clone and Install**:
   ```bash
   git clone <repository_url>
   cd byml-vscode-extension
   make install
   ```
2. **Package to VSIX**:
   ```bash
   make package
   ```
3. **Manual Install**: In the Extensions view, click `...` -> `Install from VSIX...` and select the generated file.

## Troubleshooting & Feedback

If you encounter issues or corrupted files, please provide logs from the Output panel:
1. Open the **Output** panel (`View` -> `Output`).
2. Select **BYML Lens** from the dropdown menu in the top-right corner.
3. For deeper investigation, enable debug logs in settings: `BYML Lens > Debug`.
4. Copy the logs and attach them to your [GitHub Issue](https://github.com/space4yyy/vscode-byml-lens/issues).

---
Produced by **space4** with 🩵
