<template>
  <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-black text-white mb-2">{{ title }}</h2>
      <p class="text-slate-400">{{ subtitle }}</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Error message -->
      <div v-if="errorMessage" class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p class="text-red-400 text-sm">{{ errorMessage }}</p>
      </div>

      <!-- General Error Message -->
      <div v-if="fieldErrors.general" class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p class="text-red-400 text-sm">{{ fieldErrors.general }}</p>
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <p class="text-green-400 text-sm">{{ successMessage }}</p>
      </div>

      <!-- Nombre * -->
      <div>
        <label for="firstName" class="block text-sm font-medium text-slate-400 mb-1">
          Nombre(s) *
        </label>
        <input
          id="firstName"
          v-model="formData.firstName"
          type="text"
          autocomplete="off"
          :class="[
            'w-full pl-4 pr-8 py-3 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent',
            fieldErrors.firstName 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-600 focus:ring-orange-600'
          ]"
          placeholder="Tu nombre"
          required
        />
        <p v-if="fieldErrors.firstName" class="text-red-400 text-xs mt-1">{{ fieldErrors.firstName }}</p>
      </div>

      <!-- Apellido * -->
      <div>
        <label for="lastName" class="block text-sm font-medium text-slate-400 mb-1">
          Apellido(s) *
        </label>
        <input
          id="lastName"
          v-model="formData.lastName"
          type="text"
          autocomplete="off"
          :class="[
            'w-full pl-4 pr-8 py-3 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent',
            fieldErrors.lastName 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-600 focus:ring-orange-600'
          ]"
          placeholder="Tus apellidos"
          required
        />
        <p v-if="fieldErrors.lastName" class="text-red-400 text-xs mt-1">{{ fieldErrors.lastName }}</p>
      </div>

      <!-- Apodo -->
      <div>
        <label for="nickname" class="block text-sm font-medium text-slate-400 mb-1">
          Apodo:
        </label>
        <input
          id="nickname"
          v-model="formData.nickname"
          type="text"
          autocomplete="off"
          :class="[
            'w-full pl-4 pr-8 py-3 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent',
            fieldErrors.nickname 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-600 focus:ring-orange-600'
          ]"
          placeholder="¿Cómo te gusta que te llamen?"
        />
        <p v-if="fieldErrors.nickname" class="text-red-400 text-xs mt-1">{{ fieldErrors.nickname }}</p>
      </div>

      <!-- Fecha de cumpleaños -->
      <div>
        <DatePickerInput
          v-model="formData.birthDate"
          label="Fecha de cumpleaños *"
          placeholder="dd/mm/yyyy"
          :class="[
            fieldErrors.birthDate ? 'border-red-500' : ''
          ]"
        />
        <p v-if="fieldErrors.birthDate" class="text-red-400 text-xs mt-1">{{ fieldErrors.birthDate }}</p>
      </div>

      <!-- Género * -->
      <div>
        <label class="block text-sm font-medium text-slate-400 mb-1">
          Género *
        </label>
        <div class="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            @click="formData.gender = 'masculino'"
            :class="[
              'w-full sm:flex-1 py-3 px-4 rounded-lg font-medium transition-colors',
              formData.gender === 'masculino' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
              fieldErrors.gender ? 'ring-2 ring-red-500' : ''
            ]"
          >
            Masculino
          </button>
          <button
            type="button"
            @click="formData.gender = 'femenino'"
            :class="[
              'w-full sm:flex-1 py-3 px-4 rounded-lg font-medium transition-colors',
              formData.gender === 'femenino' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
              fieldErrors.gender ? 'ring-2 ring-red-500' : ''
            ]"
          >
            Femenino
          </button>
          <button
            type="button"
            @click="formData.gender = 'otro'"
            :class="[
              'w-full sm:flex-1 py-3 px-4 rounded-lg font-medium transition-colors',
              formData.gender === 'otro' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
              fieldErrors.gender ? 'ring-2 ring-red-500' : ''
            ]"
          >
            Otro
          </button>
        </div>
        <p v-if="fieldErrors.gender" class="text-red-400 text-xs mt-1">{{ fieldErrors.gender }}</p>
      </div>

      <!-- País -->
      <div>
        <label class="block text-sm font-medium text-slate-400 mb-1">
          País *
        </label>
        <CustomSelect
          v-model="formData.country"
          :options="countryOptions"
          placeholder="Selecciona tu país"
          :error="!!fieldErrors.country"
          @update:modelValue="onCountryChange"
        />
        <p v-if="fieldErrors.country" class="text-red-400 text-xs mt-1">{{ fieldErrors.country }}</p>
      </div>

      <!-- Estado -->
      <div>
        <label class="block text-sm font-medium text-slate-400 mb-1">
          Estado / Provincia *
        </label>
        <CustomSelect
          v-model="formData.state"
          :options="stateOptions"
          :placeholder="!formData.country ? 'Primero selecciona un país' : 'Selecciona tu estado'"
          :disabled="!formData.country"
          :error="!!fieldErrors.state"
          @update:modelValue="onStateChange"
        />
        <p v-if="fieldErrors.state" class="text-red-400 text-xs mt-1">{{ fieldErrors.state }}</p>
      </div>

      <!-- Ciudad -->
      <div>
        <label class="block text-sm font-medium text-slate-400 mb-1">
          Ciudad / Municipio *
        </label>
        <CustomSelect
          v-model="formData.city"
          :options="cityOptions"
          :placeholder="!formData.state ? 'Primero selecciona un estado' : 'Selecciona tu ciudad'"
          :disabled="!formData.state"
          :error="!!fieldErrors.city"
          @update:modelValue="onCityChange"
        />
        <p v-if="fieldErrors.city" class="text-red-400 text-xs mt-1">{{ fieldErrors.city }}</p>
      </div>

      <!-- Correo electrónico (si no está en modo usuario existente) -->
      <div v-if="showEmailField">
        <label for="email" class="block text-sm font-medium text-slate-400 mb-1">
          Correo electrónico *
        </label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          autocomplete="email"
          :class="[
            'w-full pl-4 pr-8 py-3 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent email-input',
            fieldErrors.email 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-600 focus:ring-orange-600'
          ]"
          placeholder="correo@ejemplo.com"
          :required="showEmailField"
        />
        <p v-if="fieldErrors.email" class="text-red-400 text-xs mt-1">{{ fieldErrors.email }}</p>
      </div>

      <!-- Número de teléfono -->
      <div>
        <label for="phone" class="block text-sm font-medium text-slate-400 mb-1">
          Número de teléfono
        </label>
        <input
          id="phone"
          v-model="formData.phone"
          type="tel"
          autocomplete="off"
          :class="[
            'w-full pl-4 pr-8 py-3 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent',
            fieldErrors.phone 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-600 focus:ring-orange-600'
          ]"
          placeholder="+1 (555) 123-4567"
        />
        <p v-if="fieldErrors.phone" class="text-red-400 text-xs mt-1">{{ fieldErrors.phone }}</p>
      </div>

      <!-- ¿Cómo te enteraste de nosotros? -->
      <div>
        <label class="block text-sm font-medium text-slate-400 mb-1">
          ¿Cómo supiste de Therepzone? *
        </label>
        <CustomSelect
          v-model="formData.howDidYouHearAboutUs"
          :options="howDidYouHearOptions"
          placeholder="Selecciona una opción"
          :error="!!fieldErrors.howDidYouHearAboutUs"
        />
        <p v-if="fieldErrors.howDidYouHearAboutUs" class="text-red-400 text-xs mt-1">{{ fieldErrors.howDidYouHearAboutUs }}</p>
      </div>

      <!-- Foto de perfil -->
      <div>
        <label class="block text-sm font-medium text-slate-400 mb-1">
          Foto de perfil
        </label>
        <div v-if="!selectedImage" class="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-orange-600 transition-colors">
          <UIcon name="i-heroicons-camera" class="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p class="text-slate-400 mb-2">Subir foto de perfil</p>
          <p class="text-slate-500 text-xs mb-2">Se convertirá automáticamente a WebP para mejor calidad</p>
          <input
            type="file"
            @change="handleImageUpload"
            accept="image/*"
            class="hidden"
            ref="fileInput"
          />
          <div class="flex justify-center">
            <AppButtonSecondary
              @click="fileInput?.click()"
            >
              Seleccionar Imagen
            </AppButtonSecondary>
          </div>
        </div>
        <div v-else class="relative inline-block">
          <img 
            :src="selectedImage" 
            alt="Preview" 
            class="w-60 h-60 rounded-full object-cover cursor-pointer group"
            @click="removeImage"
            title="Haz clic para eliminar la imagen"
          />
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center">
            <UIcon name="i-heroicons-trash" class="w-8 h-8 text-white" />
          </div>
        </div>
        <p v-if="fieldErrors.profilePhoto" class="text-red-400 text-xs mt-1">{{ fieldErrors.profilePhoto }}</p>
      </div>

      <!-- Field Error Messages -->
      <div
        v-if="allFieldErrorMessages.length > 0"
        ref="errorBlock"
        class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
      >
        <p class="text-red-400 text-sm font-medium mb-2">Por favor corrige los siguientes errores:</p>
        <ul class="text-red-400 text-sm space-y-1">
          <li v-for="error in allFieldErrorMessages" :key="error" class="flex items-start">
            <span class="text-red-300 mr-2">•</span>
            <span>{{ error }}</span>
          </li>
        </ul>
      </div>

      <!-- Botones -->
      <div class="flex gap-3 pt-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="flex-1 h-12 border border-slate-600 text-slate-400 hover:text-orange-400 hover:border-orange-400 font-bold px-4 rounded-lg transition-colors bg-transparent"
          v-if="showCancelButton"
        >
          Cancelar
        </button>
        <AppButtonPrimary
          type="submit"
          :loading="isLoading"
          :disabled="isLoading"
          class="flex-1"
        >
          {{ submitButtonText }}
        </AppButtonPrimary>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import DatePickerInput from './DatePickerInput.vue'
