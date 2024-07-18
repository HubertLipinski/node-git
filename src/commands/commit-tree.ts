import { writeCommit } from '../utils/objects/commit'

export default (tree: string, options: CommitCommandOptions): string => {
  return writeCommit(tree, options.parent, options.message)
}
