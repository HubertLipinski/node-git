import fs from 'node:fs'
import { EOL } from 'os'
import path from 'path'
import { workingDirectory } from './directory'

const getIgnoredFiles = (): IgnoredEntry[] => {
  const ignoredFiles: IgnoredEntry[] = [
    {
      path: workingDirectory(),
      rules: [
        { rule: '.git/**', ignored: true },
        { rule: '.nodegit/**', ignored: true },
      ],
    },
  ]

  const files = fs
    .readdirSync(workingDirectory(), { recursive: true, withFileTypes: true })
    .filter((file) => file.name === '.gitignore')

  for (const file of files) {
    const relativePath = path.relative(workingDirectory(), file.path)
    const result: IgnoredEntry = {
      path: relativePath.length === 0 ? '.' : relativePath,
      rules: _parseIgnoreFile(path.join(file.path, '.gitignore')),
    }

    ignoredFiles.push(result)
  }

  return ignoredFiles
}

const getIgnoredFilePaths = (): string[] => {
  const ignoredPaths: string[] = []

  for (const entry of getIgnoredFiles()) {
    entry.rules.forEach((rule: IgnoreRule) => {
      ignoredPaths.push(path.join(entry.path, rule.rule).replaceAll(/\\/g, '/'))
    })
  }

  return ignoredPaths
}

export { getIgnoredFiles, getIgnoredFilePaths }

const _parseIgnoreFile = (filePath: string): IgnoreRule[] => {
  const ignored: IgnoreRule[] = []

  const file = fs.readFileSync(filePath, 'utf-8').toString()
  const lines = file.split(EOL)
  for (const line of lines) {
    const result = _checkRule(line)
    if (result) {
      ignored.push(result)
    }
  }

  return ignored
}

const _checkRule = (raw: string): IgnoreRule | null => {
  const content = raw.replace(EOL, '').trim().replaceAll(/\\/g, '/')
  switch (content[0] ?? '') {
    case '#':
    case '':
      return null
    case '!':
      return {
        rule: _parseRuleContent(content.slice(1)),
        ignored: false,
      }
    case '\\':
      return {
        rule: _parseRuleContent(content.slice(1)),
        ignored: true,
      }
    default:
      return {
        rule: _parseRuleContent(content),
        ignored: true,
      }
  }
}

const _parseRuleContent = (content: string): string => {
  if (content.endsWith('/')) {
    return content + '**'
  }

  return content
}
