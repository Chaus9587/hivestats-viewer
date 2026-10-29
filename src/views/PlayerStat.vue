<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHiveStats } from '@/composables/useHiveStats'

const username = ref('')
const selectedGame = ref('all')

const BASE_PATH = import.meta.env.BASE_URL

const COMBAT_RATIO_MODES = ['ctf', 'sky', 'bed', 'sg']

const { stats, loading, error, fetchPlayerStats } = useHiveStats()

const games = [
  { code: 'all', name: 'All Games (Full Profile)' },
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

  // 2. Combat Stats (and stats related to ctf, sky, bed, sg)
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

// Pass gameCode as the second parameter to filter mode-restricted stats
const getValidStats = (gameData, gameCode) => {
  if (!gameData || Array.isArray(gameData)) return []

  return STAT_SCHEMA.filter((stat) => !stat.modes || stat.modes.includes(gameCode))
    .map((stat) => {
      const rawValue = stat.getValue ? stat.getValue(gameData) : gameData[stat.key]
      return {
        key: stat.key,
        label: stat.label,
        value: rawValue,
      }
    })
    .filter((item) => item.value !== undefined && item.value !== null)
}

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
      class="search-bar mt-5 md:mt-8 md:flex md:items-center md:justify-center"
    >
      <input
        v-model="username"
        type="text"
        placeholder="Enter Xbox Gamertag or UUID..."
        required
        class="h-10 w-64 rounded-l-2xl rounded-bl-2xl border px-3 py-1"
      />

      <!-- Changing this now updates the view immediately without hitting Search -->
      <select v-model="selectedGame" class="h-10 rounded-r-2xl rounded-br-2xl border px-3 py-1">
        <option v-for="g in games" :key="g.code" :value="g.code">
          {{ g.name }}
        </option>
      </select>

      <br />

      <button
        type="submit"
        :disabled="loading"
        class="mt-5 rounded-2xl bg-neutral-700 px-6 py-2 text-white hover:cursor-pointer md:mt-0 md:ml-6 dark:bg-neutral-200 dark:text-black"
      >
        {{ loading ? 'Fetching...' : 'Search' }}
      </button>
    </form>

    <div v-if="error" class="error-box mt-6 flex items-center justify-center">{{ error }}</div>
    <br />
    <hr />

    <!-- Results Display -->
    <div v-if="stats" class="results-card">
      <div class="py-3">
        <h3>Profile: {{ stats.main?.username_cc || username }}</h3>
        <p v-if="stats.main?.rank"><strong>Rank:</strong> {{ stats.main.rank }}</p>
        <p v-if="stats.main?.first_played">
          <strong>First Played:</strong>
          {{ new Date(stats.main.first_played * 1000).toLocaleDateString() }}
        </p>
        <img
          v-if="stats.main?.equipped_avatar"
          :src="stats.main.equipped_avatar.url"
          class="h-16 w-16 rounded-2xl"
        />
      </div>

      <!-- 1. When 'All Games' is selected -->
      <hr />
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
              <li v-for="stat in getValidStats(gameData, gameCode)" :key="stat.key">
                <strong>{{ stat.label }}:</strong>
                {{ typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value }}
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
          <li v-for="stat in getValidStats(currentSingleGameStats, selectedGame)" :key="stat.key">
            <strong>{{ stat.label }}:</strong>
            {{ typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value }}
          </li>
        </ul>
        <p v-else>This player has no recorded stats for {{ getGameName(selectedGame) }}.</p>
      </div>
    </div>
  </div>
</template>
