<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
    <div class="w-full space-y-6">

      <!-- Profile Summary Card -->
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-white">Información Personal</h3>
          <div class="flex gap-2">
            <AppButtonSecondary v-if="isEditingProfile" @click="handleProfileCancel">
              Cancelar
            </AppButtonSecondary>
            <AppButtonPrimary 
              v-if="isEditingProfile" 
              @click="handleProfileSave"
              :disabled="!hasProfileChanges"
            >
              Guardar
            </AppButtonPrimary>
            <AppButtonSecondary v-else @click="handleProfileEdit">
              Editar
            </AppButtonSecondary>
          </div>
        </div>
        <div class="flex items-start gap-6">
          <!-- Profile Picture -->
          <div class="relative">
            <div 
              class="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden"
              :class="{ 
                'cursor-pointer transition-all duration-200': isEditingProfile,
                'group': isEditingProfile && profileData.profileImageUrl
              }"
            >
              <img 
                v-if="profileData.profileImageUrl" 
                :src="profileData.profileImageUrl" 
                alt="Profile" 
                class="w-full h-full object-cover"
                :class="{ 'cursor-pointer': isEditingProfile }"
                @click="isEditingProfile ? triggerImageUpload() : null"
              />
              <UIcon 
                v-else 
                name="i-heroicons-user" 
                class="w-16 h-16 text-white transition-colors duration-200"
                :class="{ 
                  'cursor-pointer hover:text-orange-200': isEditingProfile 
                }"
                @click="isEditingProfile ? triggerImageUpload() : null"
              />
              
              <!-- Hover overlay for delete (only when editing and has image) -->
              <div 
                v-if="isEditingProfile && profileData.profileImageUrl"
                class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center cursor-pointer"
                @click="handleDeleteImage"
                title="Haz clic para eliminar la imagen"
              >
                <UIcon name="i-heroicons-trash" class="w-8 h-8 text-white" />
              </div>
            </div>
            
            <input 
              ref="imageInput"
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="hidden"
            />
          </div>

          <!-- Left Section: Personal Info -->
          <div class="flex-1">
            <!-- Personal Info Display (when not editing) -->
            <div v-if="!isEditingProfile" class="space-y-4">
              <!-- Name and Nickname -->
              <div>
                <h2 class="text-3xl font-bold text-white mb-1">{{ profileData.fullName || 'Atleta' }}</h2>
                <div v-if="profileData.nickname" class="text-lg text-slate-400 italic">{{ profileData.nickname }}</div>
              </div>
              
              <!-- Title, Gender, Age -->
              <div class="flex items-center gap-4 text-slate-400">
                <span v-if="profileData.presentationTitle">{{ profileData.presentationTitle }}</span>
                <span v-if="profileData.presentationTitle && profileData.gender">|</span>
                <span v-if="profileData.gender" class="capitalize">{{ profileData.gender }}</span>
                <span v-if="profileData.gender && calculateAge(profileData.birthDate) !== 'No especificado'">|</span>
                <span v-if="calculateAge(profileData.birthDate) !== 'No especificado'">{{ calculateAge(profileData.birthDate) }} años</span>
              </div>
              
              <!-- Biography -->
              <div v-if="profileData.biography" class="text-white font-light text-mb">
                {{ profileData.biography }}
              </div>
              <div v-else class="text-slate-500 text-sm italic">
                <span class="font-bold italic">Aún no tienes una biografía</span>
                <br>
                Comparte un poco sobre ti para que tu coach te conozca mejor: tus objetivos, tu experiencia, tus motivaciones. ¡Haz que tu entrenamiento sea más personalizado!
              </div>
            </div>
            
            <!-- Personal Info Inputs (when editing) -->
            <div v-else class="space-y-4">
              <!-- Row 1: Nombre(s), Apellido(s), Apodo -->
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-1">Nombre(s):</label>
                  <AppInput 
                    v-model="profileData.firstName"
                    placeholder="Nombre(s)"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-1">Apellido(s):</label>
                  <AppInput 
                    v-model="profileData.lastName"
                    placeholder="Apellido(s)"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-1">Apodo:</label>
                  <AppInput 
                    v-model="profileData.nickname"
                    placeholder="Apodo"
                  />
                </div>
              </div>

              <!-- Row 2: Título, Género -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-1">Título:</label>
                  <AppInput 
                    v-model="profileData.presentationTitle"
                    placeholder="Ej: Potential Athlete, Fitness Enthusiast, etc."
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-1">Género:</label>
                  <CustomSelect 
                    v-model="profileData.gender"
                    :options="genderOptions"
                    placeholder="Seleccionar género"
                  />
                </div>
              </div>

              <!-- Row 3: Fecha de nacimiento (fila completa) -->
              <div>
                <DatePickerInput 
                  v-model="profileData.birthDate"
                  label="Fecha de nacimiento:"
                  placeholder="dd/mm/yyyy"
                />
              </div>

              <!-- Biography -->
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Biografía:</label>
                <AppTextarea 
                  v-model="profileData.biography"
                  placeholder="Cuéntanos sobre ti, tus objetivos de fitness, tu experiencia..."
                  :rows="3"
                  resize="resize-y"
                  class="min-h-[80px]"
                />
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="w-px bg-slate-600 mx-4 self-stretch"></div>

          <!-- Right Section: User Details -->
          <div class="flex-1">
            <div class="space-y-4">
              <!-- Row 1: Miembro desde, Nombre de usuario -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-1">Miembro desde:</label>
                  <span class="text-white font-semibold h-12 flex items-center">{{ formatDate(profileData.createdAt) }}</span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-1">Nombre de usuario:</label>
                  <span v-if="!isEditingProfile" class="h-12 flex items-center" :class="profileData.uid ? 'text-white font-semibold' : 'text-slate-500 italic'">{{ profileData.uid || 'No especificado' }}</span>
                  <AppInput 
                    v-else
                    v-model="profileData.uid"
                    placeholder="Nombre de usuario"
                    @blur="validateUid"
                  />
                  <span v-if="uidError" class="text-red-400 text-xs">{{ uidError }}</span>
                </div>
              </div>

              <!-- Row 2: Email, Teléfono -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-1">Email:</label>
                  <span v-if="!isEditingProfile" class="h-12 flex items-center" :class="profileData.email ? 'text-white font-semibold' : 'text-slate-500 italic'">{{ profileData.email || 'No especificado' }}</span>
                  <AppInput 
                    v-else
                    v-model="profileData.email"
                    placeholder="Email"
                    type="email"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-1">Número de teléfono:</label>
                  <span v-if="!isEditingProfile" class="h-12 flex items-center" :class="profileData.phone ? 'text-white font-semibold' : 'text-slate-500 italic'">{{ profileData.phone || 'No especificado' }}</span>
                  <AppInput 
                    v-else
                    v-model="profileData.phone"
                    placeholder="Número de teléfono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Address and Goals Section - Side by Side -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Address Section -->
        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-white">Dirección</h3>
            <div class="flex gap-2">
              <AppButtonSecondary v-if="isEditingAddress" @click="handleAddressCancel">
                Cancelar
              </AppButtonSecondary>
              <AppButtonPrimary 
                v-if="isEditingAddress" 
                @click="handleAddressSave"
                :disabled="!hasAddressChanges"
              >
                Guardar
              </AppButtonPrimary>
              <AppButtonSecondary v-else @click="handleAddressEdit">
                Editar
              </AppButtonSecondary>
            </div>
          </div>
          
          <div v-if="!isEditingAddress" class="space-y-4">
            <div class="text-slate-400">
              <span v-if="profileData.addressLine1 || profileData.addressLine2 || profileData.postalCode">
                {{ [profileData.addressLine1, profileData.addressLine2, profileData.postalCode].filter(Boolean).join(', ') }}
              </span>
              <span v-else class="italic">No especificada</span>
            </div>
          </div>
          
          <div v-else class="space-y-4">
            <!-- Address Line 1 -->
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Dirección:</label>
              <AppInput 
                v-model="profileData.addressLine1"
                placeholder="Dirección"
              />
            </div>
            
            <!-- Address Line 2 -->
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Dirección 2 (opcional):</label>
              <AppInput 
                v-model="profileData.addressLine2"
                placeholder="Apartamento, suite, etc."
              />
            </div>
            
            <!-- Postal Code -->
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Código Postal:</label>
              <AppInput 
                v-model="profileData.postalCode"
                placeholder="Código postal"
              />
            </div>
            
            <!-- Country, State, City -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">País:</label>
                <CustomSelect 
                  v-model="profileData.country"
                  :options="countryOptions"
                  placeholder="Seleccionar país"
                  @update:model-value="onCountryChange"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Estado/Provincia:</label>
                <CustomSelect 
                  v-model="profileData.state"
                  :options="stateOptions"
                  placeholder="Seleccionar estado"
                  :disabled="!profileData.country"
                  @update:model-value="onStateChange"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Ciudad:</label>
                <CustomSelect 
                  v-model="profileData.city"
                  :options="cityOptions"
                  placeholder="Seleccionar ciudad"
                  :disabled="!profileData.state"
                  @update:model-value="handleCityChange"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Goals Section -->
        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-white">Mis Objetivos</h3>
            <div class="flex gap-2">
              <AppButtonSecondary v-if="isEditingGoals" @click="handleGoalsCancel">
                Cancelar
              </AppButtonSecondary>
              <AppButtonPrimary 
                v-if="isEditingGoals" 
                @click="handleGoalsSave"
                :disabled="!hasGoalsChanges"
              >
                Guardar
              </AppButtonPrimary>
              <AppButtonSecondary v-else @click="handleGoalsEdit">
                Editar
              </AppButtonSecondary>
            </div>
          </div>
          
          <div v-if="!isEditingGoals" class="space-y-4">
            <div v-if="profileData.goals && profileData.goals.length > 0" class="space-y-3">
              <div 
                v-for="(goal, index) in profileData.goals" 
                :key="index"
                class="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg"
              >
                <div class="text-orange-500">
                  <UIcon name="i-heroicons-target" class="w-5 h-5" />
                </div>
                <div class="flex-1">
                  <p class="text-white font-medium">{{ goal.description }}</p>
                  <p class="text-slate-400 text-sm">{{ goal.targetDate || 'Sin fecha límite' }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-slate-400 text-center py-4">
              <UIcon name="i-heroicons-target" class="w-12 h-12 mx-auto mb-2 text-slate-500" />
              <p>No hay objetivos definidos</p>
              <p class="text-sm">Define tus objetivos para que tu coach pueda ayudarte mejor</p>
            </div>
          </div>
          
          <div v-else class="space-y-4">
            <div v-for="(goal, index) in profileData.goals" :key="index" class="p-4 bg-slate-700/50 rounded-lg">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-white font-medium">Objetivo {{ index + 1 }}</h4>
                <button 
                  @click="removeGoal(index)"
                  class="text-red-400 hover:text-red-300 transition-colors"
                >
                  <UIcon name="i-heroicons-trash" class="w-5 h-5" />
                </button>
              </div>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-1">Descripción:</label>
                  <AppTextarea 
                    v-model="goal.description"
                    placeholder="Describe tu objetivo..."
                    :rows="2"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-1">Fecha objetivo (opcional):</label>
                  <DatePickerInput 
                    v-model="goal.targetDate"
                    placeholder="dd/mm/yyyy"
                  />
                </div>
              </div>
            </div>
            
            <button 
              @click="addGoal"
              class="w-full p-4 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
            >
              <UIcon name="i-heroicons-plus" class="w-6 h-6 mx-auto mb-2" />
              Agregar Objetivo
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useAuth } from '~/composables/firebase'
import { useAthletes } from '~/composables/athletes'
import { useFirebaseStorage } from '~/composables/firebase-storage'
import { toast } from 'vue3-toastify'
import AppCard from '~/components/shared/AppCard.vue'
import CustomSelect from '~/components/shared/CustomSelect.vue'
import AppInput from '~/components/shared/AppInput.vue'
import AppTextarea from '~/components/shared/AppTextarea.vue'
import AppButtonSecondary from '~/components/shared/AppButtonSecondary.vue'
import AppButtonPrimary from '~/components/shared/AppButtonPrimary.vue'
import DatePickerInput from '~/components/shared/DatePickerInput.vue'
import { useCountryCitySelect } from '~/composables/useCountryCitySelect'

