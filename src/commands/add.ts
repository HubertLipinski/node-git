import fs from 'node:fs'
import { workingDrectory } from '../utils/directory'
import { getIgnoredFiles } from '../utils/config'
import path from 'path'
import { writeBlobObject } from '../utils/objects/blob'
import { writeIndex } from '../utils/gitIndex'

export default (dir: string = '.') => {
  const directory = workingDrectory(dir)

  const ignoredFiles = getIgnoredFiles()
  const content = fs.readdirSync(directory, { recursive: true, withFileTypes: true })

  const files = content.filter((file) => {
    const rootDir = path.relative(workingDrectory(), file.path).split(path.sep).shift()!
    return !ignoredFiles.includes(rootDir) && !file.isDirectory()
  })

  const entries: IndexEntry[] = []
  for (const file of files) {
    const filePath = path.join(path.resolve(file.path), file.name)
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
      fileName: file.name,
    })
  }

  writeIndex({
    version: 2,
    size: entries.length,
    entries: entries,
  })
}
