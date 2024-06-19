interface CommandOptions {
  [key: string | object]: boolean | string
}

const enum ObjectType {
  Blob = 'blob',
  Tree = 'tree',
  Commit = 'commit',
}

interface ObjectDetails {
  type: ObjectType
  size: number
  content: Buffer
}

interface TreeEntry {
  mode: string
  type?: string
  hash: string
  filename: string
}

type FileType = 'tree' | 'blob' | 'commit' | 'unknown'
