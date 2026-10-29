<script setup>
import { useTheme } from '../composables/useTheme'

const { isDark, toggleDark } = useTheme()
</script>

<template>
  <nav class="flex items-center justify-between p-4">
    <div class="mx-4 flex gap-8 font-semibold">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/stats">Stats</RouterLink>
    </div>
    <button
      @click="toggleDark()"
      class="rounded border border-black px-1.25 py-1.25 hover:cursor-pointer dark:border-white"
    >
      <img v-if="isDark" src="../assets/dark_mode.svg" alt="" class="size-5" />

      <img v-else src="../assets/light_mode.svg" alt="" class="size-5" />
    </button>
  </nav>
</template>
