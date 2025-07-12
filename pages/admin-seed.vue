<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
    <div class="max-w-4xl mx-auto">
      <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
        <h1 class="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          🔧 Panel de Administración - Base de Datos
        </h1>

        <!-- User Info Section -->
        <div class="mb-8 bg-slate-700/30 border border-slate-600 rounded-lg p-4">
          <h2 class="text-lg font-bold text-white mb-2">Usuario Actual</h2>
          <div v-if="user" class="flex items-center gap-4">
            <div class="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold">{{ user.email?.charAt(0).toUpperCase() }}</span>
            </div>
            <div>
              <p class="text-white font-medium">{{ user.email }}</p>
              <p class="text-slate-400 text-sm">UID: {{ user.uid }}</p>
            </div>
            <div class="ml-auto">
              <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Autenticado
              </span>
            </div>
          </div>
          <div v-else class="flex items-center gap-4">
            <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold">?</span>
            </div>
            <div>
              <p class="text-red-400 font-medium">Usuario no autenticado</p>
              <p class="text-slate-400 text-sm">Por favor, inicia sesión para usar las funciones de administración</p>
            </div>
            <div class="ml-auto">
              <NuxtLink 
                to="/login" 
                class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Iniciar Sesión
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Database Status Section -->
        <div class="mb-8">
          <h2 class="text-xl font-bold text-white mb-4">Estado de la Base de Datos</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-slate-700/50 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="text-2xl">🏃</div>
                <div>
                  <p class="text-lg font-bold text-white">{{ exerciseCount }}</p>
                  <p class="text-slate-400 text-sm">Ejercicios</p>
                </div>
              </div>
            </div>
            <div class="bg-slate-700/50 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="text-2xl">💪</div>
                <div>
                  <p class="text-lg font-bold text-white">{{ workoutCount }}</p>
                  <p class="text-slate-400 text-sm">Rutinas</p>
                </div>
              </div>
            </div>
            <div class="bg-slate-700/50 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="text-2xl">👤</div>
                <div>
                  <p class="text-lg font-bold text-white">{{ userCount }}</p>
                  <p class="text-slate-400 text-sm">Usuarios</p>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            @click="checkDatabaseStatus"
            :disabled="isLoading"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold px-6 py-3 rounded-lg transition-colors"
          >
            <span v-if="isLoading">Verificando...</span>
            <span v-else>🔄 Verificar Estado</span>
          </button>
        </div>

        <!-- Seed Database Section -->
        <div class="mb-8">
          <h2 class="text-xl font-bold text-white mb-4">Inicializar Datos</h2>
          <p class="text-slate-400 mb-4">
            Si la base de datos está vacía, puedes ejecutar el seed para crear ejercicios y rutinas de ejemplo.
          </p>
          
          <button 
            @click="executeSeed"
            :disabled="isSeeding || (exerciseCount > 0 && workoutCount > 0)"
            class="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-bold px-6 py-3 rounded-lg transition-colors mr-4"
          >
            <span v-if="isSeeding">Creando datos...</span>
            <span v-else-if="exerciseCount > 0 && workoutCount > 0">✅ Datos ya creados</span>
            <span v-else>🌱 Ejecutar Seed</span>
          </button>

          <button 
            @click="clearLogs"
            class="bg-slate-600 hover:bg-slate-700 text-white font-bold px-4 py-3 rounded-lg transition-colors"
          >
            🗑️ Limpiar Logs
          </button>
        </div>

        <!-- Add Bulk Exercises Section -->
        <div class="mb-8">
          <h2 class="text-xl font-bold text-white mb-4">Agregar Ejercicios en Lote</h2>
          <p class="text-slate-400 mb-4">
            Crear 6 ejercicios nuevos: Squats, Pistol Squats, Push-ups, Dips, Press con Pesa Rusa y Remo con Pesa Rusa.
          </p>
          
          <button 
            @click="addBulkExercises"
            :disabled="isAddingExercises || !user"
            class="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-bold px-6 py-3 rounded-lg transition-colors cursor-pointer"
          >
            <span v-if="isAddingExercises">Creando ejercicios...</span>
            <span v-else-if="!user">🔒 Requiere Autenticación</span>
            <span v-else>🏋️ Agregar 6 Ejercicios Nuevos</span>
          </button>
          
          <p v-if="!user" class="text-slate-400 text-sm mt-2">
            💡 Inicia sesión para poder crear ejercicios
          </p>
        </div>

        <!-- Migration Tools Section -->
        <div class="mb-8">
          <h2 class="text-xl font-bold text-white mb-4">Herramientas de Migración</h2>
          <p class="text-slate-400 mb-4">
            Si tienes usuarios registrados en Firebase Auth pero no aparecen en Firestore.
          </p>
          
          <NuxtLink 
            to="/admin-migrate-users"
            class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors inline-block cursor-pointer"
          >
            🔧 Migrar Usuarios de Auth a Firestore
          </NuxtLink>
        </div>

        <!-- Console Logs -->
        <div class="mb-8">
          <h2 class="text-xl font-bold text-white mb-4">Console Logs</h2>
          <div class="bg-slate-900 border border-slate-600 rounded-lg p-4 h-64 overflow-y-auto">
            <div v-if="logs.length === 0" class="text-slate-500 text-center py-8">
              No hay logs aún...
            </div>
            <div v-for="(log, index) in logs" :key="index" class="mb-2">
              <span 
                :class="{
                  'text-green-400': log.type === 'success',
                  'text-red-400': log.type === 'error',
                  'text-blue-400': log.type === 'info',
                  'text-slate-300': log.type === 'default'
                }"
                class="font-mono text-sm"
              >
                {{ log.message }}
              </span>
            </div>
          </div>
        </div>

        <!-- Exercises Preview -->
        <div v-if="exercises.length > 0" class="mb-8">
          <h2 class="text-xl font-bold text-white mb-4">Ejercicios Creados</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="exercise in exercises.slice(0, 6)" 
              :key="exercise.id"
              class="bg-slate-700/50 rounded-lg p-4"
            >
              <h3 class="font-bold text-white">{{ exercise.title }}</h3>
              <p class="text-slate-400 text-sm">{{ exercise.category }} • {{ exercise.difficulty }}</p>
              <p class="text-slate-300 text-sm mt-2">{{ exercise.description }}</p>
            </div>
          </div>
        </div>

        <!-- Workouts Preview -->
        <div v-if="workouts.length > 0" class="mb-8">
          <h2 class="text-xl font-bold text-white mb-4">Rutinas Creadas</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="workout in workouts.slice(0, 4)" 
              :key="workout.id"
              class="bg-slate-700/50 rounded-lg p-4"
            >
              <h3 class="font-bold text-white">{{ workout.title }}</h3>
              <p class="text-slate-400 text-sm">{{ workout.difficulty }} • {{ workout.estimatedDuration }} min</p>
              <p class="text-slate-300 text-sm mt-2">{{ workout.description }}</p>
              <p class="text-slate-500 text-xs mt-2">{{ workout.exercises.length }} ejercicios</p>
            </div>
          </div>
        </div>

        <!-- Back to Dashboard -->
        <div class="pt-8 border-t border-slate-700">
          <NuxtLink 
            to="/dashboard" 
            class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors inline-block"
          >
            ← Volver al Dashboard
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Require authentication to access this page -->
<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

