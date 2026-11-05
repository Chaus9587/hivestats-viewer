<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  total: {
    type: Number,
    default: 0,
  },
  limit: {
    type: Number,
    required: true,
  },
  itemName: {
    type: String,
    default: 'items',
  },
  contentClass: {
    type: String,
    default: '',
  },
})

// sync from PlayerStat.vue's showAllAvatars, showAllHubtitles...
const isExpanded = defineModel({ type: Boolean, default: false })

const isExpandable = computed(() => props.total > props.limit)

const toggleExpand = () => {
  if (isExpandable.value) {
    isExpanded.value = !isExpanded.value
  }
}
</script>

<template>
  <div class="my-5">
    <div class="flex items-center gap-3">
      <h3 class="text-2xl font-medium">{{ title }}</h3>
      <span class="inline-block h-6 w-0.5 bg-gray-400 dark:bg-zinc-500"></span>
      <button
        v-if="isExpandable"
        type="button"
        class="flex size-7 items-center justify-center hover:cursor-pointer"
        @click="toggleExpand"
      >
        <div v-if="!isExpanded">
          <img class="block dark:hidden" src="@/assets/down.svg" alt="Expand" />
          <img class="hidden dark:block" src="@/assets/down-dark.svg" alt="Expand" />
        </div>
        <div v-else>
          <img class="block dark:hidden" src="@/assets/up.svg" alt="Collapse" />
          <img class="hidden dark:block" src="@/assets/up-dark.svg" alt="Collapse" />
        </div>
      </button>
    </div>

    <section
      class="my-3"
      :class="[contentClass, { 'hover:cursor-pointer': isExpandable }]"
      @click="toggleExpand"
    >
      <slot v-if="total > 0"></slot>
      <p v-else class="text-sm italic opacity-60">No {{ itemName }} unlocked</p>

      <div v-if="isExpandable" class="mt-3 w-full text-sm font-medium opacity-75">
        {{
          isExpanded
            ? 'Click to collapse'
            : `Click to view all ${total} ${itemName} (+${total - limit} more)`
        }}
      </div>
    </section>
  </div>
</template>
