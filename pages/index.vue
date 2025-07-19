<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <header class="container mx-auto px-4 py-6">
      <nav class="flex items-center justify-between">
        <TheLogo />
        <div class="flex gap-4">
          <AppButtonSecondary to="/register">
            Regístrate
          </AppButtonSecondary>
          <AppButtonPrimary to="/login">
            Iniciar Sesión
          </AppButtonPrimary>
        </div>
      </nav>
    </header>

    <!-- Hero Section -->
    <main class="container mx-auto px-4 py-20 text-center">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight">
          THE<span class="text-orange-600">REP</span>ZONE
        </h1>

        <p class="text-2xl md:text-3xl text-slate-300 mb-8 font-bold">
          REGISTRA TUS ENTRENAMIENTOS. <br> CONQUISTA TUS METAS.
        </p>

        <p class="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
          La plataforma definitiva para el seguimiento de entrenamientos con una base de datos completa de ejercicios. Registra tus entrenamientos, rastrea tu progreso y domina tu camino hacia el fitness.
        </p>

        <div class="flex justify-center">
          <AppButtonPrimary to="/login" class="text-lg px-8 py-4">
            Comenzar Ahora
          </AppButtonPrimary>
        </div>
      </div>

      <!-- Features Preview -->
      <div class="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div class="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <UIcon name="i-heroicons-fire" class="text-white text-xl" />
          </div>
          <h3 class="text-white font-bold text-xl mb-2">BASE DE EJERCICIOS</h3>
          <p class="text-slate-400">
            Librería completa de ejercicios con instrucciones detalladas y niveles de dificultad.
          </p>
        </div>

        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <UIcon name="i-heroicons-chart-bar" class="text-white text-xl" />
          </div>
          <h3 class="text-white font-bold text-xl mb-2">SEGUIMIENTO DE ENTRENAMIENTOS</h3>
          <p class="text-slate-400">
            Registra tus entrenamientos y rastrea tu progreso a lo largo del tiempo con análisis detallados.
          </p>
        </div>

        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div class="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <UIcon name="i-heroicons-bolt" class="text-white text-xl" />
          </div>
          <h3 class="text-white font-bold text-xl mb-2">RUTINAS PERSONALIZADAS</h3>
          <p class="text-slate-400">Crea rutinas de entrenamiento personalizadas adaptadas a tus objetivos de fitness.</p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="container mx-auto px-4 py-8 mt-20 border-t border-slate-700">
      <div class="text-center text-slate-500">
        <p>&copy; 2024 THEREPZONE. Desarrollado por atletas, para atletas.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import TheLogo from '~/components/shared/TheLogo.vue'
import AppButtonPrimary from '~/components/shared/AppButtonPrimary.vue'
import AppButtonSecondary from '~/components/shared/AppButtonSecondary.vue'

// Landing page for THEREPZONE
useHead({
  title: 'THEREPZONE - Registra tus Entrenamientos',
  meta: [
    { name: 'description', content: 'La plataforma definitiva para el seguimiento de entrenamientos con base de datos completa de ejercicios' }
  ]
})
</script> 