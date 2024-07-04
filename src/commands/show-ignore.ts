import { getIgnoredFilePaths } from '../utils/ignoredFiles'

export default () => {
  process.stdout.write('Ignored files:\n\n')

  const ignoredFiles = getIgnoredFilePaths()

  for (const rule of ignoredFiles) {
    process.stdout.write(rule + '\n')
  }
}
