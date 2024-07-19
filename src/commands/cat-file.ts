import { getObjectDetails } from '../utils/filesystem'
import { formatTreeEntries, readTreeEntries } from '../utils/objects/tree'

export default (hash: string, options: CommandOptions) => {
  const object = getObjectDetails(hash)

  if (options.t) {
    process.stdout.write(object.type)
    return
  }

  if (options.s) {
    process.stdout.write(object.size.toString())
    return
  }

  if (!options.p) {
    process.stdout.write('Missing option -p')
    return
  }

  if (object.type === ObjectType.Blob) {
    const blobContent = object.content.toString().split('\x00').join('')
    process.stdout.write(blobContent)
    return
  }

  if (object.type === ObjectType.Tree) {
    const treeEntries = readTreeEntries(object.content)
    process.stdout.write(formatTreeEntries(treeEntries))
    return
  }

  if (object.type === ObjectType.Commit) {
    process.stdout.write(object.content.toString())
    return
  }

  throw new Error(`Unknown object ${hash}`)
}
