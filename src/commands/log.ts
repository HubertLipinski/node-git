import { parseCommit } from '../utils/objects/commit'
import { findObject, repositoryHasChanges } from '../utils/repository'
import { colorText } from '../utils/color'

export default async (hash: string | null) => {
  if (!repositoryHasChanges()) return null

  process.stdout.write(`\n`)
  process.stdout.write(`Press 'q' to quit, any other key to continue\n`)
  process.stdout.write(`\n`)

  const commit = findObject(hash ?? 'HEAD') as string
  const details = parseCommit(commit)
  displayDetails(commit, details)

  if (details.parent === null) {
    return
  }

  let parent = findObject(details.parent) as string
  let parentDetails = parseCommit(parent)
  displayDetails(parent, parentDetails)

  while (parentDetails.parent !== null) {
    const key = await waitKeyPressed()
    if (key.toLowerCase() === 'q') process.exit(0)

    parent = findObject(parentDetails.parent) as string
    parentDetails = parseCommit(parent)
    displayDetails(parent, parentDetails)
  }
}

const displayDetails = (sha: string, details: Commit): void => {
  process.stdout.write(colorText(`commit ${sha}\n`, Color.YELLOW))
  process.stdout.write(`Author ${details.author.name} <${details.author.email}>\n`)
  process.stdout.write(`Date: ${new Date(parseInt(details.author.date) * 1000).toLocaleString('pl')}\n\n`)
  process.stdout.write(`\t${details.message}\n`)
}

const waitKeyPressed = (): Promise<string> => {
  return new Promise((resolve) => {
    const raw = process.stdin.isRaw
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.once('data', (data: Buffer) => {
      process.stdin.pause()
      process.stdin.setRawMode(raw)
      resolve(data.toString())
    })
  })
}
