import path from 'path'

const rootDirectory: string = process.cwd()

const rootFolder: string = process.env._NODE_GIT_DIRECTORY ?? '.nodegit'

const configDir: string = path.join(rootDirectory, rootFolder)

const absolutePath = (...args: string[]): string => {
  if (args.length === 0) return configDir
  return path.join(configDir, ...args)
}

export { rootFolder, rootDirectory, configDir, absolutePath }
