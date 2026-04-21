import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as byml from './core/byml.js';
import { SarcArchive } from './core/sarc.js';
import { Logger } from './core/logger.js';

const program = new Command();

program
    .name('byml-lens')
    .description('CLI tool for Nintendo BYML and SARC files')
    .version('0.1.9');

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
            fs.writeFileSync(output, encoded);
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
    .action(async (input, outDir) => {
        try {
            const data = fs.readFileSync(input);
            const archive = new SarcArchive(new Uint8Array(data));
            
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }

            for (const file of archive.files) {
                const outPath = path.join(outDir, file.name);
                const parentDir = path.dirname(outPath);
                if (!fs.existsSync(parentDir)) {
                    fs.mkdirSync(parentDir, { recursive: true });
                }
                fs.writeFileSync(outPath, file.data);
                console.log(`Extracted: ${file.name}`);
            }
            console.log(`Successfully unpacked ${archive.files.length} files to ${outDir}`);
        } catch (err: any) {
            console.error(`Error: ${err.message}`);
            process.exit(1);
        }
    });

program.command('pack')
    .description('Pack a directory into a SARC archive')
    .argument('<inDir>', 'Input directory')
    .argument('<output>', 'Output SARC file')
    .option('-z, --zstd', 'Compress the output with Zstandard', false)
    .option('-be, --big-endian', 'Use Big Endian byte order', false)
    .action(async (inDir, output, options) => {
        try {
            if (!fs.existsSync(inDir) || !fs.statSync(inDir).isDirectory()) {
                throw new Error(`${inDir} is not a directory`);
            }

            const archive = new SarcArchive();
            archive.isCompressed = options.zstd;
            archive.le = !options.bigEndian;

            const allFiles: string[] = [];
            const walk = (dir: string) => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const fullPath = path.join(dir, file);
                    if (fs.statSync(fullPath).isDirectory()) {
                        walk(fullPath);
                    } else {
                        allFiles.push(fullPath);
                    }
                }
            };
            walk(inDir);

            for (const file of allFiles) {
                const relPath = path.relative(inDir, file);
                const data = fs.readFileSync(file);
                archive.files.push({ name: relPath, data: new Uint8Array(data) });
                console.log(`Added: ${relPath}`);
            }

            const encoded = archive.encode();
            fs.writeFileSync(output, encoded);
            console.log(`Successfully packed ${archive.files.length} files to ${output}`);
        } catch (err: any) {
            console.error(`Error: ${err.message}`);
            process.exit(1);
        }
    });

program.parse();
