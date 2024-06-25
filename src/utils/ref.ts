import fs from 'node:fs'
import path from 'path'

import { absolutePath, configDir } from './directory'

const resolveRef = (ref: string): string => {
  let filePath = ''
  if (ref === 'HEAD') {
    filePath = absolutePath('HEAD')
  } else {
    filePath = !path.isAbsolute(ref) ? absolutePath(ref) : ref
  }

  const content = fs.readFileSync(filePath).toString().trim()

  if (content.startsWith('ref: ')) {
    return resolveRef(content.slice(5))
  }

  return content
}
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
      const content = resolveRef(fullPath)
      let key = path.relative(configDir, fullPath)

      // fix windows ugly path
      if (path.sep === '\\') {
        key = key.replace(/\\/g, '/')
      }

      list.set(key, content)
    }
  }

  return list
}

export { resolveRef, refList }
