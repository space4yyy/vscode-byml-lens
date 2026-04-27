import * as zstd from './zstd.js';
import * as yaml from 'js-yaml';

class Writer {
    public buffer: Uint8Array;
    public view: DataView;
    public offset: number = 0;
    public le: boolean = true;

    constructor(size: number = 10 * 1024 * 1024) {
        this.buffer = new Uint8Array(size);
        this.view = new DataView(this.buffer.buffer);
    }

    writeUInt8(v: number) { this.view.setUint8(this.offset++, v); }
    writeUInt16(v: number) { this.view.setUint16(this.offset, v, this.le); this.offset += 2; }
    writeUInt32(v: number) { this.view.setUint32(this.offset, v, this.le); this.offset += 4; }
    writeFloat32(v: number) { this.view.setFloat32(this.offset, v, this.le); this.offset += 4; }
    writeFloat64(v: number) { this.view.setFloat64(this.offset, v, this.le); this.offset += 8; }
    writeBigInt64(v: bigint) { this.view.setBigInt64(this.offset, v, this.le); this.offset += 8; }
    writeBigUint64(v: bigint) { this.view.setBigUint64(this.offset, v, this.le); this.offset += 8; }
    
    writeUInt24(v: number) {
        if (this.le) {
            this.writeUInt8(v & 0xFF); this.writeUInt8((v >> 8) & 0xFF); this.writeUInt8((v >> 16) & 0xFF);
        } else {
            this.writeUInt8((v >> 16) & 0xFF); this.writeUInt8((v >> 8) & 0xFF); this.writeUInt8(v & 0xFF);
        }
    }

    writeString(s: string) {
        const encoded = new TextEncoder().encode(s);
        for (const b of encoded) this.writeUInt8(b);
        this.writeUInt8(0);
    }

    align(n: number) { while (this.offset % n !== 0) this.writeUInt8(0); }
    seek(offset: number) { this.offset = offset; }
    tell() { return this.offset; }
    getBytes() { return this.buffer.slice(0, this.offset); }
}

