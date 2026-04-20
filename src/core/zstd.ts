import { compress, decompress } from 'zstdify';

export function decompressData(data: Uint8Array): Uint8Array {
    // Magic number for Zstd: 0x28B52FFD
    if (data[0] === 0x28 && data[1] === 0xB5 && data[2] === 0x2F && data[3] === 0xFD) {
        return decompress(data);
    }
    return data;
}

export function compressData(data: Uint8Array): Uint8Array {
    return compress(data);
}

export function isCompressed(data: Uint8Array): boolean {
    return data[0] === 0x28 && data[1] === 0xB5 && data[2] === 0x2F && data[3] === 0xFD;
}
