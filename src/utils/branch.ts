import fs from 'node:fs'
import { absolutePath } from './directory'
import { localRef, refExists } from './ref'
import { resolveReference } from './repository'
import { colorText } from './color'

const getActiveBranch = (): string | null => {
  const head = fs.readFileSync(absolutePath('HEAD')).toString().trim().replace('\n', '')

  if (head.startsWith('ref: refs/heads/')) {
    return head.slice(16)
  }

  return null
}

const createBranch = (name: string): void => {
  const head = resolveReference('HEAD')

  fs.writeFileSync(absolutePath(localRef(name)), `${head}\n`)

  process.stdout.write(`Created new branch: '${name}'`)
}

const deleteBranch = (name: string): void => {
  if (!refExists(name)) {
    process.stdout.write(colorText(`Cannot delete ${name}. Branch does not exist!`, Color.RED))
    return
  }

  if (getActiveBranch() === name) {
    process.stdout.write(colorText(`Currently on ${name}. Checkout to another branch before deleting!`, Color.YELLOW))
    return
  }

  fs.unlinkSync(absolutePath(localRef(name)))

  process.stdout.write(`Branch '${name}' has been deleted!`)
}

export { getActiveBranch, createBranch, deleteBranch }
