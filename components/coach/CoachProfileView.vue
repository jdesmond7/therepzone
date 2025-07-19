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
                <h2 class="text-3xl font-bold text-white mb-1">{{ profileData.fullName || 'Coach' }}</h2>
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
                Comparte un poco sobre ti para que tus atletas te conozcan mejor: tu experiencia, tu enfoque, tus pasiones. ¡Haz que conectar contigo sea más fácil!
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
                    placeholder="Puesto que tienes o trabajo que desempeñas"
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
                  placeholder="Cuéntanos sobre ti, tu experiencia, especialidades..."
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
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-1">Número de teléfono:</label>
                  <span v-if="!isEditingProfile" class="h-12 flex items-center" :class="profileData.phone ? 'text-white font-semibold' : 'text-slate-500 italic'">{{ profileData.phone || 'No especificado' }}</span>
                  <AppInput 
                    v-else
                    v-model="profileData.phone"
                    placeholder="Teléfono"
                  />
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>

      <!-- Personal Information and Education Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Address Card -->
        <AppCard>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-white">Dirección</h3>
            <div class="flex gap-2">
              <AppButtonSecondary v-if="isEditingPersonal" @click="handlePersonalCancel">
                Cancelar
              </AppButtonSecondary>
              <AppButtonPrimary 
                v-if="isEditingPersonal" 
                @click="handlePersonalSave"
                :disabled="!hasPersonalChanges"
              >
                Guardar
              </AppButtonPrimary>
              <AppButtonSecondary v-else @click="handlePersonalEdit">
                Editar
              </AppButtonSecondary>
            </div>
          </div>
          
          <div class="space-y-4">
            <!-- Address Display (when not editing) -->
            <div v-if="!isEditingPersonal">
              <label class="block text-sm font-medium text-slate-400 mb-1">Dirección</label>
              <span class="h-12 flex items-center" :class="formatAddress() !== 'No especificada' ? 'text-white font-semibold' : 'text-slate-500 italic'">{{ formatAddress() }}</span>
            </div>
            
            <!-- Address Fields (when editing) -->
            <div v-else class="space-y-4">
              
              <!-- Address Line 1 -->
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Dirección línea 1</label>
                <AppInput 
                  v-model="profileData.addressLine1"
                  placeholder="Calle, número y colonia"
                />
              </div>
              
              <!-- Address Line 2 -->
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Dirección línea 2 (opcional)</label>
                <AppInput 
                  v-model="profileData.addressLine2"
                  placeholder="Información adicional"
                />
              </div>
              
              <!-- Postal Code -->
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Código postal</label>
                <AppInput 
                  v-model="profileData.postalCode"
                  placeholder="Código postal"
                />
              </div>
              
              <!-- Country -->
              <div style="z-index: 999999;">
                <label class="block text-sm font-medium text-slate-400 mb-1">País</label>
                <CustomSelect 
                  v-model="profileData.country"
                  :options="countryOptions"
                  placeholder="Seleccionar país"
                  @update:modelValue="onCountryChange"
                />
              </div>
              
              <!-- State -->
              <div style="z-index: 999999;">
                <label class="block text-sm font-medium text-slate-400 mb-1">Estado / Provincia</label>
                <CustomSelect 
                  v-model="profileData.state"
                  :options="stateOptions"
                  placeholder="Seleccionar estado"
                  :disabled="!profileData.country"
                  @update:modelValue="onStateChange"
                />
              </div>
              
              <!-- City -->
              <div style="z-index: 999999;">
                <label class="block text-sm font-medium text-slate-400 mb-1">Ciudad / Municipio</label>
                <CustomSelect 
                  v-model="profileData.city"
                  :options="cityOptions"
                  placeholder="Seleccionar ciudad"
                  :disabled="!profileData.state"
                  @update:modelValue="handleCityChange"
                />
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Education Information Card -->
        <AppCard>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-white">Información Educativa</h3>
            <div class="flex gap-2">
              <AppButtonSecondary v-if="isEditingEducation" @click="handleEducationCancel">
                Cancelar
              </AppButtonSecondary>
              <AppButtonPrimary 
                v-if="isEditingEducation" 
                @click="handleEducationSave"
                :disabled="!hasEducationChanges"
              >
                Guardar
              </AppButtonPrimary>
              <AppButtonSecondary v-else @click="handleEducationEdit">
                Editar
              </AppButtonSecondary>
            </div>
          </div>
          
          <div class="space-y-4">
            <div 
              v-for="(education, index) in profileData.education" 
              :key="index"
              class="p-3 bg-slate-600/50 rounded-lg"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div v-if="!isEditingEducation" class="font-medium text-white">{{ education.degree }}</div>
                  <AppInput 
                    v-else
                    v-model="education.degree"
                    placeholder="Título o certificado"
                  />
                  
                  <div v-if="!isEditingEducation" class="text-slate-400 text-sm">{{ education.institution }}</div>
                  <AppInput 
                    v-else
                    v-model="education.institution"
                    placeholder="Institución"
                  />
                  
                  <div v-if="!isEditingEducation" class="text-slate-400 text-sm">{{ education.period }}</div>
                  <div v-else class="flex gap-2">
                    <AppInput 
                      v-model="education.period"
                      placeholder="Período (ej: 2018-2022)"
                    />
                  </div>
                </div>
                <button 
                  v-if="isEditingEducation"
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
            
            <button 
              v-if="isEditingEducation"
              @click="addEducation"
              class="w-full mt-4 p-3 border-2 border-dashed border-slate-500 rounded-lg text-slate-400 hover:text-slate-300 hover:border-slate-400 transition-colors"
            >
              <UIcon name="i-heroicons-plus" class="w-5 h-5 mx-auto mb-1" />
              Agregar educación
            </button>
          </div>
        </AppCard>

        <!-- Credentials Card (moved here) -->
        <AppCard>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-white">Credenciales y Certificaciones</h3>
            <div class="flex gap-2">
              <AppButtonSecondary v-if="isEditingCredentials" @click="handleCredentialsCancel">
                Cancelar
              </AppButtonSecondary>
              <AppButtonPrimary 
                v-if="isEditingCredentials" 
                @click="handleCredentialsSave"
                :disabled="!hasCredentialsChanges"
              >
                Guardar
              </AppButtonPrimary>
              <AppButtonSecondary v-else @click="handleCredentialsEdit">
                Editar
              </AppButtonSecondary>
            </div>
          </div>
          
          <div class="space-y-4">
            <div 
              v-for="(credential, index) in profileData.credentials" 
              :key="index"
              class="p-3 bg-slate-600/50 rounded-lg"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div v-if="!isEditingCredentials" class="font-medium text-white">{{ credential.name }}</div>
                  <AppInput 
                    v-else
                    v-model="credential.name"
                    placeholder="Nombre de la credencial"
                  />
                  
                  <div v-if="!isEditingCredentials" class="text-slate-400 text-sm">{{ credential.issuer }}</div>
                  <AppInput 
                    v-else
                    v-model="credential.issuer"
                    placeholder="Institución emisora"
                  />
                  
                  <div v-if="!isEditingCredentials" class="text-slate-400 text-sm">{{ credential.date }}</div>
                  <AppInput 
                    v-else
                    v-model="credential.date"
                    type="date"
                  />
                </div>
                <div class="flex gap-1">
                  <button 
                    v-if="isEditingCredentials"
                    @click="uploadCredentialFileHandler(index)"
                    class="text-blue-400 hover:text-blue-300"
                    title="Subir archivo"
                  >
                    <UIcon name="i-heroicons-arrow-up-tray" class="w-4 h-4" />
                  </button>
                  <button 
                    v-if="isEditingCredentials"
                    @click="removeCredential(index)"
                    class="text-red-400 hover:text-red-300"
                    title="Eliminar"
                  >
                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <!-- File preview -->
              <div v-if="credential.fileUrl" class="mt-2">
                <div class="flex items-center gap-2 p-2 bg-slate-500/50 rounded">
                  <UIcon name="i-heroicons-document" class="w-3 h-3 text-slate-400" />
                  <span class="text-slate-300 text-xs flex-1 truncate">{{ credential.fileName || 'Documento' }}</span>
                  <a 
                    :href="credential.fileUrl" 
                    target="_blank"
                    class="text-orange-400 hover:text-orange-300"
                  >
                    <UIcon name="i-heroicons-eye" class="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
            
            <div v-if="profileData.credentials.length === 0" class="text-slate-400 text-center py-4">
              No hay credenciales agregadas
            </div>
            
            <button 
              v-if="isEditingCredentials"
              @click="addCredential"
              class="w-full mt-4 p-3 border-2 border-dashed border-slate-500 rounded-lg text-slate-400 hover:text-slate-300 hover:border-slate-400 transition-colors"
            >
              <UIcon name="i-heroicons-plus" class="w-5 h-5 mx-auto mb-1" />
              Agregar credencial
            </button>
          </div>
        </AppCard>
      </div>


    </div>
  </div>
