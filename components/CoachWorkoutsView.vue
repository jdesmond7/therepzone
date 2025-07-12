<template>
  <div class="space-y-6">
    <!-- Create Workout Button -->
    <div class="flex justify-end">
      <button 
        @click="showCreateModal = true"
        class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
      >
        <UIcon name="i-heroicons-plus" class="w-5 h-5" />
        Crear Rutina
      </button>
    </div>

    <!-- Workouts Grid -->
    <div v-if="workouts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="workout in workouts" 
        :key="workout.id"
        class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-orange-500/50 transition-colors"
      >
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-bold text-white">{{ workout.title }}</h3>
            <span 
              :class="{
                'bg-green-500/20 text-green-400': workout.difficulty === 'principiante',
                'bg-yellow-500/20 text-yellow-400': workout.difficulty === 'intermedio',
                'bg-red-500/20 text-red-400': workout.difficulty === 'avanzado'
              }"
              class="px-2 py-1 rounded-full text-xs font-medium"
            >
              {{ workout.difficulty }}
            </span>
          </div>
          
          <div class="flex items-center gap-2 mb-3">
            <span class="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
              {{ workout.category }}
            </span>
            <span class="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
              {{ workout.estimatedDuration }} min
            </span>
          </div>

          <p class="text-slate-400 text-sm mb-3 line-clamp-2">{{ workout.description }}</p>
          
          <div class="mb-3">
            <p class="text-slate-400 text-xs mb-1">Ejercicios:</p>
            <p class="text-white font-medium">{{ workout.exercises.length }} ejercicios</p>
          </div>
        </div>

        <div class="flex gap-2">
          <button 
            @click="viewWorkout(workout)"
            class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm cursor-pointer"
          >
            Ver Detalles
          </button>
          <button 
            @click="editWorkout(workout)"
            class="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm cursor-pointer"
          >
            Editar
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="text-center py-12">
      <div class="text-6xl mb-4">💪</div>
      <h3 class="text-xl font-bold text-white mb-2">No tienes rutinas creadas</h3>
      <p class="text-slate-400 mb-6">Crea tu primera rutina de ejercicios para tus clientes</p>
      <button 
        @click="showCreateModal = true"
        class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors cursor-pointer"
      >
        Crear Primera Rutina
      </button>
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>

    <!-- Create Modal (Simplified) -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl">
        <h3 class="text-xl font-bold text-white mb-6">Crear Nueva Rutina</h3>
        
        <form @submit.prevent="saveWorkout" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-white mb-2">Nombre de la Rutina</label>
            <input
              v-model="workoutForm.title"
              type="text"
              autocomplete="off"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
              placeholder="Ej: Rutina de Pecho y Tríceps"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2">Descripción</label>
            <textarea
              v-model="workoutForm.description"
              rows="3"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
              placeholder="Descripción de la rutina..."
              required
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Categoría</label>
              <input
                v-model="workoutForm.category"
                type="text"
                autocomplete="off"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
                placeholder="Ej: Tren superior"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-white mb-2">Dificultad</label>
              <select
                v-model="workoutForm.difficulty"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                required
              >
                <option value="">Seleccionar dificultad</option>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2">Duración Estimada (minutos)</label>
            <input
              v-model.number="workoutForm.estimatedDuration"
              type="number"
              min="5"
              max="180"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
              placeholder="30"
              required
            />
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span v-if="isSaving">Guardando...</span>
              <span v-else>Crear Rutina</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Workout Details Modal -->
    <div v-if="selectedWorkout" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">{{ selectedWorkout.title }}</h3>
          <button 
            @click="selectedWorkout = null"
            class="text-slate-400 hover:text-white cursor-pointer"
          >
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <span 
              :class="{
                'bg-green-500/20 text-green-400': selectedWorkout.difficulty === 'principiante',
                'bg-yellow-500/20 text-yellow-400': selectedWorkout.difficulty === 'intermedio',
                'bg-red-500/20 text-red-400': selectedWorkout.difficulty === 'avanzado'
              }"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ selectedWorkout.difficulty }}
            </span>
            <span class="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
              {{ selectedWorkout.category }}
            </span>
            <span class="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
              {{ selectedWorkout.estimatedDuration }} min
            </span>
          </div>

          <div>
            <p class="text-slate-400 mb-2">Descripción:</p>
            <p class="text-white">{{ selectedWorkout.description }}</p>
          </div>

          <div>
            <p class="text-slate-400 mb-2">Ejercicios ({{ selectedWorkout.exercises.length }}):</p>
            <p class="text-slate-300 text-sm">
              Funcionalidad completa de ejercicios próximamente...
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkouts, type Workout } from '~/composables/firestore'

