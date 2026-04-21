# BYML Lens

BYML Lens 是一款专为高频编辑和审计 BYML、SARC 及 Zstandard (.zs) 压缩文件设计的 Antigravity/VS Code 扩展插件。它通过将二进制文件透明映射为原生文本视图，提供极速且无缝的资产编辑体验。

## 核心功能

- **🚀 点击即编辑**：自动劫持 `.byml`, `.bgyml`, `.pack.zs` 等二进制文件，瞬间转换为高亮 YAML 文本。
- **📦 SARC 虚拟化挂载**：支持双击 `.pack` 存档文件将其挂载为虚拟目录，像操作普通文件夹一样新增、修改或删除内部文件。
- **⚡️ Zstd 透明处理**：所有读写操作自动识别并处理 Zstandard 压缩，无需手动解压或重新压缩。
- **🎨 视觉别名系统**：支持通过项目根目录下的 `byml-aliases.yml` 将晦涩的 Codename（如 `Vss_AutoWalk00`）动态替换为友好名称（如 `龙宫转运站`），保存时自动还原，不破坏原始数据。
- **💎 原生集成**：完全跟随编辑器主题，支持行号、全文本搜索、多光标编辑及缩进指南。

## 使用方法

### 1. 编辑 BYML/BGYML
- **打开**：直接在资源管理器中**点击**任何 `.byml`, `.bgyml` 或 `.zs` 结尾的二进制文件。
- **编辑**：文件会以原生 YAML 格式打开，享受完整的高亮和编辑功能。
- **保存**：修改完成后按 `Cmd+S` (Mac) 或 `Ctrl+S` (Win)，插件会自动完成二进制编码、Zstd 压缩并写回磁盘。

### 2. 挂载 SARC (.pack)
- **挂载**：在资源管理器中**双击** `.pack` 或 `.pack.zs` 文件，左侧工作区将出现名为 `Archive: [文件名]` 的虚拟目录。
- **卸载**：再次**双击**同一个文件，或右键点击虚拟目录选择 "Unmount .pack Archive" 即可移除。

### 3. 自定义别名
- 在项目根目录创建 `byml-aliases.yml`：
  ```yaml
  Vss_AutoWalk00: 龙宫转运站
  Vss_BigSlope00: 臭鱼干温泉
  ```
- 重新打开 BYML 文件，你将看到这些 ID 已被自动替换为你的自定义名称。

## 插件优点

- **零干扰设计**：无需繁琐的导出/导入步骤，所有转换在内存中完成，直达目标。
- **高性能驱动**：自研 SARC/BYML v7 解析引擎，仅在需要时读取数据块，内存占用极低。
- **数据安全性**：在保存前进行严格的编码校验，若 YAML 格式错误会拦截写入，保护原始二进制文件不被损坏。

## 开发与构建

### 开发环境要求
- **Node.js** (v18+)
- **npm**
- **Antigravity** 或 **VS Code**

### 从源码构建
1. **克隆并安装依赖**：
   ```bash
   git clone <repository_url>
   cd byml-vscode-extension
   make install
   ```
2. **编译代码**：
   ```bash
   make compile
   ```
3. **本地调试**：
   - 在 VS Code 中打开项目，按 `F5` 启动“扩展开发宿主”。
4. **打包为 VSIX**：
   ```bash
   make package
   ```

### 本地测试与开发
- **生产模拟模式** (模拟商店版)：
  ```bash
  make install-local
  ```
  该命令将所有依赖打包为单文件并同步到 Antigravity，适合发布前的最终验证。
- **完整开发模式** (带源码调试)：
  ```bash
  make install-dev
  ```
  该命令将完整源码和 `node_modules` 同步到 Antigravity，适合高频开发和 Bug 调试。

---
Produced by **space4** with 🩵
