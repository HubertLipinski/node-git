import { getActiveBranch } from '../utils/branch'
import { readIndex } from '../utils/gitIndex'
import { findObject, repositoryHasChanges } from '../utils/repository'
import { getObjectDetails } from '../utils/filesystem'
import { readTreeEntries } from '../utils/objects/tree'
import { pathJoin, cleanFsPath } from '../utils/directory'

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

  // changes between HEAD and index
  process.stdout.write('Changes to be committed:\n\n')
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
        process.stdout.write(`  \x1b[32mmodified: ${value}\x1b[0m\n`)
      }
      delete headTreeEntriesMap[value]
    } else {
      process.stdout.write(`  \x1b[32mnew file: ${value}\x1b[0m\n`)
    }
  }

  for (const key of Object.keys(headTreeEntriesMap)) {
    process.stdout.write(`  \x1b[31mdeleted: ${key}\x1b[0m\n`)
  }

  // TODO: changes between index and working directory

  process.stdout.write('\nChanges not staged for commit:\n\n')
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
