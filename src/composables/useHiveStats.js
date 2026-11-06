import { ref } from 'vue'
import games from '@/composables/data/gameCode.js'
import { STAT_SCHEMA, STATS_SCHEMAS_PARKOUR } from '@/composables/data/statsSchemas.js'

const CACHE_TTL_MS = 60 * 60 * 1000

const formatParkourTime = (ticks) => {
  if (typeof ticks !== 'number') return null
  const totalMs = ticks * 50
  const minutes = Math.floor(totalMs / 60000)
  const seconds = String(Math.floor((totalMs % 60000) / 1000)).padStart(2, '0')
  const ms = String(totalMs % 1000).padStart(3, '0')
  return `${minutes}:${seconds}.${ms}`
}

const formatParkourStats = (rawParkourData) => {
  const worldsData = rawParkourData?.parkours
  if (!worldsData || Array.isArray(worldsData) || typeof worldsData !== 'object') {
    return []
  }

  const formattedWorlds = {}

  for (const { world, courses } of STATS_SCHEMAS_PARKOUR) {

    // worldsData = { "volcano" : {...}, "rooftops": {...}, ...}
    /* rawWorld = { 
      "parkour_stars": 100, 
      "Magma Meltdown" : {...},  
      "Bone Basin" : {...},
      ...
      } */
    const rawWorld = worldsData[world]
    if (!rawWorld || typeof rawWorld !== 'object') continue

    const formattedCourses = {}

    for (const courseName of courses) {

      
      const rawCourse = rawWorld[courseName]
      if (!rawCourse || typeof rawCourse !== 'object') continue

      const bestTime = formatParkourTime(rawCourse.best_run_time)
      const stars = rawCourse.course_stars ?? rawCourse.collected_stars?.length ?? 0

      // Sort checkpoint ticks ascending so coordinates become Checkpoint 1, Checkpoint 2, ...
      const sortedTicks = Object.values(rawCourse.best_checkpoint_times || {}).sort((a, b) => a - b)

      const checkpoints = {}

      // Throw checkpoints and summary to formattedCourses
      sortedTicks.forEach((ticks, idx) => {
        checkpoints[`Checkpoint ${idx + 1}`] = formatParkourTime(ticks)
      })

      formattedCourses[courseName] = {
        summary: `Best Time: ${bestTime ?? 'N/A'} - ${stars} Stars`,
        checkpoints,
      }
    }

    if (Object.keys(formattedCourses).length > 0) {
      formattedWorlds[world] = formattedCourses
    }
  }

  // Return [] if empty so unplayed Parkour Worlds is hidden by !Array.isArray(gameData)
  return Object.keys(formattedWorlds).length > 0 ? formattedWorlds : []
}

// Pass gameCode as the second parameter to filter mode-restricted stats
const formatGameStats = (rawGameData, gameCode) => {
  if (!rawGameData || Array.isArray(rawGameData) || typeof rawGameData !== 'object') return [] // Keep unplayed modes as [] so existing Array.isArray checks still work

  const orderedGameObj = {}

  const gameConfig = games.find((g) => g.code === gameCode)
  const isCombat = Boolean(gameConfig?.combat)

  for (const stat of STAT_SCHEMA) {
    // Skip if this stat is restricted to specific modes and doesn't match the current gameCode
    if (stat.combatOnly && !isCombat) continue

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
    } else if (key === 'parkour') {
      formatted.parkour = formatParkourStats(value)
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

  // Follows playhive API's UTC time zone
  if (timeframe === 'current_month') {
    const year = curr.getUTCFullYear()
    const month = curr.getUTCMonth() + 1
    return `/${year}/${month}`
  } else {
    // Rewind a year for fetching last year Dec stats
    const year = curr.getUTCMonth() === 0 ? curr.getUTCFullYear() - 1: curr.getUTCFullYear()
    const month = curr.getUTCMonth() === 0 ? 12 : curr.getUTCMonth()
    return `/${year}/${month}`
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

    // Set the key for storing the upcoming API response for a player
    const allTimeCacheKey = `hive_all_${playerKey}`
    const monthlyCacheKey = `hive_monthly_${playerKey}_${timeframe}${monthPath}`
    const activeCacheKey = timeframe === 'all' ? allTimeCacheKey : monthlyCacheKey
    console.log(activeCacheKey)

    // Check whether or not previously saved all-time/monthly API response for same player are expired
    const rawActiveCache = localStorage.getItem(activeCacheKey)
    const activeCache = rawActiveCache ? JSON.parse(rawActiveCache) : null
    const isCacheValid = activeCache && Date.now() - activeCache.timestamp < CACHE_TTL_MS

    // Removed when the saved API response are expired
    if (activeCache && !isCacheValid) {
      localStorage.removeItem(activeCacheKey)
    }

    // Fetch player's all time stats from storage in order to filter what games they haven't played (for monthly stats search)
    const rawAllTimeCache = localStorage.getItem(allTimeCacheKey)
    const allTimeCache = rawAllTimeCache ? JSON.parse(rawAllTimeCache) : null
    const allTimeData = allTimeCache?.data || null

    // Put all-time/monthly API requests url(s) into an array
    const endpoints =
      timeframe === 'all'
        ? [{ code: 'all', url: `${BASE_URL}/game/all/all/${safeIdentifier}` }]
        : games
            .filter(
              (g) =>
                g.monthly !== false && allTimeData?.[g.code] && !Array.isArray(allTimeData[g.code]),
            )
            .map((g) => ({
              code: g.code,
              url: `${BASE_URL}/game/monthly/player/${g.code}/${safeIdentifier}${monthPath}`,
            }))
            
    console.log(endpoints)
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
        }),
      )

      // Turn [[code, data], [code, data], ...] array back to a json data
      const combinedRawData =
        timeframe === 'all'
          ? responses[0][1]
          : {
              ...(allTimeData?.main ? { main: allTimeData.main } : {}),
              ...Object.fromEntries(responses),
            }

      // Rearrange json data order in order to displayed in a logical order
      stats.value = transformHiveResponse(combinedRawData)
      

      // Save the fresh API response to localStorage with the key selected
      localStorage.setItem(
        activeCacheKey,
        JSON.stringify({
          data: stats.value,
          timestamp: Date.now(),
        }),
      )

      return true
    } catch (err) {
      if (err.message.includes('Rate limit') && isCacheValid) {
        stats.value = activeCache.data
        const currTimestamp = Date.now()
        const timeDifferenceMinutes = Math.floor(
          (currTimestamp - activeCache.timestamp) / (1000 * 60),
        )

        const ageText =
          timeDifferenceMinutes < 1
            ? 'less than a minute ago'
            : `${timeDifferenceMinutes} ${timeDifferenceMinutes === 1 ? 'minute' : 'minutes'} ago`

        error.value = `${err.message} Showing cached stats saved ${ageText}.`

        return true
      } else {
        error.value = err.message || 'Failed to fetch player statistics.'
        return false
      }
    } finally {
      loading.value = false
    }
  }
  return { stats, loading, error, fetchPlayerStats }
}
