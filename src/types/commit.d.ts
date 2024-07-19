interface CommitPersonDetails {
  name: string
  email: string
  date: string
}

interface Commit {
  tree: string
  parent: string | null
  commiter: CommitPersonDetails
  author: CommitPersonDetails
  message: string
}
