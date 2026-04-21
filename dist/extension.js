"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode5 = __toESM(require("vscode"));
var path3 = __toESM(require("path"));

// src/providers/packFsProvider.ts
var vscode2 = __toESM(require("vscode"));

// node_modules/zstdify/dist/bitstream/littleEndian.js
function readU32LE(data, offset) {
  if (offset + 4 > data.length) {
    throw new RangeError(`readU32LE: offset ${offset} + 4 exceeds length ${data.length}`);
  }
  const a = data[offset];
  const b = data[offset + 1];
  const c = data[offset + 2];
  const d = data[offset + 3];
  if (a === void 0 || b === void 0 || c === void 0 || d === void 0)
    throw new Error("unreachable");
  return (a | b << 8 | c << 16 | d << 24) >>> 0;
}
function readU64LE(data, offset) {
  if (offset + 8 > data.length) {
    throw new RangeError(`readU64LE: offset ${offset} + 8 exceeds length ${data.length}`);
  }
  const b0 = data[offset];
  const b1 = data[offset + 1];
  const b2 = data[offset + 2];
  const b3 = data[offset + 3];
  const b4 = data[offset + 4];
  const b5 = data[offset + 5];
  const b6 = data[offset + 6];
  const b7 = data[offset + 7];
  if ([b0, b1, b2, b3, b4, b5, b6, b7].some((x) => x === void 0))
    throw new Error("unreachable");
  const lo = (b0 | b1 << 8 | b2 << 16 | b3 << 24) >>> 0;
  const hi = (b4 | b5 << 8 | b6 << 16 | b7 << 24) >>> 0;
  return BigInt(lo) | BigInt(hi) << 32n;
}

// node_modules/zstdify/dist/errors.js
var ZstdError = class _ZstdError extends Error {
  code;
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "ZstdError";
    Object.setPrototypeOf(this, _ZstdError.prototype);
  }
};

// node_modules/zstdify/dist/entropy/fse.js
var FSE_MIN_TABLELOG = 5;
var FSE_TABLESTEP = (tableSize) => (tableSize >> 1) + (tableSize >> 3) + 3;
function buildFSEDecodeTable(normalizedCounter, tableLog) {
  if (!normalizedCounter || normalizedCounter.length === 0) {
    throw new ZstdError("FSE: invalid normalized counter", "corruption_detected");
  }
  if (!Number.isInteger(tableLog) || tableLog < 1 || tableLog > 15) {
    throw new ZstdError("FSE: invalid tableLog", "corruption_detected");
  }
  if (normalizedCounter.length > 65535 + 1) {
    throw new ZstdError("FSE: symbol value out of range", "corruption_detected");
  }
  const tableSize = 1 << tableLog;
  let totalProbability = 0;
  for (let s = 0; s < normalizedCounter.length; s++) {
    const n = normalizedCounter[s];
    if (!Number.isInteger(n) || n === void 0 || n < -1) {
      throw new ZstdError("FSE: invalid normalized count", "corruption_detected");
    }
    totalProbability += n < 0 ? 1 : n;
    if (totalProbability > tableSize) {
      throw new ZstdError("FSE: invalid normalized sum", "corruption_detected");
    }
  }
  if (totalProbability !== tableSize) {
    throw new ZstdError("FSE: invalid normalized sum", "corruption_detected");
  }
  const tableSymbol = new Array(tableSize);
  const maxSymbolValue = normalizedCounter.length - 1;
  const symbolNext = new Array(maxSymbolValue + 1);
  let highThreshold = tableSize - 1;
  for (let s = 0; s <= maxSymbolValue; s++) {
    const n = normalizedCounter[s] ?? 0;
    if (n === -1) {
      tableSymbol[highThreshold] = s;
      highThreshold--;
      symbolNext[s] = 1;
    } else {
      symbolNext[s] = n;
    }
  }
  const step = FSE_TABLESTEP(tableSize);
  const tableMask = tableSize - 1;
  let position = 0;
  for (let s = 0; s <= maxSymbolValue; s++) {
    const n = normalizedCounter[s] ?? 0;
    if (n <= 0)
      continue;
    for (let i = 0; i < n; i++) {
      tableSymbol[position] = s;
      do {
        position = position + step & tableMask;
      } while (position > highThreshold);
    }
  }
  const symbolByState = new Uint16Array(tableSize);
  const numBitsByState = new Uint8Array(tableSize);
  const baselineByState = new Int32Array(tableSize);
  for (let u = 0; u < tableSize; u++) {
    const symbol = tableSymbol[u];
    if (symbol === void 0) {
      throw new ZstdError("FSE invalid decode table", "corruption_detected");
    }
    const nextState = symbolNext[symbol];
    if (nextState === void 0)
      throw new ZstdError("FSE invalid symbol", "corruption_detected");
    symbolNext[symbol] = nextState + 1;
    const nbBits = tableLog - 31 + Math.clz32(nextState);
    const baseline = (nextState << nbBits) - tableSize;
    symbolByState[u] = symbol;
    numBitsByState[u] = nbBits;
    baselineByState[u] = baseline;
  }
  return {
    symbol: symbolByState,
    numBits: numBitsByState,
    baseline: baselineByState,
    tableLog,
    length: tableSize
  };
}
function readU32LESafe(data, offset) {
  return (data[offset] | data[offset + 1] << 8 | data[offset + 2] << 16 | data[offset + 3] << 24) >>> 0;
}
function highbit32(v) {
  return 31 - Math.clz32(v >>> 0);
}
function ctz32(v) {
  const x = v >>> 0;
  if (x === 0)
    return 32;
  return 31 - Math.clz32((x & -x) >>> 0);
}
function readNCount(data, offset, maxSymbolValue, maxTableLog) {
  const remainingInput = data.length - offset;
  if (remainingInput <= 0) {
    throw new ZstdError("FSE readNCount: truncated input", "corruption_detected");
  }
  const parseBody = (buf, hbSize) => {
    const normalizedCounter = new Array(maxSymbolValue + 1).fill(0);
    let ip = 0;
    const iend = hbSize;
    const maxSV1 = maxSymbolValue + 1;
    let previous0 = false;
    let charnum = 0;
    let bitStream = readU32LESafe(buf, ip);
    let nbBits = (bitStream & 15) + 5;
    if (nbBits > maxTableLog) {
      throw new ZstdError("FSE readNCount: tableLog too large", "corruption_detected");
    }
    const tableLog = nbBits;
    bitStream >>>= 4;
    let bitCount = 4;
    let remaining = (1 << nbBits) + 1;
    let threshold = 1 << nbBits;
    nbBits += 1;
    const reload = () => {
      if (ip <= iend - 7 || ip + (bitCount >> 3) <= iend - 4) {
        ip += bitCount >> 3;
        bitCount &= 7;
      } else {
        bitCount -= 8 * (iend - 4 - ip);
        bitCount &= 31;
        ip = iend - 4;
      }
      bitStream = readU32LESafe(buf, ip) >>> bitCount;
    };
    while (true) {
      if (previous0) {
        let repeats = ctz32((~bitStream | 2147483648) >>> 0) >> 1;
        while (repeats >= 12) {
          charnum += 3 * 12;
          if (ip <= iend - 7) {
            ip += 3;
          } else {
            bitCount -= 8 * (iend - 7 - ip);
            bitCount &= 31;
            ip = iend - 4;
          }
          bitStream = readU32LESafe(buf, ip) >>> bitCount;
          repeats = ctz32((~bitStream | 2147483648) >>> 0) >> 1;
        }
        charnum += 3 * repeats;
        bitStream >>>= 2 * repeats;
        bitCount += 2 * repeats;
        const lastRepeat = bitStream & 3;
        if (lastRepeat >= 3) {
          throw new ZstdError("FSE readNCount: invalid zero repeat", "corruption_detected");
        }
        charnum += lastRepeat;
        bitCount += 2;
        if (charnum >= maxSV1)
          break;
        reload();
      }
      const max = 2 * threshold - 1 - remaining;
      let count;
      if ((bitStream & threshold - 1) < max) {
        count = bitStream & threshold - 1;
        bitCount += nbBits - 1;
      } else {
        count = bitStream & 2 * threshold - 1;
        if (count >= threshold)
          count -= max;
        bitCount += nbBits;
      }
      count -= 1;
      if (count >= 0) {
        remaining -= count;
      } else {
        remaining += count;
      }
      normalizedCounter[charnum] = count;
      charnum += 1;
      previous0 = count === 0;
      if (remaining < threshold) {
        if (remaining <= 1)
          break;
        nbBits = highbit32(remaining) + 1;
        threshold = 1 << nbBits - 1;
      }
      if (charnum >= maxSV1)
        break;
      reload();
    }
    if (remaining !== 1) {
      throw new ZstdError("FSE readNCount: invalid probability sum", "corruption_detected");
    }
    if (charnum > maxSV1 || bitCount > 32) {
      throw new ZstdError("FSE readNCount: corrupted header", "corruption_detected");
    }
    ip += bitCount + 7 >> 3;
    const outMaxSymbol = charnum - 1;
    for (let i = charnum; i <= maxSymbolValue; i++) {
      normalizedCounter[i] = 0;
    }
    return { normalizedCounter, tableLog, maxSymbolValue: outMaxSymbol, bytesRead: ip };
  };
  if (remainingInput < 8) {
    const scratch = new Uint8Array(8);
    scratch.set(data.subarray(offset));
    const parsed = parseBody(scratch, 8);
    if (parsed.bytesRead > remainingInput) {
      throw new ZstdError("FSE readNCount: truncated input", "corruption_detected");
    }
    return parsed;
  }
  return parseBody(data.subarray(offset), remainingInput);
}
function normalizeCountsForTable(counts, tableLog) {
  const tableSize = 1 << tableLog;
  if (tableSize <= 0) {
    throw new ZstdError("FSE normalize: invalid tableLog", "parameter_unsupported");
  }
  const maxSymbolValue = counts.length - 1;
  if (maxSymbolValue < 0) {
    throw new ZstdError("FSE normalize: empty counts", "parameter_unsupported");
  }
  const normalizedCounter = new Array(counts.length).fill(0);
  let total = 0;
  let nonZero = 0;
  for (let s = 0; s < counts.length; s++) {
    const c = counts[s] ?? 0;
    if (c > 0) {
      total += c;
      nonZero++;
    }
  }
  if (total <= 0 || nonZero === 0) {
    throw new ZstdError("FSE normalize: empty distribution", "parameter_unsupported");
  }
  if (nonZero > tableSize) {
    throw new ZstdError("FSE normalize: table too small for distribution", "parameter_unsupported");
  }
  const remainders = new Array(counts.length).fill(0);
  let assigned = 0;
  for (let s = 0; s < counts.length; s++) {
    const c = counts[s] ?? 0;
    if (c <= 0)
      continue;
    const scaled = c * tableSize / total;
    let value = Math.floor(scaled);
    if (value < 1)
      value = 1;
    normalizedCounter[s] = value;
    remainders[s] = scaled - Math.floor(scaled);
    assigned += value;
  }
  while (assigned > tableSize) {
    let bestSymbol = -1;
    let bestCount = 0;
    for (let s = 0; s < normalizedCounter.length; s++) {
      const n = normalizedCounter[s] ?? 0;
      if (n > 1 && n > bestCount) {
        bestCount = n;
        bestSymbol = s;
      }
    }
    if (bestSymbol < 0) {
      throw new ZstdError("FSE normalize: failed to reduce distribution", "parameter_unsupported");
    }
    normalizedCounter[bestSymbol] = (normalizedCounter[bestSymbol] ?? 1) - 1;
    assigned--;
  }
  while (assigned < tableSize) {
    let bestSymbol = -1;
    let bestRemainder = -1;
    let bestCount = -1;
    for (let s = 0; s < normalizedCounter.length; s++) {
      const n = normalizedCounter[s] ?? 0;
      if (n <= 0)
        continue;
      const rem = remainders[s] ?? 0;
      if (rem > bestRemainder || rem === bestRemainder && n > bestCount) {
        bestRemainder = rem;
        bestCount = n;
        bestSymbol = s;
      }
    }
    if (bestSymbol < 0) {
      throw new ZstdError("FSE normalize: failed to complete distribution", "parameter_unsupported");
    }
    normalizedCounter[bestSymbol] = (normalizedCounter[bestSymbol] ?? 0) + 1;
    assigned++;
  }
  return { normalizedCounter, maxSymbolValue };
}
function writeNCount(normalizedCounter, maxSymbolValue, tableLog) {
  if (tableLog < FSE_MIN_TABLELOG) {
    throw new ZstdError("FSE writeNCount: tableLog too small", "parameter_unsupported");
  }
  if (maxSymbolValue < 0 || maxSymbolValue >= normalizedCounter.length) {
    throw new ZstdError("FSE writeNCount: invalid max symbol", "parameter_unsupported");
  }
  const tableSize = 1 << tableLog;
  const out = [];
  let bitStream = 0 >>> 0;
  let bitCount = 0;
  let nbBits = tableLog + 1;
  let remaining = tableSize + 1;
  let threshold = tableSize;
  let symbol = 0;
  const alphabetSize = maxSymbolValue + 1;
  let previousIs0 = false;
  const flush16 = () => {
    out.push(bitStream & 255, bitStream >>> 8 & 255);
    bitStream >>>= 16;
    bitCount -= 16;
  };
  bitStream = bitStream + (tableLog - FSE_MIN_TABLELOG << bitCount) >>> 0;
  bitCount += 4;
  while (symbol < alphabetSize && remaining > 1) {
    if (previousIs0) {
      let start = symbol;
      while (symbol < alphabetSize && (normalizedCounter[symbol] ?? 0) === 0)
        symbol++;
      if (symbol === alphabetSize)
        break;
      while (symbol >= start + 24) {
        start += 24;
        bitStream = bitStream + (65535 << bitCount >>> 0) >>> 0;
        flush16();
      }
      while (symbol >= start + 3) {
        start += 3;
        bitStream = bitStream + (3 << bitCount >>> 0) >>> 0;
        bitCount += 2;
      }
      bitStream = bitStream + (symbol - start << bitCount) >>> 0;
      bitCount += 2;
      while (bitCount > 16) {
        flush16();
      }
    }
    let count = normalizedCounter[symbol] ?? 0;
    symbol++;
    const max = 2 * threshold - 1 - remaining;
    remaining -= count < 0 ? -count : count;
    count += 1;
    if (count >= threshold)
      count += max;
    bitStream = bitStream + (count >>> 0 << bitCount >>> 0) >>> 0;
    bitCount += nbBits;
    if (count < max)
      bitCount -= 1;
    previousIs0 = count === 1;
    if (remaining < 1) {
      throw new ZstdError("FSE writeNCount: invalid normalized distribution", "parameter_unsupported");
    }
    while (remaining < threshold) {
      nbBits--;
      threshold >>= 1;
    }
    while (bitCount > 16) {
      flush16();
    }
  }
  if (remaining !== 1) {
    throw new ZstdError("FSE writeNCount: invalid normalized sum", "parameter_unsupported");
  }
  out.push(bitStream & 255, bitStream >>> 8 & 255);
  const finalSize = out.length - (2 - (bitCount + 7 >> 3));
  return new Uint8Array(out.slice(0, finalSize));
}

// node_modules/zstdify/dist/entropy/huffman.js
function weightsToNumBits(weights, maxNumBits) {
  const result = [];
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i] ?? 0;
    result.push(w ? maxNumBits + 1 - w : 0);
  }
  return result;
}
function buildHuffmanDecodeTable(numBits, maxNumBits) {
  const tableSize = 1 << maxNumBits;
  const symbolByPrefix = new Uint8Array(tableSize);
  const bitsByPrefix = new Uint8Array(tableSize);
  const rankCount = new Array(maxNumBits + 1).fill(0);
  for (let s = 0; s < numBits.length; s++) {
    const len = numBits[s] ?? 0;
    if (len < 0 || len > maxNumBits) {
      throw new ZstdError("Huffman invalid bit length", "corruption_detected");
    }
    rankCount[len] = (rankCount[len] ?? 0) + 1;
  }
  const rankIdx = new Array(maxNumBits + 1).fill(0);
  rankIdx[maxNumBits] = 0;
  for (let len = maxNumBits; len >= 1; len--) {
    const current = rankIdx[len] ?? 0;
    rankIdx[len - 1] = current + (rankCount[len] ?? 0) * (1 << maxNumBits - len);
  }
  if (rankIdx[0] !== tableSize) {
    throw new ZstdError("Huffman invalid tree", "corruption_detected");
  }
  for (let symbol = 0; symbol < numBits.length; symbol++) {
    const len = numBits[symbol] ?? 0;
    if (len === 0)
      continue;
    const code = rankIdx[len] ?? 0;
    const span = 1 << maxNumBits - len;
    for (let i = 0; i < span; i++) {
      symbolByPrefix[code + i] = symbol;
      bitsByPrefix[code + i] = len;
    }
    rankIdx[len] = code + span;
  }
  return {
    symbol: symbolByPrefix,
    numBits: bitsByPrefix,
    maxNumBits,
    length: tableSize
  };
}

// node_modules/zstdify/dist/entropy/weights.js
function readWeightsDirect(data, offset, numWeights) {
  const bytesNeeded = Math.ceil(numWeights / 2);
  if (offset + bytesNeeded > data.length) {
    throw new ZstdError("Huffman weights truncated", "corruption_detected");
  }
  const weights = [];
  for (let i = 0; i < numWeights; i++) {
    const byteIdx = Math.floor(i / 2);
    const byte = data[offset + byteIdx];
    if (byte === void 0)
      throw new ZstdError("Huffman weights truncated", "corruption_detected");
    const nibble = (i & 1) === 0 ? byte >> 4 & 15 : byte & 15;
    weights.push(nibble);
  }
  return { weights, bytesRead: bytesNeeded };
}
var MAX_WEIGHT_SYMBOL = 11;
var MAX_WEIGHT_TABLE_LOG = 7;
function readWeightsFSE(data, offset, compressedSize) {
  if (compressedSize < 2) {
    throw new ZstdError("FSE-compressed weights: need at least 2 bytes", "corruption_detected");
  }
  if (offset + compressedSize > data.length) {
    throw new ZstdError("FSE-compressed weights truncated", "corruption_detected");
  }
  const header = data.subarray(offset, offset + compressedSize);
  const { normalizedCounter, tableLog, bytesRead: ncountBytes } = readNCount(header, 0, MAX_WEIGHT_SYMBOL, MAX_WEIGHT_TABLE_LOG);
  const table = buildFSEDecodeTable(normalizedCounter, tableLog);
  const streamStart = ncountBytes;
  const streamLength = compressedSize - ncountBytes;
  if (streamLength <= 0) {
    throw new ZstdError("FSE-compressed weights: no stream after header", "corruption_detected");
  }
  const stream = header.subarray(streamStart, streamStart + streamLength);
  const lastByte = stream[stream.length - 1] ?? 0;
  if (lastByte === 0) {
    throw new ZstdError("FSE-compressed weights: invalid end marker", "corruption_detected");
  }
  const highestSetBit = 31 - Math.clz32(lastByte);
  const paddingBits = 8 - highestSetBit;
  let bitOffset = streamLength * 8 - paddingBits;
  const readBitsZeroExtended = (numBits) => {
    if (numBits <= 0)
      return 0;
    bitOffset -= numBits;
    let value = 0;
    for (let i = 0; i < numBits; i++) {
      const abs = bitOffset + i;
      if (abs < 0)
        continue;
      const byteIndex = abs >>> 3;
      const bitInByte = abs & 7;
      const bit = (stream[byteIndex] ?? 0) >>> bitInByte & 1;
      value |= bit << i;
    }
    return value;
  };
  const weights = [];
  const state1 = { value: readBitsZeroExtended(tableLog) };
  const state2 = { value: readBitsZeroExtended(tableLog) };
  while (weights.length < 255) {
    if (state1.value < 0 || state1.value >= table.length) {
      throw new ZstdError("FSE-compressed weights: invalid state", "corruption_detected");
    }
    const sym1 = table.symbol[state1.value];
    const bits1 = table.numBits[state1.value];
    const baseline1 = table.baseline[state1.value];
    weights.push(sym1);
    state1.value = baseline1 + readBitsZeroExtended(bits1);
    if (bitOffset < 0) {
      if (state2.value < 0 || state2.value >= table.length) {
        throw new ZstdError("FSE-compressed weights: invalid state", "corruption_detected");
      }
      weights.push(table.symbol[state2.value]);
      break;
    }
    if (weights.length >= 255)
      break;
    if (state2.value < 0 || state2.value >= table.length) {
      throw new ZstdError("FSE-compressed weights: invalid state", "corruption_detected");
    }
    const sym2 = table.symbol[state2.value];
    const bits2 = table.numBits[state2.value];
    const baseline2 = table.baseline[state2.value];
    weights.push(sym2);
    state2.value = baseline2 + readBitsZeroExtended(bits2);
    if (bitOffset < 0) {
      if (state1.value < 0 || state1.value >= table.length) {
        throw new ZstdError("FSE-compressed weights: invalid state", "corruption_detected");
      }
      weights.push(table.symbol[state1.value]);
      break;
    }
  }
  if (weights.length < 2) {
    throw new ZstdError("FSE-compressed weights: need at least 2 weights", "corruption_detected");
  }
  return { weights, bytesRead: compressedSize };
}

// node_modules/zstdify/dist/dictionary/decoderDictionary.js
var ZSTD_DICTIONARY_MAGIC = 3962610743;
function buildHuffmanTableFromWeights(weights) {
  let partialSum = 0;
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i] ?? 0;
    if (w > 0)
      partialSum += 1 << w - 1;
  }
  if (partialSum === 0) {
    throw new ZstdError("Invalid Huffman weights", "corruption_detected");
  }
  const maxNumBits = 32 - Math.clz32(partialSum);
  const total = 1 << maxNumBits;
  const remainder = total - partialSum;
  if (remainder <= 0 || (remainder & remainder - 1) !== 0) {
    throw new ZstdError("Invalid Huffman weights: cannot complete to power of 2", "corruption_detected");
  }
  const lastWeight = 32 - Math.clz32(remainder);
  const fullWeights = [...weights, lastWeight];
  while (fullWeights.length < 256) {
    fullWeights.push(0);
  }
  const numBits = weightsToNumBits(fullWeights, maxNumBits);
  return {
    table: buildHuffmanDecodeTable(numBits, maxNumBits),
    maxNumBits
  };
}
function parseDictionaryHuffmanTable(data, offset) {
  if (offset >= data.length) {
    throw new ZstdError("Dictionary Huffman table truncated", "corruption_detected");
  }
  const headerByte = data[offset] ?? 0;
  let pos = offset + 1;
  let weights;
  if (headerByte >= 128) {
    const numWeights = headerByte - 127;
    const direct = readWeightsDirect(data, pos, numWeights);
    weights = direct.weights;
    pos += direct.bytesRead;
  } else {
    const fse = readWeightsFSE(data, pos, headerByte);
    weights = fse.weights;
    pos += headerByte;
  }
  const table = buildHuffmanTableFromWeights(weights);
  return { table, bytesRead: pos - offset };
}
function normalizeDecoderDictionary(dictionaryBytes, providedDictionaryId = null) {
  if (dictionaryBytes.length < 8 || readU32LE(dictionaryBytes, 0) !== ZSTD_DICTIONARY_MAGIC) {
    return {
      historyPrefix: dictionaryBytes.slice(),
      dictionaryId: providedDictionaryId,
      repOffsets: [1, 4, 8],
      huffmanTable: null,
      sequenceTables: null
    };
  }
  if (dictionaryBytes.length <= 8) {
    throw new ZstdError("Dictionary too small", "corruption_detected");
  }
  const parsedDictionaryId = readU32LE(dictionaryBytes, 4);
  if (parsedDictionaryId === 0) {
    throw new ZstdError("Dictionary ID must be non-zero", "corruption_detected");
  }
  if (providedDictionaryId !== null && providedDictionaryId !== parsedDictionaryId) {
    throw new ZstdError("Provided dictionary ID does not match dictionary content", "corruption_detected");
  }
  let pos = 8;
  const huffman = parseDictionaryHuffmanTable(dictionaryBytes, pos);
  pos += huffman.bytesRead;
  const ofNCount = readNCount(dictionaryBytes, pos, 31, 8);
  pos += ofNCount.bytesRead;
  const mlNCount = readNCount(dictionaryBytes, pos, 52, 9);
  pos += mlNCount.bytesRead;
  const llNCount = readNCount(dictionaryBytes, pos, 35, 9);
  pos += llNCount.bytesRead;
  if (pos + 12 > dictionaryBytes.length) {
    throw new ZstdError("Dictionary entropy section truncated", "corruption_detected");
  }
  const contentSize = dictionaryBytes.length - (pos + 12);
  const repOffsets = [
    readU32LE(dictionaryBytes, pos),
    readU32LE(dictionaryBytes, pos + 4),
    readU32LE(dictionaryBytes, pos + 8)
  ];
  for (const rep of repOffsets) {
    if (rep === 0 || rep > contentSize) {
      throw new ZstdError("Invalid dictionary repeat offset", "corruption_detected");
    }
  }
  pos += 12;
  const historyPrefix = dictionaryBytes.subarray(pos).slice();
  const sequenceTables = {
    ofTable: buildFSEDecodeTable(ofNCount.normalizedCounter, ofNCount.tableLog),
    ofTableLog: ofNCount.tableLog,
    mlTable: buildFSEDecodeTable(mlNCount.normalizedCounter, mlNCount.tableLog),
    mlTableLog: mlNCount.tableLog,
    llTable: buildFSEDecodeTable(llNCount.normalizedCounter, llNCount.tableLog),
    llTableLog: llNCount.tableLog
  };
  return {
    historyPrefix,
    dictionaryId: parsedDictionaryId,
    repOffsets,
    huffmanTable: huffman.table,
    sequenceTables
  };
}

