import * as zstd from './zstd.js';
import { Logger } from './logger.js';

export class SarcArchive {
    public files: { name: string, data: Uint8Array }[] = [];
    public isCompressed: boolean = false;
    public le: boolean = true;
    public bom: number = 0xFEFF;

    constructor(data?: Uint8Array) {
        if (!data) return;

        try {
            this.isCompressed = zstd.isCompressed(data);
            const d = this.isCompressed ? zstd.decompressData(data) : data;
            const view = new DataView(d.buffer, d.byteOffset, d.byteLength);

            const magic = String.fromCharCode(d[0], d[1], d[2], d[3]);
            if (magic !== 'SARC') throw new Error(`Invalid magic: ${magic}`);

            // Detect Endianness from BOM at offset 6
            const bom = view.getUint16(6, false); // Read as big-endian first
            if (bom === 0xFEFF) this.le = false;
            else if (bom === 0xFFFE) this.le = true;
            else this.le = true; // Default to LE

            const headerSize = view.getUint16(4, this.le);
            const dataStart = view.getUint32(0x0C, this.le);
            
            const sfatMagic = String.fromCharCode(d[headerSize], d[headerSize+1], d[headerSize+2], d[headerSize+3]);
            if (sfatMagic !== 'SFAT') throw new Error(`Invalid SFAT magic: ${sfatMagic}`);

            const sfatCount = view.getUint16(headerSize + 6, this.le);
            const sfatNodesPos = headerSize + 0x0C;
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
        } catch (err: any) {
            Logger.error(`SARC Parsing Error`, err);
            throw err;
        }
    }

    public static hash(name: string): number {
        let h = 0;
        for (let i = 0; i < name.length; i++) {
            h = (Math.imul(h, 0x65) + name.charCodeAt(i)) >>> 0;
        }
        return h;
    }
public encode(originalDataStart?: number): Uint8Array {
    Logger.info(`Encoding SARC with ${this.files.length} files...`);

    const sortedFiles = [...this.files].sort((a, b) => {
        const ha = SarcArchive.hash(a.name);
        const hb = SarcArchive.hash(b.name);
        return ha - hb;
    });

    let stringTableSize = 0;
    const nameOffsets = sortedFiles.map(f => {
        const off = stringTableSize;
        const bytes = new TextEncoder().encode(f.name);
        stringTableSize += bytes.length + 1;
        while (stringTableSize % 4 !== 0) stringTableSize++;
        return off;
    });

    const sfatSize = 0x0C + sortedFiles.length * 16;
    const sfntSize = 0x08 + stringTableSize;
    const headerSize = 0x14;

    let dataStart = originalDataStart || (headerSize + sfatSize + sfntSize);
    // Ensure dataStart is at least big enough
    if (dataStart < headerSize + sfatSize + sfntSize) dataStart = headerSize + sfatSize + sfntSize;
    while (dataStart % 4 !== 0) dataStart++; 

    let totalSize = dataStart;
    const fileOffsets = sortedFiles.map((f, i) => {
        // Splatoon 3 and other modern games use 256-byte alignment for performance/mmap.
        // We apply it to all files for maximum compatibility.
        while (totalSize % 256 !== 0) totalSize++; 
        const start = totalSize - dataStart;
        totalSize += f.data.length;
        const end = totalSize - dataStart;
        return { start, end };
    });

        while (totalSize % 0x2000 !== 0) totalSize++;

        const out = new Uint8Array(totalSize);
        const view = new DataView(out.buffer);

        out.set([0x53, 0x41, 0x52, 0x43], 0);
        view.setUint16(4, headerSize, this.le);
        view.setUint16(6, this.le ? 0xFFFE : 0xFEFF, false); // BOM is always written as a magic constant
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

        if (this.isCompressed) return zstd.compressData(out);
        return out;
    }
}
