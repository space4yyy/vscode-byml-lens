import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as byml from './core/byml.js';
import { SarcArchive } from './core/sarc.js';
import { Logger } from './core/logger.js';

const program = new Command();

program
    .name('byml-lens')
    .description('CLI tool for Nintendo BYML and SARC files (v0.2.3)')
    .version('0.2.3');

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
            } else {
                console.log(yamlStr);
            }
        } catch (err: any) {
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
            let refData: Uint8Array | undefined;
            if (options.reference) {
                refData = new Uint8Array(fs.readFileSync(options.reference));
            }
            const encoded = byml.yamlToByml(yamlStr, refData);
            fs.writeFileSync(output, Buffer.from(encoded));
            console.log(`Successfully converted ${input} to ${output}`);
        } catch (err: any) {
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
            const archive = new SarcArchive(new Uint8Array(data));
            if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

            let convertedCount = 0;
            for (const file of archive.files) {
                const outPath = path.join(outDir, file.name);
                const parentDir = path.dirname(outPath);
                if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });

                if (options.yaml && (file.name.endsWith('.byml') || file.name.endsWith('.bgyml'))) {
                    try {
                        const yamlStr = byml.bymlToYaml(file.data);
                        fs.writeFileSync(outPath + '.yaml', yamlStr);
                        convertedCount++;
                    } catch (e) {
                        console.warn(`Warning: Failed to deyaml ${file.name}`);
                    }
                }
                // Always write original binary as well to keep the 'Smart Hybrid' option available for packing
                fs.writeFileSync(outPath, file.data);
                console.log(`Extracted: ${file.name}`);
            }
            console.log(`Successfully unpacked ${archive.files.length} files to ${outDir} (${convertedCount} YAMLs generated)`);
        } catch (err: any) {
            console.error(`Error: ${err.message}`);
            process.exit(1);
        }
    });

program.command('pack')
    .description('Pack a directory into a SARC archive (Smart Hybrid Mode)')
    .argument('<inDir>', 'Input directory')
    .argument('<output>', 'Output SARC file')
    .option('-z, --zstd', 'Compress the output with Zstandard', false)
    .option('-B, --big-endian', 'Use Big Endian byte order', false)
    .option('-y, --yaml', 'Prefer .yaml files if binary is missing or if explicitly forced', false)
    .action(async (inDir, output, options) => {
        try {
            if (!fs.existsSync(inDir) || !fs.statSync(inDir).isDirectory()) {
                throw new Error(`${inDir} is not a directory`);
            }

            const archive = new SarcArchive();
            archive.isCompressed = options.zstd;
            archive.le = !options.bigEndian;

            const filesInFolder: string[] = [];
            const walk = (dir: string) => {
                const list = fs.readdirSync(dir);
                for (const item of list) {
                    const fullPath = path.join(dir, item);
                    if (fs.statSync(fullPath).isDirectory()) walk(fullPath);
                    else filesInFolder.push(fullPath);
                }
            };
            walk(inDir);

            // Logic: 
            // 1. If 'file.bgyml' exists -> Use it directly (Safest)
            // 2. If 'file.bgyml' missing AND 'file.bgyml.yaml' exists -> Recompile
            // 3. If --yaml is forced, and both exist -> Prefer Recompile
            
            const processedBinaryPaths = new Set<string>();

            for (const fullPath of filesInFolder) {
                const relPath = path.relative(inDir, fullPath);
                
                // Skip .yaml if we already have or prefer the binary version
                if (relPath.endsWith('.yaml')) {
                    const binaryRelPath = relPath.slice(0, -5);
                    const binaryFullPath = path.join(inDir, binaryRelPath);
                    
                    if (options.yaml || !fs.existsSync(binaryFullPath)) {
                        console.log(`Re-compiling BYML: ${binaryRelPath}`);
                        const yamlStr = fs.readFileSync(fullPath, 'utf-8');
                        const encoded = byml.yamlToByml(yamlStr);
                        archive.files.push({ name: binaryRelPath, data: new Uint8Array(encoded) });
                        processedBinaryPaths.add(binaryRelPath);
                        continue;
                    } else {
                        // Skip this yaml, we will use the binary file instead
                        continue;
                    }
                }

                // If it's a binary file and not already handled by yaml logic
                if (!processedBinaryPaths.has(relPath)) {
                    const data = fs.readFileSync(fullPath);
                    archive.files.push({ name: relPath, data: new Uint8Array(data) });
                    console.log(`Added (Raw Binary): ${relPath}`);
                }
            }

            const encoded = archive.encode();
            fs.writeFileSync(output, encoded);
            console.log(`Successfully packed ${archive.files.length} files to ${output} using Smart Hybrid Mode.`);
        } catch (err: any) {
            console.error(`Error: ${err.message}`);
            process.exit(1);
        }
    });

program.parse();
