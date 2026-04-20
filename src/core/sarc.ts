import * as zstd from './zstd.js';
import { Logger } from './logger.js';

export class SarcArchive {
    public files: { name: string, data: Uint8Array }[] = [];
    public isCompressed: boolean = false;
    public le: boolean = true;

    constructor(data?: Uint8Array) {
        if (!data) return;

        try {
            this.isCompressed = zstd.isCompressed(data);
            const d = this.isCompressed ? zstd.decompressData(data) : data;
            const view = new DataView(d.buffer, d.byteOffset, d.byteLength);

            // 1. SARC Header
            const magic = String.fromCharCode(d[0], d[1], d[2], d[3]);
            if (magic !== 'SARC') throw new Error(`Invalid magic: ${magic}`);

            const headerSize = view.getUint16(4, true);
            const bom = view.getUint16(6, true);
            
            // BOM: 0xFFFE in LE read means FE FF on disk (Big Endian)
            // BOM: 0xFEFF in LE read means FF FE on disk (Little Endian)
            this.le = (bom === 0xFEFF);
            Logger.log(`SARC BOM: ${bom.toString(16)}, LE: ${this.le}`);

            const dataStart = view.getUint32(0x0C, this.le);
            Logger.log(`SARC Data Start: 0x${dataStart.toString(16)}`);

            // 2. SFAT Header
            let pos = headerSize;
            const sfatMagic = String.fromCharCode(d[pos], d[pos+1], d[pos+2], d[pos+3]);
            if (sfatMagic !== 'SFAT') throw new Error('Missing SFAT header');

            const nodeCount = view.getUint16(pos + 6, this.le);
            Logger.log(`SARC File Count: ${nodeCount}`);
            const sfatNodesPos = pos + 0x0C;

            // 3. SFNT Header (after SFAT nodes)
            const sfntPos = sfatNodesPos + nodeCount * 16;
            const sfntMagic = String.fromCharCode(d[sfntPos], d[sfntPos+1], d[sfntPos+2], d[sfntPos+3]);
            if (sfntMagic !== 'SFNT') throw new Error('Missing SFNT header');

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
            Logger.log(`Successfully parsed ${this.files.length} files from SARC.`);
        } catch (err: any) {
            Logger.error(`SARC Parsing Error`, err);
            throw err;
        }
    }

    public encode(): Uint8Array {
        throw new Error('SARC Encoding is not yet implemented.');
    }
}
