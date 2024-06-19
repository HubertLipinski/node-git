import fs from 'node:fs'

import { configDir, absolutePath } from '../util/directory.js'

export default (opts: CommandOptions): void => {
  if (fs.existsSync(configDir) && !opts.f) {
    process.stdout.write('Detected existing node-git repository. Use -f flag to force reinitialize.')
    return
  }

  process.stdout.write(
    fs.existsSync(configDir)
      ? `Reinitialized existing node-git repository in ${configDir}`
      : `Initialized empty node-git repository in ${configDir}`,
  )

  bootstrapCoreFiles()
}

const bootstrapCoreFiles = (): void => {
  fs.mkdirSync(configDir, { recursive: true })
  fs.mkdirSync(absolutePath('objects'), { recursive: true })
  fs.mkdirSync(absolutePath('refs'), { recursive: true })
  fs.writeFileSync(absolutePath('HEAD'), 'ref: refs/heads/main\n')
}
