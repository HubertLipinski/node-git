import fs from 'node:fs'
import assert from 'node:assert'
import { absolutePath } from './directory'
import { globSync, Path } from 'glob'
import { getIgnoredFilePaths } from './ignoredFiles'
import { GlobOptions } from 'glob/dist/commonjs/glob'
import { parseDateHex } from './dates'

// https://github.com/git/git/blob/master/Documentation/gitformat-index.txt

const readIndex = (): GitIndex => {
  const indexPath = absolutePath('index')
  if (!fs.existsSync(indexPath)) {
    return {
      version: 2,
      size: 0,
      entries: [],
    }
  }

  const binary = fs.readFileSync(indexPath, 'binary')
  const buffer = Buffer.from(binary, 'binary')

  const header = buffer.subarray(0, 12)

  const signature = header.subarray(0, 4)
  assert(signature.toString() === 'DIRC', 'Invalid signature')
  const version = header.readUIntBE(4, 4)
  assert(version === 2, 'Only version 2 is supported')
  const contentLength = header.readUIntBE(8, 4)

  const entries: IndexEntry[] = []
  let index = 0

  const content = buffer.subarray(header.length)
  for (let i = 0; i < contentLength; i++) {
    const ctime = content.subarray(index, index + 4)
    const mtime = content.subarray(index + 8, index + 12)
    // time nanoseconds in [<4,8>, <14,16>] - we don't use it

    const dev = content.subarray(index + 16, index + 20)
    const ino = content.subarray(index + 20, index + 24)
    const mode = content.subarray(index + 24, index + 28)
    const uid = content.subarray(index + 28, index + 32)
    const gid = content.subarray(index + 32, index + 36)

    const size = content.readUInt32BE(index + 36)
    const hash = content.subarray(index + 40, index + 60)

    const flags: string = content.readUIntBE(index + 60, 2).toString(2)

    const flagValid = flags[0].toString()
    const flagExtended = flags[1]?.toString() ?? '-1'
    const flagStage = parseInt(flags.slice(1, 3), 2)
    const fileNameLength = parseInt(flags, 2) & 0b0000111111111111
    let fileName: string | null = null

    index += 62

    if (fileNameLength < 4095) {
      fileName = content.subarray(index, index + fileNameLength).toString('utf8')
      index += fileNameLength + 1
    } else {
      throw new Error(`File name length is too long: ${fileNameLength} > 4095 bytes`)
    }

    // skip as much padded bytes as possible
    index = 8 * Math.ceil(index / 8)

    entries.push({
      createdTime: parseDateHex(ctime),
      modifiedTime: parseDateHex(mtime),
      dev: dev.toString('hex'),
      ino: ino.toString('hex'),
      mode: mode.toString('hex'),
      uid: uid.toString('hex'),
      gid: gid.toString('hex'),
      size: size,
      hash: hash.toString('hex'),
      fileName: fileName,
      flags: {
        binary: flags.toString(),
        valid: flagValid,
        extended: flagExtended,
        stage: flagStage.toString(2),
      },
    })
  }

  return {
    version: version,
    size: contentLength,
    entries: entries,
  }
}

const writeIndex = (gitIndex: GitIndex | null = null) => {
  let index
  if (gitIndex === null) {
    index = readIndex()
  } else {
    index = gitIndex
  }

  const header = Buffer.alloc(12)
  header.write('DIRC', 0)
  header.writeUintBE(2, 4, 4)
  header.writeUintBE(index.size, 8, 4)

  const length = Buffer.byteLength(JSON.stringify(index.entries[0]), 'binary') * index.size
  const content = Buffer.alloc(length)

  let offset = 0
  for (const entry of index.entries) {
    content.writeUintBE(parseInt((entry.createdTime.getTime() / 1000).toFixed(0)), offset, 4)
    content.writeUintBE(0, offset + 4, 4) // we don't use it, write empty bytes

    content.writeUintBE(parseInt((entry.modifiedTime.getTime() / 1000).toFixed(0)), offset + 8, 4)
    content.writeUintBE(0, offset + 12, 4) // we don't use it, write empty bytes

    content.writeUintBE(parseInt(entry.dev, 16), offset + 16, 4)
    content.writeUintBE(parseInt(entry.ino, 16), offset + 20, 4)
    content.writeUintBE(parseInt(entry.mode, 16), offset + 24, 4)
    content.writeUintBE(parseInt(entry.uid, 16), offset + 28, 4)
    content.writeUintBE(parseInt(entry.gid, 16), offset + 32, 4)

    content.writeUint32BE(entry.size, offset + 36)

    const hash = Buffer.from(entry.hash, 'hex')
    hash.copy(content, offset + 40)

    content.writeUIntBE(entry.fileName.length, offset + 60, 2)

    offset += 62

    content.write(entry.fileName, offset, offset + entry.fileName.length, 'utf8')

    offset += entry.fileName.length + 1

    // pad to 8 bytes if necessary
    if (offset % 8 != 0) {
      const pad = 8 - (offset % 8)
      const padBuffer = Buffer.alloc(pad, 0, 'binary')
      padBuffer.copy(content, offset)
      offset += pad
    }
  }

  fs.writeFileSync(absolutePath('index'), Buffer.concat([header, content]))
}

const indexHasEntries = (): boolean => {
  const index = readIndex()
  return index.size > 0
}

const getTrackedPaths = (
  path: string = '**',
  options: GlobOptions = {},
  relative: boolean = false,
): Path[] | string[] => {
  return globSync(path, {
    ignore: getIgnoredFilePaths(relative),
    dot: true,
    ...options,
  })
}

export { readIndex, writeIndex, indexHasEntries, getTrackedPaths }
