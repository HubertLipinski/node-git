import { refList } from '../utils/ref'

export default () => {
  const refMap = refList()

  for (const [branch, tree] of refMap) {
    process.stdout.write(`${tree} ${branch}\n`)
  }
}
