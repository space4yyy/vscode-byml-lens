# BYML Lens

[English](./README.md) | [简体中文]

BYML Lens 是一款专为高频编辑和审计 BYML、SARC 及 Zstandard (.zs) 压缩文件设计的 Antigravity/VS Code 扩展插件。它通过将二进制文件透明映射为原生文本视图，提供极速且无缝的资产编辑体验。

## 核心功能

- **🚀 点击即编辑**：自动劫持 `.byml`, `.bgyml`, `.pack.zs` 等二进制文件，瞬间转换为高亮 YAML 文本。
- **🧬 自动嵌入元数据**：YAML 输出现在包含版本、字节序和精确类型映射头（`_byml_metadata`），支持**免参考文件**重编译。
- **📦 SARC 虚拟化挂载**：支持双击 `.pack` 存档文件将其挂载为虚拟目录，像操作普通文件夹一样新增、修改或**物理删除**内部文件。
- **⚡️ Zstd 透明处理**：所有读写操作自动识别并处理 Zstandard 压缩，无需手动解压或重新压缩。
- **🎨 视觉别名系统**：支持通过项目根目录下的 `byml-aliases.yml` 将晦涩的 Codename（如 `Vss_AutoWalk00`）动态替换为友好名称（如 `龙宫转运站`），保存时自动还原，不破坏原始数据。
- **💎 原生集成**：完全跟随编辑器主题，支持行号、全文本搜索、多光标编辑及缩进指南。

## 使用方法

### 1. 命令行工具 (CLI)
为了方便 AI Agent 调用和批量处理，你可以使用 `byml-lens` 命令：
```bash
# 全局安装
npm install -g .

# 将二进制 BYML 转换为 YAML (带元数据的多文档格式)
byml-lens deyaml Versus.byml.zs result.yaml

# 将 YAML 转换回二进制
# 自动从 YAML 头部检测版本/类型 - 不再强制要求 --reference！
byml-lens yaml2byml result.yaml new_Versus.byml.zs

# 解压 SARC 存档 (提取原始二进制)
byml-lens unpack Versus.pack.zs ./out_folder

# 解压并反编译 (AI Agent 推荐模式)
byml-lens unpack Versus.pack.zs ./editable_folder --yaml

# 将目录打包为 SARC (自动执行 YAML 编码)
byml-lens pack ./editable_folder new_archive.pack.zs --zstd --yaml
```

### 2. 在 VS Code 中编辑 BYML/BGYML
- **编辑**：文件会以原生 YAML 格式打开，享受完整的高亮和编辑功能。头部包含的 `_byml_metadata` 块确保了二进制技术标准（如 Version 7 对齐）的一致性。
- **保存**：修改完成后按 `Cmd+S` (Mac) 或 `Ctrl+S` (Win)，插件会自动完成二进制编码、Zstd 压缩并写回磁盘，同时保持硬件兼容性。

### 3. 挂载 SARC (.pack)
- **挂载**：在资源管理器中**双击** `.pack` 或 `.pack.zs` 文件，左侧工作区将出现名为 `Archive: [文件名]` 的虚拟目录。
- **编辑/删除**：你可以直接修改内部文件，或直接**右键删除**整个文件夹（例如 `Banc`），插件会自动处理 SARC 结构。
- **卸载**：再次**双击**同一个文件，或右键点击虚拟目录选择 "Unmount .pack Archive" 即可移除。

### 4. 自定义别名
- 在项目根目录创建 `byml-aliases.yml`：
  ```yaml
  Vss_AutoWalk00: 龙宫转运站
  Vss_BigSlope00: 臭鱼干温泉
  ```
- 重新打开 BYML 文件，你将看到这些 ID 已被自动替换为你的自定义名称。

## 开发与构建

### 推荐开发流程
推荐直接使用 VS Code 内置的调试功能进行开发，无需手动同步文件：
1. **打开项目**：在 Antigravity 或 VS Code 中打开本源码文件夹。
2. **启动调试**：按下 **`F5`** 键，启动“扩展开发宿主”。
3. **实时预览**：这会弹出一个全新的窗口，其中已加载你当前的最新代码。你可以在源码中设置断点并实时查看日志。

### 从源码构建
1. **安装依赖**：
   ```bash
   git clone <repository_url>
   cd byml-vscode-extension
   make install
   ```
2. **打包为 VSIX**：
   ```bash
   make package
   ```
3. **手动安装**：在插件面板点击 `...` -> `Install from VSIX...`，选择生成的 `.vsix` 文件即可。

## 故障排查与反馈

如果遇到解析错误或异常，请通过以下步骤提供日志：
1. 打开 **输出 (Output)** 面板 (`查看` -> `输出`)。
2. 在右上角的下拉菜单中选择 **BYML Lens**。
3. 如需更详细的调试信息，请在设置中开启：`BYML Lens > Debug`。
4. 复制日志内容并提交至 [GitHub Issue](https://github.com/space4yyy/vscode-byml-lens/issues)。

---
Produced by **space4** with 🩵
