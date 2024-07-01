import path from 'path'
import fs from 'node:fs'

const rootDirectory: string = process.cwd()

const rootFolder: string = process.env._NODE_GIT_DIRECTORY ?? '.nodegit'

const repositoryDirectory: string = path.join(rootDirectory, rootFolder)

const absolutePath = (...args: string[]): string => {
  if (args.length === 0) return repositoryDirectory
  return path.join(repositoryDirectory, ...args)
}

const workingDirectory = (filePath = ''): string => {
  return path.join(rootDirectory, filePath)
}

const createSafeDirectory = (directory: string, forceCrete: boolean = false): void => {
  if (!forceCrete && fs.existsSync(directory)) {
    throw new Error(`Directory '${directory}' already exists!`)
  }

  fs.mkdirSync(directory)
}

const configFile = path.join(repositoryDirectory, 'config')

export {
  rootFolder,
  rootDirectory,
  repositoryDirectory,
  absolutePath,
  workingDirectory,
  createSafeDirectory,
  configFile,
}
