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

type FileType = 'tree' | 'blob' | 'commit' | 'unknown'
