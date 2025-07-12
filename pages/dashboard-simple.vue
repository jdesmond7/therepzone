<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
    <h1 class="text-3xl font-bold text-white mb-4">Dashboard Simple</h1>
    <p class="text-slate-300">Esta es una versión simplificada para probar la funcionalidad.</p>
    
    <div class="mt-8">
      <button 
        @click="logout"
        class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Cerrar Sesión
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple dashboard for testing
const logout = () => {
  console.log('Logout clicked')
  navigateTo('/')
}

// Disable SSR
definePageMeta({
  middleware: 'auth',
  ssr: false
})

useHead({
  title: 'Dashboard Simple - THEREPZONE'
})
</script> 