import fs from 'node:fs'
import { absolutePath } from './directory'

const getActiveBranch = (): string | null => {
  const head = fs.readFileSync(absolutePath('HEAD')).toString().trim()

  if (head.startsWith('ref: refs/heads/')) {
    return head.slice(16)
  }

  return null
}

export { getActiveBranch }
