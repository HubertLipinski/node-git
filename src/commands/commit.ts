import fs from 'node:fs'
import writeTree from './write-tree'
import { writeCommit } from '../utils/objects/commit'
import { findObject, repositoryHasChanges } from '../utils/repository'
import { getActiveBranch } from '../utils/branch'
import { absolutePath } from '../utils/directory'
import { indexHasEntries } from '../utils/gitIndex'

export default (message: string | null) => {
  if (!message) {
    process.stdout.write('error: commit message is required\n')
    return
  }

  if (!indexHasEntries()) {
    process.stdout.write('No changes added to commit.\n')
    process.stdout.write('Use node-git add to add changes to the index file.\n')
    return
  }

  const tree = writeTree()
  const commit = writeCommit(tree, repositoryHasChanges() ? findObject('HEAD') : null, message)

  const activeBranch = getActiveBranch()

  if (activeBranch) {
    fs.writeFileSync(absolutePath(`refs/heads/${activeBranch}`), `${commit}\n`)
  } else {
    fs.writeFileSync(absolutePath('HEAD'), `ref: ${commit}\n`)
  }

  process.stdout.write(`Commit created [${activeBranch ?? 'HEAD'} ${commit.slice(0, 7)}] ${message}\n`)
}
