import zlib from 'node:zlib'

import { getObjectDetails, objectExist, writeObject } from '../filesystem'
import { generateHash } from '../hash'

const writeCommit = (tree: string, parent: string | null, message: string = 'Default commit message'): string => {
  if (!objectExist(tree)) {
    throw new Error(`Object does not exist: ${tree}`)
  }

  if (parent && !objectExist(parent)) {
    throw new Error(`Parent does not exist: ${tree}`)
  }

  // TODO: read from config
  const author = `User user@example.com ${Math.floor(Date.now() / 1000)} +0000`
  const commiter = author

  let content = `tree ${tree}\nauthor ${author}\ncommiter ${commiter}\n\n${message}\n`
  if (parent) {
    content = `tree ${tree}\nparent ${parent}\nauthor ${author}\ncommiter ${commiter}\n\n${message}\n`
  }

  const header = `commit ${content.length}\0`
  const commitObject = header + content

  const commitHash = generateHash(commitObject)
  writeObject(commitHash, zlib.deflateSync(commitObject))

  return commitHash
}

const parseCommit = (hash: string): Commit => {
  if (!objectExist(hash)) {
    throw new Error(`Commit does not exist: ${hash}`)
  }

  const object = getObjectDetails(hash)
  const data = Buffer.from(object.content).toString().split('\n\n')
  const [content, message] = [data[0], data[1]]

  const result: Commit = _commitEntry(message)

  content.split('\n').map((line) => {
    const [key, ...value] = line.split(' ')

    switch (key) {
      case 'author':
      case 'commiter':
        result[key] = {
          name: value[0],
          email: value[1],
          date: `${value[2]} ${value[3]}`,
        }
        break
      case 'tree':
      case 'parent':
        result[key] = value[0]
        break
    }
  })

  return result
}

const _commitEntry = (message: string): Commit => {
  return {
    tree: '',
    parent: null,
    commiter: {
      name: '',
      email: '',
      date: '',
    },
    author: {
      name: '',
      email: '',
      date: '',
    },
    message: message,
  }
}

export { writeCommit, parseCommit }
