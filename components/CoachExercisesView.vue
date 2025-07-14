<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <!-- Mobile: Botón primero, luego filtros -->
      <button 
        @click="showCreateModal = true"
        class="block md:hidden w-full bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer mb-2"
      >
        <UIcon name="i-heroicons-plus" class="w-5 h-5" />
        Crear Ejercicio
      </button>
      <!-- Filtros en mobile: cada uno en una fila -->
      <div class="flex flex-col gap-2 w-full md:flex-row md:items-center md:gap-4 md:flex-1">
        <div class="w-full md:w-[260px]">
          <CustomMultiSelect
            v-model="selectedMuscleGroups"
            :options="muscleGroupOptions"
            placeholder="Filtrar por grupo muscular"
            @update:model-value="filterExercises"
          />
        </div>
        <div class="w-full md:w-[260px]">
          <CustomSelect
            v-model="selectedDifficulty"
            :options="difficultyOptions"
            placeholder="Filtrar por dificultades"
            @update:model-value="filterExercises"
          />
        </div>
        <AppInput
          v-model="searchTerm"
          placeholder="Buscar ejercicios..."
          @input="filterExercises"
          class="w-full md:w-[340px]"
        />
      </div>
      <!-- Desktop: Botón a la derecha -->
      <button 
        @click="showCreateModal = true"
        class="hidden md:flex bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors items-center gap-2 whitespace-nowrap cursor-pointer"
      >
        <UIcon name="i-heroicons-plus" class="w-5 h-5" />
        Crear Ejercicio
      </button>
    </div>

    <!-- Exercises Grid -->
    <div v-if="filteredExercises.length > 0" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 justify-items-start">
      <div 
        v-for="exercise in filteredExercises" 
        :key="exercise.id"
        @click="viewExercise(exercise)"
        class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden hover:border-orange-500/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer w-full max-w-full md:max-w-[320px] group"
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
                {{ exercise.category }}
              </span>
            </div>

            <p class="text-slate-400 text-sm mb-3 line-clamp-2">{{ exercise.description }}</p>
            
            <div class="mb-3">
              <p class="text-slate-400 text-xs mb-1">Músculos trabajados:</p>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="muscle in exercise.muscleGroups.slice(0, 3)" 
                  :key="muscle"
                  class="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs"
                >
                  {{ muscle }}
                </span>
                <span 
                  v-if="exercise.muscleGroups.length > 3"
                  class="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs"
                >
                  +{{ exercise.muscleGroups.length - 3 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="text-center py-12">
      <div class="text-6xl mb-4">🏋️</div>
      <h3 class="text-xl font-bold text-white mb-2">No se encontraron ejercicios</h3>
      <p class="text-slate-400 mb-6">
        {{ searchTerm || selectedDifficulty ? 'Prueba ajustando los filtros' : 'Crea tu primer ejercicio personalizado' }}
      </p>
      <button 
        @click="showCreateModal = true"
        class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors cursor-pointer"
      >
        Crear Ejercicio
      </button>
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center py-12">
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-white mb-2">Nombre del Ejercicio</label>
                    <AppInput
                      v-model="exerciseForm.title"
                      placeholder="Ej: Flexiones"
                      required
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-white mb-2">Grupo Muscular</label>
                    <CustomMultiSelect
                      v-model="exerciseForm.muscleGroups"
                      :options="muscleGroupOptions"
                      placeholder="Selecciona uno o más grupos musculares"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Descripción</label>
                  <textarea
                    v-model="exerciseForm.description"
                    rows="3"
                    class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
                    placeholder="Descripción del ejercicio..."
                    required
                  ></textarea>
                </div>
                <!-- Imagen del Ejercicio -->
                <div>
                  <label class="block text-sm font-bold text-white mb-2">
                    IMAGEN DEL EJERCICIO
                  </label>
                  <div class="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-orange-600 transition-colors cursor-pointer">
                    <div v-if="!selectedImage">
                      <UIcon name="i-heroicons-photo" class="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p class="text-slate-400 mb-2">Subir imagen del ejercicio</p>
                      <p class="text-slate-500 text-xs mb-2">Se convertirá automáticamente a WebP para mejor calidad</p>
                      <input
                        type="file"
                        @change="handleImageUpload"
                        accept="image/*"
                        class="hidden"
                        ref="fileInput"
                      />
                      <button
                        type="button"
                        @click="fileInput?.click()"
                        class="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
                      >
                        Seleccionar imagen
                      </button>
                    </div>
                    <div v-else class="relative">
                      <img :src="selectedImage" alt="Preview" class="w-full h-48 rounded-lg mx-auto object-cover mb-3">
                      <button
                        type="button"
                        @click="removeImage"
                        class="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded text-sm transition-colors cursor-pointer"
                      >
                        Cambiar imagen
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Dificultad</label>
                  <CustomSelect
                    v-model="exerciseForm.difficulty"
                    :options="difficultyOptions"
                    placeholder="Seleccionar dificultad"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Músculos Trabajados</label>
                  <input
                    v-model="muscleGroupsInput"
                    type="text"
                    autocomplete="off"
                    class="w-full h-[50px] px-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
                    placeholder="Ej: pectorales, tríceps, deltoides (separados por comas)"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Regresiones</label>
                  <CustomMultiSelect
                    v-model="regressionsInput"
                    :options="relatedExercisesOptions"
                    placeholder="Selecciona regresiones"
                    class="rz-multiselect"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Progresiones</label>
                  <CustomMultiSelect
                    v-model="progressionsInput"
                    :options="relatedExercisesOptions"
                    placeholder="Selecciona progresiones"
                    class="rz-multiselect"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Instrucciones</label>
                  <textarea
                    v-model="instructionsInput"
                    rows="4"
                    class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
                    placeholder="Escribe las instrucciones paso a paso (una por línea)"
                  ></textarea>
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
        <div class="absolute inset-0 bg-black/50" @click="handleDetailsModalBackdropClick"></div>
        <transition name="modal-slide">
          <div v-if="showDetailsModalContent && selectedExercise" @click.stop class="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-10">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-white">{{ selectedExercise.title }}</h3>
              <button 
                @click="closeDetailsModal"
                class="text-slate-400 hover:text-white cursor-pointer"
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

            <div class="space-y-6">
              <div class="flex items-center gap-4">
                <span 
                  :class="{
                    'bg-green-500/20 text-green-400': selectedExercise.difficulty === 'principiante',
                    'bg-yellow-500/20 text-yellow-400': selectedExercise.difficulty === 'intermedio',
                    'bg-red-500/20 text-red-400': selectedExercise.difficulty === 'avanzado'
                  }"
                  class="px-3 py-1 rounded-full text-sm font-medium"
                >
                  {{ selectedExercise.difficulty }}
                </span>
                <span class="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
                  {{ selectedExercise.category }}
                </span>
              </div>

              <div>
                <p class="text-slate-400 mb-2">Descripción:</p>
                <p class="text-white">{{ selectedExercise.description }}</p>
              </div>

              <div>
                <p class="text-slate-400 mb-2">Músculos trabajados:</p>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="muscle in selectedExercise.muscleGroups" 
                    :key="muscle"
                    class="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm"
                  >
                    {{ muscle }}
                  </span>
                </div>
              </div>

              <div v-if="selectedExercise.instructions.length > 0">
                <p class="text-slate-400 mb-2">Instrucciones:</p>
                <ol class="space-y-2">
                  <li 
                    v-for="(instruction, index) in selectedExercise.instructions" 
                    :key="index"
                    class="flex gap-3"
                  >
                    <span class="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {{ index + 1 }}
                    </span>
                    <span class="text-slate-300">{{ instruction }}</span>
                  </li>
                </ol>
              </div>

              <!-- Botón de Editar al final -->
              <div class="pt-4 border-t border-slate-700">
                <button 
                  @click="editExercise(selectedExercise)"
                  class="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UIcon name="i-heroicons-pencil" class="w-5 h-5" />
                  Editar Ejercicio
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Modal para ver imagen en tamaño completo -->
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
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
import AppInput from '~/components/AppInput.vue'
import CustomMultiSelect from '~/components/CustomMultiSelect.vue'

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
const selectedMuscleGroups = ref<string[]>([])
const selectedDifficulty = ref('')
const searchTerm = ref('')

// Form data
const exerciseForm = reactive({
  title: '',
  description: '',
  muscleGroups: [],
  difficulty: '',
})

const muscleGroupsInput = ref('')
const instructionsInput = ref('')

// Multi-select for progressions/regressions
const progressionsInput = ref<string[]>([])
const regressionsInput = ref<string[]>([])

// Computed para ejercicios del mismo grupo muscular (excepto el actual)
const relatedExercises = computed(() => {
  if (!muscleGroupsInput.value) return exercises.value.filter(e => !editingExercise.value || e.id !== editingExercise.value.id)
  const currentMuscles = muscleGroupsInput.value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  return exercises.value.filter(e => {
    if (editingExercise.value && e.id === editingExercise.value.id) return false
    return e.muscleGroups.some(m => currentMuscles.includes(m.toLowerCase()))
  })
})

const relatedExercisesOptions = computed(() => {
  return relatedExercises.value.map(e => ({ value: e.id, label: e.title }))
})

// Options for CustomSelect components
const muscleGroupOptions = [
  { value: 'pecho', label: 'Pecho' },
  { value: 'espalda', label: 'Espalda' },
  { value: 'piernas', label: 'Piernas' },
  { value: 'core', label: 'Core' },
  { value: 'brazos', label: 'Brazos' },
  { value: 'hombros', label: 'Hombros' }
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

  if (selectedMuscleGroups.value.length > 0) {
    filtered = filtered.filter(ex => {
      // Coincide si category (string) está en los seleccionados
      const matchCategory = ex.category && selectedMuscleGroups.value.includes(ex.category)
      // Coincide si muscleGroups (array) tiene alguno de los seleccionados
      const matchMuscleGroups = Array.isArray(ex.muscleGroups) && ex.muscleGroups.some(mg => selectedMuscleGroups.value.includes(mg))
      return matchCategory || matchMuscleGroups
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
      ex.muscleGroups.some(muscle => muscle.toLowerCase().includes(search))
    )
  }

  filteredExercises.value = filtered
}

// Modal backdrop click handlers
const handleModalBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
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
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Tamaño máximo: 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido')
      return
    }

    try {
      // Convert image to WebP format
      const { convertImageToWebP, createWebPFile } = await import('~/utils/image-converter')
      const { blob, dataUrl } = await convertImageToWebP(file, 0.8, 1200, 1200) // Exercise images can be a bit larger
      
      // Create a new File object with WebP format
      const webpFile = createWebPFile(blob, file.name)
      imageFile.value = webpFile
      selectedImage.value = dataUrl
      
      console.log(`🏋️ Imagen de ejercicio convertida a WebP: ${file.name} → ${webpFile.name} (${(blob.size / 1024).toFixed(1)}KB)`)
    } catch (error) {
      console.error('Error converting image:', error)
      alert('Error al procesar la imagen. Intenta con otra imagen.')
    }
  }
}

