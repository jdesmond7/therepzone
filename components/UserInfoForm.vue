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
        <label for="firstName" class="block text-sm font-bold text-white mb-2">
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
        <label for="lastName" class="block text-sm font-bold text-white mb-2">
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
        <label for="nickname" class="block text-sm font-bold text-white mb-2">
          Apodo
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
      <div class="relative">
        <label for="birthDate" class="block text-sm font-bold text-white mb-2">
          Fecha de cumpleaños *
        </label>
        <div class="relative">
          <input
            id="birthDate"
            v-model="formData.birthDate"
            type="text"
            placeholder="dd/mm/yyyy"
            autocomplete="off"
            @input="formatBirthDate"
            @keydown="handleKeyDown"
            @focus="showDatePicker = true"
            @blur="handleDateInputBlur"
            :class="[
              'w-full pl-4 pr-12 py-3 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent',
              fieldErrors.birthDate 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-slate-600 focus:ring-orange-600'
            ]"
            maxlength="10"
            required
          />
          <button
            type="button"
            @click="toggleDatePicker"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors"
          >
            <UIcon name="i-heroicons-calendar-days" class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Date Picker -->
        <div 
          v-if="showDatePicker"
          ref="datePickerRef"
          class="absolute z-50 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-4 w-[420px]"
        >
          <!-- Calendar Header -->
          <div class="flex items-center justify-between mb-4">
            <button
              type="button"
              @click="changeMonth(-1)"
              class="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <UIcon name="i-heroicons-chevron-left" class="w-5 h-5 text-white" />
            </button>
            
            <div class="flex gap-2 justify-center">
              <div class="w-[160px]">
                <CustomSelect
                  v-model="selectedMonth"
                  :options="monthOptions"
                  placeholder="Mes"
                  @update:model-value="handleMonthChange"
                />
              </div>
              
              <div class="w-[120px]">
                <CustomSelect
                  v-model="selectedYear"
                  :options="yearOptions"
                  placeholder="Año"
                  @update:model-value="handleYearChange"
                />
              </div>
            </div>
            
            <button
              type="button"
              @click="changeMonth(1)"
              class="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-white" />
            </button>
          </div>
          
          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div 
              v-for="day in weekDaysShort" 
              :key="day"
              class="text-xs font-medium text-slate-400 text-center py-2"
            >
              {{ day }}
            </div>
          </div>
          
          <div class="grid grid-cols-7 gap-1">
              <button
                v-for="date in calendarDates"
                :key="`${date.month}-${date.day}`"
                type="button"
                @click="selectDate(date)"
                :class="[
                  'w-8 h-8 text-sm rounded-lg transition-colors',
                  date.isCurrentMonth 
                    ? 'text-white hover:bg-slate-700' 
                    : 'text-slate-400 hover:bg-slate-700',
                  date.isSelected 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : '',
                  date.isToday && !date.isSelected 
                    ? 'bg-slate-700 text-orange-400 font-bold' 
                    : ''
                ]"
              >
                {{ date.day }}
              </button>
          </div>
        </div>
      </div>

      <!-- Género * -->
      <div>
        <label class="block text-sm font-bold text-white mb-2">
          Género *
        </label>
        <div class="grid grid-cols-3 gap-3">
          <button
            type="button"
            @click="formData.gender = 'masculino'"
            :class="[
              'py-3 px-4 rounded-lg font-medium transition-colors',
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
              'py-3 px-4 rounded-lg font-medium transition-colors',
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
              'py-3 px-4 rounded-lg font-medium transition-colors',
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
        <label class="block text-sm font-bold text-white mb-2">
          País *
        </label>
        <CustomSelect
          v-model="formData.country"
          :options="countryOptions"
          placeholder="Selecciona tu país"
          :error="!!fieldErrors.country"
          @update:model-value="handleCountryChange"
        />
        <p v-if="fieldErrors.country" class="text-red-400 text-xs mt-1">{{ fieldErrors.country }}</p>
      </div>

      <!-- Ciudad -->
      <div>
        <label class="block text-sm font-bold text-white mb-2">
          Ciudad *
        </label>
        <CustomSelect
          v-model="formData.city"
          :options="cityOptions"
          :placeholder="!formData.country ? 'Primero selecciona un país' : 'Selecciona tu ciudad'"
          :disabled="!formData.country"
          :error="!!fieldErrors.city"
        />
        <p v-if="fieldErrors.city" class="text-red-400 text-xs mt-1">{{ fieldErrors.city }}</p>
      </div>

      <!-- Correo electrónico (si no está en modo usuario existente) -->
      <div v-if="showEmailField">
        <label for="email" class="block text-sm font-bold text-white mb-2">
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
        <label for="phone" class="block text-sm font-bold text-white mb-2">
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
        <label class="block text-sm font-bold text-white mb-2">
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
        <label class="block text-sm font-bold text-white mb-2">
          Foto de perfil
        </label>
        <div class="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-orange-600 transition-colors">
          <div v-if="!selectedImage">
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
            <button
              type="button"
              @click="fileInput?.click()"
              class="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Seleccionar imagen
            </button>
          </div>
          <div v-else class="relative">
            <img :src="selectedImage" alt="Preview" class="w-24 h-24 rounded-full mx-auto object-cover mb-3">
            <button
              type="button"
              @click="removeImage"
              class="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
            >
              Cambiar imagen
            </button>
          </div>
        </div>
        <p v-if="fieldErrors.profilePhoto" class="text-red-400 text-xs mt-1">{{ fieldErrors.profilePhoto }}</p>
      </div>

      <!-- Field Error Messages -->
      <div v-if="hasFieldErrors" class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
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
          class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
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
interface UserFormData {
  firstName: string
  lastName: string
  nickname: string
  birthDate: string
  gender: 'masculino' | 'femenino' | 'otro' | ''
  country: string
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

// Países disponibles
const countries = [
  'México',
  'Estados Unidos',
  'Colombia',
  'Argentina',
  'Chile',
  'Perú',
  'Ecuador',
  'Venezuela',
  'España',
  'Costa Rica',
  'Panamá',
  'Guatemala',
  'El Salvador',
  'Honduras',
  'Nicaragua',
  'República Dominicana',
  'Puerto Rico',
  'Uruguay',
  'Paraguay',
  'Bolivia'
]

// Ciudades por país
const citiesByCountry: Record<string, string[]> = {
  'México': [
    'Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Torreón',
    'Querétaro', 'San Luis Potosí', 'Mérida', 'Mexicali', 'Aguascalientes', 'Cuernavaca', 'Saltillo',
    'Hermosillo', 'Culiacán', 'Morelia', 'Toluca', 'Chihuahua', 'Tampico', 'Cancún', 'Veracruz'
  ],
  'Estados Unidos': [
    'Nueva York', 'Los Ángeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
    'San Diego', 'Dallas', 'San José', 'Austin', 'Jacksonville', 'San Francisco', 'Columbus',
    'Fort Worth', 'Indianapolis', 'Charlotte', 'Seattle', 'Denver', 'Boston', 'El Paso', 'Nashville',
    'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee'
  ],
  'Colombia': [
    'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Soledad', 'Ibagué',
    'Bucaramanga', 'Soacha', 'Santa Marta', 'Villavicencio', 'Valledupar', 'Pereira', 'Manizales',
    'Montería', 'Neiva', 'Pasto', 'Armenia', 'Sincelejo', 'Popayán', 'Buenaventura'
  ],
  'Argentina': [
    'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'Tucumán', 'La Plata', 'Mar del Plata',
    'Salta', 'Santa Fe', 'San Juan', 'Resistencia', 'Neuquén', 'Santiago del Estero', 'Corrientes',
    'Posadas', 'Bahía Blanca', 'Paraná', 'Formosa', 'San Luis', 'La Rioja'
  ],
  'Chile': [
    'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco', 'Rancagua',
    'Talca', 'Arica', 'Chillán', 'Iquique', 'Los Ángeles', 'Puerto Montt', 'Calama', 'Copiapó',
    'Osorno', 'Quillota', 'Valdivia', 'Punta Arenas'
  ],
  'Perú': [
    'Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Cusco', 'Chimbote', 'Huancayo',
    'Tacna', 'Juliaca', 'Ica', 'Sullana', 'Ayacucho', 'Chincha Alta', 'Huánuco', 'Pucallpa',
    'Tarapoto', 'Puno', 'Tumbes', 'Talara', 'Jaén', 'Huaraz'
  ],
  'Ecuador': [
    'Guayaquil', 'Quito', 'Cuenca', 'Santo Domingo', 'Machala', 'Durán', 'Manta', 'Portoviejo',
    'Ambato', 'Riobamba', 'Loja', 'Esmeraldas', 'Quevedo', 'Milagro', 'Ibarra', 'La Libertad'
  ],
  'Venezuela': [
    'Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana', 'San Cristóbal',
    'Maturín', 'Ciudad Bolívar', 'Cumará', 'Punto Fijo', 'Coro', 'Guarenas', 'Los Teques',
    'Barcelona', 'Mérida', 'Petare', 'Turmero', 'Cabimas'
  ],
  'España': [
    'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma',
    'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'L\'Hospitalet',
    'Vitoria', 'A Coruña', 'Elche', 'Granada', 'Oviedo', 'Badalona', 'Cartagena', 'Terrassa'
  ],
  'Costa Rica': [
    'San José', 'Cartago', 'Puntarenas', 'Heredia', 'Alajuela', 'Limón', 'San Carlos', 'Pérez Zeledón',
    'Desamparados', 'Escazú', 'Curridabat', 'Guadalupe', 'Goicoechea'
  ],
  'Panamá': [
    'Ciudad de Panamá', 'San Miguelito', 'Tocumen', 'David', 'Arraijan', 'Colón', 'La Chorrera',
    'Pacora', 'Chitré', 'Santiago', 'Penonomé', 'Las Cumbres'
  ]
  // Se pueden agregar más países según sea necesario
}

// Reactive state
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const selectedImage = ref('')
const profileImageFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement>()

// Field-specific errors
const fieldErrors = reactive<Record<string, string>>({})

// Date picker state
const showDatePicker = ref(false)
const selectedMonth = ref(new Date().getMonth().toString())
const selectedYear = ref(new Date().getFullYear().toString())
const datePickerRef = ref<HTMLElement>()

// Date picker constants
const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const weekDaysShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const formData = reactive<UserFormData>({
  firstName: props.initialData.firstName || '',
  lastName: props.initialData.lastName || '',
  nickname: props.initialData.nickname || '',
  birthDate: props.initialData.birthDate || '',
  gender: props.initialData.gender || '',
  country: props.initialData.country || '',
  city: props.initialData.city || '',
  email: props.initialData.email || '',
  phone: props.initialData.phone || '',
  profilePhoto: props.initialData.profilePhoto || '',
  howDidYouHearAboutUs: props.initialData.howDidYouHearAboutUs || ''
})

// Initialize image preview if there's initial data
if (props.initialData.profilePhoto) {
  selectedImage.value = props.initialData.profilePhoto
}

// Computed para ciudades disponibles
const availableCities = computed(() => {
  return citiesByCountry[formData.country] || []
})

// Computed para opciones de los selects personalizados
const countryOptions = computed(() => {
  return countries.map(country => ({
    value: country,
    label: country
  }))
})

const cityOptions = computed(() => {
  return availableCities.value.map(city => ({
    value: city,
    label: city
  }))
})

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

// Date picker computed properties
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear - 100; year <= currentYear; year++) {
    years.push(year)
  }
  return years.reverse()
})

