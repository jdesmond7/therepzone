<template>
  <!-- Loading overlay with The Repzone design -->
  <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
    <!-- Loading content -->
    <div class="text-center">
      <!-- Logo -->
      <div class="flex items-center justify-center mb-8">
        <div class="flex items-center gap-3">
          <!-- Orange square with RZ -->
          <div class="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
            <span class="text-white font-black text-lg">RZ</span>
          </div>
          <!-- THEREPZONE text -->
          <span class="text-2xl font-black text-white tracking-tight">
            THE<span class="text-orange-600">REP</span>ZONE
          </span>
        </div>
      </div>
      
      <!-- Loading dots -->
      <div class="flex justify-center items-center space-x-2 mb-6">
        <div class="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
        <div class="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
      
      <!-- Welcome text -->
      <div class="text-white text-center">
        <h2 class="text-2xl font-bold mb-2">💪💪💪</h2>
        <h2 class="text-2xl font-bold mb-6">¡Hey, bienvenido de vuelta!</h2>
        <p class="text-base text-gray-400">Estamos cargando tus datos y progresos.</p>
        <p class="text-base text-gray-400">Dame solo un par de segundos</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isLoading, loadingMessage } = useGlobalLoading()

// Debug logs
console.log('🎯 [GlobalLoading] Component mounted, isLoading:', isLoading.value, 'message:', loadingMessage.value)

// Watch for immediate changes
watchEffect(() => {
  console.log('🎯 [GlobalLoading] WatchEffect triggered - isLoading:', isLoading.value, 'message:', loadingMessage.value)
})
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