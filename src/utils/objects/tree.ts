import path from 'path'
import { getObjectDetails } from '../filesystem'
import fs from 'node:fs'
import { cleanFsPath, pathJoin } from '../directory'

const readTreeEntries = (buffer: Buffer): TreeEntry[] => {
  const entries: TreeEntry[] = []
  const hashLength = 40
  let index = 0

  while (index < buffer.length - hashLength + 1) {
    const nullChar = buffer.indexOf(0, index)

    const [mode, filename] = buffer.subarray(index, nullChar).toString('utf8').split(' ')

    const hash = buffer.subarray(nullChar + 1, nullChar + hashLength + 1).toString('utf8')

    index = nullChar + hashLength + 1

    entries.push({
      mode,
      type: _fileMode(mode),
      hash,
      filename,
    })
  }

  return entries
}

const formatTreeEntries = (entries: TreeEntry[]): string => {
  return entries.map((entry) => `${entry.mode} ${entry.type} ${entry.hash}    ${entry.filename}`).join('\n')
}

const treeCheckout = (entries: TreeEntry[], dist: string): void => {
  for (const item of entries) {
    const target = path.join(dist, item.filename)
    const obj = getObjectDetails(item.hash)

    if (item.type === ObjectType.Tree) {
      if (!fs.existsSync(target)) fs.mkdirSync(target)
      const subTree = getObjectDetails(item.hash)
      treeCheckout(readTreeEntries(subTree.content), `${dist}/${item.filename}`)
    } else if (item.type === ObjectType.Blob) {
      fs.writeFileSync(target, obj.content, { encoding: 'utf-8' })
    }
  }
}

const parseTreeFromIndex = (entries: TreeEntry[], dist: string, data: IndexTreeEntry[] = []): IndexTreeEntry[] => {
  dist = cleanFsPath(dist)

  for (const item of entries) {
    const treeEntry: IndexTreeEntry = {
      path: pathJoin(dist, item.filename),
      sha: item.hash,
    }

    if (item.type === ObjectType.Tree) {
      const subTree = getObjectDetails(item.hash)
      data.push(...parseTreeFromIndex(readTreeEntries(subTree.content), `${dist}/${item.filename}`))
    } else {
      data.push(treeEntry)
    }
  }

  return data
}

const _fileMode = (value: string): FileType => {
  switch (value) {
    case '040000':
      return 'tree'
    case '100644':
      return 'blob'
    case '100755':
      return 'blob'
    case '120000':
      return 'blob'
    default:
      throw new Error(`Unknown file mode: ${value}`)
  }
}

export { readTreeEntries, formatTreeEntries, treeCheckout, parseTreeFromIndex }
