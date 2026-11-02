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
      <button class="inline size-6 hover:cursor-pointer" @click="isOpen = !isOpen">
        <img v-if="!isOpen" src="@/assets/down.svg" alt="" />
        <img v-else src="@/assets/up.svg" alt="" />
      </button>
    </div>

    <slot v-if="isOpen" class="dark:bg-zinc-700"></slot>
  </div>
</template>