const monthOptions = computed(() => {
  return monthNames.map((month, index) => ({
    value: index.toString(),
    label: month
  }))
})

const yearOptions = computed(() => {
  return availableYears.value.map(year => ({
    value: year.toString(),
    label: year.toString()
  }))
})

// Check if there are any field errors
const hasFieldErrors = computed(() => {
  return Object.keys(fieldErrors).length > 0
})

// Get all field error messages
const allFieldErrorMessages = computed(() => {
  return Object.values(fieldErrors).filter(error => error.length > 0)
})

const calendarDates = computed(() => {
  const year = parseInt(selectedYear.value)
  const month = parseInt(selectedMonth.value)
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - firstDay.getDay())
  
  const dates = []
  const today = new Date()
  const selectedDate = parseDateFromInput(formData.birthDate)
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.toDateString() === today.toDateString()
    const isSelected = selectedDate && 
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    
    dates.push({
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isCurrentMonth,
      isToday,
      isSelected,
      fullDate: date
    })
  }
  
  return dates
})

// Manejar teclas especiales para borrado fluido
const handleKeyDown = (event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement
  const key = event.key
  
  // Permitir teclas de navegación y control
  if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
    // Para Backspace, si estamos en una posición de "/" permitir borrar el carácter anterior
    if (key === 'Backspace') {
      const cursorPosition = target.selectionStart || 0
      const value = target.value
      
      // Si el cursor está después de un "/" borrar tanto el "/" como el número anterior
      if ((cursorPosition === 3 || cursorPosition === 6) && value[cursorPosition - 1] === '/') {
        event.preventDefault()
        const newValue = value.substring(0, cursorPosition - 2) + value.substring(cursorPosition)
        formData.birthDate = newValue
        target.value = newValue
        
        // Posicionar cursor correctamente
        nextTick(() => {
          target.setSelectionRange(cursorPosition - 2, cursorPosition - 2)
        })
        return
      }
    }
    return
  }
  
  // Solo permitir números
  if (!/\d/.test(key)) {
    event.preventDefault()
  }
}

