#! /usr/bin/env node
import { Command } from 'commander';
import fs from 'node:fs';
import path from 'path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { EOL } from 'os';

const rootDirectory = process.cwd();
const rootFolder = process.env._NODE_GIT_DIRECTORY ?? '.nodegit';
const configDir = path.join(rootDirectory, rootFolder);
const absolutePath = (...args) => {
    if (args.length === 0)
        return configDir;
    return path.join(configDir, ...args);
};

var init = (opts) => {
    if (fs.existsSync(configDir) && !opts.f) {
        process.stdout.write('Detected existing node-git repository. Use -f flag to force reinitialize.');
        return;
    }
    process.stdout.write(fs.existsSync(configDir)
        ? `Reinitialized existing node-git repository in ${configDir}`
        : `Initialized empty node-git repository in ${configDir}`);
    bootstrapCoreFiles();
};
const bootstrapCoreFiles = () => {
    fs.mkdirSync(configDir, { recursive: true });
    fs.mkdirSync(absolutePath('objects'), { recursive: true });
    fs.mkdirSync(absolutePath('refs'), { recursive: true });
    fs.writeFileSync(absolutePath('HEAD'), 'ref: refs/heads/main\n');
};

const hashToPath = (hash) => {
    return {
        directory: hash.slice(0, 2),
        filename: hash.slice(2),
    };
};
const objectExist = (hash) => {
    const fileLocation = hashToPath(hash);
    return fs.existsSync(absolutePath('objects', fileLocation.directory, fileLocation.filename));
};
const getObjectPath = (hash, absolute = true) => {
    const fileLocation = hashToPath(hash);
    if (!absolute) {
        return `${fileLocation.directory}/${fileLocation.filename}`;
    }
    return absolutePath('objects', fileLocation.directory, fileLocation.filename);
};
const getObjectDetails = (hash) => {
    const fileLocation = hashToPath(hash);
    const path = absolutePath('objects', fileLocation.directory, fileLocation.filename);
    if (!objectExist(hash)) {
        throw new Error(`File not found: ${hash}`);
    }
    const content = fs.readFileSync(path);
    const inflatedBuffer = zlib.inflateSync(content);
    const inflatedString = inflatedBuffer.toString();
    const type = inflatedString.split(' ')[0];
    const size = inflatedString.split(' ')[1].split('\x00')[0];
    const dataBuffer = inflatedBuffer.subarray(type.length + size.length + 2);
    return {
        type,
        size: parseInt(size),
        content: dataBuffer,
    };
};
const writeObject = (hash, data) => {
    const fileLocation = hashToPath(hash);
    fs.mkdirSync(absolutePath('objects', fileLocation.directory), {
        recursive: true,
    });
    fs.writeFileSync(getObjectPath(hash), data);
};

const readTreeEntries = (buffer) => {
    const entries = [];
    const hashLength = 40;
    let index = 0;
    while (index < buffer.length - hashLength + 1) {
        const nullChar = buffer.indexOf(0, index);
        const [mode, filename] = buffer.subarray(index, nullChar).toString('utf8').split(' ');
        const hash = buffer.subarray(nullChar + 1, nullChar + hashLength + 1).toString('utf8');
        index = nullChar + hashLength + 1;
        entries.push({
            mode,
            type: fileMode(mode),
            hash,
            filename,
        });
    }
    return entries;
};
const formatTreeEntries = (entries) => {
    return entries.map((entry) => `${entry.mode} ${entry.type} ${entry.hash}    ${entry.filename}`).join('\n');
};
const fileMode = (value) => {
    switch (value) {
        case '040000':
            return 'tree';
        case '100644':
            return 'blob';
        case '100755':
            return 'blob';
        case '120000':
            return 'blob';
        case '160000':
            return 'commit';
        default:
            throw new Error(`Unknown file mode: ${value}`);
    }
};

