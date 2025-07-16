<template>
  <div class="min-h-screen bg-slate-900 text-white p-6">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Migración de Campos de Base de Datos</h1>
        <p class="text-slate-400">
          Esta página permite migrar los campos existentes de ejercicios y rutinas a la nueva estructura de base de datos.
        </p>
      </div>

      <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
        <h2 class="text-xl font-bold text-white mb-4">Cambios en la Estructura</h2>
        
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-orange-400 mb-2">Ejercicios</h3>
            <ul class="text-slate-300 space-y-1 ml-4">
              <li>• <code class="bg-slate-700 px-2 py-1 rounded">category</code> → <code class="bg-slate-700 px-2 py-1 rounded">muscularGroup</code></li>
              <li>• <code class="bg-slate-700 px-2 py-1 rounded">muscleGroups</code> → <code class="bg-slate-700 px-2 py-1 rounded">primaryMuscleWorking</code></li>
              <li>• Nuevo campo: <code class="bg-slate-700 px-2 py-1 rounded">secondaryMuscleWorking</code></li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-orange-400 mb-2">Rutinas</h3>
            <ul class="text-slate-300 space-y-1 ml-4">
              <li>• <code class="bg-slate-700 px-2 py-1 rounded">category</code> → <code class="bg-slate-700 px-2 py-1 rounded">regionWorking</code></li>
              <li>• <code class="bg-slate-700 px-2 py-1 rounded">regionWorking</code> se calcula automáticamente basado en los ejercicios</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
        <h2 class="text-xl font-bold text-white mb-4">Estado de la Migración</h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-slate-300">Ejercicios migrados:</span>
            <span class="font-bold text-white">{{ migrationStats.exercises.migrated }}/{{ migrationStats.exercises.total }}</span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-slate-300">Rutinas migradas:</span>
            <span class="font-bold text-white">{{ migrationStats.workouts.migrated }}/{{ migrationStats.workouts.total }}</span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-slate-300">Errores:</span>
            <span class="font-bold text-red-400">{{ migrationStats.errors }}</span>
          </div>
        </div>
      </div>

      <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
        <h2 class="text-xl font-bold text-white mb-4">Acciones</h2>
        
        <div class="space-y-4">
          <div class="flex gap-4">
            <AppButtonPrimary
              @click="runExerciseMigration"
              :disabled="isMigrating"
              icon="i-heroicons-arrow-path"
            >
              {{ isMigrating ? 'Migrando Ejercicios...' : 'Migrar Ejercicios' }}
            </AppButtonPrimary>
            
            <AppButtonPrimary
              @click="runWorkoutMigration"
              :disabled="isMigrating"
              icon="i-heroicons-arrow-path"
            >
              {{ isMigrating ? 'Migrando Rutinas...' : 'Migrar Rutinas' }}
            </AppButtonPrimary>
            
            <AppButtonPrimary
              @click="runFullMigration"
              :disabled="isMigrating"
              icon="i-heroicons-arrow-path"
            >
              {{ isMigrating ? 'Migrando Todo...' : 'Migrar Todo' }}
            </AppButtonPrimary>
          </div>
          
          <div class="flex gap-4">
            <AppButtonSecondary
              @click="checkMigrationStatus"
              :disabled="isChecking"
              icon="i-heroicons-magnifying-glass"
            >
              {{ isChecking ? 'Verificando...' : 'Verificar Estado' }}
            </AppButtonSecondary>
            
            <AppButtonSecondary
              @click="checkAuthentication"
              icon="i-heroicons-user"
            >
              Verificar Autenticación
            </AppButtonSecondary>
            
            <AppButtonSecondary
              @click="goToLogin"
              icon="i-heroicons-arrow-right"
            >
              Ir al Login
            </AppButtonSecondary>
            
            <AppButtonSecondary
              @click="refreshPage"
              icon="i-heroicons-arrow-path"
            >
              Refrescar Página
            </AppButtonSecondary>
            
            <AppButtonDestructive
              @click="cleanupOldFields"
              :disabled="isMigrating"
              icon="i-heroicons-trash"
            >
              {{ isMigrating ? 'Limpiando...' : 'Limpiar Campos Antiguos' }}
            </AppButtonDestructive>
            
            <AppButtonPrimary
              @click="runAdditionalMigration"
              :disabled="isMigrating"
              icon="i-heroicons-arrow-path"
            >
              {{ isMigrating ? 'Migrando...' : 'Migración Adicional' }}
            </AppButtonPrimary>
            
            <AppButtonDestructive
              @click="finalCleanup"
              :disabled="isMigrating"
              icon="i-heroicons-trash"
            >
              {{ isMigrating ? 'Limpiando...' : 'Limpieza Final' }}
            </AppButtonDestructive>
          </div>
        </div>
      </div>

      <!-- Migration Log -->
      <div v-if="migrationLog.length > 0" class="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 class="text-xl font-bold text-white mb-4">Log de Migración</h2>
        
        <div class="bg-slate-900 rounded-lg p-4 max-h-96 overflow-y-auto">
          <div v-for="(log, index) in migrationLog" :key="index" class="text-sm mb-1">
            <span class="text-slate-400">{{ log.timestamp }}</span>
            <span :class="getLogClass(log.type)">{{ log.message }}</span>
          </div>
        </div>
        
        <div class="mt-4">
          <AppButtonSecondary
            @click="clearLog"
            icon="i-heroicons-trash"
          >
            Limpiar Log
          </AppButtonSecondary>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExercises, useWorkouts } from '~/composables/firestore'
