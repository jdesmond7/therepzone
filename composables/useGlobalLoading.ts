// Global loading state management - Singleton pattern
const globalIsLoading = ref(false)
const globalLoadingMessage = ref('Cargando...')
const globalAuthChecked = ref(false)
const globalProfileLoaded = ref(false)

export const useGlobalLoading = () => {
  const setLoading = (loading: boolean, message = 'Cargando...') => {
    globalIsLoading.value = loading
    globalLoadingMessage.value = message
    
    // Safety: automatically disable loading when user reaches dashboard
    if (process.client && loading && message.includes('dashboard')) {
      setTimeout(() => {
        if (window.location.pathname === '/dashboard' && globalIsLoading.value) {
          console.log('🛡️ Safety: Desactivando loading automáticamente en dashboard')
          globalIsLoading.value = false
        }
      }, 2000) // 2 seconds delay
    }
  }

  const setAuthChecked = (checked: boolean) => {
    globalAuthChecked.value = checked
  }

  const setProfileLoaded = (loaded: boolean) => {
    globalProfileLoaded.value = loaded
  }

  const isReadyForDashboard = computed(() => {
    return globalAuthChecked.value && globalProfileLoaded.value && !globalIsLoading.value
  })

  return {
    isLoading: readonly(globalIsLoading),
    loadingMessage: readonly(globalLoadingMessage),
    authChecked: readonly(globalAuthChecked),
    profileLoaded: readonly(globalProfileLoaded),
    isReadyForDashboard,
    setLoading,
    setAuthChecked,
    setProfileLoaded
  }
} 