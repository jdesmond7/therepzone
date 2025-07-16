<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
    <div class="w-full space-y-6">
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
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
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
                  <span v-if="!isEditing">{{ profileData.presentationTitle || 'Fitness Coach' }}</span>
                  <AppInput 
                    v-else
                    v-model="profileData.presentationTitle"
                    placeholder="Título de presentación"
                    class="bg-transparent border-slate-600 text-slate-400"
                  />
                </p>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <!-- Personal Information and Education Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Personal Information Card -->
        <AppCard className="lg:col-span-2">
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
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-400 mb-1">Biografía</label>
              <span v-if="!isEditing" class="text-white">{{ profileData.biography || 'No especificada' }}</span>
              <AppTextarea 
                v-else
                v-model="profileData.biography"
                placeholder="Cuéntanos sobre ti, tu experiencia, especialidades..."
                :rows="4"
                class="bg-transparent border-slate-600 text-white"
              />
            </div>
          </div>
        </AppCard>

        <!-- Education Information Card -->
        <AppCard>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-white">Información Educativa</h3>
            <button 
              v-if="isEditing"
              @click="addEducation"
              class="text-orange-400 hover:text-orange-300"
            >
              <UIcon name="i-heroicons-plus" class="w-5 h-5" />
            </button>
          </div>
          
          <div class="space-y-4">
            <div 
              v-for="(education, index) in profileData.education" 
              :key="index"
              class="p-3 bg-slate-600/50 rounded-lg"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div v-if="!isEditing" class="font-medium text-white">{{ education.degree }}</div>
                  <AppInput 
                    v-else
                    v-model="education.degree"
                    placeholder="Título o certificado"
                    class="bg-transparent border-slate-600 text-white font-medium"
                  />
                  
                  <div v-if="!isEditing" class="text-slate-400 text-sm">{{ education.institution }}</div>
                  <AppInput 
                    v-else
                    v-model="education.institution"
                    placeholder="Institución"
                    class="bg-transparent border-slate-600 text-slate-400 text-sm"
                  />
                  
                  <div v-if="!isEditing" class="text-slate-400 text-sm">{{ education.period }}</div>
                  <div v-else class="flex gap-2">
                    <AppInput 
                      v-model="education.period"
                      placeholder="Período (ej: 2018-2022)"
                      class="bg-transparent border-slate-600 text-slate-400 text-sm"
                    />
                  </div>
                </div>
                <button 
                  v-if="isEditing"
                  @click="removeEducation(index)"
                  class="text-red-400 hover:text-red-300 ml-2"
                >
                  <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div v-if="profileData.education.length === 0" class="text-slate-400 text-center py-4">
              No hay información educativa
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Credentials Section -->
      <AppCard>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-white">Credenciales y Certificaciones</h3>
          <button 
            v-if="isEditing"
            @click="addCredential"
            class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <UIcon name="i-heroicons-plus" class="w-4 h-4" />
            Agregar Credencial
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="(credential, index) in profileData.credentials" 
            :key="index"
            class="bg-slate-600/50 rounded-lg p-4 border border-slate-500"
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
              <div class="flex items-center gap-2 p-2 bg-slate-500/50 rounded">
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
      </AppCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFirebaseStorage } from '~/composables/firebase-storage'
import AppCard from '~/components/AppCard.vue'
import CustomSelect from '~/components/CustomSelect.vue'
import AppInput from '~/components/AppInput.vue'
import AppTextarea from '~/components/AppTextarea.vue'

const { user } = useAuth()
const { uploadProfileImage, uploadCredentialFile } = useFirebaseStorage()
const { getCoachById, getCoachByAuthUID, updateCoach } = useCoaches()

// Reactive state
const isEditing = ref(false)
const imageInput = ref<HTMLInputElement>()

// Profile data
const profileData = reactive({
  fullName: '',
  presentationTitle: 'Fitness Coach',
  phone: '',
  email: '',
  profileImageUrl: '',
  
  // Personal info
  gender: '',
  birthDate: '',
  hometown: '',
  nationality: '',
  currentAddress: '',
  biography: '',
  
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

// Options for selects
const genderOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' }
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
    // First get the coach to find the correct document ID
    const coachResult = await getCoachByAuthUID(user.value.uid)
    if (!coachResult.success || !coachResult.coach) {
      console.error('❌ No se pudo encontrar el coach para guardar')
      return
    }
    
    // Save to coaches collection using the coach's document ID
    await updateCoach(coachResult.coach.uid, {
      firstName: profileData.fullName.split(' ')[0] || '',
      lastName: profileData.fullName.split(' ').slice(1).join(' ') || '',
      fullName: profileData.fullName,
      phone: profileData.phone,
      profileImageUrl: profileData.profileImageUrl,
      presentationTitle: profileData.presentationTitle,
      gender: profileData.gender as 'masculino' | 'femenino' | 'otro',
      birthDate: profileData.birthDate,
      hometown: profileData.hometown,
      nationality: profileData.nationality,
      currentAddress: profileData.currentAddress,
      biography: profileData.biography,
      education: profileData.education,
      credentials: profileData.credentials
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
  console.log('🔄 Cargando perfil del coach...')
  console.log('👤 User UID:', user.value?.uid)
  
  if (!user.value?.uid) {
    console.log('❌ No hay usuario autenticado')
    return
  }
  
  try {
    console.log('🔍 Buscando coach por auth UID:', user.value.uid)
    const result = await getCoachByAuthUID(user.value.uid)
    
    console.log('📊 Resultado de búsqueda:', result)
    
    if (result.success && result.coach) {
      console.log('✅ Coach encontrado:', result.coach)
      
      // Merge coach data with profile data
      const updatedData = {
        fullName: result.coach.fullName || `${result.coach.firstName} ${result.coach.lastName}`.trim(),
        presentationTitle: result.coach.presentationTitle || 'Fitness Coach',
        email: result.coach.email,
        phone: result.coach.phone || '',
        profileImageUrl: result.coach.profileImageUrl || '',
        gender: result.coach.gender || '',
        birthDate: result.coach.birthDate || '',
        hometown: result.coach.hometown || '',
        nationality: result.coach.nationality || '',
        currentAddress: result.coach.currentAddress || '',
        biography: result.coach.biography || '',
        education: result.coach.education || [],
        credentials: result.coach.credentials || []
      }
      
      console.log('📝 Datos a asignar:', updatedData)
      Object.assign(profileData, updatedData)
      console.log('✅ Perfil cargado exitosamente')
    } else {
      console.log('❌ No se pudo cargar el coach:', result.error)
    }
  } catch (error) {
    console.error('❌ Error loading profile:', error)
  }
}

// Watch for user authentication
watch(() => user.value?.uid, (newUid) => {
  if (newUid) {
    console.log('👤 Usuario autenticado, cargando perfil...')
    loadProfile()
  }
}, { immediate: true })

onMounted(() => {
  console.log('🚀 Componente montado')
  if (user.value?.uid) {
    console.log('👤 Usuario ya autenticado en onMounted')
    loadProfile()
  }
})
</script> 