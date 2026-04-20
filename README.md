# BYML Inspector

BYML Inspector is an Antigravity/VS Code extension specifically designed for high-frequency editing and auditing of BYML, SARC, and Zstandard (.zs) compressed files. It provides a lightning-fast and seamless asset editing experience by transparently mapping binary files to native text views.

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

## Advantages

- **Zero-Friction Design**: No tedious export/import steps. All conversions happen in-memory.
- **High-Performance Driver**: Custom-built SARC/BYML v7 parsing engine that reads data blocks only when needed, ensuring minimal memory footprint.
- **Data Security**: Strict encoding validation before saving. If the YAML format is invalid, the save is blocked to protect the original binary file.

## Development & Build

### Requirements
- **Node.js** (v18+)
- **npm**
- **Antigravity** or **VS Code**

### Build from Source
1. **Clone and Install**:
   ```bash
   git clone <repository_url>
   cd byml-vscode-extension
   make install
   ```
2. **Compile**:
   ```bash
   make compile
   ```
3. **Debug**:
   - Open the project in VS Code/Antigravity and press `F5`.
4. **Package**:
   ```bash
   make package
   ```

### Manual Installation to Antigravity
1. Copy the project folder (including `out`, `package.json`, and `node_modules`) to `~/.antigravity/extensions/`.
2. Restart Antigravity.

---
Produced by **space4** with 🩵
