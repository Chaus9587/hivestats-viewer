<!-- src/components/PlayerStats.vue -->
<script setup>
import { ref, computed } from 'vue'
import { useHiveStats } from '../composables/useHiveStats'

const username = ref('')
const selectedGame = ref('all')

const IGNORED_KEYS = ['UUID', 'first_played', 'human_index']

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
  { code: 'mob', name: 'MobGame' }
]

// Get the name of a game by its code
const getGameName = (code) => games.find((g) => g.code === code)?.name || code.toUpperCase()

const handleSearch = () => {
  fetchPlayerStats(username.value)
}

// Computed helper to get the currently selected single game's data
const currentSingleGameStats = computed(() => {
  if (!stats.value || selectedGame.value === 'all') return null
  const gameData = stats.value[selectedGame.value]
  
  // Remember: PlayHive returns [] if the player has never played that mode
  if (!gameData || Array.isArray(gameData)) return null
  return gameData
})

const formatStatName = (key) => {
  if (key === 'xp') return 'XP'
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getValidStats = (gameData) => {
  if (!gameData || Array.isArray(gameData)) return {}
  return Object.fromEntries(
    Object.entries(gameData).filter(
      ([key, val]) => !IGNORED_KEYS.includes(key) && (typeof val === 'number' || typeof val === 'string')
    )
  )
}


</script>

<template>
  <div class="p-6">
    <h2 class="my-4">Hive Player Stats</h2>

    <form @submit.prevent="handleSearch" class="search-bar">
      <input
        v-model="username"
        type="text"
        placeholder="Enter Xbox Gamertag or UUID..."
        required
        class="px-3 py-1 h-10 border rounded-l-2xl rounded-bl-2xl w-64"
      />
      
      <!-- Changing this now updates the view immediately without hitting Search -->
      <select v-model="selectedGame" class="px-3 py-1 h-10 rounded-r-2xl rounded-br-2xl border">
        <option v-for="g in games" :key="g.code" :value="g.code">
          {{ g.name }}
        </option>
      </select>
      
      <br>

      <button 
        type="submit" 
        :disabled="loading"
        class="py-2 px-4 mt-4 bg-neutral-700 text-white rounded-2xl dark:bg-neutral-200 dark:text-black hover:cursor-pointer">
        {{ loading ? 'Fetching...' : 'Search' }}
      </button>
    </form>

    <div v-if="error" class="error-box">{{ error }}</div>
    <br><hr>

    
    <!-- Results Display -->
    <div v-if="stats" class="results-card">
      <div class="py-3">
        <h3>Profile: {{ stats.main?.username_cc || username }}</h3>
        <p v-if="stats.main?.rank"><strong>Rank:</strong> {{ stats.main.rank }}</p>
        <p v-if="stats.main?.first_played"><strong>First Played:</strong> {{ new Date(stats.main.first_played * 1000).toLocaleDateString() }}</p>
        <img v-if="stats.main?.equipped_avatar" :src="stats.main.equipped_avatar.url"  class="w-16 h-16 rounded-2xl">
      </div>      

      <!-- 1. When 'All Games' is selected -->
      <hr>
      <div v-if="selectedGame === 'all'" class="py-3">
        <template v-for="(gameData, gameCode) in stats" :key="gameCode">
          <div 
            v-if="gameCode !== 'main' && gameData && !Array.isArray(gameData) && typeof gameData === 'object'" 
            class="game-card"
          > 
            
            <h4>{{ getGameName(gameCode) }}</h4>
            <ul>
              <li v-for="(val, statKey) in getValidStats(gameData)" :key="statKey">
                <strong>{{ formatStatName(statKey) }}:</strong> {{ val.toLocaleString() }}
              </li>
            </ul>
            <br>
          </div>
        </template>
      </div>

      <!-- 2. When a Single Game is selected (Reads instantly from cached stats) -->
      <div v-else class="py-3">
        <h4>{{ getGameName(selectedGame) }}</h4>
        <ul v-if="currentSingleGameStats">
          <li v-for="(val, statKey) in getValidStats(currentSingleGameStats)" :key="statKey">
            <strong>{{ formatStatName(statKey) }}:</strong> {{ val.toLocaleString() }}
          </li>
        </ul>
        <p v-else>This player has no recorded stats for {{ getGameName(selectedGame) }}.</p>
      </div>
    </div>
  </div>
</template>