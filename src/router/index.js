import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import PlayerStat from '@/views/PlayerStat.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/stats/:username?',
      alias: ['/:username?'],
      name: 'player-stats',
      component: PlayerStat
    },
  ],
})

export default router