const { user } = useAuth()
const { uploadProfileImage } = useFirebaseStorage()
const { getAthleteByAuthUID, updateAthlete } = useAthletes()

// Reactive state
const isEditingProfile = ref(false)
const isEditingAddress = ref(false)
const isEditingGoals = ref(false)

const imageInput = ref<HTMLInputElement>()
const uidError = ref('')

// Original data for change detection
const originalProfileData = ref({
  firstName: '',
  lastName: '',
  nickname: '',
  presentationTitle: '',
  phone: '',
  email: '',
  profileImageUrl: '',
  uid: '',
  gender: '',
  birthDate: '',
  biography: ''
})

const originalAddressData = ref({
  country: '',
  state: '',
  city: '',
  addressLine1: '',
  addressLine2: '',
  postalCode: ''
})

const originalGoalsData = ref({
  goals: [] as Array<{
    description: string
    targetDate: string
  }>
})

// Profile data
const profileData = reactive({
  fullName: '',
  firstName: '',
  lastName: '',
  nickname: '',
  presentationTitle: 'Potential Athlete',
  phone: '',
  email: '',
  profileImageUrl: '',
  uid: '',
  createdAt: null as any,
  
  // Personal info
  gender: '',
  birthDate: '',
  biography: '',
  
  // Address
  country: '',
  state: '',
  city: '',
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
  
  // Goals
  goals: [] as Array<{
    description: string
    targetDate: string
  }>
})

