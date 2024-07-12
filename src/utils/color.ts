const colorText = (text: string, color: Color = Color.WHITE) => {
  return `\x1b[${color}m${text}\x1b[0m`
}

export { colorText }
