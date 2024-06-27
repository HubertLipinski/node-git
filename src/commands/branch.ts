import fs from 'node:fs'
import { localRef, refExists, refList } from '../utils/ref'
import { repositoryHasChanges, resolveReference } from '../utils/repository'
import { getActiveBranch } from '../utils/branch'
import { absolutePath } from '../utils/directory'

export default (name: string | null = null) => {
  /**
   * we cannot list branches or create new ones in recently initialized repository.
   * Executing this command on empty git repository will result in error: fatal: not a valid object name: 'master'
   */
  if (!repositoryHasChanges()) {
    process.stdout.write('')
    return
  }

  // list branches if no name is given
  if (!name) {
    const activeBranch = localRef(getActiveBranch()!)
    const refMap = refList()
    process.stdout.write('\n')
    refMap.forEach((_, branch) => {
      process.stdout.write(`${branch === activeBranch ? '(*) ' : ''}${branch}\n`)
    })
    return
  }

  if (refExists(name)) {
    process.stdout.write(`Branch '${name}' already exists\n`)
    return
  }

  // create branch with given name

  const head = resolveReference('HEAD')

  fs.writeFileSync(absolutePath(localRef(name)), `${head}\n`)

  process.stdout.write(`Created new branch: '${name}'`)
}