import { getFirebaseDb, getFirebaseAuth } from '~/composables/firebase'
import { collection, getDocs, updateDoc, doc, query, where, getDoc, deleteField } from 'firebase/firestore'

const isMigrating = ref(false)
const isChecking = ref(false)
const migrationLog = ref<Array<{timestamp: string, type: 'info' | 'success' | 'error', message: string}>>([])
const migrationStats = reactive({
  exercises: { migrated: 0, total: 0 },
  workouts: { migrated: 0, total: 0 },
  errors: 0
})

const addLog = (type: 'info' | 'success' | 'error', message: string) => {
  migrationLog.value.push({
    timestamp: new Date().toLocaleTimeString(),
    type,
    message
  })
}

const getLogClass = (type: 'info' | 'success' | 'error') => {
  switch (type) {
    case 'success': return 'text-green-400'
    case 'error': return 'text-red-400'
    default: return 'text-white'
  }
}

const clearLog = () => {
  migrationLog.value = []
}

const checkAuthentication = async () => {
  const { user, isLoggedIn } = useAuth()
  
  // Wait a bit for Firebase auth to be ready
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  addLog('info', `Estado de autenticación - isLoggedIn: ${isLoggedIn.value}`)
  addLog('info', `Usuario: ${user.value ? 'Presente' : 'No presente'}`)
  
  if (user.value) {
    addLog('success', `✅ Autenticado como: ${user.value.email}`)
    addLog('info', `UID: ${user.value.uid}`)
    addLog('info', `Email verificado: ${user.value.emailVerified}`)
  } else {
    addLog('error', '❌ No estás autenticado. Por favor inicia sesión primero.')
    addLog('info', '💡 Intenta refrescar la página o ir al login y regresar')
  }
}