// node_modules/zstdify/dist/dictionary/compressorDictionary.js
var ZSTD_DICTIONARY_MAGIC2 = 3962610743;
function resolveDictionaryContextForCompression(dictionaryBytes, providedDictionaryId = null) {
  if (dictionaryBytes.length < 8 || readU32LE(dictionaryBytes, 0) !== ZSTD_DICTIONARY_MAGIC2) {
    return {
      dictionaryId: providedDictionaryId,
      historyPrefix: dictionaryBytes,
      repOffsets: [1, 4, 8]
    };
  }
  const parsed = normalizeDecoderDictionary(dictionaryBytes, providedDictionaryId);
  return {
    dictionaryId: parsed.dictionaryId,
    historyPrefix: parsed.historyPrefix,
    repOffsets: [parsed.repOffsets[0], parsed.repOffsets[1], parsed.repOffsets[2]]
  };
}

// node_modules/zstdify/dist/encode/blockWriter.js
var sharedHeader = null;
function writeU24LE(arr, offset, value) {
  arr[offset] = value & 255;
  arr[offset + 1] = value >> 8 & 255;
  arr[offset + 2] = value >> 16 & 255;
}
function getHeader() {
  if (!sharedHeader)
    sharedHeader = new Uint8Array(3);
  return sharedHeader;
}
function writeRawBlock(data, offset, size, last) {
  const header = getHeader();
  const blockHeader2 = (last ? 1 : 0) | 0 << 1 | size << 3;
  writeU24LE(header, 0, blockHeader2);
  const result = new Uint8Array(3 + size);
  result.set(header);
  result.set(data.subarray(offset, offset + size), 3);
  return result;
}
function writeRLEBlock(byte, size, last) {
  const header = getHeader();
  const blockHeader2 = (last ? 1 : 0) | 1 << 1 | size << 3;
  writeU24LE(header, 0, blockHeader2);
  const result = new Uint8Array(4);
  result.set(header, 0);
  result[3] = byte & 255;
  return result;
}

// node_modules/zstdify/dist/bitstream/reverseBitWriter.js
var ReverseBitWriter = class {
  buffer = new Uint8Array(0);
  outputSize = 0;
  writePos = 0;
  bitContainer = 0;
  bitCount = 0;
  reset(bitLength) {
    this.outputSize = bitLength + 7 >>> 3;
    if (this.buffer.length < this.outputSize) {
      this.buffer = new Uint8Array(this.outputSize);
    }
    this.buffer.fill(0, 0, this.outputSize);
    this.writePos = 0;
    this.bitContainer = 0;
    this.bitCount = 0;
  }
  writeBits(n, bits) {
    let remaining = n;
    let value = bits >>> 0;
    while (remaining > 0) {
      const take = remaining > 24 ? 24 : remaining;
      const partMask = (1 << take) - 1 >>> 0;
      const part = value & partMask;
      this.bitContainer |= part << this.bitCount;
      this.bitCount += take;
      value >>>= take;
      remaining -= take;
      while (this.bitCount >= 8) {
        this.buffer[this.writePos++] = this.bitContainer & 255;
        this.bitContainer >>>= 8;
        this.bitCount -= 8;
      }
    }
  }
  finish() {
    if (this.bitCount > 0 && this.writePos < this.outputSize) {
      this.buffer[this.writePos++] = this.bitContainer & 255;
      this.bitContainer = 0;
      this.bitCount = 0;
    }
    return this.buffer.slice(0, this.outputSize);
  }
};
function encodeReverseBitstream(bitCounts, bitValues, writer = new ReverseBitWriter()) {
  let bitLength = 1;
  for (let i = 0; i < bitCounts.length; i++) {
    const n = bitCounts[i] ?? 0;
    if (n > 0)
      bitLength += n;
  }
  writer.reset(bitLength);
  for (let i = bitCounts.length - 1; i >= 0; i--) {
    const n = bitCounts[i] ?? 0;
    if (n > 0)
      writer.writeBits(n, bitValues[i] ?? 0);
  }
  writer.writeBits(1, 1);
  return writer.finish();
}

// node_modules/zstdify/dist/entropy/predefined.js
var LITERALS_LENGTH_DEFAULT_DISTRIBUTION = [
  4,
  3,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  3,
  2,
  1,
  1,
  1,
  1,
  1,
  -1,
  -1,
  -1,
  -1
];
var MATCH_LENGTH_DEFAULT_DISTRIBUTION = [
  1,
  4,
  3,
  2,
  2,
  2,
  2,
  2,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1
];
var OFFSET_CODE_DEFAULT_DISTRIBUTION = [
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  -1,
  -1,
  -1,
  -1,
  -1
];
var LITERALS_LENGTH_TABLE_LOG = 6;
var MATCH_LENGTH_TABLE_LOG = 6;
var OFFSET_CODE_TABLE_LOG = 5;

// node_modules/zstdify/dist/bitstream/bitWriter.js
var BitWriter = class {
  chunks = [];
  currentByte = 0;
  bitOffset = 0;
  // 0-7, bits written in current byte
  /** Write n bits (1-32), LSB first */
  writeBits(n, bits) {
    if (n < 1 || n > 32) {
      throw new RangeError(`BitWriter.writeBits: n must be 1-32, got ${n}`);
    }
    const mask = n === 32 ? 4294967295 : (1 << n) - 1;
    let value = bits >>> 0 & mask;
    let bitsLeft = n;
    while (bitsLeft > 0) {
      const spaceInByte = 8 - this.bitOffset;
      const take = Math.min(bitsLeft, spaceInByte);
      const maskTake = (1 << take) - 1;
      this.currentByte |= (value & maskTake) << this.bitOffset;
      this.bitOffset += take;
      bitsLeft -= take;
      value >>= take;
      if (this.bitOffset >= 8) {
        this.chunks.push(this.currentByte & 255);
        this.currentByte = 0;
        this.bitOffset = 0;
      }
    }
  }
  /** Flush remaining bits to output. Call when done writing. */
  flush() {
    const result = [...this.chunks];
    if (this.bitOffset > 0) {
      result.push(this.currentByte & 255);
    }
    return new Uint8Array(result);
  }
  /** Reset writer for reuse */
  reset() {
    this.chunks = [];
    this.currentByte = 0;
    this.bitOffset = 0;
  }
};

// node_modules/zstdify/dist/encode/literalsEncoder.js
var literalBitCountsScratch = null;
var literalBitValuesScratch = null;
var WEIGHT_MAX_SYMBOL = 11;
var WEIGHT_MAX_TABLE_LOG = 7;
function ensureLiteralBitScratch(minLength) {
  const counts = literalBitCountsScratch;
  const values = literalBitValuesScratch;
  if (counts && values && counts.length >= minLength && values.length >= minLength) {
    return { counts, values };
  }
  let capacity = counts?.length ?? 0;
  if (capacity === 0)
    capacity = 64;
  while (capacity < minLength)
    capacity *= 2;
  literalBitCountsScratch = new Uint8Array(capacity);
  literalBitValuesScratch = new Uint32Array(capacity);
  return { counts: literalBitCountsScratch, values: literalBitValuesScratch };
}
function buildRawLiteralsSection(literals) {
  const size = literals.length;
  if (size <= 31) {
    const out = new Uint8Array(1 + size);
    out[0] = size << 3 | 0;
    out.set(literals, 1);
    return out;
  }
  if (size <= 4095) {
    const out = new Uint8Array(2 + size);
    out[0] = (size & 15) << 4 | 1 << 2;
    out[1] = size >>> 4 & 255;
    out.set(literals, 2);
    return out;
  }
  if (size <= 1048575) {
    const out = new Uint8Array(3 + size);
    out[0] = (size & 15) << 4 | 3 << 2;
    out[1] = size >>> 4 & 255;
    out[2] = size >>> 12 & 255;
    out.set(literals, 3);
    return out;
  }
  return null;
}
function buildRLELiteralsSection(literals) {
  if (literals.length === 0)
    return null;
  const value = literals[0] ?? 0;
  for (let i = 1; i < literals.length; i++) {
    if ((literals[i] ?? 0) !== value)
      return null;
  }
  const size = literals.length;
  if (size <= 31) {
    return new Uint8Array([size << 3 | 1, value]);
  }
  if (size <= 4095) {
    return new Uint8Array([(size & 15) << 4 | 1 << 2 | 1, size >>> 4 & 255, value]);
  }
  if (size <= 1048575) {
    return new Uint8Array([(size & 15) << 4 | 3 << 2 | 1, size >>> 4 & 255, size >>> 12 & 255, value]);
  }
  return null;
}
function buildHuffmanDepths(freq) {
  const nodes = [];
  const active = [];
  for (let s = 0; s < freq.length; s++) {
    const f = freq[s] ?? 0;
    if (f > 0) {
      nodes.push({ freq: f, symbol: s, left: -1, right: -1 });
      active.push(nodes.length - 1);
    }
  }
  if (active.length < 2)
    return null;
  while (active.length > 1) {
    active.sort((a, b) => {
      const fa = nodes[a]?.freq ?? 0;
      const fb = nodes[b]?.freq ?? 0;
      if (fa !== fb)
        return fa - fb;
      return (nodes[a]?.symbol ?? 0) - (nodes[b]?.symbol ?? 0);
    });
    const leftIdx = active.shift();
    const rightIdx = active.shift();
    if (leftIdx === void 0 || rightIdx === void 0)
      return null;
    const merged = {
      freq: (nodes[leftIdx]?.freq ?? 0) + (nodes[rightIdx]?.freq ?? 0),
      symbol: Math.min(nodes[leftIdx]?.symbol ?? 0, nodes[rightIdx]?.symbol ?? 0),
      left: leftIdx,
      right: rightIdx
    };
    nodes.push(merged);
    active.push(nodes.length - 1);
  }
  const root = active[0];
  if (root === void 0)
    return null;
  const depths = new Uint8Array(freq.length);
  const stack = [{ idx: root, depth: 0 }];
  while (stack.length > 0) {
    const cur = stack.pop();
    if (!cur)
      break;
    const node = nodes[cur.idx];
    if (!node)
      return null;
    if (node.left < 0 && node.right < 0) {
      depths[node.symbol] = cur.depth === 0 ? 1 : cur.depth;
      continue;
    }
    if (node.left >= 0)
      stack.push({ idx: node.left, depth: cur.depth + 1 });
    if (node.right >= 0)
      stack.push({ idx: node.right, depth: cur.depth + 1 });
  }
  return depths;
}
function buildFrequencyHuffmanTable(literals) {
  if (literals.length < 8)
    return null;
  let maxSymbol = 0;
  const freq = new Uint32Array(256);
  for (let i = 0; i < literals.length; i++) {
    const b = literals[i] ?? 0;
    freq[b] = (freq[b] ?? 0) + 1;
    if (b > maxSymbol)
      maxSymbol = b;
  }
  let weights;
  let maxNumBits = 0;
  const fullWeights = new Array(256).fill(0);
  if (maxSymbol < 255) {
    const freqWithPseudo = new Uint32Array(257);
    freqWithPseudo.set(freq, 0);
    const pseudoSymbol = maxSymbol + 1;
    freqWithPseudo[pseudoSymbol] = 1;
    const depths = buildHuffmanDepths(freqWithPseudo);
    if (!depths)
      return null;
    let maxDepth = 0;
    for (let s = 0; s <= pseudoSymbol; s++) {
      const d = depths[s] ?? 0;
      if (d > maxDepth)
        maxDepth = d;
    }
    if (maxDepth <= 0 || maxDepth > 11)
      return null;
    maxNumBits = maxDepth;
    weights = new Array(maxSymbol + 1).fill(0);
    for (let s = 0; s <= maxSymbol; s++) {
      const d = depths[s] ?? 0;
      if (d > 0)
        weights[s] = maxDepth + 1 - d;
    }
    for (let i = 0; i < weights.length; i++)
      fullWeights[i] = weights[i] ?? 0;
    const pseudoDepth = depths[pseudoSymbol] ?? 0;
    if (pseudoDepth <= 0)
      return null;
    fullWeights[pseudoSymbol] = maxDepth + 1 - pseudoDepth;
  } else {
    const depths = buildHuffmanDepths(freq);
    if (!depths)
      return null;
    let maxDepth = 0;
    for (let s = 0; s < 256; s++) {
      const d = depths[s] ?? 0;
      if (d > maxDepth)
        maxDepth = d;
    }
    if (maxDepth <= 0 || maxDepth > 11)
      return null;
    maxNumBits = maxDepth;
    weights = new Array(255).fill(0);
    for (let s = 0; s < 256; s++) {
      const d = depths[s] ?? 0;
      if (d > 0)
        fullWeights[s] = maxDepth + 1 - d;
    }
    if ((fullWeights[255] ?? 0) <= 0)
      return null;
    for (let s = 0; s < 255; s++) {
      weights[s] = fullWeights[s] ?? 0;
    }
  }
  if (maxNumBits <= 0)
    return null;
  const numBits = weightsToNumBits(fullWeights, maxNumBits);
  const decodeTable = buildHuffmanDecodeTable(numBits, maxNumBits);
  const codeBySymbol = new Int32Array(256).fill(-1);
  const numBitsBySymbol = new Uint8Array(256);
  for (let i = 0; i < decodeTable.length; i++) {
    const bits = decodeTable.numBits[i];
    if (bits === 0)
      continue;
    const symbol = decodeTable.symbol[i] >>> 0;
    if (symbol >= codeBySymbol.length)
      return null;
    if ((codeBySymbol[symbol] ?? -1) < 0) {
      codeBySymbol[symbol] = i >>> maxNumBits - bits;
      numBitsBySymbol[symbol] = bits;
    }
  }
  for (let i = 0; i < literals.length; i++) {
    const sym = literals[i] ?? 0;
    if ((codeBySymbol[sym] ?? -1) < 0 || (numBitsBySymbol[sym] ?? 0) === 0)
      return null;
  }
  return { weights, table: { maxNumBits, codeBySymbol, numBitsBySymbol } };
}
function encodeLiteralsWithTable(table, literals, reverseBitWriter) {
  const scratch = ensureLiteralBitScratch(literals.length);
  const bitCounts = scratch.counts.subarray(0, literals.length);
  const bitValues = scratch.values.subarray(0, literals.length);
  for (let i = 0; i < literals.length; i++) {
    const sym = literals[i] ?? 0;
    const bits = table.numBitsBySymbol[sym] ?? 0;
    const code = table.codeBySymbol[sym] ?? -1;
    if (bits <= 0 || code < 0)
      return null;
    bitCounts[i] = bits;
    bitValues[i] = code;
  }
  return encodeReverseBitstream(bitCounts, bitValues, reverseBitWriter);
}
function splitLiteralsInto4(literals) {
  const total = literals.length;
  const s1Len = Math.floor((total + 3) / 4);
  const s2Len = Math.floor((total + 2) / 4);
  const s3Len = Math.floor((total + 1) / 4);
  const s4Len = total - s1Len - s2Len - s3Len;
  const s1 = literals.subarray(0, s1Len);
  const s2 = literals.subarray(s1Len, s1Len + s2Len);
  const s3 = literals.subarray(s1Len + s2Len, s1Len + s2Len + s3Len);
  const s4 = literals.subarray(s1Len + s2Len + s3Len, s1Len + s2Len + s3Len + s4Len);
  return [s1, s2, s3, s4];
}
function buildFSEUpdatePath(table, updateSymbols, requiredFinalSymbol) {
  const tableSize = table.length;
  if (tableSize <= 0)
    return null;
  if (updateSymbols.length === 0) {
    if (requiredFinalSymbol === null)
      return null;
    for (let state2 = 0; state2 < tableSize; state2++) {
      if ((table.symbol[state2] ?? -1) === requiredFinalSymbol) {
        return { states: [], updateBits: [], startState: state2 };
      }
    }
    return null;
  }
  const rowCount = updateSymbols.length;
  const reachable = new Uint8Array((rowCount + 1) * tableSize);
  const nextChoice = new Int32Array(rowCount * tableSize);
  nextChoice.fill(-1);
  const rowOffset = (rowIndex) => rowIndex * tableSize;
  const finalRowOffset = rowOffset(rowCount);
  for (let state2 = 0; state2 < tableSize; state2++) {
    if (requiredFinalSymbol === null || (table.symbol[state2] ?? -1) === requiredFinalSymbol) {
      reachable[finalRowOffset + state2] = 1;
    }
  }
  for (let row = rowCount - 1; row >= 0; row--) {
    const symbol = updateSymbols[row] ?? -1;
    if (symbol < 0 || symbol > WEIGHT_MAX_SYMBOL)
      return null;
    const curOffset = rowOffset(row);
    const nextOffset = rowOffset(row + 1);
    let anyReachable = false;
    for (let state2 = 0; state2 < tableSize; state2++) {
      if ((table.symbol[state2] ?? -1) !== symbol)
        continue;
      const baseline = table.baseline[state2] ?? 0;
      const bits = table.numBits[state2] ?? 0;
      const width = bits > 0 ? 1 << bits : 1;
      let minNext = baseline;
      let maxNext = baseline + width - 1;
      if (minNext < 0)
        minNext = 0;
      if (maxNext >= tableSize)
        maxNext = tableSize - 1;
      for (let next = minNext; next <= maxNext; next++) {
        if (reachable[nextOffset + next] === 0)
          continue;
        reachable[curOffset + state2] = 1;
        nextChoice[curOffset + state2] = next;
        anyReachable = true;
        break;
      }
    }
    if (!anyReachable)
      return null;
  }
  const startOffset = rowOffset(0);
  let startState = -1;
  for (let state2 = 0; state2 < tableSize; state2++) {
    if (reachable[startOffset + state2] !== 0) {
      startState = state2;
      break;
    }
  }
  if (startState < 0)
    return null;
  const states = new Array(rowCount);
  const updateBits = new Array(rowCount);
  let state = startState;
  for (let row = 0; row < rowCount; row++) {
    states[row] = state;
    const next = nextChoice[rowOffset(row) + state] ?? -1;
    if (next < 0)
      return null;
    updateBits[row] = next - (table.baseline[state] ?? 0);
    state = next;
  }
  return { states, updateBits, startState };
}
function buildCompressedLiteralsHeader(blockType, sizeFormat, regeneratedSize, compressedSize) {
  const bits = sizeFormat <= 1 ? 10 : sizeFormat === 2 ? 14 : 18;
  const writer = new BitWriter();
  writer.writeBits(2, blockType);
  writer.writeBits(2, sizeFormat);
  writer.writeBits(bits, regeneratedSize);
  writer.writeBits(bits, compressedSize);
  return writer.flush();
}
function makeCompressedSection(literals, table, blockType, treeBytes, reverseBitWriter) {
  const oneStream = encodeLiteralsWithTable(table, literals, reverseBitWriter);
  let bestPayload = null;
  let bestSizeFormat = null;
  if (oneStream) {
    const compressedSize = treeBytes.length + oneStream.length;
    if (literals.length <= 1023 && compressedSize <= 1023) {
      bestPayload = new Uint8Array(treeBytes.length + oneStream.length);
      bestPayload.set(treeBytes, 0);
      bestPayload.set(oneStream, treeBytes.length);
      bestSizeFormat = 0;
    }
  }
  if (literals.length >= 16) {
    const [s1, s2, s3, s4] = splitLiteralsInto4(literals);
    const e1 = encodeLiteralsWithTable(table, s1, reverseBitWriter);
    const e2 = encodeLiteralsWithTable(table, s2, reverseBitWriter);
    const e3 = encodeLiteralsWithTable(table, s3, reverseBitWriter);
    const e4 = encodeLiteralsWithTable(table, s4, reverseBitWriter);
    if (e1 && e2 && e3 && e4 && e1.length <= 65535 && e2.length <= 65535 && e3.length <= 65535) {
      const streamsSize = 6 + e1.length + e2.length + e3.length + e4.length;
      const compressedSize = treeBytes.length + streamsSize;
      let sizeFormat = null;
      if (literals.length <= 1023 && compressedSize <= 1023) {
        sizeFormat = 1;
      } else if (literals.length <= 16383 && compressedSize <= 16383) {
        sizeFormat = 2;
      } else if (literals.length <= 262143 && compressedSize <= 262143) {
        sizeFormat = 3;
      }
      if (sizeFormat !== null) {
        const payload = new Uint8Array(treeBytes.length + streamsSize);
        payload.set(treeBytes, 0);
        let pos = treeBytes.length;
        payload[pos++] = e1.length & 255;
        payload[pos++] = e1.length >>> 8 & 255;
        payload[pos++] = e2.length & 255;
        payload[pos++] = e2.length >>> 8 & 255;
        payload[pos++] = e3.length & 255;
        payload[pos++] = e3.length >>> 8 & 255;
        payload.set(e1, pos);
        pos += e1.length;
        payload.set(e2, pos);
        pos += e2.length;
        payload.set(e3, pos);
        pos += e3.length;
        payload.set(e4, pos);
        if (!bestPayload || payload.length < bestPayload.length) {
          bestPayload = payload;
          bestSizeFormat = sizeFormat;
        }
      }
    }
  }
  if (!bestPayload || bestSizeFormat === null)
    return null;
  const header = buildCompressedLiteralsHeader(blockType, bestSizeFormat, literals.length, bestPayload.length);
  const out = new Uint8Array(header.length + bestPayload.length);
  out.set(header, 0);
  out.set(bestPayload, header.length);
  return out;
}
function createDirectWeightsTreeBytes(weights) {
  if (weights.length < 1 || weights.length > 128)
    return null;
  const tree = new Uint8Array(1 + Math.ceil(weights.length / 2));
  tree[0] = 127 + weights.length;
  for (let i = 0; i < weights.length; i += 2) {
    const hi = weights[i] ?? 0;
    const lo = weights[i + 1] ?? 0;
    tree[1 + (i >>> 1)] = (hi & 15) << 4 | lo & 15;
  }
  return tree;
}
function createFSEWeightsTreeBytes(weights) {
  if (weights.length < 2 || weights.length > 255)
    return null;
  let maxWeight = 0;
  for (let i = 0; i < weights.length; i++) {
    const value = weights[i] ?? 0;
    if (value < 0 || value > WEIGHT_MAX_SYMBOL)
      return null;
    if (value > maxWeight)
      maxWeight = value;
  }
  const histogram = new Array(maxWeight + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    const value = weights[i] ?? 0;
    histogram[value] = (histogram[value] ?? 0) + 1;
  }
  const stream1 = [];
  const stream2 = [];
  for (let i = 0; i < weights.length; i++) {
    if ((i & 1) === 0)
      stream1.push(weights[i] ?? 0);
    else
      stream2.push(weights[i] ?? 0);
  }
  const tailOnStream1 = (weights.length & 1) === 1;
  const stream1Updates = tailOnStream1 ? stream1.slice(0, -1) : stream1.slice();
  const stream2Updates = tailOnStream1 ? stream2.slice() : stream2.slice(0, -1);
  const stream1Tail = tailOnStream1 ? stream1[stream1.length - 1] ?? null : null;
  const stream2Tail = tailOnStream1 ? null : stream2[stream2.length - 1] ?? null;
  const updateCount = weights.length - 1;
  const usedSymbols = [];
  for (let symbol = 0; symbol < histogram.length; symbol++) {
    if ((histogram[symbol] ?? 0) > 0)
      usedSymbols.push(symbol);
  }
  if (usedSymbols.length === 0)
    return null;
  for (let tableLog = WEIGHT_MAX_TABLE_LOG; tableLog >= 5; tableLog--) {
    const normalizedCandidates = [];
    normalizedCandidates.push(normalizeCountsForTable(histogram, tableLog));
    const tableSize = 1 << tableLog;
    if (usedSymbols.length <= tableSize) {
      const uniform = new Array(maxWeight + 1).fill(0);
      for (let i = 0; i < usedSymbols.length; i++) {
        const symbol = usedSymbols[i] ?? -1;
        if (symbol >= 0)
          uniform[symbol] = 1;
      }
      let remaining = tableSize - usedSymbols.length;
      let cursor = 0;
      while (remaining > 0) {
        const symbol = usedSymbols[cursor % usedSymbols.length] ?? -1;
        if (symbol >= 0)
          uniform[symbol] = (uniform[symbol] ?? 0) + 1;
        remaining--;
        cursor++;
      }
      normalizedCandidates.push({ normalizedCounter: uniform, maxSymbolValue: maxWeight });
    }
    for (const normalized of normalizedCandidates) {
      const header = writeNCount(normalized.normalizedCounter, normalized.maxSymbolValue, tableLog);
      const parsed = readNCount(header, 0, WEIGHT_MAX_SYMBOL, WEIGHT_MAX_TABLE_LOG);
      const table = buildFSEDecodeTable(parsed.normalizedCounter, parsed.tableLog);
      const path1 = buildFSEUpdatePath(table, stream1Updates, stream1Tail);
      if (!path1)
        continue;
      const path22 = buildFSEUpdatePath(table, stream2Updates, stream2Tail);
      if (!path22)
        continue;
      const readCounts = new Uint8Array(2 + updateCount);
      const readValues = new Uint32Array(2 + updateCount);
      let readPos = 0;
      readCounts[readPos] = parsed.tableLog;
      readValues[readPos++] = path1.startState;
      readCounts[readPos] = parsed.tableLog;
      readValues[readPos++] = path22.startState;
      let stream1Pos = 0;
      let stream2Pos = 0;
      for (let i = 0; i < updateCount; i++) {
        if ((i & 1) === 0) {
          const state = path1.states[stream1Pos] ?? -1;
          if (state < 0)
            return null;
          readCounts[readPos] = table.numBits[state] ?? 0;
          readValues[readPos++] = path1.updateBits[stream1Pos] ?? 0;
          stream1Pos++;
        } else {
          const state = path22.states[stream2Pos] ?? -1;
          if (state < 0)
            return null;
          readCounts[readPos] = table.numBits[state] ?? 0;
          readValues[readPos++] = path22.updateBits[stream2Pos] ?? 0;
          stream2Pos++;
        }
      }
      const bitstream = encodeReverseBitstream(readCounts, readValues, new ReverseBitWriter());
      const bodySize = header.length + bitstream.length;
      if (bodySize <= 0 || bodySize >= 128)
        continue;
      const tree = new Uint8Array(1 + bodySize);
      tree[0] = bodySize;
      tree.set(header, 1);
      tree.set(bitstream, 1 + header.length);
      const roundTrip = readWeightsFSE(tree, 1, bodySize).weights;
      if (roundTrip.length !== weights.length)
        continue;
      let mismatch = false;
      for (let i = 0; i < weights.length; i++) {
        if ((roundTrip[i] ?? -1) !== (weights[i] ?? -1)) {
          mismatch = true;
          break;
        }
      }
      if (mismatch)
        continue;
      return tree;
    }
  }
  return null;
}
function createWeightsTreeBytes(weights) {
  return createDirectWeightsTreeBytes(weights) ?? createFSEWeightsTreeBytes(weights);
}
function canEncodeTreeless(table, literals) {
  for (let i = 0; i < literals.length; i++) {
    const sym = literals[i] ?? 0;
    if ((table.codeBySymbol[sym] ?? -1) < 0 || (table.numBitsBySymbol[sym] ?? 0) === 0)
      return false;
  }
  return true;
}
function encodeLiteralsSection(literals, context, reverseBitWriter = new ReverseBitWriter()) {
  const raw = buildRawLiteralsSection(literals);
  if (!raw)
    return null;
  let bestSection = raw;
  let bestTable = context?.prevTable ?? null;
  const rle = buildRLELiteralsSection(literals);
  if (rle && rle.length < bestSection.length) {
    bestSection = rle;
  }
  const huffman = buildFrequencyHuffmanTable(literals);
  if (huffman) {
    const treeBytes = createWeightsTreeBytes(huffman.weights);
    if (treeBytes) {
      const compressed = makeCompressedSection(literals, huffman.table, 2, treeBytes, reverseBitWriter);
      if (compressed && compressed.length < bestSection.length) {
        bestSection = compressed;
        bestTable = huffman.table;
      }
    }
  }
  const prev = context?.prevTable ?? null;
  if (prev && canEncodeTreeless(prev, literals)) {
    const treeless = makeCompressedSection(literals, prev, 3, new Uint8Array(0), reverseBitWriter);
    if (treeless && treeless.length < bestSection.length) {
      bestSection = treeless;
      bestTable = prev;
    }
  }
  return { section: bestSection, table: bestTable };
}