// Formatear fecha de nacimiento mientras se escribe
const formatBirthDate = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '') // Solo números
  
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2)
  }
  if (value.length >= 5) {
    value = value.substring(0, 5) + '/' + value.substring(5, 9)
  }
  
  formData.birthDate = value
  target.value = value
  
  // Sync with date picker
  syncDatePickerWithInput()
}

// Date picker utility functions
const parseDateFromInput = (dateString: string): Date | null => {
  if (!dateString || dateString.length !== 10) return null
  
  const [day, month, year] = dateString.split('/').map(Number)
  if (!day || !month || !year) return null
  
  const date = new Date(year, month - 1, day)
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return null
  }
  
  return date
}

const formatDateForDisplay = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const syncDatePickerWithInput = () => {
  const date = parseDateFromInput(formData.birthDate)
  if (date) {
    selectedMonth.value = date.getMonth().toString()
    selectedYear.value = date.getFullYear().toString()
  }
}

// Date picker event handlers
const toggleDatePicker = () => {
  showDatePicker.value = !showDatePicker.value
  if (showDatePicker.value) {
    syncDatePickerWithInput()
  }
}

const closeDatePicker = () => {
  showDatePicker.value = false
}

const handleDateInputBlur = (event: Event) => {
  // No cerramos automáticamente en blur para permitir interacción con el datepicker
}

