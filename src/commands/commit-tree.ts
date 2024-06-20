import { writeCommit } from '../utils/objects/commit'

interface CommitCommandOptions {
  parent: string | null
  message: string
}

export default (tree: string, options: CommitCommandOptions): string => {
  return writeCommit(tree, options.parent, options.message)
}
