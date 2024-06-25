#! /usr/bin/env node

import { Command, Option } from 'commander'

import init from './commands/init'
import catFile from './commands/cat-file'
import hashObject from './commands/hash-object'
import writeTree from './commands/write-tree'
import commitTree from './commands/commit-tree'
import log from './commands/log'
import { readIndex, writeIndex } from './utils/gitIndex'
import status from './commands/status'
import showRef from './commands/show-ref'
import { resolveObject } from './utils/repository'
import revParse from './commands/rev-parse'

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
  .argument('<sha1>', 'Object hash')
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
  .description('Show commit logs')
  .argument('<commit>', 'Commit to start at.')
  .usage('<commit>')
  .action((commit) => {
    console.log(log(commit))
  })

cmd
  .command('ls-files')
  .description('Show information about files in the index and the working tree')
  .action(() => {
    console.log(readIndex()) // TODO: implement
  })

cmd
  .command('show-ref')
  .description('List references in a local repository')
  .action(() => {
    showRef()
  })

cmd
  .command('status')
  .description('Status of the working tree and the index')
  .action(() => {
    status()
  })

cmd
  .command('rev-parse')
  .description('Parse revision (or other objects) identifiers')
  .argument('<name>', 'Name to parse')
  .addOption(
    new Option('-t, --type <type>', 'Specify the expected type').choices(['blob', 'commit', 'tree']).default(null),
  )
  .action((name, options) => {
    revParse(name, options.type)
  })

cmd.parse(process.argv)
