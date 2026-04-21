import * as vscode from 'vscode';
import * as byml from '../core/byml.js';
import { SarcArchive } from '../core/sarc.js';
import * as path from 'path';

/**
 * Custom Text Search Provider for SARC and BYML.
 * We use 'any' for VS Code internal types to bypass the strict compiler checks 
 * that caused issues in previous turns, ensuring compatibility with Antigravity.
 */
export class BymlSearchProvider {
    public async provideTextSearchResults(
        query: any,
        options: any,
        progress: vscode.Progress<any>,
        token: vscode.CancellationToken
    ): Promise<any> {
        const pattern = new RegExp(query.pattern, query.isCaseSensitive ? '' : 'i');

        // Search through all workspace folders that use our 'sarc' scheme
        const folders = vscode.workspace.workspaceFolders || [];
        for (const folder of folders) {
            if (token.isCancellationRequested) break;
            if (folder.uri.scheme !== 'sarc') continue;

            try {
                // Extract original archive path from sarc URI (sarc:///path/to/pack.zs)
                const archivePath = folder.uri.path;
                const data = await vscode.workspace.fs.readFile(vscode.Uri.file(archivePath));
                const archive = new SarcArchive(new Uint8Array(data));

                for (const file of archive.files) {
                    if (token.isCancellationRequested) break;
                    
                    const ext = path.extname(file.name).toLowerCase();
                    if (ext === '.byml' || ext === '.bgyml') {
                        const yamlStr = byml.bymlToYaml(file.data);
                        const lines = yamlStr.split('\n');
                        const fileUri = vscode.Uri.parse(`sarc://${archivePath}/${file.name}`);

                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            const match = line.match(pattern);
                            if (match) {
                                progress.report({
                                    uri: fileUri,
                                    ranges: [new vscode.Range(i, match.index!, i, match.index! + match[0].length)],
                                    preview: {
                                        text: line,
                                        matches: [new vscode.Range(0, match.index!, 0, match.index! + match[0].length)]
                                    }
                                });
                            }
                        }
                    }
                }
            } catch (e) {
                // Skip unparseable archives
            }
        }

        return { limitHit: false };
    }
}
