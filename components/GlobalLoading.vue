<template>
  <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Background overlay -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    
    <!-- Loading content -->
    <div class="relative z-10 text-center">
      <!-- Logo -->
      <div class="mb-8">
        <TheLogo />
      </div>
      
      <!-- Loading dots animation -->
      <div class="mb-6">
        <div class="flex justify-center items-center space-x-2">
          <div class="w-4 h-4 bg-orange-600 rounded-full animate-bounce"></div>
          <div class="w-4 h-4 bg-orange-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-4 h-4 bg-orange-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>
      
      <!-- Loading message -->
      <div class="space-y-4">
        <h2 class="text-xl font-bold text-white">{{ loadingMessage }}</h2>
        <p class="text-slate-400 text-sm">Esto solo tomará un momento...</p>
        
        <!-- Emergency navigation button (only appears after delay) -->
        <div v-if="showEmergencyButton" class="mt-4">
          <button 
            @click="forceNavigateToDashboard"
            class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            🚀 IR AL DASHBOARD AHORA
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isLoading, loadingMessage } = useGlobalLoading()
const showEmergencyButton = ref(false)

// Watch for loading state changes
watch(isLoading, (newValue) => {
  if (newValue) {
    console.log('🔄 Loading global activado:', loadingMessage.value)
    // Reset emergency button state
    showEmergencyButton.value = false
    
    // Only show emergency button for dashboard messages after a delay
    if (loadingMessage.value.includes('dashboard')) {
      console.log('⏰ Configurando botón de emergencia para aparecer en 4 segundos')
      setTimeout(() => {
        // Only show if still loading and message still contains dashboard
        if (isLoading.value && loadingMessage.value.includes('dashboard')) {
          console.log('🚨 Mostrando botón de emergencia')
          showEmergencyButton.value = true
        }
      }, 4000) // 4 seconds delay
    }
  } else {
    // Reset emergency button when loading stops
    showEmergencyButton.value = false
  }
}, { immediate: true })

// Emergency navigation function
const forceNavigateToDashboard = () => {
  console.log('🚀 NAVEGACIÓN FORZADA: Yendo al dashboard')
  const { setLoading } = useGlobalLoading()
  
  // Clear all redirect flags
  localStorage.removeItem('therepzone_redirecting')
  console.log('🧹 Limpiando todos los flags de redirección')
  
  setLoading(false)
  window.location.href = '/dashboard'
}
</script>

<style scoped>
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0,-8px,0);
  }
  70% {
    transform: translate3d(0,-4px,0);
  }
  90% {
    transform: translate3d(0,-2px,0);
  }
}

.animate-bounce {
  animation: bounce 1.4s ease-in-out infinite;
}
</style> 