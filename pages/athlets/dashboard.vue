<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col md:flex-row">
    <!-- Mobile Topbar -->
    <header class="md:hidden fixed top-0 left-0 w-full z-40 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 h-16">
      <TheLogo />
      <button @click="showMobileMenu = true" class="w-10 h-10 flex items-center justify-center border border-white text-white bg-transparent rounded-lg transition-colors hover:bg-white/10 focus:outline-none">
        <UIcon name="i-heroicons-bars-3" class="w-6 h-6" />
      </button>
    </header>
    
    <!-- Mobile Menu Drawer -->
    <transition name="fade">
      <div v-if="showMobileMenu" class="fixed inset-0 z-50 bg-slate-800 flex flex-col">
        <div class="bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 h-16">
          <TheLogo />
          <button @click="showMobileMenu = false" class="text-white focus:outline-none">
            <UIcon name="i-heroicons-x-mark" class="w-8 h-8" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <!-- Bienvenida -->
          <div class="mb-4 bg-slate-700/50 rounded-lg p-3 mt-4">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-slate-300 text-sm">👋 Hola,</span>
              <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-600 text-white rounded-full">
                {{ userStore.userProfile?.role === 'athlete' ? 'Atleta' : (userStore.userProfile?.role || 'Atleta') }}
              </span>
            </div>
            <div>
                          <span v-if="userStore.userProfile" class="text-white font-bold text-lg block max-w-xs break-words">
              {{ userStore.userProfile?.nickname || userStore.userProfile?.fullName || userStore.userProfile?.email || userStore.userProfile?.uid || 'Cliente' }}
            </span>
            </div>
          </div>
          <!-- Links -->
          <nav class="flex flex-col gap-2">
            <button @click="navigate('overview')" :class="navBtnClass('overview')">
              <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
              Resumen
            </button>
            <button @click="navigate('workouts')" :class="navBtnClass('workouts')">
              <UIcon name="i-heroicons-fire" class="w-5 h-5" />
              Mis Entrenamientos
              <span v-if="assignedWorkouts.length > 0" class="ml-auto bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                {{ assignedWorkouts.length }}
              </span>
            </button>
            <button @click="navigate('progress')" :class="navBtnClass('progress')">
              <UIcon name="i-heroicons-chart-pie" class="w-5 h-5" />
              Mi Progreso
            </button>
            <button @click="navigate('exercises')" :class="navBtnClass('exercises')">
              <UIcon name="i-heroicons-academic-cap" class="w-5 h-5" />
              Ejercicios
            </button>
            <button @click="navigate('profile')" :class="navBtnClass('profile')">
              <UIcon name="i-heroicons-user" class="w-5 h-5" />
              Mi Perfil
            </button>
          </nav>
          <button @click="logout" class="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors font-medium cursor-pointer">
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </transition>

    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex fixed top-0 left-0 w-64 h-screen flex-col z-30 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700">
      <div class="flex-1 flex flex-col">
        <div class="px-4 py-6">
          <TheLogo />
          <div class="mt-4 p-3 bg-slate-700/50 rounded-lg">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-slate-300 text-sm">👋 Hola,</span>
              <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-600 text-white rounded-full">
                {{ userStore.userProfile?.role === 'athlete' ? 'Atleta' : (userStore.userProfile?.role || 'Atleta') }}
              </span>
            </div>
            <span v-if="userStore.userProfile" class="text-white font-bold text-lg block max-w-xs whitespace-pre-line break-words overflow-hidden" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
              {{ userStore.userProfile?.nickname || userStore.userProfile?.fullName || userStore.userProfile?.email || userStore.userProfile?.uid || 'Cliente' }}
            </span>
          </div>
        </div>
        
        <nav class="px-4 space-y-2">
          <button 
            @click="currentView = 'overview'"
            :class="navBtnClass('overview')"
          >
            <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
            Resumen
          </button>
          
          <button 
            @click="currentView = 'workouts'"
            :class="navBtnClass('workouts')"
          >
            <UIcon name="i-heroicons-fire" class="w-5 h-5" />
            Mis Entrenamientos
            <span v-if="assignedWorkouts.length > 0" class="ml-auto bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
              {{ assignedWorkouts.length }}
            </span>
          </button>
          
          <button 
            @click="currentView = 'progress'"
            :class="navBtnClass('progress')"
          >
            <UIcon name="i-heroicons-chart-pie" class="w-5 h-5" />
            Mi Progreso
          </button>
          
          <button 
            @click="currentView = 'exercises'"
            :class="navBtnClass('exercises')"
          >
            <UIcon name="i-heroicons-academic-cap" class="w-5 h-5" />
            Ejercicios
          </button>
          
          <button 
            @click="currentView = 'profile'"
            :class="navBtnClass('profile')"
          >
            <UIcon name="i-heroicons-user" class="w-5 h-5" />
            Mi Perfil
          </button>
        </nav>
      </div>
      <div class="px-4 mb-6 mt-auto">
        <button 
          @click="logout"
          class="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors font-medium cursor-pointer"
        >
          <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col md:ml-64 pt-16 md:pt-0">
      <!-- Header -->
      <header class="px-4 py-6 border-b border-slate-700">
        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div class="flex flex-col md:flex-row md:items-center md:gap-4 flex-1">
            <h1 class="text-2xl font-black text-white">{{ currentViewTitle }}</h1>
            <p class="text-slate-400">{{ getCurrentDate() }}</p>
          </div>
        </div>
        <div class="mt-2">
          <p class="text-orange-500 font-semibold text-lg italic">{{ motivationalPhrase }}</p>
        </div>
      </header>

      <!-- Dashboard Content -->
      <div class="flex-1 px-4 py-6 overflow-y-auto">
        <!-- Overview Section -->
        <div v-if="currentView === 'overview'" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <!-- Stats Cards -->
          <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div class="flex items-center gap-4">
              <div class="bg-blue-500/20 p-3 rounded-lg">
                <UIcon name="i-heroicons-fire" class="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p class="text-3xl font-bold text-white">{{ assignedWorkouts.length }}</p>
                <p class="text-slate-400">Entrenamientos Asignados</p>
              </div>
            </div>
          </div>

          <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div class="flex items-center gap-4">
              <div class="bg-green-500/20 p-3 rounded-lg">
                <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-400" />
              </div>
              <div>
                <p class="text-3xl font-bold text-white">{{ stats.completedWorkouts }}</p>
                <p class="text-slate-400">Entrenamientos Completados</p>
              </div>
            </div>
          </div>

          <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div class="flex items-center gap-4">
              <div class="bg-purple-500/20 p-3 rounded-lg">
                <UIcon name="i-heroicons-academic-cap" class="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <p class="text-3xl font-bold text-white">{{ stats.streak }}</p>
                <p class="text-slate-400">Días Seguidos</p>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="lg:col-span-2 xl:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 class="text-xl font-bold text-white mb-4">Actividad Reciente</h3>
            <div class="space-y-4">
              <div class="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
                <div class="bg-green-500/20 p-2 rounded-lg">
                  <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-400" />
                </div>
                <div class="flex-1">
                  <p class="text-white font-medium">Completaste un entrenamiento</p>
                  <p class="text-slate-400 text-sm">Rutina de Pecho y Tríceps</p>
                </div>
                <span class="text-slate-400 text-sm">Hace 2 horas</span>
              </div>
              
              <div class="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
                <div class="bg-orange-500/20 p-2 rounded-lg">
                  <UIcon name="i-heroicons-fire" class="w-6 h-6 text-orange-400" />
                </div>
                <div class="flex-1">
                  <p class="text-white font-medium">Nuevo récord personal</p>
                  <p class="text-slate-400 text-sm">25 flexiones en una serie</p>
                </div>
                <span class="text-slate-400 text-sm">Ayer</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 class="text-xl font-bold text-white mb-4">Acciones Rápidas</h3>
            <div class="space-y-3">
              <AppButtonPrimary
                @click="currentView = 'workouts'"
                fullWidth
                class="cursor-pointer"
              >
                Ver Entrenamientos
              </AppButtonPrimary>
              <AppButtonSecondary
                @click="currentView = 'exercises'"
                fullWidth
                class="cursor-pointer"
              >
                Explorar Ejercicios
              </AppButtonSecondary>
              <AppButtonSecondary
                @click="currentView = 'progress'"
                fullWidth
                class="cursor-pointer"
              >
                Ver Progreso
              </AppButtonSecondary>
            </div>
          </div>
        </div>

        <!-- Workouts Section -->
        <div v-else-if="currentView === 'workouts'" class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-white">Mis Entrenamientos</h2>
            <div class="flex gap-3">
              <select 
                v-model="workoutFilter"
                class="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendientes</option>
                <option value="completed">Completados</option>
              </select>
            </div>
          </div>

          <!-- Workout Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              v-for="assignment in filteredWorkouts" 
              :key="assignment.id"
              class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-orange-600/50 transition-colors"
            >
              <div v-if="assignment.workout" class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-white mb-2">{{ assignment.workout.title }}</h3>
                  <p class="text-slate-400 text-sm mb-3">{{ assignment.workout.description }}</p>
                  <div class="flex items-center gap-4 text-sm">
                    <span class="text-slate-400">⏱️ {{ assignment.workout.estimatedDuration }} min</span>
                    <span class="text-slate-400">🏋️ {{ assignment.workout.exercises?.length || 0 }} ejercicios</span>
                    <span 
                      :class="{
                        'text-green-500': assignment.workout.difficulty === 'principiante',
                        'text-yellow-500': assignment.workout.difficulty === 'intermedio',
                        'text-red-500': assignment.workout.difficulty === 'avanzado'
                      }"
                    >
                      📊 {{ assignment.workout.difficulty }}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <span 
                    :class="{
                      'bg-green-500/20 text-green-400': assignment.status === 'completed',
                      'bg-orange-500/20 text-orange-400': assignment.status === 'pending',
                      'bg-slate-500/20 text-slate-400': assignment.status === 'skipped'
                    }"
                    class="px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {{ getStatusText(assignment.status) }}
                  </span>
                </div>
              </div>
              
              <div class="flex gap-3">
                <button 
                  v-if="assignment.status === 'pending' && assignment.workout"
                  @click="startWorkout(assignment.workout)"
                  class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex-1"
                >
                  ▶️ Empezar
                </button>
                <button 
                  v-else-if="assignment.status === 'completed'"
                  class="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex-1"
                >
                  ✅ Completado
                </button>
                <button class="h-12 bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 rounded-lg transition-colors">
                  👁️ Detalles
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="assignedWorkouts.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">🎯</div>
            <h3 class="text-xl font-bold text-white mb-2">No tienes entrenamientos asignados</h3>
            <p class="text-slate-400 mb-6">Tu coach te asignará entrenamientos personalizados pronto.</p>
            <button 
              @click="currentView = 'exercises'"
              class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
            >
              Explorar Ejercicios
            </button>
          </div>
        </div>

        <!-- Exercises Section -->
        <div v-else-if="currentView === 'exercises'">
          <AthleteExercisesView />
        </div>

        <!-- Progress Section -->
        <div v-else-if="currentView === 'progress'" class="space-y-6">
          <h2 class="text-2xl font-bold text-white">Mi Progreso</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Progress Chart -->
            <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 class="text-xl font-bold text-white mb-4">Progreso Semanal</h3>
              <div class="h-64 flex items-center justify-center">
                <p class="text-slate-400">Gráfico de progreso próximamente...</p>
              </div>
            </div>
            
            <!-- Recent Achievements -->
            <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 class="text-xl font-bold text-white mb-4">Logros Recientes</h3>
              <div class="space-y-4">
                <div 
                  v-for="achievement in recentAchievements" 
                  :key="achievement.id"
                  class="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg"
                >
                  <div class="text-2xl">{{ achievement.emoji }}</div>
                  <div class="flex-1">
                    <h4 class="font-bold text-white text-sm">{{ achievement.title }}</h4>
                    <p class="text-slate-400 text-xs">{{ achievement.date }}</p>
                  </div>
                  <div class="text-right">
                    <!-- Desktop: Número y texto en la misma línea -->
                    <p class="hidden md:block text-orange-600 font-bold">{{ achievement.number }} {{ achievement.text }}</p>
                    <!-- Mobile: Número arriba, texto abajo -->
                    <div class="md:hidden text-center">
                      <p class="text-orange-600 font-bold text-lg">{{ achievement.number }}</p>
                      <p class="text-orange-600 text-sm">{{ achievement.text }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Section -->
        <div v-else-if="currentView === 'profile'" class="-mx-4 -my-6">
          <AthleteProfileView />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAthletes } from '~/composables/athletes'
