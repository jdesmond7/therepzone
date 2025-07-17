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

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Personal Information Card -->
          <div class="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-white">Información Personal</h3>
              <UIcon name="i-heroicons-pencil" class="w-5 h-5 text-slate-400" />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Género</label>
                <span v-if="!isEditing" class="text-white">{{ profileData.gender || 'No especificado' }}</span>
                <CustomSelect 
                  v-else
                  v-model="profileData.gender"
                  :options="genderOptions"
                  placeholder="Seleccionar género"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Fecha de nacimiento</label>
                <span v-if="!isEditing" class="text-white">{{ profileData.birthDate || 'No especificada' }}</span>
                <AppInput 
                  v-else
                  v-model="profileData.birthDate"
                  type="date"
                  class="bg-transparent border-slate-600 text-white"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Ciudad natal</label>
                <span v-if="!isEditing" class="text-white">{{ profileData.hometown || 'No especificada' }}</span>
                <AppInput 
                  v-else
                  v-model="profileData.hometown"
                  placeholder="Ciudad natal"
                  class="bg-transparent border-slate-600 text-white"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Nacionalidad</label>
                <span v-if="!isEditing" class="text-white">{{ profileData.nationality || 'No especificada' }}</span>
                <AppInput 
                  v-else
                  v-model="profileData.nationality"
                  placeholder="Nacionalidad"
                  class="bg-transparent border-slate-600 text-white"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Idiomas</label>
                <span v-if="!isEditing" class="text-white">{{ profileData.languages || 'No especificados' }}</span>
                <AppInput 
                  v-else
                  v-model="profileData.languages"
                  placeholder="Idiomas (ej: Español, Inglés)"
                  class="bg-transparent border-slate-600 text-white"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Estado civil</label>
                <span v-if="!isEditing" class="text-white">{{ profileData.maritalStatus || 'No especificado' }}</span>
                <CustomSelect 
                  v-else
                  v-model="profileData.maritalStatus"
                  :options="maritalStatusOptions"
                  placeholder="Seleccionar estado civil"
                />
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-400 mb-1">Dirección actual</label>
                <span v-if="!isEditing" class="text-white">{{ profileData.currentAddress || 'No especificada' }}</span>
                <AppTextarea 
                  v-else
                  v-model="profileData.currentAddress"
                  placeholder="Dirección actual"
                  :rows="2"
                  class="bg-transparent border-slate-600 text-white"
                />
              </div>
            </div>
          </div>

          <!-- Sidebar -->
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

        <!-- Education Section -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-white">Educación</h3>
            <button 
              v-if="isEditing"
              @click="addEducation"
              class="text-orange-400 hover:text-orange-300"
            >
              <UIcon name="i-heroicons-plus" class="w-5 h-5" />
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="(education, index) in profileData.education" 
              :key="index"
              class="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div v-if="!isEditing" class="font-medium text-white mb-1">{{ education.degree }}</div>
                  <AppInput 
                    v-else
                    v-model="education.degree"
                    placeholder="Título o grado"
                    class="bg-transparent border-slate-600 text-white font-medium mb-1"
                  />
                  
                  <div v-if="!isEditing" class="text-slate-400 text-sm mb-2">{{ education.institution }}</div>
                  <AppInput 
                    v-else
                    v-model="education.institution"
                    placeholder="Institución"
                    class="bg-transparent border-slate-600 text-slate-400 text-sm mb-2"
                  />
                  
                  <div v-if="!isEditing" class="text-slate-400 text-xs">{{ education.period }}</div>
                  <AppInput 
                    v-else
                    v-model="education.period"
                    placeholder="Período (ej: 2018-2022)"
                    class="bg-transparent border-slate-600 text-slate-400 text-xs"
                  />
                </div>
                
                <button 
                  v-if="isEditing"
                  @click="removeEducation(index)"
                  class="text-red-400 hover:text-red-300"
                  title="Eliminar"
                >
                  <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div v-if="profileData.education.length === 0" class="md:col-span-2 lg:col-span-3 text-slate-400 text-center py-8">
              No hay educación agregada
            </div>
          </div>
        </div>

        <!-- Credentials Section -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-white">Credenciales y Certificaciones</h3>
            <button 
              v-if="isEditing"
              @click="addCredential"
              class="text-orange-400 hover:text-orange-300"
            >
              <UIcon name="i-heroicons-plus" class="w-5 h-5" />
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="(credential, index) in profileData.credentials" 
              :key="index"
              class="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div v-if="!isEditing" class="font-medium text-white mb-1">{{ credential.name }}</div>
                  <AppInput 
                    v-else
                    v-model="credential.name"
                    placeholder="Nombre de la credencial"
                    class="bg-transparent border-slate-600 text-white font-medium mb-1"
                  />
                  
                  <div v-if="!isEditing" class="text-slate-400 text-sm mb-2">{{ credential.issuer }}</div>
                  <AppInput 
                    v-else
                    v-model="credential.issuer"
                    placeholder="Institución emisora"
                    class="bg-transparent border-slate-600 text-slate-400 text-sm mb-2"
                  />
                  
                  <div v-if="!isEditing" class="text-slate-400 text-xs">{{ credential.date }}</div>
                  <AppInput 
                    v-else
                    v-model="credential.date"
                    type="date"
                    class="bg-transparent border-slate-600 text-slate-400 text-xs"
                  />
                </div>
                
                <div class="flex gap-2">
                  <button 
                    v-if="isEditing"
                    @click="uploadCredentialFileHandler(index)"
                    class="text-blue-400 hover:text-blue-300"
                    title="Subir archivo"
                  >
                    <UIcon name="i-heroicons-arrow-up-tray" class="w-4 h-4" />
                  </button>
                  <button 
                    v-if="isEditing"
                    @click="removeCredential(index)"
                    class="text-red-400 hover:text-red-300"
                    title="Eliminar"
                  >
                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <!-- File preview -->
              <div v-if="credential.fileUrl" class="mt-3">
                <div class="flex items-center gap-2 p-2 bg-slate-600/50 rounded">
                  <UIcon name="i-heroicons-document" class="w-4 h-4 text-slate-400" />
                  <span class="text-slate-300 text-sm flex-1 truncate">{{ credential.fileName || 'Documento' }}</span>
                  <a 
                    :href="credential.fileUrl" 
                    target="_blank"
                    class="text-orange-400 hover:text-orange-300"
                  >
                    <UIcon name="i-heroicons-eye" class="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
            
            <div v-if="profileData.credentials.length === 0" class="md:col-span-2 lg:col-span-3 text-slate-400 text-center py-8">
              No hay credenciales agregadas
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  role: 'coach' as 'client' | 'coach' | 'admin',
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