// Country, State, City select
const { countryOptions, stateOptions, cityOptions, onCountryChange, onStateChange, onCityChange } = useCountryCitySelect(
  computed(() => profileData.country),
  computed(() => profileData.state),
  computed(() => profileData.city)
)

// Function to update city when city changes
const handleCityChange = (newCity: string) => {
  onCityChange(newCity)
  profileData.city = newCity
}

// Options for selects
const genderOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' }
]

// Computed to check if there are changes
const hasProfileChanges = computed(() => {
  if (!isEditingProfile.value) return false
  
  const current = {
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    nickname: profileData.nickname,
    presentationTitle: profileData.presentationTitle,
    phone: profileData.phone,
    email: profileData.email,
    profileImageUrl: profileData.profileImageUrl,
    uid: profileData.uid,
    gender: profileData.gender,
    birthDate: profileData.birthDate,
    biography: profileData.biography
  }
  
  const original = {
    firstName: originalProfileData.value.firstName,
    lastName: originalProfileData.value.lastName,
    nickname: originalProfileData.value.nickname,
    presentationTitle: originalProfileData.value.presentationTitle,
    phone: originalProfileData.value.phone,
    email: originalProfileData.value.email,
    profileImageUrl: originalProfileData.value.profileImageUrl,
    uid: originalProfileData.value.uid,
    gender: originalProfileData.value.gender,
    birthDate: originalProfileData.value.birthDate,
    biography: originalProfileData.value.biography
  }
  
  return JSON.stringify(current) !== JSON.stringify(original)
})

