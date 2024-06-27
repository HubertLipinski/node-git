interface IndexEntry {
  createdTime: Date
  modifiedTime: Date
  dev: string
  ino: string
  mode: string
  uid: string
  gid: string
  size: number
  hash: string
  flags: {
    binary: string
    valid: string
    extended: string
    stage: string
  }
  fileName: string
}

interface GitIndex {
  version: 2 | 3
  size: number
  entries: IndexEntry[] | []
}
