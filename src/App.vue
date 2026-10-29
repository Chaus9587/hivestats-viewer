<script setup>
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
</script>

<template>
  <Navbar class="bg-amber-400 dark:bg-amber-500/80" />
  <RouterView />
</template>

<style scoped></style>
