import fs from 'node:fs'
import path from 'path'

import { absolutePath, cleanFsPath, repositoryDirectory } from './directory'
import { resolveReference } from './repository'

const refList = (filePath: string | null = null): Map<string, string> => {
  if (!filePath) {
    filePath = absolutePath('refs')
  }

  const list: Map<string, string> = new Map<string, string>()

  const files = fs.readdirSync(filePath)

  for (const file of files) {
    const fullPath = path.join(filePath, file)

    if (fs.statSync(fullPath).isDirectory()) {
      const subList = refList(fullPath)
      for (const [key, value] of subList) {
        list.set(key, value)
      }
    } else {
      const content = resolveReference(fullPath, true)
      let key = path.relative(repositoryDirectory, fullPath)

      // format ugly windows path
      if (path.sep === '\\') {
        key = cleanFsPath(key)
      }

      list.set(key, content!)
    }
  }

  return list
}

const localRef = (name: string): string => {
  return `refs/heads/${name}`
}

const localRefPath = (name: string): string => {
  return absolutePath(localRef(name))
}

const refExists = (name: string): boolean => {
  return fs.existsSync(localRefPath(name))
}

export { refList, localRef, refExists }
