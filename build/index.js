#! /usr/bin/env node
import { Command, Option } from 'commander';
import fs from 'node:fs';
import path from 'path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { EOL } from 'os';
import assert from 'node:assert';

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
    fs.mkdirSync(absolutePath('refs', 'heads'), { recursive: true });
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
const getObject = (hash) => {
    const fileLocation = hashToPath(hash);
    const path = absolutePath('objects', fileLocation.directory, fileLocation.filename);
    if (!objectExist(hash)) {
        throw new Error(`File not found: ${hash}`);
    }
    return fs.readFileSync(path);
};
const getObjectDetails = (hash) => {
    const content = getObject(hash);
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
            type: _fileMode(mode),
            hash,
            filename,
        });
    }
    return entries;
};
const formatTreeEntries = (entries) => {
    return entries.map((entry) => `${entry.mode} ${entry.type} ${entry.hash}    ${entry.filename}`).join('\n');
};
const _fileMode = (value) => {
    switch (value) {
        case '040000':
            return 'tree';
        case '100644':
            return 'blob';
        case '100755':
            return 'blob';
        case '120000':
            return 'blob';
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
        process.stdout.write(object.content.toString());
        return;
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

const writeCommit = (tree, parent, message = 'Default commit message') => {
    if (!objectExist(tree)) {
        throw new Error(`Object does not exist: ${tree}`);
    }
    if (parent && !objectExist(parent)) {
        throw new Error(`Parent does not exist: ${tree}`);
    }
    // TODO: read from config
    const author = `User user@example.com ${Math.floor(Date.now() / 1000)} +0000`;
    const commiter = author;
    let content = `tree ${tree}\nauthor ${author}\ncommiter ${commiter}\n\n${message}\n`;
    if (parent) {
        content = `tree ${tree}\nparent ${parent}\nauthor ${author}\ncommiter ${commiter}\n\n${message}\n`;
    }
    const header = `commit ${content.length}\0`;
    const commitObject = header + content;
    const commitHash = generateHash(commitObject);
    writeObject(commitHash, zlib.deflateSync(commitObject));
    return commitHash;
};
const parseCommit = (hash) => {
    if (!objectExist(hash)) {
        throw new Error(`Commit does not exist: ${hash}`);
    }
    const object = getObjectDetails(hash);
    const data = Buffer.from(object.content).toString().split('\n\n');
    const [content, message] = [data[0], data[1]];
    const result = _commitEntry(message);
    content.split('\n').map((line) => {
        const [key, ...value] = line.split(' ');
        switch (key) {
            case 'author':
            case 'commiter':
                result[key] = {
                    name: value[0],
                    email: value[1],
                    date: `${value[2]} ${value[3]}`,
                };
                break;
            case 'tree':
            case 'parent':
                result[key] = value[0];
                break;
        }
    });
    return result;
};
const _commitEntry = (message) => {
    return {
        tree: '',
        parent: null,
        commiter: {
            name: '',
            email: '',
            date: '',
        },
        author: {
            name: '',
            email: '',
            date: '',
        },
        message: message,
    };
};

var commitTree = (tree, options) => {
    return writeCommit(tree, options.parent, options.message);
};

var log = (hash) => {
    if (!hash) {
        //
        throw new Error('Not implemented, provide hash');
    }
    hash.slice(0, 7);
    const commit = parseCommit(hash);
    commit.message = commit.message.split('\n')[0]; // display only first line
    return parseCommit(hash); // TODO: display format
};

// https://github.com/git/git/blob/master/Documentation/gitformat-index.txt
const readIndex = () => {
    if (!fs.existsSync('.nodegit/index')) {
        throw new Error('Index does not exist');
    }
    const binary = fs.readFileSync('.nodegit/index', 'binary');
    const buffer = Buffer.from(binary, 'binary');
    const header = buffer.subarray(0, 12);
    const signature = header.subarray(0, 4);
    assert(signature.toString() === 'DIRC', 'Invalid signature');
    const version = header.readUIntBE(4, 4);
    assert(version === 2, 'Only version 2 is supported');
    const contentLength = header.readUIntBE(8, 4);
    const entries = [];
    let index = 0;
    const content = buffer.subarray(header.length);
    for (let i = 0; i < contentLength; i++) {
        const ctime = content.subarray(index + 0, index + 4);
        const mtime = content.subarray(index + 8, index + 12);
        const dev = content.subarray(index + 16, index + 20);
        const ino = content.subarray(index + 20, index + 24);
        const mode = content.subarray(index + 24, index + 28);
        const uid = content.subarray(index + 28, index + 32);
        const gid = content.subarray(index + 32, index + 36);
        const size = content.readUInt32BE(index + 36);
        const hash = content.subarray(index + 40, index + 60);
        const flags = content.readUIntBE(index + 60, 2).toString(2);
        const flagValid = flags[0].toString();
        const flagExtended = flags[1].toString();
        // assert(!flagExtended, 'Flag extended is not supported')
        const flagStage = parseInt(flags.slice(1, 3), 2);
        const fileNameLength = parseInt(flags, 2) & 0b0000111111111111;
        let fileName = null;
        index += 62;
        if (fileNameLength < 4095) {
            fileName = content.subarray(index, index + fileNameLength).toString('utf8');
            index += fileNameLength + 1;
        }
        else {
            throw new Error(`File name length is too long: ${fileNameLength} > 4095 bytes`);
        }
        index = 8 * Math.ceil(index / 8); // skip as much padded bytes as possible
        entries.push({
            createdTime: parseDate(ctime),
            modifiedTime: parseDate(mtime),
            dev: dev.toString('hex'),
            ino: ino.toString('hex'),
            mode: mode.toString('hex'),
            uid: uid.toString('hex'),
            gid: gid.toString('hex'),
            size: size,
            hash: hash.toString('hex'),
            fileName: fileName,
            flags: {
                binary: flags.toString(),
                valid: flagValid,
                extended: flagExtended,
                stage: flagStage.toString(2),
            },
        });
    }
    return entries;
};
const parseDate = (time) => {
    return new Date(parseInt(time.toString('hex'), 16) * 1000);
};

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
cmd
    .command('commit-tree')
    .description('Create a new commit object')
    .argument('<tree>', 'Existing tree object')
    .addOption(new Option('-p, --parent <hash>', 'Commit parent'))
    .addOption(new Option('-m, --message <string>', 'Commit message').makeOptionMandatory())
    .usage('<tree> [-pm]')
    .action((tree, options) => {
    console.log(tree, options);
    process.stdout.write(commitTree(tree, options));
});
cmd
    .command('log')
    .description('Show commit logs')
    .argument('<commit>', 'Commit to start at.')
    .usage('<commit>')
    .action((commit) => {
    console.log(log(commit));
});
cmd
    .command('ls-files')
    .description('Show information about files in the index and the working tree')
    .action(() => {
    console.log(readIndex()); // TODO: implement
});
cmd.parse(process.argv);
