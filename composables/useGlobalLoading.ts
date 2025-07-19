// Global loading state management - Singleton pattern
const globalIsLoading = ref(false)
const globalLoadingMessage = ref('Cargando...')
const globalAuthChecked = ref(false)
const globalProfileLoaded = ref(false)

export const useGlobalLoading = () => {
  const setLoading = (loading: boolean, message = 'Cargando...') => {
    console.log('🎯 [useGlobalLoading] setLoading called:', loading, message)
    globalIsLoading.value = loading
    globalLoadingMessage.value = message
    console.log('🎯 [useGlobalLoading] State updated - isLoading:', globalIsLoading.value, 'message:', globalLoadingMessage.value)
    
    // Safety: automatically disable loading after a timeout
    if (process.client && loading) {
      console.log('🛡️ [useGlobalLoading] Configurando timeout de seguridad de 3 segundos')
      setTimeout(() => {
        if (globalIsLoading.value) {
          console.log('🛡️ [useGlobalLoading] Safety timeout: Desactivando loading después de 3 segundos')
          globalIsLoading.value = false
          globalLoadingMessage.value = 'Cargando...'
        }
      }, 3000) // 3 seconds safety timeout
    }
  }

  const setAuthChecked = (checked: boolean) => {
    globalAuthChecked.value = checked
  }

  const setProfileLoaded = (loaded: boolean) => {
    globalProfileLoaded.value = loaded
  }

  const forceDisableLoading = () => {
    console.log('🛡️ [useGlobalLoading] Force disabling loading')
    globalIsLoading.value = false
    globalLoadingMessage.value = 'Cargando...'
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
    setProfileLoaded,
    forceDisableLoading
  }
} 