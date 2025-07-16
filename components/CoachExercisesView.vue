<template>
  <div class="space-y-6">
    <!-- Data Table -->
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
      
      <!-- Additional Actions -->
      <template #actions>
        <AppButtonPrimary
          @click="showCreateModal = true"
          icon="i-heroicons-plus"
        >
          Crear Ejercicio
        </AppButtonPrimary>
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

    <!-- Create/Edit Exercise Modal -->
    <transition name="modal-fade">
      <div v-if="showEditModalBg" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="closeEditModal"></div>
        <transition name="modal-slide">
          <div v-if="showEditModalContent && (showCreateModal || editingExercise)" @click.stop class="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ExerciseEditModal
              :show="showCreateModal || !!editingExercise"
              :editing="!!editingExercise"
              :saving="isSaving"
              @cancel="closeEditModal"
              @save="saveExercise"
            >
              <!-- slot content -->
              <div class="space-y-4">
                <!-- Dificultad -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Dificultad</label>
                  <CustomSelect
                    v-model="exerciseForm.difficulty"
                    :options="difficultyOptions"
                    placeholder="Selecciona la dificultad"
                  />
                </div>
                <!-- Nombre del Ejercicio -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Nombre del Ejercicio</label>
                  <AppInput
                    v-model="exerciseForm.title"
                    placeholder="Ej: Flexiones"
                    required
                  />
                </div>
                <!-- Región Trabajada -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Región Trabajada</label>
                  <CustomSelect
                    v-model="exerciseForm.regionWorking"
                    :options="regionOptions"
                    placeholder="Selecciona la región trabajada"
                  />
                </div>
                <!-- Músculo Primario -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Músculo Primario Trabajado</label>
                  <CustomMultiSelect
                    v-model="exerciseForm.primaryMuscleWorking"
                    :options="primaryMuscleOptions"
                    placeholder="Selecciona uno o más músculos primarios"
                  />
                </div>
                <!-- Músculo Secundario -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Músculo Secundario Trabajado</label>
                  <CustomMultiSelect
                    v-model="exerciseForm.secondaryMuscleWorking"
                    :options="secondaryMuscleOptions"
                    placeholder="Selecciona uno o más músculos secundarios"
                  />
                </div>
                <!-- Descripción -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Descripción</label>
                  <AppTextarea
                    v-model="exerciseForm.description"
                    :rows="3"
                    placeholder="Describe el ejercicio..."
                  />
                </div>
                <!-- Instrucciones como pasos dinámicos -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Instrucciones</label>
                  <div class="space-y-3">
                    <template v-for="(step, idx) in exerciseForm.instructions" :key="idx">
                      <div class="flex items-start gap-2">
                        <AppTextarea
                          v-model="exerciseForm.instructions[idx]"
                          :placeholder="`Paso ${idx + 1}`"
                          :rows="2"
                          class="flex-1"
                        />
                        <button
                          type="button"
                          @click="removeInstructionStep(idx)"
                          class="mt-1 w-[42px] h-[42px] min-w-[42px] min-h-[42px] max-w-[42px] max-h-[42px] flex items-center justify-center border border-slate-600 text-slate-400 hover:text-red-400 hover:border-red-400 rounded-lg transition-colors"
                          title="Eliminar paso"
                        >
                          <UIcon name="i-heroicons-trash" class="w-5 h-5" />
                        </button>
                      </div>
                    </template>
                    <button
                      v-if="exerciseForm.instructions.length === 0"
                      type="button"
                      @click="addInstructionStep()"
                      class="w-full h-12 border border-slate-600 text-slate-400 hover:text-orange-400 hover:border-orange-400 rounded-lg transition-colors"
                    >
                      Agregar Paso 1
                    </button>
                    <button
                      v-else
                      type="button"
                      @click="addInstructionStep()"
                      class="w-full h-12 border border-slate-600 text-slate-400 hover:text-orange-400 hover:border-orange-400 rounded-lg transition-colors"
                    >
                      Agregar Paso {{ exerciseForm.instructions.length + 1 }}
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-white mb-2">Progresiones</label>
                  <CustomMultiSelect
                    v-model="progressionsInput"
                    :options="relatedExercisesOptions"
                    placeholder="Selecciona ejercicios de progresión"
                  />
                </div>
                <div class="mt-4">
                  <label class="block text-sm font-medium text-white mb-2">Regresiones</label>
                  <CustomMultiSelect
                    v-model="regressionsInput"
                    :options="relatedExercisesOptions"
                    placeholder="Selecciona ejercicios de regresión"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-white mb-2">Imagen del Ejercicio</label>
                  <div class="flex items-center gap-4">
                    <input
                      ref="fileInput"
                      type="file"
                      accept="image/*"
                      @change="handleImageSelect"
                      class="hidden"
                    />
                    <button
                      @click="fileInput?.click()"
                      type="button"
                      class="h-12 px-4 border border-slate-600 text-slate-400 hover:text-orange-400 hover:border-orange-400 rounded-lg transition-colors bg-transparent"
                    >
                      Seleccionar Imagen
                    </button>
                    <span v-if="imageFile" class="text-green-400 text-sm">
                      ✓ Imagen seleccionada
                    </span>
                  </div>
                  <div v-if="selectedImage" class="mt-3 relative group w-[80px] h-[80px]">
                    <img :src="selectedImage" alt="Preview" class="w-[80px] h-[80px] object-cover rounded-lg" />
                    <div class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer" @click="removeSelectedImage">
                      <UIcon name="i-heroicons-trash" class="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </ExerciseEditModal>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Exercise Details Modal -->
    <transition name="modal-fade">
      <div v-if="showDetailsModalBg" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="closeDetailsModal"></div>
        <transition name="modal-slide">
          <div v-if="showDetailsModalContent && selectedExercise" @click.stop class="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div class="flex items-start justify-between mb-6">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-3">
                    <h3 class="text-3xl font-bold text-white">{{ selectedExercise.title }}</h3>
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
                    <span class="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
                      {{ selectedExercise.regionWorking.charAt(0).toUpperCase() + selectedExercise.regionWorking.slice(1) }}
                    </span>
                  </div>
                  <p class="text-white text-base leading-relaxed">{{ selectedExercise.description }}</p>
                </div>
                <button 
                  @click="closeDetailsModal"
                  class="text-slate-400 hover:text-white cursor-pointer ml-4"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
                </button>
              </div>

              <!-- Exercise Image -->
              <div 
                v-if="selectedExercise.photo || selectedExercise.photoUrl" 
                @click="showImageFullscreen(selectedExercise.photo || selectedExercise.photoUrl)"
                class="mb-6 h-64 bg-cover bg-center rounded-lg relative cursor-pointer hover:opacity-90 transition-opacity"
                :style="{ backgroundImage: `url(${selectedExercise.photo || selectedExercise.photoUrl})` }"
              >
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent rounded-lg"></div>
                <div class="absolute bottom-3 left-3 text-white text-sm bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                  🔍 Click para ver en tamaño completo
                </div>
              </div>

              <!-- Exercise Info -->
              <div class="space-y-6">

                <div>
                  <p class="text-slate-400 mb-2">Músculos primarios:</p>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="muscle in selectedExercise.primaryMuscleWorking" 
                      :key="muscle"
                      class="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs"
                    >
                      {{ muscle }}
                    </span>
                  </div>
                </div>

                <div v-if="selectedExercise.secondaryMuscleWorking.length > 0">
                  <p class="text-slate-400 mb-2">Músculos secundarios:</p>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="muscle in selectedExercise.secondaryMuscleWorking" 
                      :key="muscle"
                      class="bg-slate-600 text-slate-300 px-2 py-1 rounded text-xs"
                    >
                      {{ muscle }}
                    </span>
                  </div>
                </div>

                <div v-if="selectedExercise.instructions && selectedExercise.instructions.length > 0">
                  <p class="text-slate-400 mb-2">Instrucciones:</p>
                  <div class="space-y-3">
                    <div 
                      v-for="(instruction, index) in selectedExercise.instructions" 
                      :key="index"
                      class="flex gap-3"
                    >
                      <div class="w-6 h-6 bg-slate-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {{ index + 1 }}
                      </div>
                      <span class="text-slate-300">{{ instruction }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex gap-4">
                  <AppButtonPrimary
                    @click="editExercise(selectedExercise)"
                    class="w-full"
                  >
                    Editar Ejercicio
                  </AppButtonPrimary>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Fullscreen Image Modal -->
    <div v-if="fullscreenImage" @click="fullscreenImage = null" class="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
      <div class="relative max-w-full max-h-full">
        <button 
          @click="fullscreenImage = null"
          class="absolute top-4 right-4 w-[46px] h-[46px] text-white bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors cursor-pointer flex items-center justify-center"
        >
          <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
        </button>
        <img 
          :src="fullscreenImage" 
          alt="Imagen del ejercicio"
          class="max-w-full max-h-full object-contain rounded-lg"
          @click.stop
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExercises, type Exercise } from '~/composables/firestore'
import { useFirebaseStorage } from '~/composables/firebase-storage'
import ExerciseEditModal from '~/components/ExerciseEditModal.vue'
import DataTable from '~/components/DataTable.vue'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
import AppInput from '~/components/AppInput.vue'
import CustomMultiSelect from '~/components/CustomMultiSelect.vue'
import AppTextarea from './AppTextarea.vue'
import CustomTooltip from '~/components/CustomTooltip.vue'
import DynamicBadges from '~/components/DynamicBadges.vue'

