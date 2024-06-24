interface Commit {
  tree: string
  parent: string | null
  commiter: {
    name: string
    email: string
    date: string
  }
  author: {
    name: string
    email: string
    date: string
  }
  message: string
}

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
