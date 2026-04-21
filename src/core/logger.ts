
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export class Logger {
    private static channel: any | undefined;

    /**
     * In VS Code, we call this with the output channel.
     * In CLI, we don't call it, and it defaults to console logging.
     */
    public static setChannel(channel: any) {
        this.channel = channel;
        this.info("BYML Lens Logger Initialized.");
    }

    public static init() {
        // No-op by default, extension will call setChannel
    }

    private static get currentLevel(): LogLevel {
        return LogLevel.INFO;
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
        const header = `[${timestamp}] ❌ ERROR: ${message}`;
        const stack = error?.stack || error || "";
        
        if (this.channel) {
            this.channel.appendLine(header);
            if (stack) this.channel.appendLine(`   Stack: ${stack}`);
            this.channel.show(true);
        } else {
            console.error(header);
            if (stack) console.error(stack);
        }
    }

    private static write(label: string, message: string, data?: any) {
        const timestamp = new Date().toLocaleTimeString();
        let logMsg = `[${timestamp}] [${label}] ${message}`;
        if (data) {
            logMsg += ` | Data: ${JSON.stringify(data)}`;
        }

        if (this.channel) {
            this.channel.appendLine(logMsg);
        } else {
            console.log(logMsg);
        }
    }

    public static show() {
        if (this.channel) this.channel.show(true);
    }
}
