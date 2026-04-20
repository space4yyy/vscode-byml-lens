import * as zstd from './zstd.js';
import * as yaml from 'js-yaml';

class Writer {
    private buffer: Uint8Array;
    public view: DataView;
    private offset: number = 0;
    public le: boolean = true;

    constructor(size: number = 1024 * 1024) {
        this.buffer = new Uint8Array(size);
        this.view = new DataView(this.buffer.buffer);
    }

    writeUInt8(v: number) { this.view.setUint8(this.offset++, v); }
    writeUInt16(v: number) { this.view.setUint16(this.offset, v, this.le); this.offset += 2; }
    writeUInt32(v: number) { this.view.setUint32(this.offset, v, this.le); this.offset += 4; }
    
    writeUInt24(v: number) {
        if (this.le) {
            this.writeUInt8(v & 0xFF);
            this.writeUInt8((v >> 8) & 0xFF);
            this.writeUInt8((v >> 16) & 0xFF);
        } else {
            this.writeUInt8((v >> 16) & 0xFF);
            this.writeUInt8((v >> 8) & 0xFF);
            this.writeUInt8(v & 0xFF);
        }
    }

    writeString(s: string) {
        const encoded = new TextEncoder().encode(s);
        for (const b of encoded) this.writeUInt8(b);
        this.writeUInt8(0);
    }

    align(n: number) {
        while (this.offset % n !== 0) this.writeUInt8(0);
    }

    seek(offset: number) { this.offset = offset; }
    tell() { return this.offset; }
    getBytes() { return this.buffer.slice(0, this.offset); }
}

