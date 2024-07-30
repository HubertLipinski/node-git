import fs from 'node:fs'
import { readIndex, writeIndex } from '../utils/gitIndex'

export default (paths: string[]): void => {
  const index: GitIndex = readIndex()
  const indexEntries = [...index.entries]

  for (const [id, entry] of indexEntries.entries()) {
    if (paths.includes(entry.fileName)) {
      indexEntries.splice(id, 1)
      fs.unlinkSync(entry.fileName)
    }
  }

  writeIndex({
    version: 2,
    size: indexEntries.length,
    entries: indexEntries,
  })
}