const { user } = useAuth()
const exercises = ref<Exercise[]>([])
const filteredExercises = ref<Exercise[]>([])
const isLoading = ref(true)
const showCreateModal = ref(false)
const editingExercise = ref<Exercise | null>(null)
const selectedExercise = ref<Exercise | null>(null)
const fullscreenImage = ref<string | null>(null)
const isSaving = ref(false)

// Image handling
const imageFile = ref<File | null>(null)
const selectedImage = ref<string>('')
const fileInput = ref<HTMLInputElement>()

// Filters
const selectedRegions = ref<string[]>([])
const selectedDifficulty = ref('')
const searchTerm = ref('')

// Form data
const exerciseForm = reactive({
  title: '',
  description: '',
  regionWorking: '',
  difficulty: '',
  primaryMuscleWorking: [] as string[],
  secondaryMuscleWorking: [] as string[],
  instructions: [] as string[]
})

const muscleGroupsInput = ref('')
const instructionsInput = ref('')

// Multi-select for progressions/regressions
const progressionsInput = ref<string[]>([])
const regressionsInput = ref<string[]>([])

// Table columns configuration
const tableColumns = [
  {
    key: 'title',
    label: 'Ejercicio',
    sortable: true
  },
  {
    key: 'difficulty',
    label: 'Dificultad',
    sortable: true,
    type: 'badge' as const
  },
  {
    key: 'regionWorking',
    label: 'Región Trabajada',
    sortable: true,
    type: 'badge' as const
  },
  {
    key: 'primaryMuscleWorking',
    label: 'Músculos Primarios',
    sortable: false
  },
  {
    key: 'secondaryMuscleWorking',
    label: 'Músculos Secundarios',
    sortable: false
  },
  {
    key: 'createdAt',
    label: 'Creado',
    sortable: true,
    type: 'date' as const,
    format: (value: any) => value ? new Date(value).toLocaleDateString('es-ES') : '-'
  }
]