const changeMonth = (direction: number) => {
  const currentMonth = parseInt(selectedMonth.value)
  const currentYear = parseInt(selectedYear.value)
  const newMonth = currentMonth + direction
  
  if (newMonth < 0) {
    selectedMonth.value = '11'
    selectedYear.value = (currentYear - 1).toString()
  } else if (newMonth > 11) {
    selectedMonth.value = '0'
    selectedYear.value = (currentYear + 1).toString()
  } else {
    selectedMonth.value = newMonth.toString()
  }
}

const updateCalendar = () => {
  // Esta función se llama cuando se cambian los selects de mes/año
  // No necesita hacer nada especial ya que las computed properties se actualizan automáticamente
}

// CustomSelect handlers for date picker
const handleMonthChange = (newMonth: string) => {
  selectedMonth.value = newMonth
}

const handleYearChange = (newYear: string) => {
  selectedYear.value = newYear
}

const selectDate = (dateInfo: any) => {
  const date = new Date(dateInfo.year, dateInfo.month, dateInfo.day)
  formData.birthDate = formatDateForDisplay(date)
  selectedMonth.value = dateInfo.month.toString()
  selectedYear.value = dateInfo.year.toString()
  showDatePicker.value = false
}

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
const handleCountryChange = (newCountry: string) => {
  formData.country = newCountry
  formData.city = '' // Resetear ciudad cuando cambie el país
}

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
  
  if (!formData.firstName.trim()) {
    setFieldError('firstName', 'El nombre es obligatorio')
    return false
  }
  
  if (!formData.lastName.trim()) {
    setFieldError('lastName', 'El apellido es obligatorio')
    return false
  }
  
  if (!formData.birthDate || !validateBirthDate(formData.birthDate)) {
    setFieldError('birthDate', 'La fecha de cumpleaños debe tener formato dd/MM/yyyy y ser una fecha válida (no puede ser en el futuro)')
    return false
  }
  
  if (!formData.gender) {
    setFieldError('gender', 'El género es obligatorio')
    return false
  }
  
  if (!formData.country) {
    setFieldError('country', 'El país es obligatorio')
    return false
  }
  
  if (!formData.city) {
    setFieldError('city', 'La ciudad es obligatoria')
    return false
  }
  
  if (!formData.howDidYouHearAboutUs) {
    setFieldError('howDidYouHearAboutUs', 'Por favor selecciona cómo supiste de THEREPZONE')
    return false
  }
  
  if (props.showEmailField && (!formData.email || !formData.email.includes('@'))) {
    setFieldError('email', 'El correo electrónico es obligatorio y debe ser válido')
    return false
  }
  
  return !hasFieldErrors.value
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // Add current date as start date and calculated fields
    const userData = {
      ...formData,
      fullName: `${formData.firstName} ${formData.lastName}`, // Para compatibilidad
      age: calculateAge(formData.birthDate), // Para compatibilidad
      startDate: new Date().toISOString(),
      profileImageFile: profileImageFile.value || undefined
    }
    
    emit('submit', userData)
  } catch (error) {
    errorMessage.value = 'Error al procesar la información. Inténtalo de nuevo.'
  } finally {
    isLoading.value = false
  }
}