import { useWorkouts } from '~/composables/firestore'
import type { User, Workout } from '~/composables/firestore'
import { watch, onMounted, ref, computed } from 'vue'
import { useUserStore } from '~/stores/user'
import { useAuth } from '~/composables/firebase'
import { useWorkoutAssignments } from '~/composables/firestore'
import TheLogo from '~/components/shared/TheLogo.vue'
import AppButtonPrimary from '~/components/shared/AppButtonPrimary.vue'
import AppButtonSecondary from '~/components/shared/AppButtonSecondary.vue'
import AthleteProfileView from '~/components/athlete/AthleteProfileView.vue'
import AthleteExercisesView from '~/components/athlete/AthleteExercisesView.vue'

const currentView = ref('overview')
const userStore = useUserStore()
const { user } = useAuth()
const userMenuOpen = ref(false)
const showMobileMenu = ref(false)

// Navigation items
const navigationItems = [
  { view: 'overview', label: 'Resumen', icon: 'i-heroicons-home' },
  { view: 'workouts', label: 'Entrenamientos', icon: 'i-heroicons-fire' },
  { view: 'exercises', label: 'Ejercicios', icon: 'i-heroicons-academic-cap' },
  { view: 'progress', label: 'Progreso', icon: 'i-heroicons-chart-bar' },
  { view: 'profile', label: 'Perfil', icon: 'i-heroicons-user' }
]