const checkMigrationStatus = async () => {
  isChecking.value = true
  addLog('info', 'Verificando estado de la migración...')
  
  try {
    // Check authentication first with a delay
    const { user } = useAuth()
    
    // Wait for Firebase auth to be ready
    let attempts = 0
    while (!user.value && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 500))
      attempts++
    }
    
    if (!user.value) {
      addLog('error', 'No estás autenticado. Por favor inicia sesión primero.')
      return
    }
    
    addLog('info', `Usuario autenticado para verificación: ${user.value.email}`)
    
    // Check exercises
    const { getExercises } = useExercises()
    const exercisesResult = await getExercises()
    
    if (exercisesResult.success && exercisesResult.exercises) {
      const totalExercises = exercisesResult.exercises.length
      const migratedExercises = exercisesResult.exercises.filter(e => 
        e.muscularGroup && e.primaryMuscleWorking && e.secondaryMuscleWorking
      ).length
      
      migrationStats.exercises.total = totalExercises
      migrationStats.exercises.migrated = migratedExercises
      
      addLog('info', `Ejercicios: ${migratedExercises}/${totalExercises} migrados`)
    }
    
    // Check workouts
    const { getWorkoutsByCoach } = useWorkouts()
    const workoutsResult = await getWorkoutsByCoach('demo-coach-id')
    
    if (workoutsResult.success && workoutsResult.workouts) {
      const totalWorkouts = workoutsResult.workouts.length
      const migratedWorkouts = workoutsResult.workouts.filter(w => 
        w.regionWorking && Array.isArray(w.regionWorking)
      ).length
      
      migrationStats.workouts.total = totalWorkouts
      migrationStats.workouts.migrated = migratedWorkouts
      
      addLog('info', `Rutinas: ${migratedWorkouts}/${totalWorkouts} migradas`)
    }
    
    addLog('success', 'Verificación completada')
    
  } catch (error) {
    addLog('error', `Error verificando estado: ${error}`)
  } finally {
    isChecking.value = false
  }
}

const migrateExerciseFields = async () => {
  addLog('info', 'Iniciando migración de ejercicios...')
  
  try {
    // Check authentication first with wait
    const user = await waitForAuth()
    if (!user) {
      addLog('error', 'No estás autenticado. Por favor inicia sesión primero.')
      return { migratedCount: 0, errorCount: 1, total: 0 }
    }
    
    addLog('info', `Usuario autenticado: ${user.email}`)
    
    const db = getFirebaseDb()
    if (!db) {
      addLog('error', 'No se pudo conectar a Firebase')
      return { migratedCount: 0, errorCount: 1, total: 0 }
    }

    const exercisesCollection = collection(db, 'exercises')
    const querySnapshot = await getDocs(exercisesCollection)
    
    addLog('info', `Encontrados ${querySnapshot.size} ejercicios para migrar`)
    
    let migratedCount = 0
    let errorCount = 0
    
    for (const docSnapshot of querySnapshot.docs) {
      const exerciseData = docSnapshot.data()
      const exerciseId = docSnapshot.id
      
      addLog('info', `Migrando ejercicio: ${exerciseData.title || exerciseId}`)
      
      try {
        const updates: any = {}
        
        // Migrate category to muscularGroup
        if (exerciseData.category && !exerciseData.muscularGroup) {
          const categoryMapping: Record<string, string> = {
            'pecho': 'tren superior',
            'espalda': 'tren superior', 
            'hombros': 'tren superior',
            'brazos': 'tren superior',
            'piernas': 'tren inferior',
            'core': 'core',
            'abdominales': 'core',
            'lumbares': 'core'
          }
          
          updates.muscularGroup = categoryMapping[exerciseData.category] || 'tren superior'
          addLog('info', `  Mapeado category "${exerciseData.category}" a muscularGroup "${updates.muscularGroup}"`)
        }
        
        // Migrate muscleGroups to primaryMuscleWorking
        if (exerciseData.muscleGroups && !exerciseData.primaryMuscleWorking) {
          updates.primaryMuscleWorking = exerciseData.muscleGroups
          addLog('info', `  Mapeado muscleGroups a primaryMuscleWorking: ${exerciseData.muscleGroups.join(', ')}`)
        }
        
        // Add empty secondaryMuscleWorking if not exists
        if (!exerciseData.secondaryMuscleWorking) {
          updates.secondaryMuscleWorking = []
          addLog('info', `  Agregado array vacío secondaryMuscleWorking`)
        }
        
        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
          const exerciseRef = doc(db, 'exercises', exerciseId)
          await updateDoc(exerciseRef, updates)
          migratedCount++
          addLog('success', `  Ejercicio migrado exitosamente: ${exerciseData.title || exerciseId}`)
        } else {
          addLog('info', `  No se necesitan cambios para: ${exerciseData.title || exerciseId}`)
        }
        
      } catch (error) {
        errorCount++
        addLog('error', `  Error migrando ejercicio ${exerciseData.title || exerciseId}: ${error}`)
      }
    }
    
    addLog('success', `Migración de ejercicios completada: ${migratedCount} migrados, ${errorCount} errores`)
    return { migratedCount, errorCount, total: querySnapshot.size }
    
  } catch (error) {
    addLog('error', `Error en migración de ejercicios: ${error}`)
    return { migratedCount: 0, errorCount: 1, total: 0 }
  }
}