import { useCountryCitySelect } from '~/composables/useCountryCitySelect'

interface UserFormData {
  firstName: string
  lastName: string
  nickname: string
  birthDate: string
  gender: 'masculino' | 'femenino' | 'otro' | ''
  country: string
  state: string
  city: string
  email: string
  phone: string
  profilePhoto: string
  howDidYouHearAboutUs: string
}

interface Props {
  title?: string
  subtitle?: string
  submitButtonText?: string
  showEmailField?: boolean
  showCancelButton?: boolean
  initialData?: Partial<UserFormData>
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Completa tu perfil',
  subtitle: 'Necesitamos algunos datos adicionales para personalizar tu experiencia',
  submitButtonText: 'Continuar',
  showEmailField: false,
  showCancelButton: false,
  initialData: () => ({})
})

const emit = defineEmits<{
  submit: [data: UserFormData & { fullName: string; age: number; profileImageFile?: File }]
  cancel: []
}>()

// Reactive state
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const selectedImage = ref('')
const profileImageFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement>()

// Field-specific errors
const fieldErrors = reactive<Record<string, string>>({})
const errorBlock = ref<HTMLElement | null>(null)

const formData = reactive<UserFormData>({
  firstName: props.initialData.firstName || '',
  lastName: props.initialData.lastName || '',
  nickname: props.initialData.nickname || '',
  birthDate: props.initialData.birthDate || '',
  gender: props.initialData.gender || '',
  country: props.initialData.country || '',
  state: props.initialData.state || '',
  city: props.initialData.city || '',
  email: props.initialData.email || '',
  phone: props.initialData.phone || '',
  profilePhoto: props.initialData.profilePhoto || '',
  howDidYouHearAboutUs: props.initialData.howDidYouHearAboutUs || ''
})