var catFile = (hash, options) => {
    const object = getObjectDetails(hash);
    if (options.t) {
        process.stdout.write(object.type);
        return;
    }
    if (options.s) {
        process.stdout.write(object.size.toString());
        return;
    }
    if (!options.p) {
        process.stdout.write('Missing option -p');
        return;
    }
    if (object.type === "blob" /* ObjectType.Blob */) {
        const blobContent = object.content.toString().split('\x00').join('');
        process.stdout.write(blobContent);
        return;
    }
    if (object.type === "tree" /* ObjectType.Tree */) {
        const treeEntries = readTreeEntries(object.content);
        process.stdout.write(formatTreeEntries(treeEntries));
        return;
    }
    if (object.type === "commit" /* ObjectType.Commit */) {
        console.info('Object type: Commit');
        throw new Error('Not implemented.');
    }
    throw new Error(`Unknown object ${hash}`);
};

const generateHash = (data, encoding = 'hex') => {
    return crypto.createHash('sha1').update(data).digest(encoding);
};

const writeBlobObject = (filePath) => {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    const fileContent = fs.readFileSync(filePath);
    const blob = `blob ${fileContent.length}\x00${fileContent}`;
    const hash = generateHash(blob);
    const compressedData = zlib.deflateSync(blob);
    writeObject(hash, compressedData);
    return hash;
};

var hashObject = (path, options) => {
    const file = fs.readFileSync(path);
    const blob = `blob ${file.length}\x00${file}`;
    if (!options.w) {
        return generateHash(blob);
    }
    return writeBlobObject(path);
};

const getIgnoredFiles = () => {
    const ignoreFileName = '.nodegitignore';
    const filePath = path.join(process.cwd(), ignoreFileName);
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const content = fs.readFileSync(path.join(process.cwd(), ignoreFileName), 'utf-8').toString();
    return content.split(EOL).filter((line) => line.trim() !== '');
};

function writeTree(directory = './') {
    const ignoredFiles = getIgnoredFiles();
    const content = fs.readdirSync(directory).filter((file) => !ignoredFiles.includes(file));
    const entries = [];
    content.forEach((file) => {
        const fullPath = path.join(directory, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            entries.push({
                mode: '040000',
                filename: file,
                hash: writeTree(fullPath),
            });
        }
        else {
            entries.push({
                mode: '100644',
                filename: file,
                hash: writeBlobObject(fullPath),
            });
        }
    });
    const treeData = entries.reduce((acc, { mode, filename, hash }) => {
        return Buffer.concat([acc, Buffer.from(`${mode} ${filename}\x00`), Buffer.from(hash, 'utf-8')]);
    }, Buffer.alloc(0));
    const tree = Buffer.concat([Buffer.from(`tree ${treeData.length}\x00`), treeData]);
    const compressedData = zlib.deflateSync(tree);
    const treeHash = generateHash(tree);
    fs.mkdirSync(getObjectPath(treeHash.slice(0, 2)), { recursive: true });
    fs.writeFileSync(getObjectPath(treeHash), compressedData);
    return treeHash;
}

const cmd = new Command()
    .name('node-git')
    .usage('[option] <command>')
    .version('1.0.0', '-v, --version', 'Output the current version');
cmd
    .command('init')
    .description('Create an empty node-git repository or reinitialize an existing one.')
    .option('-f', 'Force reinitialization of existing repository')
    .usage(' ')
    .action((opts) => init(opts));
cmd
    .command('cat-file')
    .description('Provide information for repository objects.')
    .argument('<sha1>', 'Object hash') // error: missing required argument 'sha1'
    .option('-p', 'Pretty print object content')
    .option('-t', 'Instead of the content, show the object type identified by <object>')
    .option('-s', 'Instead of the content, show the object size identified by <object>')
    .usage('[-pt] <sha1>')
    .action((sha1, options) => {
    catFile(sha1, options);
});
cmd
    .command('hash-object')
    .description('Calculate SHA1 hash of given file and optionally create a blob from given file.')
    .argument('<file>', 'Path to file')
    .option('-w', 'Write object to repository')
    .usage('[-w] <file>')
    .action((path, options) => {
    process.stdout.write(hashObject(path, options));
});
cmd
    .command('write-tree')
    .description('Create a tree object from the current index.')
    .action(() => {
    process.stdout.write(writeTree());
});
cmd.parse(process.argv);
