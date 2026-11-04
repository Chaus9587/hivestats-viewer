export const MC_BEDROCK_COLORS = {
  '&0': '#000000',
  '&1': '#0000AA',
  '&2': '#00AA00',
  '&3': '#00AAAA',
  '&4': '#AA0000',
  '&5': '#AA00AA',
  '&6': '#FFAA00',
  '&7': '#AAAAAA',
  '&8': '#555555',
  '&9': '#5555FF',
  '&a': '#55FF55',
  '&b': '#55FFFF',
  '&c': '#FF5555',
  '&d': '#FF55FF',
  '&e': '#FFFF55',
  '&f': '#FFFFFF',
  '&g': '#DDD605',
  '&h': '#E3D4D1',
  '&i': '#CECACA',
  '&j': '#443A3B',
  '&m': '#971607',
  '&n': '#B4684D',
  '&p': '#DEB12D',
  '&q': '#47A036',
  '&s': '#2CBAA8',
  '&t': '#21497B',
  '&u': '#9A5CC6',
  '&v': '#EB7114',
  '&w': '#8BB3FF',
}

export const parseMcText = (rawText, defaultCode = '&f') => {
  if (!rawText || typeof rawText !== 'string') return []

  // Split by § followed by any alphanumeric character, keeping the delimiter in the array
  const tokens = rawText.split(/(&[0-9a-z])/gi)
  const segments = []

  let currentColorCode = defaultCode

  for (const token of tokens) { 

    if (/^&[0-9a-z]$/i.test(token)) {
      const code = token.toLowerCase()

      if (MC_BEDROCK_COLORS[code]) {
        currentColorCode = code
      } else if (code === '§r') {
        currentColorCode = defaultCode
      }

      // §l (bold) or §o (italic) are skipped
    } else {
      segments.push({
        colorCode: currentColorCode,
        hex: MC_BEDROCK_COLORS[currentColorCode] || '#FFFFFF',
        text: token,
      })
    }
  }

  return segments.slice(1)
}