// node_modules/zstdify/dist/encode/compressedBlock.js
var cachedLLTable = null;
var cachedOFTable = null;
var cachedMLTable = null;
function getPredefinedFSETables() {
  if (!cachedLLTable) {
    cachedLLTable = buildFSEDecodeTable(LITERALS_LENGTH_DEFAULT_DISTRIBUTION, LITERALS_LENGTH_TABLE_LOG);
    cachedOFTable = buildFSEDecodeTable(OFFSET_CODE_DEFAULT_DISTRIBUTION, OFFSET_CODE_TABLE_LOG);
    cachedMLTable = buildFSEDecodeTable(MATCH_LENGTH_DEFAULT_DISTRIBUTION, MATCH_LENGTH_TABLE_LOG);
  }
  return { ll: cachedLLTable, of: cachedOFTable, ml: cachedMLTable };
}
var LL_BASELINE = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  16,
  18,
  20,
  22,
  24,
  28,
  32,
  40,
  48,
  64,
  128,
  256,
  512,
  1024,
  2048,
  4096,
  8192,
  16384,
  32768,
  65536
];
var LL_NUMBITS = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16
];
var ML_BASELINE = [
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  37,
  39,
  41,
  43,
  47,
  51,
  59,
  67,
  83,
  99,
  131,
  259,
  515,
  1027,
  2051,
  4099,
  8195,
  16387,
  32771,
  65539
];
var ML_NUMBITS = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16
];
function writeU24LE2(arr, offset, value) {
  arr[offset] = value & 255;
  arr[offset + 1] = value >> 8 & 255;
  arr[offset + 2] = value >> 16 & 255;
}
var pathTableCache = /* @__PURE__ */ new WeakMap();
var sequenceReadCountsScratch = null;
var sequenceReadValuesScratch = null;
function getPrecomputedPathTable(table) {
  const cached = pathTableCache.get(table);
  if (cached)
    return cached;
  const tableSize = table.length;
  const wordCount = Math.max(1, Math.ceil(tableSize / 32));
  const baselineByState = new Int32Array(tableSize);
  const minNextByState = new Int32Array(tableSize);
  const maxNextByState = new Int32Array(tableSize);
  let maxSymbol = -1;
  for (let s = 0; s < tableSize; s++) {
    const baseline = table.baseline[s];
    const bits = table.numBits[s];
    baselineByState[s] = baseline;
    const width = bits > 0 ? 1 << bits : 1;
    const minNext = baseline;
    const maxNext = baseline + width - 1;
    minNextByState[s] = minNext < 0 ? 0 : minNext;
    maxNextByState[s] = maxNext >= tableSize ? tableSize - 1 : maxNext;
    const symbol = table.symbol[s];
    if (symbol > maxSymbol)
      maxSymbol = symbol;
  }
  const statesBySymbol = Array.from({ length: maxSymbol + 1 }, () => []);
  const symbolMasks = Array.from({ length: maxSymbol + 1 }, () => new Uint32Array(wordCount));
  const bitTotalsBySymbol = new Float64Array(maxSymbol + 1);
  const stateCountsBySymbol = new Uint32Array(maxSymbol + 1);
  for (let s = 0; s < tableSize; s++) {
    const sym = table.symbol[s];
    const stateList = statesBySymbol[sym];
    const stateMask = symbolMasks[sym];
    if (!stateList || !stateMask)
      continue;
    stateList.push(s);
    stateMask[s >>> 5] = (stateMask[s >>> 5] | 1 << (s & 31)) >>> 0;
    bitTotalsBySymbol[sym] = (bitTotalsBySymbol[sym] ?? 0) + (table.numBits[s] ?? 0);
    stateCountsBySymbol[sym] = (stateCountsBySymbol[sym] ?? 0) + 1;
  }
  const avgBitsBySymbol = new Float64Array(maxSymbol + 1);
  for (let sym = 0; sym < avgBitsBySymbol.length; sym++) {
    const count = stateCountsBySymbol[sym] ?? 0;
    avgBitsBySymbol[sym] = count > 0 ? (bitTotalsBySymbol[sym] ?? 0) / count : Number.POSITIVE_INFINITY;
  }
  const precomputed = {
    tableSize,
    wordCount,
    statesBySymbol,
    symbolMasks,
    avgBitsBySymbol,
    baselineByState,
    minNextByState,
    maxNextByState
  };
  pathTableCache.set(table, precomputed);
  return precomputed;
}
function getSequenceReadCountsScratch(requiredLength) {
  if (!sequenceReadCountsScratch || sequenceReadCountsScratch.length < requiredLength) {
    sequenceReadCountsScratch = new Uint8Array(requiredLength);
  }
  return sequenceReadCountsScratch;
}
function getSequenceReadValuesScratch(requiredLength) {
  if (!sequenceReadValuesScratch || sequenceReadValuesScratch.length < requiredLength) {
    sequenceReadValuesScratch = new Uint32Array(requiredLength);
  }
  return sequenceReadValuesScratch;
}
function findLengthCode(value, baseline, extraBits, directMax, directBias) {
  if (value <= directMax) {
    const code = value - directBias;
    if (code < 0)
      return null;
    return { code, extra: 0, extraN: 0 };
  }
  for (let code = 0; code < baseline.length; code++) {
    const base = baseline[code] ?? 0;
    const n = extraBits[code] ?? 0;
    if (value >= base && value < base + (1 << n)) {
      return { code, extra: value - base, extraN: n };
    }
  }
  return null;
}
function encodeNumSequences(numSequences) {
  if (numSequences < 0 || numSequences > 65535 + 32512)
    return null;
  if (numSequences < 128) {
    return new Uint8Array([numSequences & 255]);
  }
  if (numSequences < 32512) {
    const hi = (numSequences >>> 8 & 127) + 128;
    const lo = numSequences & 255;
    return new Uint8Array([hi, lo]);
  }
  const value = numSequences - 32512;
  return new Uint8Array([255, value & 255, value >>> 8 & 255]);
}
function buildStatePath(codes, table) {
  if (codes.length === 0)
    return { states: [], updateBits: [] };
  const pre = getPrecomputedPathTable(table);
  const { tableSize, statesBySymbol, baselineByState } = pre;
  if (tableSize <= 0)
    return null;
  const rowCount = codes.length;
  const reachable = new Uint8Array(rowCount * tableSize);
  const nextChoice = new Int32Array(Math.max(0, rowCount - 1) * tableSize);
  nextChoice.fill(-1);
  const rowOffset = (rowIndex) => rowIndex * tableSize;
  const lastCode = codes[rowCount - 1] ?? -1;
  if (lastCode < 0 || lastCode >= statesBySymbol.length)
    return null;
  const lastStates = statesBySymbol[lastCode];
  if (!lastStates || lastStates.length === 0)
    return null;
  const lastRowOffset = rowOffset(rowCount - 1);
  for (let i = 0; i < lastStates.length; i++) {
    const state2 = lastStates[i];
    if (state2 !== void 0)
      reachable[lastRowOffset + state2] = 1;
  }
  for (let row = rowCount - 2; row >= 0; row--) {
    const code = codes[row] ?? -1;
    if (code < 0 || code >= statesBySymbol.length)
      return null;
    const candidateStates = statesBySymbol[code];
    if (!candidateStates || candidateStates.length === 0)
      return null;
    const curRowOffset = rowOffset(row);
    const nextRowOffset = rowOffset(row + 1);
    let anyReachable = false;
    for (let i = 0; i < candidateStates.length; i++) {
      const state2 = candidateStates[i];
      if (state2 === void 0)
        continue;
      const baseline = table.baseline[state2];
      const bits = table.numBits[state2];
      const width = bits > 0 ? 1 << bits : 1;
      let minNext = baseline;
      let maxNext = baseline + width - 1;
      if (minNext < 0)
        minNext = 0;
      if (maxNext >= tableSize)
        maxNext = tableSize - 1;
      for (let next = minNext; next <= maxNext; next++) {
        if (reachable[nextRowOffset + next] === 0)
          continue;
        reachable[curRowOffset + state2] = 1;
        nextChoice[curRowOffset + state2] = next;
        anyReachable = true;
        break;
      }
    }
    if (!anyReachable)
      return null;
  }
  const firstCode = codes[0] ?? -1;
  if (firstCode < 0 || firstCode >= statesBySymbol.length)
    return null;
  const firstStates = statesBySymbol[firstCode];
  if (!firstStates || firstStates.length === 0)
    return null;
  const firstRowOffset = rowOffset(0);
  let startState = -1;
  for (let i = 0; i < firstStates.length; i++) {
    const state2 = firstStates[i];
    if (state2 !== void 0 && reachable[firstRowOffset + state2] !== 0) {
      startState = state2;
      break;
    }
  }
  if (startState < 0)
    return null;
  const states = new Array(rowCount);
  const updateBits = new Array(Math.max(0, rowCount - 1));
  states[0] = startState;
  let state = startState;
  for (let row = 0; row < rowCount - 1; row++) {
    const choice = nextChoice[rowOffset(row) + state] ?? -1;
    if (choice < 0)
      return null;
    states[row + 1] = choice;
    updateBits[row] = choice - baselineByState[state];
    state = choice;
  }
  return { states, updateBits };
}
var symbolizedScratch = null;
function ensureSymbolizedScratch(minLength) {
  const existing = symbolizedScratch;
  if (existing && existing.llCodes.length >= minLength) {
    return existing;
  }
  let capacity = existing?.llCodes.length ?? 0;
  if (capacity === 0)
    capacity = 32;
  while (capacity < minLength)
    capacity *= 2;
  symbolizedScratch = {
    llCodes: new Uint8Array(capacity),
    llExtraN: new Uint8Array(capacity),
    llExtraValue: new Uint32Array(capacity),
    mlCodes: new Uint8Array(capacity),
    mlExtraN: new Uint8Array(capacity),
    mlExtraValue: new Uint32Array(capacity),
    ofCodes: new Uint8Array(capacity),
    ofExtraN: new Uint8Array(capacity),
    ofExtraValue: new Uint32Array(capacity)
  };
  return symbolizedScratch;
}
function symbolRange(codes) {
  let max = 0;
  for (let i = 0; i < codes.length; i++) {
    const value = codes[i] ?? 0;
    if (value > max)
      max = value;
  }
  return max + 1;
}
function buildHistogram(codes, alphabetSize) {
  const out = new Uint32Array(alphabetSize);
  for (let i = 0; i < codes.length; i++) {
    const c = codes[i] ?? 0;
    if (c < 0 || c >= alphabetSize)
      continue;
    out[c] = (out[c] ?? 0) + 1;
  }
  return out;
}
function scorePath(path4, table, tableLog) {
  if (path4.states.length === 0)
    return 0;
  let bits = tableLog;
  for (let i = 0; i < path4.states.length - 1; i++) {
    const state = path4.states[i] ?? -1;
    if (state < 0 || state >= table.length)
      return Number.POSITIVE_INFINITY;
    bits += table.numBits[state];
  }
  return bits;
}
function estimatePathBitsFromHistogram(histogram, table, tableLog, extraHeaderBits) {
  const pre = getPrecomputedPathTable(table);
  const avgBits = pre.avgBitsBySymbol;
  let bits = tableLog + extraHeaderBits;
  for (let sym = 0; sym < histogram.length; sym++) {
    const freq = histogram[sym] ?? 0;
    if (freq <= 0)
      continue;
    const avg = avgBits[sym] ?? Number.POSITIVE_INFINITY;
    if (!Number.isFinite(avg)) {
      return Number.POSITIVE_INFINITY;
    }
    bits += avg * freq;
  }
  return bits;
}
var normalizedTableCache = /* @__PURE__ */ new Map();
function hashHistogram(histogram) {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < histogram.length; i++) {
    hash ^= histogram[i] ?? 0;
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}
function histogramsEqual(a, b) {
  if (a.length !== b.length)
    return false;
  for (let i = 0; i < a.length; i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0))
      return false;
  }
  return true;
}
function getNormalizedTableCandidates(codes, maxTableLog, decodeMaxSymbolValue) {
  const alphabetSize = symbolRange(codes);
  if (alphabetSize <= 0)
    return [];
  const histogram = buildHistogram(codes, alphabetSize);
  let distinct = 0;
  for (let i = 0; i < histogram.length; i++) {
    if ((histogram[i] ?? 0) > 0)
      distinct++;
  }
  if (distinct <= 1)
    return [];
  let minTableLog = 5;
  while (1 << minTableLog < distinct && minTableLog < maxTableLog)
    minTableLog++;
  if (1 << minTableLog < distinct)
    return [];
  const maxLogFromSamples = codes.length > 1 ? 31 - Math.clz32(codes.length - 1) : 5;
  const limit = Math.max(minTableLog, Math.min(maxTableLog, maxLogFromSamples + 1));
  const results = [];
  const histogramHash = hashHistogram(histogram);
  for (let tableLog = minTableLog; tableLog <= limit; tableLog++) {
    const key = `${tableLog}:${alphabetSize}:${histogramHash}`;
    const cachedBucket = normalizedTableCache.get(key);
    if (cachedBucket) {
      let matched = false;
      for (const cached of cachedBucket) {
        if (histogramsEqual(cached.histogram, histogram)) {
          results.push(cached);
          matched = true;
          break;
        }
      }
      if (matched)
        continue;
    }
    const { normalizedCounter, maxSymbolValue: normalizedMaxSymbolValue } = normalizeCountsForTable(Array.from(histogram), tableLog);
    const header = writeNCount(normalizedCounter, normalizedMaxSymbolValue, tableLog);
    const parsed = readNCount(header, 0, decodeMaxSymbolValue, maxTableLog);
    const table = buildFSEDecodeTable(parsed.normalizedCounter, parsed.tableLog);
    const out = {
      histogram: histogram.slice(0),
      table,
      tableLog: parsed.tableLog,
      header
    };
    if (!cachedBucket) {
      normalizedTableCache.set(key, [out]);
    } else {
      cachedBucket.push(out);
    }
    results.push(out);
  }
  return results;
}
function getTableMaxSymbol(table) {
  let max = 0;
  for (let i = 0; i < table.length; i++) {
    const symbol = table.symbol[i] ?? 0;
    if (symbol > max)
      max = symbol;
  }
  return max;
}
function symbolizedSequences(sequences) {
  if (sequences.length === 0)
    return null;
  const numSequences = sequences.length;
  const scratch = ensureSymbolizedScratch(numSequences);
  const llCodes = scratch.llCodes.subarray(0, numSequences);
  const llExtraN = scratch.llExtraN.subarray(0, numSequences);
  const llExtraValue = scratch.llExtraValue.subarray(0, numSequences);
  const mlCodes = scratch.mlCodes.subarray(0, numSequences);
  const mlExtraN = scratch.mlExtraN.subarray(0, numSequences);
  const mlExtraValue = scratch.mlExtraValue.subarray(0, numSequences);
  const ofCodes = scratch.ofCodes.subarray(0, numSequences);
  const ofExtraN = scratch.ofExtraN.subarray(0, numSequences);
  const ofExtraValue = scratch.ofExtraValue.subarray(0, numSequences);
  for (let i = 0; i < numSequences; i++) {
    const sequence = sequences[i];
    const ll = findLengthCode(sequence.literalsLength, LL_BASELINE, LL_NUMBITS, 15, 0);
    const ml = findLengthCode(sequence.matchLength, ML_BASELINE, ML_NUMBITS, 34, 3);
    if (!ll || !ml)
      return null;
    const offsetValue = sequence.offset;
    if (offsetValue < 1)
      return null;
    const ofCode = 31 - Math.clz32(offsetValue);
    if (ofCode < 0 || ofCode > 28)
      return null;
    const ofEx = offsetValue - (1 << ofCode);
    llCodes[i] = ll.code;
    llExtraN[i] = ll.extraN;
    llExtraValue[i] = ll.extra;
    mlCodes[i] = ml.code;
    mlExtraN[i] = ml.extraN;
    mlExtraValue[i] = ml.extra;
    ofCodes[i] = ofCode;
    ofExtraN[i] = ofCode;
    ofExtraValue[i] = ofEx;
  }
  return { llCodes, llExtraN, llExtraValue, mlCodes, mlExtraN, mlExtraValue, ofCodes, ofExtraN, ofExtraValue };
}
function chooseStreamMode(codes, predefinedTable, predefinedTableLog, maxTableLog, prevTable, prevTableLog) {
  const alphabetSize = symbolRange(codes);
  const histogram = alphabetSize > 0 ? buildHistogram(codes, alphabetSize) : new Uint32Array(0);
  const predefinedPath = buildStatePath(codes, predefinedTable);
  if (!predefinedPath)
    return null;
  let best = {
    mode: 0,
    table: predefinedTable,
    tableLog: predefinedTableLog,
    path: predefinedPath,
    tableHeader: new Uint8Array(0)
  };
  let bestScore = scorePath(predefinedPath, predefinedTable, predefinedTableLog);
  if (prevTable && prevTableLog !== null) {
    const repeatEstimate = estimatePathBitsFromHistogram(histogram, prevTable, prevTableLog, 0);
    if (repeatEstimate < bestScore + 16) {
      const repeatPath = buildStatePath(codes, prevTable);
      if (repeatPath) {
        const repeatScore = scorePath(repeatPath, prevTable, prevTableLog);
        if (repeatScore < bestScore) {
          best = {
            mode: 3,
            table: prevTable,
            tableLog: prevTableLog,
            path: repeatPath,
            tableHeader: new Uint8Array(0)
          };
          bestScore = repeatScore;
        }
      }
    }
  }
  const compressedCandidates = getNormalizedTableCandidates(codes, maxTableLog, getTableMaxSymbol(predefinedTable));
  if (compressedCandidates.length > 0) {
    const ranked = compressedCandidates.map((compressed) => ({
      compressed,
      estimate: estimatePathBitsFromHistogram(histogram, compressed.table, compressed.tableLog, compressed.header.length * 8)
    })).sort((a, b) => a.estimate - b.estimate);
    const evalCount = Math.min(2, ranked.length);
    for (let i = 0; i < evalCount; i++) {
      const candidate = ranked[i];
      if (!candidate || candidate.estimate >= bestScore + 16)
        continue;
      const compressedPath = buildStatePath(codes, candidate.compressed.table);
      if (compressedPath) {
        const compressedScore = scorePath(compressedPath, candidate.compressed.table, candidate.compressed.tableLog) + candidate.compressed.header.length * 8;
        if (compressedScore < bestScore) {
          best = {
            mode: 2,
            table: candidate.compressed.table,
            tableLog: candidate.compressed.tableLog,
            path: compressedPath,
            tableHeader: candidate.compressed.header
          };
          bestScore = compressedScore;
        }
      }
    }
  }
  return best;
}
function buildSequenceSection(sequences, context, reverseBitWriter = new ReverseBitWriter()) {
  const encoded = symbolizedSequences(sequences);
  if (!encoded)
    return null;
  const numSequences = sequences.length;
  const numSequencesBytes = encodeNumSequences(numSequences);
  if (!numSequencesBytes)
    return null;
  const { ll: llTable, of: ofTable, ml: mlTable } = getPredefinedFSETables();
  const llChoice = chooseStreamMode(encoded.llCodes, llTable, LITERALS_LENGTH_TABLE_LOG, 9, context?.prevTables?.llTable ?? null, context?.prevTables?.llTableLog ?? null);
  const ofChoice = chooseStreamMode(encoded.ofCodes, ofTable, OFFSET_CODE_TABLE_LOG, 8, context?.prevTables?.ofTable ?? null, context?.prevTables?.ofTableLog ?? null);
  const mlChoice = chooseStreamMode(encoded.mlCodes, mlTable, MATCH_LENGTH_TABLE_LOG, 9, context?.prevTables?.mlTable ?? null, context?.prevTables?.mlTableLog ?? null);
  if (!llChoice || !ofChoice || !mlChoice)
    return null;
  const chunkCount = numSequences * 6;
  const readCounts = getSequenceReadCountsScratch(chunkCount).subarray(0, chunkCount);
  const readValues = getSequenceReadValuesScratch(chunkCount).subarray(0, chunkCount);
  const llStates = llChoice.path.states;
  const llUpdates = llChoice.path.updateBits;
  const ofStates = ofChoice.path.states;
  const ofUpdates = ofChoice.path.updateBits;
  const mlStates = mlChoice.path.states;
  const mlUpdates = mlChoice.path.updateBits;
  const ofExtraN = encoded.ofExtraN;
  const ofExtraValue = encoded.ofExtraValue;
  const mlExtraN = encoded.mlExtraN;
  const mlExtraValue = encoded.mlExtraValue;
  const llExtraN = encoded.llExtraN;
  const llExtraValue = encoded.llExtraValue;
  let readPos = 0;
  readCounts[readPos] = llChoice.tableLog;
  readValues[readPos++] = llStates[0];
  readCounts[readPos] = ofChoice.tableLog;
  readValues[readPos++] = ofStates[0];
  readCounts[readPos] = mlChoice.tableLog;
  readValues[readPos++] = mlStates[0];
  for (let i = 0; i < numSequences; i++) {
    readCounts[readPos] = ofExtraN[i];
    readValues[readPos++] = ofExtraValue[i];
    readCounts[readPos] = mlExtraN[i];
    readValues[readPos++] = mlExtraValue[i];
    readCounts[readPos] = llExtraN[i];
    readValues[readPos++] = llExtraValue[i];
    if (i !== numSequences - 1) {
      const llState = llStates[i];
      const mlState = mlStates[i];
      const ofState = ofStates[i];
      if (llState < 0 || llState >= llChoice.table.length || mlState < 0 || mlState >= mlChoice.table.length || ofState < 0 || ofState >= ofChoice.table.length) {
        return null;
      }
      readCounts[readPos] = llChoice.table.numBits[llState];
      readValues[readPos++] = llUpdates[i];
      readCounts[readPos] = mlChoice.table.numBits[mlState];
      readValues[readPos++] = mlUpdates[i];
      readCounts[readPos] = ofChoice.table.numBits[ofState];
      readValues[readPos++] = ofUpdates[i];
    }
  }
  const bitstream = encodeReverseBitstream(readCounts, readValues, reverseBitWriter);
  const tableHeaderSize = llChoice.tableHeader.length + ofChoice.tableHeader.length + mlChoice.tableHeader.length;
  const out = new Uint8Array(numSequencesBytes.length + 1 + tableHeaderSize + bitstream.length);
  out.set(numSequencesBytes, 0);
  const modeByte = llChoice.mode << 6 | ofChoice.mode << 4 | mlChoice.mode << 2;
  out[numSequencesBytes.length] = modeByte & 255;
  let pos = numSequencesBytes.length + 1;
  out.set(llChoice.tableHeader, pos);
  pos += llChoice.tableHeader.length;
  out.set(ofChoice.tableHeader, pos);
  pos += ofChoice.tableHeader.length;
  out.set(mlChoice.tableHeader, pos);
  pos += mlChoice.tableHeader.length;
  out.set(bitstream, pos);
  return {
    section: out,
    tables: {
      llTable: llChoice.table,
      llTableLog: llChoice.tableLog,
      ofTable: ofChoice.table,
      ofTableLog: ofChoice.tableLog,
      mlTable: mlChoice.table,
      mlTableLog: mlChoice.tableLog
    }
  };
}
function buildCompressedBlockPayload(literals, sequences, context) {
  const reverseBitWriter = new ReverseBitWriter();
  const literalsContext = {
    prevTable: context?.prevLiteralsTable ?? null
  };
  const encodedLiterals = encodeLiteralsSection(literals, literalsContext, reverseBitWriter);
  if (!encodedLiterals)
    return null;
  const literalsSection = encodedLiterals.section;
  const seqSection = buildSequenceSection(sequences, context, reverseBitWriter);
  if (!seqSection)
    return null;
  const out = new Uint8Array(literalsSection.length + seqSection.section.length);
  out.set(literalsSection, 0);
  out.set(seqSection.section, literalsSection.length);
  if (context) {
    context.prevTables = seqSection.tables;
    context.prevLiteralsTable = encodedLiterals.table;
  }
  return out;
}
function writeCompressedBlock(payload, last) {
  const header = new Uint8Array(3);
  const blockHeader2 = (last ? 1 : 0) | 2 << 1 | payload.length << 3;
  writeU24LE2(header, 0, blockHeader2);
  const out = new Uint8Array(3 + payload.length);
  out.set(header, 0);
  out.set(payload, 3);
  return out;
}