const migrateWorkoutFields = async () => {
  addLog('info', 'Iniciando migración de rutinas...')
  
  try {
    // Check authentication first with wait
    const user = await waitForAuth()
    if (!user) {
      addLog('error', 'No estás autenticado. Por favor inicia sesión primero.')
      return { migratedCount: 0, errorCount: 1, total: 0 }
    }
    
    // Get the correct UID from Firebase Auth
    const auth = getFirebaseAuth()
    const firebaseUser = auth?.currentUser
    const uid = firebaseUser?.uid || user.uid
    
    addLog('info', `Usuario autenticado: ${user.email}`)
    addLog('info', `UID del usuario: ${uid}`)
    addLog('info', `Firebase Auth UID: ${firebaseUser?.uid || 'No disponible'}`)
    
    // Check user role
    try {
      const { userProfile, ensureProfileLoaded } = useUserRole()
      await ensureProfileLoaded()
      addLog('info', `Rol del usuario: ${userProfile.value?.role || 'No disponible'}`)
    } catch (roleError) {
      addLog('error', `Error obteniendo rol: ${roleError}`)
    }
    
    const db = getFirebaseDb()
    if (!db) {
      addLog('error', 'No se pudo conectar a Firebase')
      addLog('info', 'Verificando configuración de Firebase...')
      
      // Try to get auth to see if Firebase is initialized
      if (!auth) {
        addLog('error', 'Firebase Auth no está inicializado')
      } else {
        addLog('info', 'Firebase Auth está inicializado')
      }
      
      return { migratedCount: 0, errorCount: 1, total: 0 }
    }
    
    addLog('info', '✅ Firebase Firestore conectado correctamente')

    const workoutsCollection = collection(db, 'workouts')
    addLog('info', `Buscando rutinas para usuario: ${uid}`)
    
    let querySnapshot
    try {
      addLog('info', 'Intentando leer colección de rutinas...')
      
      // Try to get all workouts first (this should work with the new list rule)
      // Add a limit to make the query more specific
      const q = query(workoutsCollection, where('createdBy', '==', uid))
      querySnapshot = await getDocs(q)
      
      addLog('info', `✅ Colección leída exitosamente: ${querySnapshot.size} documentos encontrados`)
      
      if (querySnapshot.size === 0) {
        addLog('info', 'No hay rutinas para migrar - el usuario no tiene rutinas creadas')
        return { migratedCount: 0, errorCount: 0, total: 0 }
      }
    } catch (queryError: any) {
      addLog('error', `Error al consultar rutinas: ${queryError}`)
      addLog('error', `Código de error: ${queryError.code}`)
      addLog('error', `Mensaje completo: ${queryError.message}`)
      throw queryError
    }
    
    let migratedCount = 0
    let errorCount = 0
    
    for (const docSnapshot of querySnapshot.docs) {
      const workoutData = docSnapshot.data() as any
      const workoutId = docSnapshot.id
      
      addLog('info', `Migrando rutina: ${workoutData.title || workoutId}`)
      
      try {
        const updates: any = {}
        
        // Migrate category to regionWorking
        if (workoutData.category && !workoutData.regionWorking) {
          const categoryMapping: Record<string, string[]> = {
            'fuerza': ['tren superior'],
            'cardio': ['full body'],
            'flexibilidad': ['full body'],
            'funcional': ['full body'],
            'balance': ['core'],
            'resistencia': ['full body']
          }
          
          updates.regionWorking = categoryMapping[workoutData.category] || ['full body']
          addLog('info', `  Mapeado category "${workoutData.category}" a regionWorking: ${updates.regionWorking.join(', ')}`)
        }
        
        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
          const workoutRef = doc(db, 'workouts', workoutId)
          await updateDoc(workoutRef, updates)
          migratedCount++
          addLog('success', `  Rutina migrada exitosamente: ${workoutData.title || workoutId}`)
        } else {
          addLog('info', `  No se necesitan cambios para: ${workoutData.title || workoutId}`)
        }
        
      } catch (error) {
        errorCount++
        addLog('error', `  Error migrando rutina ${workoutData.title || workoutId}: ${error}`)
      }
    }
    
    addLog('success', `Migración de rutinas completada: ${migratedCount} migradas, ${errorCount} errores`)
    return { migratedCount, errorCount, total: querySnapshot.size }
    
  } catch (error) {
    addLog('error', `Error en migración de rutinas: ${error}`)
    return { migratedCount: 0, errorCount: 1, total: 0 }
  }
}

