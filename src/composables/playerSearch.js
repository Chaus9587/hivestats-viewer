import { ref, onMounted, onUnmounted } from 'vue'
import { useHiveStats } from '@/composables/useHiveStats'
import games from '@/composables/gameCode'

export function playerSearch() {

  const BASE_PATH = import.meta.env.BASE_URL
  const username = ref('')
  const selectedTimeframe = ref('all')
  const lastValidTimeframe = ref('all')

  const { stats, loading, error, fetchPlayerStats } = useHiveStats()
  
  const handleTimeframeChange = async () => {
    const activePlayer = stats.value?.main?.username || username.value
    if (!activePlayer) return
    console.log(`Fetching stats for ${activePlayer} with timeframe: ${selectedTimeframe.value}, previous valid timeframe: ${lastValidTimeframe.value}`)
    const success = await fetchPlayerStats(activePlayer, selectedTimeframe.value)
    console.log(error.value)
    if (success) {
      lastValidTimeframe.value = selectedTimeframe.value
    } else {
      selectedTimeframe.value = lastValidTimeframe.value
    }
    console.log(`last: ${lastValidTimeframe.value}, selected: ${selectedTimeframe.value}`)
  }

  // Get the name of a game by its code
  const getGameName = (code) => games.find((g) => g.code === code)?.name || code.toUpperCase()

  // handle search from url
  const loadPlayerFromPath = () => {
    let path = window.location.pathname
    // Strip base path in vite.config.js
    if (path.startsWith(BASE_PATH)) {
      path = path.slice(BASE_PATH.length)
    }
    // Split remaining path into segments (e.g. "stats/PlayerName" -> ["stats", "PlayerName"])
    const segments = path.split('/').filter(Boolean)
    let rawPlayer = ''
    if (segments[0] === 'stats') {
      rawPlayer = segments[1] || ''
    } else {
      rawPlayer = segments[0] || ''
    }
    const cleanPlayer = decodeURIComponent(rawPlayer).trim()
    if (cleanPlayer && cleanPlayer !== 'index.html') {
      username.value = cleanPlayer
      selectedTimeframe.value = 'all' // Reset timeframe to 'all' when loading a new player
      lastValidTimeframe.value = 'all' // Reset last valid timeframe as well
      fetchPlayerStats(cleanPlayer)
      console.log(`last: ${lastValidTimeframe.value}, selected: ${selectedTimeframe.value}`)
    }
  }
  // Handle search in search bar
  const handleSearch = () => {
    const cleanName = username.value.trim()
    if (!cleanName) return
    // Preserve '/stats/' if currently on the /stats route, or use root '/hivestats-viewer/PlayerName'
    const isStatsSubroute = window.location.pathname.startsWith(`${BASE_PATH}stats`)
    const newUrl = isStatsSubroute
      ? `${BASE_PATH}stats/${encodeURIComponent(cleanName)}`
      : `${BASE_PATH}${encodeURIComponent(cleanName)}`
    window.history.pushState({}, '', newUrl)
    selectedTimeframe.value = 'all' // Reset timeframe to 'all' when searching for a new player
    lastValidTimeframe.value = 'all' // Reset last valid timeframe as well
    fetchPlayerStats(cleanName)
    console.log(`last: ${lastValidTimeframe.value}, selected: ${selectedTimeframe.value}`)
  }

  onMounted(() => {
    loadPlayerFromPath()
    window.addEventListener('popstate', loadPlayerFromPath)
  })
  onUnmounted(() => {
    window.removeEventListener('popstate', loadPlayerFromPath)
  })
  return {
    stats,
    loading,
    error,
    username,
    selectedTimeframe,
    handleSearch,
    handleTimeframeChange,
    getGameName
  }
}