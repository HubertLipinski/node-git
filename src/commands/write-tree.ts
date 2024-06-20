import path from 'path'
import fs from 'node:fs'
import zlib from 'node:zlib'

import { generateHash } from '../utils/hash'
import { getObjectPath } from '../utils/filesystem'
import { writeBlobObject } from '../utils/objects/blob'
import { getIgnoredFiles } from '../utils/config'

export default function writeTree(directory: string = './'): string {
  const ignoredFiles = getIgnoredFiles()
  const content = fs.readdirSync(directory).filter((file) => !ignoredFiles.includes(file))

  const entries: TreeEntry[] = []
  content.forEach((file) => {
    const fullPath = path.join(directory, file)
    if (fs.lstatSync(fullPath).isDirectory()) {
      entries.push({
        mode: '040000',
        filename: file,
        hash: writeTree(fullPath),
      })
    } else {
      entries.push({
        mode: '100644',
        filename: file,
        hash: writeBlobObject(fullPath),
      })
    }
  })

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
