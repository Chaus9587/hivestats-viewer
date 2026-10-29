import { ref } from 'vue'

const COMBAT_RATIO_MODES = ['ctf', 'sky', 'bed', 'sg']

const STAT_SCHEMA = [
  // Must-have
  { key: 'played', label: 'Games Played' },
  { key: 'victories', label: 'Games Won' },
  {
    key: 'losses',
    label: 'Games Lost',
    getValue: (d) =>
      typeof d.played === 'number' && typeof d.victories === 'number'
        ? d.played - d.victories
        : undefined,
  },

  // Combat Stats (and stats related to ctf, sky, bed, sg)
  { key: 'kills', label: 'Kills' },
  { key: 'final_kills', label: 'Final Kills' },
  { key: 'deaths', label: 'Deaths' },
  { key: 'assists', label: 'Assists' },
  {
    key: 'kd_ratio',
    label: 'K/D Ratio',
    modes: COMBAT_RATIO_MODES,
    getValue: (d) =>
      typeof d.kills === 'number' && typeof d.deaths === 'number'
        ? (d.deaths > 0 ? d.kills / d.deaths : d.kills).toFixed(2)
        : undefined,
  },
  {
    key: 'avg_kills',
    label: 'Average Kills / Game',
    modes: COMBAT_RATIO_MODES,
    getValue: (d) =>
      typeof d.kills === 'number' && typeof d.played === 'number' && d.played > 0
        ? (d.kills / d.played).toFixed(2)
        : undefined,
  },
  {
    key: 'avg_deaths',
    label: 'Average Deaths / Game',
    modes: COMBAT_RATIO_MODES,
    getValue: (d) =>
      typeof d.deaths === 'number' && typeof d.played === 'number' && d.played > 0
        ? (d.deaths / d.played).toFixed(2)
        : undefined,
  },

  // Stats for other modes

  // ctf
  { key: 'flags_captured', label: 'Flags Captured' },
  { key: 'flags_returned', label: 'Flags Returned' },

  // bed
  { key: 'beds_destroyed', label: 'Beds Destroyed' },

  // tw (legacy)
  { key: 'treasures_destroyed', label: 'Treasures Destroyed' },

  // mm
  { key: 'murders', label: 'Murders' },
  { key: 'murderer_eliminations', label: 'Murderer Eliminations' },
  { key: 'coins', label: 'Coins' },

  // hide
  { key: 'hider_kills', label: 'Hider Kills' },
  { key: 'seeker_kills', label: 'Seeker Kills' },

  // dr
  { key: 'checkpoints', label: 'Checkpoints' },
  { key: 'activated', label: 'Traps Activated' },

  // misc
  { key: 'goals', label: 'Goals' },

  // 4. XP at the bottom
  { key: 'xp', label: 'XP' },
]

// Pass gameCode as the second parameter to filter mode-restricted stats
const formatGameStats = (rawGameData, gameCode) => {
  if (!rawGameData || Array.isArray(rawGameData) || typeof rawGameData !== 'object') {
    return [] // Keep unplayed modes as [] so existing Array.isArray checks still work
  }

  const orderedGameObj = {}

  for (const stat of STAT_SCHEMA) {
    // Skip if this stat is restricted to specific modes and doesn't match the current gameCode
    if (stat.modes && !stat.modes.includes(gameCode)) continue

    const val = stat.getValue ? stat.getValue(rawGameData) : rawGameData[stat.key]

    if (val !== undefined && val !== null) {
      orderedGameObj[stat.label] = val
    }
  }

  return Object.keys(orderedGameObj).length > 0 ? orderedGameObj : []
}

// Transforms the full API payload while keeping 'main' untouched
const transformHiveResponse = (rawData) => {
  const formatted = {}

  for (const [key, value] of Object.entries(rawData)) {
    if (key === 'main') {
      formatted.main = value
    } else {
      formatted[key] = formatGameStats(value, key)
    }
  }

  return formatted
}

export function useHiveStats() {
  const stats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const BASE_URL = 'https://api.playhive.com/v0'

  const fetchPlayerStats = async (identifier) => {
    if (!identifier?.trim()) return

    loading.value = true
    error.value = null
    stats.value = null

    const safeIdentifier = encodeURIComponent(identifier.trim())

    const endpoint = `${BASE_URL}/game/all/all/${safeIdentifier}`

    try {
      const response = await fetch(endpoint)
      


      const contentType = response.headers.get('content-type') || ''

      if (!contentType.includes('application/json')) {
        throw new Error('Received HTML instead of JSON. Check your Vite proxy.')
      }
      if (response.status === 404) {
        throw new Error('Player not found.')
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Try again in a few minutes.')
      }
      if (!response.ok) {
        throw new Error(`API error (${response.status})`)
      }

      const data = await response.json()
      stats.value = transformHiveResponse(data)
    } catch (err) {
      error.value = err.message || 'An unexpected error occurred.'
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, error, fetchPlayerStats }
}
