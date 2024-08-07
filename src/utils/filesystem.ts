import fs from 'node:fs'
import zlib from 'node:zlib'
import { absolutePath } from './directory'

const hashToPath = (hash: string): HashFileLocation => {
  return {
    directory: hash.slice(0, 2),
    filename: hash.slice(2),
  }
}

const objectExist = (hash: string): boolean => {
  const fileLocation = hashToPath(hash)
  return fs.existsSync(absolutePath('objects', fileLocation.directory, fileLocation.filename))
}

const getObjectPath = (hash: string, absolute: boolean = true): string => {
  const fileLocation = hashToPath(hash)

  if (!absolute) {
    return `${fileLocation.directory}/${fileLocation.filename}`
  }

  return absolutePath('objects', fileLocation.directory, fileLocation.filename)
}

const getObject = (hash: string): Buffer => {
  const fileLocation = hashToPath(hash)

  const path = absolutePath('objects', fileLocation.directory, fileLocation.filename)

  if (!objectExist(hash)) {
    throw new Error(`File not found: ${hash}`)
  }

  return fs.readFileSync(path)
}

const getObjectDetails = (hash: string): ObjectDetails => {
  const content: Buffer = getObject(hash)
  const inflatedBuffer: Buffer = zlib.inflateSync(content)
  const inflatedString: string = inflatedBuffer.toString()

  const type: ObjectType = inflatedString.split(' ')[0] as ObjectType
  const size: string = inflatedString.split(' ')[1].split('\x00')[0]
  const dataBuffer: Buffer = inflatedBuffer.subarray(type.length + size.length + 2)

  return {
    type,
    size: parseInt(size),
    content: dataBuffer,
  }
}

const writeObject = (hash: string, data: Buffer): void => {
  const fileLocation = hashToPath(hash)

  fs.mkdirSync(absolutePath('objects', fileLocation.directory), {
    recursive: true,
  })

  fs.writeFileSync(getObjectPath(hash), data)
}

export { hashToPath, objectExist, getObject, getObjectPath, getObjectDetails, writeObject }