// node_modules/zstdify/dist/encode/frameWriter.js
var ZSTD_MAGIC = 4247762216;
function writeDictionaryId(chunks, dictionaryId) {
  if (dictionaryId <= 255) {
    chunks.push(dictionaryId & 255);
    return;
  }
  if (dictionaryId <= 65535) {
    chunks.push(dictionaryId & 255, dictionaryId >>> 8 & 255);
    return;
  }
  chunks.push(dictionaryId & 255, dictionaryId >>> 8 & 255, dictionaryId >>> 16 & 255, dictionaryId >>> 24 & 255);
}
function writeFrameHeader(contentSize, hasChecksum, dictionaryId = null) {
  if (!Number.isInteger(contentSize) || contentSize < 0 || contentSize > 4294967295) {
    throw new ZstdError("contentSize must be a 32-bit non-negative integer", "parameter_unsupported");
  }
  const chunks = [];
  chunks.push(ZSTD_MAGIC & 255, ZSTD_MAGIC >> 8 & 255, ZSTD_MAGIC >> 16 & 255, ZSTD_MAGIC >> 24 & 255);
  let fhd = 0;
  if (contentSize <= 255) {
    fhd |= 0 << 6;
    fhd |= 1 << 5;
  } else if (contentSize <= 256 + 65535 - 1) {
    fhd |= 1 << 6;
    fhd |= 1 << 5;
  } else {
    fhd |= 2 << 6;
    fhd |= 1 << 5;
  }
  if (dictionaryId !== null) {
    if (!Number.isInteger(dictionaryId) || dictionaryId <= 0 || dictionaryId > 4294967295) {
      throw new ZstdError("Invalid dictionaryId in frame header", "parameter_unsupported");
    }
    if (dictionaryId <= 255)
      fhd |= 1;
    else if (dictionaryId <= 65535)
      fhd |= 2;
    else
      fhd |= 3;
  }
  fhd |= (hasChecksum ? 1 : 0) << 2;
  chunks.push(fhd);
  if (dictionaryId !== null) {
    writeDictionaryId(chunks, dictionaryId >>> 0);
  }
  if (contentSize <= 255) {
    chunks.push(contentSize & 255);
  } else if (contentSize <= 256 + 65535 - 1) {
    chunks.push(contentSize - 256 & 255, contentSize - 256 >> 8 & 255);
  } else {
    chunks.push(contentSize & 255, contentSize >> 8 & 255, contentSize >> 16 & 255, contentSize >> 24 & 255);
  }
  return new Uint8Array(chunks);
}

// node_modules/zstdify/dist/encode/sequencePlanner.js
var WINDOW_SIZE = 128 * 1024;
var MIN_MATCH = 3;
var HASH_BITS = 16;
var HASH_SIZE = 1 << HASH_BITS;
function createSequencePlannerState() {
  const historyHeads = new Int32Array(HASH_SIZE);
  historyHeads.fill(-1);
  return {
    historyBytes: new Uint8Array(0),
    historyChainPrev: new Int32Array(0),
    historyHeads
  };
}
function hash3(data, pos) {
  const a = data[pos];
  const b = data[pos + 1];
  const c = data[pos + 2];
  return a * 2654435761 + b * 2246822519 + c * 3266489917 >>> 0 >>> 32 - HASH_BITS;
}
function bytesEqual(a, b) {
  if (a.length !== b.length)
    return false;
  for (let i = 0; i < a.length; i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0))
      return false;
  }
  return true;
}
function buildChainPrev(data, historyLength, plannerState) {
  const heads = new Int32Array(HASH_SIZE);
  heads.fill(-1);
  const chainPrev = new Int32Array(data.length);
  chainPrev.fill(-1);
  let startPos = 0;
  if (plannerState && historyLength > 0 && plannerState.historyBytes.length === historyLength && plannerState.historyChainPrev.length === historyLength && bytesEqual(data.subarray(0, historyLength), plannerState.historyBytes)) {
    chainPrev.set(plannerState.historyChainPrev, 0);
    heads.set(plannerState.historyHeads);
    startPos = historyLength;
  }
  for (let pos = startPos; pos + MIN_MATCH <= data.length; pos++) {
    const h = hash3(data, pos);
    const prev = heads[h];
    chainPrev[pos] = prev;
    heads[h] = pos;
  }
  return chainPrev;
}
function updatePlannerState(plannerState, combined, chainPrev) {
  if (!plannerState)
    return;
  const historyStart = Math.max(0, combined.length - WINDOW_SIZE);
  const historyLength = combined.length - historyStart;
  const historyBytes = new Uint8Array(historyLength);
  historyBytes.set(combined.subarray(historyStart), 0);
  const historyChainPrev = new Int32Array(historyLength);
  for (let pos = 0; pos < historyLength; pos++) {
    const globalPos = historyStart + pos;
    const prev = chainPrev[globalPos] ?? -1;
    historyChainPrev[pos] = prev >= historyStart ? prev - historyStart : -1;
  }
  const historyHeads = new Int32Array(HASH_SIZE);
  historyHeads.fill(-1);
  for (let pos = 0; pos + MIN_MATCH <= historyLength; pos++) {
    const h = hash3(historyBytes, pos);
    historyHeads[h] = pos;
  }
  plannerState.historyBytes = historyBytes;
  plannerState.historyChainPrev = historyChainPrev;
  plannerState.historyHeads = historyHeads;
}
function longestMatch(data, pos, candidate, maxLength) {
  let len = 0;
  while (len + 8 <= maxLength) {
    if (data[pos + len] !== data[candidate + len] || data[pos + len + 1] !== data[candidate + len + 1] || data[pos + len + 2] !== data[candidate + len + 2] || data[pos + len + 3] !== data[candidate + len + 3] || data[pos + len + 4] !== data[candidate + len + 4] || data[pos + len + 5] !== data[candidate + len + 5] || data[pos + len + 6] !== data[candidate + len + 6] || data[pos + len + 7] !== data[candidate + len + 7]) {
      break;
    }
    len += 8;
  }
  while (len < maxLength && data[pos + len] === data[candidate + len]) {
    len++;
  }
  return len;
}
function scoreMatch(length, offset, repOffsets, repScoreBonus) {
  let score = length * 16;
  if (offset === repOffsets[0])
    score += repScoreBonus[0];
  else if (offset === repOffsets[1])
    score += repScoreBonus[1];
  else if (offset === repOffsets[2])
    score += repScoreBonus[2];
  return score;
}
function findBestMatchAt(parse, pos, repOffsets) {
  const data = parse.input;
  if (pos + MIN_MATCH > data.length)
    return null;
  let candidate = parse.chainPrev[pos] ?? -1;
  if (candidate < 0)
    return null;
  const minCandidate = Math.max(0, pos - WINDOW_SIZE);
  const maxLength = data.length - pos;
  let depth = 0;
  let best = null;
  while (candidate >= minCandidate && depth < parse.options.chainLimit) {
    const offset = pos - candidate;
    if (offset > 0 && data[pos] === data[candidate] && data[pos + 1] === data[candidate + 1] && data[pos + 2] === data[candidate + 2]) {
      const length = longestMatch(data, pos, candidate, maxLength);
      if (length >= MIN_MATCH) {
        const score = scoreMatch(length, offset, repOffsets, parse.options.repScoreBonus);
        if (!best || score > best.score || score === best.score && length > best.length) {
          best = { pos, offset, length, score };
          if (length >= maxLength)
            break;
        }
      }
    }
    candidate = parse.chainPrev[candidate] ?? -1;
    depth++;
  }
  return best;
}
function applyRepOffsetUpdate(repOffsets, offsetValue, literalsLength) {
  const next = [repOffsets[0], repOffsets[1], repOffsets[2]];
  const ll0 = literalsLength === 0;
  const isNonRepeat = offsetValue > 3 || offsetValue === 3 && ll0;
  if (isNonRepeat) {
    const actualOffset = offsetValue === 3 ? next[0] - 1 : offsetValue - 3;
    next[2] = next[1];
    next[1] = next[0];
    next[0] = actualOffset;
    return next;
  }
  let repeatIndex;
  if (ll0)
    repeatIndex = offsetValue === 1 ? 1 : 2;
  else
    repeatIndex = offsetValue - 1;
  if (repeatIndex === 1) {
    next[1] = next[0];
    next[0] = repOffsets[1];
  } else if (repeatIndex === 2) {
    next[2] = next[1];
    next[1] = next[0];
    next[0] = repOffsets[2];
  }
  return next;
}
function toOffsetValue(offset, literalsLength, repOffsets) {
  const offsetValue = offset + 3;
  return {
    offsetValue,
    nextRepOffsets: applyRepOffsetUpdate(repOffsets, offsetValue, literalsLength)
  };
}
function copyLiterals(dst, dstOffset, data, srcStart, srcEnd) {
  if (srcEnd <= srcStart)
    return dstOffset;
  dst.set(data.subarray(srcStart, srcEnd), dstOffset);
  return dstOffset + (srcEnd - srcStart);
}
function pickMatch(parse, pos) {
  const direct = findBestMatchAt(parse, pos, parse.repOffsets);
  if (parse.options.searchWindow <= 1)
    return direct;
  let best = direct;
  let bestScore = best?.score ?? 0;
  const end = Math.min(parse.input.length - MIN_MATCH, pos + parse.options.searchWindow - 1);
  const maxRepBonus = Math.max(...parse.options.repScoreBonus);
  for (let probePos = pos + 1; probePos <= end; probePos++) {
    const delayed = probePos - pos;
    const maxProbeLength = parse.input.length - probePos;
    const theoreticalBestDelayedScore = maxProbeLength * 16 + maxRepBonus - delayed * 8;
    if (theoreticalBestDelayedScore <= bestScore) {
      break;
    }
    const probeCandidate = parse.chainPrev[probePos] ?? -1;
    if (probeCandidate < 0 || probeCandidate < Math.max(0, probePos - WINDOW_SIZE))
      continue;
    const probe = findBestMatchAt(parse, probePos, parse.repOffsets);
    if (!probe)
      continue;
    const delayedScore = probe.score - delayed * 8;
    if (!best || delayedScore > bestScore) {
      best = { ...probe, score: delayedScore };
      bestScore = delayedScore;
    }
  }
  return best;
}
function planSequences(input, options) {
  if (input.length < MIN_MATCH) {
    return {
      literals: input.slice(),
      sequences: [],
      trailingLiterals: input.length,
      finalRepOffsets: options.repOffsets ?? [1, 4, 8]
    };
  }
  const history = options.history && options.history.length > 0 ? options.history.subarray(Math.max(0, options.history.length - WINDOW_SIZE)) : new Uint8Array(0);
  const historyLength = history.length;
  const combined = new Uint8Array(historyLength + input.length);
  if (historyLength > 0)
    combined.set(history, 0);
  combined.set(input, historyLength);
  const parse = {
    input: combined,
    chainPrev: buildChainPrev(combined, historyLength, options.plannerState),
    repOffsets: options.repOffsets ? [options.repOffsets[0], options.repOffsets[1], options.repOffsets[2]] : [1, 4, 8],
    options: {
      chainLimit: Math.max(1, options.chainLimit),
      repScoreBonus: options.repScoreBonus ?? [48, 24, 12],
      lazyDepth: Math.max(0, options.lazyDepth ?? 0),
      searchWindow: Math.max(1, options.searchWindow ?? 1)
    }
  };
  const sequences = [];
  const literals = new Uint8Array(input.length);
  let literalOut = 0;
  let anchor = historyLength;
  let pos = historyLength;
  while (pos + MIN_MATCH <= combined.length) {
    let best = pickMatch(parse, pos);
    if (best && parse.options.lazyDepth > 0 && best.pos === pos) {
      const maxDelta = Math.min(parse.options.lazyDepth, combined.length - pos - MIN_MATCH);
      for (let delta = 1; delta <= maxDelta; delta++) {
        const candidate = findBestMatchAt(parse, pos + delta, parse.repOffsets);
        if (!candidate)
          continue;
        if (candidate.score > best.score + delta * 8)
          best = { ...candidate };
      }
    }
    if (!best || best.length < MIN_MATCH) {
      pos++;
      continue;
    }
    const matchPos = best.pos;
    const literalsLength = matchPos - anchor;
    literalOut = copyLiterals(literals, literalOut, combined, anchor, matchPos);
    const { offsetValue, nextRepOffsets } = toOffsetValue(best.offset, literalsLength, parse.repOffsets);
    sequences.push({
      literalsLength,
      offset: offsetValue,
      matchLength: best.length
    });
    parse.repOffsets = nextRepOffsets;
    anchor = matchPos + best.length;
    pos = anchor;
  }
  const trailingLiterals = combined.length - anchor;
  literalOut = copyLiterals(literals, literalOut, combined, anchor, combined.length);
  updatePlannerState(options.plannerState, combined, parse.chainPrev);
  return {
    literals: literalOut < literals.length ? literals.subarray(0, literalOut) : literals,
    sequences,
    trailingLiterals,
    finalRepOffsets: [parse.repOffsets[0], parse.repOffsets[1], parse.repOffsets[2]]
  };
}

// node_modules/zstdify/dist/encode/fastMatcher.js
function buildFastMatcherSequences(input, options) {
  return planSequences(input, {
    history: options?.history,
    repOffsets: options?.repOffsets,
    plannerState: options?.plannerState,
    chainLimit: 8,
    repScoreBonus: [48, 24, 12],
    lazyDepth: 0,
    searchWindow: 1
  });
}

// node_modules/zstdify/dist/encode/lazyMatcher.js
function buildLazyMatcherSequences(input, options) {
  return planSequences(input, {
    history: options?.history,
    repOffsets: options?.repOffsets,
    plannerState: options?.plannerState,
    chainLimit: 20,
    repScoreBonus: [64, 32, 16],
    lazyDepth: 2,
    searchWindow: 4
  });
}

// node_modules/zstdify/dist/encode/optimalParser.js
function buildOptimalParserSequences(input, options) {
  return planSequences(input, {
    history: options?.history,
    repOffsets: options?.repOffsets,
    plannerState: options?.plannerState,
    chainLimit: 40,
    repScoreBonus: [80, 40, 20],
    lazyDepth: 0,
    searchWindow: 16
  });
}

// node_modules/zstdify/dist/encode/greedySequences.js
function buildGreedySequences(input, options) {
  const strategy = options?.strategy ?? "fast";
  if (strategy === "lazy") {
    return buildLazyMatcherSequences(input, {
      history: options?.history,
      repOffsets: options?.repOffsets,
      plannerState: options?.plannerState
    });
  }
  if (strategy === "optimal") {
    return buildOptimalParserSequences(input, {
      history: options?.history,
      repOffsets: options?.repOffsets,
      plannerState: options?.plannerState
    });
  }
  return buildFastMatcherSequences(input, {
    history: options?.history,
    repOffsets: options?.repOffsets,
    plannerState: options?.plannerState
  });
}

// node_modules/zstdify/dist/frame/checksum.js
var PRIME64_1 = 0x9e3779b185ebca87n;
var PRIME64_2 = 0xc2b2ae3d27d4eb4fn;
var PRIME64_3 = 0x165667b19e3779f9n;
var PRIME64_4 = 0x85ebca77c2b2ae63n;
var PRIME64_5 = 0x27d4eb2f165667c5n;
var MASK64 = 0xffffffffffffffffn;
function rotl64(x, r) {
  r = r & 63;
  return (x << BigInt(r) | x >> BigInt(64 - r)) & MASK64;
}
function round64(acc, input) {
  acc = acc + input * PRIME64_2 & MASK64;
  acc = rotl64(acc, 31);
  return acc * PRIME64_1 & MASK64;
}
function mergeRound64(acc, val) {
  val = round64(0n, val);
  acc ^= val;
  acc = acc * PRIME64_1 + PRIME64_4 & MASK64;
  return acc;
}
function xxh64(data, seed = 0n) {
  let acc;
  const len = data.length;
  let offset = 0;
  if (len >= 32) {
    let v1 = seed + PRIME64_1 + PRIME64_2 & MASK64;
    let v2 = seed + PRIME64_2 & MASK64;
    let v3 = seed & MASK64;
    let v4 = seed - PRIME64_1 & MASK64;
    const limit = len - 32;
    while (offset <= limit) {
      v1 = round64(v1, readU64LE(data, offset));
      v2 = round64(v2, readU64LE(data, offset + 8));
      v3 = round64(v3, readU64LE(data, offset + 16));
      v4 = round64(v4, readU64LE(data, offset + 24));
      offset += 32;
    }
    acc = rotl64(v1, 1) + rotl64(v2, 7) + rotl64(v3, 12) + rotl64(v4, 18) & MASK64;
    acc = mergeRound64(acc, v1);
    acc = mergeRound64(acc, v2);
    acc = mergeRound64(acc, v3);
    acc = mergeRound64(acc, v4);
  } else {
    acc = seed + PRIME64_5 & MASK64;
  }
  acc = acc + BigInt(len) & MASK64;
  while (offset + 8 <= len) {
    acc ^= round64(0n, readU64LE(data, offset));
    acc = rotl64(acc, 27) * PRIME64_1 + PRIME64_4;
    acc &= MASK64;
    offset += 8;
  }
  if (offset + 4 <= len) {
    acc ^= BigInt(readU32LE(data, offset)) * PRIME64_1 & 0xffffffffffffffffn;
    acc = rotl64(acc, 23) * PRIME64_2 + PRIME64_3 & MASK64;
    offset += 4;
  }
  while (offset < len) {
    acc ^= BigInt(data[offset] ?? 0) * PRIME64_5 & MASK64;
    acc = rotl64(acc, 11) * PRIME64_1 & MASK64;
    offset++;
  }
  acc ^= acc >> 33n;
  acc = acc * PRIME64_2 & MASK64;
  acc ^= acc >> 29n;
  acc = acc * PRIME64_3 & MASK64;
  acc ^= acc >> 32n;
  return acc & MASK64;
}
function validateContentChecksum(data, storedChecksum) {
  return computeContentChecksum32(data) === storedChecksum >>> 0;
}
function computeContentChecksum32(data) {
  const hash = xxh64(data, 0n);
  return Number(hash & 0xffffffffn) >>> 0;
}

// node_modules/zstdify/dist/compress.js
var BLOCK_MAX = 128 * 1024;
var WINDOW_SIZE2 = 128 * 1024;
function selectCompressionStrategy(level) {
  if (level <= 1)
    return null;
  if (level <= 3)
    return "fast";
  if (level <= 6)
    return "lazy";
  return "optimal";
}
function appendHistory(history, chunk) {
  if (chunk.length === 0)
    return history;
  if (chunk.length >= WINDOW_SIZE2) {
    const out2 = new Uint8Array(WINDOW_SIZE2);
    out2.set(chunk.subarray(chunk.length - WINDOW_SIZE2), 0);
    return out2;
  }
  const total = history.length + chunk.length;
  if (total <= WINDOW_SIZE2) {
    const out2 = new Uint8Array(total);
    out2.set(history, 0);
    out2.set(chunk, history.length);
    return out2;
  }
  const keepFromHistory = WINDOW_SIZE2 - chunk.length;
  const out = new Uint8Array(WINDOW_SIZE2);
  out.set(history.subarray(history.length - keepFromHistory), 0);
  out.set(chunk, keepFromHistory);
  return out;
}
function compress(input, options) {
  const requestedLevel = options?.level ?? 0;
  const level = Math.max(0, Math.min(9, Math.trunc(requestedLevel)));
  const strategy = selectCompressionStrategy(level);
  const hasChecksum = options?.checksum ?? false;
  const dictionary = options?.dictionary;
  const dictionaryBytes = dictionary instanceof Uint8Array ? dictionary : dictionary?.bytes;
  const providedDictionaryId = dictionary instanceof Uint8Array ? null : dictionary?.id ?? null;
  const dictionaryContext = dictionaryBytes && dictionaryBytes.length > 0 ? resolveDictionaryContextForCompression(dictionaryBytes, providedDictionaryId) : null;
  const dictionaryId = options?.noDictId ? null : dictionaryContext?.dictionaryId ?? providedDictionaryId;
  if (dictionaryId !== null && (!Number.isInteger(dictionaryId) || dictionaryId <= 0 || dictionaryId > 4294967295)) {
    throw new ZstdError("dictionary.id must be a 32-bit positive integer", "parameter_unsupported");
  }
  const chunks = [];
  chunks.push(writeFrameHeader(input.length, hasChecksum, dictionaryId));
  let offset = 0;
  const blockCount = input.length === 0 ? 1 : Math.ceil(input.length / BLOCK_MAX);
  let blockIndex = 0;
  let history = dictionaryContext && dictionaryContext.historyPrefix.length > 0 ? dictionaryContext.historyPrefix.subarray(Math.max(0, dictionaryContext.historyPrefix.length - WINDOW_SIZE2)) : new Uint8Array(0);
  let repOffsets = [1, 4, 8];
  const sequenceEntropyContext = { prevTables: null };
  const sequencePlannerState = createSequencePlannerState();
  while (offset < input.length || blockIndex < blockCount) {
    const size = Math.min(BLOCK_MAX, input.length - offset);
    const last = blockIndex === blockCount - 1;
    const block = input.subarray(offset, offset + size);
    if (level > 0 && size > 0) {
      if (strategy) {
        const plan = buildGreedySequences(block, { strategy, history, repOffsets, plannerState: sequencePlannerState });
        if (plan.sequences.length > 0) {
          const payload = buildCompressedBlockPayload(plan.literals, plan.sequences, sequenceEntropyContext);
          if (payload) {
            const compressed = writeCompressedBlock(payload, last);
            if (compressed.length < 3 + size) {
              chunks.push(compressed);
              repOffsets = plan.finalRepOffsets;
              history = appendHistory(history, block);
              offset += size;
              blockIndex++;
              continue;
            }
          }
        }
      }
      const first = input[offset] ?? 0;
      let isRLE = true;
      for (let i = offset + 1; i < offset + size; i++) {
        if ((input[i] ?? 0) !== first) {
          isRLE = false;
          break;
        }
      }
      if (isRLE) {
        chunks.push(writeRLEBlock(first, size, last));
      } else {
        chunks.push(writeRawBlock(input, offset, size, last));
      }
    } else {
      chunks.push(writeRawBlock(input, offset, size, last));
    }
    history = appendHistory(history, block);
    offset += size;
    blockIndex++;
  }
  if (hasChecksum) {
    const checksum = computeContentChecksum32(input);
    chunks.push(new Uint8Array([checksum & 255, checksum >>> 8 & 255, checksum >>> 16 & 255, checksum >>> 24 & 255]));
  }
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(total);
  let pos = 0;
  for (const chunk of chunks) {
    result.set(chunk, pos);
    pos += chunk.length;
  }
  return result;
}