// Handle clicks outside date picker
const handleClickOutside = (event: MouseEvent) => {
  if (showDatePicker.value && datePickerRef.value) {
    const target = event.target as HTMLElement
    const inputElement = document.getElementById('birthDate')
    
    // Check if click is outside both the input and the datepicker
    if (!datePickerRef.value.contains(target) && !inputElement?.contains(target)) {
      showDatePicker.value = false
    }
  }
}

// Setup event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

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

// Watch for form data changes to clear field errors

// Watch for form data changes to clear field errors
watch(() => formData.firstName, () => {
  if (fieldErrors.firstName) fieldErrors.firstName = ''
})

watch(() => formData.lastName, () => {
  if (fieldErrors.lastName) fieldErrors.lastName = ''
})

watch(() => formData.birthDate, () => {
  if (fieldErrors.birthDate) fieldErrors.birthDate = ''
})

watch(() => formData.gender, () => {
  if (fieldErrors.gender) fieldErrors.gender = ''
})

watch(() => formData.country, () => {
  if (fieldErrors.country) fieldErrors.country = ''
})

watch(() => formData.city, () => {
  if (fieldErrors.city) fieldErrors.city = ''
})

watch(() => formData.email, () => {
  if (fieldErrors.email) fieldErrors.email = ''
})

watch(() => formData.howDidYouHearAboutUs, () => {
  if (fieldErrors.howDidYouHearAboutUs) fieldErrors.howDidYouHearAboutUs = ''
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