// Options for selects
const genderOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' }
]

const maritalStatusOptions = [
  { value: 'soltero', label: 'Soltero/a' },
  { value: 'casado', label: 'Casado/a' },
  { value: 'divorciado', label: 'Divorciado/a' },
  { value: 'viudo', label: 'Viudo/a' }
]

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

const addEducation = () => {
  profileData.education.push({
    degree: '',
    institution: '',
    period: ''
  })
}

const removeEducation = (index: number) => {
  profileData.education.splice(index, 1)
}

const addCredential = () => {
  profileData.credentials.push({
    name: '',
    issuer: '',
    date: '',
    fileUrl: undefined,
    fileName: undefined
  })
}

const removeCredential = (index: number) => {
  profileData.credentials.splice(index, 1)
}

const uploadCredentialFileHandler = async (index: number) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx'
  
  input.onchange = async (event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
      const file = target.files[0]
      
      try {
        const result = await uploadCredentialFile(file, `credentials/${user.value?.uid}/${Date.now()}`)
        if (result.success) {
          profileData.credentials[index].fileUrl = result.url!
          profileData.credentials[index].fileName = file.name
          console.log('✅ Archivo de credencial subido exitosamente')
        }
      } catch (error) {
        console.error('Error uploading credential file:', error)
      }
    }
  }
  
  input.click()
}

// Load profile data
const loadProfile = async () => {
  if (!user.value?.uid) return
  
  try {
    const { getUserById } = useUsers()
    const result = await getUserById(user.value.uid)
    
    if (result.success && result.user) {
      // Merge user data with profile data
      Object.assign(profileData, {
        fullName: result.user.fullName || result.user.firstName + ' ' + result.user.lastName,
        email: result.user.email,
        phone: result.user.phone || '',
        profileImageUrl: result.user.profileImageUrl || result.user.profilePhoto || '',
        // Add other fields as they become available in the User interface
      })
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  }
}

onMounted(() => {
  loadProfile()
})
</script> 