export function yamlToByml(yamlStr: string, originalData?: Uint8Array): Uint8Array {
    const obj = yaml.load(yamlStr);
    const writer = new Writer();
    
    let le = true;
    let version = 7;
    if (originalData) {
        const decompressed = zstd.isCompressed(originalData) ? zstd.decompressData(originalData) : originalData;
        if (decompressed[0] === 0x42 && decompressed[1] === 0x59) le = false;
        version = (decompressed[3] << 8) | decompressed[2];
    }
    writer.le = le;

    const keys = new Set<string>();
    const strings = new Set<string>();
    
    function collect(node: any) {
        if (typeof node === 'string') strings.add(node);
        else if (Array.isArray(node)) node.forEach(collect);
        else if (node && typeof node === 'object') {
            Object.keys(node).forEach(k => {
                keys.add(k);
                collect(node[k]);
            });
        }
    }
    collect(obj);
    
    const sortedKeys = Array.from(keys).sort();
    const sortedStrings = Array.from(strings).sort();
    
    // Header (16 bytes)
    writer.writeUInt8(le ? 0x59 : 0x42); 
    writer.writeUInt8(le ? 0x42 : 0x59);
    writer.writeUInt16(version);
    const keyTableOffsetPos = writer.tell(); writer.writeUInt32(0);
    const stringTableOffsetPos = writer.tell(); writer.writeUInt32(0);
    const rootOffsetPos = writer.tell(); writer.writeUInt32(0);
    
    // Key Table
    const keyTableOffset = writer.tell();
    writer.view.setUint32(keyTableOffsetPos, keyTableOffset, le);
    writeStringTable(sortedKeys);
    
    // String Table
    writer.align(4);
    const stringTableOffset = writer.tell();
    writer.view.setUint32(stringTableOffsetPos, stringTableOffset, le);
    writeStringTable(sortedStrings);
    
    // Nodes Phase: We need to write nodes in a specific order to keep pointers together
    const nodeOffsets = new Map<any, number>();
    const pendingNodes: any[] = [];

    function writeStringTable(arr: string[]) {
        const start = writer.tell();
        writer.writeUInt8(0xC2);
        writer.writeUInt24(arr.length);
        const offsetTablePos = writer.tell();
        for (let i = 0; i < arr.length + 1; i++) writer.writeUInt32(0);
        
        const stringOffsets = [];
        for (let i = 0; i < arr.length; i++) {
            stringOffsets.push(writer.tell() - start);
            writer.writeString(arr[i]);
        }
        stringOffsets.push(writer.tell() - start);
        
        const end = writer.tell();
        writer.seek(offsetTablePos);
        for (const o of stringOffsets) writer.writeUInt32(o);
        writer.seek(end);
    }

    function getNodeType(v: any): number {
        if (typeof v === 'string') return 0xA0;
        if (typeof v === 'number') {
            if (Number.isInteger(v)) return 0xD1;
            return 0xD2;
        }
        if (typeof v === 'boolean') return 0xD0;
        if (Array.isArray(v)) return 0xC0;
        if (v && typeof v === 'object') return 0xC1;
        if (v === null) return 0xFF;
        return 0xFF;
    }

    function writeNode(node: any): number {
        if (nodeOffsets.has(node)) return nodeOffsets.get(node)!;
        
        writer.align(4);
        const offset = writer.tell();
        nodeOffsets.set(node, offset);
        
        if (Array.isArray(node)) {
            writer.writeUInt8(0xC0);
            writer.writeUInt24(node.length);
            for (const item of node) {
                writer.writeUInt8(getNodeType(item));
            }
            writer.align(4);
            const valuePos = writer.tell();
            for (const item of node) writer.writeUInt32(0); // Placeholders
            
            for (let i = 0; i < node.length; i++) {
                const item = node[i];
                const type = getNodeType(item);
                let val = 0;
                if (type === 0xC0 || type === 0xC1) {
                    pendingNodes.push({ parentPos: valuePos + i * 4, node: item });
                } else {
                    val = encodeValue(type, item);
                    const savedPos = writer.tell();
                    writer.seek(valuePos + i * 4);
                    writer.writeUInt32(val);
                    writer.seek(savedPos);
                }
            }
        } else {
            const entries = Object.entries(node).sort((a, b) => {
                const idxA = sortedKeys.indexOf(a[0]);
                const idxB = sortedKeys.indexOf(b[0]);
                return idxA - idxB;
            });
            writer.writeUInt8(0xC1);
            writer.writeUInt24(entries.length);
            const entryPos = writer.tell();
            for (const [k, v] of entries) {
                writer.writeUInt24(sortedKeys.indexOf(k));
                writer.writeUInt8(getNodeType(v));
                writer.writeUInt32(0); // Placeholder
            }
            
            for (let i = 0; i < entries.length; i++) {
                const [k, v] = entries[i];
                const type = getNodeType(v);
                let val = 0;
                if (type === 0xC0 || type === 0xC1) {
                    pendingNodes.push({ parentPos: entryPos + i * 8 + 4, node: v });
                } else {
                    val = encodeValue(type, v);
                    const savedPos = writer.tell();
                    writer.seek(entryPos + i * 8 + 4);
                    writer.writeUInt32(val);
                    writer.seek(savedPos);
                }
            }
        }
        writer.align(4);
        return offset;
    }

    function encodeValue(type: number, v: any): number {
        switch (type) {
            case 0xA0: return sortedStrings.indexOf(v);
            case 0xD1: return v;
            case 0xD2: {
                const buffer = new ArrayBuffer(4);
                const view = new DataView(buffer);
                view.setFloat32(0, v, le);
                return view.getUint32(0, le);
            }
            case 0xD0: return v ? 1 : 0;
            case 0xFF: return 0;
            default: return 0;
        }
    }

    // Start with root
    const rootOffset = writeNode(obj);
    writer.view.setUint32(rootOffsetPos, rootOffset, le);
    
    // Process pending nodes until empty
    while (pendingNodes.length > 0) {
        const { parentPos, node } = pendingNodes.shift();
        const offset = writeNode(node);
        const savedPos = writer.tell();
        writer.seek(parentPos);
        writer.writeUInt32(offset);
        writer.seek(savedPos);
    }
    
    const encoded = writer.getBytes();
    if (originalData && zstd.isCompressed(originalData)) {
        return zstd.compressData(encoded);
    }
    return encoded;
}

