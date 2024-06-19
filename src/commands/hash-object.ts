import fs from 'node:fs'

import { generateHash } from '../util/hash.js'
import { writeBlobObject } from '../util/objects/blob.js'

export default (path: string, options: CommandOptions) => {
  const file = fs.readFileSync(path)
  const blob = `blob ${file.length}\x00${file}`

  if (!options.w) {
    return generateHash(blob)
  }

  return writeBlobObject(path)
}
