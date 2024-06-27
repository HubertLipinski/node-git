import path from 'path'

const rootDirectory: string = process.cwd()

const rootFolder: string = process.env._NODE_GIT_DIRECTORY ?? '.nodegit'

const repositoryDirectory: string = path.join(rootDirectory, rootFolder)

const absolutePath = (...args: string[]): string => {
  if (args.length === 0) return repositoryDirectory
  return path.join(repositoryDirectory, ...args)
}

const workingDrectory = (filePath = ''): string => {
  return path.join(rootDirectory, filePath)
}

const configFile = path.join(repositoryDirectory, 'config')

export { rootFolder, rootDirectory, repositoryDirectory, absolutePath, workingDrectory, configFile }