const hasAddressChanges = computed(() => {
  if (!isEditingAddress.value) return false
  
  const current = {
    country: profileData.country,
    state: profileData.state,
    city: profileData.city,
    addressLine1: profileData.addressLine1,
    addressLine2: profileData.addressLine2,
    postalCode: profileData.postalCode
  }
  
  const original = {
    country: originalAddressData.value.country,
    state: originalAddressData.value.state,
    city: originalAddressData.value.city,
    addressLine1: originalAddressData.value.addressLine1,
    addressLine2: originalAddressData.value.addressLine2,
    postalCode: originalAddressData.value.postalCode
  }
  
  return JSON.stringify(current) !== JSON.stringify(original)
})

const hasGoalsChanges = computed(() => {
  if (!isEditingGoals.value) return false
  
  const current = {
    goals: profileData.goals.map(goal => ({
      description: goal.description,
      targetDate: goal.targetDate
    }))
  }
  
  const original = {
    goals: originalGoalsData.value.goals.map(goal => ({
      description: goal.description,
      targetDate: goal.targetDate
    }))
  }
  
  return JSON.stringify(current) !== JSON.stringify(original)
})

// Methods
const handleProfileEdit = () => {
  isEditingProfile.value = true
  // Save original data for comparison
  originalProfileData.value = {
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    nickname: profileData.nickname,
    presentationTitle: profileData.presentationTitle,
    phone: profileData.phone,
    email: profileData.email,
    profileImageUrl: profileData.profileImageUrl,
    uid: profileData.uid,
    gender: profileData.gender,
    birthDate: profileData.birthDate,
    biography: profileData.biography
  }
}