export function bymlToYaml(data: Uint8Array): string {
    const decompressed = zstd.isCompressed(data) ? zstd.decompressData(data) : data;
    const reader = new Reader(decompressed);
    
    const magic = String.fromCharCode(reader.readUInt8(), reader.readUInt8());
    if (magic === 'BY') reader.le = false;
    else if (magic === 'YB') reader.le = true;
    else throw new Error('Invalid BYML magic: ' + magic);
    
    const version = reader.readUInt16();
    const keyTableOffset = reader.readUInt32();
    const stringTableOffset = reader.readUInt32();
    const rootOffset = reader.readUInt32();
    
    const keys = reader.readStringTable(keyTableOffset);
    const strings = reader.readStringTable(stringTableOffset);
    
    function parseNode(offset: number): any {
        const prev = reader.tell();
        reader.seek(offset);
        const type = reader.readUInt8();
        let res;
        if (type === 0xC0) { // Array
            const count = reader.readUInt24();
            const types = [];
            for (let i = 0; i < count; i++) types.push(reader.readUInt8());
            while (reader.tell() % 4 !== 0) reader.readUInt8();
            const arr = [];
            for (let i = 0; i < count; i++) {
                arr.push(parseValue(types[i], reader.readUInt32()));
            }
            res = arr;
        } else if (type === 0xC1) { // Dictionary
            const count = reader.readUInt24();
            const dict: any = {};
            for (let i = 0; i < count; i++) {
                const keyIdx = reader.readUInt24();
                const nodeType = reader.readUInt8();
                const value = reader.readUInt32();
                dict[keys[keyIdx]] = parseValue(nodeType, value);
            }
            res = dict;
        } else {
            throw new Error('Unsupported container type: 0x' + type.toString(16) + ' at 0x' + offset.toString(16));
        }
        reader.seek(prev);
        return res;
    }

    function parseValue(type: number, value: number): any {
        switch (type) {
            case 0xA0: return strings[value]; // String
            case 0xD1: { // Int
                const dv = new DataView(new ArrayBuffer(4));
                dv.setUint32(0, value, reader.le);
                return dv.getInt32(0, reader.le);
            }
            case 0xD2: { // Float
                const dv = new DataView(new ArrayBuffer(4));
                dv.setUint32(0, value, reader.le);
                return dv.getFloat32(0, reader.le);
            }
            case 0xD0: return value !== 0; // Bool
            case 0xC0: case 0xC1: return parseNode(value);
            case 0xFF: return null;
            default: return value; // Fallback
        }
    }

    const root = parseNode(rootOffset);
    return yaml.dump(root, { indent: 2, noRefs: true });
}

class Reader {
    public view: DataView;
    private offset: number = 0;
    public le: boolean = true;

    constructor(buffer: Uint8Array) {
        this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    }

    readUInt8() { return this.view.getUint8(this.offset++); }
    readUInt16() { const r = this.view.getUint16(this.offset, this.le); this.offset += 2; return r; }
    readUInt32() { const r = this.view.getUint32(this.offset, this.le); this.offset += 4; return r; }
    
    readUInt24() {
        const b1 = this.readUInt8();
        const b2 = this.readUInt8();
        const b3 = this.readUInt8();
        if (this.le) return b1 | (b2 << 8) | (b3 << 16);
        return (b1 << 16) | (b2 << 8) | b3;
    }

    seek(offset: number) { this.offset = offset; }
    tell() { return this.offset; }
    
    readStringTable(offset: number) {
        if (offset === 0) return [];
        const prev = this.offset;
        this.seek(offset);
        const type = this.readUInt8();
        if (type !== 0xC2) throw new Error('Invalid string table type at 0x' + offset.toString(16) + ': 0x' + type.toString(16));
        const count = this.readUInt24();
        const offsets = [];
        for (let i = 0; i < count + 1; i++) offsets.push(this.readUInt32());
        
        const strings = [];
        for (let i = 0; i < count; i++) {
            this.seek(offset + offsets[i]);
            let bytes = [];
            let b;
            while ((b = this.readUInt8()) !== 0) bytes.push(b);
            strings.push(new TextDecoder().decode(new Uint8Array(bytes)));
        }
        this.seek(prev);
        return strings;
    }
}
