#! /usr/bin/env node

import { Command } from "commander";

import init from "./commands/init.js";
import catFile from "./commands/cat-file.js";
import hashObject from "./commands/hash-object.js";

const cmd = new Command()
  .name("node-git")
  .usage("[option] <command>")
  .version("1.0.0", "-v, --vers", "Output the current version");

const initCmd = cmd
  .command("init")
  .description(
    "Create an empty node-git repository or reinitialize an existing one."
  )
  .usage(" ")
  .action(() => init());

const catFileCmd = cmd
  .command("cat-file")
  .description("Provide information for repository objects.")
  .argument("<sha1>", "Object hash") // error: missing required argument 'sha1'
  .option('-p', 'Pretty print object content')
  .usage("[-p] <sha1>")
  .action((sha1, options) => {
    console.log(sha1, options)
    // catFile(type, sha1, options)
    // process.stdout.write()
  });

const hashObjectCmd = cmd
  .command("hash-object")
  .description(
    "Calculate SHA1 hash of given file and optionally create a blob from given file."
  )
  .argument("<file>", "Path to file")
  .option("-w", "Write object to repository")
  .usage("[-w] <file>")
  .action((path, options) => {
    process.stdout.write(hashObject(path, options))
  });

cmd.parse(process.argv);

// program
//   .version('0.0.1', '-v, --vers', 'output the current version')
//   .command('cat-file <path>')
//   .argument('<path>', "Path to file")
//   .option('-w', 'write to repository')
//   .usage('[-w] <path>')
//   .action((filename, options) => {
//     console.log(filename, options)
//   })
//   .parse()

// process.env._NODE_GIT_DIRECTORY = ".nodegit";



// (() => {
//   // TODO: refactor (maybe add commander.js?)
//   const command: string = process.argv[2] ?? "";
//   const payload: string[] = process.argv.splice(3);

//   switch (command) {
//     case "":
//       process.stdout.write(
//         `Missing command! Use 'node-git help' for more information`
//       );
//       break;
//     case "help":
//       process.stdout.write(`Usage`);
//       break;
//     case "init":
//       init();
//       break;
//     case "cat-file":
//       catFile(payload)
//       break;
//     case "hash-object":
//       process.stdout.write(hashObject(payload));
//       break;
//     case "ls-tree":
//       process.stdout.write(`Init command`);
//       break;
//     case "write-tree":
//       process.stdout.write(`Init command`);
//       break;
//     case "commit-tree":
//       process.stdout.write(`Init command`);
//       break;
//     default:
//       process.stdout.write(`Unknown command: ${command}`);
//   }
// })();