</template>

<script setup lang="ts">
import { useFirebaseStorage } from '~/composables/firebase-storage'
import { toast } from 'vue3-toastify'
import AppCard from '~/components/AppCard.vue'
import CustomSelect from '~/components/CustomSelect.vue'
import AppInput from '~/components/AppInput.vue'
import AppTextarea from '~/components/AppTextarea.vue'
import AppButtonSecondary from '~/components/AppButtonSecondary.vue'
import AppButtonPrimary from '~/components/AppButtonPrimary.vue'

import DatePickerInput from '~/components/DatePickerInput.vue'
import { useCountryCitySelect } from '~/composables/useCountryCitySelect'

const { user } = useAuth()
const { uploadProfileImage, uploadCredentialFile } = useFirebaseStorage()
const { getCoachByAuthUID, updateCoach } = useCoaches()



// Reactive state
const isEditing = ref(false)
const isEditingProfile = ref(false)
const isEditingPersonal = ref(false)
const isEditingEducation = ref(false)
const isEditingCredentials = ref(false)

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
  country: '',
  state: '',
  city: '',
  gender: '',
  birthDate: '',
  nationality: '',
  currentAddress: '',
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
  biography: '',
  education: [] as Array<{
    degree: string
    institution: string
    period: string
  }>,
  credentials: [] as Array<{
    name: string
    issuer: string
    date: string
    fileUrl?: string
    fileName?: string
  }>
})