import { seedDatabase } from '~/utils/seed-data'
import { addBulkExercises as createBulkExercises } from '~/utils/add-exercises'
import { useExercises, useWorkouts, type Exercise, type Workout } from '~/composables/firestore'

// Get current user
const { user } = useAuth()

// Reactive data
const exerciseCount = ref(0)
const workoutCount = ref(0)
const userCount = ref(0)
const isLoading = ref(false)
const isSeeding = ref(false)
const isAddingExercises = ref(false)
const logs = ref<{ message: string; type: string }[]>([])
const exercises = ref<Exercise[]>([])
const workouts = ref<Workout[]>([])

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

// Check database status
const checkDatabaseStatus = async () => {
  isLoading.value = true
  addLog('Verificando estado de la base de datos...', 'info')
  
  try {
    const { getExercises } = useExercises()
    const { getWorkoutsByCoach } = useWorkouts()
    
    // Get exercises
    const exerciseResult = await getExercises()
    if (exerciseResult.success && exerciseResult.exercises) {
      exercises.value = exerciseResult.exercises
      exerciseCount.value = exerciseResult.exercises.length
      addLog(`✅ Encontrados ${exerciseResult.exercises.length} ejercicios`, 'success')
    } else {
      addLog('❌ Error al obtener ejercicios', 'error')
      exercises.value = []
      exerciseCount.value = 0
    }
    
    // Get workouts (using demo coach id)
    const workoutResult = await getWorkoutsByCoach('demo-coach-id')
    if (workoutResult.success && workoutResult.workouts) {
      workouts.value = workoutResult.workouts
      workoutCount.value = workoutResult.workouts.length
      addLog(`✅ Encontradas ${workoutResult.workouts.length} rutinas`, 'success')
    } else {
      addLog(`❌ Error al obtener rutinas: ${workoutResult.error || 'Error desconocido'}`, 'error')
      addLog(`💡 Esto es normal si no hay rutinas creadas aún`, 'info')
      workouts.value = []
      workoutCount.value = 0
    }
    
    // For now, we'll set userCount to 0 since we don't have a direct way to count all users
    userCount.value = 0
    
    addLog('🔍 Verificación completada', 'info')
    
  } catch (error) {
    addLog(`❌ Error: ${error}`, 'error')
  } finally {
    isLoading.value = false
  }
}

