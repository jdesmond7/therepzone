<template>
  <div class="relative">
    <AppInput 
      ref="addressInput"
      v-model="searchQuery"
      :placeholder="placeholder"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    
    <!-- Autocomplete dropdown -->
    <div 
      v-if="showSuggestions && suggestions.length > 0"
      class="absolute z-50 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <div 
        v-for="(suggestion, index) in suggestions" 
        :key="index"
        @click="selectSuggestion(suggestion)"
        class="px-4 py-3 hover:bg-slate-600 cursor-pointer border-b border-slate-600 last:border-b-0"
      >
        <div class="text-white font-medium">{{ suggestion.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface AddressSuggestion {
  place_id: string
  description: string
}

interface Props {
  modelValue?: string
  placeholder?: string
  country?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'addressSelected', address: {
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    country: string
    postalCode: string
  }): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Buscar dirección...',
  country: 'MX'
})

const emit = defineEmits<Emits>()

const addressInput = ref<HTMLInputElement>()
const searchQuery = ref(props.modelValue || '')
const suggestions = ref<AddressSuggestion[]>([])
const showSuggestions = ref(false)
const autocompleteService = ref<any>(null)
const placesService = ref<any>(null)

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== searchQuery.value) {
    searchQuery.value = newValue || ''
  }
})

// Watch for search query changes
watch(searchQuery, (newValue) => {
  emit('update:modelValue', newValue)
})

onMounted(() => {
  // Load Google Maps API if not already loaded
  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    initializeAutocomplete()
  } else {
    loadGoogleMapsAPI()
  }
})

onUnmounted(() => {
  // Clean up
  if (autocompleteService.value) {
    autocompleteService.value = null
  }
  if (placesService.value) {
    placesService.value = null
  }
})

const loadGoogleMapsAPI = () => {
  if (typeof window === 'undefined') return

  const config = useRuntimeConfig()
  const apiKey = config.public.googleMapsApiKey
  
  if (!apiKey) {
    console.error('Google Maps API key not found')
    return
  }

  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
  script.async = true
  script.defer = true
  
  // Define the callback function
  window.initGoogleMaps = () => {
    initializeAutocomplete()
  }
  
  document.head.appendChild(script)
}

const initializeAutocomplete = () => {
  if (typeof window === 'undefined' || !window.google || !window.google.maps) return

  try {
    autocompleteService.value = new window.google.maps.places.AutocompleteService()
    placesService.value = new window.google.maps.places.PlacesService(document.createElement('div'))
    console.log('✅ Google Maps Autocomplete inicializado correctamente')
  } catch (error) {
    console.error('❌ Error inicializando Google Maps:', error)
  }
}

const handleInput = () => {
  if (!autocompleteService.value || searchQuery.value.length < 3) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  const request = {
    input: searchQuery.value,
    componentRestrictions: { country: props.country },
    types: ['address']
  }

  autocompleteService.value.getPlacePredictions(request, (predictions: any[], status: any) => {
    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
      suggestions.value = predictions
      showSuggestions.value = true
    } else {
      suggestions.value = []
      showSuggestions.value = false
    }
  })
}

const handleFocus = () => {
  if (suggestions.value.length > 0) {
    showSuggestions.value = true
  }
}

const handleBlur = () => {
  // Delay hiding suggestions to allow for clicks
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const selectSuggestion = (suggestion: AddressSuggestion) => {
  searchQuery.value = suggestion.description
  showSuggestions.value = false

  // Get detailed place information
  if (placesService.value) {
    const request = {
      placeId: suggestion.place_id,
      fields: ['address_components', 'formatted_address']
    }

    placesService.value.getDetails(request, (place: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        const addressData = parseAddressComponents(place.address_components)
        emit('addressSelected', addressData)
      }
    })
  }
}

const parseAddressComponents = (components: any[]) => {
  const addressData = {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  }

  let streetNumber = ''
  let route = ''
  let sublocality = ''
  let neighborhood = ''
  let premise = ''

  components.forEach(component => {
    const types = component.types
    const value = component.long_name

    if (types.includes('street_number')) {
      streetNumber = value
    } else if (types.includes('route')) {
      route = value
    } else if (types.includes('sublocality_level_1')) {
      sublocality = value
    } else if (types.includes('neighborhood')) {
      neighborhood = value
    } else if (types.includes('premise')) {
      premise = value
    } else if (types.includes('locality')) {
      addressData.city = value
    } else if (types.includes('administrative_area_level_1')) {
      addressData.state = value
    } else if (types.includes('country')) {
      addressData.country = value
    } else if (types.includes('postal_code')) {
      addressData.postalCode = value
    }
  })

  // Construir addressLine1: Calle, número y colonia
  const addressLine1Parts = []
  if (route && streetNumber) {
    addressLine1Parts.push(`${route} ${streetNumber}`)
  } else if (route) {
    addressLine1Parts.push(route)
  } else if (streetNumber) {
    addressLine1Parts.push(streetNumber)
  }
  
  // Agregar colonia a línea 1 si existe
  if (sublocality) {
    addressLine1Parts.push(sublocality)
  } else if (neighborhood) {
    addressLine1Parts.push(neighborhood)
  }
  
  if (addressLine1Parts.length > 0) {
    addressData.addressLine1 = addressLine1Parts.join(', ')
  }

  // Construir addressLine2: Información adicional
  const addressLine2Parts = []
  if (premise) addressLine2Parts.push(premise)
  
  if (addressLine2Parts.length > 0) {
    addressData.addressLine2 = addressLine2Parts.join(', ')
  }

  return addressData
}
</script> 