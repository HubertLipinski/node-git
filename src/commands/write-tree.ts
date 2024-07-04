import fs from 'node:fs'
import zlib from 'node:zlib'

import { generateHash } from '../utils/hash'
import { getObjectPath } from '../utils/filesystem'
import { writeBlobObject } from '../utils/objects/blob'
import { getTrackedPaths } from '../utils/gitIndex'
import { workingDirectory } from '../utils/directory'
import { Path } from 'glob'

export default function writeTree(directory: string = '.'): string {
  const trackedFiles = getTrackedPaths('*', {
    root: '',
    cwd: workingDirectory(directory),
    stat: true,
    withFileTypes: true,
  }) as Path[]

  const entries: TreeEntry[] = []
  for (const file of trackedFiles) {
    if (file.isDirectory()) {
      entries.push({
        mode: '040000',
        filename: file.name,
        hash: writeTree(file.relative()),
      })
    } else {
      entries.push({
        mode: '100644',
        filename: file.name,
        hash: writeBlobObject(file.fullpath()),
      })
    }
  }

  const treeData = entries.reduce((acc, { mode, filename, hash }) => {
    return Buffer.concat([acc, Buffer.from(`${mode} ${filename}\x00`), Buffer.from(hash, 'utf-8')])
  }, Buffer.alloc(0))
  const tree = Buffer.concat([Buffer.from(`tree ${treeData.length}\x00`), treeData])

  const compressedData = zlib.deflateSync(tree)
  const treeHash = generateHash(tree)

  fs.mkdirSync(getObjectPath(treeHash.slice(0, 2)), { recursive: true })
  fs.writeFileSync(getObjectPath(treeHash), compressedData)

  return treeHash
}
