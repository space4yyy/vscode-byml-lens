import * as vscode from 'vscode';
import * as byml from '../core/byml.js';

class BymlDocument implements vscode.CustomDocument {
    constructor(
        public readonly uri: vscode.Uri,
        public readonly initialData: Uint8Array
    ) { }
    dispose(): void { }
}

export class BymlEditorProvider implements vscode.CustomEditorProvider<BymlDocument> {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new BymlEditorProvider(context);
        return vscode.window.registerCustomEditorProvider(BymlEditorProvider.viewType, provider, {
            webviewOptions: { retainContextWhenHidden: true },
            supportsMultipleEditorsPerDocument: false
        });
    }

    private static readonly viewType = 'byml-inspector.bymlEditor';

    constructor(private readonly context: vscode.ExtensionContext) { }

    async openCustomDocument(uri: vscode.Uri): Promise<BymlDocument> {
        const data = await vscode.workspace.fs.readFile(uri);
        return new BymlDocument(uri, new Uint8Array(data));
    }

    async resolveCustomEditor(
        document: BymlDocument,
        webviewPanel: vscode.WebviewPanel
    ): Promise<void> {
        webviewPanel.webview.options = { enableScripts: true };

        let yamlStr = '';
        try {
            yamlStr = byml.bymlToYaml(document.initialData);
        } catch (err: any) {
            yamlStr = `# Error parsing BYML: ${err.message}`;
        }

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, yamlStr);

        webviewPanel.webview.onDidReceiveMessage(async e => {
            switch (e.type) {
                case 'save':
                    try {
                        const encoded = byml.yamlToByml(e.content, document.initialData);
                        await vscode.workspace.fs.writeFile(document.uri, encoded);
                        vscode.window.showInformationMessage('BYML Saved Successfully.');
                    } catch (err: any) {
                        vscode.window.showErrorMessage(`Save Failed: ${err.message}`);
                    }
                    return;
            }
        });
    }

    private getHtmlForWebview(webview: vscode.Webview, content: string): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <style>
                    :root {
                        --bg: var(--vscode-editor-background);
                        --fg: var(--vscode-editor-foreground);
                        --line-bg: var(--vscode-editorLineNumber-foreground);
                        --accent: var(--vscode-editorSuggestWidget-focusHighlightForeground);
                        --font: var(--vscode-editor-font-family, 'Consolas', monospace);
                        --key-color: #569cd6;
                        --val-color: #ce9178;
                        --num-color: #b5cea8;
                        --bool-color: #569cd6;
                    }
                    /* Adapt colors for light theme */
                    body.vscode-light {
                        --key-color: #0451a5;
                        --val-color: #a31515;
                        --num-color: #098658;
                        --bool-color: #0000ff;
                    }

                    body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: var(--bg); color: var(--fg); font-family: var(--font); }
                    
                    .editor-container {
                        display: flex;
                        height: 100%;
                        width: 100%;
                        position: relative;
                    }

                    .line-numbers {
                        width: 40px;
                        padding: 15px 5px;
                        text-align: right;
                        background: var(--bg);
                        color: var(--line-bg);
                        font-size: 13px;
                        user-select: none;
                        border-right: 1px solid #33333333;
                        overflow: hidden;
                    }

                    .textarea-wrapper {
                        flex-grow: 1;
                        position: relative;
                        overflow: hidden;
                    }

                    textarea, #highlight-layer {
                        position: absolute;
                        top: 0; left: 0;
                        width: 100%; height: 100%;
                        padding: 15px;
                        margin: 0;
                        border: none;
                        outline: none;
                        font-family: var(--font);
                        font-size: 14px;
                        line-height: 1.5;
                        white-space: pre;
                        tab-size: 2;
                        box-sizing: border-box;
                        word-wrap: normal;
                        overflow: auto;
                    }

                    textarea {
                        background: transparent;
                        color: transparent;
                        caret-color: var(--fg);
                        z-index: 2;
                        resize: none;
                    }

                    #highlight-layer {
                        z-index: 1;
                        pointer-events: none;
                        color: var(--fg);
                    }

                    /* Highlighting Styles */
                    .hl-key { color: var(--key-color); }
                    .hl-string { color: var(--val-color); }
                    .hl-number { color: var(--num-color); }
                    .hl-bool { color: var(--bool-color); font-weight: bold; }
                    .hl-comment { color: #6a9955; font-style: italic; }
                </style>
            </head>
            <body>
                <div class="editor-container">
                    <div id="line-numbers" class="line-numbers">1</div>
                    <div class="textarea-wrapper">
                        <pre id="highlight-layer"></pre>
                        <textarea id="editor" spellcheck="false" wrap="off">${this.escapeHtml(content)}</textarea>
                    </div>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    const editor = document.getElementById('editor');
                    const hlLayer = document.getElementById('highlight-layer');
                    const lineNumbers = document.getElementById('line-numbers');

                    function updateHighlight() {
                        const text = editor.value;
                        
                        // Simple YAML Highlighting via Regex
                        let html = text
                            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                            // Keys: "Key: "
                            .replace(/^(\\s*)([^:\\n]+)(:)/gm, '$1<span class="hl-key">$2</span>$3')
                            // Strings: 'val' or "val"
                            .replace(/(['"])(?:(?=(\\\\?))\\2.)*?\\1/g, '<span class="hl-string">$&</span>')
                            // Numbers
                            .replace(/\\b\\d+(\\.\\d+)?\\b/g, '<span class="hl-number">$&</span>')
                            // Booleans
                            .replace(/\\b(true|false|null)\\b/g, '<span class="hl-bool">$&</span>')
                            // Comments
                            .replace(/#.*$/gm, '<span class="hl-comment">$&</span>');

                        hlLayer.innerHTML = html + (text.endsWith('\\n') ? '\\n' : '');
                        
                        // Update Line Numbers
                        const lines = text.split('\\n').length;
                        lineNumbers.innerHTML = Array.from({length: lines}, (_, i) => i + 1).join('<br>');
                    }

                    function syncScroll() {
                        hlLayer.scrollTop = editor.scrollTop;
                        hlLayer.scrollLeft = editor.scrollLeft;
                        lineNumbers.scrollTop = editor.scrollTop;
                    }

                    editor.addEventListener('input', updateHighlight);
                    editor.addEventListener('scroll', syncScroll);

                    window.addEventListener('keydown', e => {
                        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                            e.preventDefault();
                            vscode.postMessage({ type: 'save', content: editor.value });
                        }
                        if (e.key === 'Tab') {
                            e.preventDefault();
                            const start = editor.selectionStart;
                            const end = editor.selectionEnd;
                            editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
                            editor.selectionStart = editor.selectionEnd = start + 2;
                            updateHighlight();
                        }
                    });

                    // Initial call
                    updateHighlight();
                </script>
            </body>
            </html>
        `;
    }

    private escapeHtml(html: string): string {
        return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<BymlDocument>>();
    public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    public saveCustomDocument() { return Promise.resolve(); }
    public saveCustomDocumentAs() { return Promise.resolve(); }
    public revertCustomDocument() { return Promise.resolve(); }
    public backupCustomDocument(document: BymlDocument) {
        return Promise.resolve({ id: document.uri.toString(), delete: () => { } });
    }
}
