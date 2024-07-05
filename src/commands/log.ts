import { parseCommit } from '../utils/objects/commit'
import { findObject, repositoryHasChanges } from '../utils/repository'

export default (hash: string | null) => {
  if (!repositoryHasChanges()) return null

  process.stdout.write(`\n`)
  const commit = findObject(hash ?? 'HEAD') as string
  const details = parseCommit(commit)
  displayDetails(commit, details)

  if (details.parent === null) {
    return
  }

  let parent = findObject(details.parent) as string
  let parentDetails = parseCommit(parent)

  while (parentDetails.parent !== null) {
    displayDetails(parent, parentDetails)
    parent = findObject(parentDetails.parent) as string
    parentDetails = parseCommit(parent)
  }
}

const displayDetails = (sha: string, details: Commit): void => {
  process.stdout.write(`commit ${sha}\n`)
  process.stdout.write(`Author ${details.author.name} <${details.author.email}>\n`)
  process.stdout.write(`Date: ${new Date(parseInt(details.author.date) * 1000).toLocaleString('pl')}\n\n`)
  process.stdout.write(`\t${details.message}\n`)
}