const handleProfileSave = async () => {
  if (isEditingProfile.value) {
    await saveProfile()
    isEditingProfile.value = false
  }
}

const handleProfileCancel = () => {
  loadProfile()
  isEditingProfile.value = false
  originalProfileData.value = {
    firstName: '',
    lastName: '',
    nickname: '',
    presentationTitle: '',
    phone: '',
    email: '',
    profileImageUrl: '',
    uid: '',
    gender: '',
    birthDate: '',
    biography: ''
  }
}

const handleAddressEdit = () => {
  isEditingAddress.value = true
  originalAddressData.value = {
    country: profileData.country,
    state: profileData.state,
    city: profileData.city,
    addressLine1: profileData.addressLine1,
    addressLine2: profileData.addressLine2,
    postalCode: profileData.postalCode
  }
}

const handleAddressSave = async () => {
  if (isEditingAddress.value) {
    await saveProfile()
    isEditingAddress.value = false
  }
}

const handleAddressCancel = () => {
  loadProfile()
  isEditingAddress.value = false
  originalAddressData.value = {
    country: '',
    state: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: ''
  }
}

const handleGoalsEdit = () => {
  isEditingGoals.value = true
  originalGoalsData.value = {
    goals: profileData.goals.map(goal => ({
      description: goal.description,
      targetDate: goal.targetDate
    }))
  }
}

const handleGoalsSave = async () => {
  if (isEditingGoals.value) {
    await saveProfile()
    isEditingGoals.value = false
  }
}

const handleGoalsCancel = () => {
  loadProfile()
  isEditingGoals.value = false
  originalGoalsData.value = {
    goals: []
  }
}

const addGoal = () => {
  profileData.goals.push({
    description: '',
    targetDate: ''
  })
}

const removeGoal = (index: number) => {
  profileData.goals.splice(index, 1)
}

const saveProfile = async () => {
  if (!user.value?.uid) return
  
  try {
    console.log('🔄 Guardando perfil de atleta...')
    
    const updateData = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      fullName: `${profileData.firstName} ${profileData.lastName}`.trim(),
      nickname: profileData.nickname,
      phone: profileData.phone,
      email: profileData.email,
      profileImageUrl: profileData.profileImageUrl,
      presentationTitle: profileData.presentationTitle,
      gender: profileData.gender as 'masculino' | 'femenino' | 'otro',
      birthDate: profileData.birthDate,
      country: profileData.country,
      state: profileData.state,
      city: profileData.city,
      addressLine1: profileData.addressLine1,
      addressLine2: profileData.addressLine2,
      postalCode: profileData.postalCode,
      biography: profileData.biography,
      goals: profileData.goals
    }
    
    console.log('💾 Actualizando atleta con ID:', user.value.uid)
    
    const result = await updateAthlete(user.value.uid, updateData)
    
    if (result.success) {
      console.log('✅ Perfil guardado exitosamente')
      toast.success('Los cambios se guardaron correctamente. ¡Tu información está al día!')
    } else {
      console.error('❌ Error al guardar perfil:', result.error)
      toast.error('Error al guardar los cambios. Inténtalo de nuevo.')
    }
  } catch (error) {
    console.error('❌ Error saving profile:', error)
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
      const result = await uploadProfileImage(file, user.value?.uid || 'profile', profileData.fullName || 'Athlete')
      if (result.success) {
        profileData.profileImageUrl = result.url!
        console.log('✅ Imagen de perfil subida exitosamente')
      }
    } catch (error) {
      console.error('Error uploading profile image:', error)
    }
  }
}

