import fs from 'node:fs'
import assert from 'node:assert'
import path from 'path'
import { EOL, homedir } from 'os'
import { parse, stringify } from 'ini'
import { configFile } from './directory'

const getIgnoredFiles = (): string[] => {
  const ignoreFileName: string = '.gitignore'
  const filePath = path.join(process.cwd(), ignoreFileName)

  if (!fs.existsSync(filePath)) {
    return ['.git']
  }

  const content = fs.readFileSync(path.join(process.cwd(), ignoreFileName), 'utf-8').toString()

  return content.split(EOL).filter((line) => line.trim() !== '')
}

const getConfigValue = (key: string): string | null => {
  const config = parseConfig()

  if (key.indexOf('.') === -1) {
    return config[key] ?? null
  }

  const keys = key.split('.')
  assert(keys.length === 2, 'Invalid config key')
  return config[keys[0]][keys[1]] ?? null
}

const parseConfig = () => {
  const userHomeDir = homedir()

  const globalConfig = fs.readFileSync(path.join(userHomeDir, '.gitconfig'), 'utf-8')
  const repositoryConfig = fs.readFileSync(configFile, 'utf-8')

  const merged = stringify(parse(repositoryConfig)) + stringify(parse(globalConfig))

  return parse(merged)
}

export { getIgnoredFiles, getConfigValue }
