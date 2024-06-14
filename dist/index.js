#! /usr/bin/env node
process.env._NODE_GIT_DIRECTORY = ".nodegit";
import init from "./commands/init.js";
import catFile from "./commands/cat-file.js";
(() => {
    // TODO: refactor (maybe add commander.js?)
    const command = process.argv[2] ?? "";
    const payload = process.argv.splice(3);
    switch (command) {
        case "":
            process.stdout.write(`Missing command! Use 'node-git help' for more information`);
            break;
        case "help":
            process.stdout.write(`Usage`);
            break;
        case "init":
            init();
            break;
        case "cat-file":
            catFile(payload);
            break;
        case "hash-object":
            process.stdout.write(`Init command`);
            break;
        case "ls-tree":
            process.stdout.write(`Init command`);
            break;
        case "write-tree":
            process.stdout.write(`Init command`);
            break;
        case "commit-tree":
            process.stdout.write(`Init command`);
            break;
        default:
            process.stdout.write(`Unknown command: ${command}`);
    }
})();
