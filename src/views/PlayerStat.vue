<script setup>
import { ref, computed } from 'vue'
import { playerSearch } from '@/composables/playerSearch'
import { parseMcText } from '@/composables/colorCode'
import gameCard from '@/components/GameCard.vue'

const showAllAvatars = ref(false)
const showAllHubtitles = ref(false)

const avatarLimit = 6
const hubtitleLimit = 4

const {
  stats,
  loading,
  error,
  username,
  selectedTimeframe,
  handleSearch,
  handleTimeframeChange,
  getGameName
} = playerSearch()

// Determine whether displaying all avatars or just the first 12 based on the showAllAvatars state
const displayedAvatars = computed(() => {
  const avatars = stats.value?.main?.avatar_unlocked || []
  return showAllAvatars.value ? avatars : avatars.slice(0, avatarLimit)
})

const displayedHubtitles = computed(() => {
  const hubtitles = stats.value?.main?.hub_title_unlocked || []
  return showAllHubtitles.value ? hubtitles : hubtitles.slice(0, hubtitleLimit)
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
    <div class="flex items-center justify-center text-center">
      <div v-if="loading" class="loading-box w-[75vw]">loading...</div>
      <div v-if="error" class="error-box w-[75vw]">{{ error }}</div>
    </div>
  
    <!-- Results Display -->
    <main v-if="stats" class="results-card">
      <!-- Profile card -->
      <section
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
      </section>

      <section v-if="stats" class="stats-display flex flex-col md:flex-row md:justify-around w-full pt-12 gap-10 px-[calc(10vw-16px)]">
        <div class="statistics grow-8">
          <!-- All games statistics -->
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
              <gameCard :title="getGameName(gameCode)">
                <ul class="mt-3">
                  <li v-for="(val, label) in gameData" :key="label" class="pt-1">
                    <strong>{{ label }}:</strong>
                    {{ typeof val === 'number' ? val.toLocaleString() : val }}
                  </li>
                </ul>
              </gameCard>
            </div>
          </div>
        </div>

        <div class="extras h-fit grow-6 md:max-w-[35vw] rounded-2xl bg-neutral-100 p-6 shadow-xl dark:bg-zinc-700">

          <!-- Dropdown menu for selecting timeframe -->
          <div class="dropdown mb-8 mt-2">
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
          </div><hr />

          <!-- Avatars display -->
          <div class="avatar my-5">
            <div class="flex items-center gap-3">
              <h3 class="text-2xl font-medium">Avatar</h3>
              <span class="inline-block h-6 w-0.5 bg-gray-400 dark:bg-zinc-500"></span>
              <button
                v-if="stats.main?.avatar_unlocked?.length > 12"
                type="button"
                class="size-7 flex items-center justify-center hover:cursor-pointer"
                @click="showAllAvatars = !showAllAvatars"
              >
                <div v-if="!showAllAvatars">
                  <img class="block dark:hidden" src="@/assets/down.svg" alt="" />
                  <img class="hidden dark:block" src="@/assets/down-dark.svg" alt="" />
                </div>
                <div v-else>
                  <img class="block dark:hidden" src="@/assets/up.svg" alt="" />
                  <img class="hidden dark:block" src="@/assets/up-dark.svg" alt="" />
                </div>
              </button>
            </div>

            <section
              class="flex flex-wrap transition my-3"
              :class="{'hover:cursor-pointer': stats.main?.avatar_unlocked?.length > avatarLimit}"
              @click="
                showAllAvatars = !showAllAvatars
              "
            >         
              <img
                v-for="(avatar, index) in displayedAvatars"
                :key="avatar.url || index"
                :src="avatar.url"
                class="size-18 p-2"
                alt="Unlocked avatar"
              />
          
              <div
                v-if="stats.main?.avatar_unlocked?.length > avatarLimit"
                class="w-full mt-3 text-sm font-medium opacity-75"
              >
                {{
                  showAllAvatars
                    ? 'Click to collapse'
                    : `Click to view all ${stats.main.avatar_unlocked.length} avatars (+${stats.main.avatar_unlocked.length - avatarLimit} more)`
                }}
              </div>
            </section>
          </div><hr />

          <!-- Hub titles display -->
          <div class="hub-titles my-5">
            <div class="flex items-center gap-3">
              <h3 class="text-2xl font-medium">Hub Titles</h3>
              <span class="inline-block h-6 w-0.5 bg-gray-400 dark:bg-zinc-500"></span>
              <button
                v-if="stats.main?.hub_title_unlocked?.length > hubtitleLimit"
                type="button"
                class="size-7 flex items-center justify-center hover:cursor-pointer"
                @click="showAllHubtitles = !showAllHubtitles"
              >
                <div v-if="!showAllHubtitles">
                  <img class="block dark:hidden" src="@/assets/down.svg" alt="" />
                  <img class="hidden dark:block" src="@/assets/down-dark.svg" alt="" />
                </div>
                <div v-else>
                  <img class="block dark:hidden" src="@/assets/up.svg" alt="" />
                  <img class="hidden dark:block" src="@/assets/up-dark.svg" alt="" />
                </div>
              </button>
            </div> 
            
            <section
            class="my-3"
            :class="{'hover:cursor-pointer': stats.main?.hub_title_unlocked?.length > hubtitleLimit}"
              @click="
                stats.main?.hub_title_unlocked?.length > hubtitleLimit && (showAllHubtitles = !showAllHubtitles)
              "
            >
              <p
                v-for="(title, idx) in displayedHubtitles"
                :key="idx"  
                class="font-medium drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] mb-1"
              >
                <span
                  v-for="(segment, segIdx) in parseMcText(title)"
                  :key="segIdx"
                  :style="{ color: segment.hex }"
                >
                  {{ segment.text }}
                </span>
              </p>

              <div
                v-if="stats.main?.hub_title_unlocked?.length > hubtitleLimit"
                class="w-full mt-3 text-sm font-medium opacity-75"
              >
                {{
                  showAllHubtitles
                    ? 'Click to collapse'
                    : `Click to view all ${stats.main.hub_title_unlocked.length} avatars (+${stats.main.hub_title_unlocked.length - hubtitleLimit} more)`
                }}
              </div>         
            </section>
          </div>
        </div>
      </section>
    </main>
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