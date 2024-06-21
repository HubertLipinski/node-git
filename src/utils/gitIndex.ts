import fs from 'node:fs'
import assert from 'node:assert'

// https://github.com/git/git/blob/master/Documentation/gitformat-index.txt
const readIndex = () => {
  if (!fs.existsSync('.nodegit/index')) {
    throw new Error('Index does not exist')
  }

  const binary = fs.readFileSync('.nodegit/index', 'binary')
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
    const ctime = content.subarray(index + 0, index + 4)
    const mtime = content.subarray(index + 8, index + 12)

    const dev = content.subarray(index + 16, index + 20)
    const ino = content.subarray(index + 20, index + 24)
    const mode = content.subarray(index + 24, index + 28)
    const uid = content.subarray(index + 28, index + 32)
    const gid = content.subarray(index + 32, index + 36)

    const size = content.readUInt32BE(index + 36)
    const hash = content.subarray(index + 40, index + 60)

    const flags: string = content.readUIntBE(index + 60, 2).toString(2)

    const flagValid = flags[0].toString()
    const flagExtended = flags[1].toString()
    // assert(!flagExtended, 'Flag extended is not supported')
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

    index = 8 * Math.ceil(index / 8) // skip as much padded bytes as possible

    entries.push({
      createdTime: parseDate(ctime),
      modifiedTime: parseDate(mtime),
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

  return entries
}

const parseDate = (time: Buffer): Date => {
  return new Date(parseInt(time.toString('hex'), 16) * 1000)
}

export { readIndex }
