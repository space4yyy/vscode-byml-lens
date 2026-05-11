import * as fs from 'fs';

export interface BfresHeader {
  magic: string;
  version: number;
  endian: number;
  alignment: number;
  fileNameOffset: number;
  fileSize: number;
  sections: { [key: string]: number };
}

export class BfresParser {
  private buffer: Buffer;

  constructor(filePath: string) {
    this.buffer = fs.readFileSync(filePath);
  }

  public parseHeader(): BfresHeader {
    const magic = this.buffer.toString('utf8', 0, 4);
    if (magic !== 'FRES') {
      throw new Error('Invalid BFRES magic');
    }

    // Offset 8: Version (e.g. 0x0A000000)
    const version = this.buffer.readUInt32LE(8);
    // Offset 12: Endian (0xFFFE = LE)
    const endian = this.buffer.readUInt16LE(12);
    
    return {
      magic,
      version,
      endian,
      alignment: this.buffer.readUInt8(14),
      fileNameOffset: this.buffer.readUInt32LE(16), 
      fileSize: this.buffer.readUInt32LE(20),
      sections: {}
    };
  }

  /**
   * 快速扫描 BFRES 中的核心资源块 (Tags)
   */
  public listResources(): { tag: string, offset: number }[] {
    const resources: { tag: string, offset: number }[] = [];
    const tags = ['FMDL', 'FSHP', 'FMAT', 'FSKL', 'FVTX', 'FBNB', 'FVIS', 'FSHA', 'FSCN', 'FTXP', 'FSPT', 'BNTX'];
    
    // 我们进行简单的 4 字节对齐扫描
    for (let i = 0; i < this.buffer.length - 4; i += 4) {
      const chunk = this.buffer.toString('utf8', i, i + 4);
      if (tags.includes(chunk)) {
        resources.push({ tag: chunk, offset: i });
      }
    }
    return resources;
  }

  /**
   * 导出内部资源块
   */
  public extractResource(tag: string, offset: number, outputPath: string) {
    // 这是一个非常简单的导出逻辑：从 tag 开始，直到下一个 tag 或文件末尾
    // 实际 BFRES 有更复杂的 Size 定义，但作为预览工具，我们可以尝试截取一个合理的长度
    // 或者通过解析特定 Tag 的 Header 获取 Size (例如 BNTX 的 Header)
    
    let endOffset = this.buffer.length;
    const tags = ['FMDL', 'FSHP', 'FMAT', 'FSKL', 'FVTX', 'FBNB', 'FVIS', 'FSHA', 'FSCN', 'FTXP', 'FSPT', 'BNTX', 'FRES'];
    
    for (let j = offset + 4; j < this.buffer.length - 4; j += 4) {
      const nextChunk = this.buffer.toString('utf8', j, j + 4);
      if (tags.includes(nextChunk)) {
        endOffset = j;
        break;
      }
    }

    const data = this.buffer.slice(offset, endOffset);
    fs.writeFileSync(outputPath, data);
  }
}