// Stats
const stats = ref({
  completedWorkouts: 0,
  streak: 7,
  totalMinutes: 420
})

// Workout data
const assignedWorkouts = ref<any[]>([])
const workoutFilter = ref('all')

// Recent achievements
const recentAchievements = ref([
  {
    id: 1,
    title: "Primera semana completada",
    emoji: "🎉",
    value: "¡7 días!",
    number: "7",
    text: "días",
    date: "Hace 2 días"
  },
  {
    id: 2,
    title: "Nuevo récord personal",
    emoji: "💪",
    value: "25 flexiones",
    number: "25",
    text: "flexiones",
    date: "Hace 3 días"
  },
  {
    id: 3,
    title: "Meta semanal alcanzada",
    emoji: "🎯",
    value: "4/4 entrenamientos",
    number: "4/4",
    text: "entrenamientos",
    date: "Hace 5 días"
  }
])

// Frases motivacionales
const motivationalPhrases = [
  "Una repetición más. Siempre.",
  "El dolor es temporal. El orgullo es para siempre.",
  "Hazlo por ti. Nadie más lo hará.",
  "No es suerte. Es disciplina.",
  "Sé más fuerte que tus excusas.",
  "Cada día cuenta. Cada rep suma.",
  "No tienes que ser el mejor. Solo mejor que ayer.",
  "No hay límites. Solo metas más grandes.",
  "El esfuerzo de hoy es el resultado de mañana.",
  "Entrena como si tu vida dependiera de ello. Porque depende.",
  "Esto es The Repzone. Aquí se viene a mejorar.",
  "No colecciones excusas. Colecciona repeticiones.",
  "Cada zona, cada rep, te define.",
  "El cambio empieza con la primera repetición.",
  "Construye tu cuerpo. Moldea tu mente. Zona por zona."
]

