<template>
  <div class="bg-slate-900 text-white min-h-screen font-sans">
    <!-- Global Loading Overlay -->
    <GlobalLoading />
    
    <!-- Main App Content -->
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Main app component for THEREPZONE
useHead({
  titleTemplate: '%s | THEREPZONE',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#ea580c' }
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap' }
  ]
})
</script> 