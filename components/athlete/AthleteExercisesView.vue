<template>
  <div class="space-y-6">
    <DataTable
      :data="filteredExercises"
      :columns="tableColumns"
      :items-per-page="12"
      @view="viewExercise"
    >
      <!-- Filters -->
      <template #filters>
        <div class="w-full sm:w-[260px]">
          <CustomMultiSelect
            v-model="selectedRegions"
            :options="regionOptions"
            placeholder="Filtrar por región trabajada"
            @update:model-value="filterExercises"
          />
        </div>
        <div class="w-full sm:w-[260px]">
          <CustomSelect
            v-model="selectedDifficulty"
            :options="difficultyOptions"
            placeholder="Filtrar por dificultades"
            @update:model-value="filterExercises"
          />
        </div>
      </template>
      
      <!-- Custom cell templates -->
      <template #cell-title="{ item, value }">
        <div class="flex items-center gap-3">
          <div 
            v-if="item.photo || item.photoUrl"
            class="w-10 h-10 rounded-lg bg-cover bg-center flex-shrink-0"
            :style="{ backgroundImage: `url(${item.photo || item.photoUrl})` }"
          ></div>
          <div v-else class="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-academic-cap" class="w-5 h-5 text-slate-400" />
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
        <span class="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
          {{ value.charAt(0).toUpperCase() + value.slice(1) }}
        </span>
      </template>

      <template #cell-primaryMuscleWorking="{ value }">
        <DynamicBadges :items="value" />
      </template>

      <template #cell-secondaryMuscleWorking="{ value }">
        <DynamicBadges :items="value" variant="secondary" />
      </template>

      <!-- Grid view template -->
      <template #grid-item="{ items }">
        <div 
          v-for="exercise in items" 
          :key="exercise.id"
          @click="viewExercise(exercise)"
          class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden hover:border-orange-500/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer w-full group"
        >
          <!-- Exercise Image -->
          <div 
            v-if="exercise.photo || exercise.photoUrl" 
            class="h-48 bg-cover bg-center relative group-hover:scale-105 transition-transform duration-300"
            :style="{ backgroundImage: `url(${exercise.photo || exercise.photoUrl})` }"
          >
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
            <span 
              :class="{
                'bg-green-500/90 text-green-100': exercise.difficulty === 'principiante',
                'bg-yellow-500/90 text-yellow-100': exercise.difficulty === 'intermedio',
                'bg-red-500/90 text-red-100': exercise.difficulty === 'avanzado'
              }"
              class="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
            >
              {{ exercise.difficulty }}
            </span>
          </div>
          
          <!-- Content -->
          <div class="p-6">
            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">{{ exercise.title }}</h3>
                <span 
                  v-if="!exercise.photo && !exercise.photoUrl"
                  :class="{
                    'bg-green-500/20 text-green-400': exercise.difficulty === 'principiante',
                    'bg-yellow-500/20 text-yellow-400': exercise.difficulty === 'intermedio',
                    'bg-red-500/20 text-red-400': exercise.difficulty === 'avanzado'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ exercise.difficulty }}
                </span>
              </div>
              
              <div class="flex items-center gap-2 mb-3">
                <span class="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
                  {{ exercise.regionWorking.charAt(0).toUpperCase() + exercise.regionWorking.slice(1) }}
                </span>
              </div>

              <p class="text-slate-400 text-sm mb-3 line-clamp-2">{{ exercise.description }}</p>
              
              <div class="mb-3">
                <p class="text-slate-400 text-xs mb-1">Músculos primarios:</p>
                <DynamicBadges :items="exercise.primaryMuscleWorking" />
              </div>
              
              <div class="mb-3" v-if="exercise.secondaryMuscleWorking.length > 0">
                <p class="text-slate-400 text-xs mb-1">Músculos secundarios:</p>
                <DynamicBadges :items="exercise.secondaryMuscleWorking" variant="secondary" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </DataTable>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>

    <!-- Exercise Detail Modal -->
    <transition name="modal-fade">
      <div v-if="showDetailModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="closeDetailModal"></div>
        <transition name="modal-slide">
          <div v-if="showDetailModal && selectedExercise" @click.stop class="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="bg-slate-800 rounded-xl p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-white">Detalles del Ejercicio</h2>
                <button @click="closeDetailModal" class="text-slate-400 hover:text-white">
                  <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
                </button>
              </div>
              
              <div v-if="selectedExercise" class="space-y-6">
                <!-- Exercise Image -->
                <div v-if="selectedExercise.photo || selectedExercise.photoUrl" class="relative">
                  <img 
                    :src="selectedExercise.photo || selectedExercise.photoUrl" 
                    :alt="selectedExercise.title"
                    class="w-full h-64 object-cover rounded-lg"
                  />
                  <span 
                    :class="{
                      'bg-green-500/90 text-green-100': selectedExercise.difficulty === 'principiante',
                      'bg-yellow-500/90 text-yellow-100': selectedExercise.difficulty === 'intermedio',
                      'bg-red-500/90 text-red-100': selectedExercise.difficulty === 'avanzado'
                    }"
                    class="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {{ selectedExercise.difficulty }}
                  </span>
                </div>
                
                <!-- Exercise Info -->
                <div class="space-y-4">
                  <div>
                    <h3 class="text-xl font-bold text-white mb-2">{{ selectedExercise.title }}</h3>
                    <p class="text-slate-400">{{ selectedExercise.description }}</p>
                  </div>
                  
                  <div class="flex items-center gap-4">
                    <span class="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
                      {{ selectedExercise.regionWorking.charAt(0).toUpperCase() + selectedExercise.regionWorking.slice(1) }}
                    </span>
                    <span 
                      :class="{
                        'bg-green-500/20 text-green-400': selectedExercise.difficulty === 'principiante',
                        'bg-yellow-500/20 text-yellow-400': selectedExercise.difficulty === 'intermedio',
                        'bg-red-500/20 text-red-400': selectedExercise.difficulty === 'avanzado'
                      }"
                      class="px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {{ selectedExercise.difficulty.charAt(0).toUpperCase() + selectedExercise.difficulty.slice(1) }}
                    </span>
                  </div>
                  
                  <div>
                    <h4 class="text-white font-semibold mb-2">Músculos Primarios</h4>
                    <DynamicBadges :items="selectedExercise.primaryMuscleWorking" />
                  </div>
                  
                  <div v-if="selectedExercise.secondaryMuscleWorking.length > 0">
                    <h4 class="text-white font-semibold mb-2">Músculos Secundarios</h4>
                    <DynamicBadges :items="selectedExercise.secondaryMuscleWorking" variant="secondary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useExercises, type Exercise } from '~/composables/firestore'
