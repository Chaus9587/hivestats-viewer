<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div>
    <div class="flex items-center gap-3">
      <h4 class="text-2xl font-medium">{{ title }}</h4>
      <span class="inline-block h-6 w-0.5 bg-gray-400 dark:bg-zinc-500"></span>
      <button class="inline size-6 hover:cursor-pointer" @click="isOpen = !isOpen">
        <div v-if="!isOpen">
          <img class="block dark:hidden" src="@/assets/down.svg" alt="" />
          <img class="hidden dark:block" src="@/assets/down-dark.svg" alt="" />
        </div>
        <div v-else>
          <img class="block dark:hidden" src="@/assets/up.svg" alt="" />
          <img class="hidden dark:block" src="@/assets/up-dark.svg" alt="" />
        </div>
      </button>
    </div>

    <slot v-if="isOpen" class="dark:bg-zinc-700"></slot>
  </div>
</template>
