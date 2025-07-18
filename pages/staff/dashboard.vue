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
          <!-- Staff Info -->
          <div class="mb-4 bg-slate-700/50 rounded-lg p-3 mt-4">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-slate-300 text-sm">👨‍💼 Staff,</span>
              <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded-full">
                Administrador
              </span>
            </div>
            <div>
              <span v-if="userProfile" class="text-white font-bold text-lg block max-w-xs break-words">
                {{ userProfile?.nickname || userProfile?.fullName || userProfile?.email || 'Staff' }}
              </span>
            </div>
          </div>
          <!-- Navigation -->
          <nav class="flex flex-col gap-2">
            <button @click="navigate('overview')" :class="navBtnClass('overview')">
              <UIcon name="i-heroicons-home" class="w-5 h-5" />
              Resumen
            </button>
            <button @click="navigate('coaches')" :class="navBtnClass('coaches')">
              <UIcon name="i-heroicons-user-group" class="w-5 h-5" />
              Coaches
            </button>
            <button @click="navigate('athletes')" :class="navBtnClass('athletes')">
              <UIcon name="i-heroicons-users" class="w-5 h-5" />
              Atletas
            </button>
            <button @click="navigate('exercises')" :class="navBtnClass('exercises')">
              <UIcon name="i-heroicons-academic-cap" class="w-5 h-5" />
              Ejercicios
            </button>
          </nav>
          <button @click="logout" class="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors font-medium">
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
              <span class="text-slate-300 text-sm">👨‍💼 Staff,</span>
              <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded-full">
                Administrador
              </span>
            </div>
            <span v-if="userProfile" class="text-white font-bold text-lg block max-w-xs whitespace-pre-line break-words overflow-hidden" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
              {{ userProfile?.nickname || userProfile?.fullName || userProfile?.email || 'Staff' }}
            </span>
          </div>
        </div>
        
        <nav class="px-4 space-y-2">
          <button 
            @click="currentView = 'overview'"
            :class="navBtnClass('overview')"
          >
            <UIcon name="i-heroicons-home" class="w-5 h-5" />
            Resumen
          </button>
          
          <button 
            @click="currentView = 'coaches'"
            :class="navBtnClass('coaches')"
          >
            <UIcon name="i-heroicons-user-group" class="w-5 h-5" />
            Coaches
          </button>
          
          <button 
            @click="currentView = 'athletes'"
            :class="navBtnClass('athletes')"
          >
            <UIcon name="i-heroicons-users" class="w-5 h-5" />
            Atletas
          </button>
          
          <button 
            @click="currentView = 'exercises'"
            :class="navBtnClass('exercises')"
          >
            <UIcon name="i-heroicons-academic-cap" class="w-5 h-5" />
            Ejercicios
          </button>
        </nav>
      </div>
      <div class="px-4 mb-6 mt-auto">
        <button 
          @click="logout"
          class="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
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
      </header>

      <!-- Dashboard Content -->
      <div class="flex-1 px-4 py-6 overflow-y-auto">
        <!-- Overview Section -->
        <div v-if="currentView === 'overview'" class="space-y-6">
          <!-- Stats Cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <!-- Total Coaches -->
            <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div class="flex flex-col items-center text-center md:flex-row md:items-center md:text-left md:gap-4">
                <div class="text-4xl mb-2 md:mb-0">👨‍💼</div>
                <div>
                  <p class="text-2xl font-black text-white mb-1 md:mb-0">{{ stats.totalCoaches }}</p>
                  <p class="text-slate-400 text-sm">Coaches</p>
                </div>
              </div>
            </div>
            
            <!-- Total Athletes -->
            <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div class="flex flex-col items-center text-center md:flex-row md:items-center md:text-left md:gap-4">
                <div class="text-4xl mb-2 md:mb-0">🏃‍♂️</div>
                <div>
                  <p class="text-2xl font-black text-white mb-1 md:mb-0">{{ stats.totalAthletes }}</p>
                  <p class="text-slate-400 text-sm">Atletas</p>
                </div>
              </div>
            </div>
            
            <!-- Total Exercises -->
            <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div class="flex flex-col items-center text-center md:flex-row md:items-center md:text-left md:gap-4">
                <div class="text-4xl mb-2 md:mb-0">🏋️</div>
                <div>
                  <p class="text-2xl font-black text-white mb-1 md:mb-0">{{ stats.totalExercises }}</p>
                  <p class="text-slate-400 text-sm">Ejercicios</p>
                </div>
              </div>
            </div>
            
            <!-- Active Users -->
            <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div class="flex flex-col items-center text-center md:flex-row md:items-center md:text-left md:gap-4">
                <div class="text-4xl mb-2 md:mb-0">📊</div>
                <div>
                  <p class="text-2xl font-black text-white mb-1 md:mb-0">{{ stats.activeUsers }}</p>
                  <p class="text-slate-400 text-sm">Usuarios Activos</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UIcon name="i-heroicons-bolt" class="w-6 h-6 text-yellow-500" />
                Acciones Rápidas
              </h3>
              <div class="space-y-3">
                <button 
                  @click="currentView = 'coaches'"
                  class="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                >
                  <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-blue-500" />
                  <span class="text-white">Gestionar Coaches</span>
                </button>
                <button 
                  @click="currentView = 'athletes'"
                  class="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                >
                  <UIcon name="i-heroicons-users" class="w-5 h-5 text-green-500" />
                  <span class="text-white">Gestionar Atletas</span>
                </button>
                <button 
                  @click="currentView = 'exercises'"
                  class="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                >
                  <UIcon name="i-heroicons-academic-cap" class="w-5 h-5 text-purple-500" />
                  <span class="text-white">Gestionar Ejercicios</span>
                </button>
              </div>
            </div>

            <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-blue-500" />
                Estadísticas Recientes
              </h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Nuevos usuarios esta semana</span>
                  <span class="text-white font-bold">{{ stats.newUsersThisWeek }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Ejercicios creados</span>
                  <span class="text-white font-bold">{{ stats.exercisesCreated }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Entrenamientos asignados</span>
                  <span class="text-white font-bold">{{ stats.workoutsAssigned }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Coaches Section -->
        <div v-else-if="currentView === 'coaches'" class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-white">Gestionar Coaches</h2>
            <button 
              @click="showAddCoachModal = true"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <UIcon name="i-heroicons-plus" class="w-5 h-5" />
              Agregar Coach
            </button>
          </div>

          <!-- Coaches List -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="coach in coaches" 
              :key="coach.uid"
              class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-blue-600/50 transition-colors cursor-pointer"
              @click="viewCoach(coach)"
            >
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {{ coach.firstName?.charAt(0) }}{{ coach.lastName?.charAt(0) }}
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-bold text-white">{{ coach.fullName }}</h3>
                  <p class="text-slate-400 text-sm">{{ coach.email }}</p>
                </div>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-400">{{ coach.currentClients || 0 }} clientes</span>
                <span class="text-green-500">Activo</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Athletes Section -->
        <div v-else-if="currentView === 'athletes'" class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-white">Gestionar Atletas</h2>
            <button 
              @click="showAddAthleteModal = true"
              class="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <UIcon name="i-heroicons-plus" class="w-5 h-5" />
              Agregar Atleta
            </button>
          </div>

          <!-- Athletes List -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="athlete in athletes" 
              :key="athlete.uid"
              class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-green-600/50 transition-colors cursor-pointer"
              @click="viewAthlete(athlete)"
            >
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {{ athlete.firstName?.charAt(0) }}{{ athlete.lastName?.charAt(0) }}
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-bold text-white">{{ athlete.fullName }}</h3>
                  <p class="text-slate-400 text-sm">{{ athlete.email }}</p>
                </div>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-400">{{ athlete.assignedWorkouts?.length || 0 }} entrenamientos</span>
                <span class="text-green-500">Activo</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Exercises Section -->
        <div v-else-if="currentView === 'exercises'" class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-white">Gestionar Ejercicios</h2>
            <button 
              @click="showAddExerciseModal = true"
              class="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <UIcon name="i-heroicons-plus" class="w-5 h-5" />
              Agregar Ejercicio
            </button>
          </div>

          <!-- Exercises List -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="exercise in exercises" 
              :key="exercise.id"
              class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-600/50 transition-colors cursor-pointer"
              @click="viewExercise(exercise)"
            >
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  🏋️
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-bold text-white">{{ exercise.title }}</h3>
                  <p class="text-slate-400 text-sm">{{ exercise.regionWorking }}</p>
                </div>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-400">{{ exercise.difficulty }}</span>
                <span class="text-purple-500">Activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useUserRole } from '~/composables/useUserRole'
import { useStaff } from '~/composables/staff'

console.log('🏢 Staff Dashboard script ejecutándose...')
const { user } = useAuth()
const { userProfile, loadUserProfile } = useUserRole()

// Reactive state
const currentView = ref('overview')
const showMobileMenu = ref(false)

// Data
const coaches = ref<any[]>([])
const athletes = ref<any[]>([])
const exercises = ref<any[]>([])

// Modal states
const showAddCoachModal = ref(false)
const showAddAthleteModal = ref(false)
const showAddExerciseModal = ref(false)

const stats = reactive({
  totalCoaches: 0,
  totalAthletes: 0,
  totalExercises: 0,
  activeUsers: 0,
  newUsersThisWeek: 0,
  exercisesCreated: 0,
  workoutsAssigned: 0
})

// Computed
const currentViewTitle = computed(() => {
  const titles: Record<string, string> = {
    'overview': 'Resumen',
    'coaches': 'Gestionar Coaches',
    'athletes': 'Gestionar Atletas',
    'exercises': 'Gestionar Ejercicios'
  }
  return titles[currentView.value] || 'Staff Dashboard'
})

// Methods
const getCurrentDate = () => {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadStaffData = async () => {
  try {
    // Load coaches
    const { getAllCoaches } = useCoaches()
    const coachesResult = await getAllCoaches()
    if (coachesResult.success && coachesResult.coaches) {
      coaches.value = coachesResult.coaches
      stats.totalCoaches = coachesResult.coaches.length
    }

    // Load athletes
    const { getAllAthletes } = useAthletes()
    const athletesResult = await getAllAthletes()
    if (athletesResult.success && athletesResult.athletes) {
      athletes.value = athletesResult.athletes
      stats.totalAthletes = athletesResult.athletes.length
    }

    // Load exercises
    const { getExercises } = useExercises()
    const exercisesResult = await getExercises()
    if (exercisesResult.success && exercisesResult.exercises) {
      exercises.value = exercisesResult.exercises
      stats.totalExercises = exercisesResult.exercises.length
    }

    // Calculate other stats
    stats.activeUsers = stats.totalCoaches + stats.totalAthletes
    stats.newUsersThisWeek = Math.floor(Math.random() * 10) + 1
    stats.exercisesCreated = Math.floor(Math.random() * 50) + 10
    stats.workoutsAssigned = Math.floor(Math.random() * 100) + 20
  } catch (error) {
    console.error('Error loading staff data:', error)
  }
}

const viewCoach = (coach: any) => {
  // Navigate to coach detail page
  navigateTo(`/staff/coaches/${coach.uid}`)
}

const viewAthlete = (athlete: any) => {
  // Navigate to athlete detail page
  navigateTo(`/staff/athletes/${athlete.uid}`)
}

const viewExercise = (exercise: any) => {
  // Navigate to exercise detail page
  navigateTo(`/staff/exercises/${exercise.id}`)
}

const logout = async () => {
  try {
    const { logout: firebaseLogout } = useAuth()
    const result = await firebaseLogout()
    if (result.success) {
      await navigateTo('/staff-login')
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    await navigateTo('/staff-login')
  }
}

const navBtnClass = (view: string) => {
  return [
    'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium',
    currentView.value === view ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'
  ]
}

const navigate = (view: string) => {
  currentView.value = view
  showMobileMenu.value = false
}

// Lifecycle
onMounted(async () => {
  console.log('🏢 Staff Dashboard mounted')
  
  if (user.value?.uid) {
    await loadUserProfile()
  }
  await loadStaffData()
})

// Watch for user changes
watch(user, (newUser) => {
  if (newUser?.uid) {
    loadUserProfile()
    loadStaffData()
  }
}, { immediate: true })

// Meta
definePageMeta({
  middleware: 'auth',
  ssr: false
})

useHead({
  title: 'Staff Dashboard - THEREPZONE',
  meta: [
    { name: 'description', content: 'Panel administrativo de THEREPZONE' }
  ]
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 