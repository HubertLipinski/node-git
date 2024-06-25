import fs from 'node:fs'
import path from 'path'

import { absolutePath, configDir } from './directory'
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
      let key = path.relative(configDir, fullPath)

      // format ugly windows path
      if (path.sep === '\\') {
        key = key.replace(/\\/g, '/')
      }

      list.set(key, content!)
    }
  }

  return list
}

export { refList }