// node_modules/zstdify/dist/decode/block.js
var BLOCK_HEADER_SIZE = 3;
var MAX_BLOCK_SIZE = 128 * 1024;
function readU24LE(data, offset) {
  if (offset + 3 > data.length) {
    throw new RangeError(`readU24LE: offset ${offset} + 3 exceeds length ${data.length}`);
  }
  const a = data[offset] ?? 0;
  const b = data[offset + 1] ?? 0;
  const c = data[offset + 2] ?? 0;
  return a | b << 8 | c << 16;
}
function parseBlockHeader(data, offset) {
  if (offset + BLOCK_HEADER_SIZE > data.length) {
    throw new ZstdError("Block header truncated", "corruption_detected");
  }
  const w = readU24LE(data, offset);
  const lastBlock = (w & 1) === 1;
  const blockType = w >> 1 & 3;
  const blockSize = w >> 3;
  if (blockType === 3) {
    throw new ZstdError("Reserved block type", "corruption_detected");
  }
  if (blockSize > MAX_BLOCK_SIZE) {
    throw new ZstdError("Block size exceeds maximum", "corruption_detected");
  }
  return { lastBlock, blockType, blockSize };
}

// node_modules/zstdify/dist/bitstream/bitReaderReverse.js
var BIT_MASKS = new Uint32Array(33);
for (let i = 0; i <= 32; i++) {
  BIT_MASKS[i] = i === 32 ? 4294967295 : (1 << i) - 1 >>> 0;
}
function readU32LEBounded(data, idx) {
  return ((data[idx] ?? 0) | (data[idx + 1] ?? 0) << 8 | (data[idx + 2] ?? 0) << 16 | (data[idx + 3] ?? 0) << 24) >>> 0;
}
function readU32LEFast(data, idx) {
  return (data[idx] | data[idx + 1] << 8 | data[idx + 2] << 16 | data[idx + 3] << 24) >>> 0;
}
var BitReaderReverse = class {
  data;
  dataLength;
  startBit;
  endBit;
  bitOffset;
  constructor(data, startByteOffset, lengthBytes, skipBitsAtStart = 0) {
    if (lengthBytes < 0) {
      throw new RangeError(`BitReaderReverse: negative length ${lengthBytes}`);
    }
    this.data = data;
    this.dataLength = data.length;
    this.startBit = startByteOffset * 8 + skipBitsAtStart;
    this.endBit = (startByteOffset + lengthBytes) * 8;
    this.bitOffset = this.endBit;
  }
  /** Read n bits (1-32), LSB first from current position (reading backward) */
  readBits(n) {
    if (n < 1 || n > 32) {
      throw new RangeError(`BitReaderReverse.readBits: n must be 1-32, got ${n}`);
    }
    const requestedStart = this.bitOffset - n;
    const clampedStart = requestedStart < this.startBit ? this.startBit : requestedStart;
    this.bitOffset = clampedStart;
    if (requestedStart >= this.startBit) {
      const byteIndex = requestedStart >>> 3;
      const bitInByte = requestedStart & 7;
      if (bitInByte + n <= 8) {
        return (this.data[byteIndex] >>> bitInByte & BIT_MASKS[n]) >>> 0;
      }
      const hasEightBytes = byteIndex + 7 < this.dataLength;
      const word0 = hasEightBytes ? readU32LEFast(this.data, byteIndex) : readU32LEBounded(this.data, byteIndex);
      if (bitInByte + n <= 32) {
        const value2 = word0 >>> bitInByte;
        return n === 32 ? value2 >>> 0 : (value2 & BIT_MASKS[n]) >>> 0;
      }
      const low = word0 >>> bitInByte;
      const highBits = n - (32 - bitInByte);
      const word1 = hasEightBytes ? readU32LEFast(this.data, byteIndex + 4) : readU32LEBounded(this.data, byteIndex + 4);
      const high = (word1 & BIT_MASKS[highBits]) << 32 - bitInByte >>> 0;
      const merged = (low | high) >>> 0;
      return n === 32 ? merged : (merged & BIT_MASKS[n]) >>> 0;
    }
    let value = 0;
    for (let i = 0; i < n; i++) {
      const absoluteBit = requestedStart + i;
      if (absoluteBit < this.startBit) {
        continue;
      }
      const byteIndex = absoluteBit >>> 3;
      const bitInByte = absoluteBit & 7;
      const bit = (this.data[byteIndex] ?? 0) >>> bitInByte & 1;
      value |= bit << i;
    }
    return value;
  }
  /**
   * Read n bits and throw if request crosses the logical stream start.
   *
   * Use strict reads for inputs that must fail fast on truncation/corruption.
   * Keep readBits()/readBitsFast() for decode paths that intentionally rely on
   * zstd-compatible zero-fill behavior near the stream start.
   */
  readBitsStrict(n) {
    if (n < 1 || n > 32) {
      throw new RangeError(`BitReaderReverse.readBitsStrict: n must be 1-32, got ${n}`);
    }
    if (n > this.bitsRemaining) {
      throw new RangeError("BitReaderReverse: buffer underflow");
    }
    return this.readBits(n);
  }
  /**
   * Fast path used by validated hot loops.
   * Falls back to readBits() when the request crosses the logical stream start.
   */
  readBitsFast(n) {
    if (n < 1 || n > 24) {
      return this.readBits(n);
    }
    const requestedStart = this.bitOffset - n;
    if (requestedStart < this.startBit) {
      return this.readBits(n);
    }
    this.bitOffset = requestedStart;
    const byteIndex = requestedStart >>> 3;
    const bitInByte = requestedStart & 7;
    const word = byteIndex + 3 < this.dataLength ? readU32LEFast(this.data, byteIndex) : readU32LEBounded(this.data, byteIndex);
    return (word >>> bitInByte & BIT_MASKS[n]) >>> 0;
  }
  /** Fast-path strict variant that forbids crossing stream start. */
  readBitsFastStrict(n) {
    if (n < 1 || n > 24) {
      return this.readBitsStrict(n);
    }
    if (n > this.bitsRemaining) {
      throw new RangeError("BitReaderReverse: buffer underflow");
    }
    return this.readBitsFast(n);
  }
  /**
   * Hot-loop helper: read n bits quickly, returning 0 when n is 0.
   */
  readBitsFastOrZero(n) {
    if (n === 0) {
      return 0;
    }
    return this.readBitsFast(n);
  }
  /** Skip trailing zero padding and end-mark bit from the stream tail. */
  skipPadding() {
    if (this.endBit <= this.startBit) {
      throw new RangeError("BitReaderReverse: empty stream");
    }
    const lastByteIndex = (this.endBit >>> 3) - 1;
    const lastByte = this.data[lastByteIndex] ?? 0;
    if (lastByte === 0) {
      throw new RangeError("BitReaderReverse: invalid end marker");
    }
    const highestSetBit = 31 - Math.clz32(lastByte);
    const paddingBits = 8 - highestSetBit;
    this.bitOffset = this.endBit - paddingBits;
    if (this.bitOffset < this.startBit) {
      throw new RangeError("BitReaderReverse: invalid padding");
    }
  }
  get position() {
    if (this.bitOffset <= this.startBit) {
      return this.startBit >>> 3;
    }
    return this.bitOffset - 1 >>> 3;
  }
  get bitsRemaining() {
    return this.bitOffset - this.startBit;
  }
  /** Skip the first n bits at the logical start (the end of the buffer when reading backward). */
  skipBitsAtEnd(n) {
    if (n <= 0)
      return;
    this.bitOffset -= n;
    if (this.bitOffset < this.startBit) {
      throw new RangeError("BitReaderReverse: buffer underflow");
    }
  }
  /** Undo a previous readBits() by pushing the cursor forward. */
  unreadBits(n) {
    if (n <= 0)
      return;
    this.bitOffset += n;
    if (this.bitOffset > this.endBit) {
      throw new RangeError("BitReaderReverse: unread overflow");
    }
  }
};

// node_modules/zstdify/dist/decode/reconstruct.js
function createHistoryWindow(windowSize, initial) {
  const initialLength = initial?.length ?? 0;
  const capacity = Math.max(windowSize, initialLength);
  if (capacity <= 0) {
    return { buffer: new Uint8Array(0), length: 0, writePos: 0 };
  }
  const buffer = new Uint8Array(capacity);
  const history = { buffer, length: 0, writePos: 0 };
  if (initialLength > 0 && initial) {
    appendToHistoryWindow(history, initial);
  }
  return history;
}
function getOrCreateHistoryWindow(windowSize, initial, reuse) {
  const existing = reuse?._history;
  if (existing && existing.buffer.length >= windowSize) {
    existing.length = 0;
    existing.writePos = 0;
    if (initial && initial.length > 0) {
      appendToHistoryWindow(existing, initial);
    }
    return existing;
  }
  const history = createHistoryWindow(windowSize, initial);
  if (reuse) {
    reuse._history = history;
  }
  return history;
}
function appendToHistoryWindow(history, chunk) {
  const cap = history.buffer.length;
  if (cap === 0 || chunk.length === 0) {
    return;
  }
  if (chunk.length >= cap) {
    const tail = chunk.subarray(chunk.length - cap);
    history.buffer.set(tail, 0);
    history.length = cap;
    history.writePos = 0;
    return;
  }
  const firstLen = Math.min(chunk.length, cap - history.writePos);
  history.buffer.set(chunk.subarray(0, firstLen), history.writePos);
  const remaining = chunk.length - firstLen;
  if (remaining > 0) {
    history.buffer.set(chunk.subarray(firstLen), 0);
  }
  history.writePos = (history.writePos + chunk.length) % cap;
  history.length = Math.min(cap, history.length + chunk.length);
}
var APPEND_RANGE_LOOP_THRESHOLD = 16;
function appendRangeToHistoryWindow(history, source, start, length) {
  const cap = history.buffer.length;
  if (cap === 0 || length <= 0) {
    return;
  }
  if (start < 0 || length < 0 || start + length > source.length) {
    throw new RangeError("Invalid source range for history append");
  }
  if (length >= cap) {
    const tailStart = start + length - cap;
    history.buffer.set(source.subarray(tailStart, start + length), 0);
    history.length = cap;
    history.writePos = 0;
    return;
  }
  const firstLen = Math.min(length, cap - history.writePos);
  const remaining = length - firstLen;
  if (length <= APPEND_RANGE_LOOP_THRESHOLD) {
    let wp = history.writePos;
    for (let i = 0; i < length; i++) {
      history.buffer[wp] = source[start + i];
      wp = wp + 1 === cap ? 0 : wp + 1;
    }
  } else {
    history.buffer.set(source.subarray(start, start + firstLen), history.writePos);
    if (remaining > 0) {
      history.buffer.set(source.subarray(start + firstLen, start + firstLen + remaining), 0);
    }
  }
  history.writePos = (history.writePos + length) % cap;
  history.length = Math.min(cap, history.length + length);
}
function appendRLEToHistoryWindow(history, byte, length) {
  const cap = history.buffer.length;
  if (cap === 0 || length <= 0) {
    return;
  }
  const fillByte = byte & 255;
  if (length >= cap) {
    history.buffer.fill(fillByte, 0, cap);
    history.length = cap;
    history.writePos = 0;
    return;
  }
  const firstLen = Math.min(length, cap - history.writePos);
  history.buffer.fill(fillByte, history.writePos, history.writePos + firstLen);
  const remaining = length - firstLen;
  if (remaining > 0) {
    history.buffer.fill(fillByte, 0, remaining);
  }
  history.writePos = (history.writePos + length) % cap;
  history.length = Math.min(cap, history.length + length);
}

// node_modules/zstdify/dist/decode/fusedSequences.js
var LL_BASELINE2 = new Int32Array([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  16,
  18,
  20,
  22,
  24,
  28,
  32,
  40,
  48,
  64,
  128,
  256,
  512,
  1024,
  2048,
  4096,
  8192,
  16384,
  32768,
  65536
]);
var LL_NUMBITS2 = new Uint8Array([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16
]);
var ML_BASELINE2 = new Int32Array([
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  37,
  39,
  41,
  43,
  47,
  51,
  59,
  67,
  83,
  99,
  131,
  259,
  515,
  1027,
  2051,
  4099,
  8195,
  16387,
  32771,
  65539
]);
var ML_NUMBITS2 = new Uint8Array([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16
]);
var DEFAULT_LL_TABLE = buildFSEDecodeTable(LITERALS_LENGTH_DEFAULT_DISTRIBUTION, LITERALS_LENGTH_TABLE_LOG);
var DEFAULT_OF_TABLE = buildFSEDecodeTable(OFFSET_CODE_DEFAULT_DISTRIBUTION, OFFSET_CODE_TABLE_LOG);
var DEFAULT_ML_TABLE = buildFSEDecodeTable(MATCH_LENGTH_DEFAULT_DISTRIBUTION, MATCH_LENGTH_TABLE_LOG);
var RLE_TABLE_CACHE_5 = new Array(256);
var RLE_TABLE_CACHE_6 = new Array(256);
var FAST_LITERAL_COPY_LOOP_THRESHOLD = 8;
var FAST_SMALL_OFFSET_LOOP_THRESHOLD = 16;
var FAST_HISTORY_COPY_LOOP_THRESHOLD = 16;
function buildRLETable(symbol, tableLog) {
  const cache = tableLog === 5 ? RLE_TABLE_CACHE_5 : tableLog === 6 ? RLE_TABLE_CACHE_6 : null;
  if (cache) {
    const cached = cache[symbol];
    if (cached) {
      return cached;
    }
  }
  const tableSize = 1 << tableLog;
  const symbolByState = new Uint16Array(tableSize);
  const bitsByState = new Uint8Array(tableSize);
  const baselineByState = new Int32Array(tableSize);
  for (let i = 0; i < tableSize; i++) {
    symbolByState[i] = symbol;
    bitsByState[i] = tableLog;
  }
  const table = {
    symbol: symbolByState,
    numBits: bitsByState,
    baseline: baselineByState,
    tableLog,
    length: tableSize
  };
  if (cache) {
    cache[symbol] = table;
  }
  return table;
}
function decodeAndExecuteSequencesInto(blockContent, seqOffset, seqSize, prevSeqTables, literals, windowSize, output, outputStart, repOffsets, history, updateHistory, collectMetadata = true) {
  if (seqSize < 2) {
    throw new ZstdError("Sequences section too short", "corruption_detected");
  }
  const sectionStart = seqOffset;
  let pos = sectionStart;
  let numSequences = blockContent[pos];
  pos++;
  if (numSequences >= 128) {
    if (numSequences === 255) {
      if (pos + 2 > sectionStart + seqSize) {
        throw new ZstdError("Sequences section truncated", "corruption_detected");
      }
      numSequences = blockContent[pos] + (blockContent[pos + 1] << 8) + 32512;
      pos += 2;
    } else {
      if (pos >= sectionStart + seqSize) {
        throw new ZstdError("Sequences section truncated", "corruption_detected");
      }
      numSequences = (numSequences - 128 << 8) + blockContent[pos];
      pos++;
    }
  }
  let llMode = 0;
  let ofMode = 0;
  let mlMode = 0;
  let llTable = DEFAULT_LL_TABLE;
  let llTableLog = LITERALS_LENGTH_TABLE_LOG;
  let ofTable = DEFAULT_OF_TABLE;
  let ofTableLog = OFFSET_CODE_TABLE_LOG;
  let mlTable = DEFAULT_ML_TABLE;
  let mlTableLog = MATCH_LENGTH_TABLE_LOG;
  if (numSequences > 0) {
    if (pos >= sectionStart + seqSize) {
      throw new ZstdError("Sequences section truncated", "corruption_detected");
    }
    const modesByte = blockContent[pos];
    pos++;
    llMode = modesByte >> 6 & 3;
    ofMode = modesByte >> 4 & 3;
    mlMode = modesByte >> 2 & 3;
    if ((modesByte & 3) !== 0) {
      throw new ZstdError("Reserved bits set in sequences modes", "corruption_detected");
    }
    if (llMode === 1) {
      if (pos >= sectionStart + seqSize)
        throw new ZstdError("Sequences section truncated", "corruption_detected");
      llTable = buildRLETable(blockContent[pos], 6);
      llTableLog = 6;
      pos++;
    } else if (llMode === 2) {
      const result = readNCount(blockContent, pos, 35, 9);
      pos += result.bytesRead;
      llTable = buildFSEDecodeTable(result.normalizedCounter, result.tableLog);
      llTableLog = result.tableLog;
    } else if (llMode === 3) {
      if (!prevSeqTables)
        throw new ZstdError("Repeat_Mode without previous table", "corruption_detected");
      llTable = prevSeqTables.llTable;
      llTableLog = prevSeqTables.llTableLog;
    }
    if (ofMode === 1) {
      if (pos >= sectionStart + seqSize)
        throw new ZstdError("Sequences section truncated", "corruption_detected");
      ofTable = buildRLETable(blockContent[pos], 5);
      ofTableLog = 5;
      pos++;
    } else if (ofMode === 2) {
      const result = readNCount(blockContent, pos, 31, 8);
      pos += result.bytesRead;
      ofTable = buildFSEDecodeTable(result.normalizedCounter, result.tableLog);
      ofTableLog = result.tableLog;
    } else if (ofMode === 3) {
      if (!prevSeqTables)
        throw new ZstdError("Repeat_Mode without previous table", "corruption_detected");
      ofTable = prevSeqTables.ofTable;
      ofTableLog = prevSeqTables.ofTableLog;
    }
    if (mlMode === 1) {
      if (pos >= sectionStart + seqSize)
        throw new ZstdError("Sequences section truncated", "corruption_detected");
      mlTable = buildRLETable(blockContent[pos], 6);
      mlTableLog = 6;
      pos++;
    } else if (mlMode === 2) {
      const result = readNCount(blockContent, pos, 52, 9);
      pos += result.bytesRead;
      mlTable = buildFSEDecodeTable(result.normalizedCounter, result.tableLog);
      mlTableLog = result.tableLog;
    } else if (mlMode === 3) {
      if (!prevSeqTables)
        throw new ZstdError("Repeat_Mode without previous table", "corruption_detected");
      mlTable = prevSeqTables.mlTable;
      mlTableLog = prevSeqTables.mlTableLog;
    }
  }
  let outPos = outputStart;
  let litPos = 0;
  let totalMatchLength = 0;
  let repeatOffsetCandidateCount = 0;
  let rep0 = repOffsets[0];
  let rep1 = repOffsets[1];
  let rep2 = repOffsets[2];
  const historyLength = history.length;
  const historyCap = history.buffer.length;
  const historyOldestPos = historyCap > 0 ? (history.writePos - historyLength + historyCap) % historyCap : 0;
  const historyBuffer = history.buffer;
  if (numSequences > 0) {
    const bitstreamSize = sectionStart + seqSize - pos;
    if (bitstreamSize < 1) {
      throw new ZstdError("Sequences bitstream empty", "corruption_detected");
    }
    const reader = new BitReaderReverse(blockContent, pos, bitstreamSize);
    reader.skipPadding();
    let stateLL = llTableLog > 0 ? reader.readBits(llTableLog) : 0;
    let stateOF = ofTableLog > 0 ? reader.readBits(ofTableLog) : 0;
    let stateML = mlTableLog > 0 ? reader.readBits(mlTableLog) : 0;
    const llTableLength = llTable.length;
    const ofTableLength = ofTable.length;
    const mlTableLength = mlTable.length;
    if (stateOF >>> 0 >= ofTableLength || stateML >>> 0 >= mlTableLength || stateLL >>> 0 >= llTableLength) {
      throw new ZstdError("FSE invalid state", "corruption_detected");
    }
    const llSymbolByState = llTable.symbol;
    const ofSymbolByState = ofTable.symbol;
    const mlSymbolByState = mlTable.symbol;
    const llNumBitsByState = llTable.numBits;
    const ofNumBitsByState = ofTable.numBits;
    const mlNumBitsByState = mlTable.numBits;
    const llBaselineByState = llTable.baseline;
    const ofBaselineByState = ofTable.baseline;
    const mlBaselineByState = mlTable.baseline;
    const lastSequenceIndex = numSequences - 1;
    for (let i = 0; i <= lastSequenceIndex; i++) {
      const offsetCode = ofSymbolByState[stateOF];
      const mlCode = mlSymbolByState[stateML];
      const llCode = llSymbolByState[stateLL];
      const offsetValue = (1 << offsetCode) + reader.readBitsFastOrZero(offsetCode);
      if (mlCode >= ML_BASELINE2.length)
        throw new ZstdError("Invalid match length code", "corruption_detected");
      if (llCode >= LL_BASELINE2.length)
        throw new ZstdError("Invalid literals length code", "corruption_detected");
      const mlNumBits = ML_NUMBITS2[mlCode];
      const mlBase = ML_BASELINE2[mlCode];
      const matchLength = mlBase + reader.readBitsFastOrZero(mlNumBits);
      const llNumBits = LL_NUMBITS2[llCode];
      const llBase = LL_BASELINE2[llCode];
      const literalsLength = llCode <= 15 ? llCode : llBase + reader.readBitsFastOrZero(llNumBits);
      if (collectMetadata) {
        if (offsetValue <= 2 || offsetValue === 3 && literalsLength > 0) {
          repeatOffsetCandidateCount++;
        }
        totalMatchLength += matchLength;
      }
      if (literalsLength > 0) {
        const litEnd = litPos + literalsLength;
        if (litEnd > literals.length) {
          throw new ZstdError("Literals overrun while executing sequence", "corruption_detected");
        }
        if (literalsLength <= FAST_LITERAL_COPY_LOOP_THRESHOLD) {
          for (let j = 0; j < literalsLength; j++) {
            output[outPos + j] = literals[litPos + j];
          }
        } else {
          output.set(literals.subarray(litPos, litEnd), outPos);
        }
        outPos += literalsLength;
        litPos = litEnd;
      }
      const ll0 = literalsLength === 0;
      let offset;
      let repeatIndex = null;
      const isNonRepeat = offsetValue > 3 || offsetValue === 3 && ll0;
      if (isNonRepeat) {
        if (offsetValue === 3) {
          offset = rep0 - 1;
          if (offset === 0) {
            throw new ZstdError("Invalid match offset: repeat1-1 is 0", "corruption_detected");
          }
        } else {
          offset = offsetValue - 3;
        }
      } else {
        if (ll0) {
          repeatIndex = offsetValue === 1 ? 1 : 2;
        } else {
          repeatIndex = offsetValue - 1;
        }
        offset = repeatIndex === 0 ? rep0 : repeatIndex === 1 ? rep1 : rep2;
      }
      const produced = outPos - outputStart;
      const producedPlusHistory = produced + historyLength;
      const maxReachBack = producedPlusHistory < windowSize ? producedPlusHistory : windowSize;
      if (offset <= 0 || offset > maxReachBack) {
        throw new ZstdError(`Invalid match offset: offset=${offset} maxReachBack=${maxReachBack} produced=${produced} history=${historyLength} window=${windowSize}`, "corruption_detected");
      }
      const historyBytesNeeded = offset > produced ? offset - produced : 0;
      if (matchLength > 0) {
        if (historyBytesNeeded === 0) {
          const copyStart = outPos - offset;
          if (offset >= matchLength) {
            output.copyWithin(outPos, copyStart, copyStart + matchLength);
            outPos += matchLength;
          } else if (offset <= FAST_SMALL_OFFSET_LOOP_THRESHOLD) {
            for (let j = 0; j < matchLength; j++) {
              output[outPos + j] = output[outPos - offset + j];
            }
            outPos += matchLength;
          } else {
            let copied = offset;
            output.copyWithin(outPos, copyStart, copyStart + copied);
            outPos += copied;
            while (copied < matchLength) {
              const toCopy = Math.min(copied, matchLength - copied);
              output.copyWithin(outPos, outPos - copied, outPos - copied + toCopy);
              outPos += toCopy;
              copied += toCopy;
            }
          }
        } else {
          if (historyCap === 0) {
            throw new ZstdError("Invalid history read", "corruption_detected");
          }
          const historyCopyLen = Math.min(historyBytesNeeded, matchLength);
          const historyStart = historyLength - historyBytesNeeded;
          if (historyStart < 0 || historyStart + historyCopyLen > historyLength) {
            throw new ZstdError("Invalid history read", "corruption_detected");
          }
          let physicalStart = historyOldestPos + historyStart;
          if (physicalStart >= historyCap) {
            physicalStart -= historyCap;
          }
          const firstHistoryChunk = Math.min(historyCopyLen, historyCap - physicalStart);
          const remainingHistoryChunk = historyCopyLen - firstHistoryChunk;
          if (historyCopyLen <= FAST_HISTORY_COPY_LOOP_THRESHOLD) {
            let phys = physicalStart;
            for (let j = 0; j < historyCopyLen; j++) {
              output[outPos + j] = historyBuffer[phys];
              phys = phys + 1 === historyCap ? 0 : phys + 1;
            }
            outPos += historyCopyLen;
          } else {
            output.set(historyBuffer.subarray(physicalStart, physicalStart + firstHistoryChunk), outPos);
            outPos += firstHistoryChunk;
            if (remainingHistoryChunk > 0) {
              output.set(historyBuffer.subarray(0, remainingHistoryChunk), outPos);
              outPos += remainingHistoryChunk;
            }
          }
          const matchRemaining = matchLength - historyCopyLen;
          if (matchRemaining > 0) {
            const copyStart = outPos - offset;
            if (offset >= matchRemaining) {
              output.copyWithin(outPos, copyStart, copyStart + matchRemaining);
              outPos += matchRemaining;
            } else if (offset <= FAST_SMALL_OFFSET_LOOP_THRESHOLD) {
              for (let j = 0; j < matchRemaining; j++) {
                output[outPos + j] = output[outPos - offset + j];
              }
              outPos += matchRemaining;
            } else {
              let copied = offset;
              output.copyWithin(outPos, copyStart, copyStart + copied);
              outPos += copied;
              while (copied < matchRemaining) {
                const toCopy = Math.min(copied, matchRemaining - copied);
                output.copyWithin(outPos, outPos - copied, outPos - copied + toCopy);
                outPos += toCopy;
                copied += toCopy;
              }
            }
          }
        }
      }
      if (isNonRepeat) {
        rep2 = rep1;
        rep1 = rep0;
        rep0 = offset;
      } else if (repeatIndex === 1) {
        rep1 = rep0;
        rep0 = offset;
      } else if (repeatIndex === 2) {
        rep2 = rep1;
        rep1 = rep0;
        rep0 = offset;
      }
      if (i < lastSequenceIndex) {
        const llBits = llNumBitsByState[stateLL];
        const mlBits = mlNumBitsByState[stateML];
        const ofBits = ofNumBitsByState[stateOF];
        stateLL = llBaselineByState[stateLL] + reader.readBitsFastOrZero(llBits);
        stateML = mlBaselineByState[stateML] + reader.readBitsFastOrZero(mlBits);
        stateOF = ofBaselineByState[stateOF] + reader.readBitsFastOrZero(ofBits);
        if (stateOF >>> 0 >= ofTableLength || stateML >>> 0 >= mlTableLength || stateLL >>> 0 >= llTableLength) {
          throw new ZstdError("FSE invalid state", "corruption_detected");
        }
      }
    }
  }
  if (litPos < literals.length) {
    const remaining = literals.length - litPos;
    if (remaining <= FAST_LITERAL_COPY_LOOP_THRESHOLD) {
      for (let i = 0; i < remaining; i++) {
        output[outPos + i] = literals[litPos + i];
      }
    } else {
      output.set(literals.subarray(litPos), outPos);
    }
    outPos += remaining;
  }
  if (updateHistory && outPos > outputStart) {
    appendRangeToHistoryWindow(history, output, outputStart, outPos - outputStart);
  }
  repOffsets[0] = rep0;
  repOffsets[1] = rep1;
  repOffsets[2] = rep2;
  return {
    written: outPos - outputStart,
    tables: { llTable, llTableLog, ofTable, ofTableLog, mlTable, mlTableLog },
    metadata: {
      numSequences,
      llMode,
      ofMode,
      mlMode,
      llTableLog,
      ofTableLog,
      mlTableLog,
      totalMatchLength,
      repeatOffsetCandidateCount
    }
  };
}

