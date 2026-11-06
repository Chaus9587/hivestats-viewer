import { ref, computed } from 'vue'

export function handleCosmetics(stats) {

  const showAllAvatars = ref(false)
  const showAllHubtitles = ref(false)
  const showAllCostumes = ref(false)
  const showAllHats = ref(false)
  const showAllBackblings = ref(false)
  const showAllPets = ref(false)
  const showAllMounts = ref(false)

  const imageLimit = 6
  const textLimit = 4

  // Determine whether displaying all avatars or just the first 6 based on the showAllAvatars state
  const displayedAvatars = computed(() => {
    const avatars = stats.value?.main?.avatar_unlocked || []
    return showAllAvatars.value ? avatars : avatars.slice(0, imageLimit)
  })

  // Same for displaying hub titles
  const displayedHubtitles = computed(() => {
    const hubtitles = stats.value?.main?.hub_title_unlocked || []
    return showAllHubtitles.value ? hubtitles : hubtitles.slice(0, textLimit)
  })

  const displayedCostumes = computed(() => {
    const list = stats.value?.main?.costume_unlocked || []
    return showAllCostumes.value ? list : list.slice(0, textLimit)
  })

  const displayedHats = computed(() => {
    const list = stats.value?.main?.hat_unlocked || []
    return showAllHats.value ? list : list.slice(0, imageLimit)
  })

  const displayedBackblings = computed(() => {
    const list = stats.value?.main?.['cosmetics.backbling'] || []
    return showAllBackblings.value ? list : list.slice(0, imageLimit)
  })

  const displayedPets = computed(() => {
    const list = stats.value?.main?.pets || []
    return showAllPets.value ? list : list.slice(0, textLimit)
  })

  const displayedMounts = computed(() => {
    const list = stats.value?.main?.mounts || []
    return showAllMounts.value ? list : list.slice(0, textLimit)
  })

  const resetCosmeticsState = () => {
    showAllAvatars.value = false
    showAllHubtitles.value = false
    showAllCostumes.value = false
    showAllHats.value = false
    showAllBackblings.value = false
    showAllPets.value = false
    showAllMounts.value = false
  }

  return {
    showAllAvatars,
    showAllHubtitles,
    showAllCostumes,
    showAllHats,
    showAllBackblings,
    showAllPets,
    showAllMounts,

    displayedAvatars,
    displayedHubtitles,
    displayedCostumes,
    displayedHats,
    displayedBackblings,
    displayedPets,
    displayedMounts,

    textLimit,
    imageLimit,

    resetCosmeticsState
  }
}