// Separate original data for different sections
const originalPersonalData = ref({
  country: '',
  state: '',
  city: '',
  addressLine1: '',
  addressLine2: '',
  postalCode: ''
})

const originalEducationData = ref({
  education: [] as Array<{
    degree: string
    institution: string
    period: string
  }>
})

const originalCredentialsData = ref({
  credentials: [] as Array<{
    name: string
    issuer: string
    date: string
    fileUrl?: string
    fileName?: string
  }>
})

// Profile data
const profileData = reactive({
  fullName: '',
  firstName: '',
  lastName: '',
  nickname: '',
  presentationTitle: 'Coach',
  phone: '',
  email: '',
  profileImageUrl: '',
  uid: '',
  createdAt: null as any,
  
  // Personal info
  gender: '',
  birthDate: '',
  country: '',
  state: '',
  city: '',
  nationality: '',
  currentAddress: '',
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
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

// Country, State, City select (moved after profileData definition)
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

const hasPersonalChanges = computed(() => {
  if (!isEditingPersonal.value) return false
  
  const current = {
    country: profileData.country,
    state: profileData.state,
    city: profileData.city,
    addressLine1: profileData.addressLine1,
    addressLine2: profileData.addressLine2,
    postalCode: profileData.postalCode
  }
  
  const original = {
    country: originalPersonalData.value.country,
    state: originalPersonalData.value.state,
    city: originalPersonalData.value.city,
    addressLine1: originalPersonalData.value.addressLine1,
    addressLine2: originalPersonalData.value.addressLine2,
    postalCode: originalPersonalData.value.postalCode
  }
  
  return JSON.stringify(current) !== JSON.stringify(original)
})

const hasEducationChanges = computed(() => {
  if (!isEditingEducation.value) return false
  
  const current = {
    education: profileData.education.map(edu => ({
      degree: edu.degree,
      institution: edu.institution,
      period: edu.period
    }))
  }
  
  const original = {
    education: originalEducationData.value.education.map(edu => ({
      degree: edu.degree,
      institution: edu.institution,
      period: edu.period
    }))
  }
  
  return JSON.stringify(current) !== JSON.stringify(original)
})

const hasCredentialsChanges = computed(() => {
  if (!isEditingCredentials.value) return false
  
  const current = {
    credentials: profileData.credentials.map(cred => ({
      name: cred.name,
      issuer: cred.issuer,
      date: cred.date,
      fileUrl: cred.fileUrl,
      fileName: cred.fileName
    }))
  }
  
  const original = {
    credentials: originalCredentialsData.value.credentials.map(cred => ({
      name: cred.name,
      issuer: cred.issuer,
      date: cred.date,
      fileUrl: cred.fileUrl,
      fileName: cred.fileName
    }))
  }
  
  return JSON.stringify(current) !== JSON.stringify(original)
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
      nationality: profileData.nationality,
      currentAddress: profileData.currentAddress,
      addressLine1: profileData.addressLine1,
      addressLine2: profileData.addressLine2,
      postalCode: profileData.postalCode,
      biography: profileData.biography,
      education: profileData.education,
      credentials: profileData.credentials
    }
    
    // Save to coaches collection using the coach's UID
    const result = await updateCoach(profileData.uid, updateData)
    
    if (result.success) {
      toast.success('Los cambios se guardaron correctamente. ¡Tu información está al día!')
    } else {
      console.error('Error al guardar perfil:', result.error)
      toast.error('Error al guardar los cambios. Inténtalo de nuevo.')
    }
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
  // Clear the image URL locally (don't save to Firestore yet)
  profileData.profileImageUrl = ''
  console.log('🗑️ Imagen de perfil marcada para eliminación (cambios pendientes)')
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

// Validate UID uniqueness
const validateUid = async () => {
  if (!profileData.uid || profileData.uid.trim() === '') {
    uidError.value = ''
    return
  }
  
  try {
    // Check if UID already exists in coaches collection
    const result = await getCoachByAuthUID(profileData.uid)
    
    if (result.success && result.coach) {
      // If found and it's not the current coach, show error
      if (result.coach.uid !== profileData.uid) {
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
    return dateObj.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch (error) {
    return 'No especificado'
  }
}

// Calculate age from birth date
const calculateAge = (birthDate: string) => {
  if (!birthDate) return 'No especificado'
  
  let birth: Date
  // Handle different date formats
  if (birthDate.includes('/')) {
    // Format: dd/mm/yyyy
    const [day, month, year] = birthDate.split('/').map(Number)
    birth = new Date(year, month - 1, day)
  } else {
    // Format: yyyy-mm-dd (ISO)
    birth = new Date(birthDate)
  }
  
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Format address for display
const formatAddress = () => {
  const parts = []
  if (profileData.addressLine1) parts.push(profileData.addressLine1)
  if (profileData.addressLine2) parts.push(profileData.addressLine2)
  if (profileData.postalCode) parts.push(profileData.postalCode)
  if (profileData.country) parts.push(profileData.country)
  if (profileData.state) parts.push(profileData.state)
  if (profileData.city) parts.push(profileData.city)
  
  if (parts.length === 0) return 'No especificada'
  return parts.join(', ')
}

// Handle profile edit
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
    country: profileData.country,
    state: profileData.state,
    city: profileData.city,
    nationality: profileData.nationality,
    currentAddress: profileData.currentAddress,
    addressLine1: profileData.addressLine1,
    addressLine2: profileData.addressLine2,
    postalCode: profileData.postalCode,
    biography: profileData.biography,
    education: JSON.parse(JSON.stringify(profileData.education)),
    credentials: JSON.parse(JSON.stringify(profileData.credentials))
  }
  uidError.value = '' // Clear previous errors
}

// Handle profile save
const handleProfileSave = async () => {
  if (isEditingProfile.value) {
    // Save changes
    await saveProfile()
    isEditingProfile.value = false
  }
}

// Handle profile cancel
const handleProfileCancel = () => {
  // Reload original data to discard changes
  loadProfile()
  isEditingProfile.value = false
  uidError.value = ''
  // Clear original data
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
    country: '',
    state: '',
    city: '',
    nationality: '',
    currentAddress: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    biography: '',
    education: [],
    credentials: []
  }
}

// Handle personal info edit
const handlePersonalEdit = () => {
  isEditingPersonal.value = true
  // Save original data for comparison
  originalPersonalData.value = {
    country: profileData.country,
    state: profileData.state,
    city: profileData.city,
    addressLine1: profileData.addressLine1,
    addressLine2: profileData.addressLine2,
    postalCode: profileData.postalCode
  }
}

// Handle personal save
const handlePersonalSave = async () => {
  if (isEditingPersonal.value) {
    // Save changes
    await saveProfile()
    isEditingPersonal.value = false
  }
}

// Handle personal cancel
const handlePersonalCancel = () => {
  // Reload original data to discard changes
  loadProfile()
  isEditingPersonal.value = false
  // Clear original data
  originalPersonalData.value = {
    country: '',
    state: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: ''
  }
}

// Handle education edit
const handleEducationEdit = () => {
  isEditingEducation.value = true
  // Save original data for comparison
  originalEducationData.value = {
    education: profileData.education.map(edu => ({
      degree: edu.degree,
      institution: edu.institution,
      period: edu.period
    }))
  }
}

// Handle education save
const handleEducationSave = async () => {
  if (isEditingEducation.value) {
    // Save changes
    await saveProfile()
    isEditingEducation.value = false
  }
}

// Handle education cancel
const handleEducationCancel = () => {
  // Reload original data to discard changes
  loadProfile()
  isEditingEducation.value = false
  // Clear original data
  originalEducationData.value = {
    education: []
  }
}

// Handle credentials edit
const handleCredentialsEdit = () => {
  isEditingCredentials.value = true
  // Save original data for comparison
  originalCredentialsData.value = {
    credentials: profileData.credentials.map(cred => ({
      name: cred.name,
      issuer: cred.issuer,
      date: cred.date,
      fileUrl: cred.fileUrl,
      fileName: cred.fileName
    }))
  }
}

// Handle credentials save
const handleCredentialsSave = async () => {
  if (isEditingCredentials.value) {
    // Save changes
    await saveProfile()
    isEditingCredentials.value = false
  }
}

// Handle credentials cancel
const handleCredentialsCancel = () => {
  // Reload original data to discard changes
  loadProfile()
  isEditingCredentials.value = false
  // Clear original data
  originalCredentialsData.value = {
    credentials: []
  }
}

// Load profile data
const loadProfile = async () => {
  if (!user.value?.uid) {
    console.log('No hay usuario autenticado')
    return
  }
  
  try {
    const result = await getCoachByAuthUID(user.value.uid)
    
    if (result.success && result.coach) {
      // Merge coach data with profile data
      const fullName = result.coach.fullName || `${result.coach.firstName || ''} ${result.coach.lastName || ''}`.trim()
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      const updatedData = {
        fullName: fullName,
        firstName: result.coach.firstName || firstName,
        lastName: result.coach.lastName || lastName,
        nickname: result.coach.nickname || '',
        presentationTitle: result.coach.presentationTitle || 'Coach',
        email: result.coach.email,
        phone: result.coach.phone || '',
        profileImageUrl: result.coach.profileImageUrl || '',
        uid: result.coach.uid || '',
        createdAt: result.coach.createdAt || null,
        gender: result.coach.gender || '',
        birthDate: result.coach.birthDate || '',
        country: result.coach.country || '',
        state: result.coach.state || '',
        city: result.coach.city || '',
        nationality: result.coach.nationality || '',
        currentAddress: result.coach.currentAddress || '',
        addressLine1: result.coach.addressLine1 || '',
        addressLine2: result.coach.addressLine2 || '',
        postalCode: result.coach.postalCode || '',
        biography: result.coach.biography || '',
        education: result.coach.education || [],
        credentials: result.coach.credentials || []
      }
      
      Object.assign(profileData, updatedData)
    } else {
      console.error('No se pudo cargar el coach:', result.error)
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  }
}

// Watch for user authentication
watch(() => user.value?.uid, (newUid) => {
  if (newUid) {
    loadProfile()
  }
}, { immediate: true })

onMounted(() => {
  if (user.value?.uid) {
    loadProfile()
  }
})
</script> 

<style scoped>
/* No styles needed for date picker anymore - using modal approach */
</style>