// node_modules/zstdify/dist/bitstream/bitReader.js
var BitReader = class {
  data;
  byteOffset;
  bitOffset;
  // 0-7, bits consumed in current byte
  constructor(data, byteOffset = 0) {
    this.data = data;
    this.byteOffset = byteOffset;
    this.bitOffset = 0;
  }
  /** Current byte position (after last fully consumed byte) */
  get position() {
    return this.byteOffset;
  }
  /** Total bits consumed */
  get bitsConsumed() {
    return this.byteOffset * 8 + this.bitOffset;
  }
  /** True if no more bits available */
  get atEnd() {
    return this.byteOffset >= this.data.length;
  }
  /** Ensure at least n bits are available. Throws if not. */
  ensure(n) {
    const bitsAvailable = (this.data.length - this.byteOffset) * 8 - this.bitOffset;
    if (bitsAvailable < n) {
      throw new RangeError(`BitReader: requested ${n} bits, only ${bitsAvailable} available`);
    }
  }
  /** Read n bits (1-32), LSB first */
  readBits(n) {
    if (n < 1 || n > 32) {
      throw new RangeError(`BitReader.readBits: n must be 1-32, got ${n}`);
    }
    this.ensure(n);
    let value = 0;
    let bitsLeft = n;
    while (bitsLeft > 0) {
      const byte = this.data[this.byteOffset] ?? 0;
      const bitsInByte = 8 - this.bitOffset;
      const take = Math.min(bitsLeft, bitsInByte);
      const mask = (1 << take) - 1;
      const shift = this.bitOffset;
      value |= (byte >> shift & mask) << n - bitsLeft;
      this.bitOffset += take;
      bitsLeft -= take;
      if (this.bitOffset >= 8) {
        this.byteOffset++;
        this.bitOffset = 0;
      }
    }
    return value;
  }
  /** Align to next byte boundary (skip remaining bits in current byte) */
  align() {
    if (this.bitOffset !== 0) {
      this.bitOffset = 0;
      this.byteOffset++;
    }
  }
  /** Read a full byte (convenience, must be aligned or will read across boundary) */
  readByte() {
    if (this.bitOffset === 0) {
      if (this.byteOffset >= this.data.length) {
        throw new RangeError("BitReader: no more bytes");
      }
      const v = this.data[this.byteOffset++];
      if (v === void 0)
        throw new RangeError("BitReader: no more bytes");
      return v;
    }
    return this.readBits(8);
  }
  /** Slice remaining bytes from current position (after aligning) */
  readRemainingBytes() {
    this.align();
    if (this.byteOffset >= this.data.length) {
      return new Uint8Array(0);
    }
    return this.data.subarray(this.byteOffset);
  }
};

// node_modules/zstdify/dist/decode/literals.js
function parseLiteralsSectionHeader(data, offset) {
  if (offset >= data.length) {
    throw new ZstdError("Literals section header truncated", "corruption_detected");
  }
  const b0 = data[offset];
  const blockType = b0 & 3;
  const sizeFormat = b0 >> 2 & 3;
  if (blockType === 0 || blockType === 1) {
    if (sizeFormat === 0 || sizeFormat === 2) {
      const regeneratedSize = b0 >> 3;
      return {
        header: { blockType, regeneratedSize, headerSize: 1, numStreams: 1 },
        dataOffset: offset + 1
      };
    }
    if (sizeFormat === 1) {
      if (offset + 2 > data.length) {
        throw new ZstdError("Literals section header truncated", "corruption_detected");
      }
      const b1 = data[offset + 1];
      const regeneratedSize = (b0 >> 4) + (b1 << 4);
      return {
        header: { blockType, regeneratedSize, headerSize: 2, numStreams: 1 },
        dataOffset: offset + 2
      };
    }
    if (sizeFormat === 3) {
      if (offset + 3 > data.length) {
        throw new ZstdError("Literals section header truncated", "corruption_detected");
      }
      const b1 = data[offset + 1];
      const b2 = data[offset + 2];
      const regeneratedSize = (b0 >> 4) + (b1 << 4) + (b2 << 12);
      return {
        header: { blockType, regeneratedSize, headerSize: 3, numStreams: 1 },
        dataOffset: offset + 3
      };
    }
  }
  if (blockType === 2 || blockType === 3) {
    const reader = new BitReader(data, offset);
    const parsedBlockType = reader.readBits(2);
    const parsedSizeFormat = reader.readBits(2);
    if (parsedBlockType !== blockType || parsedSizeFormat !== sizeFormat) {
      throw new ZstdError("Invalid literals section header", "corruption_detected");
    }
    const numStreams = sizeFormat === 0 ? 1 : 4;
    const sizeBits = sizeFormat <= 1 ? 10 : sizeFormat === 2 ? 14 : 18;
    const regeneratedSize = reader.readBits(sizeBits);
    const compressedSize = reader.readBits(sizeBits);
    reader.align();
    const headerSize = reader.position - offset;
    if (offset + headerSize > data.length) {
      throw new ZstdError("Literals section header truncated", "corruption_detected");
    }
    return {
      header: { blockType, regeneratedSize, compressedSize, headerSize, numStreams },
      dataOffset: offset + headerSize
    };
  }
  throw new ZstdError("Invalid literals section header", "corruption_detected");
}
function decodeRawLiterals(data, offset, size) {
  if (offset + size > data.length) {
    throw new ZstdError("Raw literals truncated", "corruption_detected");
  }
  return data.subarray(offset, offset + size);
}
function decodeRLELiterals(data, offset, size) {
  if (offset >= data.length) {
    throw new ZstdError("RLE literals truncated", "corruption_detected");
  }
  const byte = data[offset];
  const result = new Uint8Array(size);
  result.fill(byte);
  return result;
}
function weightsToHuffmanTable(weights) {
  let partialSum = 0;
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i] ?? 0;
    if (w > 0)
      partialSum += 1 << w - 1;
  }
  if (partialSum === 0) {
    throw new ZstdError("Invalid Huffman weights", "corruption_detected");
  }
  const maxNumBits = 32 - Math.clz32(partialSum);
  const total = 1 << maxNumBits;
  const remainder = total - partialSum;
  if (remainder <= 0 || (remainder & remainder - 1) !== 0) {
    throw new ZstdError("Invalid Huffman weights: cannot complete to power of 2", "corruption_detected");
  }
  const lastWeight = 32 - Math.clz32(remainder);
  const fullWeights = new Array(256).fill(0);
  for (let i = 0; i < weights.length; i++) {
    fullWeights[i] = weights[i] ?? 0;
  }
  fullWeights[weights.length] = lastWeight;
  const numBits = weightsToNumBits(fullWeights, maxNumBits);
  const table = buildHuffmanDecodeTable(numBits, maxNumBits);
  return { table, maxNumBits };
}
function decodeHuffmanStreamByCountInto(data, streamOffset, streamLength, table, maxNumBits, out, outOffset, numSymbols) {
  if (numSymbols === 0)
    return 0;
  if (streamLength <= 0) {
    throw new ZstdError("Huffman stream truncated", "corruption_detected");
  }
  const reader = new BitReaderReverse(data, streamOffset, streamLength);
  reader.skipPadding();
  let written = 0;
  for (let i = 0; i < numSymbols; i++) {
    const peek = reader.readBitsFast(maxNumBits);
    if (peek < 0 || peek >= table.length) {
      throw new ZstdError("Huffman invalid code", "corruption_detected");
    }
    const numBits = table.numBits[peek];
    if (numBits === 0) {
      throw new ZstdError("Huffman invalid code", "corruption_detected");
    }
    const overshoot = maxNumBits - numBits;
    if (overshoot > 0) {
      reader.unreadBits(overshoot);
    }
    out[outOffset + written] = table.symbol[peek];
    written++;
  }
  return written;
}
function decodeHuffmanStreamToEndInto(data, streamOffset, streamLength, table, maxNumBits, out, outOffset) {
  if (streamLength <= 0) {
    throw new ZstdError("Huffman stream truncated", "corruption_detected");
  }
  const stream = data.subarray(streamOffset, streamOffset + streamLength);
  const lastByte = stream[stream.length - 1];
  if (lastByte === 0) {
    throw new ZstdError("Huffman invalid end marker", "corruption_detected");
  }
  const highestSetBit = 31 - Math.clz32(lastByte);
  const paddingBits = 8 - highestSetBit;
  let bitOffset = streamLength * 8 - paddingBits;
  const streamBits = streamLength * 8;
  const mask = (1 << maxNumBits) - 1;
  let nextBitOffset = bitOffset - maxNumBits;
  let state = 0;
  if (nextBitOffset >= 0) {
    const byteIndex = nextBitOffset >>> 3;
    const bitInByte = nextBitOffset & 7;
    const word0 = (stream[byteIndex] ?? 0) | (stream[byteIndex + 1] ?? 0) << 8 | (stream[byteIndex + 2] ?? 0) << 16 | (stream[byteIndex + 3] ?? 0) << 24;
    if (bitInByte + maxNumBits <= 32) {
      state = word0 >>> bitInByte & (1 << maxNumBits) - 1;
    } else {
      const low = word0 >>> bitInByte;
      const highBits = maxNumBits - (32 - bitInByte);
      const word1 = (stream[byteIndex + 4] ?? 0) | (stream[byteIndex + 5] ?? 0) << 8 | (stream[byteIndex + 6] ?? 0) << 16 | (stream[byteIndex + 7] ?? 0) << 24;
      const high = (word1 & (1 << highBits) - 1) << 32 - bitInByte;
      state = (low | high) >>> 0;
    }
  } else {
    for (let i = 0; i < maxNumBits; i++) {
      const abs = nextBitOffset + i;
      if (abs < 0 || abs >= streamBits)
        continue;
      const byteIndex = abs >>> 3;
      const bitInByte = abs & 7;
      state |= (stream[byteIndex] >>> bitInByte & 1) << i;
    }
    state >>>= 0;
  }
  bitOffset = nextBitOffset;
  let written = 0;
  while (bitOffset > -maxNumBits) {
    if (state < 0 || state >= table.length) {
      throw new ZstdError("Huffman invalid code", "corruption_detected");
    }
    const numBits = table.numBits[state];
    if (numBits === 0) {
      throw new ZstdError("Huffman invalid code", "corruption_detected");
    }
    if (outOffset + written >= out.length) {
      throw new ZstdError("Huffman literals size mismatch", "corruption_detected");
    }
    out[outOffset + written] = table.symbol[state];
    written++;
    let rest = 0;
    nextBitOffset = bitOffset - numBits;
    if (numBits > 0) {
      if (nextBitOffset >= 0) {
        const byteIndex = nextBitOffset >>> 3;
        const bitInByte = nextBitOffset & 7;
        const word0 = (stream[byteIndex] ?? 0) | (stream[byteIndex + 1] ?? 0) << 8 | (stream[byteIndex + 2] ?? 0) << 16 | (stream[byteIndex + 3] ?? 0) << 24;
        if (bitInByte + numBits <= 32) {
          rest = word0 >>> bitInByte & (1 << numBits) - 1;
        } else {
          const low = word0 >>> bitInByte;
          const highBits = numBits - (32 - bitInByte);
          const word1 = (stream[byteIndex + 4] ?? 0) | (stream[byteIndex + 5] ?? 0) << 8 | (stream[byteIndex + 6] ?? 0) << 16 | (stream[byteIndex + 7] ?? 0) << 24;
          const high = (word1 & (1 << highBits) - 1) << 32 - bitInByte;
          rest = (low | high) >>> 0;
        }
      } else {
        for (let i = 0; i < numBits; i++) {
          const abs = nextBitOffset + i;
          if (abs < 0 || abs >= streamBits)
            continue;
          const byteIndex = abs >>> 3;
          const bitInByte = abs & 7;
          rest |= (stream[byteIndex] >>> bitInByte & 1) << i;
        }
        rest >>>= 0;
      }
    }
    bitOffset = nextBitOffset;
    state = (state << numBits & mask) + rest;
  }
  if (bitOffset !== -maxNumBits) {
    throw new ZstdError("Huffman stream did not end cleanly", "corruption_detected");
  }
  return written;
}
function parseFourStreamJumpTable(data, pos, totalStreamsSize) {
  if (totalStreamsSize < 10) {
    throw new ZstdError("4-stream mode requires at least 10 bytes", "corruption_detected");
  }
  const stream1Size = data[pos] | data[pos + 1] << 8;
  const stream2Size = data[pos + 2] | data[pos + 3] << 8;
  const stream3Size = data[pos + 4] | data[pos + 5] << 8;
  const stream4Size = totalStreamsSize - 6 - stream1Size - stream2Size - stream3Size;
  if (stream4Size < 0) {
    throw new ZstdError(`Invalid jump table in 4-stream literals: total=${totalStreamsSize} s1=${stream1Size} s2=${stream2Size} s3=${stream3Size}`, "corruption_detected");
  }
  return {
    stream1Size,
    stream2Size,
    stream3Size,
    stream4Size,
    streamOffset: pos + 6
  };
}
function decodeFourHuffmanStreamsInto(data, streamOffset, stream1Size, stream2Size, stream3Size, stream4Size, table, maxNumBits, out) {
  let outPos = 0;
  let pos = streamOffset;
  const decodeOne = (size) => {
    const written = decodeHuffmanStreamToEndInto(data, pos, size, table, maxNumBits, out, outPos);
    outPos += written;
    pos += size;
  };
  decodeOne(stream1Size);
  decodeOne(stream2Size);
  decodeOne(stream3Size);
  decodeOne(stream4Size);
  if (outPos !== out.length) {
    throw new ZstdError("Huffman literals size mismatch", "corruption_detected");
  }
}
function decodeCompressedLiterals(data, offset, compressedSize, regeneratedSize, numStreams) {
  let pos = offset;
  let huffmanTable;
  if (pos >= data.length) {
    throw new ZstdError("Huffman tree description truncated", "corruption_detected");
  }
  const headerByte = data[pos];
  pos++;
  let weights;
  let treeBytes;
  if (headerByte >= 128) {
    const numWeights = headerByte - 127;
    const { weights: w, bytesRead } = readWeightsDirect(data, pos, numWeights);
    weights = w;
    treeBytes = 1 + bytesRead;
    pos += bytesRead;
  } else {
    const { weights: w, bytesRead } = readWeightsFSE(data, pos, headerByte);
    weights = w;
    treeBytes = 1 + bytesRead;
    pos += headerByte;
  }
  huffmanTable = weightsToHuffmanTable(weights);
  const totalStreamsSize = compressedSize - treeBytes;
  if (totalStreamsSize <= 0) {
    throw new ZstdError("Invalid literals compressed size", "corruption_detected");
  }
  const result = new Uint8Array(regeneratedSize);
  if (numStreams === 1) {
    decodeHuffmanStreamByCountInto(data, pos, totalStreamsSize, huffmanTable.table, huffmanTable.maxNumBits, result, 0, regeneratedSize);
  } else {
    const jump = parseFourStreamJumpTable(data, pos, totalStreamsSize);
    decodeFourHuffmanStreamsInto(data, jump.streamOffset, jump.stream1Size, jump.stream2Size, jump.stream3Size, jump.stream4Size, huffmanTable.table, huffmanTable.maxNumBits, result);
  }
  return {
    literals: result,
    huffmanTable,
    bytesRead: compressedSize
  };
}
function decodeTreelessLiterals(data, offset, compressedSize, regeneratedSize, numStreams, huffmanTable) {
  const result = new Uint8Array(regeneratedSize);
  const pos = offset;
  if (numStreams === 1) {
    decodeHuffmanStreamByCountInto(data, pos, compressedSize, huffmanTable.table, huffmanTable.maxNumBits, result, 0, regeneratedSize);
  } else {
    const jump = parseFourStreamJumpTable(data, pos, compressedSize);
    decodeFourHuffmanStreamsInto(data, jump.streamOffset, jump.stream1Size, jump.stream2Size, jump.stream3Size, jump.stream4Size, huffmanTable.table, huffmanTable.maxNumBits, result);
  }
  return { literals: result, bytesRead: compressedSize };
}

// node_modules/zstdify/dist/decode/decompressFrame.js
function decompressFrame(data, offset, header, dictionary, maxSize, validateChecksum = true, reuseContext, debugTrace) {
  let pos = offset + 4 + header.headerSize;
  const knownOutputSize = header.contentSize ?? null;
  if (knownOutputSize !== null && maxSize !== void 0 && knownOutputSize > maxSize) {
    throw new ZstdError("Decompressed size exceeds maxSize", "parameter_unsupported");
  }
  let outputBuffer = knownOutputSize !== null ? new Uint8Array(knownOutputSize) : new Uint8Array(0);
  let totalSize = 0;
  const repOffsets = dictionary?.repOffsets ? [dictionary.repOffsets[0], dictionary.repOffsets[1], dictionary.repOffsets[2]] : [1, 4, 8];
  const history = getOrCreateHistoryWindow(header.windowSize, dictionary?.historyPrefix, reuseContext);
  let prevHuffmanTable = dictionary?.huffmanTable ?? null;
  let prevSeqTables = dictionary?.sequenceTables ?? null;
  const ensureOutputCapacity = (additional) => {
    const needed = totalSize + additional;
    if (needed <= outputBuffer.length) {
      return;
    }
    let nextCapacity = outputBuffer.length === 0 ? 64 * 1024 : outputBuffer.length;
    while (nextCapacity < needed) {
      nextCapacity *= 2;
    }
    const grown = new Uint8Array(nextCapacity);
    if (totalSize > 0) {
      grown.set(outputBuffer.subarray(0, totalSize), 0);
    }
    outputBuffer = grown;
  };
  const appendOutput = (chunk) => {
    if (chunk.length === 0) {
      return;
    }
    ensureOutputCapacity(chunk.length);
    outputBuffer.set(chunk, totalSize);
    totalSize += chunk.length;
  };
  let blockIndex = 0;
  const onBlockDecoded = debugTrace?.onBlockDecoded;
  while (true) {
    if (pos + 3 > data.length) {
      throw new ZstdError("Block header truncated", "corruption_detected");
    }
    const blockHeaderPos = pos;
    const block = parseBlockHeader(data, pos);
    pos += 3;
    const blockOutputStart = totalSize;
    let blockLiteralsInfo;
    let blockSequencesInfo;
    if (block.blockType === 0) {
      if (pos + block.blockSize > data.length) {
        throw new ZstdError("Raw literals truncated", "corruption_detected");
      }
      ensureOutputCapacity(block.blockSize);
      outputBuffer.set(data.subarray(pos, pos + block.blockSize), totalSize);
      if (!block.lastBlock) {
        appendRangeToHistoryWindow(history, data, pos, block.blockSize);
      }
      totalSize += block.blockSize;
      pos += block.blockSize;
    } else if (block.blockType === 1) {
      if (pos >= data.length) {
        throw new ZstdError("RLE literals truncated", "corruption_detected");
      }
      const byte = data[pos];
      ensureOutputCapacity(block.blockSize);
      outputBuffer.fill(byte, totalSize, totalSize + block.blockSize);
      if (!block.lastBlock) {
        appendRLEToHistoryWindow(history, byte, block.blockSize);
      }
      totalSize += block.blockSize;
      pos += 1;
    } else if (block.blockType === 2) {
      if (pos + block.blockSize > data.length) {
        throw new ZstdError("Compressed block truncated", "corruption_detected");
      }
      const blockContent = data.subarray(pos, pos + block.blockSize);
      const { header: litHeader, dataOffset: litDataOffset } = parseLiteralsSectionHeader(blockContent, 0);
      if (onBlockDecoded) {
        blockLiteralsInfo = {
          blockType: litHeader.blockType,
          regeneratedSize: litHeader.regeneratedSize,
          compressedSize: litHeader.compressedSize,
          numStreams: litHeader.numStreams,
          headerSize: litHeader.headerSize
        };
      }
      let literals;
      let litBytesConsumed;
      if (litHeader.blockType === 0) {
        literals = decodeRawLiterals(blockContent, litDataOffset, litHeader.regeneratedSize);
        litBytesConsumed = litHeader.headerSize + litHeader.regeneratedSize;
      } else if (litHeader.blockType === 1) {
        literals = decodeRLELiterals(blockContent, litDataOffset, litHeader.regeneratedSize);
        litBytesConsumed = litHeader.headerSize + 1;
      } else if (litHeader.blockType === 2) {
        const comp = decodeCompressedLiterals(blockContent, litDataOffset, litHeader.compressedSize, litHeader.regeneratedSize, litHeader.numStreams);
        literals = comp.literals;
        prevHuffmanTable = comp.huffmanTable;
        litBytesConsumed = litHeader.headerSize + comp.bytesRead;
      } else {
        if (!prevHuffmanTable) {
          throw new ZstdError("Treeless literals without previous Huffman table", "corruption_detected");
        }
        const comp = decodeTreelessLiterals(blockContent, litDataOffset, litHeader.compressedSize, litHeader.regeneratedSize, litHeader.numStreams, prevHuffmanTable);
        literals = comp.literals;
        litBytesConsumed = litHeader.headerSize + comp.bytesRead;
      }
      const seqSectionSize = block.blockSize - litBytesConsumed;
      if (seqSectionSize <= 0) {
        appendOutput(literals);
        if (!block.lastBlock) {
          appendToHistoryWindow(history, literals);
        }
      } else {
        ensureOutputCapacity(128 * 1024);
        const start = totalSize;
        const { written, tables, metadata } = decodeAndExecuteSequencesInto(blockContent, litBytesConsumed, seqSectionSize, prevSeqTables, literals, header.windowSize, outputBuffer, start, repOffsets, history, !block.lastBlock, !!onBlockDecoded);
        prevSeqTables = tables;
        if (onBlockDecoded) {
          blockSequencesInfo = {
            numSequences: metadata.numSequences,
            llMode: metadata.llMode,
            ofMode: metadata.ofMode,
            mlMode: metadata.mlMode,
            llTableLog: metadata.llTableLog,
            ofTableLog: metadata.ofTableLog,
            mlTableLog: metadata.mlTableLog,
            repeatOffsetCandidateCount: metadata.repeatOffsetCandidateCount
          };
        }
        totalSize += written;
      }
      pos += block.blockSize;
    } else {
      throw new ZstdError("Unsupported block type", "corruption_detected");
    }
    if (onBlockDecoded) {
      onBlockDecoded({
        blockIndex,
        blockType: block.blockType,
        blockSize: block.blockSize,
        lastBlock: block.lastBlock,
        inputOffset: blockHeaderPos,
        outputStart: blockOutputStart,
        outputEnd: totalSize,
        literals: blockLiteralsInfo,
        sequences: blockSequencesInfo
      });
    }
    blockIndex++;
    if (maxSize !== void 0 && totalSize > maxSize) {
      throw new ZstdError("Decompressed size exceeds maxSize", "parameter_unsupported");
    }
    if (block.lastBlock)
      break;
  }
  const output = outputBuffer.subarray(0, totalSize);
  if (header.contentSize !== null && output.length !== header.contentSize) {
    throw new ZstdError("Frame content size mismatch", "corruption_detected");
  }
  if (header.hasContentChecksum) {
    if (pos + 4 > data.length) {
      throw new ZstdError("Content checksum truncated", "corruption_detected");
    }
    if (validateChecksum) {
      const storedChecksum = readU32LE(data, pos);
      if (!validateContentChecksum(output, storedChecksum)) {
        throw new ZstdError("Content checksum mismatch", "corruption_detected");
      }
    }
    pos += 4;
    return { output, bytesConsumed: pos - offset };
  }
  return { output, bytesConsumed: pos - offset };
}

