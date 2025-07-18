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
            <h1 class="text-2xl font-black text-white">Detalle del Coach</h1>
            <p class="text-slate-400">{{ coach?.fullName }}</p>
          </div>
        </div>
        
        <!-- View Mode Toggle -->
        <div class="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
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
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
    </div>

    <!-- Coach View -->
    <div v-else-if="viewMode === 'coach'" class="p-6 space-y-6">
      <!-- Coach Profile Card -->
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div class="flex items-start gap-6">
          <div class="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {{ coach?.firstName?.charAt(0) }}{{ coach?.lastName?.charAt(0) }}
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-white mb-2">{{ coach?.fullName }}</h2>
            <p class="text-slate-400 mb-4">{{ coach?.email }}</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <p class="text-2xl font-bold text-white">{{ coach?.currentClients || 0 }}</p>
                <p class="text-slate-400 text-sm">Clientes</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-white">{{ coach?.maxClients || 0 }}</p>
                <p class="text-slate-400 text-sm">Máximo</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-white">{{ coach?.experience || 0 }}</p>
                <p class="text-slate-400 text-sm">Años Exp.</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-white">{{ coach?.specialties?.length || 0 }}</p>
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
              <span class="text-white">{{ coach?.fullName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Email</span>
              <span class="text-white">{{ coach?.email }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Teléfono</span>
              <span class="text-white">{{ coach?.phone || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Género</span>
              <span class="text-white">{{ coach?.gender || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Fecha de nacimiento</span>
              <span class="text-white">{{ coach?.birthDate || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">País</span>
              <span class="text-white">{{ coach?.country || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Ciudad</span>
              <span class="text-white">{{ coach?.city || 'No especificado' }}</span>
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
              <span class="text-white">{{ coach?.experience || 0 }} años</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Disponible</span>
              <span :class="coach?.isAvailable ? 'text-green-500' : 'text-red-500'">
                {{ coach?.isAvailable ? 'Sí' : 'No' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Tarifa por hora</span>
              <span class="text-white">{{ coach?.hourlyRate ? `$${coach.hourlyRate}` : 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Clientes actuales</span>
              <span class="text-white">{{ coach?.currentClients || 0 }}/{{ coach?.maxClients || 0 }}</span>
            </div>
          </div>

          <!-- Specialties -->
          <div class="mt-6">
            <h4 class="text-lg font-bold text-white mb-3">Especialidades</h4>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="specialty in coach?.specialties" 
                :key="specialty"
                class="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm"
              >
                {{ specialty }}
              </span>
            </div>
          </div>

          <!-- Certifications -->
          <div class="mt-6" v-if="coach?.certifications?.length">
            <h4 class="text-lg font-bold text-white mb-3">Certificaciones</h4>
            <div class="space-y-2">
              <div 
                v-for="cert in coach.certifications" 
                :key="cert"
                class="p-3 bg-slate-700/50 rounded-lg"
              >
                <p class="text-white font-medium">{{ cert }}</p>
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

    <!-- Athlete View -->
    <div v-else class="p-6 space-y-6">
      <!-- Athlete Profile Card -->
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div class="flex items-start gap-6">
          <div class="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {{ coach?.firstName?.charAt(0) }}{{ coach?.lastName?.charAt(0) }}
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-white mb-2">{{ coach?.fullName }}</h2>
            <p class="text-slate-400 mb-4">{{ coach?.email }}</p>
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
              <span class="text-white">{{ coach?.fullName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Email</span>
              <span class="text-white">{{ coach?.email }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Teléfono</span>
              <span class="text-white">{{ coach?.phone || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Género</span>
              <span class="text-white">{{ coach?.gender || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Fecha de nacimiento</span>
              <span class="text-white">{{ coach?.birthDate || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">País</span>
              <span class="text-white">{{ coach?.country || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Ciudad</span>
              <span class="text-white">{{ coach?.city || 'No especificado' }}</span>
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
              <span class="text-white">{{ coach?.startDate ? new Date(coach.startDate).toLocaleDateString() : 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Perfil completado</span>
              <span :class="coach?.profileCompleted ? 'text-green-500' : 'text-red-500'">
                {{ coach?.profileCompleted ? 'Sí' : 'No' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Coach asignado</span>
              <span class="text-white">{{ coach?.coachId ? 'Sí' : 'No' }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { useCoaches } from '~/composables/coaches'
import { useAthletes } from '~/composables/athletes'
import { useWorkoutAssignments } from '~/composables/firestore'

const route = useRoute()
const coachId = route.params.id as string

// Reactive state
const isLoading = ref(true)
const viewMode = ref<'coach' | 'athlete'>('coach')
const coach = ref<any>(null)
const clients = ref<any[]>([])
const assignedWorkouts = ref<any[]>([])

const athleteStats = reactive({
  assignedWorkouts: 0,
  completedWorkouts: 0,
  streak: 7,
  totalMinutes: 420
})

// Methods
const goBack = () => {
  navigateTo('/staff/dashboard')
}

const loadCoachData = async () => {
  if (!coachId) return

  isLoading.value = true
  try {
    // Load coach data
    const { getCoachById } = useCoaches()
    const coachResult = await getCoachById(coachId)
    
    if (coachResult.success && coachResult.coach) {
      coach.value = coachResult.coach
      
      // Load clients
      const { getClientsByCoach } = useCoaches()
      const clientsResult = await getClientsByCoach(coachId)
      if (clientsResult.success && clientsResult.clients) {
        clients.value = clientsResult.clients
      }
      
      // Load assigned workouts (as if coach was an athlete)
      const { getClientAssignments } = useWorkoutAssignments()
      const { getWorkoutById } = useWorkouts()
      
      const assignmentsResult = await getClientAssignments(coachId)
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
    }
  } catch (error) {
    console.error('Error loading coach data:', error)
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
  await loadCoachData()
})

// Meta
definePageMeta({
  middleware: 'auth',
  ssr: false
})

useHead({
  title: 'Detalle del Coach - Staff Dashboard',
  meta: [
    { name: 'description', content: 'Detalle del coach en el panel administrativo' }
  ]
})
</script> 