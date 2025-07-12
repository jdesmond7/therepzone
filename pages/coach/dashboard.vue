<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
    <!-- Sidebar -->
    <aside class="fixed top-0 left-0 w-64 h-screen flex flex-col z-30 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700">
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
              <span class="text-white font-bold text-lg">{{ userProfile?.fullName || 'Coach' }}</span>
            </div>
          </div>
        </div>
        
        <nav class="px-4 space-y-2">
          <button 
            @click="currentView = 'overview'"
            :class="currentView === 'overview' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium"
          >
            <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
            Resumen General
          </button>
          
          <button 
            @click="currentView = 'clients'"
            :class="currentView === 'clients' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium"
          >
            <UIcon name="i-heroicons-users" class="w-5 h-5" />
            Mis Clientes
            <span v-if="clientCount > 0" class="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              {{ clientCount }}
            </span>
          </button>
          
          <button 
            @click="currentView = 'exercises'"
            :class="currentView === 'exercises' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium"
          >
            <UIcon name="i-heroicons-academic-cap" class="w-5 h-5" />
            Ejercicios
          </button>
          
          <button 
            @click="currentView = 'workouts'"
            :class="currentView === 'workouts' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium"
          >
            <UIcon name="i-heroicons-fire" class="w-5 h-5" />
            Rutinas
          </button>
          
          <button 
            @click="currentView = 'profile'"
            :class="currentView === 'profile' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium"
          >
            <UIcon name="i-heroicons-user" class="w-5 h-5" />
            Perfil
          </button>
          
          <NuxtLink 
            to="/admin-seed"
            class="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors font-medium"
          >
            <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5" />
            Admin Panel
          </NuxtLink>
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
    <main class="flex-1 flex flex-col ml-64">
      <!-- Header -->
      <header class="px-4 py-6 border-b border-slate-700">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h1 class="text-2xl font-black text-white">{{ currentViewTitle }}</h1>
            <p class="text-slate-400">{{ getCurrentDate() }}</p>
          </div>
          <div class="flex items-end gap-12">
            <div class="text-right">
              <p class="text-white font-semibold text-2xl italic">{{ motivationalPhrase }}</p>
            </div>
            <div class="text-right">
              <p class="text-slate-400 text-sm">Clientes activos</p>
              <p class="text-orange-600 font-bold text-xl">{{ clientCount }} 👥</p>
            </div>
          </div>
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

const currentView = ref('overview')
const { userProfile } = useUserRole()
const { user } = useAuth()

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
  if (!user.value?.uid) return

  try {
    // Load client count
    const { getClientsByCoach } = useUsers()
    const clientsResult = await getClientsByCoach(user.value.uid)
    if (clientsResult.success) {
      clientCount.value = clientsResult.clients?.length || 0
    }

    // Load workout count
    const { getWorkoutsByCoach } = useWorkouts()
    const workoutsResult = await getWorkoutsByCoach(user.value.uid)
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
  if (!user.value?.uid) return
  const { getClientsByCoach } = useUsers()
  const result = await getClientsByCoach(user.value.uid)
  if (result.success) {
    athletes.value = result.clients ?? []
  } else {
    athletes.value = []
  }
}

watch(currentView, (val) => {
  if (val === 'clients') {
    loadAthletes()
  }
}, { immediate: true })

const currentViewTitle = computed(() => {
  const titles: Record<string, string> = {
    'overview': 'Dashboard Coach',
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
</script> 