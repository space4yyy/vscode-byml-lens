"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
const vscode = __importStar(require("vscode"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    static channel;
    static init() {
        this.channel = vscode.window.createOutputChannel("BYML Lens");
        this.info("BYML Lens Logger Initialized.");
    }
    static get currentLevel() {
        const config = vscode.workspace.getConfiguration('byml-lens');
        return config.get('debug', false) ? LogLevel.DEBUG : LogLevel.INFO;
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
        this.channel.appendLine(`[${timestamp}] ❌ ERROR: ${message}`);
        if (error) {
            this.channel.appendLine(`   Stack: ${error.stack || error}`);
        }
        // Force show output on error to help users realize something went wrong
        this.channel.show(true);
    }
    static write(label, message, data) {
        const timestamp = new Date().toLocaleTimeString();
        let logMsg = `[${timestamp}] [${label}] ${message}`;
        if (data) {
            logMsg += ` | Data: ${JSON.stringify(data)}`;
        }
        this.channel.appendLine(logMsg);
    }
    static show() {
        this.channel.show(true);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map