const removeImage = () => {
  imageFile.value = null
  selectedImage.value = ''
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const resetForm = () => {
  exerciseForm.title = ''
  exerciseForm.description = ''
  exerciseForm.difficulty = ''
  muscleGroupsInput.value = ''
  instructionsInput.value = ''
  progressionsInput.value = []
  regressionsInput.value = []
  removeImage()
}

const saveExercise = async () => {
  if (!user.value?.uid) {
    console.error('❌ No user UID available')
    return
  }

  // Validate required fields
  if (!exerciseForm.title.trim()) {
    alert('El nombre del ejercicio es obligatorio')
    return
  }

  if (!exerciseForm.description.trim()) {
    alert('La descripción del ejercicio es obligatoria')
    return
  }

  console.log('💾 Iniciando guardado de ejercicio:', exerciseForm.title)
  isSaving.value = true
  
  try {
    let photoUrl = ''
    let imagePath = ''

    // Upload image if one was selected
    if (imageFile.value) {
      console.log('📤 Subiendo imagen a Firebase Storage...')
      
      const { uploadExerciseImage } = useFirebaseStorage()
      const uploadResult = await uploadExerciseImage(
        imageFile.value,
        exerciseForm.title, // Use exercise name for folder structure
        editingExercise.value?.id || `temp_${Date.now()}`
      )

      if (uploadResult.success) {
        photoUrl = uploadResult.url!
        imagePath = uploadResult.path!
        console.log('✅ Imagen subida exitosamente:', photoUrl)
      } else {
        console.error('❌ Error uploading image:', uploadResult.error)
        alert('Error al subir la imagen. Verifica tu conexión e intenta nuevamente.')
        return
      }
    }

    console.log('📝 Preparando datos del ejercicio...')
    const exerciseData = {
      ...exerciseForm,
      difficulty: exerciseForm.difficulty as 'principiante' | 'intermedio' | 'avanzado',
      muscleGroups: muscleGroupsInput.value.split(',').map(s => s.trim()).filter(Boolean),
      instructions: instructionsInput.value.split('\n').map(s => s.trim()).filter(Boolean),
      progressions: progressionsInput.value,
      regressions: regressionsInput.value,
      createdBy: user.value.uid,
      ...(photoUrl && { photo: photoUrl, photoUrl, imagePath })
    }

    console.log('💾 Guardando en Firestore...', exerciseData)

    if (editingExercise.value) {
      // Update existing exercise
      console.log('🔄 Actualizando ejercicio existente...')
      const { updateExercise } = useExercises()
      const result = await updateExercise(editingExercise.value.id!, exerciseData)
      
      if (result.success) {
        console.log('✅ Ejercicio actualizado exitosamente')
        closeModal()
        await loadExercises()
      } else {
        console.error('❌ Error actualizando ejercicio:', result.error)
        alert(`Error al actualizar el ejercicio: ${result.error}`)
      }
    } else {
      // Create new exercise
      console.log('🆕 Creando nuevo ejercicio...')
      const { createExercise } = useExercises()
      const result = await createExercise(exerciseData)
      
      if (result.success) {
        console.log('✅ Ejercicio creado exitosamente')
        closeModal()
        await loadExercises()
      } else {
        console.error('❌ Error creando ejercicio:', result.error)
        alert(`Error al crear el ejercicio: ${result.error}`)
      }
    }
  } catch (error) {
    console.error('❌ Error inesperado guardando ejercicio:', error)
    alert('Error inesperado al guardar el ejercicio. Revisa la consola para más detalles.')
  } finally {
    console.log('🏁 Finalizando proceso de guardado')
    isSaving.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingExercise.value = null
  resetForm()
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
  muscleGroupsInput.value = exercise.muscleGroups.join(', ')
  instructionsInput.value = exercise.instructions.join('\n')
  progressionsInput.value = exercise.progressions || []
  regressionsInput.value = exercise.regressions || []
  if (exercise.photo || exercise.photoUrl) {
    selectedImage.value = exercise.photo || exercise.photoUrl || ''
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

onMounted(() => {
  loadExercises()
})
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
.modal-slide-enter-to {
  transform: translateY(0);
  opacity: 1;
}
.modal-slide-leave-from {
  transform: translateY(0);
  opacity: 1;
}
.modal-slide-leave-to {
  transform: translateY(-60vh);
  opacity: 0;
}
.rz-multiselect .multiselect {
  background-color: #0f172a !important;
  border: 1px solid #334155 !important;
  border-radius: 0.5rem !important;
  min-height: 50px !important;
  padding-left: 1rem !important;
  padding-right: 1rem !important;
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
  color: #fff !important;
  font-size: 1rem !important;
  transition: border-color 0.2s !important;
  box-shadow: none !important;
  outline: none !important;
  display: block !important;
  width: 100% !important;
}
.rz-multiselect .multiselect__tags,
.rz-multiselect .multiselect__input,
.rz-multiselect .multiselect__single {
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  box-shadow: none !important;
  color: #fff !important;
}
:deep(.rz-multiselect .multiselect) {
  background-color: #0f172a !important;
  border: 1px solid #334155 !important;
  border-radius: 0.5rem !important;
  min-height: 50px !important;
  padding-left: 1rem !important;
  padding-right: 1rem !important;
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
  color: #fff !important;
  font-size: 1rem !important;
  transition: border-color 0.2s !important;
  box-shadow: none !important;
  outline: none !important;
  display: block !important;
  width: 100% !important;
}
:deep(.rz-multiselect .multiselect__content-wrapper) {
  background: #1e293b !important;
  border: 1px solid #334155 !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.25) !important;
  margin-top: 0.25rem !important;
  padding: 0 !important;
}
.rz-multiselect .multiselect__option {
  background: transparent !important;
  color: #cbd5e1 !important;
  font-size: 1rem !important;
  padding: 0.5rem 1rem !important;
  border-radius: 0.375rem !important;
  transition: background 0.2s, color 0.2s !important;
}
.rz-multiselect .multiselect__option--highlight {
  background: #334155 !important; /* bg-slate-700 */
  color: #fff !important;
}
.rz-multiselect .multiselect__option--selected {
  background: #ea580c !important; /* bg-orange-600 */
  color: #fff !important;
}
.rz-multiselect .multiselect__option--selected.multiselect__option--highlight {
  background: #ea580c !important; /* bg-orange-600 */
  color: #fff !important;
}
.rz-multiselect .multiselect__select {
  color: #ea580c !important;
}
.rz-multiselect .multiselect__tag {
  background: #334155 !important;
  color: #cbd5e1 !important;
  border-radius: 0.375rem !important;
  font-weight: 500 !important;
  padding: 0.25rem 0.75rem !important;
  font-size: 0.875rem !important;
  margin: 0 !important;
  width: auto !important;
  max-width: 100%;
  display: inline-flex !important;
  align-items: center;
  white-space: nowrap !important;
}
.rz-multiselect .multiselect__tag + .multiselect__tag {
  margin-left: 4px !important;
}
</style> 