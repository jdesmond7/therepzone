<template>
  <div class="space-y-6">
    <!-- Data Table -->
    <DataTable
      :data="workouts"
      :columns="tableColumns"
      :items-per-page="10"
      @view="viewWorkout"
    >
      <!-- Additional Actions -->
      <template #actions>
        <AppButtonPrimary
          @click="showCreateModal = true"
          icon="i-heroicons-plus"
          class="w-full sm:w-auto"
        >
          Crear Rutina
        </AppButtonPrimary>
      </template>
      <!-- Custom cell templates -->
      <template #cell-title="{ item, value }">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-fire" class="w-5 h-5 text-white" />
          </div>
          <div>
            <div class="font-medium text-white">{{ value }}</div>
            <div class="text-xs text-slate-400 line-clamp-1">{{ item.description }}</div>
          </div>
        </div>
      </template>

      <template #cell-difficulty="{ value }">
        <span 
          :class="{
            'bg-green-500/20 text-green-400': value === 'principiante',
            'bg-yellow-500/20 text-yellow-400': value === 'intermedio',
            'bg-red-500/20 text-red-400': value === 'avanzado'
          }"
          class="px-2 py-1 rounded-full text-xs font-medium"
        >
          {{ value.charAt(0).toUpperCase() + value.slice(1) }}
        </span>
      </template>

      <template #cell-regionWorking="{ value }">
        <div class="flex flex-wrap gap-1">
          <span 
            v-for="region in value" 
            :key="region"
            class="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-medium"
          >
            {{ region.charAt(0).toUpperCase() + region.slice(1) }}
          </span>
        </div>
      </template>

      <template #cell-exercises="{ value }">
        <span class="text-white font-medium">{{ value.length }} ejercicios</span>
      </template>

      <template #cell-duration="{ value }">
        <span class="text-slate-300">{{ value }} min</span>
      </template>

      <!-- Grid view template -->
      <template #grid-item="{ items }">
        <div 
          v-for="workout in items" 
          :key="workout.id"
          class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-orange-500/50 transition-colors"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-fire" class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">{{ workout.title }}</h3>
                <p class="text-slate-400 text-sm">{{ workout.regionWorking.join(', ') }}</p>
              </div>
            </div>
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

          <p class="text-slate-400 text-sm mb-4 line-clamp-2">{{ workout.description }}</p>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-slate-400 text-sm">Ejercicios:</span>
              <span class="text-white font-medium">{{ workout.exercises.length }} ejercicios</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-slate-400 text-sm">Duración estimada:</span>
              <span class="text-white font-medium">{{ workout.estimatedDuration }} min</span>
            </div>
          </div>

          <div class="flex gap-2 mt-4">
            <AppButtonSecondary
              @click="viewWorkout(workout)"
              class="flex-1"
            >
              Ver Detalles
            </AppButtonSecondary>
            <AppButtonPrimary
              @click="editWorkout(workout)"
            >
              Editar
            </AppButtonPrimary>
          </div>
        </div>
      </template>
    </DataTable>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>

    <!-- Create Modal (Simplified) -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">Crear Nueva Rutina</h3>
          <button 
            @click="showCreateModal = false"
            class="text-slate-400 hover:text-white"
          >
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
                            <label class="block text-sm font-medium text-slate-400 mb-1">Nombre de la Rutina</label>
            <input
              v-model="workoutForm.title"
              type="text"
              class="w-full h-12 px-4 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
              placeholder="Ej: Rutina de Pecho y Tríceps"
            />
          </div>

          <div>
                            <label class="block text-sm font-medium text-slate-400 mb-1">Descripción</label>
            <textarea
              v-model="workoutForm.description"
              rows="3"
              class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 resize-none"
              placeholder="Describe la rutina..."
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                              <label class="block text-sm font-medium text-slate-400 mb-1">Región Trabajada</label>
              <select
                v-model="workoutForm.regionWorking"
                multiple
                class="w-full h-12 px-4 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
              >
                <option value="tren superior">Tren Superior</option>
                <option value="tren inferior">Tren Inferior</option>
                <option value="core">Core</option>
                <option value="full body">Full Body</option>
              </select>
            </div>

            <div>
                              <label class="block text-sm font-medium text-slate-400 mb-1">Dificultad</label>
              <select
                v-model="workoutForm.difficulty"
                class="w-full h-12 px-4 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
              >
                <option value="">Seleccionar dificultad</option>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>

            <div>
                              <label class="block text-sm font-medium text-slate-400 mb-1">Duración (min)</label>
              <input
                v-model.number="workoutForm.estimatedDuration"
                type="number"
                min="10"
                max="180"
                class="w-full h-12 px-4 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                placeholder="30"
              />
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <button 
              @click="saveWorkout"
              :disabled="isSaving"
              class="flex-1 h-12 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold px-4 rounded-lg transition-colors"
            >
              {{ isSaving ? 'Guardando...' : 'Crear Rutina' }}
            </button>
                          <button 
                @click="showCreateModal = false"
                class="flex-1 h-12 border border-slate-600 text-slate-400 hover:text-orange-400 hover:border-orange-400 font-bold px-4 rounded-lg transition-colors bg-transparent"
              >
                Cancelar
              </button>
          </div>
        </div>
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

        <div class="space-y-6">
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
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="region in selectedWorkout.regionWorking" 
                :key="region"
                class="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ region }}
              </span>
            </div>
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

          <div class="flex gap-4">
            <button 
              @click="editWorkout(selectedWorkout)"
                                class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 h-12 rounded-lg transition-colors"
            >
              Editar Rutina
            </button>
            <button 
              @click="deleteWorkout(selectedWorkout)"
                                class="bg-red-600 hover:bg-red-700 text-white font-bold px-6 h-12 rounded-lg transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkouts, type Workout } from '~/composables/firestore'