import DataTable from '~/components/DataTable.vue'
import CustomMultiSelect from '~/components/CustomMultiSelect.vue'
import CustomSelect from '~/components/CustomSelect.vue'
import DynamicBadges from '~/components/DynamicBadges.vue'

// State
const isLoading = ref(false)
const allExercises = ref<Exercise[]>([])
const filteredExercises = ref<Exercise[]>([])
const selectedRegions = ref<string[]>([])
const selectedDifficulty = ref('')
const selectedExercise = ref<Exercise | null>(null)
const showDetailModal = ref(false)

// Table columns
const tableColumns = [
  { key: 'title', label: 'Ejercicio', sortable: true },
  { key: 'difficulty', label: 'Dificultad', sortable: true },
  { key: 'regionWorking', label: 'Región', sortable: true },
  { key: 'primaryMuscleWorking', label: 'Músculos Primarios', sortable: false },
  { key: 'secondaryMuscleWorking', label: 'Músculos Secundarios', sortable: false }
]

// Options
const regionOptions = ref([
  { value: 'Tren Superior', label: 'Tren Superior' },
  { value: 'Tren Inferior', label: 'Tren Inferior' },
  { value: 'Core', label: 'Core' }
])

const difficultyOptions = ref([
  { value: '', label: 'Todas las dificultades' },
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' }
])

// Methods
const loadExercises = async () => {
  isLoading.value = true
  try {
    const { getExercises } = useExercises()
    const result = await getExercises()
    
    if (result.success && result.exercises) {
      allExercises.value = result.exercises
      filteredExercises.value = result.exercises
    } else {
      console.error('Error loading exercises:', result.error)
    }
  } catch (error) {
    console.error('Error loading exercises:', error)
  } finally {
    isLoading.value = false
  }
}

const filterExercises = () => {
  let filtered = [...allExercises.value]

  // Filter by regions
  if (selectedRegions.value.length > 0) {
    filtered = filtered.filter(exercise => 
      selectedRegions.value.includes(exercise.regionWorking)
    )
  }

  // Filter by difficulty
  if (selectedDifficulty.value) {
    filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty.value)
  }

  filteredExercises.value = filtered
}

const viewExercise = (exercise: Exercise) => {
  selectedExercise.value = exercise
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedExercise.value = null
}

// Lifecycle
onMounted(() => {
  loadExercises()
})

// Watch for filter changes
watch([selectedRegions, selectedDifficulty], () => {
  filterExercises()
})
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active, .modal-slide-leave-active {
  transition: transform 0.3s, opacity 0.3s;
}
.modal-slide-enter-from, .modal-slide-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style> 