// Seleccionar frase motivacional aleatoria
const motivationalPhrase = ref('')

const getRandomMotivationalPhrase = () => {
  const randomIndex = Math.floor(Math.random() * motivationalPhrases.length)
  motivationalPhrase.value = motivationalPhrases[randomIndex]
}

// Computed
const currentViewTitle = computed(() => {
  const item = navigationItems.find(nav => nav.view === currentView.value)
  return item ? item.label : 'Dashboard'
})

const filteredWorkouts = computed(() => {
  if (workoutFilter.value === 'all') return assignedWorkouts.value
  return assignedWorkouts.value.filter(w => w.status === workoutFilter.value)
})

// Methods
const navigate = (view: string) => {
  currentView.value = view
  showMobileMenu.value = false
}

const navBtnClass = (view: string) => {
  return [
    'w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors font-medium cursor-pointer',
    currentView.value === view ? 'bg-slate-700/50 text-white' : ''
  ]
}

const getCurrentDate = () => {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'Pendiente',
    'completed': 'Completado',
    'skipped': 'Omitido'
  }
  return statusMap[status] || status
}

const startWorkout = (workout: Workout) => {
  // TODO: Implement workout starting logic
  console.log('Starting workout:', workout.title)
  alert(`¡Iniciando ${workout.title}! (Funcionalidad en desarrollo)`)
}

