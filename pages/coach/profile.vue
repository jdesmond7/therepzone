<template>
  <div class="min-h-screen bg-slate-900 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-96">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p class="text-white">Cargando perfil...</p>
        </div>
      </div>

      <!-- Content (only show when not loading) -->
      <div v-else>
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-white">Mi Perfil</h1>
          <button 
            @click="toggleEditMode"
            class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <UIcon name="i-heroicons-pencil" class="w-4 h-4" />
            {{ isEditing ? 'Guardar' : 'Editar Perfil' }}
          </button>
        </div>

        <!-- Profile Summary Card -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div class="flex items-start gap-6">
            <!-- Profile Picture -->
            <div class="relative">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden">
                <img 
                  v-if="profileData.profileImageUrl" 
                  :src="profileData.profileImageUrl" 
                  alt="Profile" 
                  class="w-full h-full object-cover"
                />
                <UIcon v-else name="i-heroicons-user" class="w-12 h-12 text-white" />
              </div>
              <button 
                v-if="isEditing"
                @click="triggerImageUpload"
                class="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-600 hover:bg-orange-700 rounded-full flex items-center justify-center transition-colors"
              >
                <UIcon name="i-heroicons-camera" class="w-4 h-4 text-white" />
              </button>
              <input 
                ref="imageInput"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="hidden"
              />
            </div>

            <!-- Profile Info -->
            <div class="flex-1">
              <div class="flex items-start justify-between">
                <div>
                  <h2 class="text-2xl font-bold text-white mb-1">
                    <span v-if="!isEditing">{{ profileData.fullName || 'Coach' }}</span>
                    <AppInput 
                      v-else
                      v-model="profileData.fullName"
                      placeholder="Nombre completo"
                      class="text-2xl font-bold bg-transparent border-none p-0 text-white"
                    />
                  </h2>
                  <p class="text-slate-400 mb-4">
                    <span v-if="!isEditing">{{ profileData.role || 'Coach' }} | {{ profileData.department || 'Fitness Department' }}</span>
                    <div v-else class="flex gap-2">
                      <AppInput 
                        v-model="profileData.role"
                        placeholder="Rol"
                        class="bg-transparent border-slate-600 text-slate-400"
                      />
                      <span class="text-slate-400">|</span>
                      <AppInput 
                        v-model="profileData.department"
                        placeholder="Departamento"
                        class="bg-transparent border-slate-600 text-slate-400"
                      />
                    </div>
                  </p>
                </div>
              </div>

              <!-- Contact Info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-identification" class="w-4 h-4 text-slate-400" />
                  <span class="text-slate-300">ID: {{ profileData.staffId || 'N/A' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-phone" class="w-4 h-4 text-slate-400" />
                  <span v-if="!isEditing" class="text-slate-300">{{ profileData.phone || 'N/A' }}</span>
                  <AppInput 
                    v-else
                    v-model="profileData.phone"
                    placeholder="Teléfono"
                    class="bg-transparent border-slate-600 text-slate-300"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-user-circle" class="w-4 h-4 text-slate-400" />
                  <span class="text-slate-300">Cuenta: {{ profileData.username || 'N/A' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-slate-400" />
                  <span v-if="!isEditing" class="text-slate-300">{{ profileData.email || 'N/A' }}</span>
                  <AppInput 
                    v-else
                    v-model="profileData.email"
                    placeholder="Email"
                    class="bg-transparent border-slate-600 text-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Personal Information Card -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-white">Información Personal</h3>
            <UIcon name="i-heroicons-pencil" class="w-5 h-5 text-slate-400" />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Género</label>
              <span class="text-white">{{ profileData.gender || 'No especificado' }}</span>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Fecha de nacimiento</label>
              <span class="text-white">{{ profileData.birthDate || 'No especificada' }}</span>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Ciudad natal</label>
              <span class="text-white">{{ profileData.hometown || 'No especificada' }}</span>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Nacionalidad</label>
              <span class="text-white">{{ profileData.nationality || 'No especificada' }}</span>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Idiomas</label>
              <span class="text-white">{{ profileData.languages || 'No especificados' }}</span>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Estado civil</label>
              <span class="text-white">{{ profileData.maritalStatus || 'No especificado' }}</span>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <!-- Espacio para futuras secciones -->
          </div>
          <div class="space-y-6">
            <!-- Quick Stats Card -->
            <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 class="text-lg font-semibold text-white mb-4">Estadísticas Rápidas</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Clientes Activos</span>
                  <span class="text-white font-semibold">12</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Rutinas Creadas</span>
                  <span class="text-white font-semibold">8</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Ejercicios</span>
                  <span class="text-white font-semibold">45</span>
                </div>
              </div>
            </div>

            <!-- Recent Activity Card -->
            <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 class="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p class="text-white text-sm">Nuevo cliente registrado</p>
                    <p class="text-slate-400 text-xs">Hace 2 horas</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p class="text-white text-sm">Rutina actualizada</p>
                    <p class="text-slate-400 text-xs">Hace 1 día</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p class="text-white text-sm">Ejercicio agregado</p>
                    <p class="text-slate-400 text-xs">Hace 3 días</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppInput from '~/components/shared/AppInput.vue'
import { useFirebaseStorage } from '~/composables/firebase-storage'

const { user } = useAuth()
const { uploadProfileImage, uploadCredentialFile } = useFirebaseStorage()
const { getCoachById, getCoachByAuthUID, updateCoach } = useCoaches()

// Reactive state
const isEditing = ref(false)
const imageInput = ref<HTMLInputElement>()
const isLoading = ref(true)

// Profile data
const profileData = reactive({
  fullName: '',
  role: 'coach' as 'athlete' | 'coach' | 'admin',
  department: 'Fitness Department',
  staffId: '',
  phone: '',
  username: '',
  email: '',
  profileImageUrl: '',
  
  // Personal info
  gender: '',
  birthDate: '',
  hometown: '',
  nationality: '',
  languages: '',
  maritalStatus: '',
  currentAddress: '',
  
  // Education
  education: [] as Array<{
    degree: string
    institution: string
    period: string
  }>,
  
  // Credentials
  credentials: [] as Array<{
    name: string
    issuer: string
    date: string
    fileUrl?: string
    fileName?: string
  }>
})

// Load profile data on mount
onMounted(async () => {
  if (user.value?.uid) {
    try {
      isLoading.value = true
      const result = await getCoachByAuthUID(user.value.uid)
      
      if (result.success && result.coach) {
        const coachData = result.coach
        // Update profile data with coach data (only existing fields)
        Object.assign(profileData, {
          fullName: coachData.fullName || '',
          role: coachData.role || 'coach',
          phone: coachData.phone || '',
          email: coachData.email || '',
          profileImageUrl: coachData.profileImageUrl || '',
          gender: coachData.gender || '',
          birthDate: coachData.birthDate || '',
          // Keep default values for fields not in Coach interface
          department: 'Fitness Department',
          staffId: '',
          username: '',
          hometown: '',
          nationality: '',
          languages: '',
          maritalStatus: '',
          currentAddress: '',
          education: [],
          credentials: []
        })
      }
    } catch (error) {
      console.error('Error loading coach profile:', error)
    } finally {
      isLoading.value = false
    }
  }
})

// Methods
const toggleEditMode = async () => {
  if (isEditing.value) {
    // Save changes
    await saveProfile()
  }
  isEditing.value = !isEditing.value
}

const saveProfile = async () => {
  if (!user.value?.uid) return
  
  try {
    // Save to Firestore - only save fields that match the User interface
    const { updateUser } = useUsers()
    await updateUser(user.value.uid, {
      fullName: profileData.fullName,
      role: profileData.role,
      phone: profileData.phone,
      profileImageUrl: profileData.profileImageUrl,
      gender: profileData.gender as 'masculino' | 'femenino' | 'otro',
      birthDate: profileData.birthDate,
      country: profileData.nationality,
      city: profileData.hometown
    })
    
    console.log('✅ Perfil guardado exitosamente')
  } catch (error) {
    console.error('Error saving profile:', error)
  }
}

const triggerImageUpload = () => {
  imageInput.value?.click()
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    try {
      const result = await uploadProfileImage(file, user.value?.uid || 'profile', profileData.fullName || 'Coach')
      if (result.success) {
        profileData.profileImageUrl = result.url!
        console.log('✅ Imagen de perfil subida exitosamente')
      }
    } catch (error) {
      console.error('Error uploading profile image:', error)
    }
  }
}
</script> 