import * as vscode from 'vscode';
import * as path from 'path';
import { PackFileSystemProvider } from './providers/packFsProvider.js';
import { BymlYamlProvider } from './providers/bymlFsProvider.js';
import { Logger } from './core/logger.js';
import { BfresParser } from './core/bfres.js';
import * as zstd from './core/zstd.js';
import * as fs from 'fs';

class BymlRedirectProvider implements vscode.CustomEditorProvider {
    async openCustomDocument(uri: vscode.Uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
        const virtualUri = vscode.Uri.from({
            scheme: 'byml-edit',
            path: document.uri.path + '.yaml',
            query: document.uri.toString()
        });
        await vscode.window.showTextDocument(virtualUri, { preview: true, preserveFocus: false });
        setTimeout(() => webviewPanel.dispose(), 100);
    }
    private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<any>();
    public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    public backupCustomDocument() { return Promise.resolve({ id: '', delete: () => { } }); }
    public saveCustomDocument() { return Promise.resolve(); }
    public saveCustomDocumentAs() { return Promise.resolve(); }
    public revertCustomDocument() { return Promise.resolve(); }
}

class BfresRedirectProvider implements vscode.CustomEditorProvider {
    async openCustomDocument(uri: vscode.Uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
        webviewPanel.webview.options = { enableScripts: true };
        
        let data = fs.readFileSync(document.uri.fsPath);
        if (zstd.isCompressed(data)) {
            data = Buffer.from(zstd.decompressData(data));
        }
        
        const tmpPath = path.join(path.dirname(document.uri.fsPath), `.tmp_${path.basename(document.uri.fsPath)}_${Date.now()}`);
        fs.writeFileSync(tmpPath, data);
        
        try {
            const parser = new BfresParser(tmpPath);
            const header = parser.parseHeader();
            const resources = parser.listResources();
            
            const resourceHtml = resources.map(r => `
                <div style="padding: 8px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
                    <span>[0x${r.offset.toString(16).toUpperCase()}] <b>${r.tag}</b></span>
                    <button style="background:#007acc; color:white; border:none; padding:4px 8px; cursor:pointer; border-radius:2px;" onclick="extract('${r.tag}', ${r.offset})">Extract</button>
                </div>
            `).join('');

            webviewPanel.webview.html = `
                <html>
                <body style="font-family: sans-serif; padding: 20px; color: #ccc; background-color: #1e1e1e;">
                    <h2>BFRES Resource Inspector</h2>
                    <div style="background: #252526; padding: 10px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #333;">
                        <div style="margin-bottom:4px;"><b>Path:</b> ${document.uri.fsPath}</div>
                        <div style="margin-bottom:4px;"><b>Version:</b> 0x${header.version.toString(16).toUpperCase()}</div>
                        <div style="margin-bottom:4px;"><b>Endian:</b> ${header.endian === 0xFFFE ? 'Little Endian' : 'Big Endian'}</div>
                        <div><b>Size:</b> ${data.length} bytes</div>
                    </div>
                    <h3>Internal Resources (${resources.length})</h3>
                    <div style="background: #252526; border: 1px solid #333; border-radius: 4px;">
                        ${resourceHtml}
                    </div>
                    <script>
                        const vscode = acquireVsCodeApi();
                        function extract(tag, offset) {
                            vscode.postMessage({ command: 'extract', tag, offset });
                        }
                    </script>
                </body>
                </html>
            `;

            webviewPanel.webview.onDidReceiveMessage(async (msg) => {
                if (msg.command === 'extract') {
                    const saveUri = await vscode.window.showSaveDialog({
                        defaultUri: vscode.Uri.file(path.join(path.dirname(document.uri.fsPath), `${msg.tag}${msg.tag === 'BNTX' ? '.bntx' : '.bin'}`)),
                        title: `Extract ${msg.tag}`
                    });
                    if (saveUri) {
                        parser.extractResource(msg.tag, msg.offset, saveUri.fsPath);
                        vscode.window.showInformationMessage(`Extracted ${msg.tag} to ${saveUri.fsPath}`);
                    }
                }
            });
        } finally {
            if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        }
    }
    private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<any>();
    public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    public backupCustomDocument() { return Promise.resolve({ id: '', delete: () => { } }); }
    public saveCustomDocument() { return Promise.resolve(); }
    public saveCustomDocumentAs() { return Promise.resolve(); }
    public revertCustomDocument() { return Promise.resolve(); }
}

class SarcRedirectProvider implements vscode.CustomEditorProvider {
    constructor(private packFs: PackFileSystemProvider) { }

