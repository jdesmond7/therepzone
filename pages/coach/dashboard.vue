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
                Coach
              </span>
            </div>
            <div>
              <span v-if="userStore.userProfile" class="text-white font-bold text-lg block max-w-xs break-words">
                {{ userStore.userProfile?.nickname || userStore.userProfile?.fullName || userStore.userProfile?.email || userStore.userProfile?.id || 'Coach' }}
              </span>
            </div>
          </div>
          <!-- Links -->
          <nav class="flex flex-col gap-2">
            <button @click="navigate('overview')" :class="navBtnClass('overview')">
              <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
              Resumen General
            </button>
            <button @click="navigate('clients')" :class="navBtnClass('clients')">
              <UIcon name="i-heroicons-users" class="w-5 h-5" />
              Mis Clientes
            </button>
            <button @click="navigate('exercises')" :class="navBtnClass('exercises')">
              <UIcon name="i-heroicons-academic-cap" class="w-5 h-5" />
              Ejercicios
            </button>
            <button @click="navigate('workouts')" :class="navBtnClass('workouts')">
              <UIcon name="i-heroicons-fire" class="w-5 h-5" />
              Rutinas
            </button>
            <button @click="navigate('profile')" :class="navBtnClass('profile')">
              <UIcon name="i-heroicons-user" class="w-5 h-5" />
              Perfil
            </button>
          </nav>
          <button @click="logout" class="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors font-medium">
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </transition>
    <!-- Sidebar Desktop -->
    <aside class="hidden md:flex fixed top-0 left-0 w-64 h-screen flex-col z-30 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700">
      <div class="flex-1 flex flex-col">
        <div class="px-4 py-6">
          <TheLogo />
          <div class="mt-4 p-3 bg-slate-700/50 rounded-lg">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-slate-300 text-sm">👋 Hola,</span>
              <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-600 text-white rounded-full">
                Coach
              </span>
            </div>
            <div>
              <span v-if="userStore.userProfile" class="text-white font-bold text-lg block max-w-xs break-words">
                {{ userStore.userProfile?.nickname || userStore.userProfile?.fullName || userStore.userProfile?.email || userStore.userProfile?.id || 'Coach' }}
              </span>
            </div>
          </div>
        </div>
        <nav class="px-4 space-y-2">
          <button @click="currentView = 'overview'" :class="navBtnClass('overview')">
            <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
            Resumen General
          </button>
          <button @click="currentView = 'clients'" :class="navBtnClass('clients')">
            <UIcon name="i-heroicons-users" class="w-5 h-5" />
            Mis Clientes
            <span v-if="clientCount > 0" class="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              {{ clientCount }}
            </span>
          </button>
          <button @click="currentView = 'exercises'" :class="navBtnClass('exercises')">
            <UIcon name="i-heroicons-academic-cap" class="w-5 h-5" />
            Ejercicios
          </button>
          <button @click="currentView = 'workouts'" :class="navBtnClass('workouts')">
            <UIcon name="i-heroicons-fire" class="w-5 h-5" />
            Rutinas
          </button>
          <button @click="currentView = 'profile'" :class="navBtnClass('profile')">
            <UIcon name="i-heroicons-user" class="w-5 h-5" />
            Perfil
          </button>
        </nav>
      </div>
      <div class="px-4 mb-6 mt-auto">
        <button @click="logout" class="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors font-medium">
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
      <div class="flex-1 px-4 py-6">
        <!-- Overview Section -->
        <div v-if="currentView === 'overview'" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <!-- Stats Cards -->
          <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div class="flex items-center gap-4">
              <div class="bg-blue-500/20 p-3 rounded-lg">
                <UIcon name="i-heroicons-users" class="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p class="text-3xl font-bold text-white">{{ clientCount }}</p>
                <p class="text-slate-400">Clientes Activos</p>
              </div>
            </div>
          </div>

          <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div class="flex items-center gap-4">
              <div class="bg-green-500/20 p-3 rounded-lg">
                <UIcon name="i-heroicons-fire" class="w-8 h-8 text-green-400" />
              </div>
              <div>
                <p class="text-3xl font-bold text-white">{{ workoutCount }}</p>
                <p class="text-slate-400">Rutinas Creadas</p>
              </div>
            </div>
          </div>

          <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div class="flex items-center gap-4">
              <div class="bg-purple-500/20 p-3 rounded-lg">
                <UIcon name="i-heroicons-academic-cap" class="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <p class="text-3xl font-bold text-white">{{ exerciseCount }}</p>
                <p class="text-slate-400">Ejercicios Disponibles</p>
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
                  <p class="text-white font-medium">Cliente completó rutina</p>
                  <p class="text-slate-400 text-sm">Juan Pérez - Rutina de Pecho y Tríceps</p>
                </div>
                <span class="text-slate-400 text-sm">Hace 2 horas</span>
              </div>
              
              <div class="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
                <div class="bg-blue-500/20 p-2 rounded-lg">
                  <UIcon name="i-heroicons-user-plus" class="w-6 h-6 text-blue-400" />
                </div>
                <div class="flex-1">
                  <p class="text-white font-medium">Nuevo cliente agregado</p>
                  <p class="text-slate-400 text-sm">María García se unió a tu programa</p>
                </div>
                <span class="text-slate-400 text-sm">Ayer</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 class="text-xl font-bold text-white mb-4">Acciones Rápidas</h3>
            <div class="space-y-3">
              <button 
                @click="currentView = 'workouts'"
                class="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Crear Rutina
              </button>
              <button 
                @click="currentView = 'exercises'"
                class="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Añadir Ejercicio
              </button>
              <button 
                @click="currentView = 'clients'"
                class="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Ver Clientes
              </button>
            </div>
          </div>
        </div>

        <!-- Clients Section -->
        <div v-else-if="currentView === 'clients'">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="athlete in athletes" :key="athlete.id" class="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col gap-2 shadow">
              <div class="flex items-center gap-4 mb-2">
                <div class="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold text-orange-500">
                  <span v-if="athlete.profilePhoto">
                    <img :src="athlete.profilePhoto" class="w-14 h-14 rounded-full object-cover" />
                  </span>
                  <span v-else>{{ athlete.firstName?.charAt(0) }}{{ athlete.lastName?.charAt(0) }}</span>
                </div>
                <div>
                  <div class="text-lg font-bold text-white">{{ athlete.fullName || (athlete.firstName + ' ' + athlete.lastName) }}</div>
                  <div class="text-slate-400 text-sm">{{ athlete.email }}</div>
                </div>
              </div>
              <div class="flex gap-2 text-slate-400 text-sm">
                <span v-if="athlete.city">🏙️ {{ athlete.city }}</span>
                <span v-if="athlete.country">🌎 {{ athlete.country }}</span>
              </div>
              <!-- Aquí puedes agregar más info: estado de pago, fecha de vencimiento, etc. -->
            </div>
          </div>
        </div>

        <!-- Exercises Section -->
        <div v-else-if="currentView === 'exercises'">
          <CoachExercisesView />
        </div>

        <!-- Workouts Section -->
        <div v-else-if="currentView === 'workouts'">
          <CoachWorkoutsView />
        </div>

        <!-- Other Views Placeholder -->
        <div v-else class="text-center py-12">
          <h2 class="text-2xl font-bold text-white">{{ currentViewTitle }}</h2>
          <p class="text-slate-400 mt-2">Contenido próximamente...</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Coach Dashboard for THEREPZONE