// Computed para ejercicios del mismo grupo muscular (excepto el actual)
const relatedExercises = computed(() => {
  if (!muscleGroupsInput.value) return exercises.value.filter(e => !editingExercise.value || e.id !== editingExercise.value.id)
  const currentMuscles = muscleGroupsInput.value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  return exercises.value.filter(e => {
    if (editingExercise.value && e.id === editingExercise.value.id) return false
    return e.primaryMuscleWorking.some(m => currentMuscles.includes(m.toLowerCase()))
  })
})

const relatedExercisesOptions = computed(() => {
  return relatedExercises.value.map(e => ({ value: e.id, label: e.title }))
})

// Options for CustomSelect components
const regionOptions = [
  { value: 'Tren Superior', label: 'Tren Superior' },
  { value: 'Tren Inferior', label: 'Tren Inferior' },
  { value: 'Core', label: 'Core' }
]

const primaryMuscleOptions = [
  { value: 'pectorales', label: 'Pectorales' },
  { value: 'dorsales', label: 'Dorsales' },
  { value: 'cuádriceps', label: 'Cuádriceps' },
  { value: 'glúteos', label: 'Glúteos' },
  { value: 'bíceps', label: 'Bíceps' },
  { value: 'tríceps', label: 'Tríceps' },
  { value: 'deltoides', label: 'Deltoides' },
  { value: 'abdominales', label: 'Abdominales' },
  { value: 'lumbares', label: 'Lumbares' },
  { value: 'gemelos', label: 'Gemelos' },
  { value: 'isquiotibiales', label: 'Isquiotibiales' },
  { value: 'trapecios', label: 'Trapecios' }
]

const secondaryMuscleOptions = [
  { value: 'pectorales', label: 'Pectorales' },
  { value: 'dorsales', label: 'Dorsales' },
  { value: 'cuádriceps', label: 'Cuádriceps' },
  { value: 'glúteos', label: 'Glúteos' },
  { value: 'bíceps', label: 'Bíceps' },
  { value: 'tríceps', label: 'Tríceps' },
  { value: 'deltoides', label: 'Deltoides' },
  { value: 'abdominales', label: 'Abdominales' },
  { value: 'lumbares', label: 'Lumbares' },
  { value: 'gemelos', label: 'Gemelos' },
  { value: 'isquiotibiales', label: 'Isquiotibiales' },
  { value: 'trapecios', label: 'Trapecios' }
]

