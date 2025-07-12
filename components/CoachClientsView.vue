<template>
  <div class="space-y-6">
    <!-- Add Client Button -->
    <div class="flex justify-end">
      <button 
        @click="showAddClientModal = true"
        class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
      >
        <UIcon name="i-heroicons-plus" class="w-5 h-5" />
        Agregar Cliente
      </button>
    </div>

    <!-- Clients Grid -->
    <div v-if="clients.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="client in clients" 
        :key="client.id"
        class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-orange-500/50 transition-colors"
      >
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <span class="text-white font-bold text-lg">
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
          <button 
            @click="viewClientDetails(client)"
            class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
          >
            Ver Detalles
          </button>
          <button 
            @click="assignWorkout(client)"
            class="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
          >
            Asignar Rutina
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="text-center py-12">
      <div class="text-6xl mb-4">👥</div>
      <h3 class="text-xl font-bold text-white mb-2">No tienes clientes aún</h3>
      <p class="text-slate-400 mb-6">Agrega tu primer cliente para comenzar a gestionar entrenamientos</p>
      <button 
        @click="showAddClientModal = true"
        class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
      >
        Agregar Primer Cliente
      </button>
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center py-12">
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

    <!-- Client Details Modal -->
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
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-slate-400 text-sm">Nombre</p>
                <p class="text-white font-medium">{{ getClientDisplayName(selectedClient) }}</p>
              </div>
              <div>
                <p class="text-slate-400 text-sm">Email</p>
                <p class="text-white font-medium">{{ selectedClient.email }}</p>
              </div>
              <div v-if="selectedClient.nickname">
                <p class="text-slate-400 text-sm">Apodo</p>
                <p class="text-white font-medium">{{ selectedClient.nickname }}</p>
              </div>
              <div v-if="selectedClient.age">
                <p class="text-slate-400 text-sm">Edad</p>
                <p class="text-white font-medium">{{ selectedClient.age }} años</p>
              </div>
              <div v-if="selectedClient.gender">
                <p class="text-slate-400 text-sm">Género</p>
                <p class="text-white font-medium capitalize">{{ selectedClient.gender }}</p>
              </div>
              <div v-if="selectedClient.phone">
                <p class="text-slate-400 text-sm">Teléfono</p>
                <p class="text-white font-medium">{{ selectedClient.phone }}</p>
              </div>
              <div v-if="selectedClient.country">
                <p class="text-slate-400 text-sm">País</p>
                <p class="text-white font-medium">{{ selectedClient.country }}</p>
              </div>
              <div v-if="selectedClient.city">
                <p class="text-slate-400 text-sm">Ciudad</p>
                <p class="text-white font-medium">{{ selectedClient.city }}</p>
              </div>
              <div v-if="selectedClient.howDidYouHearAboutUs">
                <p class="text-slate-400 text-sm">¿Cómo nos conoció?</p>
                <p class="text-white font-medium">{{ formatHowDidYouHear(selectedClient.howDidYouHearAboutUs) }}</p>
              </div>
            </div>
          </div>

          <!-- Assigned Workouts -->
          <div class="bg-slate-700/50 rounded-lg p-4">
            <h4 class="font-bold text-white mb-3">Rutinas Asignadas</h4>
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
            <p v-else class="text-slate-400">No tiene rutinas asignadas</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUsers, type User } from '~/composables/firestore'

const { user } = useAuth()
const clients = ref<User[]>([])
const isLoading = ref(true)
const showAddClientModal = ref(false)
const isCreatingClient = ref(false)
const selectedClient = ref<User | null>(null)

const newClient = reactive({
  fullName: '',
  email: ''
})

// Helper function to get client display name
const getClientDisplayName = (client: User): string => {
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
    const { getClientsByCoach } = useUsers()
    const result = await getClientsByCoach(user.value.uid)
    
    if (result.success && result.clients) {
      clients.value = result.clients
    }
  } catch (error) {
    console.error('Error loading clients:', error)
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

const viewClientDetails = (client: User) => {
  selectedClient.value = client
}

const assignWorkout = (client: User) => {
  // TODO: Implement workout assignment modal
  console.log('Assign workout to:', client.fullName)
}

onMounted(() => {
  loadClients()
})
</script> 