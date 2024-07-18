interface CommandOptions {
  [key: string | object]: boolean | string
}

interface CommitCommandOptions {
  parent: string | null
  message: string
}