const runExerciseMigration = async () => {
  isMigrating.value = true
  addLog('info', 'Iniciando migración de ejercicios...')
  
  try {
    const results = await migrateExerciseFields()
    migrationStats.exercises.migrated = results.migratedCount
    migrationStats.exercises.total = results.total
    migrationStats.errors += results.errorCount
    
    await checkMigrationStatus()
  } catch (error) {
    addLog('error', `Error en migración de ejercicios: ${error}`)
  } finally {
    isMigrating.value = false
  }
}

const runWorkoutMigration = async () => {
  isMigrating.value = true
  addLog('info', 'Iniciando migración de rutinas...')
  
  try {
    const results = await migrateWorkoutFields()
    migrationStats.workouts.migrated = results.migratedCount
    migrationStats.workouts.total = results.total
    migrationStats.errors += results.errorCount
    
    await checkMigrationStatus()
  } catch (error) {
    addLog('error', `Error en migración de rutinas: ${error}`)
  } finally {
    isMigrating.value = false
  }
}

const runFullMigration = async () => {
  isMigrating.value = true
  addLog('info', 'Iniciando migración completa...')
  
  try {
    await runExerciseMigration()
    await runWorkoutMigration()
    addLog('success', 'Migración completa finalizada')
  } catch (error) {
    addLog('error', `Error en migración completa: ${error}`)
  } finally {
    isMigrating.value = false
  }
}

