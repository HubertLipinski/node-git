import { findObject } from '../utils/repository'

export default (sha: string, format: null | ObjectType = null, follow: boolean = true) => {
  process.stdout.write(findObject(sha, format, follow)!)
}
