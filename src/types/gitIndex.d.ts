interface FileDetails {
  createdTime: Date
  modifiedTime: Date
  fileName: string
  size: number
}

interface IndexEntry extends FileDetails {
  dev: string
  ino: string
  mode: string
  uid: string
  gid: string
  hash: string
  flags?: {
    binary: string
    valid: string
    extended: string
    stage: string
  }
}

interface GitIndex {
  version: 2 | 3
  size: number
  entries: IndexEntry[] | []
}

interface IndexTreeEntry {
  path: string
  sha: string
}