const handleDeleteImage = () => {
  profileData.profileImageUrl = ''
  console.log('🗑️ Imagen de perfil marcada para eliminación')
}

// Validate UID uniqueness
const validateUid = async () => {
  if (!profileData.uid || profileData.uid.trim() === '') {
    uidError.value = ''
    return
  }
  
  try {
    const result = await getAthleteByAuthUID(profileData.uid)
    
    if (result.success && result.athlete) {
      if (result.athlete.uid !== user.value?.uid) {
        uidError.value = 'Este User ID ya está en uso'
      } else {
        uidError.value = ''
      }
    } else {
      uidError.value = ''
    }
  } catch (error) {
    console.error('Error validating UID:', error)
    uidError.value = 'Error al validar User ID'
  }
}

// Format date for display
const formatDate = (date: any) => {
  if (!date) return 'No especificado'
  
  try {
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    const day = dateObj.getDate()
    const month = dateObj.toLocaleDateString('es-ES', { month: 'long' })
    const year = dateObj.getFullYear()
    
    // Capitalize first letter of month
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1)
    
    return `${day} de ${capitalizedMonth} de ${year}`
  } catch (error) {
    return 'No especificado'
  }
}

// Calculate age from birth date
const calculateAge = (birthDate: string) => {
  if (!birthDate) return 'No especificado'
  
  let birth: Date
  if (birthDate.includes('/')) {
    const [day, month, year] = birthDate.split('/').map(Number)
    birth = new Date(year, month - 1, day)
  } else {
    birth = new Date(birthDate)
  }
  
  if (isNaN(birth.getTime())) return 'No especificado'
  
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age.toString()
}

// Load profile data
const loadProfile = async () => {
  console.log('🔄 Cargando perfil del atleta...')
  
  if (!user.value?.uid) {
    console.log('❌ No hay usuario autenticado')
    return
  }
  
  try {
    console.log('🔍 Buscando atleta por UID:', user.value.uid)
    const result = await getAthleteByAuthUID(user.value.uid)
    
    console.log('📊 Resultado de búsqueda:', result)
    
    if (result.success && result.athlete) {
      console.log('✅ Atleta encontrado:', result.athlete)
      
      const fullName = result.athlete.fullName || `${result.athlete.firstName || ''} ${result.athlete.lastName || ''}`.trim()
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      const updatedData = {
        fullName: fullName,
        firstName: result.athlete.firstName || firstName,
        lastName: result.athlete.lastName || lastName,
        nickname: result.athlete.nickname || '',
        presentationTitle: (result.athlete as any).presentationTitle || 'Potential Athlete',
        email: result.athlete.email,
        phone: result.athlete.phone || '',
        profileImageUrl: result.athlete.profileImageUrl || '',
        uid: result.athlete.uid || '',
        createdAt: result.athlete.createdAt || null,
        gender: (result.athlete as any).gender || '',
        birthDate: (result.athlete as any).birthDate || '',
        country: (result.athlete as any).country || '',
        state: (result.athlete as any).state || '',
        city: (result.athlete as any).city || '',
        addressLine1: (result.athlete as any).addressLine1 || '',
        addressLine2: (result.athlete as any).addressLine2 || '',
        postalCode: (result.athlete as any).postalCode || '',
        biography: (result.athlete as any).biography || '',
        goals: (result.athlete as any).goals || []
      }
      
      console.log('📝 Datos a asignar:', updatedData)
      Object.assign(profileData, updatedData)
      console.log('✅ Perfil cargado exitosamente')
    } else {
      console.log('❌ No se pudo cargar el atleta:', result.error)
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
  console.log('🚀 Componente AthleteProfileView montado')
  if (user.value?.uid) {
    console.log('👤 Usuario ya autenticado en onMounted')
    loadProfile()
  }
})
</script>

<style scoped>
/* No styles needed for date picker anymore - using modal approach */
</style> 