// Use the country/city select composable AFTER formData is initialized
const { countryOptions, stateOptions, cityOptions, onCountryChange, onStateChange, onCityChange } = useCountryCitySelect(
  computed(() => formData.country),
  computed(() => formData.state),
  computed(() => formData.city)
)

// Initialize image preview if there's initial data
if (props.initialData.profilePhoto) {
  selectedImage.value = props.initialData.profilePhoto
}



const howDidYouHearOptions = computed(() => [
  { value: 'redes-sociales', label: 'Redes sociales (Instagram, Facebook, TikTok)' },
  { value: 'google', label: 'Búsqueda en Google' },
  { value: 'recomendacion-amigo', label: 'Recomendación de un amigo/familiar' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'publicidad-online', label: 'Publicidad online' },
  { value: 'gimnasio', label: 'En mi gimnasio' },
  { value: 'entrenador-personal', label: 'Mi entrenador personal' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'blog-articulo', label: 'Blog o artículo' },
  { value: 'evento-fitness', label: 'Evento o conferencia de fitness' },
  { value: 'otro', label: 'Otro' }
])



// Check if there are any field errors
const hasFieldErrors = computed(() => {
  return Object.keys(fieldErrors).length > 0
})

// Get all field error messages
const allFieldErrorMessages = computed(() => {
  return Object.values(fieldErrors).filter(error => error.length > 0)
})