const { user } = useAuth()
const workouts = ref<Workout[]>([])
const isLoading = ref(true)
const showCreateModal = ref(false)
const selectedWorkout = ref<Workout | null>(null)
const isSaving = ref(false)

// Form data
const workoutForm = reactive({
  title: '',
  description: '',
  category: '',
  difficulty: '',
  estimatedDuration: 30,
  exercises: []
})

const loadWorkouts = async () => {
  console.log('🔄 Iniciando carga de rutinas...')
  console.log('👤 Usuario actual:', user.value?.uid)
  
  if (!user.value?.uid) {
    console.error('❌ No hay usuario autenticado')
    isLoading.value = false
    return
  }

  isLoading.value = true
  try {
    const { getWorkoutsByCoach } = useWorkouts()
    
    console.log('📋 Cargando rutinas del usuario...')
    // Get workouts created by the current user
    const userResult = await getWorkoutsByCoach(user.value.uid)
    console.log('✅ Resultado rutinas usuario:', userResult)
    
    console.log('📋 Cargando rutinas demo...')
    // Get demo workouts
    const demoResult = await getWorkoutsByCoach('demo-coach-id')
    console.log('✅ Resultado rutinas demo:', demoResult)
    
    // Combine both results
    const allWorkouts = []
    if (userResult.success && userResult.workouts) {
      allWorkouts.push(...userResult.workouts)
      console.log(`✅ Rutinas del usuario: ${userResult.workouts.length}`)
    } else {
      console.warn('⚠️ No se pudieron cargar las rutinas del usuario:', userResult.error)
    }
    
    if (demoResult.success && demoResult.workouts) {
      allWorkouts.push(...demoResult.workouts)
      console.log(`✅ Rutinas demo: ${demoResult.workouts.length}`)
    } else {
      console.warn('⚠️ No se pudieron cargar las rutinas demo:', demoResult.error)
    }
    
    workouts.value = allWorkouts
    
    console.log(`✅ Total rutinas cargadas: ${allWorkouts.length}`)
    
  } catch (error) {
    console.error('❌ Error crítico cargando rutinas:', error)
  } finally {
    console.log('🏁 Terminando carga de rutinas...')
    isLoading.value = false
  }
}

const resetForm = () => {
  workoutForm.title = ''
  workoutForm.description = ''
  workoutForm.category = ''
  workoutForm.difficulty = ''
  workoutForm.estimatedDuration = 30
  workoutForm.exercises = []
}

const saveWorkout = async () => {
  if (!user.value?.uid) return

  isSaving.value = true
  try {
    const { createWorkout } = useWorkouts()
    
    const workoutData = {
      ...workoutForm,
      difficulty: workoutForm.difficulty as 'principiante' | 'intermedio' | 'avanzado',
      createdBy: user.value.uid
    }

    const result = await createWorkout(workoutData)
    
    if (result.success) {
      closeModal()
      await loadWorkouts()
    }
  } catch (error) {
    console.error('Error saving workout:', error)
  } finally {
    isSaving.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  resetForm()
}

const viewWorkout = (workout: Workout) => {
  selectedWorkout.value = workout
}

const editWorkout = (workout: Workout) => {
  // TODO: Implement edit functionality
  console.log('Edit workout:', workout.title)
}

onMounted(() => {
  loadWorkouts()
})
</script> 