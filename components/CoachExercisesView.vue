<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex items-center justify-between gap-4">
      <!-- Filters -->
      <div class="flex flex-wrap gap-4 flex-1">
        <div class="min-w-[200px]">
          <CustomSelect
            v-model="selectedCategory"
            :options="categoryOptions"
            placeholder="Todas las categorías"
            @update:model-value="filterExercises"
          />
        </div>

        <div class="min-w-[200px]">
          <CustomSelect
            v-model="selectedDifficulty"
            :options="difficultyOptions"
            placeholder="Todas las dificultades"
            @update:model-value="filterExercises"
          />
        </div>

        <input 
          v-model="searchTerm" 
          @input="filterExercises"
          type="text" 
          autocomplete="off"
          placeholder="Buscar ejercicios..."
          class="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
        />
      </div>
      
      <!-- Add Exercise Button -->
      <button 
        @click="showCreateModal = true"
        class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
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
        class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden hover:border-orange-500/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer max-w-[320px] group"
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
        {{ searchTerm || selectedCategory || selectedDifficulty ? 'Prueba ajustando los filtros' : 'Crea tu primer ejercicio personalizado' }}
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
    <TermsModal
      :show="showCreateModal || editingExercise"
      @cancel="closeModal"
    >
      <template #header>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">
            {{ editingExercise ? 'Editar Ejercicio' : 'Crear Nuevo Ejercicio' }}
          </h3>
          <button 
            @click="closeModal"
            class="text-slate-400 hover:text-white cursor-pointer"
          >
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>
      </template>
      <template #terms>
        <form @submit.prevent="saveExercise" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Nombre del Ejercicio</label>
              <input
                v-model="exerciseForm.title"
                type="text"
                autocomplete="off"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
                placeholder="Ej: Flexiones"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-white mb-2">Categoría</label>
              <CustomSelect
                v-model="exerciseForm.category"
                :options="categoryOptions"
                placeholder="Seleccionar categoría"
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
              class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
              placeholder="Ej: pectorales, tríceps, deltoides (separados por comas)"
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
              <span v-else>{{ editingExercise ? 'Actualizar' : 'Crear' }} Ejercicio</span>
            </button>
          </div>
        </form>
      </template>
    </TermsModal>

    <!-- Exercise Details Modal -->
    <div v-if="selectedExercise" @click="handleDetailsModalBackdropClick" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div @click.stop class="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">{{ selectedExercise.title }}</h3>
          <button 
            @click="selectedExercise = null"
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
    </div>

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
import TermsModal from '~/components/TermsModal.vue'

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
const selectedCategory = ref('')
const selectedDifficulty = ref('')
const searchTerm = ref('')

// Form data
const exerciseForm = reactive({
  title: '',
  description: '',
  category: '',
  difficulty: '',
})

const muscleGroupsInput = ref('')
const instructionsInput = ref('')

// Options for CustomSelect components
const categoryOptions = [
  { value: '', label: 'Todas las categorías' },
  { value: 'pecho', label: 'Pecho' },
  { value: 'espalda', label: 'Espalda' },
  { value: 'piernas', label: 'Piernas' },
  { value: 'core', label: 'Core' },
  { value: 'brazos', label: 'Brazos' },
  { value: 'hombros', label: 'Hombros' }
]

const difficultyOptions = [
  { value: '', label: 'Todas las dificultades' },
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

  if (selectedCategory.value) {
    filtered = filtered.filter(ex => ex.category === selectedCategory.value)
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

const handleDetailsModalBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    selectedExercise.value = null
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
  exerciseForm.category = ''
  exerciseForm.difficulty = ''
  muscleGroupsInput.value = ''
  instructionsInput.value = ''
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
      progressions: [],
      regressions: [],
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
  exerciseForm.category = exercise.category
  exerciseForm.difficulty = exercise.difficulty
  muscleGroupsInput.value = exercise.muscleGroups.join(', ')
  instructionsInput.value = exercise.instructions.join('\n')
  
  if (exercise.photo || exercise.photoUrl) {
    selectedImage.value = exercise.photo || exercise.photoUrl || ''
  }
}

const showImageFullscreen = (imageUrl: string | undefined) => {
  if (imageUrl) {
    fullscreenImage.value = imageUrl
  }
}

onMounted(() => {
  loadExercises()
})
</script> 