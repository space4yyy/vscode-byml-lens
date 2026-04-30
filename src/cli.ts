import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as byml from './core/byml.js';
import { SarcArchive } from './core/sarc.js';
import { Logger } from './core/logger.js';
import * as zstd from './core/zstd.js';

const program = new Command();

// Build-time constants injected via esbuild
declare const __COMMIT_ID__: string;
const COMMIT_ID = typeof __COMMIT_ID__ !== 'undefined' ? __COMMIT_ID__ : 'dev';

program
    .name('byml-lens')
    .description(`CLI tool for Nintendo BYML and SARC files (v0.2.6, commit: ${COMMIT_ID})`)
    .version(`0.2.6 (${COMMIT_ID})`);

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
    .option('-z, --zstd', 'Compress the output with Zstandard', false)
    .action(async (input, output, options) => {
        try {
            const yamlStr = fs.readFileSync(input, 'utf-8');
            const encoded = byml.yamlToByml(yamlStr);
            const finalData = (options.zstd && !zstd.isCompressed(encoded)) ? zstd.compressData(encoded) : encoded;
            fs.writeFileSync(output, Buffer.from(finalData));
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

                fs.writeFileSync(outPath, file.data);
                console.log(`Extracted: ${file.name}`);

                if (options.yaml && (file.name.endsWith('.byml') || file.name.endsWith('.bgyml'))) {
                    try {
                        const yamlStr = byml.bymlToYaml(file.data);
                        fs.writeFileSync(outPath + '.yaml', yamlStr);
                        convertedCount++;
                    } catch (e) {
                        console.warn(`Warning: Failed to deyaml ${file.name}`);
                    }
                }
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
    .option('-y, --yaml', 'Force re-compilation of all .yaml files even if binary exists', false)
    .action(async (inDir, output, options) => {
        try {
            if (!fs.existsSync(inDir) || !fs.statSync(inDir).isDirectory()) {
                throw new Error(`${inDir} is not a directory`);
            }

            const archive = new SarcArchive();
            archive.isCompressed = options.zstd;
            archive.le = true;

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

            const fileMap = new Map<string, { binary?: string, yaml?: string }>();
            for (const f of filesInFolder) {
                const rel = path.relative(inDir, f);
                if (rel.endsWith('.yaml')) {
                    const base = rel.slice(0, -5);
                    const entry = fileMap.get(base) || {};
                    entry.yaml = f;
                    fileMap.set(base, entry);
                } else {
                    const entry = fileMap.get(rel) || {};
                    entry.binary = f;
                    fileMap.set(rel, entry);
                }
            }

            for (const [name, paths] of fileMap.entries()) {
                if (paths.yaml && (options.yaml || !paths.binary)) {
                    console.log(`Packing (Re-compiled): ${name}`);
                    const yamlStr = fs.readFileSync(paths.yaml, 'utf-8');
                    const encoded = byml.yamlToByml(yamlStr);
                    archive.files.push({ name, data: new Uint8Array(encoded) });
                } else if (paths.binary) {
                    console.log(`Packing (Raw Binary): ${name}`);
                    const data = fs.readFileSync(paths.binary);
                    archive.files.push({ name, data: new Uint8Array(data) });
                }
            }

            const encoded = archive.encode();
            fs.writeFileSync(output, encoded);
            console.log(`Successfully packed ${archive.files.length} files to ${output}.`);
        } catch (err: any) {
            console.error(`Error: ${err.message}`);
            process.exit(1);
        }
    });

program.parse();
