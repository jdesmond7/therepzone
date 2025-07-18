<template>
  <div class="space-y-6">
    <!-- Data Table -->
    <DataTable
      :data="clients"
      :columns="tableColumns"
      :items-per-page="10"
      @view="viewClientDetails"
    >
      <!-- Additional Actions -->
      <template #actions>
        <AppButtonPrimary
          @click="showAddClientModal = true"
          icon="i-heroicons-plus"
          class="w-full sm:w-auto"
        >
          Agregar Cliente
        </AppButtonPrimary>
      </template>
      <!-- Custom cell templates -->
      <template #cell-name="{ item, value }">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
            <span v-if="item.profileImageUrl">
              <img :src="item.profileImageUrl" class="w-10 h-10 rounded-full object-cover" />
            </span>
            <span v-else class="text-white font-bold text-sm">
              {{ getClientDisplayName(item).charAt(0).toUpperCase() }}
            </span>
          </div>
          <div>
            <div class="font-medium text-white">{{ value }}</div>
            <div class="text-xs text-slate-400">{{ item.email }}</div>
          </div>
        </div>
      </template>

      <template #cell-status="{ value }">
        <span class="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
          {{ value }}
        </span>
      </template>

      <template #cell-assignedWorkouts="{ value }">
        <span class="text-white font-medium">{{ value.length }}</span>
      </template>

      <template #cell-location="{ item }">
        <div class="text-sm text-slate-300">
          <div v-if="item.city" class="flex items-center gap-1">
            <UIcon name="i-heroicons-building-office-2" class="w-3 h-3 text-slate-400" />
            {{ item.city }}
          </div>
          <div v-if="item.country" class="flex items-center gap-1">
            <UIcon name="i-heroicons-globe-alt" class="w-3 h-3 text-slate-400" />
            {{ item.country }}
          </div>
        </div>
      </template>

      <!-- Grid view template -->
      <template #grid-item="{ items }">
        <div 
          v-for="client in items" 
          :key="client.id"
          class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-orange-500/50 transition-colors"
        >
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <span v-if="client.profileImageUrl">
                <img :src="client.profileImageUrl" class="w-12 h-12 rounded-full object-cover" />
              </span>
              <span v-else class="text-white font-bold text-lg">
                {{ getClientDisplayName(client).charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-white">{{ getClientDisplayName(client) }}</h3>
              <p class="text-slate-400 text-sm">{{ client.email }}</p>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-slate-400 text-sm">Rutinas asignadas:</span>
              <span class="text-white font-medium">{{ client.assignedWorkouts.length }}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-slate-400 text-sm">Estado:</span>
              <span class="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                Activo
              </span>
            </div>
          </div>

          <div class="flex gap-2 mt-4">
            <AppButtonSecondary
              @click="viewClientDetails(client)"
              class="flex-1"
            >
              Ver Detalles
            </AppButtonSecondary>
            <AppButtonPrimary
              @click="assignWorkout(client)"
              class="flex-1"
            >
              Asignar Rutina
            </AppButtonPrimary>
          </div>
        </div>
      </template>
    </DataTable>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>

    <!-- Add Client Modal -->
    <div v-if="showAddClientModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <UserInfoForm
          title="Agregar Nuevo Cliente"
          subtitle="Completa la información del cliente para agregarlo a tu programa"
          submit-button-text="Crear Cliente"
          show-email-field
          show-cancel-button
          @submit="handleCreateClient"
          @cancel="showAddClientModal = false"
        />
      </div>
    </div>

    <!-- Client Details Modal con animación -->
    <transition name="modal-fade">
      <div v-if="selectedClient" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-white">Detalles del Cliente</h3>
            <button 
              @click="selectedClient = null"
              class="text-slate-400 hover:text-white"
            >
              <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-6">
            <!-- Client Info -->
            <div class="bg-slate-700/50 rounded-lg p-4">
              <h4 class="font-bold text-white mb-3">Información Personal</h4>
              <div class="flex items-center gap-6">
                <div class="flex-shrink-0">
                  <img v-if="selectedClient.profileImageUrl" :src="selectedClient.profileImageUrl" class="w-20 h-20 rounded-full object-cover border-2 border-slate-600" />
                  <div v-else class="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                    {{ getClientDisplayName(selectedClient).charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div class="flex-1">
                  <div class="flex flex-col gap-1">
                    <span class="text-xl font-bold text-white">{{ getClientDisplayName(selectedClient) }}</span>
                    <span v-if="selectedClient.nickname" class="text-orange-400 font-medium">{{ selectedClient.nickname }}</span>
                  </div>
                  <div class="flex items-center gap-4 mt-2">
                    <span class="text-slate-300 text-sm flex items-center gap-1">
                      <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
                      {{ selectedClient.email }}
                    </span>
                    <span v-if="selectedClient.phone" class="text-slate-300 text-sm flex items-center gap-1">
                      <UIcon name="i-heroicons-phone" class="w-4 h-4" />
                      {{ selectedClient.phone }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Ver Perfil Completo Button -->
              <div class="mt-4">
                <AppButtonSecondary
                  @click="viewFullProfile(selectedClient)"
                  fullWidth
                >
                  Ver Perfil Completo
                </AppButtonSecondary>
              </div>
            </div>

            <!-- Assigned Workouts -->
            <div class="bg-slate-700/50 rounded-lg p-4">
              <h4 class="font-bold text-white mb-3">Rutinas Asignadas</h4>
              
              <!-- Current Day Container -->
              <div class="bg-slate-600/15 rounded-lg p-4 mb-4 border border-slate-600">
                <div class="flex items-center justify-between mb-3">
                  <h5 class="font-semibold text-orange-400">{{ getCurrentDayName() }}</h5>
                  <span class="text-slate-400 text-sm">Día Actual</span>
                </div>
                
                <div v-if="getCurrentDayWorkout(selectedClient)" class="mb-3">
                  <div class="bg-slate-700/50 rounded-lg p-3">
                    <p class="text-white font-medium">{{ getCurrentDayWorkout(selectedClient).title }}</p>
                    <p class="text-slate-400 text-sm">{{ getCurrentDayWorkout(selectedClient).description }}</p>
                  </div>
                </div>
                <p v-else class="text-slate-400 mb-3">No hay rutina asignada para hoy</p>
                
                <AppButtonSecondary
                  v-if="selectedClient"
                  @click="goToAssignRoutine(selectedClient)"
                  fullWidth
                >
                  Asignar Rutina
                </AppButtonSecondary>
              </div>
              
              <!-- Other Assigned Workouts -->
              <div v-if="selectedClient.assignedWorkouts.length > 0" class="space-y-2">
                <div 
                  v-for="workoutId in selectedClient.assignedWorkouts" 
                  :key="workoutId"
                  class="bg-slate-600/50 rounded-lg p-3"
                >
                  <p class="text-white font-medium">Rutina ID: {{ workoutId }}</p>
                  <p class="text-slate-400 text-sm">Estado: Pendiente</p>
                </div>
              </div>
              
              <!-- Programming Button -->
              <div class="mt-4">
                <AppButtonPrimary
                  v-if="selectedClient"
                  @click="goToProgramming(selectedClient)"
                  fullWidth
                >
                  {{ hasWeeklyProgramming(selectedClient) ? 'Editar Programación' : 'Crear Programación' }}
                </AppButtonPrimary>
              </div>
            </div>


          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useAthletes, type Athlete } from '~/composables/athletes'
import { useCoaches } from '~/composables/coaches'
import DataTable from '~/components/DataTable.vue'
import { useRouter } from 'vue-router'

const { user } = useAuth()
const clients = ref<Athlete[]>([])
const isLoading = ref(true)
const showAddClientModal = ref(false)
const isCreatingClient = ref(false)
const selectedClient = ref<Athlete | null>(null)

// Table columns configuration
const tableColumns = [
  {
    key: 'name',
    label: 'Cliente',
    sortable: true
  },
  {
    key: 'status',
    label: 'Estado',
    sortable: true,
    type: 'badge' as const
  },
  {
    key: 'assignedWorkouts',
    label: 'Rutinas Asignadas',
    sortable: true,
    type: 'number' as const
  },
  {
    key: 'location',
    label: 'Ubicación',
    sortable: false
  },
  {
    key: 'createdAt',
    label: 'Fecha de Registro',
    sortable: true,
    type: 'date' as const,
    format: (value: any) => value ? new Date(value).toLocaleDateString('es-ES') : '-'
  }
]

// Helper function to get client display name
const getClientDisplayName = (client: Athlete): string => {
  if (client.firstName && client.lastName) {
    return `${client.firstName} ${client.lastName}`
  }
  return client.fullName || client.email || 'Cliente'
}

// Helper function to format "how did you hear about us" options
const formatHowDidYouHear = (value: string): string => {
  const options: Record<string, string> = {
    'redes-sociales': 'Redes sociales',
    'google': 'Búsqueda en Google',
    'recomendacion-amigo': 'Recomendación de amigo/familiar',
    'youtube': 'YouTube',
    'publicidad-online': 'Publicidad online',
    'gimnasio': 'En mi gimnasio',
    'entrenador-personal': 'Mi entrenador personal',
    'podcast': 'Podcast',
    'blog-articulo': 'Blog o artículo',
    'evento-fitness': 'Evento de fitness',
    'otro': 'Otro'
  }
  return options[value] || value
}

const loadClients = async () => {
  if (!user.value?.uid) return

  isLoading.value = true
  try {
    // Primero obtener el perfil del coach para obtener su UID personalizado
    const { getCoachByAuthUID } = useCoaches()
    const coachResult = await getCoachByAuthUID(user.value.uid)
    
    if (!coachResult.success || !coachResult.coach) {
      console.error('❌ No se pudo obtener el perfil del coach')
      clients.value = []
      return
    }
    
    const coachUid = coachResult.coach.uid
    console.log('🔍 Buscando atletas para coach UID:', coachUid)
    
    const { getAthletesByCoach } = useAthletes()
    const result = await getAthletesByCoach(coachUid)
    
    if (result.success && result.athletes) {
      console.log('[ATLETAS RAW]', result.athletes)
      // Add computed fields for table display
      const mappedClients = result.athletes.map((athlete: any) => {
        const name = athlete.nickname || athlete.fullName || (athlete.firstName && athlete.lastName ? athlete.firstName + ' ' + athlete.lastName : athlete.email || 'Sin nombre')
        return {
          ...athlete,
          id: athlete.uid || athlete.email || name,
          name,
          status: 'Activo',
          assignedWorkouts: Array.isArray(athlete.assignedWorkouts) ? athlete.assignedWorkouts : [],
          location: [athlete.city, athlete.country].filter(Boolean).join(', ') || 'No especificada',
          createdAt: athlete.createdAt || athlete.updatedAt || new Date()
        }
      })
      console.log('[ATLETAS TABLA]', mappedClients)
      clients.value = []
      await nextTick()
      clients.value = mappedClients
    } else {
      console.log('❌ No se encontraron atletas o error en la consulta:', result.error)
      clients.value = []
    }
  } catch (error) {
    console.error('Error loading clients:', error)
    clients.value = []
  } finally {
    isLoading.value = false
  }
}

const handleCreateClient = async (userData: any) => {
  if (!user.value?.uid) return

  isCreatingClient.value = true
  try {
    // Here you would typically create a user account and profile
    // For now, we'll create a mock client in Firestore with complete profile
    const { createUser } = useUsers()
    
    // Generate a temporary user ID (in real app, this would come from Firebase Auth)
    const tempUserId = `client_${Date.now()}`
    
    let profilePhotoUrl = ''
    
    // Upload profile image if provided
    if (userData.profileImageFile) {
      const { uploadProfileImage } = useFirebaseStorage()
      const uploadResult = await uploadProfileImage(
        userData.profileImageFile, 
        tempUserId, 
        userData.fullName // Use full name for folder structure
      )
      
      if (uploadResult.success) {
        profilePhotoUrl = uploadResult.url!
        console.log('📸 Imagen de perfil del cliente subida exitosamente:', profilePhotoUrl)
      } else {
        console.error('Error uploading client profile image:', uploadResult.error)
        // Continue without image - don't fail the whole process
      }
    }
    
    const result = await createUser(tempUserId, {
      fullName: userData.fullName, // Nombre completo combinado (compatibilidad)
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: 'client',
      assignedWorkouts: [],
      coachId: user.value.uid,
      // Información adicional del perfil
      nickname: userData.nickname,
      birthDate: userData.birthDate,
      age: userData.age, // Edad calculada (compatibilidad)
      gender: userData.gender,
      phone: userData.phone,
      profilePhoto: profilePhotoUrl || userData.profilePhoto || '', // Use uploaded URL or fallback
      country: userData.country,
      city: userData.city,
      howDidYouHearAboutUs: userData.howDidYouHearAboutUs,
      startDate: userData.startDate,
      profileCompleted: true
    })

    if (result.success) {
      showAddClientModal.value = false
      
      // Reload clients
      await loadClients()
      
      console.log('✅ Cliente creado exitosamente:', userData.fullName)
    }
  } catch (error) {
    console.error('Error creating client:', error)
  } finally {
    isCreatingClient.value = false
  }
}

const viewClientDetails = (client: Athlete) => {
  selectedClient.value = client
}

const editClient = (client: Athlete) => {
  // TODO: Implement edit client functionality
  console.log('Edit client:', client.fullName)
}

const deleteClient = async (client: Athlete) => {
  if (!confirm(`¿Estás seguro de que quieres eliminar al cliente "${getClientDisplayName(client)}"?`)) {
    return
  }

  try {
    // TODO: Implement delete client functionality
    console.log('Delete client:', client.fullName)
    // const { deleteUser } = useUsers()
    // const result = await deleteUser(client.id!)
    
    // if (result.success) {
    //   selectedClient.value = null
    //   await loadClients()
    //   console.log('✅ Cliente eliminado exitosamente')
    // }
  } catch (error) {
    console.error('Error deleting client:', error)
  }
}

const assignWorkout = (client: Athlete) => {
  // TODO: Implement workout assignment modal
  console.log('Assign workout to:', client.fullName)
}

const router = useRouter()

function goToAssignRoutine(client: any) {
  router.push(`/clientes/${client.id}/programacion`)
}

function goToProgramming(client: any) {
  // TODO: Navigate to programming view in coach dashboard
  console.log('Navigate to programming for client:', client.id)
}

function getCurrentDayName(): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']
  return days[new Date().getDay()]
}

function getCurrentDayWorkout(client: any): any {
  // TODO: Get current day workout from client programming
  // For now, return null to show "No hay rutina asignada para hoy"
  return null
}

function hasWeeklyProgramming(client: any): boolean {
  // TODO: Check if client has weekly programming
  // For now, return false to show "Crear Programación"
  return false
}

function viewFullProfile(client: any) {
  // TODO: Navigate to full client profile view
  console.log('View full profile for client:', client.id)
}

onMounted(() => {
  loadClients()
})

// Nuevo: watcher para cargar clientes cuando el usuario esté listo
watch(
  () => user.value?.uid,
  (uid) => {
    if (uid) loadClients()
  },
  { immediate: true }
)
</script> 