const runAdditionalMigration = async () => {
  isMigrating.value = true
  addLog('info', '🔄 Iniciando migración adicional...')
  
  try {
    const user = await waitForAuth()
    if (!user) {
      addLog('error', 'No estás autenticado. Por favor inicia sesión primero.')
      return
    }
    
    const db = getFirebaseDb()
    if (!db) {
      addLog('error', 'No se pudo conectar a Firebase')
      return
    }
    
    // Step 1: Rename muscularGroup to regionWorking in exercises
    addLog('info', 'Paso 1: Renombrando muscularGroup a regionWorking en ejercicios...')
    const exercisesCollection = collection(db, 'exercises')
    const exercisesSnapshot = await getDocs(exercisesCollection)
    
    let exerciseUpdates = 0
    for (const docSnapshot of exercisesSnapshot.docs) {
      const exerciseData = docSnapshot.data() as any
      const updates: any = {}
      
      // Rename muscularGroup to regionWorking
      if (exerciseData.muscularGroup && !exerciseData.regionWorking) {
        updates.regionWorking = exerciseData.muscularGroup
        updates.muscularGroup = null // Remove old field
        addLog('info', `  Renombrando muscularGroup a regionWorking: ${exerciseData.title || docSnapshot.id}`)
      }
      
      if (Object.keys(updates).length > 0) {
        const exerciseRef = doc(db, 'exercises', docSnapshot.id)
        await updateDoc(exerciseRef, updates)
        exerciseUpdates++
      }
    }
    
    addLog('success', `✅ Ejercicios actualizados: ${exerciseUpdates}`)
    
    // Step 2: Update workouts with automatic difficulty and regionWorking
    addLog('info', 'Paso 2: Actualizando rutinas con dificultad automática...')
    const workoutsCollection = collection(db, 'workouts')
    const workoutsSnapshot = await getDocs(workoutsCollection)
    
    let workoutUpdates = 0
    for (const docSnapshot of workoutsSnapshot.docs) {
      const workoutData = docSnapshot.data() as any
      const updates: any = {}
      
      // Calculate automatic difficulty based on exercises
      if (workoutData.exercises && Array.isArray(workoutData.exercises)) {
        const difficultyLevels = ['principiante', 'intermedio', 'avanzado']
        let maxDifficultyIndex = 0
        
        // Get difficulty from each exercise
        for (const exerciseId of workoutData.exercises) {
          try {
            const exerciseRef = doc(db, 'exercises', exerciseId)
            const exerciseDoc = await getDoc(exerciseRef)
            if (exerciseDoc.exists()) {
              const exerciseData = exerciseDoc.data()
              const difficultyIndex = difficultyLevels.indexOf(exerciseData.difficulty || 'principiante')
              if (difficultyIndex > maxDifficultyIndex) {
                maxDifficultyIndex = difficultyIndex
              }
            }
          } catch (error) {
            addLog('info', `  No se pudo obtener ejercicio ${exerciseId}: ${error}`)
          }
        }
        
        const calculatedDifficulty = difficultyLevels[maxDifficultyIndex]
        if (calculatedDifficulty !== workoutData.difficulty) {
          updates.difficulty = calculatedDifficulty
          addLog('info', `  Calculando dificultad para rutina: ${workoutData.title || docSnapshot.id} -> ${calculatedDifficulty}`)
        }
      }
      
      // Recalculate regionWorking based on exercises
      if (workoutData.exercises && Array.isArray(workoutData.exercises)) {
        const regions = new Set<string>()
        let hasCore = false
        
        // Get regions from each exercise
        for (const exerciseId of workoutData.exercises) {
          try {
            const exerciseRef = doc(db, 'exercises', exerciseId)
            const exerciseDoc = await getDoc(exerciseRef)
            if (exerciseDoc.exists()) {
              const exerciseData = exerciseDoc.data()
              if (exerciseData.regionWorking) {
                if (exerciseData.regionWorking === 'Core') {
                  hasCore = true
                } else {
                  regions.add(exerciseData.regionWorking)
                }
              }
            }
          } catch (error) {
            addLog('info', `  No se pudo obtener ejercicio ${exerciseId}: ${error}`)
          }
        }
        
        // Calculate final regionWorking
        let finalRegions: string[] = []
        if (regions.size === 1) {
          finalRegions = [Array.from(regions)[0]]
        } else if (regions.size > 1) {
          finalRegions = ['Full Body']
        }
        
        if (hasCore) {
          finalRegions.push('Core')
        }
        
        if (finalRegions.length > 0) {
          updates.regionWorking = finalRegions
          addLog('info', `  Calculando regiones para rutina: ${workoutData.title || docSnapshot.id} -> ${finalRegions.join(', ')}`)
        }
      }
      
      if (Object.keys(updates).length > 0) {
        const workoutRef = doc(db, 'workouts', docSnapshot.id)
        await updateDoc(workoutRef, updates)
        workoutUpdates++
      }
    }
    
    addLog('success', `✅ Rutinas actualizadas: ${workoutUpdates}`)
    addLog('success', '🎉 Migración adicional completada exitosamente')
    
  } catch (error) {
    addLog('error', `❌ Error en migración adicional: ${error}`)
  } finally {
    isMigrating.value = false
  }
}

