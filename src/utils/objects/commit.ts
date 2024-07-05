import zlib from 'node:zlib'

import { getObjectDetails, objectExist, writeObject } from '../filesystem'
import { generateHash } from '../hash'
import { getConfigValue } from '../config'

const writeCommit = (tree: string, parent: string | null, message: string = 'Default commit message'): string => {
  if (!objectExist(tree)) {
    throw new Error(`Object does not exist: ${tree}`)
  }

  if (parent && !objectExist(parent)) {
    throw new Error(`Parent does not exist: ${tree}`)
  }

  const name = getConfigValue('user.name')
  const email = getConfigValue('user.email')

  if (!name || !email) {
    throw new Error('User name and email are not set. Please set them in the config file.')
  }

  const author = `${name} ${email} ${Math.floor(Date.now() / 1000)}`
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

    let author = value[0]
    let email = value[1]
    let date = `${value[2]} ${value[3] ?? ''}`

    // name consists of two words
    if (value.length > 3) {
      author = `${value[0]} ${value[1]}`
      email = `${value[2]}`
      date = `${value[3]} ${value[4] ?? ''}`
    }

    switch (key) {
      case 'author':
      case 'commiter':
        result[key] = {
          name: author.trim(),
          email: email.trim(),
          date: date.trim(),
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
