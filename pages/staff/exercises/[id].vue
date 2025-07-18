<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <header class="px-4 py-6 border-b border-slate-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button 
            @click="goBack"
            class="w-10 h-10 flex items-center justify-center border border-white text-white bg-transparent rounded-lg transition-colors hover:bg-white/10"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-6 h-6" />
          </button>
          <div>
            <h1 class="text-2xl font-black text-white">Detalle del Ejercicio</h1>
            <p class="text-slate-400">{{ exercise?.title }}</p>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button 
            @click="editExercise"
            class="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <UIcon name="i-heroicons-pencil" class="w-5 h-5" />
            Editar
          </button>
          <button 
            @click="deleteExercise"
            class="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <UIcon name="i-heroicons-trash" class="w-5 h-5" />
            Eliminar
          </button>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 border-solid"></div>
    </div>

    <!-- Exercise Content -->
    <div v-else class="p-6 space-y-6">
      <!-- Exercise Header -->
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div class="flex items-start gap-6">
          <div class="w-32 h-32 bg-purple-600 rounded-lg flex items-center justify-center text-white text-4xl">
            🏋️
          </div>
          <div class="flex-1">
            <h2 class="text-3xl font-bold text-white mb-2">{{ exercise?.title }}</h2>
            <p class="text-slate-400 text-lg mb-4">{{ exercise?.description }}</p>
            <div class="flex items-center gap-4">
              <span 
                :class="{
                  'bg-green-600/20 text-green-400': exercise?.difficulty === 'principiante',
                  'bg-yellow-600/20 text-yellow-400': exercise?.difficulty === 'intermedio',
                  'bg-red-600/20 text-red-400': exercise?.difficulty === 'avanzado'
                }"
                class="px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ exercise?.difficulty }}
              </span>
              <span class="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium">
                {{ exercise?.regionWorking }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Exercise Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Basic Info -->
        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-information-circle" class="w-6 h-6 text-blue-500" />
            Información Básica
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-slate-400">Título</span>
              <span class="text-white">{{ exercise?.title }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Descripción</span>
              <span class="text-white">{{ exercise?.description }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Dificultad</span>
              <span 
                :class="{
                  'text-green-500': exercise?.difficulty === 'principiante',
                  'text-yellow-500': exercise?.difficulty === 'intermedio',
                  'text-red-500': exercise?.difficulty === 'avanzado'
                }"
              >
                {{ exercise?.difficulty }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Región</span>
              <span class="text-white">{{ exercise?.regionWorking }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Creado por</span>
              <span class="text-white">{{ exercise?.createdBy || 'Sistema' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Fecha de creación</span>
              <span class="text-white">{{ exercise?.createdAt ? new Date(exercise.createdAt.toDate()).toLocaleDateString() : 'No especificado' }}</span>
            </div>
          </div>
        </div>

        <!-- Muscles Worked -->
        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-muscle" class="w-6 h-6 text-red-500" />
            Músculos Trabajados
          </h3>
          
          <!-- Primary Muscles -->
          <div class="mb-6">
            <h4 class="text-lg font-bold text-white mb-3">Músculos Principales</h4>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="muscle in exercise?.primaryMuscleWorking" 
                :key="muscle"
                class="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm"
              >
                {{ muscle }}
              </span>
            </div>
          </div>

          <!-- Secondary Muscles -->
          <div>
            <h4 class="text-lg font-bold text-white mb-3">Músculos Secundarios</h4>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="muscle in exercise?.secondaryMuscleWorking" 
                :key="muscle"
                class="px-3 py-1 bg-orange-600/20 text-orange-400 rounded-full text-sm"
              >
                {{ muscle }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <UIcon name="i-heroicons-list-bullet" class="w-6 h-6 text-green-500" />
          Instrucciones
        </h3>
        <div class="space-y-3">
          <div 
            v-for="(instruction, index) in exercise?.instructions" 
            :key="index"
            class="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg"
          >
            <span class="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {{ index + 1 }}
            </span>
            <p class="text-white">{{ instruction }}</p>
          </div>
        </div>
      </div>

      <!-- Progressions and Regressions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Progressions -->
        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-arrow-trending-up" class="w-6 h-6 text-green-500" />
            Progresiones
          </h3>
          <div v-if="exercise?.progressions?.length" class="space-y-3">
            <div 
              v-for="progression in exercise.progressions" 
              :key="progression"
              class="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
              @click="viewExercise(progression)"
            >
              <p class="text-white font-medium">{{ progression }}</p>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <p class="text-slate-400">No hay progresiones definidas</p>
          </div>
        </div>

        <!-- Regressions -->
        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-arrow-trending-down" class="w-6 h-6 text-red-500" />
            Regresiones
          </h3>
          <div v-if="exercise?.regressions?.length" class="space-y-3">
            <div 
              v-for="regression in exercise.regressions" 
              :key="regression"
              class="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
              @click="viewExercise(regression)"
            >
              <p class="text-white font-medium">{{ regression }}</p>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <p class="text-slate-400">No hay regresiones definidas</p>
          </div>
        </div>
      </div>

      <!-- Exercise Image -->
      <div v-if="exercise?.photo" class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <UIcon name="i-heroicons-photo" class="w-6 h-6 text-blue-500" />
          Imagen del Ejercicio
        </h3>
        <div class="flex justify-center">
          <img 
            :src="exercise.photo" 
            :alt="exercise.title"
            class="max-w-full h-auto rounded-lg max-h-96 object-contain"
            @click="showImageFullscreen(exercise.photo)"
          />
        </div>
      </div>
    </div>

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
          alt="Imagen del ejercicio en tamaño completo"
          class="max-w-full max-h-full object-contain rounded-lg"
          @click.stop
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExercises } from '~/composables/firestore'

const route = useRoute()
const exerciseId = route.params.id as string

// Reactive state
const isLoading = ref(true)
const exercise = ref<any>(null)
const fullscreenImage = ref<string | null>(null)

// Methods
const goBack = () => {
  navigateTo('/staff/dashboard')
}

const loadExerciseData = async () => {
  if (!exerciseId) return

  isLoading.value = true
  try {
    const { getExerciseById } = useExercises()
    const result = await getExerciseById(exerciseId)
    
    if (result.success && result.exercise) {
      exercise.value = result.exercise
    }
  } catch (error) {
    console.error('Error loading exercise data:', error)
  } finally {
    isLoading.value = false
  }
}

const editExercise = () => {
  // TODO: Implement edit functionality
  console.log('Edit exercise:', exercise.value?.title)
}

const deleteExercise = async () => {
  if (!confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) return

  try {
    const { deleteExercise: deleteExerciseFn } = useExercises()
    const result = await deleteExerciseFn(exerciseId)
    
    if (result.success) {
      console.log('✅ Exercise deleted successfully')
      await navigateTo('/staff/dashboard')
    } else {
      console.error('Error deleting exercise:', result.error)
    }
  } catch (error) {
    console.error('Error deleting exercise:', error)
  }
}

const viewExercise = (exerciseId: string) => {
  navigateTo(`/staff/exercises/${exerciseId}`)
}

const showImageFullscreen = (imageUrl: string) => {
  fullscreenImage.value = imageUrl
}

// Lifecycle
onMounted(async () => {
  await loadExerciseData()
})

// Meta
definePageMeta({
  middleware: 'auth',
  ssr: false
})

useHead({
  title: 'Detalle del Ejercicio - Staff Dashboard',
  meta: [
    { name: 'description', content: 'Detalle del ejercicio en el panel administrativo' }
  ]
})
</script> 