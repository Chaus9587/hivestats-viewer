<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHiveStats } from '@/composables/useHiveStats'
import Card from '@/components/Card.vue'
import games from '@/composables/gameCode.js'

const { stats, loading, error, fetchPlayerStats } = useHiveStats()

const username = ref('')

const BASE_PATH = import.meta.env.BASE_URL

const selectedTimeframe = ref('all')

const handleTimeframeChange = () => {
  const activePlayer = stats.value?.main?.username || username.value
  if (activePlayer) {
    fetchPlayerStats(activePlayer, selectedTimeframe.value)
  }
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
    fetchPlayerStats(cleanPlayer)
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
  <div class="wrapper mb-6">
    <!-- Input section -->
    <form
      @submit.prevent="handleSearch"
      class="search-bar my-10 flex items-center justify-center sm:my-16 flex-row"
    >
      <input
        v-model="username"
        type="text"
        placeholder="Enter Xbox Gamertag..."
        required
        class="h-10 w-52 rounded-2xl border px-3 py-1 md:w-70"
      />


      <button
        type="submit"
        :disabled="loading"
        class="ml-6 sm:ml-10 rounded-2xl bg-neutral-700 px-6 py-2 text-white hover:cursor-pointer dark:bg-neutral-200 dark:text-black"
      >
        Search
      </button>

      
    </form>
    <div class="flex items-center justify-center mb-12">
      <div v-if="loading" class="loading-box w-[75vw]">loading...</div>
      <div v-if="error" class="error-box w-[75vw]">{{ error }}</div>
    </div>
    

    

    <!-- Results Display -->
    <div v-if="stats" class="results-card">
      <!-- Profile card -->
      <div
        class="profile-card my-6 flex flex-col items-center justify-center bg-neutral-100 px-[calc(15vw-16px)] py-10 shadow-2xl sm:flex-row sm:items-center sm:justify-normal sm:py-12 md:py-15 dark:bg-zinc-700"
        :class="{
          'ultimate' : stats.main?.rank === 'ULTIMATE',
          'plus': stats.main?.rank === 'PLUS',
        }"
      >
        <div class="profile-icon">
          <img
            v-if="stats.main?.equipped_avatar"
            :src="stats.main?.equipped_avatar.url"
            alt=""
            class="size-24"
          />
          <img v-else src="@/assets/default.png" alt="" class="size-24" />
        </div>
        <div class="profile-info mt-6 text-center sm:mt-0 sm:ml-6 sm:text-left">
          <h3 class="text-3xl mb-2 font-bold sm:text-4xl md:text-5xl lg:text-6xl">
            {{ stats.main?.username_cc || username }}
          </h3>
          <p v-if="stats.main?.rank">{{ stats.main.rank }}</p>
          <p v-if="stats.main?.first_played">
            <strong>First Played:</strong>
            {{ new Date(stats.main.first_played * 1000).toLocaleDateString() }}
          </p>
        </div>
      </div>
      <div v-if="stats" class="stats-display flex flex-col md:flex-row md:justify-around w-full pt-12 gap-10 px-[calc(10vw-16px)]">
        <div class="statistics grow-8">
          <!-- All games statistics -->
          <div>
            <div v-for="(gameData, gameCode) in stats" :key="gameCode">
              <div
                v-if="
                  gameCode !== 'main' &&
                  gameData &&
                  !Array.isArray(gameData) &&
                  typeof gameData === 'object'
                "
                class="game-card mb-10 rounded-2xl bg-neutral-100 p-6 shadow-xl dark:bg-zinc-700"
              >
                <Card :title="getGameName(gameCode)">
                  <ul class="mt-3">
                    <li v-for="(val, label) in gameData" :key="label" class="pt-1">
                      <strong>{{ label }}:</strong>
                      {{ typeof val === 'number' ? val.toLocaleString() : val }}
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div class="extras h-fit grow-6 max-w-[40vw] rounded-2xl bg-neutral-100 p-6 shadow-xl dark:bg-zinc-700">
          <div class="mb-8">
            <select
              id="timeframe-select"
              v-model="selectedTimeframe"
              :disabled="loading"
              @change="handleTimeframeChange"
              class="h-10 w-[70%] rounded-2xl border bg-white px-3 py-1 dark:bg-zinc-700"
            >
              <option value="all">All Time</option>
              <option value="current_month">Current Month</option>
              <option value="last_month">Last Month</option>
            </select>
          </div>
          <hr />

          <div class="avatar">
            <h3 class="text-2xl font-medium my-4">Avatar</h3>
            <div class="flex flex-wrap">
              <img 
                :src="avatar.url" 
                class="size-20 p-2"
                v-for="avatar in stats.main?.avatar_unlocked">
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .ultimate {
    border-block: 3px solid #d460ff;
  }
  .plus {
    border-block: 3px solid #42dd0e;
  }
</style>