// Calcular edad basada en fecha de nacimiento
const calculateAge = (birthDate: string): number => {
  const [day, month, year] = birthDate.split('/')
  const birth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  const today = new Date()
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Manejar cambio de país
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      errorMessage.value = 'La imagen debe ser menor a 5MB'
      return
    }
    
    try {
      // Convert image to WebP format
      const { convertImageToWebP, createWebPFile } = await import('~/utils/image-converter')
      const { blob, dataUrl } = await convertImageToWebP(file, 0.8, 800, 800) // Profile photos don't need to be huge
      
      // Create WebP file for uploading
      const webpFile = createWebPFile(blob, file.name)
      profileImageFile.value = webpFile
      
      // Show preview
      selectedImage.value = dataUrl
      
      // Clear the profilePhoto field - it will be set after upload
      formData.profilePhoto = ''
      
      console.log(`📸 Imagen convertida a WebP: ${file.name} → ${webpFile.name} (${(blob.size / 1024).toFixed(1)}KB)`)
    } catch (error) {
      console.error('Error converting image:', error)
      errorMessage.value = 'Error al procesar la imagen. Intenta con otra imagen.'
    }
  }
}

const removeImage = () => {
  selectedImage.value = ''
  profileImageFile.value = null
  formData.profilePhoto = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const validateBirthDate = (birthDate: string): boolean => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/
  if (!regex.test(birthDate)) {
    return false
  }
  
  const [day, month, year] = birthDate.split('/').map(Number)
  const date = new Date(year, month - 1, day)
  
  // Verificar que la fecha sea válida
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return false
  }
  
  // Verificar que la fecha no sea en el futuro
  const today = new Date()
  return date <= today
}

const validateForm = (): boolean => {
  errorMessage.value = ''
  clearFieldErrors()
  let valid = true

  if (!formData.firstName.trim()) {
    setFieldError('firstName', 'El nombre es obligatorio')
    valid = false
  }
  if (!formData.lastName.trim()) {
    setFieldError('lastName', 'El apellido es obligatorio')
    valid = false
  }
  if (!formData.birthDate || !validateBirthDate(formData.birthDate)) {
    setFieldError('birthDate', 'La fecha de cumpleaños debe tener formato dd/MM/yyyy y ser una fecha válida (no puede ser en el futuro)')
    valid = false
  }
  if (!formData.gender) {
    setFieldError('gender', 'El género es obligatorio')
    valid = false
  }
  if (!formData.country) {
    setFieldError('country', 'El país es obligatorio')
    valid = false
  }
  if (!formData.state) {
    setFieldError('state', 'El estado es obligatorio')
    valid = false
  }
  if (!formData.city) {
    setFieldError('city', 'La ciudad es obligatoria')
    valid = false
  }
  if (!formData.howDidYouHearAboutUs) {
    setFieldError('howDidYouHearAboutUs', 'Por favor selecciona cómo supiste de THEREPZONE')
    valid = false
  }
  if (props.showEmailField && (!formData.email || !formData.email.includes('@'))) {
    setFieldError('email', 'El correo electrónico es obligatorio y debe ser válido')
    valid = false
  }
  return valid
}