export function yamlToByml(yamlStr: string, originalData?: Uint8Array): Uint8Array {
    const obj = yaml.load(yamlStr);
    const writer = new Writer();
    let le = true;
    let version = 3;
    const typeMap = new Map<string, number>();

    if (originalData) {
        const decompressed = zstd.isCompressed(originalData) ? zstd.decompressData(originalData) : originalData;
        if (decompressed[0] === 0x42 && decompressed[1] === 0x59) le = false;
        if (le) version = (decompressed[3] << 8) | decompressed[2];
        else version = (decompressed[2] << 8) | decompressed[3];
        const r = new Reader(decompressed); r.le = le;
        const oKeys = r.readStringTable(r.readUInt32At(4));
        const oRootOff = r.readUInt32At(12);
        function crawl(offset: number, path: string) {
            const type = decompressed[offset]; typeMap.set(path, type);
            if (type === 0xC1) {
                const cr = new Reader(decompressed); cr.le = le; cr.seek(offset + 1);
                const count = cr.readUInt24();
                cr.seek(offset + 4);
                for(let i=0; i<count; i++) {
                    const kidx = cr.readUInt24(); const nt = cr.readUInt8(); const val = cr.readUInt32();
                    const k = oKeys[kidx]; typeMap.set(path + '/' + k, nt);
                    if (nt === 0xC0 || nt === 0xC1) crawl(val, path + '/' + k);
                }
            } else if (type === 0xC0) {
                const cr = new Reader(decompressed); cr.le = le; cr.seek(offset + 1);
                const count = cr.readUInt24();
                cr.seek(offset + 4);
                const types = []; for(let i=0; i<count; i++) types.push(cr.readUInt8());
                cr.align(4);
                for(let i=0; i<count; i++) {
                    const nt = types[i]; const val = cr.readUInt32(); typeMap.set(path + '[' + i + ']', nt);
                    if (nt === 0xC0 || nt === 0xC1) crawl(val, path + '[' + i + ']');
                }
            }
        }
        try { crawl(oRootOff, ''); } catch(e) {}
    }
    writer.le = le;

    const keys = new Set<string>();
    const strings = new Set<string>();
    const extraData = new Writer(); extraData.le = le;
    const patchLocations: { pos: number, extraOffset: number }[] = [];

    function collect(node: any) {
        if (typeof node === 'string') strings.add(node);
        else if (Array.isArray(node)) node.forEach(collect);
        else if (node && typeof node === 'object') {
            Object.keys(node).forEach(k => { keys.add(k); collect(node[k]); });
        }
    }
    collect(obj);
    const sortedKeys = Array.from(keys).sort();
    const sortedStrings = Array.from(strings).sort();
    
    writer.writeUInt8(le ? 0x59 : 0x42); writer.writeUInt8(le ? 0x42 : 0x59);
    writer.writeUInt16(version);
    const ktPos = writer.tell(); writer.writeUInt32(0);
    const stPos = writer.tell(); writer.writeUInt32(0);
    const rtPos = writer.tell(); writer.writeUInt32(0);
    
    const keyTableOffset = writer.tell(); writer.view.setUint32(ktPos, keyTableOffset, le);
    writeStringTable(writer, sortedKeys); writer.align(4);
    const stringTableOffset = writer.tell(); writer.view.setUint32(stPos, stringTableOffset, le);
    writeStringTable(writer, sortedStrings);
    
    const nodeOffsets = new Map<string, number>();
    const pendingNodes: { parentPos: number, node: any, path: string }[] = [];

    function writeStringTable(w: Writer, arr: string[]) {
        const start = w.tell(); w.writeUInt8(0xC2); w.writeUInt24(arr.length);
        const otPos = w.tell(); for (let i = 0; i < arr.length + 1; i++) w.writeUInt32(0);
        const offsets = [];
        for (let i = 0; i < arr.length; i++) { offsets.push(w.tell() - start); w.writeString(arr[i]); }
        offsets.push(w.tell() - start);
        const end = w.tell(); w.seek(otPos); for (const o of offsets) w.writeUInt32(o); w.seek(end);
    }

    function getNodeType(v: any, path: string): number {
        if (typeMap.has(path)) return typeMap.get(path)!;
        if (typeof v === 'string') return 0xA0;
        if (typeof v === 'number') {
            if (Number.isInteger(v)) {
                if (v < -2147483648 || v > 2147483647) return 0xD5;
                return 0xD1;
            }
            // Smart float/double detection
            if (Math.fround(v) === v) return 0xD2; 
            return 0xD3;
        }
        if (typeof v === 'boolean') return 0xD0;
        if (Array.isArray(v)) return 0xC0;
        if (v && typeof v === 'object') return 0xC1;
        return 0xFF;
    }

    function writeNode(node: any, path: string): number {
        // Normalize node for deduplication (sort keys for objects)
        const type = getNodeType(node, path);
        let normalized = node;
        if (node && typeof node === 'object' && !Array.isArray(node)) {
            const sortedObj: any = {};
            Object.keys(node).sort().forEach(k => {
                sortedObj[k] = node[k];
            });
            normalized = sortedObj;
        }
        const nodeKey = type.toString(16) + ":" + JSON.stringify(normalized);
        if (nodeOffsets.has(nodeKey)) return nodeOffsets.get(nodeKey)!;
        
        writer.align(4); const offset = writer.tell(); nodeOffsets.set(nodeKey, offset);
        
        if (Array.isArray(node)) {
            writer.writeUInt8(0xC0); writer.writeUInt24(node.length);
            for (let i=0; i<node.length; i++) writer.writeUInt8(getNodeType(node[i], path + '[' + i + ']'));
            writer.align(4); const valPos = writer.tell(); for (let i = 0; i < node.length; i++) writer.writeUInt32(0);
            for (let i = 0; i < node.length; i++) {
                const p = path + '[' + i + ']', nt = getNodeType(node[i], p);
                if (nt === 0xC0 || nt === 0xC1) pendingNodes.push({ parentPos: valPos + i * 4, node: node[i], path: p });
                else {
                    const saved = writer.tell(); writer.seek(valPos + i * 4);
                    writer.writeUInt32(encodeValue(nt, node[i], valPos + i * 4)); writer.seek(saved);
                }
            }
        } else {
            const entries = Object.entries(node).sort((a, b) => sortedKeys.indexOf(a[0]) - sortedKeys.indexOf(b[0]));
            writer.writeUInt8(0xC1); writer.writeUInt24(entries.length);
            const entryPos = writer.tell();
            for (const [k, v] of entries) { writer.writeUInt24(sortedKeys.indexOf(k)); writer.writeUInt8(getNodeType(v, path + '/' + k)); writer.writeUInt32(0); }
            for (let i = 0; i < entries.length; i++) {
                const p = path + '/' + entries[i][0], nt = getNodeType(entries[i][1], p);
                if (nt === 0xC0 || nt === 0xC1) pendingNodes.push({ parentPos: entryPos + i * 8 + 4, node: entries[i][1], path: p });
                else {
                    const saved = writer.tell(); writer.seek(entryPos + i * 8 + 4);
                    writer.writeUInt32(encodeValue(nt, entries[i][1], entryPos + i * 8 + 4)); writer.seek(saved);
                }
            }
        }
        return offset;
    }

    function encodeValue(type: number, v: any, pos: number): number {
        switch (type) {
            case 0xA0: return sortedStrings.indexOf(v);
            case 0xD1: return v | 0;
            case 0xD4: return v >>> 0;
            case 0xD2: { const b = new ArrayBuffer(4); const vi = new DataView(b); vi.setFloat32(0, v, le); return vi.getUint32(0, le); }
            case 0xD0: return v ? 1 : 0;
            case 0xD3: case 0xD5: case 0xD6: {
                extraData.align(8); const off = extraData.tell();
                if (type === 0xD3) extraData.writeFloat64(v);
                else if (type === 0xD5) extraData.writeBigInt64(BigInt(v));
                else extraData.writeBigUint64(BigInt(v));
                patchLocations.push({ pos, extraOffset: off });
                return 0; // Will be patched
            }
            default: return 0;
        }
    }

    const rootOffset = writeNode(obj, ''); writer.view.setUint32(rtPos, rootOffset, le);
    while (pendingNodes.length > 0) {
        const { parentPos, node, path } = pendingNodes.shift()!;
        const offset = writeNode(node, path);
        const saved = writer.tell(); writer.seek(parentPos); writer.writeUInt32(offset); writer.seek(saved);
    }
    
    writer.align(8);
    const baseLen = writer.tell();
    const extraBytes = extraData.getBytes();
    const finalOut = new Uint8Array(baseLen + extraBytes.length);
    finalOut.set(writer.getBytes());
    finalOut.set(extraBytes, baseLen);
    const finalView = new DataView(finalOut.buffer);
    for (const p of patchLocations) {
        finalView.setUint32(p.pos, baseLen + p.extraOffset, le);
    }
    
    return originalData && zstd.isCompressed(originalData) ? zstd.compressData(finalOut) : finalOut;
}