// node_modules/zstdify/dist/frame/frameHeader.js
var ZSTD_MAGIC2 = 4247762216;
function parseFrameHeader(data, offset) {
  if (offset + 2 > data.length) {
    throw new ZstdError("Frame header truncated", "corruption_detected");
  }
  const fhd = data[offset];
  offset++;
  const frameContentSizeFlag = fhd >> 6 & 3;
  const singleSegment = (fhd >> 5 & 1) === 1;
  const contentChecksumFlag = (fhd >> 2 & 1) === 1;
  const dictionaryIdFlag = fhd & 3;
  if ((fhd & 16) !== 0) {
    throw new ZstdError("Unused bit set in frame header", "corruption_detected");
  }
  if ((fhd & 8) !== 0) {
    throw new ZstdError("Reserved bit set in frame header", "corruption_detected");
  }
  let windowSize = 0;
  let contentSize = null;
  let headerSize = 1;
  if (singleSegment) {
  } else {
    if (offset + 1 > data.length) {
      throw new ZstdError("Frame header truncated (window descriptor)", "corruption_detected");
    }
    const wd = data[offset];
    offset++;
    headerSize++;
    const exponent = wd >> 3 & 31;
    const mantissa = wd & 7;
    const windowLog = 10 + exponent;
    const windowBase = 2 ** windowLog;
    const windowAdd = windowBase / 8 * mantissa;
    windowSize = windowBase + windowAdd;
  }
  let dictionaryId = null;
  const didFieldSize = [0, 1, 2, 4][dictionaryIdFlag];
  if (didFieldSize > 0) {
    if (offset + didFieldSize > data.length) {
      throw new ZstdError("Frame header truncated (dictionary ID)", "corruption_detected");
    }
    let did = 0;
    if (didFieldSize === 1)
      did = data[offset];
    else if (didFieldSize === 2)
      did = data[offset] | data[offset + 1] << 8;
    else
      did = readU32LE(data, offset);
    dictionaryId = did !== 0 ? did : null;
    offset += didFieldSize;
    headerSize += didFieldSize;
  }
  const fcsFieldSize = frameContentSizeFlag === 0 ? singleSegment ? 1 : 0 : frameContentSizeFlag === 1 ? 2 : frameContentSizeFlag === 2 ? 4 : 8;
  if (fcsFieldSize > 0) {
    if (offset + fcsFieldSize > data.length) {
      throw new ZstdError("Frame header truncated (content size)", "corruption_detected");
    }
    contentSize = readFrameContentSize(data, offset, fcsFieldSize);
    offset += fcsFieldSize;
    headerSize += fcsFieldSize;
    if (singleSegment) {
      windowSize = contentSize;
    }
  }
  return {
    headerSize,
    windowSize,
    contentSize,
    hasContentChecksum: contentChecksumFlag,
    dictionaryId: dictionaryId !== 0 ? dictionaryId : null,
    singleSegment
  };
}
function readFrameContentSize(data, offset, size) {
  if (size === 1) {
    return data[offset];
  }
  if (size === 2) {
    return 256 + (data[offset] | data[offset + 1] << 8);
  }
  if (size === 4) {
    return readU32LE(data, offset);
  }
  if (size === 8) {
    const lo = readU32LE(data, offset);
    const hi = readU32LE(data, offset + 4);
    const v = lo + hi * 4294967296;
    if (v > Number.MAX_SAFE_INTEGER) {
      throw new ZstdError("Content size exceeds safe integer range", "parameter_unsupported");
    }
    return v;
  }
  throw new ZstdError(`Invalid FCS field size: ${size}`, "corruption_detected");
}
function parseZstdFrame(data, offset) {
  if (offset + 4 > data.length) {
    throw new ZstdError("Input too short for magic number", "corruption_detected");
  }
  const magic = readU32LE(data, offset);
  if (magic !== ZSTD_MAGIC2) {
    throw new ZstdError(`Invalid zstd magic: 0x${magic.toString(16)}`, "corruption_detected");
  }
  const header = parseFrameHeader(data, offset + 4);
  return { magic, header };
}

// node_modules/zstdify/dist/frame/skippable.js
var SKIPPABLE_FRAME_MAGIC = 407710288;
var SKIPPABLE_FRAME_MAGIC_MASK = 4294967280;
function isSkippableFrame(data, offset) {
  if (offset + 4 > data.length)
    return false;
  const magic = readU32LE(data, offset);
  return (magic & SKIPPABLE_FRAME_MAGIC_MASK) === SKIPPABLE_FRAME_MAGIC;
}
function getSkippableFrameSize(data, offset) {
  if (offset + 8 > data.length) {
    throw new ZstdError("Skippable frame: truncated header", "corruption_detected");
  }
  return readU32LE(data, offset + 4);
}
function skipSkippableFrame(data, offset) {
  const frameSize = getSkippableFrameSize(data, offset);
  const nextOffset = offset + 8 + frameSize;
  if (nextOffset > data.length) {
    throw new ZstdError("Skippable frame: truncated payload", "corruption_detected");
  }
  return nextOffset;
}

// node_modules/zstdify/dist/decompress.js
function decompress(input, options) {
  if (input.length === 0) {
    throw new ZstdError("Empty input", "corruption_detected");
  }
  const maxSize = options?.maxSize;
  const dictionary = options?.dictionary;
  const validateChecksum = options?.validateChecksum !== false;
  const dictionaryBytes = dictionary instanceof Uint8Array ? dictionary : dictionary?.bytes;
  const providedDictionaryId = dictionary instanceof Uint8Array ? null : dictionary?.id ?? null;
  const normalizedDictionary = dictionaryBytes && dictionaryBytes.length > 0 ? normalizeDecoderDictionary(dictionaryBytes, providedDictionaryId) : null;
  const dictionaryId = normalizedDictionary?.dictionaryId ?? providedDictionaryId;
  const chunks = [];
  let totalOutputSize = 0;
  let offset = 0;
  while (offset < input.length) {
    if (offset + 4 > input.length) {
      throw new ZstdError("Truncated input", "corruption_detected");
    }
    if (isSkippableFrame(input, offset)) {
      offset = skipSkippableFrame(input, offset);
      continue;
    }
    const { header } = parseZstdFrame(input, offset);
    if (header.dictionaryId !== null && !dictionaryBytes) {
      throw new ZstdError("Dictionary frame requires dictionary option", "parameter_unsupported");
    }
    if (header.dictionaryId !== null && dictionaryId !== null && dictionaryId !== header.dictionaryId) {
      throw new ZstdError("Dictionary ID mismatch", "corruption_detected");
    }
    const { output, bytesConsumed } = decompressFrame(input, offset, header, normalizedDictionary, maxSize !== void 0 ? maxSize - totalOutputSize : void 0, validateChecksum, options?.reuseContext, options?.debugTrace);
    chunks.push(output);
    totalOutputSize += output.length;
    offset += bytesConsumed;
  }
  if (chunks.length === 0)
    return new Uint8Array(0);
  if (chunks.length === 1) {
    const c = chunks[0];
    if (!c)
      throw new ZstdError("Unreachable", "corruption_detected");
    return c;
  }
  const result = new Uint8Array(totalOutputSize);
  let pos = 0;
  for (const chunk of chunks) {
    result.set(chunk, pos);
    pos += chunk.length;
  }
  return result;
}

// src/core/zstd.ts
function decompressData(data) {
  if (data[0] === 40 && data[1] === 181 && data[2] === 47 && data[3] === 253) {
    return decompress(data);
  }
  return data;
}
function compressData(data) {
  return compress(data);
}
function isCompressed(data) {
  return data[0] === 40 && data[1] === 181 && data[2] === 47 && data[3] === 253;
}

// src/core/logger.ts
var vscode = __toESM(require("vscode"));
var Logger = class {
  static channel;
  static init() {
    this.channel = vscode.window.createOutputChannel("BYML Lens");
    this.info("BYML Lens Logger Initialized.");
  }
  static get currentLevel() {
    const config = vscode.workspace.getConfiguration("byml-lens");
    return config.get("debug", false) ? 0 /* DEBUG */ : 1 /* INFO */;
  }
  static debug(message, data) {
    if (this.currentLevel <= 0 /* DEBUG */) this.write("DEBUG", message, data);
  }
  static info(message, data) {
    if (this.currentLevel <= 1 /* INFO */) this.write("INFO", message, data);
  }
  static warn(message, data) {
    if (this.currentLevel <= 2 /* WARN */) this.write("WARN", message, data);
  }
  static error(message, error) {
    const timestamp2 = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    this.channel.appendLine(`[${timestamp2}] \u274C ERROR: ${message}`);
    if (error) {
      this.channel.appendLine(`   Stack: ${error.stack || error}`);
    }
    this.channel.show(true);
  }
  static write(label, message, data) {
    const timestamp2 = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    let logMsg = `[${timestamp2}] [${label}] ${message}`;
    if (data) {
      logMsg += ` | Data: ${JSON.stringify(data)}`;
    }
    this.channel.appendLine(logMsg);
  }
  static show() {
    this.channel.show(true);
  }
};

// src/core/sarc.ts
var SarcArchive = class _SarcArchive {
  files = [];
  isCompressed = false;
  le = true;
  bom = 65279;
  constructor(data) {
    if (!data) return;
    try {
      this.isCompressed = isCompressed(data);
      const d = this.isCompressed ? decompressData(data) : data;
      const view = new DataView(d.buffer, d.byteOffset, d.byteLength);
      const magic = String.fromCharCode(d[0], d[1], d[2], d[3]);
      if (magic !== "SARC") throw new Error(`Invalid magic: ${magic}`);
      const headerSize = view.getUint16(4, true);
      this.bom = view.getUint16(6, true);
      this.le = this.bom === 65279;
      const dataStart = view.getUint32(12, this.le);
      let pos = headerSize;
      const sfatCount = view.getUint16(pos + 6, this.le);
      const sfatNodesPos = pos + 12;
      const sfntPos = sfatNodesPos + sfatCount * 16;
      const stringTablePos = sfntPos + 8;
      for (let i = 0; i < sfatCount; i++) {
        const nodeOff = sfatNodesPos + i * 16;
        const nameAttr = view.getUint32(nodeOff + 4, this.le);
        const nameOffset = (nameAttr & 16777215) * 4;
        const fileStart = view.getUint32(nodeOff + 8, this.le);
        const fileEnd = view.getUint32(nodeOff + 12, this.le);
        let name = "";
        let nPos = stringTablePos + nameOffset;
        while (nPos < d.length && d[nPos] !== 0) {
          name += String.fromCharCode(d[nPos]);
          nPos++;
        }
        const fileData = d.slice(dataStart + fileStart, dataStart + fileEnd);
        this.files.push({ name, data: fileData });
      }
    } catch (err) {
      Logger.error(`SARC Parsing Error`, err);
      throw err;
    }
  }
  static hash(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) {
      h = h * 101 + name.charCodeAt(i) >>> 0;
    }
    return h;
  }
  encode() {
    Logger.info(`Encoding SARC with ${this.files.length} files...`);
    const sortedFiles = [...this.files].sort((a, b) => _SarcArchive.hash(a.name) - _SarcArchive.hash(b.name));
    let stringTableSize = 0;
    const nameOffsets = sortedFiles.map((f) => {
      const off = stringTableSize;
      stringTableSize += f.name.length + 1;
      while (stringTableSize % 4 !== 0) stringTableSize++;
      return off;
    });
    const sfatSize = 12 + sortedFiles.length * 16;
    const sfntSize = 8 + stringTableSize;
    const headerSize = 20;
    const dataStart = headerSize + sfatSize + sfntSize;
    let totalSize = dataStart;
    const fileOffsets = sortedFiles.map((f) => {
      while (totalSize % 4 !== 0) totalSize++;
      const start = totalSize - dataStart;
      totalSize += f.data.length;
      return { start, end: totalSize - dataStart };
    });
    const out = new Uint8Array(totalSize);
    const view = new DataView(out.buffer);
    out.set([83, 65, 82, 67], 0);
    view.setUint16(4, headerSize, true);
    view.setUint16(6, this.bom, true);
    view.setUint32(8, totalSize, this.le);
    view.setUint32(12, dataStart, this.le);
    view.setUint32(16, 256, this.le);
    let pos = headerSize;
    out.set([83, 70, 65, 84], pos);
    view.setUint16(pos + 4, 12, this.le);
    view.setUint16(pos + 6, sortedFiles.length, this.le);
    view.setUint32(pos + 8, 101, this.le);
    pos += 12;
    for (let i = 0; i < sortedFiles.length; i++) {
      const f = sortedFiles[i];
      view.setUint32(pos, _SarcArchive.hash(f.name), this.le);
      view.setUint32(pos + 4, 16777216 | nameOffsets[i] / 4, this.le);
      view.setUint32(pos + 8, fileOffsets[i].start, this.le);
      view.setUint32(pos + 12, fileOffsets[i].end, this.le);
      pos += 16;
    }
    out.set([83, 70, 78, 84], pos);
    view.setUint16(pos + 4, 8, this.le);
    pos += 8;
    for (let i = 0; i < sortedFiles.length; i++) {
      const nameBytes = new TextEncoder().encode(sortedFiles[i].name);
      out.set(nameBytes, pos + nameOffsets[i]);
    }
    for (let i = 0; i < sortedFiles.length; i++) {
      out.set(sortedFiles[i].data, dataStart + fileOffsets[i].start);
    }
    Logger.info(`SARC encoded successfully. Total size: ${out.length}`);
    if (this.isCompressed) {
      return compressData(out);
    }
    return out;
  }
};

// src/providers/packFsProvider.ts
var path = __toESM(require("path"));
var PackFileSystemProvider = class {
  _onDidChangeFile = new vscode2.EventEmitter();
  onDidChangeFile = this._onDidChangeFile.event;
  archives = /* @__PURE__ */ new Map();
  async getArchive(uri) {
    const parts = uri.path.split("/");
    let archivePath = "";
    let internalPath = "";
    let found = false;
    for (let i = 0; i < parts.length; i++) {
      if (!parts[i]) continue;
      archivePath = archivePath === "" ? "/" + parts[i] : path.join(archivePath, parts[i]);
      if (parts[i].toLowerCase().endsWith(".pack") || parts[i].toLowerCase().endsWith(".pack.zs") || parts[i].toLowerCase().endsWith(".sarc") || parts[i].toLowerCase().endsWith(".sarc.zs")) {
        internalPath = parts.slice(i + 1).join("/");
        found = true;
        break;
      }
    }
    if (!found) throw vscode2.FileSystemError.FileNotFound(uri);
    const archiveUri = vscode2.Uri.file(archivePath);
    const archiveKey = archiveUri.toString();
    if (!this.archives.has(archiveKey)) {
      const data = await vscode2.workspace.fs.readFile(archiveUri);
      this.archives.set(archiveKey, new SarcArchive(new Uint8Array(data)));
    }
    return {
      archive: this.archives.get(archiveKey),
      internalPath,
      archiveUri
    };
  }
  watch(_uri, _options) {
    return new vscode2.Disposable(() => {
    });
  }
  async stat(uri) {
    const { archive, internalPath } = await this.getArchive(uri);
    if (internalPath === "" || internalPath === "/") {
      return { type: vscode2.FileType.Directory, ctime: 0, mtime: 0, size: 0 };
    }
    const file = archive.files.find((f) => f.name === internalPath);
    if (file) {
      return { type: vscode2.FileType.File, ctime: 0, mtime: 0, size: file.data.length };
    }
    const isDir = archive.files.some((f) => f.name.startsWith(internalPath + "/"));
    if (isDir) {
      return { type: vscode2.FileType.Directory, ctime: 0, mtime: 0, size: 0 };
    }
    throw vscode2.FileSystemError.FileNotFound(uri);
  }
  async readDirectory(uri) {
    const { archive, internalPath } = await this.getArchive(uri);
    const prefix = internalPath === "" ? "" : internalPath.endsWith("/") ? internalPath : internalPath + "/";
    const entries = /* @__PURE__ */ new Map();
    for (const file of archive.files) {
      if (file.name.startsWith(prefix)) {
        const relative = file.name.substring(prefix.length);
        const slashIdx = relative.indexOf("/");
        if (slashIdx === -1) {
          if (relative) entries.set(relative, vscode2.FileType.File);
        } else {
          const dirName = relative.substring(0, slashIdx);
          if (dirName) entries.set(dirName, vscode2.FileType.Directory);
        }
      }
    }
    return Array.from(entries.entries());
  }
  createDirectory(_uri) {
  }
  async readFile(uri) {
    const { archive, internalPath } = await this.getArchive(uri);
    const file = archive.files.find((f) => f.name === internalPath);
    if (!file) throw vscode2.FileSystemError.FileNotFound(uri);
    return file.data;
  }
  async writeFile(uri, content, options) {
    const { archive, internalPath, archiveUri } = await this.getArchive(uri);
    const fileIdx = archive.files.findIndex((f) => f.name === internalPath);
    if (fileIdx !== -1) {
      if (!options.overwrite) throw vscode2.FileSystemError.FileExists(uri);
      archive.files[fileIdx].data = content;
    } else {
      if (!options.create) throw vscode2.FileSystemError.FileNotFound(uri);
      archive.files.push({ name: internalPath, data: content });
    }
    try {
      const encoded = archive.encode();
      await vscode2.workspace.fs.writeFile(archiveUri, encoded);
      this._onDidChangeFile.fire([{ type: vscode2.FileChangeType.Changed, uri }]);
      vscode2.window.setStatusBarMessage("$(check) SARC Saved", 2e3);
    } catch (err) {
      Logger.error(`SARC Write failed`, err);
      vscode2.window.showErrorMessage(`Failed to write to pack: ${err.message}`);
    }
  }
  async delete(uri, _options) {
    const { archive, internalPath, archiveUri } = await this.getArchive(uri);
    archive.files = archive.files.filter((f) => f.name !== internalPath && !f.name.startsWith(internalPath + "/"));
    try {
      const encoded = archive.encode();
      await vscode2.workspace.fs.writeFile(archiveUri, encoded);
      this._onDidChangeFile.fire([{ type: vscode2.FileChangeType.Deleted, uri }]);
    } catch (err) {
      Logger.error(`SARC Delete failed`, err);
    }
  }
  rename(_oldUri, _newUri, _options) {
  }
};

// src/providers/bymlFsProvider.ts
var vscode4 = __toESM(require("vscode"));

// node_modules/js-yaml/dist/js-yaml.mjs
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];
  return [sequence];
}
function extend(target, source) {
  var index, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }
  return target;
}
function repeat(string, count) {
  var result = "", cycle;
  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }
  return result;
}
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
var isNothing_1 = isNothing;
var isObject_1 = isObject;
var toArray_1 = toArray;
var repeat_1 = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1 = extend;
var common = {
  isNothing: isNothing_1,
  isObject: isObject_1,
  toArray: toArray_1,
  repeat: repeat_1,
  isNegativeZero: isNegativeZero_1,
  extend: extend_1
};
function formatError(exception2, compact) {
  var where = "", message = exception2.reason || "(unknown reason)";
  if (!exception2.mark) return message;
  if (exception2.mark.name) {
    where += 'in "' + exception2.mark.name + '" ';
  }
  where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
  if (!compact && exception2.mark.snippet) {
    where += "\n\n" + exception2.mark.snippet;
  }
  return message + " " + where;
}
function YAMLException$1(reason, mark) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;
YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ": " + formatError(this, compact);
};
var exception = YAMLException$1;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
    pos: position - lineStart + head.length
    // relative position
  };
}
function padStart(string, max) {
  return common.repeat(" ", max - string.length) + string;
}
function makeSnippet(mark, options) {
  options = Object.create(options || null);
  if (!mark.buffer) return null;
  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent !== "number") options.indent = 1;
  if (typeof options.linesBefore !== "number") options.linesBefore = 3;
  if (typeof options.linesAfter !== "number") options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;
  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
  var result = "", i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
  }
  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  }
  return result.replace(/\n$/, "");
}
var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map2) {
  var result = {};
  if (map2 !== null) {
    Object.keys(map2).forEach(function(style) {
      map2[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options;
  this.tag = tag;
  this.kind = options["kind"] || null;
  this.resolve = options["resolve"] || function() {
    return true;
  };
  this.construct = options["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options["instanceOf"] || null;
  this.predicate = options["predicate"] || null;
  this.represent = options["represent"] || null;
  this.representName = options["representName"] || null;
  this.defaultStyle = options["defaultStyle"] || null;
  this.multi = options["multi"] || false;
  this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
var type = Type$1;
function compileList(schema2, name) {
  var result = [];
  schema2[name].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
function Schema$1(definition) {
  return this.extend(definition);
}
Schema$1.prototype.extend = function extend2(definition) {
  var implicit = [];
  var explicit = [];
  if (definition instanceof type) {
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);
  } else {
    throw new exception("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  }
  implicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    if (type$1.loadKind && type$1.loadKind !== "scalar") {
      throw new exception("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
    if (type$1.multi) {
      throw new exception("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }
  });
  explicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, "implicit");
  result.compiledExplicit = compileList(result, "explicit");
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};
var schema = Schema$1;
var str = new type("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(data) {
    return data !== null ? data : "";
  }
});
var seq = new type("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(data) {
    return data !== null ? data : [];
  }
});
var map = new type("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(data) {
    return data !== null ? data : {};
  }
});
var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});
function resolveYamlNull(data) {
  if (data === null) return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
var _null = new type("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
function resolveYamlBoolean(data) {
  if (data === null) return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
var bool = new type("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function(object) {
      return object ? "true" : "false";
    },
    uppercase: function(object) {
      return object ? "TRUE" : "FALSE";
    },
    camelcase: function(object) {
      return object ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
  if (data === null) return false;
  var max = data.length, index = 0, hasDigits = false, ch;
  if (!max) return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max) return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (ch !== "0" && ch !== "1") return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_") return false;
  for (; index < max; index++) {
    ch = data[index];
    if (ch === "_") continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_") return false;
  return true;
}
function constructYamlInteger(data) {
  var value = data, sign = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-") sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0") return 0;
  if (ch === "0") {
    if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x") return sign * parseInt(value.slice(2), 16);
    if (value[1] === "o") return sign * parseInt(value.slice(2), 8);
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
}
var int = new type("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    },
    octal: function(obj) {
      return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
    },
    decimal: function(obj) {
      return obj.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function resolveYamlFloat(data) {
  if (data === null) return false;
  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
}
var float = new type("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});
var core = json;
var YAML_DATE_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
);
var YAML_TIMESTAMP_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null) throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 6e4;
    if (match[9] === "-") delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta) date.setTime(date.getTime() - delta);
  return date;
}
function representYamlTimestamp(object) {
  return object.toISOString();
}
var timestamp = new type("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
var merge = new type("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
  if (data === null) return false;
  var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    code = map2.indexOf(data.charAt(idx));
    if (code > 64) continue;
    if (code < 0) return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0; idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
function representYamlBinary(object) {
  var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
var binary = new type("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null) return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]") return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }
    if (!pairHasKey) return false;
    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
var omap = new type("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null) return true;
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== "[object Object]") return false;
    keys = Object.keys(pair);
    if (keys.length !== 1) return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null) return [];
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
var pairs = new type("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null) return true;
  var key, object = data;
  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
var set = new type("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
  return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "\x85" : c === 95 ? "\xA0" : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode(
    (c - 65536 >> 10) + 55296,
    (c - 65536 & 1023) + 56320
  );
}
function setProperty(object, key, value) {
  if (key === "__proto__") {
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value
    });
  } else {
    object[key] = value;
  }
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
var i;
function State$1(input, options) {
  this.input = input;
  this.filename = options["filename"] || null;
  this.schema = options["schema"] || _default;
  this.onWarning = options["onWarning"] || null;
  this.legacy = options["legacy"] || false;
  this.json = options["json"] || false;
  this.listener = options["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    // omit trailing \0
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = snippet(mark);
  return new exception(message, mark);
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match, major, minor;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);
    if (major !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, "tag prefix is malformed: " + prefix);
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;
  if (!common.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key)) {
      setProperty(destination, key, source[key]);
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    setProperty(_result, keyNode, valueNode);
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common.repeat("\n", count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = /* @__PURE__ */ Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += "\n";
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat("\n", emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common.repeat("\n", emptyLines);
      }
    } else {
      state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = /* @__PURE__ */ Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33) return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38) return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42) return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = /* @__PURE__ */ Object.create(null);
  state.anchorMap = /* @__PURE__ */ Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch)) break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0) readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options) {
  input = String(input);
  options = options || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += "\n";
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options);
  var nullpos = input.indexOf("\0");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\0";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
    options = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}
