import path from 'path'
import { Path } from 'glob'
import { cleanFsPath, workingDirectory } from '../utils/directory'
import { writeBlobObject } from '../utils/objects/blob'
import { getTrackedPaths, indexNameToHash, readIndex, writeIndex } from '../utils/gitIndex'

export default (dir: string = '.') => {
  const directory = path.relative(workingDirectory(), workingDirectory(['.', dir]))

  const trackedFiles = getTrackedPaths('**', { nodir: true, cwd: directory, stat: true, withFileTypes: true }) as Path[]

  const changed: IndexEntry[] = []
  let entries: IndexEntry[] = readIndex().entries
  const nameToHash: Map<string, string> = indexNameToHash()

  for (const file of trackedFiles) {
    const filePath = cleanFsPath(path.relative(workingDirectory(), file.fullpath()))
    const hash = writeBlobObject(file.fullpath())

    const item: IndexEntry | undefined = entries.find((entry) => entry.fileName === filePath)
    const hasChanged = nameToHash.has(filePath) && nameToHash.get(filePath) !== hash

    const element: IndexEntry = {
      createdTime: file.birthtime as Date,
      modifiedTime: file.mtime as Date,
      dev: file?.dev?.toString(16) as string,
      ino: file.ino?.toString(32) as string,
      mode: file.mode?.toString(16) as string,
      uid: file.uid?.toString(16) as string,
      gid: file.gid?.toString(16) as string,
      size: file.size as number,
      hash: hash,
      fileName: filePath,
    }

    if (!item) entries.push(element)
    else if (hasChanged) changed.push(element)
  }

  entries = entries.map((entry) => changed.find((item) => item.fileName === entry.fileName) || entry)

  writeIndex({
    version: 2,
    size: entries.length,
    entries: entries,
  })
}