import DataTable from '~/components/DataTable.vue'

const { user } = useAuth()
const workouts = ref<Workout[]>([])
const isLoading = ref(true)
const showCreateModal = ref(false)
const selectedWorkout = ref<Workout | null>(null)
const isSaving = ref(false)

// Table columns configuration
const tableColumns = [
  {
    key: 'title',
    label: 'Rutina',
    sortable: true
  },
  {
    key: 'regionWorking',
    label: 'Región Trabajada',
    sortable: true,
    type: 'badge' as const
  },
  {
    key: 'difficulty',
    label: 'Dificultad',
    sortable: true,
    type: 'badge' as const
  },
  {
    key: 'exercises',
    label: 'Ejercicios',
    sortable: true,
    type: 'number' as const
  },
  {
    key: 'estimatedDuration',
    label: 'Duración',
    sortable: true,
    type: 'number' as const
  },
  {
    key: 'createdAt',
    label: 'Creada',
    sortable: true,
    type: 'date' as const,
    format: (value: any) => value ? new Date(value).toLocaleDateString('es-ES') : '-'
  }
]

// Form data
const workoutForm = reactive({
  title: '',
  description: '',
  regionWorking: [] as string[],
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
      console.log('[RUTINAS USUARIO RAW]', userResult.workouts)
    } else {
      console.warn('⚠️ No se pudieron cargar las rutinas del usuario:', userResult.error)
    }
    
    if (demoResult.success && demoResult.workouts) {
      allWorkouts.push(...demoResult.workouts)
      console.log('[RUTINAS DEMO RAW]', demoResult.workouts)
    } else {
      console.warn('⚠️ No se pudieron cargar las rutinas demo:', demoResult.error)
    }
    
    workouts.value = allWorkouts
    console.log('[RUTINAS TABLA]', workouts.value)
    
  } catch (error) {
    console.error('❌ Error cargando rutinas:', error)
  } finally {
    isLoading.value = false
  }
}

const saveWorkout = async () => {
  if (!user.value?.uid) return

  // Validate required fields
  if (!workoutForm.title.trim()) {
    alert('El nombre de la rutina es obligatorio')
    return
  }

  if (!workoutForm.regionWorking.length) {
    alert('La región trabajada es obligatoria')
    return
  }

  if (!workoutForm.difficulty) {
    alert('La dificultad es obligatoria')
    return
  }

  isSaving.value = true
  try {
    const { createWorkout } = useWorkouts()
    
    const workoutData = {
      ...workoutForm,
      difficulty: workoutForm.difficulty as 'principiante' | 'intermedio' | 'avanzado',
      createdBy: user.value.uid,
      coachId: user.value.uid
    }

    const result = await createWorkout(workoutData)
    
    if (result.success) {
      showCreateModal.value = false
      
      // Reset form
      workoutForm.title = ''
      workoutForm.description = ''
      workoutForm.regionWorking = []
      workoutForm.difficulty = ''
      workoutForm.estimatedDuration = 30
      workoutForm.exercises = []
      
      // Reload workouts
      await loadWorkouts()
      
      console.log('✅ Rutina creada exitosamente:', workoutForm.title)
    } else {
      console.error('Error creating workout:', result.error)
    }
  } catch (error) {
    console.error('Error saving workout:', error)
  } finally {
    isSaving.value = false
  }
}

const viewWorkout = (workout: Workout) => {
  selectedWorkout.value = workout
}

const editWorkout = (workout: Workout) => {
  // TODO: Implement edit workout functionality
  console.log('Edit workout:', workout.title)
}

const deleteWorkout = async (workout: Workout) => {
  if (!confirm(`¿Estás seguro de que quieres eliminar la rutina "${workout.title}"?`)) {
    return
  }

  try {
    // TODO: Implement delete workout functionality
    console.log('Delete workout:', workout.title)
    // const { deleteWorkout: deleteWorkoutFn } = useWorkouts()
    // const result = await deleteWorkoutFn(workout.id!)
    
    // if (result.success) {
    //   selectedWorkout.value = null
    //   await loadWorkouts()
    //   console.log('✅ Rutina eliminada exitosamente')
    // }
  } catch (error) {
    console.error('Error deleting workout:', error)
  }
}

onMounted(() => {
  loadWorkouts()
})

// Nuevo: watcher para cargar rutinas cuando el usuario esté listo
watch(
  () => user.value?.uid,
  (uid) => {
    if (uid) loadWorkouts()
  },
  { immediate: true }
)
</script> 