export function bymlToYaml(data: Uint8Array): string {
    const decompressed = zstd.isCompressed(data) ? zstd.decompressData(data) : data;
    const reader = new Reader(decompressed);
    const magic = String.fromCharCode(reader.readUInt8(), reader.readUInt8());
    if (magic === 'BY') reader.le = false; else reader.le = true;
    const version = reader.readUInt16();
    const ktOff = reader.readUInt32(), stOff = reader.readUInt32(), rtOff = reader.readUInt32();
    const keys = reader.readStringTable(ktOff), strings = reader.readStringTable(stOff);
    
    function parseNode(offset: number): any {
        const prev = reader.tell(); reader.seek(offset);
        const type = reader.readUInt8(); let res;
        if (type === 0xC0) {
            const count = reader.readUInt24(); const types = [];
            for (let i = 0; i < count; i++) types.push(reader.readUInt8());
            reader.align(4); const arr = [];
            for (let i = 0; i < count; i++) arr.push(parseValue(types[i], reader.readUInt32()));
            res = arr;
        } else if (type === 0xC1) {
            const count = reader.readUInt24(); const dict: any = {};
            for (let i = 0; i < count; i++) {
                const kidx = reader.readUInt24(), nt = reader.readUInt8(), val = reader.readUInt32();
                dict[keys[kidx]] = parseValue(nt, val);
            }
            res = dict;
        }
        reader.seek(prev); return res;
    }

    function parseValue(type: number, value: number): any {
        switch (type) {
            case 0xA0: return strings[value];
            case 0xD1: { const dv = new DataView(new ArrayBuffer(4)); dv.setUint32(0, value, reader.le); return dv.getInt32(0, reader.le); }
            case 0xD4: return value >>> 0;
            case 0xD2: { const dv = new DataView(new ArrayBuffer(4)); dv.setUint32(0, value, reader.le); return dv.getFloat32(0, reader.le); }
            case 0xD3: { const p = reader.tell(); reader.seek(value); const r = reader.readFloat64(); reader.seek(p); return r; }
            case 0xD5: { const p = reader.tell(); reader.seek(value); const r = reader.readBigInt64(); reader.seek(p); return Number(r); }
            case 0xD6: { const p = reader.tell(); reader.seek(value); const r = reader.readBigUint64(); reader.seek(p); return Number(r); }
            case 0xD0: return value !== 0;
            case 0xC0: case 0xC1: return parseNode(value);
            case 0xFF: return null;
            default: return value; 
        }
    }
    return yaml.dump(parseNode(rtOff), { indent: 2, noRefs: true, quotingType: '"' });
}

