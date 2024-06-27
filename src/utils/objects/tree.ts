import { readIndex } from '../gitIndex'

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

const treeFromIndex = () => {
  const index = readIndex()

  for (const entry of index.entries) {
    console.log(entry)
  }
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

export { readTreeEntries, formatTreeEntries, treeFromIndex }
