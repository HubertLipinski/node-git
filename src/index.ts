#! /usr/bin/env node

import { Command } from "commander";

import init from "./commands/init.js";
import catFile from "./commands/cat-file.js";
import hashObject from "./commands/hash-object.js";
import writeTree from "./commands/write-tree.js";

const cmd = new Command()
  .name("node-git")
  .usage("[option] <command>")
  .version("1.0.0", "-v, --version", "Output the current version");

const initCmd = cmd
  .command("init")
  .description(
    "Create an empty node-git repository or reinitialize an existing one."
  )
  .option('-f', 'Force reinitialization of existing repository')
  .usage(" ")
  .action((opts) => init(opts));

const catFileCmd = cmd
  .command("cat-file")
  .description("Provide information for repository objects.")
  .argument("<sha1>", "Object hash") // error: missing required argument 'sha1'
  .option('-p', 'Pretty print object content')
  .option('-t', 'Instead of the content, show the object type identified by <object>')
  .option('-s', 'Instead of the content, show the object size identified by <object>')
  .usage("[-pt] <sha1>")
  .action((sha1, options) => {
    catFile(sha1, options)
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

const writeTreeCmd = cmd
  .command("write-tree")
  .description(
    "Create a tree object from the current index."
  )
  .action(() => {
    process.stdout.write(writeTree())
  });

cmd.parse(process.argv);