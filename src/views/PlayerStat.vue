<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHiveStats } from '@/composables/useHiveStats'

const username = ref('')
const selectedGame = ref('all')

const BASE_PATH = import.meta.env.BASE_URL

const { stats, loading, error, fetchPlayerStats } = useHiveStats()

const games = [
  { code: 'all', name: 'All Games' },
  { code: 'bed', name: 'BedWars' },
  { code: 'sky', name: 'SkyWars' },
  { code: 'wars', name: 'Treasure Wars' },
  { code: 'murder', name: 'Murder Mystery' },
  { code: 'hide', name: 'Hide and Seek' },
  { code: 'dr', name: 'DeathRun' },
  { code: 'sg', name: 'Survival Games' },
  { code: 'build', name: 'Just Build' },
  { code: 'ctf', name: 'Capture the Flag' },
  { code: 'bridge', name: 'The Bridge' },
  { code: 'grav', name: 'Gravity' },
  { code: 'party', name: 'Block Party' },
  { code: 'drop', name: 'Block Drop' },
  { code: 'ground', name: 'Ground Wars' },
  { code: 'parkour', name: 'Parkour Worlds' },

  { code: 'gi', name: 'Ghost Invasion' },
  { code: 'mob', name: 'MobGame' },
]

// Get the name of a game by its code
const getGameName = (code) => games.find((g) => g.code === code)?.name || code.toUpperCase()

// Get game(s) stats based on what you've selected in dropdown menu
const currentSingleGameStats = computed(() => {
  if (!stats.value || selectedGame.value === 'all') return null
  const gameData = stats.value[selectedGame.value]

  // Empty Array for gamemodes that have never played
  if (!gameData || Array.isArray(gameData)) return null
  return gameData
})

// Allow user to input player's name in url to directly fetch stats
const loadPlayerFromPath = () => {
  let path = window.location.pathname

  // Strip '/hivestats-viewer/' in vite.config.js base
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
    fetchPlayerStats(cleanPlayer)
  }
}

const handleSearch = () => {
  const cleanName = username.value.trim()
  if (!cleanName) return

  // Preserve '/stats/' if currently on the /stats route, or use root '/hivestats-viewer/PlayerName'
  const isStatsSubroute = window.location.pathname.startsWith(`${BASE_PATH}stats`)
  const newUrl = isStatsSubroute
    ? `${BASE_PATH}stats/${encodeURIComponent(cleanName)}`
    : `${BASE_PATH}${encodeURIComponent(cleanName)}`

  window.history.pushState({}, '', newUrl)
  fetchPlayerStats(cleanName)
}

onMounted(() => {
  loadPlayerFromPath()
  window.addEventListener('popstate', loadPlayerFromPath)
})

onUnmounted(() => {
  window.removeEventListener('popstate', loadPlayerFromPath)
})
</script>

<template>
  <div class="p-6">
    <form
      @submit.prevent="handleSearch"  
      class="search-bar my-8 flex items-center justify-center flex-col md:flex-row"
    >
    
    <input
      v-model="username"
      type="text"
      placeholder="Enter Xbox Gamertag..."
      required
      class="h-10 w-76 rounded-2xl md:w-68 md:rounded-l-2xl md:rounded-bl-2xl md:rounded-none border px-3 py-1"
    />

    <div class="mt-5 md:mt-0">
      <!-- Changing this now updates the view immediately without hitting Search -->
      <select v-model="selectedGame" class="h-10 w-44 rounded-2xl md:rounded-r-2xl md:rounded-br-2xl md:rounded-none border px-3 py-1">
        <option v-for="g in games" :key="g.code" :value="g.code">
          {{ g.name }}
        </option>
      </select>

      <button
        type="submit"
        :disabled="loading"
        class="rounded-2xl bg-neutral-700 px-6 py-2 text-white hover:cursor-pointer ml-8 dark:bg-neutral-200 dark:text-black"
      >
        {{ loading ? 'Fetching...' : 'Search' }}
      </button>
    </div>
    

    </form>

    <div v-if="error" class="error-box mt-6 flex items-center justify-center">{{ error }}</div>

    <!-- Results Display -->
    <div v-if="stats" class="results-card">
      <div class="profile-card my-6 mx-8 flex flex-col justify-center items-center sm:justify-normal sm:items-start sm:flex-row bg-neutral-100 py-6 px-8 rounded-3xl shadow-xl md:py-10 md:px-10 sm:mx-[10vw] md:mx-[15vw] lg:mx-[18vw]">
        <div class="profile-icon size-fit">
          <img
            v-if="stats.main?.equipped_avatar"
            :src="stats.main.equipped_avatar.url"
            alt=""
            class="h-20 w-20"
          />
          <img
            v-else
            src="../assets/default.png" 
            alt=""
            class="h-20 w-20"
          />
        </div>
        <div class="profile-info mt-6 sm:mt-0 sm:ml-6 text-center sm:text-left">
          <h3 class="text-2xl md:text-4xl font-bold">{{ stats.main?.username_cc || username }}</h3>
          <p v-if="stats.main?.rank">{{ stats.main.rank }}</p>
          <p v-if="stats.main?.first_played">
            <strong>First Played:</strong>
            {{ new Date(stats.main.first_played * 1000).toLocaleDateString() }}
          </p>
        </div>
      </div>

      <!-- 1. When 'All Games' is selected -->
      <div v-if="selectedGame === 'all'" class="py-3">
        <template v-for="(gameData, gameCode) in stats" :key="gameCode">
          <div
            v-if="
              gameCode !== 'main' &&
              gameData &&
              !Array.isArray(gameData) &&
              typeof gameData === 'object'
            "
            class="game-card"
          >
            <h4>{{ getGameName(gameCode) }}</h4>
            <ul>
              <li v-for="(val, label) in gameData" :key="label">
                <strong>{{ label }}:</strong> {{ typeof val === 'number' ? val.toLocaleString() : val }}
              </li>
            </ul>
            <br />
          </div>
        </template>
      </div>

      <!-- 2. When a Single Game is selected (Reads instantly from cached stats) -->
      <div v-else class="py-3">
        <h4>{{ getGameName(selectedGame) }}</h4>
        <ul v-if="currentSingleGameStats">
          <li v-for="(val, label) in currentSingleGameStats" :key="label">
            <strong>{{ label }}:</strong> {{ typeof val === 'number' ? val.toLocaleString() : val }}
          </li>
        </ul>
        <p v-else>This player has no recorded stats for {{ getGameName(selectedGame) }}.</p>
      </div>
    </div>
  </div>
</template>