class Reader {
    public view: DataView; private offset: number = 0; public le: boolean = true;
    constructor(buffer: Uint8Array) { this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength); }
    readUInt8() { return this.view.getUint8(this.offset++); }
    readUInt16() { const r = this.view.getUint16(this.offset, this.le); this.offset += 2; return r; }
    readUInt32() { const r = this.view.getUint32(this.offset, this.le); this.offset += 4; return r; }
    readUInt32At(o: number) { return this.view.getUint32(o, this.le); }
    readFloat64() { const r = this.view.getFloat64(this.offset, this.le); this.offset += 8; return r; }
    readBigInt64() { const r = this.view.getBigInt64(this.offset, this.le); this.offset += 8; return r; }
    readBigUint64() { const r = this.view.getBigUint64(this.offset, this.le); this.offset += 8; return r; }
    readUInt24() { const b1 = this.readUInt8(), b2 = this.readUInt8(), b3 = this.readUInt8(); return this.le ? (b1 | (b2 << 8) | (b3 << 16)) : ((b1 << 16) | (b2 << 8) | b3); }
    seek(offset: number) { this.offset = offset; }
    tell() { return this.offset; }
    align(n: number) { while (this.offset % n !== 0) this.offset++; }
    readStringTable(offset: number) {
        if (offset === 0) return [];
        const prev = this.offset; this.seek(offset); if (this.readUInt8() !== 0xC2) throw new Error('Invalid string table');
        const count = this.readUInt24(); const offsets = [];
        for (let i = 0; i < count + 1; i++) offsets.push(this.readUInt32());
        const strings = [];
        for (let i = 0; i < count; i++) {
            this.seek(offset + offsets[i]); let bytes = [], b;
            while ((b = this.readUInt8()) !== 0) bytes.push(b);
            strings.push(new TextDecoder().decode(new Uint8Array(bytes)));
        }
        this.seek(prev); return strings;
    }
}