const difficultyOptions = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' }
]

const loadExercises = async () => {
  isLoading.value = true
  try {
    const { getExercises } = useExercises()
    const result = await getExercises()
    
    if (result.success && result.exercises) {
      exercises.value = result.exercises
      filteredExercises.value = result.exercises
    }
  } catch (error) {
    console.error('Error loading exercises:', error)
  } finally {
    isLoading.value = false
  }
}

const filterExercises = () => {
  let filtered = [...exercises.value]

  // Filter by muscular group
  if (selectedRegions.value.length > 0) {
    filtered = filtered.filter(ex => {
      // Coincide si regionWorking (string) está en los seleccionados
      const matchRegion = ex.regionWorking && selectedRegions.value.includes(ex.regionWorking)
      // También coinciden los músculos primarios que estén en los grupos seleccionados
      const matchPrimaryMuscles = Array.isArray(ex.primaryMuscleWorking) && ex.primaryMuscleWorking.some(mg => selectedRegions.value.includes(mg))
      return matchRegion || matchPrimaryMuscles
    })
  }

  if (selectedDifficulty.value) {
    filtered = filtered.filter(ex => ex.difficulty === selectedDifficulty.value)
  }

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(ex => 
      ex.title.toLowerCase().includes(search) ||
      ex.description.toLowerCase().includes(search) ||
      ex.primaryMuscleWorking.some(muscle => muscle.toLowerCase().includes(search))
    )
  }

  filteredExercises.value = filtered
}

// Modal backdrop click handlers
const handleModalBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeEditModal()
  }
}

const showDetailsModalBg = ref(false)
const showDetailsModalContent = ref(false)

watch(selectedExercise, (val, oldVal) => {
  if (val) {
    showDetailsModalBg.value = true
    setTimeout(() => {
      showDetailsModalContent.value = true
    }, 150)
  } else {
    showDetailsModalContent.value = false
    setTimeout(() => {
      showDetailsModalBg.value = false
    }, 350)
  }
})

const closeDetailsModal = () => {
  showDetailsModalContent.value = false
  setTimeout(() => {
    selectedExercise.value = null
  }, 350)
}

const handleDetailsModalBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeDetailsModal()
  }
}

// Image handling functions
const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    imageFile.value = target.files[0]
    selectedImage.value = URL.createObjectURL(target.files[0])
  }
}

const addInstructionStep = () => {
  exerciseForm.instructions.push('')
}

const removeInstructionStep = (index: number) => {
  exerciseForm.instructions.splice(index, 1)
}

const saveExercise = async () => {
  if (!user.value?.uid) return

  isSaving.value = true
  try {
    const { createExercise, updateExercise } = useExercises()
    const { uploadExerciseImage } = useFirebaseStorage()

    let photoUrl = selectedImage.value

    // Upload new image if selected
    if (imageFile.value) {
      const uploadResult = await uploadExerciseImage(
        imageFile.value,
        editingExercise.value?.id || `exercise_${Date.now()}`,
        exerciseForm.title
      )
      
      if (uploadResult.success) {
        photoUrl = uploadResult.url!
        console.log('📸 Imagen del ejercicio subida exitosamente:', photoUrl)
      } else {
        console.error('Error uploading exercise image:', uploadResult.error)
      }
    }

    const exerciseToSave = {
      title: exerciseForm.title,
      description: exerciseForm.description,
      regionWorking: exerciseForm.regionWorking,
      difficulty: exerciseForm.difficulty as 'principiante' | 'intermedio' | 'avanzado',
      primaryMuscleWorking: exerciseForm.primaryMuscleWorking,
      secondaryMuscleWorking: exerciseForm.secondaryMuscleWorking,
      photo: photoUrl,
      instructions: exerciseForm.instructions,
      progressions: progressionsInput.value,
      regressions: regressionsInput.value,
      createdBy: user.value.uid
    }

    let result
    if (editingExercise.value) {
      result = await updateExercise(editingExercise.value.id!, exerciseToSave)
    } else {
      result = await createExercise(exerciseToSave)
    }

    if (result.success) {
      showCreateModal.value = false
      editingExercise.value = null
      
      // Reset form
      exerciseForm.title = ''
      exerciseForm.description = ''
      exerciseForm.regionWorking = ''
      exerciseForm.difficulty = ''
      exerciseForm.primaryMuscleWorking = []
      exerciseForm.secondaryMuscleWorking = []
      muscleGroupsInput.value = ''
      instructionsInput.value = ''
      progressionsInput.value = []
      regressionsInput.value = []
      imageFile.value = null
      selectedImage.value = ''
      
      // Reload exercises
      await loadExercises()
      
      console.log('✅ Ejercicio guardado exitosamente:', exerciseForm.title)
    }
  } catch (error) {
    console.error('Error saving exercise:', error)
  } finally {
    isSaving.value = false
  }
}