import { useUsers, useExercises, useWorkouts } from '~/composables/firestore'
import type { User } from '~/composables/firestore'
import { watch, onMounted, ref, isRef, computed, unref } from 'vue'
import { useUserStore } from '~/stores/user'
import { useAuth } from '~/composables/firebase'

const currentView = ref('overview')
// Elimina la copia local userProfile, usa directamente userStore.userProfile
const userStore = useUserStore()

// Elimina logs directos de userStore.userProfile.value fuera de watchers o template

onMounted(() => {
  const auth = useAuth()
  const userRef = auth && auth.user && isRef(auth.user) ? auth.user : null
  if (userRef && userRef.value && !userStore.userProfile) {
    userStore.loadUserProfile(userRef.value.uid)
  }
  if (userRef) {
    watch(
      () => userRef.value ? userRef.value.uid : null,
      (uid) => {
        if (uid) {
          userStore.loadUserProfile(uid)
        }
      },
      { immediate: true }
    )
  }
})

// Stats
const clientCount = ref(0)
const workoutCount = ref(0)
const exerciseCount = ref(0)

// Frases motivacionales
const motivationalPhrases = [
  // Cortas y potentes
  "Una repetición más. Siempre.",
  "El dolor es temporal. El orgullo es para siempre.",
  "Hazlo por ti. Nadie más lo hará.",
  "No es suerte. Es disciplina.",
  "Sé más fuerte que tus excusas.",
  // Inspiradoras
  "Cada día cuenta. Cada rep suma.",
  "No tienes que ser el mejor. Solo mejor que ayer.",
  "No hay límites. Solo metas más grandes.",
  "El esfuerzo de hoy es el resultado de mañana.",
  "Entrena como si tu vida dependiera de ello. Porque depende.",
  // Identidad de marca
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

const getCurrentDate = () => {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Initialize Firebase auth only on client
const firebaseLogout = ref<any>(null)

onMounted(async () => {
  try {
    const { logout } = useAuth()
    firebaseLogout.value = logout
    
    // Initialize motivational phrase
    getRandomMotivationalPhrase()
    
    // Load stats
    await loadStats()
  } catch (error) {
    console.error('Error initializing coach dashboard:', error)
  }
})

const loadStats = async () => {
  const uid = getUserUid()
  if (!uid) return

  try {
    // Load client count
    const { getClientsByCoach } = useUsers()
    const clientsResult = await getClientsByCoach(uid)
    if (clientsResult.success) {
      clientCount.value = clientsResult.clients?.length || 0
    }

    // Load workout count
    const { getWorkoutsByCoach } = useWorkouts()
    const workoutsResult = await getWorkoutsByCoach(uid)
    if (workoutsResult.success) {
      workoutCount.value = workoutsResult.workouts?.length || 0
    }

    // Load exercise count (all exercises for now)
    const { getExercises } = useExercises()
    const exercisesResult = await getExercises()
    if (exercisesResult.success) {
      exerciseCount.value = exercisesResult.exercises?.length || 0
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const athletes = ref<User[]>([])

const loadAthletes = async () => {
  const uid = getUserUid()
  if (!uid) return
  const { getClientsByCoach } = useUsers()
  const result = await getClientsByCoach(uid)
  console.log('[CoachDashboard] Resultado getClientsByCoach:', result)
  if (result.success) {
    athletes.value = result.clients ?? []
  } else {
    athletes.value = []
  }
}

// Safe watcher for current view and user profile
watch(
  [
    currentView,
    () => {
      try {
        return userStore.userProfile?.uid || null
      } catch (e) {
        return null
      }
    }
  ],
  ([view, uid]) => {
    if (view === 'clients' && uid) {
      loadStats();
      loadAthletes();
    }
  },
  { immediate: true }
)

// Watch para cargar clientes cuando el perfil esté listo
watch(
  () => {
    try {
      return userStore.userProfile?.uid || null
    } catch (e) {
      return null
    }
  },
  (uid) => {
    if (uid) {
      loadStats();
      loadAthletes();
    }
  },
  { immediate: true }
)

// Safe watcher for userProfile
watchEffect(() => {
  try {
    if (userStore.userProfile) {
      // console.log('userProfile actualizado:', userStore.userProfile)
    }
  } catch (e) {
    // Ignore errors during hydration
  }
})

const currentViewTitle = computed(() => {
  const titles: Record<string, string> = {
    'overview': 'Resumen',
    'clients': 'Mis Clientes',
    'exercises': 'Ejercicios',
    'workouts': 'Rutinas',
    'profile': 'Perfil'
  }
  return titles[currentView.value] || 'Dashboard'
})

const logout = async () => {
  try {
    if (firebaseLogout.value) {
      const result = await firebaseLogout.value()
      if (result.success) {
        await navigateTo('/')
      }
    } else {
      await navigateTo('/')
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    await navigateTo('/')
  }
}

// Protect the dashboard route and disable SSR for Firebase compatibility
definePageMeta({
  middleware: 'auth',
  ssr: false
})

useHead({
  title: 'Dashboard Coach - THEREPZONE',
  meta: [
    { name: 'description', content: 'Panel de control para coaches' }
  ]
})

const showMobileMenu = ref(false)

function navBtnClass(view: string) {
  return [
    'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium',
    currentView.value === view
      ? 'bg-orange-600 text-white'
      : 'text-slate-300 hover:text-white hover:bg-slate-700'
  ]
}

function navigate(view: string) {
  currentView.value = view
  showMobileMenu.value = false
}

// Helper seguro para obtener el uid del usuario
const getUserUid = () => {
  try {
    return userStore.userProfile?.uid || userStore.userProfile?.id || null
  } catch (e) {
    return null
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 