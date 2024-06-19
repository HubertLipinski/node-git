import fs from 'node:fs'
import zlib from 'node:zlib'

import { generateHash } from '../hash'
import { writeObject } from '../filesystem'

const writeBlobObject = (filePath: string): string => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }

  const fileContent = fs.readFileSync(filePath)
  const blob = `blob ${fileContent.length}\x00${fileContent}`
  const hash = generateHash(blob)
  const compressedData = zlib.deflateSync(blob)

  writeObject(hash, compressedData)

  return hash
}

export { writeBlobObject }
