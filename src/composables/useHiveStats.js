import { ref } from 'vue'

export function useHiveStats() {
  const stats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const BASE_URL = 'https://api.playhive.com/v0'

  const fetchPlayerStats = async (identifier) => {
    if (!identifier?.trim()) return

    loading.value = true
    error.value = null
    stats.value = null

    const safeIdentifier = encodeURIComponent(identifier.trim())
    
    const endpoint = `${BASE_URL}/game/all/all/${safeIdentifier}`

    try {
      const response = await fetch(endpoint)
      const contentType = response.headers.get('content-type') || ''

      if (!contentType.includes('application/json')) {
        throw new Error('Received HTML instead of JSON. Check your Vite proxy.')
      }
      if (response.status === 404) {
        throw new Error('Player not found.')
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Try again in a few minutes.')
      }
      if (!response.ok) {
        throw new Error(`API error (${response.status})`)
      }

      const data = await response.json()
      stats.value = data
    } catch (err) {
      error.value = err.message || 'An unexpected error occurred.'
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, error, fetchPlayerStats }
}