const goToLogin = () => {
  navigateTo('/login')
}

const refreshPage = () => {
  window.location.reload()
}

const waitForAuth = async () => {
  // Try Nuxt Auth first
  const { user } = useAuth()
  let attempts = 0
  const maxAttempts = 20 // 10 seconds total
  
  while (!user.value && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 500))
    attempts++
  }
  
  // If Nuxt Auth doesn't work, try Firebase Auth directly
  if (!user.value) {
    const auth = getFirebaseAuth()
    if (auth?.currentUser) {
      return auth.currentUser
    }
  }
  
  return user.value
}

const cleanupOldFields = async () => {
  isMigrating.value = true
  addLog('info', '🔄 Iniciando limpieza de campos antiguos...')
  
  try {
    const user = await waitForAuth()
    if (!user) {
      addLog('error', 'No estás autenticado. Por favor inicia sesión primero.')
      return
    }
    
    const db = getFirebaseDb()
    if (!db) {
      addLog('error', 'No se pudo conectar a Firebase')
      return
    }
    
    // Clean up exercises
    addLog('info', 'Limpiando campos antiguos de ejercicios...')
    const exercisesCollection = collection(db, 'exercises')
    const exercisesSnapshot = await getDocs(exercisesCollection)
    
    let exerciseCleanupCount = 0
    for (const docSnapshot of exercisesSnapshot.docs) {
      const exerciseData = docSnapshot.data() as any
      const updates: any = {}
      
      // Remove old fields if new ones exist
      if (exerciseData.muscularGroup && exerciseData.category) {
        updates.category = null
        addLog('info', `  Removiendo 'category' de ejercicio: ${exerciseData.title || docSnapshot.id}`)
      }
      
      if (exerciseData.primaryMuscleWorking && exerciseData.muscleGroups) {
        updates.muscleGroups = null
        addLog('info', `  Removiendo 'muscleGroups' de ejercicio: ${exerciseData.title || docSnapshot.id}`)
      }
      
      if (Object.keys(updates).length > 0) {
        const exerciseRef = doc(db, 'exercises', docSnapshot.id)
        await updateDoc(exerciseRef, updates)
        exerciseCleanupCount++
      }
    }
    
    addLog('success', `✅ Limpieza de ejercicios completada: ${exerciseCleanupCount} actualizados`)
    
    // Clean up workouts
    addLog('info', 'Limpiando campos antiguos de rutinas...')
    const workoutsCollection = collection(db, 'workouts')
    const workoutsSnapshot = await getDocs(workoutsCollection)
    
    let workoutCleanupCount = 0
    for (const docSnapshot of workoutsSnapshot.docs) {
      const workoutData = docSnapshot.data() as any
      const updates: any = {}
      
      // Remove old fields if new ones exist
      if (workoutData.regionWorking && workoutData.category) {
        updates.category = null
        addLog('info', `  Removiendo 'category' de rutina: ${workoutData.title || docSnapshot.id}`)
      }
      
      if (Object.keys(updates).length > 0) {
        const workoutRef = doc(db, 'workouts', docSnapshot.id)
        await updateDoc(workoutRef, updates)
        workoutCleanupCount++
      }
    }
    
    addLog('success', `✅ Limpieza de rutinas completada: ${workoutCleanupCount} actualizadas`)
    addLog('success', '🎉 Limpieza de campos antiguos completada exitosamente')
    
  } catch (error) {
    addLog('error', `❌ Error en limpieza: ${error}`)
  } finally {
    isMigrating.value = false
  }
}

