"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decompressData = decompressData;
exports.compressData = compressData;
exports.isCompressed = isCompressed;
const zstdify_1 = require("zstdify");
function decompressData(data) {
    // Magic number for Zstd: 0x28B52FFD
    if (data[0] === 0x28 && data[1] === 0xB5 && data[2] === 0x2F && data[3] === 0xFD) {
        return (0, zstdify_1.decompress)(data);
    }
    return data;
}
function compressData(data) {
    return (0, zstdify_1.compress)(data);
}
function isCompressed(data) {
    return data[0] === 0x28 && data[1] === 0xB5 && data[2] === 0x2F && data[3] === 0xFD;
}
//# sourceMappingURL=zstd.js.map