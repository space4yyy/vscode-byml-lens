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
const zstd = __importStar(require("./zstd.js"));
const logger_js_1 = require("./logger.js");
class SarcArchive {
    files = [];
    isCompressed = false;
    le = true;
    constructor(data) {
        if (!data)
            return;
        try {
            this.isCompressed = zstd.isCompressed(data);
            const d = this.isCompressed ? zstd.decompressData(data) : data;
            const view = new DataView(d.buffer, d.byteOffset, d.byteLength);
            // 1. SARC Header
            const magic = String.fromCharCode(d[0], d[1], d[2], d[3]);
            if (magic !== 'SARC')
                throw new Error(`Invalid magic: ${magic}`);
            const headerSize = view.getUint16(4, true);
            const bom = view.getUint16(6, true);
            // BOM: 0xFFFE in LE read means FE FF on disk (Big Endian)
            // BOM: 0xFEFF in LE read means FF FE on disk (Little Endian)
            this.le = (bom === 0xFEFF);
            logger_js_1.Logger.log(`SARC BOM: ${bom.toString(16)}, LE: ${this.le}`);
            const dataStart = view.getUint32(0x0C, this.le);
            logger_js_1.Logger.log(`SARC Data Start: 0x${dataStart.toString(16)}`);
            // 2. SFAT Header
            let pos = headerSize;
            const sfatMagic = String.fromCharCode(d[pos], d[pos + 1], d[pos + 2], d[pos + 3]);
            if (sfatMagic !== 'SFAT')
                throw new Error('Missing SFAT header');
            const nodeCount = view.getUint16(pos + 6, this.le);
            logger_js_1.Logger.log(`SARC File Count: ${nodeCount}`);
            const sfatNodesPos = pos + 0x0C;
            // 3. SFNT Header (after SFAT nodes)
            const sfntPos = sfatNodesPos + nodeCount * 16;
            const sfntMagic = String.fromCharCode(d[sfntPos], d[sfntPos + 1], d[sfntPos + 2], d[sfntPos + 3]);
            if (sfntMagic !== 'SFNT')
                throw new Error('Missing SFNT header');
            const stringTablePos = sfntPos + 8;
            // 4. Parse Nodes
            for (let i = 0; i < nodeCount; i++) {
                const nodeOff = sfatNodesPos + i * 16;
                const nameAttr = view.getUint32(nodeOff + 4, this.le);
                // Bit 24-31 are often flags/type, 0-23 is offset/4
                const nameOffset = (nameAttr & 0x00FFFFFF) * 4;
                const fileStart = view.getUint32(nodeOff + 8, this.le);
                const fileEnd = view.getUint32(nodeOff + 12, this.le);
                // Get Name
                let name = '';
                let nPos = stringTablePos + nameOffset;
                while (nPos < d.length && d[nPos] !== 0) {
                    name += String.fromCharCode(d[nPos]);
                    nPos++;
                }
                // Get Data
                const fileData = d.slice(dataStart + fileStart, dataStart + fileEnd);
                this.files.push({ name, data: fileData });
            }
            logger_js_1.Logger.log(`Successfully parsed ${this.files.length} files from SARC.`);
        }
        catch (err) {
            logger_js_1.Logger.error(`SARC Parsing Error`, err);
            throw err;
        }
    }
    encode() {
        throw new Error('SARC Encoding is not yet implemented.');
    }
}
exports.SarcArchive = SarcArchive;
//# sourceMappingURL=sarc.js.map