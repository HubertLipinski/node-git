import fs from 'node:fs'
import { findObject, resolveReference } from '../utils/repository'
import { getObjectDetails, objectExist } from '../utils/filesystem'
import { readTreeEntries, treeCheckout } from '../utils/objects/tree'
import { absolutePath, createSafeDirectory, workingDirectory } from '../utils/directory'
import { localRef, refExists } from '../utils/ref'
import { parseCommit } from '../utils/objects/commit'

export default (branch: string, directory: string, options: CommandOptions): void => {
  if (options.commit) {
    const sha = options.commit.toString()
    const obj = findObject(sha) as string
    const details = getObjectDetails(obj)

    const distPath = workingDirectory(directory)
    createSafeDirectory(distPath)
    treeCheckout(readTreeEntries(details.content), distPath)

    fs.writeFileSync(absolutePath('HEAD'), `ref: ${sha}\n`)
    process.stdout.write(`HEAD detached at ${sha}`)

    return
  }

  if (!refExists(branch)) {
    process.stdout.write(`Branch '${branch}' does not exist`)
    return
  }

  const ref = localRef(branch)
  const head = resolveReference(ref) as string
  const commitTree = parseCommit(head).tree
  const details = getObjectDetails(commitTree)

  const distPath = workingDirectory(directory)
  createSafeDirectory(distPath)
  treeCheckout(readTreeEntries(details.content), distPath)

  fs.writeFileSync(absolutePath('HEAD'), `ref: ${ref}\n`)
  process.stdout.write(`Switched to branch '${branch}'`)
}
