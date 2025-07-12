<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 p-6">
    <div class="max-w-4xl mx-auto">
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">🧹 Limpieza de Base de Datos</h1>
          <p class="text-slate-400">Reorganizar ejercicios y crear Pull-ups con nuevo formato</p>
        </div>

        <!-- Status Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-slate-700/50 rounded-lg p-6 text-center">
            <div class="text-2xl mb-2">📊</div>
            <h3 class="text-lg font-bold text-white mb-1">Ejercicios Actuales</h3>
            <p class="text-2xl font-bold text-orange-400">{{ currentExerciseCount }}</p>
          </div>

          <div class="bg-slate-700/50 rounded-lg p-6 text-center">
            <div class="text-2xl mb-2">🗑️</div>
            <h3 class="text-lg font-bold text-white mb-1">Eliminados</h3>
            <p class="text-2xl font-bold text-red-400">{{ deletedCount }}</p>
          </div>

          <div class="bg-slate-700/50 rounded-lg p-6 text-center">
            <div class="text-2xl mb-2">✨</div>
            <h3 class="text-lg font-bold text-white mb-1">Nuevos</h3>
            <p class="text-2xl font-bold text-green-400">{{ createdCount }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-4 mb-8">
          <button
            @click="checkCurrentStatus"
            :disabled="isLoading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {{ isLoading ? 'Verificando...' : '🔍 Verificar Estado Actual' }}
          </button>

          <button
            @click="executeCleanup"
            :disabled="isProcessing || !canCleanup"
            class="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {{ isProcessing ? 'Procesando...' : '🧹 Limpiar y Crear Pull-ups' }}
          </button>

          <p v-if="!canCleanup" class="text-amber-400 text-sm text-center">
            ⚠️ Verifica el estado actual antes de ejecutar la limpieza
          </p>
        </div>

        <!-- Pull-ups Preview -->
        <div class="bg-slate-700/30 rounded-lg p-6 mb-8">
          <h3 class="text-lg font-bold text-white mb-4">📋 Vista Previa: Pull-ups</h3>
          <div class="bg-slate-900 rounded-lg p-4 text-sm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
              <div>
                <span class="text-orange-400 font-medium">Title:</span> {{ pullUpsData.title }}
              </div>
              <div>
                <span class="text-orange-400 font-medium">Category:</span> {{ pullUpsData.category }}
              </div>
              <div class="md:col-span-2">
                <span class="text-orange-400 font-medium">Description:</span> {{ pullUpsData.description }}
              </div>
              <div>
                <span class="text-orange-400 font-medium">Difficulty:</span> {{ pullUpsData.difficulty }}
              </div>
              <div>
                <span class="text-orange-400 font-medium">CreatedBy:</span> {{ pullUpsData.createdBy }}
              </div>
              <div class="md:col-span-2">
                <span class="text-orange-400 font-medium">MuscleGroups:</span> {{ pullUpsData.muscleGroups.join(', ') }}
              </div>
              <div class="md:col-span-2">
                <span class="text-orange-400 font-medium">Instructions:</span>
                <ol class="list-decimal list-inside mt-1 space-y-1">
                  <li v-for="instruction in pullUpsData.instructions" :key="instruction">
                    {{ instruction }}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <!-- Logs -->
        <div class="bg-slate-900 rounded-lg p-4 h-64 overflow-y-auto">
          <h3 class="text-lg font-bold text-white mb-4">📝 Logs</h3>
          <div class="space-y-1 text-sm">
            <div v-for="(log, index) in logs" :key="index" 
                 :class="{
                   'text-green-400': log.type === 'success',
                   'text-red-400': log.type === 'error',
                   'text-blue-400': log.type === 'info',
                   'text-slate-400': log.type === 'default'
                 }">
              {{ log.message }}
            </div>
          </div>
        </div>

        <!-- Back Button -->
        <div class="mt-8 text-center">
          <NuxtLink 
            to="/coach/dashboard"
            class="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
            Volver al Dashboard
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { pullUpsExercise, cleanAndSetupDatabase, clearAllExercises } from '~/utils/clean-database'
import { useExercises } from '~/composables/firestore'

// Reactive data
const currentExerciseCount = ref(0)
const deletedCount = ref(0)
const createdCount = ref(0)
const isLoading = ref(false)
const isProcessing = ref(false)
const canCleanup = ref(false)
const logs = ref<{ message: string; type: string }[]>([])

// Pull-ups data for preview
const pullUpsData = pullUpsExercise

// Add log function
const addLog = (message: string, type: 'success' | 'error' | 'info' | 'default' = 'default') => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push({ message: `[${timestamp}] ${message}`, type })
  
  // Auto-scroll to bottom
  nextTick(() => {
    const logContainer = document.querySelector('.overflow-y-auto')
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight
    }
  })
}

// Check current database status
const checkCurrentStatus = async () => {
  isLoading.value = true
  addLog('🔍 Verificando estado actual de la base de datos...', 'info')
  
  try {
    const { getExercises } = useExercises()
    const result = await getExercises()
    
    if (result.success && result.exercises) {
      currentExerciseCount.value = result.exercises.length
      addLog(`📊 Encontrados ${result.exercises.length} ejercicios en la base de datos`, 'success')
      
      // List current exercises
      result.exercises.forEach(exercise => {
        addLog(`   - ${exercise.title} (${exercise.category}, ${exercise.difficulty})`, 'default')
      })
      
      canCleanup.value = true
      addLog('✅ Estado verificado. Puedes proceder con la limpieza.', 'success')
    } else {
      addLog('❌ Error al obtener ejercicios', 'error')
      canCleanup.value = false
    }
    
  } catch (error) {
    addLog(`❌ Error: ${error}`, 'error')
    canCleanup.value = false
  } finally {
    isLoading.value = false
  }
}

// Execute cleanup and setup
const executeCleanup = async () => {
  if (!canCleanup.value) {
    addLog('⚠️ Verifica el estado actual antes de continuar', 'error')
    return
  }
  
  isProcessing.value = true
  addLog('🚀 Iniciando limpieza y configuración de la base de datos...', 'info')
  
  try {
    const result = await cleanAndSetupDatabase()
    
    if (result.success) {
      deletedCount.value = result.cleared || 0
      createdCount.value = 1
      currentExerciseCount.value = 1
      
      addLog(`✅ Proceso completado exitosamente!`, 'success')
      addLog(`   🗑️ Ejercicios eliminados: ${result.cleared}`, 'success')
      addLog(`   ✨ Pull-ups creado con ID: ${result.pullUpsId}`, 'success')
      addLog('🎉 Base de datos reorganizada con nuevo formato!', 'success')
      
      // Reset cleanup flag
      canCleanup.value = false
      
    } else {
      addLog(`❌ Error en el proceso: ${result.error}`, 'error')
    }
    
  } catch (error) {
    addLog(`❌ Error inesperado: ${error}`, 'error')
  } finally {
    isProcessing.value = false
  }
}

// Initialize
onMounted(() => {
  addLog('🔧 Página de limpieza de base de datos cargada', 'info')
  addLog('👆 Haz clic en "Verificar Estado Actual" para empezar', 'info')
})
</script> 