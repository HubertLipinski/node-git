import { localRef, refExists, refList } from '../utils/ref'
import { repositoryHasChanges } from '../utils/repository'
import { createBranch, deleteBranch, getActiveBranch } from '../utils/branch'
import { colorText } from '../utils/color'

export default (name: string | null = null, options: CommandOptions = {}) => {
  /**
   * we cannot list branches or create new ones in recently initialized repository.
   * Executing this command on empty git repository will result in error: fatal: not a valid object name: 'master'
   */
  if (!repositoryHasChanges()) {
    return
  }

  // list branches if no name is given
  if (!name) {
    const activeBranch = localRef(getActiveBranch()!)
    const refMap = refList()
    process.stdout.write('\n')
    refMap.forEach((_, branch) => {
      process.stdout.write(`${branch === activeBranch ? '* ' + colorText(branch, Color.GREEN) : branch}\n`)
    })
    return
  }

  if (options.delete) {
    deleteBranch(name)
    return
  }

  if (refExists(name)) {
    process.stdout.write(`Branch '${name}' already exists\n`)
    return
  }

  // create branch with given name

  createBranch(name)
}