const viewExercise = (exercise: Exercise) => {
  selectedExercise.value = exercise
}

const editExercise = (exercise: Exercise) => {
  selectedExercise.value = null // Cerrar modal de detalles
  editingExercise.value = exercise
  exerciseForm.title = exercise.title
  exerciseForm.description = exercise.description
  exerciseForm.difficulty = exercise.difficulty
  exerciseForm.regionWorking = exercise.regionWorking || ''
  exerciseForm.primaryMuscleWorking = exercise.primaryMuscleWorking || []
  exerciseForm.secondaryMuscleWorking = exercise.secondaryMuscleWorking || []
  muscleGroupsInput.value = exercise.primaryMuscleWorking.join(', ')
  instructionsInput.value = exercise.instructions.join('\n')
  progressionsInput.value = exercise.progressions || []
  regressionsInput.value = exercise.regressions || []
  if (exercise.photo || exercise.photoUrl) {
    selectedImage.value = exercise.photo || exercise.photoUrl || ''
  }
}

const deleteExercise = async (exercise: Exercise) => {
  if (!confirm(`¿Estás seguro de que quieres eliminar el ejercicio "${exercise.title}"?`)) {
    return
  }

  try {
    const { deleteExercise: deleteExerciseFn } = useExercises()
    const result = await deleteExerciseFn(exercise.id!)
    
    if (result.success) {
      selectedExercise.value = null
      await loadExercises()
      console.log('✅ Ejercicio eliminado exitosamente')
    }
  } catch (error) {
    console.error('Error deleting exercise:', error)
  }
}

const showImageFullscreen = (imageUrl: string | undefined) => {
  if (imageUrl) {
    fullscreenImage.value = imageUrl
  }
}

const showEditModalBg = ref(false)
const showEditModalContent = ref(false)

watch([showCreateModal, editingExercise], ([show, editing], [oldShow, oldEditing]) => {
  if (show || editing) {
    showEditModalBg.value = true
    setTimeout(() => {
      showEditModalContent.value = true
    }, 150)
  } else {
    showEditModalContent.value = false
    setTimeout(() => {
      showEditModalBg.value = false
    }, 350)
  }
})

const closeEditModal = () => {
  showEditModalContent.value = false
  setTimeout(() => {
    showCreateModal.value = false
    editingExercise.value = null
  }, 350)
}

const removeSelectedImage = () => {
  selectedImage.value = ''
  imageFile.value = null
}

onMounted(() => {
  loadExercises()
})

// Composable para badges dinámicos
const useDynamicBadges = () => {
  const calculateVisibleBadges = (items: string[], containerWidth: number, badgeWidth: number = 80, gap: number = 4) => {
    if (!items || items.length === 0) return { visible: [], hidden: [] }
    
    let totalWidth = 0
    let visibleCount = 0
    
    for (let i = 0; i < items.length; i++) {
      const itemWidth = Math.min(badgeWidth, items[i].length * 8 + 16) // Aproximación del ancho del texto
      const currentTotal = totalWidth + itemWidth + (i > 0 ? gap : 0)
      
      // Si agregar este badge excede el contenedor, paramos
      if (currentTotal > containerWidth - 30) { // 30px para el badge "+N"
        break
      }
      
      totalWidth = currentTotal
      visibleCount = i + 1
    }
    
    return {
      visible: items.slice(0, visibleCount),
      hidden: items.slice(visibleCount)
    }
  }
  
  return { calculateVisibleBadges }
}
</script> 

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.35s cubic-bezier(0.4,0,0.2,1);
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-to, .modal-fade-leave-from {
  opacity: 1;
}
.modal-slide-enter-active {
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s cubic-bezier(0.4,0,0.2,1);
}
.modal-slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s cubic-bezier(0.4,0,0.2,1);
}
.modal-slide-enter-from {
  transform: translateY(-60vh);
  opacity: 0;
}
.modal-slide-leave-to {
  transform: translateY(-60vh);
  opacity: 0;
}
</style> 