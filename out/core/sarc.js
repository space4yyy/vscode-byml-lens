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
exports.SarcArchive = void 0;
const SarcFile_js_1 = require("@themezernx/sarclib/dist/SarcFile.js");
const zstd = __importStar(require("./zstd.js"));
class SarcArchive {
    files = [];
    isCompressed = false;
    isLittleEndian = true;
    constructor(data) {
        if (data) {
            this.isCompressed = zstd.isCompressed(data);
            const decompressed = this.isCompressed ? zstd.decompressData(data) : data;
            const sarc = new SarcFile_js_1.SarcFile();
            sarc.load(Buffer.from(decompressed));
            this.isLittleEndian = sarc.getIsLittleEndian();
            this.files = sarc.getFiles().map(f => ({
                name: f.name,
                data: new Uint8Array(f.data)
            }));
        }
    }
    encode() {
        const sarc = new SarcFile_js_1.SarcFile(this.isLittleEndian);
        for (const file of this.files) {
            sarc.addRawFile(Buffer.from(file.data), file.name);
        }
        const encoded = new Uint8Array(sarc.save(0)); // 0 for no Yaz0 compression
        if (this.isCompressed) {
            return zstd.compressData(encoded);
        }
        return encoded;
    }
}
exports.SarcArchive = SarcArchive;
//# sourceMappingURL=sarc.js.map