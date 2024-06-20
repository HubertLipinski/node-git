import fs from 'node:fs'
import path from 'path'
import { EOL } from 'os'

const getIgnoredFiles = (): string[] => {
  const ignoreFileName: string = '.nodegitignore'
  const filePath = path.join(process.cwd(), ignoreFileName)

  if (!fs.existsSync(filePath)) {
    return []
  }

  const content = fs.readFileSync(path.join(process.cwd(), ignoreFileName), 'utf-8').toString()

  return content.split(EOL).filter((line) => line.trim() !== '')
}

export { getIgnoredFiles }