const handleSubmit = async () => {
  console.log('🔎 Intentando enviar formulario', JSON.stringify(formData))
  clearFieldErrors()
  const valid = validateForm()
  if (!valid) {
    console.log('❌ Errores de validación:', JSON.stringify(fieldErrors))
    // Scroll automático al bloque de errores
    await nextTick()
    if (errorBlock.value) {
      errorBlock.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }
  errorMessage.value = ''
  try {
    const userData = {
      ...formData,
      fullName: `${formData.firstName} ${formData.lastName}`,
      age: calculateAge(formData.birthDate),
      startDate: new Date().toISOString(),
      profileImageFile: profileImageFile.value || undefined
    }
    console.log('✅ Enviando datos:', JSON.stringify(userData))
    emit('submit', userData)
  } catch (error) {
    errorMessage.value = 'Error al procesar la información. Inténtalo de nuevo.'
    console.error('❌ Error en handleSubmit:', error)
  }
}



// Clear field errors
const clearFieldErrors = () => {
  Object.keys(fieldErrors).forEach(key => {
    fieldErrors[key] = ''
  })
}

// Set field error
const setFieldError = (field: string, message: string) => {
  fieldErrors[field] = message
}

// Expose methods to parent component
defineExpose({
  setFieldError,
  clearFieldErrors,
  setLoading: (value: boolean) => { isLoading.value = value }
})

// Watchers: limpian el error si el campo es válido
watch(() => formData.firstName, (val) => {
  if (fieldErrors.firstName && val && val.trim().length > 0) fieldErrors.firstName = ''
})

watch(() => formData.lastName, (val) => {
  if (fieldErrors.lastName && val && val.trim().length > 0) fieldErrors.lastName = ''
})

watch(() => formData.birthDate, (val) => {
  if (fieldErrors.birthDate && val && validateBirthDate(val)) fieldErrors.birthDate = ''
})

watch(() => formData.gender, (val) => {
  if (fieldErrors.gender && val) fieldErrors.gender = ''
})

watch(() => formData.country, (val) => {
  if (fieldErrors.country && val) fieldErrors.country = ''
})

watch(() => formData.state, (val) => {
  if (fieldErrors.state && val) fieldErrors.state = ''
})

watch(() => formData.city, (val) => {
  if (fieldErrors.city && val) fieldErrors.city = ''
})

watch(() => formData.email, (val) => {
  if (fieldErrors.email && val && val.includes('@')) fieldErrors.email = ''
})

watch(() => formData.howDidYouHearAboutUs, (val) => {
  if (fieldErrors.howDidYouHearAboutUs && val) fieldErrors.howDidYouHearAboutUs = ''
})

// Note: No manual auth check here - the global middleware handles authentication
</script>

<style scoped>
/* Estilos para mantener el diseño personalizado cuando el navegador autocompleta el email */
.email-input:-webkit-autofill,
.email-input:-webkit-autofill:hover,
.email-input:-webkit-autofill:focus,
.email-input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px rgb(15 23 42) inset !important; /* bg-slate-900 */
  -webkit-text-fill-color: rgb(255 255 255) !important; /* text-white */
  border: 1px solid rgb(71 85 105) !important; /* border-slate-600 */
  border-radius: 0.5rem !important; /* rounded-lg */
  transition: background-color 5000s ease-in-out 0s;
}

.email-input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 30px rgb(15 23 42) inset, 0 0 0 2px rgb(234 88 12) !important; /* focus ring orange-600 */
  border-color: transparent !important;
}

/* Para otros navegadores */
.email-input:autofill {
  background-color: rgb(15 23 42) !important; /* bg-slate-900 */
  color: rgb(255 255 255) !important; /* text-white */
  border: 1px solid rgb(71 85 105) !important; /* border-slate-600 */
}
</style> 