import * as assert from 'assert';
import { SarcArchive } from '../../core/sarc.js';

describe('SarcArchive Unit Tests', () => {
    it('should align files to 256 bytes', () => {
        const archive = new SarcArchive();
        archive.files.push({ name: 'test1.txt', data: new Uint8Array([1, 2, 3]) });
        archive.files.push({ name: 'test2.txt', data: new Uint8Array([4, 5, 6]) });
        
        const encoded = archive.encode();
        const decoded = new SarcArchive(encoded);
        
        assert.strictEqual(decoded.files.length, 2);
        
        // We need to check the raw offsets in the encoded buffer
        const view = new DataView(encoded.buffer);
        const dataStart = view.getUint32(0x0C, true);
        const sfatCount = view.getUint16(0x14 + 6, true);
        
        for (let i = 0; i < sfatCount; i++) {
            const nodeOff = 0x14 + 0x0C + i * 16;
            const fileStart = view.getUint32(nodeOff + 8, true);
            // Every file start offset (relative to dataStart) + dataStart should be 256-byte aligned
            // Wait, the logic in sarc.ts is:
            // while (totalSize % 256 !== 0) totalSize++; 
            // const start = totalSize - dataStart;
            // So (start + dataStart) % 256 should be 0.
            assert.strictEqual((fileStart + dataStart) % 256, 0, `File ${i} is not 256-byte aligned at ${fileStart + dataStart}`);
        }
    });
});