const finalCleanup = async () => {
  isMigrating.value = true
  addLog('info', '🗑️ Iniciando limpieza final (eliminación completa de campos)...')
  
  try {
    const user = await waitForAuth()
    if (!user) {
      addLog('error', 'No estás autenticado. Por favor inicia sesión primero.')
      return
    }
    
    const db = getFirebaseDb()
    if (!db) {
      addLog('error', 'No se pudo conectar a Firebase')
      return
    }
    
    // Clean up exercises - completely remove old fields
    addLog('info', 'Limpiando campos antiguos de ejercicios (eliminación completa)...')
    const exercisesCollection = collection(db, 'exercises')
    const exercisesSnapshot = await getDocs(exercisesCollection)
    
    let exerciseCleanupCount = 0
    for (const docSnapshot of exercisesSnapshot.docs) {
      const exerciseData = docSnapshot.data() as any
      const updates: any = {}
      
      // Completely remove old fields if they exist
      if (exerciseData.category !== undefined) {
        updates.category = deleteField()
        addLog('info', `  Eliminando completamente 'category' de ejercicio: ${exerciseData.title || docSnapshot.id}`)
      }
      
      if (exerciseData.muscleGroups !== undefined) {
        updates.muscleGroups = deleteField()
        addLog('info', `  Eliminando completamente 'muscleGroups' de ejercicio: ${exerciseData.title || docSnapshot.id}`)
      }
      
      if (exerciseData.muscularGroup !== undefined) {
        updates.muscularGroup = deleteField()
        addLog('info', `  Eliminando completamente 'muscularGroup' de ejercicio: ${exerciseData.title || docSnapshot.id}`)
      }
      
      if (Object.keys(updates).length > 0) {
        const exerciseRef = doc(db, 'exercises', docSnapshot.id)
        await updateDoc(exerciseRef, updates)
        exerciseCleanupCount++
      }
    }
    
    addLog('success', `✅ Limpieza final de ejercicios completada: ${exerciseCleanupCount} actualizados`)
    
    // Clean up workouts - completely remove old fields
    addLog('info', 'Limpiando campos antiguos de rutinas (eliminación completa)...')
    const workoutsCollection = collection(db, 'workouts')
    const workoutsSnapshot = await getDocs(workoutsCollection)
    
    let workoutCleanupCount = 0
    for (const docSnapshot of workoutsSnapshot.docs) {
      const workoutData = docSnapshot.data() as any
      const updates: any = {}
      
      // Completely remove old fields if they exist
      if (workoutData.category !== undefined) {
        updates.category = deleteField()
        addLog('info', `  Eliminando completamente 'category' de rutina: ${workoutData.title || docSnapshot.id}`)
      }
      
      if (Object.keys(updates).length > 0) {
        const workoutRef = doc(db, 'workouts', docSnapshot.id)
        await updateDoc(workoutRef, updates)
        workoutCleanupCount++
      }
    }
    
    addLog('success', `✅ Limpieza final de rutinas completada: ${workoutCleanupCount} actualizadas`)
    addLog('success', '🎉 Limpieza final completada exitosamente - Base de datos completamente limpia')
    
  } catch (error) {
    addLog('error', `❌ Error en limpieza final: ${error}`)
  } finally {
    isMigrating.value = false
  }
}

onMounted(async () => {
  addLog('info', '🔄 Inicializando página de migración...')
  
  // Wait for authentication to be ready
  const user = await waitForAuth()
  
  if (user) {
    addLog('success', `✅ Página cargada - Usuario autenticado: ${user.email}`)
  } else {
    addLog('info', '⏳ No se detectó usuario autenticado después de 10 segundos')
  }
  
  checkMigrationStatus()
})
</script> 