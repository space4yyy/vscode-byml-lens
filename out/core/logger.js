"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    static channel;
    /**
     * In VS Code, we call this with the output channel.
     * In CLI, we don't call it, and it defaults to console logging.
     */
    static setChannel(channel) {
        this.channel = channel;
        this.info("BYML Lens Logger Initialized.");
    }
    static init() {
        // No-op by default, extension will call setChannel
    }
    static get currentLevel() {
        return LogLevel.INFO;
    }
    static debug(message, data) {
        if (this.currentLevel <= LogLevel.DEBUG)
            this.write("DEBUG", message, data);
    }
    static info(message, data) {
        if (this.currentLevel <= LogLevel.INFO)
            this.write("INFO", message, data);
    }
    static warn(message, data) {
        if (this.currentLevel <= LogLevel.WARN)
            this.write("WARN", message, data);
    }
    static error(message, error) {
        const timestamp = new Date().toLocaleTimeString();
        const header = `[${timestamp}] ❌ ERROR: ${message}`;
        const stack = error?.stack || error || "";
        if (this.channel) {
            this.channel.appendLine(header);
            if (stack)
                this.channel.appendLine(`   Stack: ${stack}`);
            this.channel.show(true);
        }
        else {
            console.error(header);
            if (stack)
                console.error(stack);
        }
    }
    static write(label, message, data) {
        const timestamp = new Date().toLocaleTimeString();
        let logMsg = `[${timestamp}] [${label}] ${message}`;
        if (data) {
            logMsg += ` | Data: ${JSON.stringify(data)}`;
        }
        if (this.channel) {
            this.channel.appendLine(logMsg);
        }
        else {
            console.log(logMsg);
        }
    }
    static show() {
        if (this.channel)
            this.channel.show(true);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map