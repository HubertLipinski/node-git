import { getActiveBranch } from '../utils/branch'
import { readIndex } from '../utils/gitIndex'
import { findObject, repositoryHasChanges, resolveReference } from '../utils/repository'
import { getObjectDetails } from '../utils/filesystem'
import { readTreeEntries } from '../utils/objects/tree'

export default () => {
  if (!repositoryHasChanges()) {
    process.exit(0)
  }

  // display the current branch
  const branch = getActiveBranch()

  if (!branch) {
    process.stdout.write(`HEAD detached at ${branch}\n`)
  } else {
    process.stdout.write(`On branch ${branch}\n\n`)
  }

  // changes to be committed
  process.stdout.write('Changes to be committed:\n\n')
  const index = readIndex()
  const headTreeSha = findObject('HEAD', ObjectType.Tree)
  const headDetails = getObjectDetails(headTreeSha!)
  const tree = readTreeEntries(headDetails.content)

  process.stdout.write(`Tracked files: ${index.entries.length}\n`)
  for (const item of index.entries) {
    const headItem = tree.find((x) => x.filename === item.fileName)

    if (!headItem) {
      process.stdout.write(`  new file:   ${item.fileName}\n`)
    } else if (headItem.hash !== item.hash) {
      process.stdout.write(`  modified:   ${item.fileName}\n`)
    }
  }

  // TODO: compare index with head

  // changes not staged for commit
  // TODO: implement
}
