import * as vscode from 'vscode';

export class Logger {
    private static channel: vscode.OutputChannel;

    public static init() {
        this.channel = vscode.window.createOutputChannel("BYML Inspector");
        this.log("Logger initialized. Ready to debug.");
    }

    public static log(message: string, data?: any) {
        const timestamp = new Date().toLocaleTimeString();
        let logMsg = `[${timestamp}] ${message}`;
        if (data) {
            logMsg += ` | Data: ${JSON.stringify(data)}`;
        }
        this.channel.appendLine(logMsg);
    }

    public static error(message: string, error?: any) {
        const timestamp = new Date().toLocaleTimeString();
        this.channel.appendLine(`[${timestamp}] ❌ ERROR: ${message}`);
        if (error) {
            this.channel.appendLine(`   Stack: ${error.stack || error}`);
        }
        this.channel.show(true); // Pop up on error
    }

    public static show() {
        this.channel.show(true);
    }
}
