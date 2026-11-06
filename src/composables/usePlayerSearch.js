import { ref, onMounted, onUnmounted } from 'vue'
import { useHiveStats } from '@/composables/useHiveStats'
import games from '@/composables/data/gameCode'

import { handleCosmetics } from '@/composables/handleCosmetics'

export function usePlayerSearch() {
  const BASE_PATH = import.meta.env.BASE_URL

  // Player Name types in input bar 
  const searchQuery = ref('')     

  // Currently searched player 
  const searchedPlayer = ref('')

  const selectedTimeframe = ref('all')
  const previousTimeframe = ref('all')

  const { stats, loading, error, fetchPlayerStats } = useHiveStats()

  const { resetCosmeticsState, ...cosmetics } = handleCosmetics(stats)

  // handle timeframe change in dropdown menu in sidebar (Can fetch monthly statistics)
  const handleTimeframeChange = async () => {

    // Get what plaayer you've search
    const activePlayer = stats.value?.main?.username || searchedPlayer.value
    if (!activePlayer) return
    console.log(
      `Fetching stats for ${activePlayer} with timeframe: ${selectedTimeframe.value}, previous valid timeframe: ${previousTimeframe.value}`,
    )
    const success = await fetchPlayerStats(activePlayer, selectedTimeframe.value)
  
    if (success) {
      previousTimeframe.value = selectedTimeframe.value
    } else {
      selectedTimeframe.value = previousTimeframe.value
    }
    console.log(`Last sucessfully loaded timeframe: ${previousTimeframe.value}`)
  }

  // Get the name of a game by its code
  const getGameName = (code) => games.find((g) => g.code === code)?.name || code.toUpperCase()

  // Handle search in url/input bar (Always handle all-time statistics)
  const handleSearch = async (useURL = false) => {
    const isUrlLoad = useURL === true
    let targetPlayer = searchQuery.value.trim()

    // Get player name in the url
    if (isUrlLoad) {
      let path = window.location.pathname
      if (path.startsWith(BASE_PATH)) {
        path = path.slice(BASE_PATH.length)
      }

      // Split path into segments (e.g. "/stats/PlayerName" -> ["stats", "PlayerName"])
      const segments = path.split('/').filter(Boolean)
      const rawPlayer = segments[0] === 'stats' ? segments[1] || '' : segments[0] || ''

      targetPlayer = decodeURIComponent(rawPlayer).trim()
      if (targetPlayer === 'index.html') targetPlayer = ''

      // Sync url input into input bar
      searchQuery.value = targetPlayer
    }

    // Fallback for full whitespace player name
    if (!targetPlayer) return

    // This function always fetch all time statistics
    selectedTimeframe.value = 'all'
    previousTimeframe.value = 'all'

    const success = await fetchPlayerStats(targetPlayer, 'all')

    if (success) {
      // Close expandable menu upon a sucess
      if (searchedPlayer.value.toLowerCase() !== targetPlayer.toLowerCase()) resetCosmeticsState()
      searchedPlayer.value = targetPlayer
      

      // Only push a new history entry when searching via the input bar
      if (!isUrlLoad) {
        window.history.pushState({}, '', `${BASE_PATH}${encodeURIComponent(targetPlayer)}`)
      }
    } else {
      // Clear previous player's statistics display if NEW player search hit rate limit and has no cached data (all time only)
      stats.value = null
      searchedPlayer.value = ''
    }
  }

  const onPopState = () => handleSearch(true)

  onMounted(() => {
    handleSearch(true)
    window.addEventListener('popstate', onPopState)
  })

  onUnmounted(() => {
    window.removeEventListener('popstate', onPopState)
  })

  return {
    stats,
    loading,
    error,
    searchQuery,
    selectedTimeframe,
    handleSearch,
    handleTimeframeChange,
    getGameName,
    ...cosmetics
  }
}
