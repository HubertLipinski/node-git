import fs from 'node:fs'
import { stringify } from 'ini'
import { repositoryDirectory, absolutePath, configFile } from '../utils/directory'

export default (opts: CommandOptions): void => {
  if (fs.existsSync(repositoryDirectory) && !opts.f) {
    process.stdout.write('Detected existing node-git repository. Use -f flag to force reinitialize.')
    return
  }

  process.stdout.write(
    fs.existsSync(repositoryDirectory)
      ? `Reinitialized existing node-git repository in ${repositoryDirectory}`
      : `Initialized empty node-git repository in ${repositoryDirectory}`,
  )

  bootstrapCoreFiles()
  createConfigFile()
}

const bootstrapCoreFiles = (): void => {
  fs.mkdirSync(repositoryDirectory, { recursive: true })
  fs.mkdirSync(absolutePath('objects'), { recursive: true })
  fs.mkdirSync(absolutePath('refs', 'heads'), { recursive: true })
  fs.writeFileSync(absolutePath('HEAD'), 'ref: refs/heads/master\n')
}

const createConfigFile = (): void => {
  const config = {
    core: {
      repositoryformatversion: 0,
      filemode: false,
      bare: false,
    },
  }
  fs.writeFileSync(configFile, stringify(config))
}