// Execute seed
const executeSeed = async () => {
  isSeeding.value = true
  addLog('🌱 Iniciando seed de la base de datos...', 'info')
  
  try {
    const result = await seedDatabase()
    
    if (result.success) {
      addLog('🎉 Seed completado exitosamente!', 'success')
      // Refresh the data
      await checkDatabaseStatus()
    } else {
      addLog(`❌ Error en seed: ${result.error}`, 'error')
    }
  } catch (error) {
    addLog(`❌ Error ejecutando seed: ${error}`, 'error')
  } finally {
    isSeeding.value = false
  }
}

// Clear logs
const clearLogs = () => {
  logs.value = []
  addLog('🗑️ Logs limpiados', 'info')
}

// Add bulk exercises
const addBulkExercises = async () => {
  if (!user.value?.uid) {
    addLog('❌ Error: Usuario no autenticado. Por favor, inicia sesión primero.', 'error')
    addLog('💡 Tip: Haz click en "Iniciar Sesión" arriba para autenticarte.', 'info')
    return
  }

  isAddingExercises.value = true
  addLog('🏋️ Iniciando creación de ejercicios en lote...', 'info')
  addLog(`👤 Usuario autenticado: ${user.value.email}`, 'info')
  
  try {
    const result = await createBulkExercises(user.value.uid)
    
    addLog(`✅ Ejercicios creados exitosamente: ${result.successful}/${result.successful + result.failed}`, 'success')
    
    if (result.failed > 0) {
      addLog(`⚠️  Algunos ejercicios fallaron: ${result.failed}`, 'error')
    }
    
    // Refresh exercises count
    await checkDatabaseStatus()
    
  } catch (error) {
    addLog(`❌ Error creando ejercicios: ${error}`, 'error')
  } finally {
    isAddingExercises.value = false
  }
}

// Check status on mount
onMounted(() => {
  addLog('🚀 Panel de administración cargado', 'info')
  checkDatabaseStatus()
})
</script> 