const loadClientData = async () => {
  if (!user.value?.uid) return

  try {
    // Load user profile
    await loadUserProfile()

    // Load assigned workouts
    const { getClientAssignments } = useWorkoutAssignments()
    const { getWorkoutById } = useWorkouts()
    
    const assignmentsResult = await getClientAssignments(user.value.uid)
    if (assignmentsResult.success && assignmentsResult.assignments) {
      // Get workout details for each assignment
      const workoutsWithDetails = await Promise.all(
        assignmentsResult.assignments.map(async (assignment) => {
          const workoutResult = await getWorkoutById(assignment.workoutId)
          return {
            ...assignment,
            workout: workoutResult.success ? workoutResult.workout : undefined
          }
        })
      )
      
      assignedWorkouts.value = workoutsWithDetails
      
      // Update stats
      stats.value.completedWorkouts = workoutsWithDetails.filter(w => w.status === 'completed').length
    }
  } catch (error) {
    console.error('Error loading client data:', error)
  }
}

const loadUserProfile = async () => {
  if (!user.value?.uid) {
    console.log('⚠️ [Athlete Dashboard] No user UID disponible')
    return
  }
  
  try {
    console.log('🔄 [Athlete Dashboard] Cargando perfil del atleta con UID:', user.value.uid)
    const { getAthleteByAuthUID } = useAthletes()
    const result = await getAthleteByAuthUID(user.value.uid)
    console.log('📊 [Athlete Dashboard] Resultado de getAthleteByAuthUID:', result)
    
    if (result.success && result.athlete) {
      userStore.userProfile = result.athlete
      console.log('✅ [Athlete Dashboard] Perfil cargado exitosamente:', {
        nickname: result.athlete.nickname,
        fullName: result.athlete.fullName,
        firstName: result.athlete.firstName,
        lastName: result.athlete.lastName,
        email: result.athlete.email,
        role: result.athlete.role
      })
    } else {
      console.error('❌ [Athlete Dashboard] Error cargando perfil:', result.error)
    }
  } catch (error) {
    console.error('❌ [Athlete Dashboard] Error loading user profile:', error)
  }
}

const logout = async () => {
  try {
    const { logout: firebaseLogout } = useAuth()
    await firebaseLogout()
    await navigateTo('/login')
  } catch (error) {
    console.error('Error during logout:', error)
  }
}

// Lifecycle
onMounted(async () => {
  getRandomMotivationalPhrase()
  await loadClientData()
  
  // Watch for user changes
  watch(user, async (newUser) => {
    if (newUser?.uid) {
      await loadClientData()
    } else {
      assignedWorkouts.value = []
      stats.value = { completedWorkouts: 0, streak: 7, totalMinutes: 420 }
    }
  }, { immediate: true })
})

// Close user menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      userMenuOpen.value = false
    }
  })
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Ocultar scrollbar pero mantener funcionalidad */
.scrollbar-hide {
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Safari and Chrome */
}

/* Mejorar la experiencia de scroll en mobile */
@media (max-width: 768px) {
  .snap-x {
    scroll-snap-type: x mandatory;
  }
  .snap-center {
    scroll-snap-align: center;
  }
}
</style> 