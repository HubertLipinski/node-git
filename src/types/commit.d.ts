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
