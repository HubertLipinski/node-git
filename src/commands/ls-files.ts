import { readIndex } from '../utils/gitIndex'
import { formatBytes } from '../utils/fileSize'

export default (options: CommandOptions) => {
  const index: GitIndex = readIndex()

  if (options.verbose) {
    process.stdout.write(`Index file version: ${index.version}, contains ${index.entries.length} entries:\n\n`)
  }

  process.stdout.write(`\n`)
  for (const entry of index.entries) {
    process.stdout.write(`${entry.fileName}\n`)
    if (options.verbose) {
      process.stdout.write(`  sha:\t${entry.hash}\n`)
      process.stdout.write(`  created at:\t${new Date(entry.createdTime).toLocaleString('pl')}\n`)
      process.stdout.write(`  modified at:\t${new Date(entry.modifiedTime).toLocaleString('pl')}\n`)
      process.stdout.write(`  size:\t${formatBytes(entry.size)}\n\n`)
    }
  }
}