    async openCustomDocument(uri: vscode.Uri) { return { uri, dispose: () => { } }; }
    async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
        const checkAndToggle = () => {
            const tab = this.findTab(document.uri);
            if (tab && !tab.isPreview) {
                this.toggleSarc(document.uri);
                setTimeout(() => webviewPanel.dispose(), 50);
                return true;
            }
            return false;
        };
        if (!checkAndToggle()) {
            webviewPanel.webview.html = `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;color:#888;font-family:sans-serif;"><div>Double-click to Mount/Unmount Archive</div></body></html>`;
            const disposable = vscode.window.tabGroups.onDidChangeTabs(_ => {
                if (checkAndToggle()) disposable.dispose();
            });
            webviewPanel.onDidDispose(() => disposable.dispose());
        }
    }
    private findTab(uri: vscode.Uri): vscode.Tab | undefined {
        for (const group of vscode.window.tabGroups.all) {
            for (const tab of group.tabs) {
                if ((tab.input as any)?.uri?.toString() === uri.toString()) return tab;
            }
        }
        return undefined;
    }
    private toggleSarc(uri: vscode.Uri) {
        const sarcUri = vscode.Uri.parse(`sarc://${uri.fsPath}`);
        const folders = vscode.workspace.workspaceFolders || [];
        const existingFolder = folders.find(f => f.uri.toString() === sarcUri.toString());
        if (existingFolder) {
            this.packFs.unmount(sarcUri);
            vscode.workspace.updateWorkspaceFolders(existingFolder.index, 1);
        } else {
            vscode.workspace.updateWorkspaceFolders(folders.length, 0, {
                uri: sarcUri,
                name: `[Pack] ${path.basename(uri.fsPath)}`
            });
        }
    }
    private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<any>();
    public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    public backupCustomDocument() { return Promise.resolve({ id: '', delete: () => { } }); }
    public saveCustomDocument() { return Promise.resolve(); }
    public saveCustomDocumentAs() { return Promise.resolve(); }
    public revertCustomDocument() { return Promise.resolve(); }
}

export function activate(context: vscode.ExtensionContext) {
    // 0. Initialize Logger
    Logger.setChannel(vscode.window.createOutputChannel("BYML Lens"));

    try {
        const packFs = new PackFileSystemProvider();
        const bymlFs = new BymlYamlProvider();

        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('sarc', packFs, { isCaseSensitive: true }));
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider('byml-edit', bymlFs, { isCaseSensitive: true }));
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.redirector', new BymlRedirectProvider()));
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.sarc-redirector', new SarcRedirectProvider(packFs)));
        context.subscriptions.push(vscode.window.registerCustomEditorProvider('byml-inspector.bfres-redirector', new BfresRedirectProvider()));
        
        // Push providers to subscriptions to ensure dispose() is called
        context.subscriptions.push(bymlFs);

        // ADDED: Extract BFRES Resources (Context Menu)
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.extractBfres', async (uri: vscode.Uri) => {
            if (!uri) return;
            const folderUri = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                title: 'Select Output Directory for BFRES Resources'
            });
            if (folderUri && folderUri[0]) {
                let data = fs.readFileSync(uri.fsPath);
                if (zstd.isCompressed(data)) {
                    data = Buffer.from(zstd.decompressData(data));
                }
                const tmpPath = path.join(path.dirname(uri.fsPath), `.tmp_extract_${Date.now()}`);
                fs.writeFileSync(tmpPath, data);
                try {
                    const parser = new BfresParser(tmpPath);
                    const resources = parser.listResources();
                    const outDir = folderUri[0].fsPath;
                    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
                    
                    resources.forEach((r, index) => {
                        const ext = r.tag === 'BNTX' ? '.bntx' : '.bin';
                        const outPath = path.join(outDir, `${index.toString().padStart(3, '0')}_${r.tag}${ext}`);
                        parser.extractResource(r.tag, r.offset, outPath);
                    });
                    vscode.window.showInformationMessage(`Successfully extracted ${resources.length} resources to ${outDir}`);
                } finally {
                    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
                }
            }
        }));
        
        // ADDED: Compare with Original Binary
        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.compareWithOriginal', async (uri: vscode.Uri) => {
            if (!uri) uri = vscode.window.activeTextEditor?.document.uri as vscode.Uri;
            if (!uri) return;

            const originalUri = uri; // Binary file on disk or in SARC
            const virtualUri = vscode.Uri.from({
                scheme: 'byml-edit',
                path: uri.path + '.yaml',
                query: uri.toString()
            });

            // We compare the virtual YAML (current) with the actual binary (transformed back to original)
            // But VS Code can't natively diff binary vs text. 
            // So we'll open a second virtual document but with a "readonly" tag to represent the "untouched" version.
            const baseUri = vscode.Uri.from({
                scheme: 'byml-edit',
                path: uri.path + '.original.yaml',
                query: uri.toString() // In readFile, we can check for .original.yaml and return unmodified data
            });

            await vscode.commands.executeCommand('vscode.diff', baseUri, virtualUri, `${path.basename(uri.fsPath)} (Original ↔ Modified)`);
        }));

        context.subscriptions.push(vscode.commands.registerCommand('byml-inspector.unmountPack', async (uri: vscode.Uri) => {
            const folder = vscode.workspace.workspaceFolders?.find(f => f.uri.toString() === uri.toString());
            if (folder) {
                packFs.unmount(uri);
                vscode.workspace.updateWorkspaceFolders(folder.index, 1);
            }
        }));

        Logger.info("BYML Lens Activated.");
    } catch (err: any) {
        Logger.error("Activation Failed", err);
    }
}

export function deactivate() {}
