const parseDateHex = (time: Buffer): Date => {
  return new Date(parseInt(time.toString('hex'), 16) * 1000)
}

const parseFsDate = (date: Date): Date => {
  // We need to do this because index file stores time in seconds
  return new Date(Math.round(date.getTime() / 1000) * 1000)
}

export { parseDateHex, parseFsDate }
