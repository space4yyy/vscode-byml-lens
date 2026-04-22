"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const byml = __importStar(require("./core/byml.js"));
const sarc_js_1 = require("./core/sarc.js");
const program = new commander_1.Command();
program
    .name('byml-lens')
    .description('CLI tool for Nintendo BYML and SARC files')
    .version('0.2.0');
program.command('deyaml')
    .description('Convert binary BYML to YAML')
    .argument('<input>', 'Input binary BYML file (.byml, .bgyml, .zs)')
    .argument('[output]', 'Output YAML file')
    .action(async (input, output) => {
    try {
        const data = fs.readFileSync(input);
        const yamlStr = byml.bymlToYaml(new Uint8Array(data));
        if (output) {
            fs.writeFileSync(output, yamlStr);
            console.log(`Successfully converted ${input} to ${output}`);
        }
        else {
            console.log(yamlStr);
        }
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
program.command('yaml2byml')
    .description('Convert YAML to binary BYML')
    .argument('<input>', 'Input YAML file')
    .argument('<output>', 'Output binary BYML file')
    .option('-r, --reference <file>', 'Reference binary file to match version/endianness')
    .action(async (input, output, options) => {
    try {
        const yamlStr = fs.readFileSync(input, 'utf-8');
        let refData;
        if (options.reference) {
            refData = new Uint8Array(fs.readFileSync(options.reference));
        }
        const encoded = byml.yamlToByml(yamlStr, refData);
        fs.writeFileSync(output, encoded);
        console.log(`Successfully converted ${input} to ${output}`);
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
program.command('unpack')
    .description('Unpack SARC archive')
    .argument('<input>', 'Input SARC file (.pack, .sarc, .zs)')
    .argument('<outDir>', 'Output directory')
    .option('-y, --yaml', 'Automatically convert internal BYML files to YAML', false)
    .action(async (input, outDir, options) => {
    try {
        const data = fs.readFileSync(input);
        const archive = new sarc_js_1.SarcArchive(new Uint8Array(data));
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }
        let convertedCount = 0;
        for (const file of archive.files) {
            let outName = file.name;
            let finalData = file.data;
            const isByml = outName.endsWith('.byml') || outName.endsWith('.bgyml');
            if (options.yaml && isByml) {
                try {
                    const yamlStr = byml.bymlToYaml(file.data);
                    finalData = new TextEncoder().encode(yamlStr);
                    outName += '.yaml'; // Save as .byml.yaml
                    convertedCount++;
                }
                catch (e) {
                    console.warn(`Warning: Failed to deyaml ${file.name}, extracting as binary.`);
                }
            }
            const outPath = path.join(outDir, outName);
            const parentDir = path.dirname(outPath);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }
            fs.writeFileSync(outPath, finalData);
            console.log(`Extracted: ${outName}`);
        }
        console.log(`Successfully unpacked ${archive.files.length} files to ${outDir} (${convertedCount} converted to YAML)`);
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
program.command('pack')
    .description('Pack a directory into a SARC archive')
    .argument('<inDir>', 'Input directory')
    .argument('<output>', 'Output SARC file')
    .option('-z, --zstd', 'Compress the output with Zstandard', false)
    .option('-B, --big-endian', 'Use Big Endian byte order', false)
    .option('-y, --yaml', 'Automatically convert .yaml files back to binary BYML', false)
    .action(async (inDir, output, options) => {
    try {
        if (!fs.existsSync(inDir) || !fs.statSync(inDir).isDirectory()) {
            throw new Error(`${inDir} is not a directory`);
        }
        const archive = new sarc_js_1.SarcArchive();
        archive.isCompressed = options.zstd;
        archive.le = !options.bigEndian;
        const allFiles = [];
        const walk = (dir) => {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    walk(fullPath);
                }
                else {
                    allFiles.push(fullPath);
                }
            }
        };
        walk(inDir);
        for (const file of allFiles) {
            let relPath = path.relative(inDir, file);
            let finalData = fs.readFileSync(file);
            // If it's a .byml.yaml or .bgyml.yaml, convert it back
            if (options.yaml && relPath.endsWith('.yaml')) {
                const baseName = relPath.slice(0, -5);
                if (baseName.endsWith('.byml') || baseName.endsWith('.bgyml')) {
                    try {
                        const yamlStr = fs.readFileSync(file, 'utf-8');
                        const encoded = byml.yamlToByml(yamlStr);
                        finalData = Buffer.from(encoded);
                        relPath = baseName; // Strip .yaml for the archive
                        console.log(`Converted back: ${relPath}`);
                    }
                    catch (e) {
                        console.warn(`Warning: Failed to encode ${file}, packing as raw text.`);
                    }
                }
            }
            archive.files.push({ name: relPath, data: new Uint8Array(finalData) });
            console.log(`Added: ${relPath}`);
        }
        const encoded = archive.encode();
        fs.writeFileSync(output, encoded);
        console.log(`Successfully packed ${archive.files.length} files to ${output}`);
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=cli.js.map