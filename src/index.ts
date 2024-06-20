#! /usr/bin/env node

import { Command, Option } from 'commander'

import init from './commands/init'
import catFile from './commands/cat-file'
import hashObject from './commands/hash-object'
import writeTree from './commands/write-tree'
import commitTree from './commands/commit-tree'
import log from './commands/log'

const cmd = new Command()
  .name('node-git')
  .usage('[option] <command>')
  .version('1.0.0', '-v, --version', 'Output the current version')

cmd
  .command('init')
  .description('Create an empty node-git repository or reinitialize an existing one.')
  .option('-f', 'Force reinitialization of existing repository')
  .usage(' ')
  .action((opts) => init(opts))

cmd
  .command('cat-file')
  .description('Provide information for repository objects.')
  .argument('<sha1>', 'Object hash') // error: missing required argument 'sha1'
  .option('-p', 'Pretty print object content')
  .option('-t', 'Instead of the content, show the object type identified by <object>')
  .option('-s', 'Instead of the content, show the object size identified by <object>')
  .usage('[-pt] <sha1>')
  .action((sha1, options) => {
    catFile(sha1, options)
  })

cmd
  .command('hash-object')
  .description('Calculate SHA1 hash of given file and optionally create a blob from given file.')
  .argument('<file>', 'Path to file')
  .option('-w', 'Write object to repository')
  .usage('[-w] <file>')
  .action((path, options) => {
    process.stdout.write(hashObject(path, options))
  })

cmd
  .command('write-tree')
  .description('Create a tree object from the current index.')
  .action(() => {
    process.stdout.write(writeTree())
  })

cmd
  .command('commit-tree')
  .description('Create a new commit object')
  .argument('<tree>', 'Existing tree object')
  .addOption(new Option('-p, --parent <hash>', 'Commit parent'))
  .addOption(new Option('-m, --message <string>', 'Commit message').makeOptionMandatory())
  .usage('<tree> [-pm]')
  .action((tree, options) => {
    console.log(tree, options)
    process.stdout.write(commitTree(tree, options))
  })

cmd
  .command('log')
  .description('Log')
  .argument('[commit]', 'Commit to start at.')
  .usage('[commit]')
  .action((commit) => {
    console.log(log(commit))
  })

cmd.parse(process.argv)
