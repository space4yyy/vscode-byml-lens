import * as assert from 'assert';
import { yamlToByml } from '../../core/byml.js';

describe('BYML Version 7 Unit Tests', () => {
    it('should align 64-bit values to 8 bytes', () => {
        // Create a YAML that will result in a 64-bit value (Int64)
        // 1234567890123 is larger than Int32 but fits in BigInt64
        const val64 = 1234567890123;
        const yamlStr = `
root:
  padding: "short"
  val64: ${val64}
`;
        const encoded = yamlToByml(yamlStr);
        
        // Find the offset of the 64-bit value in the buffer
        const valBuf = new Uint8Array(8);
        const valView = new DataView(valBuf.buffer);
        valView.setBigInt64(0, BigInt(val64), true);
        
        let foundOffset = -1;
        for (let i = 0; i <= encoded.length - 8; i++) {
            let match = true;
            for (let j = 0; j < 8; j++) {
                if (encoded[i+j] !== valBuf[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                foundOffset = i;
                break;
            }
        }
        
        assert.notStrictEqual(foundOffset, -1, "Could not find 64-bit value in encoded BYML");
        assert.strictEqual(foundOffset % 8, 0, `64-bit value at offset ${foundOffset} (0x${foundOffset.toString(16)}) is not 8-byte aligned. Buffer length: ${encoded.length}`);
    });
});
