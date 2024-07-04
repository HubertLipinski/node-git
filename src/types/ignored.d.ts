interface IgnoreRule {
  rule: string
  ignored: boolean
}

interface IgnoredEntry {
  path: string
  rules: IgnoreRule[]
}