function load$1(input, options) {
  var documents = loadDocuments(input, options);
  if (documents.length === 0) {
    return void 0;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception("expected a single document in the stream, but found more");
}
var loadAll_1 = loadAll$1;
var load_1 = load$1;
var loader = {
  loadAll: loadAll_1,
  load: load_1
};
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = '\\"';
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style, type2;
  if (map2 === null) return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new exception("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string.length) + string;
}
var QUOTING_TYPE_SINGLE = 1;
var QUOTING_TYPE_DOUBLE = 2;
function State(options) {
  this.schema = options["schema"] || _default;
  this.indent = Math.max(1, options["indent"] || 2);
  this.noArrayIndent = options["noArrayIndent"] || false;
  this.skipInvalid = options["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
  this.sortKeys = options["sortKeys"] || false;
  this.lineWidth = options["lineWidth"] || 80;
  this.noRefs = options["noRefs"] || false;
  this.noCompatMode = options["noCompatMode"] || false;
  this.condenseFlow = options["condenseFlow"] || false;
  this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options["forceQuotes"] || false;
  this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
  while (position < length) {
    next = string.indexOf("\n", position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== "\n") result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return "\n" + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    (inblock ? (
      // c = flow-in
      cIsNsCharOrWhitespace
    ) : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar
  );
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}
var STYLE_PLAIN = 1;
var STYLE_SINGLE = 2;
var STYLE_LITERAL = 3;
var STYLE_FOLDED = 4;
var STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = (function() {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string2) {
      return testImplicitResolving(state, string2);
    }
    switch (chooseScalarStyle(
      string,
      singleLineOnly,
      state.indent,
      lineWidth,
      testAmbiguity,
      state.quotingType,
      state.forceQuotes && !iskey,
      inblock
    )) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new exception("impossible error: invalid scalar style");
    }
  })();
}
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  var clip = string[string.length - 1] === "\n";
  var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + "\n";
}
function dropEndingNewline(string) {
  return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
function foldString(string, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = (function() {
    var nextLF = string.indexOf("\n");
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  })();
  var prevMoreIndented = string[0] === "\n" || string[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ") return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += "\n" + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += "\n";
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 65536) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "") _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (_result !== "") pairBuffer += ", ";
    if (state.condenseFlow) pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024) pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new exception("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
  var _result, typeList, index, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length; index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new exception("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block;
  var tagStr;
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new exception("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(
        state.tag[0] === "!" ? state.tag.slice(1) : state.tag
      ).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object !== null && typeof object === "object") {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs) getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true)) return state.dump + "\n";
  return "";
}
var dump_1 = dump$1;
var dumper = {
  dump: dump_1
};
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
  };
}
var load = loader.load;
var loadAll = loader.loadAll;
var dump = dumper.dump;
var safeLoad = renamed("safeLoad", "load");
var safeLoadAll = renamed("safeLoadAll", "loadAll");
var safeDump = renamed("safeDump", "dump");

// src/core/byml.ts
var Writer = class {
  buffer;
  view;
  offset = 0;
  le = true;
  constructor(size = 1024 * 1024) {
    this.buffer = new Uint8Array(size);
    this.view = new DataView(this.buffer.buffer);
  }
  writeUInt8(v) {
    this.view.setUint8(this.offset++, v);
  }
  writeUInt16(v) {
    this.view.setUint16(this.offset, v, this.le);
    this.offset += 2;
  }
  writeUInt32(v) {
    this.view.setUint32(this.offset, v, this.le);
    this.offset += 4;
  }
  writeUInt24(v) {
    if (this.le) {
      this.writeUInt8(v & 255);
      this.writeUInt8(v >> 8 & 255);
      this.writeUInt8(v >> 16 & 255);
    } else {
      this.writeUInt8(v >> 16 & 255);
      this.writeUInt8(v >> 8 & 255);
      this.writeUInt8(v & 255);
    }
  }
  writeString(s) {
    const encoded = new TextEncoder().encode(s);
    for (const b of encoded) this.writeUInt8(b);
    this.writeUInt8(0);
  }
  align(n) {
    while (this.offset % n !== 0) this.writeUInt8(0);
  }
  seek(offset) {
    this.offset = offset;
  }
  tell() {
    return this.offset;
  }
  getBytes() {
    return this.buffer.slice(0, this.offset);
  }
};
function yamlToByml(yamlStr, originalData) {
  const obj = load(yamlStr);
  const writer = new Writer();
  let le = true;
  let version = 7;
  if (originalData) {
    const decompressed = isCompressed(originalData) ? decompressData(originalData) : originalData;
    if (decompressed[0] === 66 && decompressed[1] === 89) le = false;
    version = decompressed[3] << 8 | decompressed[2];
  }
  writer.le = le;
  const keys = /* @__PURE__ */ new Set();
  const strings = /* @__PURE__ */ new Set();
  function collect(node) {
    if (typeof node === "string") strings.add(node);
    else if (Array.isArray(node)) node.forEach(collect);
    else if (node && typeof node === "object") {
      Object.keys(node).forEach((k) => {
        keys.add(k);
        collect(node[k]);
      });
    }
  }
  collect(obj);
  const sortedKeys = Array.from(keys).sort();
  const sortedStrings = Array.from(strings).sort();
  writer.writeUInt8(le ? 89 : 66);
  writer.writeUInt8(le ? 66 : 89);
  writer.writeUInt16(version);
  const keyTableOffsetPos = writer.tell();
  writer.writeUInt32(0);
  const stringTableOffsetPos = writer.tell();
  writer.writeUInt32(0);
  const rootOffsetPos = writer.tell();
  writer.writeUInt32(0);
  const keyTableOffset = writer.tell();
  writer.view.setUint32(keyTableOffsetPos, keyTableOffset, le);
  writeStringTable(sortedKeys);
  writer.align(4);
  const stringTableOffset = writer.tell();
  writer.view.setUint32(stringTableOffsetPos, stringTableOffset, le);
  writeStringTable(sortedStrings);
  const nodeOffsets = /* @__PURE__ */ new Map();
  const pendingNodes = [];
  function writeStringTable(arr) {
    const start = writer.tell();
    writer.writeUInt8(194);
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
  function getNodeType(v) {
    if (typeof v === "string") return 160;
    if (typeof v === "number") {
      if (Number.isInteger(v)) return 209;
      return 210;
    }
    if (typeof v === "boolean") return 208;
    if (Array.isArray(v)) return 192;
    if (v && typeof v === "object") return 193;
    if (v === null) return 255;
    return 255;
  }
  function writeNode2(node) {
    if (nodeOffsets.has(node)) return nodeOffsets.get(node);
    writer.align(4);
    const offset = writer.tell();
    nodeOffsets.set(node, offset);
    if (Array.isArray(node)) {
      writer.writeUInt8(192);
      writer.writeUInt24(node.length);
      for (const item of node) {
        writer.writeUInt8(getNodeType(item));
      }
      writer.align(4);
      const valuePos = writer.tell();
      for (const item of node) writer.writeUInt32(0);
      for (let i = 0; i < node.length; i++) {
        const item = node[i];
        const type2 = getNodeType(item);
        let val = 0;
        if (type2 === 192 || type2 === 193) {
          pendingNodes.push({ parentPos: valuePos + i * 4, node: item });
        } else {
          val = encodeValue(type2, item);
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
      writer.writeUInt8(193);
      writer.writeUInt24(entries.length);
      const entryPos = writer.tell();
      for (const [k, v] of entries) {
        writer.writeUInt24(sortedKeys.indexOf(k));
        writer.writeUInt8(getNodeType(v));
        writer.writeUInt32(0);
      }
      for (let i = 0; i < entries.length; i++) {
        const [k, v] = entries[i];
        const type2 = getNodeType(v);
        let val = 0;
        if (type2 === 192 || type2 === 193) {
          pendingNodes.push({ parentPos: entryPos + i * 8 + 4, node: v });
        } else {
          val = encodeValue(type2, v);
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
  function encodeValue(type2, v) {
    switch (type2) {
      case 160:
        return sortedStrings.indexOf(v);
      case 209:
        return v;
      case 210: {
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        view.setFloat32(0, v, le);
        return view.getUint32(0, le);
      }
      case 208:
        return v ? 1 : 0;
      case 255:
        return 0;
      default:
        return 0;
    }
  }
  const rootOffset = writeNode2(obj);
  writer.view.setUint32(rootOffsetPos, rootOffset, le);
  while (pendingNodes.length > 0) {
    const { parentPos, node } = pendingNodes.shift();
    const offset = writeNode2(node);
    const savedPos = writer.tell();
    writer.seek(parentPos);
    writer.writeUInt32(offset);
    writer.seek(savedPos);
  }
  const encoded = writer.getBytes();
  if (originalData && isCompressed(originalData)) {
    return compressData(encoded);
  }
  return encoded;
}
function bymlToYaml(data) {
  const decompressed = isCompressed(data) ? decompressData(data) : data;
  const reader = new Reader(decompressed);
  const magic = String.fromCharCode(reader.readUInt8(), reader.readUInt8());
  if (magic === "BY") reader.le = false;
  else if (magic === "YB") reader.le = true;
  else throw new Error("Invalid BYML magic: " + magic);
  const version = reader.readUInt16();
  const keyTableOffset = reader.readUInt32();
  const stringTableOffset = reader.readUInt32();
  const rootOffset = reader.readUInt32();
  const keys = reader.readStringTable(keyTableOffset);
  const strings = reader.readStringTable(stringTableOffset);
  function parseNode(offset) {
    const prev = reader.tell();
    reader.seek(offset);
    const type2 = reader.readUInt8();
    let res;
    if (type2 === 192) {
      const count = reader.readUInt24();
      const types = [];
      for (let i = 0; i < count; i++) types.push(reader.readUInt8());
      while (reader.tell() % 4 !== 0) reader.readUInt8();
      const arr = [];
      for (let i = 0; i < count; i++) {
        arr.push(parseValue(types[i], reader.readUInt32()));
      }
      res = arr;
    } else if (type2 === 193) {
      const count = reader.readUInt24();
      const dict = {};
      for (let i = 0; i < count; i++) {
        const keyIdx = reader.readUInt24();
        const nodeType = reader.readUInt8();
        const value = reader.readUInt32();
        dict[keys[keyIdx]] = parseValue(nodeType, value);
      }
      res = dict;
    } else {
      throw new Error("Unsupported container type: 0x" + type2.toString(16) + " at 0x" + offset.toString(16));
    }
    reader.seek(prev);
    return res;
  }
  function parseValue(type2, value) {
    switch (type2) {
      case 160:
        return strings[value];
      // String
      case 209: {
        const dv = new DataView(new ArrayBuffer(4));
        dv.setUint32(0, value, reader.le);
        return dv.getInt32(0, reader.le);
      }
      case 210: {
        const dv = new DataView(new ArrayBuffer(4));
        dv.setUint32(0, value, reader.le);
        return dv.getFloat32(0, reader.le);
      }
      case 208:
        return value !== 0;
      // Bool
      case 192:
      case 193:
        return parseNode(value);
      case 255:
        return null;
      default:
        return value;
    }
  }
  const root = parseNode(rootOffset);
  return dump(root, { indent: 2, noRefs: true, quotingType: '"' });
}
var Reader = class {
  view;
  offset = 0;
  le = true;
  constructor(buffer) {
    this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  }
  readUInt8() {
    return this.view.getUint8(this.offset++);
  }
  readUInt16() {
    const r = this.view.getUint16(this.offset, this.le);
    this.offset += 2;
    return r;
  }
  readUInt32() {
    const r = this.view.getUint32(this.offset, this.le);
    this.offset += 4;
    return r;
  }
  readUInt24() {
    const b1 = this.readUInt8();
    const b2 = this.readUInt8();
    const b3 = this.readUInt8();
    if (this.le) return b1 | b2 << 8 | b3 << 16;
    return b1 << 16 | b2 << 8 | b3;
  }
  seek(offset) {
    this.offset = offset;
  }
  tell() {
    return this.offset;
  }
  readStringTable(offset) {
    if (offset === 0) return [];
    const prev = this.offset;
    this.seek(offset);
    const type2 = this.readUInt8();
    if (type2 !== 194) throw new Error("Invalid string table type at 0x" + offset.toString(16) + ": 0x" + type2.toString(16));
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
};

// src/core/alias.ts
var vscode3 = __toESM(require("vscode"));
var AliasManager = class {
  static async getMergedMap() {
    const files = await vscode3.workspace.findFiles("byml-aliases.{yml,yaml}");
    if (files.length > 0) {
      try {
        const content = await vscode3.workspace.fs.readFile(files[0]);
        const text = new TextDecoder().decode(content);
        const userMap = load(text);
        return userMap || {};
      } catch (e) {
      }
    }
    return {};
  }
  static async applyDisplayAliases(yamlStr) {
    let result = yamlStr;
    const map2 = await this.getMergedMap();
    const sortedCodes = Object.keys(map2).sort((a, b) => b.length - a.length);
    for (const code of sortedCodes) {
      const name = map2[code];
      const regex = new RegExp(`(['"]?)(${code}(\\w*))(['"]?)`, "g");
      result = result.replace(regex, `$1$2 [${name}]$4`);
    }
    return result;
  }
  static async revertToInternal(yamlStr) {
    let result = yamlStr;
    const map2 = await this.getMergedMap();
    const sortedCodes = Object.keys(map2).sort((a, b) => b.length - a.length);
    for (const code of sortedCodes) {
      const name = map2[code];
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${code}\\w*)\\s*\\[${escapedName}\\]`, "g");
      result = result.replace(regex, "$1");
    }
    return result;
  }
};

// src/providers/bymlFsProvider.ts
var fs = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var os = __toESM(require("os"));
var BymlYamlProvider = class {
  _onDidChangeFile = new vscode4.EventEmitter();
  onDidChangeFile = this._onDidChangeFile.event;
  // Cache to store the location of the initial "Original" binary files on disk
  shadowCache = /* @__PURE__ */ new Map();
  tempDir;
  constructor() {
    this.tempDir = fs.mkdtempSync(path2.join(os.tmpdir(), "byml-shadow-"));
    Logger.info(`Shadow backup directory initialized at: ${this.tempDir}`);
  }
  getSourceUri(uri) {
    let isOriginal = false;
    let pathStr = uri.path;
    if (pathStr.endsWith(".original.yaml")) {
      isOriginal = true;
      pathStr = pathStr.slice(0, -14);
    } else if (pathStr.endsWith(".yaml")) {
      pathStr = pathStr.slice(0, -5);
    }
    if (uri.query) {
      return { uri: vscode4.Uri.parse(uri.query), isOriginal };
    }
    return { uri: vscode4.Uri.file(pathStr), isOriginal };
  }
  /**
   * Creates a one-time shadow backup of the file if it doesn't exist.
   */
  async ensureShadowBackup(sourceUri) {
    const key = sourceUri.toString();
    if (!this.shadowCache.has(key)) {
      try {
        const data = await vscode4.workspace.fs.readFile(sourceUri);
        const shadowPath = path2.join(this.tempDir, Buffer.from(key).toString("hex").slice(-16) + ".bin");
        fs.writeFileSync(shadowPath, data);
        this.shadowCache.set(key, shadowPath);
        Logger.info(`Created shadow backup for: ${sourceUri.fsPath}`);
      } catch (e) {
        Logger.error(`Failed to create shadow backup`, e);
      }
    }
  }
  watch(_uri, _options) {
    return new vscode4.Disposable(() => {
    });
  }
  async stat(uri) {
    const { uri: sourceUri } = this.getSourceUri(uri);
    try {
      const stats = await vscode4.workspace.fs.stat(sourceUri);
      return { ...stats, type: vscode4.FileType.File };
    } catch (err) {
      return { type: vscode4.FileType.File, ctime: Date.now(), mtime: Date.now(), size: 0 };
    }
  }
  readDirectory(_uri) {
    return [];
  }
  createDirectory(_uri) {
  }
  async readFile(uri) {
    const { uri: sourceUri, isOriginal } = this.getSourceUri(uri);
    try {
      let binaryData;
      if (isOriginal) {
        const shadowPath = this.shadowCache.get(sourceUri.toString());
        if (shadowPath && fs.existsSync(shadowPath)) {
          binaryData = fs.readFileSync(shadowPath);
          Logger.info(`Reading from shadow backup for Diff: ${sourceUri.fsPath}`);
        } else {
          binaryData = await vscode4.workspace.fs.readFile(sourceUri);
        }
      } else {
        binaryData = await vscode4.workspace.fs.readFile(sourceUri);
        await this.ensureShadowBackup(sourceUri);
      }
      let yamlStr = bymlToYaml(new Uint8Array(binaryData));
      yamlStr = await AliasManager.applyDisplayAliases(yamlStr);
      return new TextEncoder().encode(yamlStr);
    } catch (err) {
      return new TextEncoder().encode(`# BYML Lens Error
# Source: ${sourceUri.toString()}
# Error: ${err.message}`);
    }
  }
  async writeFile(uri, content, _options) {
    const { uri: sourceUri } = this.getSourceUri(uri);
    let yamlStr = new TextDecoder().decode(content);
    yamlStr = await AliasManager.revertToInternal(yamlStr);
    try {
      const originalBinary = await vscode4.workspace.fs.readFile(sourceUri);
      const encoded = yamlToByml(yamlStr, new Uint8Array(originalBinary));
      await vscode4.workspace.fs.writeFile(sourceUri, encoded);
      vscode4.window.setStatusBarMessage("$(check) BYML Saved", 2e3);
    } catch (err) {
      vscode4.window.showErrorMessage(`BYML Save Error: ${err.message}`);
      throw err;
    }
  }
  delete(_uri) {
  }
  rename(_oldUri, _newUri) {
  }
  dispose() {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    }
  }
};

// src/extension.ts
var BymlRedirectProvider = class {
  async openCustomDocument(uri) {
    return { uri, dispose: () => {
    } };
  }
  async resolveCustomEditor(document, webviewPanel) {
    const virtualUri = vscode5.Uri.from({
      scheme: "byml-edit",
      path: document.uri.path + ".yaml",
      query: document.uri.toString()
    });
    await vscode5.window.showTextDocument(virtualUri, { preview: true, preserveFocus: false });
    setTimeout(() => webviewPanel.dispose(), 100);
  }
  _onDidChangeCustomDocument = new vscode5.EventEmitter();
  onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
  backupCustomDocument() {
    return Promise.resolve({ id: "", delete: () => {
    } });
  }
  saveCustomDocument() {
    return Promise.resolve();
  }
  saveCustomDocumentAs() {
    return Promise.resolve();
  }
  revertCustomDocument() {
    return Promise.resolve();
  }
};
var SarcRedirectProvider = class {
  async openCustomDocument(uri) {
    return { uri, dispose: () => {
    } };
  }
  async resolveCustomEditor(document, webviewPanel) {
    const checkAndToggle = () => {
      const tab = this.findTab(document.uri);
      if (tab && !tab.isPreview) {
        this.toggleSarc(document.uri);
        setTimeout(() => webviewPanel.dispose(), 50);
        return true;
      }
      return false;
    };
    if (!checkAndToggle()) {
      webviewPanel.webview.html = `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;color:#888;font-family:sans-serif;"><div>Double-click to Mount/Unmount Archive</div></body></html>`;
      const disposable = vscode5.window.tabGroups.onDidChangeTabs((_) => {
        if (checkAndToggle()) disposable.dispose();
      });
      webviewPanel.onDidDispose(() => disposable.dispose());
    }
  }
  findTab(uri) {
    for (const group of vscode5.window.tabGroups.all) {
      for (const tab of group.tabs) {
        if (tab.input?.uri?.toString() === uri.toString()) return tab;
      }
    }
    return void 0;
  }
  toggleSarc(uri) {
    const sarcUri = vscode5.Uri.parse(`sarc://${uri.fsPath}`);
    const folders = vscode5.workspace.workspaceFolders || [];
    const existingFolder = folders.find((f) => f.uri.toString() === sarcUri.toString());
    if (existingFolder) {
      vscode5.workspace.updateWorkspaceFolders(existingFolder.index, 1);
    } else {
      vscode5.workspace.updateWorkspaceFolders(folders.length, 0, {
        uri: sarcUri,
        name: `[Pack] ${path3.basename(uri.fsPath)}`
      });
    }
  }
  _onDidChangeCustomDocument = new vscode5.EventEmitter();
  onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
  backupCustomDocument() {
    return Promise.resolve({ id: "", delete: () => {
    } });
  }
  saveCustomDocument() {
    return Promise.resolve();
  }
  saveCustomDocumentAs() {
    return Promise.resolve();
  }
  revertCustomDocument() {
    return Promise.resolve();
  }
};
function activate(context) {
  Logger.init();
  try {
    context.subscriptions.push(vscode5.workspace.registerFileSystemProvider("sarc", new PackFileSystemProvider(), { isCaseSensitive: true }));
    context.subscriptions.push(vscode5.workspace.registerFileSystemProvider("byml-edit", new BymlYamlProvider(), { isCaseSensitive: true }));
    context.subscriptions.push(vscode5.window.registerCustomEditorProvider("byml-inspector.redirector", new BymlRedirectProvider()));
    context.subscriptions.push(vscode5.window.registerCustomEditorProvider("byml-inspector.sarc-redirector", new SarcRedirectProvider()));
    context.subscriptions.push(vscode5.commands.registerCommand("byml-inspector.compareWithOriginal", async (uri) => {
      if (!uri) uri = vscode5.window.activeTextEditor?.document.uri;
      if (!uri) return;
      const originalUri = uri;
      const virtualUri = vscode5.Uri.from({
        scheme: "byml-edit",
        path: uri.path + ".yaml",
        query: uri.toString()
      });
      const baseUri = vscode5.Uri.from({
        scheme: "byml-edit",
        path: uri.path + ".original.yaml",
        query: uri.toString()
        // In readFile, we can check for .original.yaml and return unmodified data
      });
      await vscode5.commands.executeCommand("vscode.diff", baseUri, virtualUri, `${path3.basename(uri.fsPath)} (Original \u2194 Modified)`);
    }));
    context.subscriptions.push(vscode5.commands.registerCommand("byml-inspector.unmountPack", async (uri) => {
      const folder = vscode5.workspace.workspaceFolders?.find((f) => f.uri.toString() === uri.toString());
      if (folder) vscode5.workspace.updateWorkspaceFolders(folder.index, 1);
    }));
    Logger.info("BYML Lens Activated.");
  } catch (err) {
    Logger.error("Activation Failed", err);
  }
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
