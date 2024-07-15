import fs from 'node:fs'
import { cleanFsPath, workingDirectory } from '../utils/directory'
import { writeBlobObject } from '../utils/objects/blob'
import { getTrackedPaths, writeIndex } from '../utils/gitIndex'

export default (dir: string = '.') => {
  const directory = workingDirectory(dir)

  const trackedFiles = getTrackedPaths('**', { nodir: true, cwd: directory }) as string[]

  const entries: IndexEntry[] = []
  for (const file of trackedFiles) {
    const filePath = workingDirectory(file)
    const details = fs.statSync(filePath)

    const hash = writeBlobObject(filePath)

    entries.push({
      createdTime: details.birthtime,
      modifiedTime: details.mtime,
      dev: details.dev.toString(16),
      ino: '00',
      mode: '0a81',
      uid: '00',
      gid: details.gid.toString(16),
      size: details.size,
      hash: hash,
      fileName: cleanFsPath(file),
    })
  }

  writeIndex({
    version: 2,
    size: entries.length,
    entries: entries,
  })
}
