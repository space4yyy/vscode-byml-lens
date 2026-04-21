import * as vscode from 'vscode';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export class Logger {
    private static channel: vscode.OutputChannel;

    public static init() {
        this.channel = vscode.window.createOutputChannel("BYML Lens");
        this.info("BYML Lens Logger Initialized.");
    }

    private static get currentLevel(): LogLevel {
        const config = vscode.workspace.getConfiguration('byml-lens');
        return config.get<boolean>('debug', false) ? LogLevel.DEBUG : LogLevel.INFO;
    }

    public static debug(message: string, data?: any) {
        if (this.currentLevel <= LogLevel.DEBUG) this.write("DEBUG", message, data);
    }

    public static info(message: string, data?: any) {
        if (this.currentLevel <= LogLevel.INFO) this.write("INFO", message, data);
    }

    public static warn(message: string, data?: any) {
        if (this.currentLevel <= LogLevel.WARN) this.write("WARN", message, data);
    }

    public static error(message: string, error?: any) {
        const timestamp = new Date().toLocaleTimeString();
        this.channel.appendLine(`[${timestamp}] ❌ ERROR: ${message}`);
        if (error) {
            this.channel.appendLine(`   Stack: ${error.stack || error}`);
        }
        // Force show output on error to help users realize something went wrong
        this.channel.show(true);
    }

    private static write(label: string, message: string, data?: any) {
        const timestamp = new Date().toLocaleTimeString();
        let logMsg = `[${timestamp}] [${label}] ${message}`;
        if (data) {
            logMsg += ` | Data: ${JSON.stringify(data)}`;
        }
        this.channel.appendLine(logMsg);
    }

    public static show() {
        this.channel.show(true);
    }
}
