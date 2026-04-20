import * as fs from 'fs';
import * as zstd from './out/core/zstd.js';

async function dump() {
    const data = zstd.decompressData(fs.readFileSync('src/files/Vss_Yunohana.pack.zs'));
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    
    const dataStart = view.getUint32(0x0C, true);
    const sfatCount = view.getUint16(0x14 + 0x06, true);
    const sfatNodes = 0x14 + 0x0C;
    const sfntStart = sfatNodes + sfatCount * 16;
    const stringTable = sfntStart + 8;
    
    console.log('Data Start:', dataStart.toString(16));
    console.log('SFAT Count:', sfatCount);
    console.log('SFNT Start:', sfntStart.toString(16));
    
    for (let i = 0; i < sfatCount; i++) {
        const off = sfatNodes + i * 16;
        const h = view.getUint32(off, true);
        const n = view.getUint32(off + 4, true);
        const s = view.getUint32(off + 8, true);
        const e = view.getUint32(off + 12, true);
        
        // Try to get name
        const nameOff = (n & 0x00FFFFFF) * 4;
        let name = '';
        let p = stringTable + nameOff;
        while (data[p] !== 0 && p < data.length) {
            name += String.fromCharCode(data[p]);
            p++;
        }
        
        console.log(`Node ${i}: Hash=${h.toString(16)}, NamePtr=${n.toString(16)} (Off=${nameOff.toString(16)}), Start=${s.toString(16)}, End=${e.toString(16)}, Name=${name}`);
    }
}
dump();
