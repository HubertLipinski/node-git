const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 B'

  const kiloByte = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']

  const i = Math.floor(Math.log(bytes) / Math.log(kiloByte))

  return `${parseFloat((bytes / Math.pow(kiloByte, i)).toFixed(dm))} ${sizes[i]}`
}

export { formatBytes }
