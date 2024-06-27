import { getActiveBranch } from '../utils/branch'
import { readIndex } from '../utils/gitIndex'
import { repositoryHasChanges, resolveReference } from '../utils/repository'

export default () => {
  // display the current branch
  const branch = getActiveBranch()

  if (!branch) {
    process.stdout.write(`HEAD detached at ${branch}\n`)
  } else {
    process.stdout.write(`On branch ${branch}\n\n`)
  }

  // changes to be committed

  if (!repositoryHasChanges()) {
    process.stdout.write('No commits yet\n\n')
  } else {
    process.stdout.write('Changes to be committed:\n\n')
    const index = readIndex()
    const head = resolveReference('HEAD')
  }

  // TODO: compare index with head

  // changes not staged for commit
  // TODO: implement
}
