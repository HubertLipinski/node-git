import { Path } from 'glob'
import { getActiveBranch } from '../utils/branch'
import { getTrackedPaths, readIndex } from '../utils/gitIndex'
import { findObject, repositoryHasChanges } from '../utils/repository'
import { getObjectDetails } from '../utils/filesystem'
import { readTreeEntries } from '../utils/objects/tree'
import { pathJoin, cleanFsPath, workingDirectory } from '../utils/directory'
import { colorText } from '../utils/color'
import { parseFsDate } from '../utils/dates'
import { writeBlobObject } from '../utils/objects/blob'

// TODO: refactor each stages to return the data instead of writing to stdout
export default () => {
  if (!repositoryHasChanges()) {
    process.exit(0)
  }

  // display the current branch
  const branch = getActiveBranch()

  if (!branch) {
    process.stdout.write(`HEAD detached at ${branch}\n`)
  } else {
    process.stdout.write(`On branch ${branch}\n\n`)
  }

  // display changes between HEAD and index
  process.stdout.write('Changes to be committed:\n')
  const index = readIndex()
  const headTreeSha = findObject('HEAD', ObjectType.Tree)
  const headDetails = getObjectDetails(headTreeSha!)
  const tree = readTreeEntries(headDetails.content)

  const treeFromIndex = parseTreeFromIndex(tree, '.')

  const indexEntriesMap = index.entries.reduce((acc: { [key: string]: string }, entry: IndexEntry) => {
    acc[entry.hash] = entry.fileName
    return acc
  }, {})

  const headTreeEntriesMap = treeFromIndex.reduce((acc: { [key: string]: string }, entry: IndexTreeEntry) => {
    acc[entry.path] = entry.sha
    return acc
  }, {})

  for (const [key, value] of Object.entries(indexEntriesMap)) {
    if (headTreeEntriesMap[value]) {
      if (headTreeEntriesMap[value] !== key) {
        process.stdout.write(colorText(`\tmodified: ${value}\n`, Color.GREEN))
      }
      delete headTreeEntriesMap[value]
    } else {
      process.stdout.write(colorText(`\tnew file: ${value}\n`, Color.GREEN))
    }
  }

  for (const key of Object.keys(headTreeEntriesMap)) {
    process.stdout.write(colorText(`\tdeleted: ${key}\n`, Color.RED))
  }

  // display changes between index and working directory
  process.stdout.write('\nChanges not staged for commit:\n')

  const trackedFiles = getTrackedPaths(
    '**',
    {
      root: '',
      cwd: workingDirectory(),
      stat: true,
      nodir: true,
      withFileTypes: true,
    },
    true,
  ) as Path[]

  const systemFiles = new Map<string, FileDetails>()
  for (const file of trackedFiles) {
    const filePath = cleanFsPath(file.relative())

    systemFiles.set(filePath, {
      fileName: filePath,
      createdTime: file.birthtime ?? new Date(),
      modifiedTime: file.mtime ?? new Date(),
      size: file.size ?? 0,
    })
  }

  for (const entry of index.entries) {
    const filePath = entry.fileName
    const systemFile: FileDetails | null = systemFiles.get(filePath) ?? null

    if (!systemFile) {
      process.stdout.write(colorText(`\tdeleted: ${filePath}\n`, Color.RED))
      continue
    }

    const modified = parseFsDate(systemFile.modifiedTime) !== entry.modifiedTime

    // if the file is not modified, we don't need to check the content
    if (!modified) {
      systemFiles.delete(filePath)
      continue
    }

    // check if the file content has changed
    const newHash = writeBlobObject(workingDirectory(filePath))
    if (newHash !== entry.hash) {
      process.stdout.write(colorText(`\tmodified: ${filePath}\n`, Color.RED))
    }

    systemFiles.delete(filePath)
  }

  // display untracked files
  process.stdout.write('\nUntracked files:\n')
  for (const file of systemFiles.keys()) {
    process.stdout.write(colorText(`\tnew file: ${file}\n`, Color.RED))
  }
}

const parseTreeFromIndex = (entries: TreeEntry[], dist: string, data: IndexTreeEntry[] = []): IndexTreeEntry[] => {
  dist = cleanFsPath(dist)

  for (const item of entries) {
    const treeEntry: IndexTreeEntry = {
      path: pathJoin(dist, item.filename),
      sha: item.hash,
    }

    if (item.type === ObjectType.Tree) {
      const subTree = getObjectDetails(item.hash)
      data.push(...parseTreeFromIndex(readTreeEntries(subTree.content), `${dist}/${item.filename}`))
    } else {
      data.push(treeEntry)
    }
  }

  return data
}
