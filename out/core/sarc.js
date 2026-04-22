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
    bom = 0xFEFF;
    constructor(data) {
        if (!data)
            return;
        try {
            this.isCompressed = zstd.isCompressed(data);
            const d = this.isCompressed ? zstd.decompressData(data) : data;
            const view = new DataView(d.buffer, d.byteOffset, d.byteLength);
            const magic = String.fromCharCode(d[0], d[1], d[2], d[3]);
            if (magic !== 'SARC')
                throw new Error(`Invalid magic: ${magic}`);
            const headerSize = view.getUint16(4, true);
            this.bom = view.getUint16(6, true);
            this.le = (this.bom === 0xFEFF);
            const dataStart = view.getUint32(0x0C, this.le);
            let pos = headerSize;
            const sfatCount = view.getUint16(pos + 6, this.le);
            const sfatNodesPos = pos + 0x0C;
            const stringTablePos = sfatNodesPos + sfatCount * 16 + 8;
            for (let i = 0; i < sfatCount; i++) {
                const nodeOff = sfatNodesPos + i * 16;
                const nameAttr = view.getUint32(nodeOff + 4, this.le);
                const nameOffset = (nameAttr & 0x00FFFFFF) * 4;
                const fileStart = view.getUint32(nodeOff + 8, this.le);
                const fileEnd = view.getUint32(nodeOff + 12, this.le);
                let name = '';
                let nPos = stringTablePos + nameOffset;
                while (nPos < d.length && d[nPos] !== 0) {
                    name += String.fromCharCode(d[nPos]);
                    nPos++;
                }
                const fileData = d.slice(dataStart + fileStart, dataStart + fileEnd);
                this.files.push({ name, data: fileData });
            }
        }
        catch (err) {
            logger_js_1.Logger.error(`SARC Parsing Error`, err);
            throw err;
        }
    }
    static hash(name) {
        let h = 0;
        for (let i = 0; i < name.length; i++) {
            h = (h * 0x65 + name.charCodeAt(i)) >>> 0;
        }
        return h;
    }
    encode() {
        logger_js_1.Logger.info(`Encoding SARC with ${this.files.length} files...`);
        const sortedFiles = [...this.files].sort((a, b) => SarcArchive.hash(a.name) - SarcArchive.hash(b.name));
        let stringTableSize = 0;
        const nameOffsets = sortedFiles.map(f => {
            const off = stringTableSize;
            stringTableSize += f.name.length + 1;
            while (stringTableSize % 4 !== 0)
                stringTableSize++;
            return off;
        });
        const sfatSize = 0x0C + sortedFiles.length * 16;
        const sfntSize = 0x08 + stringTableSize;
        const headerSize = 0x14;
        let dataStart = headerSize + sfatSize + sfntSize;
        while (dataStart % 256 !== 0)
            dataStart++;
        let totalSize = dataStart;
        const fileOffsets = sortedFiles.map(f => {
            // CRITICAL FIX: Every file entry must be 256-byte aligned for some games/emulators
            while (totalSize % 256 !== 0)
                totalSize++;
            const start = totalSize - dataStart;
            totalSize += f.data.length;
            return { start, end: totalSize - dataStart };
        });
        const out = new Uint8Array(totalSize);
        const view = new DataView(out.buffer);
        out.set([0x53, 0x41, 0x52, 0x43], 0);
        view.setUint16(4, headerSize, true);
        view.setUint16(6, this.le ? 0xFEFF : 0xFFFE, true);
        view.setUint32(8, totalSize, this.le);
        view.setUint32(0x0C, dataStart, this.le);
        view.setUint32(0x10, 0x00000100, this.le);
        let pos = headerSize;
        out.set([0x53, 0x46, 0x41, 0x54], pos);
        view.setUint16(pos + 4, 0x0C, this.le);
        view.setUint16(pos + 6, sortedFiles.length, this.le);
        view.setUint32(pos + 8, 0x00000065, this.le);
        pos += 0x0C;
        for (let i = 0; i < sortedFiles.length; i++) {
            const f = sortedFiles[i];
            view.setUint32(pos, SarcArchive.hash(f.name), this.le);
            view.setUint32(pos + 4, (0x01000000 | (nameOffsets[i] / 4)), this.le);
            view.setUint32(pos + 8, fileOffsets[i].start, this.le);
            view.setUint32(pos + 12, fileOffsets[i].end, this.le);
            pos += 16;
        }
        out.set([0x53, 0x46, 0x4e, 0x54], pos);
        view.setUint16(pos + 4, 0x08, this.le);
        pos += 8;
        for (let i = 0; i < sortedFiles.length; i++) {
            const nameBytes = new TextEncoder().encode(sortedFiles[i].name);
            out.set(nameBytes, pos + nameOffsets[i]);
        }
        for (let i = 0; i < sortedFiles.length; i++) {
            out.set(sortedFiles[i].data, dataStart + fileOffsets[i].start);
        }
        if (this.isCompressed)
            return zstd.compressData(out);
        return out;
    }
}
exports.SarcArchive = SarcArchive;
//# sourceMappingURL=sarc.js.map