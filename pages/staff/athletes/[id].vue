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
            <h1 class="text-2xl font-black text-white">Detalle del Atleta</h1>
            <p class="text-slate-400">{{ athlete?.fullName }}</p>
          </div>
        </div>
        
        <!-- View Mode Toggle -->
        <div class="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
          <button 
            @click="viewMode = 'athlete'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              viewMode === 'athlete' 
                ? 'bg-green-600 text-white' 
                : 'text-slate-400 hover:text-white'
            ]"
          >
            Como Atleta
          </button>
          <button 
            @click="viewMode = 'coach'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              viewMode === 'coach' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:text-white'
            ]"
          >
            Como Coach
          </button>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 border-solid"></div>
    </div>

    <!-- Athlete View -->
    <div v-else-if="viewMode === 'athlete'" class="p-6 space-y-6">
      <!-- Athlete Profile Card -->
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div class="flex items-start gap-6">
          <div class="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {{ athlete?.firstName?.charAt(0) }}{{ athlete?.lastName?.charAt(0) }}
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-white mb-2">{{ athlete?.fullName }}</h2>
            <p class="text-slate-400 mb-4">{{ athlete?.email }}</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <p class="text-2xl font-bold text-white">{{ athleteStats.assignedWorkouts }}</p>
                <p class="text-slate-400 text-sm">Entrenamientos</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-white">{{ athleteStats.completedWorkouts }}</p>
                <p class="text-slate-400 text-sm">Completados</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-white">{{ athleteStats.streak }}</p>
                <p class="text-slate-400 text-sm">Días Seguidos</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-white">{{ athleteStats.totalMinutes }}</p>
                <p class="text-slate-400 text-sm">Minutos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Athlete Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Personal Info -->
        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-user" class="w-6 h-6 text-green-500" />
            Información Personal
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-slate-400">Nombre completo</span>
              <span class="text-white">{{ athlete?.fullName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Email</span>
              <span class="text-white">{{ athlete?.email }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Teléfono</span>
              <span class="text-white">{{ athlete?.phone || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Género</span>
              <span class="text-white">{{ athlete?.gender || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Fecha de nacimiento</span>
              <span class="text-white">{{ athlete?.birthDate || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">País</span>
              <span class="text-white">{{ athlete?.country || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Ciudad</span>
              <span class="text-white">{{ athlete?.city || 'No especificado' }}</span>
            </div>
          </div>
        </div>

        <!-- Progress Info -->
        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-orange-500" />
            Progreso del Atleta
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-slate-400">Fecha de inicio</span>
              <span class="text-white">{{ athlete?.startDate ? new Date(athlete.startDate).toLocaleDateString() : 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Perfil completado</span>
              <span :class="athlete?.profileCompleted ? 'text-green-500' : 'text-red-500'">
                {{ athlete?.profileCompleted ? 'Sí' : 'No' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Coach asignado</span>
              <span class="text-white">{{ assignedCoach?.fullName || 'No asignado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Nickname</span>
              <span class="text-white">{{ athlete?.nickname || 'No especificado' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Assigned Workouts -->
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <UIcon name="i-heroicons-fire" class="w-6 h-6 text-orange-500" />
          Entrenamientos Asignados ({{ assignedWorkouts.length }})
        </h3>
        <div v-if="assignedWorkouts.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="assignment in assignedWorkouts" 
            :key="assignment.id"
            class="bg-slate-700/50 rounded-lg p-4"
          >
            <div class="flex items-start justify-between mb-3">
              <h4 class="text-white font-bold">{{ assignment.workout?.title }}</h4>
              <span 
                :class="{
                  'text-green-500': assignment.status === 'completed',
                  'text-yellow-500': assignment.status === 'pending',
                  'text-red-500': assignment.status === 'skipped'
                }"
                class="text-sm font-medium"
              >
                {{ getStatusText(assignment.status) }}
              </span>
            </div>
            <p class="text-slate-400 text-sm mb-3">{{ assignment.workout?.description }}</p>
            <div class="flex items-center gap-4 text-sm">
              <span class="text-slate-400">⏱️ {{ assignment.workout?.estimatedDuration }} min</span>
              <span class="text-slate-400">🏋️ {{ assignment.workout?.exercises?.length || 0 }} ejercicios</span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <p class="text-slate-400">No hay entrenamientos asignados</p>
        </div>
      </div>
    </div>

    <!-- Coach View -->
    <div v-else class="p-6 space-y-6">
      <!-- Coach Profile Card -->
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div class="flex items-start gap-6">
          <div class="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {{ athlete?.firstName?.charAt(0) }}{{ athlete?.lastName?.charAt(0) }}
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-white mb-2">{{ athlete?.fullName }}</h2>
            <p class="text-slate-400 mb-4">{{ athlete?.email }}</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <p class="text-2xl font-bold text-white">{{ coachStats.currentClients }}</p>
                <p class="text-slate-400 text-sm">Clientes</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-white">{{ coachStats.maxClients }}</p>
                <p class="text-slate-400 text-sm">Máximo</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-white">{{ coachStats.experience }}</p>
                <p class="text-slate-400 text-sm">Años Exp.</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-white">{{ coachStats.specialties }}</p>
                <p class="text-slate-400 text-sm">Especialidades</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Coach Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Personal Info -->
        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-user" class="w-6 h-6 text-blue-500" />
            Información Personal
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-slate-400">Nombre completo</span>
              <span class="text-white">{{ athlete?.fullName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Email</span>
              <span class="text-white">{{ athlete?.email }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Teléfono</span>
              <span class="text-white">{{ athlete?.phone || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Género</span>
              <span class="text-white">{{ athlete?.gender || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Fecha de nacimiento</span>
              <span class="text-white">{{ athlete?.birthDate || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">País</span>
              <span class="text-white">{{ athlete?.country || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Ciudad</span>
              <span class="text-white">{{ athlete?.city || 'No especificado' }}</span>
            </div>
          </div>
        </div>

        <!-- Professional Info -->
        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-academic-cap" class="w-6 h-6 text-green-500" />
            Información Profesional
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-slate-400">Años de experiencia</span>
              <span class="text-white">{{ coachStats.experience }} años</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Disponible</span>
              <span class="text-green-500">Sí</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Tarifa por hora</span>
              <span class="text-white">$50</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Clientes actuales</span>
              <span class="text-white">{{ coachStats.currentClients }}/{{ coachStats.maxClients }}</span>
            </div>
          </div>

          <!-- Specialties -->
          <div class="mt-6">
            <h4 class="text-lg font-bold text-white mb-3">Especialidades</h4>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                Fuerza
              </span>
              <span class="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                Cardio
              </span>
              <span class="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                Flexibilidad
              </span>
            </div>
          </div>

          <!-- Certifications -->
          <div class="mt-6">
            <h4 class="text-lg font-bold text-white mb-3">Certificaciones</h4>
            <div class="space-y-2">
              <div class="p-3 bg-slate-700/50 rounded-lg">
                <p class="text-white font-medium">Personal Trainer Certificado</p>
              </div>
              <div class="p-3 bg-slate-700/50 rounded-lg">
                <p class="text-white font-medium">Especialista en Nutrición Deportiva</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Clients List -->
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <UIcon name="i-heroicons-users" class="w-6 h-6 text-purple-500" />
          Clientes Asignados ({{ clients.length }})
        </h3>
        <div v-if="clients.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="client in clients" 
            :key="client.uid"
            class="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors cursor-pointer"
            @click="viewClient(client)"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {{ client.firstName?.charAt(0) }}{{ client.lastName?.charAt(0) }}
              </div>
              <div class="flex-1">
                <h4 class="text-white font-bold">{{ client.fullName }}</h4>
                <p class="text-slate-400 text-sm">{{ client.email }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <p class="text-slate-400">No hay clientes asignados</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAthletes } from '~/composables/athletes'
import { useCoaches } from '~/composables/coaches'
import { useWorkoutAssignments } from '~/composables/firestore'

const route = useRoute()
const athleteId = route.params.id as string

// Reactive state
const isLoading = ref(true)
const viewMode = ref<'athlete' | 'coach'>('athlete')
const athlete = ref<any>(null)
const assignedCoach = ref<any>(null)
const clients = ref<any[]>([])
const assignedWorkouts = ref<any[]>([])

const athleteStats = reactive({
  assignedWorkouts: 0,
  completedWorkouts: 0,
  streak: 7,
  totalMinutes: 420
})

const coachStats = reactive({
  currentClients: 5,
  maxClients: 10,
  experience: 3,
  specialties: 3
})

// Methods
const goBack = () => {
  navigateTo('/staff/dashboard')
}

const loadAthleteData = async () => {
  if (!athleteId) return

  isLoading.value = true
  try {
    // Load athlete data
    const { getAthleteById } = useAthletes()
    const athleteResult = await getAthleteById(athleteId)
    
    if (athleteResult.success && athleteResult.athlete) {
      athlete.value = athleteResult.athlete
      
      // Load assigned coach if any
      if (athlete.value.coachId) {
        const { getCoachById } = useCoaches()
        const coachResult = await getCoachById(athlete.value.coachId)
        if (coachResult.success && coachResult.coach) {
          assignedCoach.value = coachResult.coach
        }
      }
      
      // Load assigned workouts
      const { getClientAssignments } = useWorkoutAssignments()
      const { getWorkoutById } = useWorkouts()
      
      const assignmentsResult = await getClientAssignments(athleteId)
      if (assignmentsResult.success && assignmentsResult.assignments) {
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
        athleteStats.assignedWorkouts = workoutsWithDetails.length
        athleteStats.completedWorkouts = workoutsWithDetails.filter(w => w.status === 'completed').length
      }
      
      // Load clients (as if athlete was a coach)
      const { getClientsByCoach } = useCoaches()
      const clientsResult = await getClientsByCoach(athleteId)
      if (clientsResult.success && clientsResult.clients) {
        clients.value = clientsResult.clients
        coachStats.currentClients = clientsResult.clients.length
      }
    }
  } catch (error) {
    console.error('Error loading athlete data:', error)
  } finally {
    isLoading.value = false
  }
}

const viewClient = (client: any) => {
  navigateTo(`/staff/athletes/${client.uid}`)
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'Pendiente',
    'completed': 'Completado',
    'skipped': 'Omitido'
  }
  return statusMap[status] || status
}

// Lifecycle
onMounted(async () => {
  await loadAthleteData()
})

// Meta
definePageMeta({
  middleware: 'auth',
  ssr: false
})

useHead({
  title: 'Detalle del Atleta - Staff Dashboard',
  meta: [
    { name: 'description', content: 'Detalle del atleta en el panel administrativo' }
  ]
})
</script> 