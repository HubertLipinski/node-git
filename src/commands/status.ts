import { getActiveBranch } from '../utils/branch'
import { readIndex } from '../utils/gitIndex'
import { resolveReference } from '../utils/repository'

export default () => {
  // display the current branch
  const branch = getActiveBranch()
  const index = readIndex()

  if (!branch) {
    process.stdout.write(`HEAD detached at ${branch}\n`)
  } else {
    process.stdout.write(`On branch ${branch}\n`)
  }

  // changes to be committed
  process.stdout.write('Changes to be committed:\n')

  const head = resolveReference('HEAD')
  // TODO: compare index with head

  // changes not staged for commit
  // TODO: implement
}
