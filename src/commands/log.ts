import { parseCommit } from '../utils/objects/commit'

export default (hash: string) => {
  const short = hash.slice(0, 7)
  const commit = parseCommit(hash)
  commit.message = commit.message.split('\n')[0] // display only first line

  return parseCommit(hash) // TODO: display format
}
