import { SarcFile } from '@themezernx/sarclib/dist/SarcFile.js';
import * as zstd from './zstd.js';

export class SarcArchive {
    public files: { name: string, data: Uint8Array }[] = [];
    public isCompressed: boolean = false;
    public isLittleEndian: boolean = true;

    constructor(data?: Uint8Array) {
        if (data) {
            this.isCompressed = zstd.isCompressed(data);
            const decompressed = this.isCompressed ? zstd.decompressData(data) : data;
            
            const sarc = new SarcFile();
            sarc.load(Buffer.from(decompressed));
            this.isLittleEndian = sarc.getIsLittleEndian();
            this.files = sarc.getFiles().map(f => ({
                name: f.name,
                data: new Uint8Array(f.data)
            }));
        }
    }

    public encode(): Uint8Array {
        const sarc = new SarcFile(this.isLittleEndian);
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
