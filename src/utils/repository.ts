import fs from 'node:fs'
import { absolutePath } from './directory'
import { getObjectDetails } from './filesystem'
import { parseCommit } from './objects/commit'
import { refExists } from './ref'
import { getActiveBranch } from './branch'

const repositoryHasChanges = (): boolean => {
  /**
   * Check if the repository has changes.
   * This is edge case when the repository was just initialized
   * therefore it doesn't have any HEAD or tree data, and we cannot proceed.
   * This is also the case in original git implementation where the git throws fatal error
   */

  const hasIndex = fs.existsSync(absolutePath('index'))
  const hasMasterRef = refExists(getActiveBranch() ?? 'master')

  return hasIndex && hasMasterRef
}

const resolveObject = (name: string): string[] => {
  if (name === 'HEAD') {
    return [<string>resolveReference(name)]
  }

  const results = []

  const hashRegx = /^[0-9a-f]{40}$/
  if (hashRegx.test(name)) {
    results.push(name)
  }

  // tag or branch
  const tag = resolveReference(`refs/tags/${name}`)
  if (tag) {
    results.push(tag)
  }

  const branch = resolveReference(`refs/heads/${name}`)
  if (branch) {
    results.push(branch)
  }

  return results
}

const resolveReference = (ref: string, systemPath: boolean = false): string | null => {
  const path = systemPath ? ref : absolutePath(ref)

  if (!fs.existsSync(path)) {
    return null
  }

  const content = fs.readFileSync(path).toString().trim().replace('\n', '')

  if (content.startsWith('ref: ')) {
    return resolveReference(content.slice(5))
  }

  return content
}

const findObject = (sha: string, format: null | ObjectType = null, follow: boolean = true): string | null => {
  const matches = resolveObject(sha)

  if (matches.length === 0) {
    throw new Error(`No such reference: ${sha}`)
  }

  if (matches.length > 1) {
    throw new Error(`Ambiguous reference: ${sha} \n Candidates: ${matches.join(', ')}`)
  }

  const hash = matches[0]
  const object = getObjectDetails(hash)

  if (!format || object.type == format) {
    return hash
  }

  if (!follow) {
    return null
  }

  if (object.type == ObjectType.Commit) {
    return parseCommit(hash).tree
  }

  return hash
}

export { repositoryHasChanges, resolveObject, resolveReference, findObject }
