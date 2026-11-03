import { ref } from 'vue'
import games from '@/composables/gameCode.js'

const combatModes = ['ctf', 'sky', 'bed', 'sg', 'tw']
const nonMonthlyModes = ['all', 'main', 'parkour', 'gi', 'mob']
const CACHE_TTL_MS = 60 * 60 * 1000

const STAT_SCHEMA = [
  // Must-have (except parkours)
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
  {
    key: 'win_rate',
    label: 'Win Rate',
    getValue: (d) =>
      typeof d.victories === 'number' && typeof d.played === 'number' && d.played > 0
        ? ((d.victories / d.played) * 100).toFixed(2) + '%'
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
    combatOnly: true,
    getValue: (d) =>
      typeof d.kills === 'number' && typeof d.deaths === 'number'
        ? (d.deaths > 0 ? d.kills / d.deaths : d.kills).toFixed(2)
        : undefined,
  },
  {
    key: 'avg_kills',
    label: 'Average Kills / Game',
    combatOnly: true,
    getValue: (d) =>
      typeof d.kills === 'number' && typeof d.played === 'number' && d.played > 0
        ? (d.kills / d.played).toFixed(2)
        : undefined,
  },
  {
    key: 'avg_deaths',
    label: 'Average Deaths / Game',
    combatOnly: true,
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

  // sky-kits & sky-classic

  { key: 'ore-mined', label: 'Ore Mined' },
  { key: 'spell_used', label: 'Spells Used' },
  { key: 'mystery_chests_destroyed', label: 'Mystery Chests Destroyed' },
  { key: 'selected_kit', label: 'Selected Kit' },

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

  // build
  { key: 'rating_love_received', label: 'Love Ratings' },
  { key: 'rating_great_received', label: 'Great Ratings' },
  { key: 'rating_good_received', label: 'Good Ratings' },
  { key: 'rating_okay_received', label: 'Okay Ratings' },
  { key: 'rating_meh_received', label: 'Meh Ratings' },

  // misc
  { key: 'goals', label: 'Goals' },

  // XP
  { key: 'xp', label: 'XP' },
]

// Pass gameCode as the second parameter to filter mode-restricted stats
const formatGameStats = (rawGameData, gameCode) => {
  if (!rawGameData || Array.isArray(rawGameData) || typeof rawGameData !== 'object') return [] // Keep unplayed modes as [] so existing Array.isArray checks still work

  const orderedGameObj = {}

  for (const stat of STAT_SCHEMA) {
    // Skip if this stat is restricted to specific modes and doesn't match the current gameCode
    if (stat.combatOnly && !combatModes.includes(gameCode)) continue

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

const formatTimeframe = (timeframe) => {
  if (!timeframe || timeframe === 'all') {
    return ''
  }

  const curr = new Date()

  if (timeframe == 'current_month') {
    return `/${curr.getFullYear()}/${curr.getMonth() + 1}`
  }
  else {
    return `/${curr.getFullYear()}/${curr.getMonth()}`
  }
}

export function useHiveStats() {
  const stats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const BASE_URL = 'https://api.playhive.com/v0'

  const fetchPlayerStats = async (identifier, timeframe = 'all') => {

    if (!identifier?.trim()) return

    loading.value = true
    error.value = null

    const safeIdentifier = encodeURIComponent(identifier.trim())
    const playerKey = safeIdentifier.toLowerCase()
    const monthPath = formatTimeframe(timeframe)

    const allTimeCacheKey = `hive_all_${playerKey}`
    const monthlyCacheKey = `hive_monthly_${playerKey}_${timeframe}${monthPath}`
    const activeCacheKey = timeframe === 'all' ? allTimeCacheKey : monthlyCacheKey

    const rawActiveCache = localStorage.getItem(activeCacheKey)
    const activeCache = rawActiveCache ? JSON.parse(rawActiveCache) : null
    const isCacheValid = activeCache && Date.now() - activeCache.timestamp < CACHE_TTL_MS

    if (activeCache && !isCacheValid) {
      localStorage.removeItem(activeCacheKey)
    }

    const rawAllTimeCache = localStorage.getItem(allTimeCacheKey)
    const allTimeCache = rawAllTimeCache ? JSON.parse(rawAllTimeCache) : null
    const allTimeData = allTimeCache?.data || stats.value

    const endpoints = timeframe === 'all'
      ? [{ code: 'all', url: `${BASE_URL}/game/all/all/${safeIdentifier}` }]
      : games
            .map((g) => g.code)
            .filter(
              (code) =>
                !nonMonthlyModes.includes(code) &&
                allTimeData?.[code] &&
                !Array.isArray(allTimeData[code])
            )
            .map((code) => ({
              code,
              url: `${BASE_URL}/game/monthly/player/${code}/${safeIdentifier}${monthPath}`
            }))

    try {
      const responses = await Promise.all(

        // Await responses fetch from every url in endpoints.url
        endpoints.map(async ({ code, url }) => {

          const response = await fetch(url)

          if (response.status === 404 || response.status === 204) {
            if (timeframe === 'all') throw new Error('Player not found.')
            return [code, []] // 0 games played this month
          }
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Try again in a few minutes.')
          }
          if (!response.ok) {
            throw new Error(`API error (${response.status})`)
          }

          const data = await response.json()
          return [code, data]
        })
      )

      const combinedRawData =
        timeframe === 'all'
          ? responses[0][1]
          : {
              ...(allTimeData?.main ? { main: allTimeData.main } : {}),
              ...Object.fromEntries(responses)
            }

      stats.value = transformHiveResponse(combinedRawData)

      localStorage.setItem(
        activeCacheKey,
        JSON.stringify({
          data: stats.value,
          timestamp: Date.now()
        })
      )

    } catch (err) {
      if (err.message.includes('Rate limit') && isCacheValid) {
        stats.value = activeCache.data
        error.value = `${err.message} Showing cached stats from the last hour.`
      } else {
        error.value = err.message || 'Failed to fetch player statistics.'
      }
    } finally {
      loading.value = false
    }
  }  
  return { stats, loading, error, fetchPlayerStats }
}
