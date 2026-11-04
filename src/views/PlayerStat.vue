<script setup>
import { ref, computed } from 'vue'
import { playerSearch } from '@/composables/playerSearch'
import { parseMcText } from '@/composables/colorCode'
import gameCard from '@/components/GameCard.vue'
import CosmeticCard from '@/components/CosmeticCard.vue'

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
  getGameName,
} = playerSearch()

// Determine whether displaying all avatars or just the first 6 based on the showAllAvatars state
const displayedAvatars = computed(() => {
  const avatars = stats.value?.main?.avatar_unlocked || []
  return showAllAvatars.value ? avatars : avatars.slice(0, avatarLimit)
})

// Same for displaying hub titles
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
      class="search-bar my-10 flex flex-row items-center justify-center sm:my-16"
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
        class="ml-6 rounded-2xl bg-neutral-700 px-6 py-2 text-white hover:cursor-pointer sm:ml-10 dark:bg-neutral-200 dark:text-black"
      >
        Search
      </button>
    </form>

    <!-- Fetch status and error -->
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
          ultimate: stats.main?.rank === 'ULTIMATE',
          plus: stats.main?.rank === 'PLUS',
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
          <h3 class="mb-2 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
            {{ stats.main?.username_cc || username }}
          </h3>
          <p v-if="stats.main?.rank">{{ stats.main.rank }}</p>
          <p v-if="stats.main?.first_played">
            <strong>First Played:</strong>
            {{ new Date(stats.main.first_played * 1000).toLocaleDateString() }}
          </p>
        </div>
      </section>

      <!-- Stats and cosmetics -->
      <section
        v-if="stats"
        class="stats-display flex w-full flex-col gap-10 px-[calc(10vw-16px)] pt-12 md:flex-row md:justify-around"
      >
        <div class="statistics grow-8 md:basis-0">
          <!-- All/monthly games statistics -->
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
                <!-- Parkour worlds display (Differ from other gamemodes) -->
                <div v-if="gameCode === 'parkour'" class="mt-3 space-y-6">
                  <div v-for="(courses, worldName) in gameData" :key="worldName">
                    <h4 class="mb-2 text-xl font-bold">{{ worldName }}</h4>

                    <div class="space-y-4 pl-2">
                      <div v-for="(courseData, courseName) in courses" :key="courseName">
                        <h5 class="text-lg font-semibold">{{ courseName }}</h5>
                        <p class="mb-1 font-medium">{{ courseData.summary }}</p>

                        <div
                          v-for="(time, cpLabel) in courseData.checkpoints"
                          :key="cpLabel"
                          class="py-0.5 text-sm leading-tight"
                        >
                          <div class="font-medium opacity-80">{{ cpLabel }}</div>
                          <div>{{ time }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Oher gamemodes -->
                <ul v-else class="mt-3">
                  <li v-for="(val, label) in gameData" :key="label" class="pt-1">
                    <strong>{{ label }}:</strong>
                    {{ typeof val === 'number' ? val.toLocaleString() : val }}
                  </li>
                </ul>
              </gameCard>
            </div>
          </div>
        </div>

        <!-- Sidebar for cosemetics -->
        <div
          class="extras h-fit grow-6 rounded-2xl bg-neutral-100 p-6 shadow-xl md:max-w-[35vw] md:basis-0 dark:bg-zinc-700"
        >
          <!-- Dropdown menu for selecting timeframe -->
          <div class="dropdown mt-2 mb-8">
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

          <!-- Avatar Display -->
          <CosmeticCard
            v-model="showAllAvatars"
            title="Avatar"
            item-name="avatars"
            :total="stats.main?.avatar_unlocked?.length || 0"
            :limit="avatarLimit"
            content-class="flex flex-wrap transition"
          >
            <img
              v-for="(avatar, index) in displayedAvatars"
              :key="avatar.url || index"
              :src="avatar.url"
              class="size-18 p-2"
              alt="Unlocked avatar"
            />
          </CosmeticCard>

          <hr />

          <!-- Hub Titles Display -->
          <CosmeticCard
            v-model="showAllHubtitles"
            title="Hub Titles"
            item-name="hub titles"
            :total="stats.main?.hub_title_unlocked?.length || 0"
            :limit="hubtitleLimit"
          >
            <p
              v-for="(title, idx) in displayedHubtitles"
              :key="idx"
              class="mb-1 font-medium drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
            >
              <span
                v-for="(segment, segIdx) in parseMcText(title)"
                :key="segIdx"
                :style="{ color: segment.hex }"
              >
                {{ segment.text }}
              </span>
            </p>
          </CosmeticCard>
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
