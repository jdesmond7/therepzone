import { ref, computed } from 'vue'

interface LocationOption {
  value: string
  label: string
}

// Cache para almacenar datos de Google Maps
const countriesCache = ref<LocationOption[]>([])
const statesCache = ref<Record<string, LocationOption[]>>({})
const citiesCache = ref<Record<string, LocationOption[]>>({})

// Servicios de Google Maps
let autocompleteService: any = null
let placesService: any = null

// Inicializar servicios de Google Maps
const initializeGoogleMaps = () => {
  if (typeof window === 'undefined' || !window.google || !window.google.maps) {
    console.warn('Google Maps API no está disponible')
    return false
  }

  try {
    autocompleteService = new window.google.maps.places.AutocompleteService()
    placesService = new window.google.maps.places.PlacesService(document.createElement('div'))
    return true
  } catch (error) {
    console.error('Error inicializando Google Maps:', error)
    return false
  }
}

// Obtener países desde Google Maps
const getCountriesFromGoogleMaps = async (): Promise<LocationOption[]> => {
  if (countriesCache.value.length > 0) {
    return countriesCache.value
  }

  if (!initializeGoogleMaps()) {
    // Fallback a datos locales si Google Maps no está disponible
    return getLocalCountries()
  }

  try {
    // Usar un request genérico para obtener países
    const request = {
      input: 'country',
      types: ['country']
    }

    return new Promise((resolve) => {
      autocompleteService.getPlacePredictions(request, (predictions: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const countries = predictions.map(prediction => ({
            value: prediction.description,
            label: prediction.description
          }))
          countriesCache.value = countries
          resolve(countries)
        } else {
          // Fallback a datos locales
          const localCountries = getLocalCountries()
          countriesCache.value = localCountries
          resolve(localCountries)
        }
      })
    })
  } catch (error) {
    console.error('Error obteniendo países de Google Maps:', error)
    const localCountries = getLocalCountries()
    countriesCache.value = localCountries
    return localCountries
  }
}

// Obtener estados desde Google Maps
const getStatesFromGoogleMaps = async (country: string): Promise<LocationOption[]> => {
  const cacheKey = country.toLowerCase()
  
  if (statesCache.value[cacheKey]) {
    return statesCache.value[cacheKey]
  }

  if (!initializeGoogleMaps()) {
    return getLocalStates(country)
  }

  try {
    const request = {
      input: `${country} state`,
      componentRestrictions: { country: getCountryCode(country) },
      types: ['administrative_area_level_1']
    }

    return new Promise((resolve) => {
      autocompleteService.getPlacePredictions(request, (predictions: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const states = predictions.map(prediction => ({
            value: prediction.description,
            label: prediction.description
          }))
          statesCache.value[cacheKey] = states
          resolve(states)
        } else {
          // Fallback a datos locales
          const localStates = getLocalStates(country)
          statesCache.value[cacheKey] = localStates
          resolve(localStates)
        }
      })
    })
  } catch (error) {
    console.error('Error obteniendo estados de Google Maps:', error)
    const localStates = getLocalStates(country)
    statesCache.value[cacheKey] = localStates
    return localStates
  }
}

// Obtener ciudades desde Google Maps
const getCitiesFromGoogleMaps = async (state: string, country: string): Promise<LocationOption[]> => {
  const cacheKey = `${state.toLowerCase()}-${country.toLowerCase()}`
  
  if (citiesCache.value[cacheKey]) {
    return citiesCache.value[cacheKey]
  }

  if (!initializeGoogleMaps()) {
    return getLocalCities(state)
  }

  try {
    const request = {
      input: `${state}, ${country} city`,
      componentRestrictions: { country: getCountryCode(country) },
      types: ['locality']
    }

    return new Promise((resolve) => {
      autocompleteService.getPlacePredictions(request, (predictions: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const cities = predictions.map(prediction => ({
            value: prediction.description,
            label: prediction.description
          }))
          citiesCache.value[cacheKey] = cities
          resolve(cities)
        } else {
          // Fallback a datos locales
          const localCities = getLocalCities(state)
          citiesCache.value[cacheKey] = localCities
          resolve(localCities)
        }
      })
    })
  } catch (error) {
    console.error('Error obteniendo ciudades de Google Maps:', error)
    const localCities = getLocalCities(state)
    citiesCache.value[cacheKey] = localCities
    return localCities
  }
}

// Datos locales como fallback
const getLocalCountries = (): LocationOption[] => {
  return [
    'México', 'Estados Unidos', 'Colombia', 'Argentina', 'Chile', 'Perú', 'Ecuador', 
    'Venezuela', 'España', 'Costa Rica', 'Panamá', 'Guatemala', 'El Salvador', 
    'Honduras', 'Nicaragua', 'República Dominicana', 'Puerto Rico', 'Uruguay', 
    'Paraguay', 'Bolivia'
  ].map(country => ({ value: country, label: country }))
}

const getLocalStates = (country: string): LocationOption[] => {
  const statesByCountry: Record<string, string[]> = {
    'México': [
      'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 
      'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 
      'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 
      'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 
      'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
    ],
    'Estados Unidos': [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Carolina del Norte', 'Carolina del Sur', 
      'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 
      'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Luisiana', 'Maine', 'Maryland', 'Massachusetts', 
      'Michigan', 'Minnesota', 'Misisipi', 'Misuri', 'Montana', 'Nebraska', 'Nevada', 'Nueva Jersey', 
      'Nueva York', 'Nuevo Hampshire', 'Nuevo México', 'Ohio', 'Oklahoma', 'Oregón', 'Pensilvania', 
      'Rhode Island', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Virginia Occidental', 
      'Washington', 'Wisconsin', 'Wyoming'
    ]
  }
  
  return (statesByCountry[country] || []).map(state => ({ value: state, label: state }))
}

const getLocalCities = (state: string): LocationOption[] => {
  // Datos básicos de ciudades por estado
  const citiesByState: Record<string, string[]> = {
    'Nuevo León': ['Monterrey', 'San Nicolás de los Garza', 'Guadalupe', 'Santa Catarina', 'Apodaca', 'General Escobedo'],
    'Jalisco': ['Guadalajara', 'Zapopan', 'San Pedro Tlaquepaque', 'Tonalá', 'Tlajomulco de Zúñiga'],
    'Baja California': ['Tijuana', 'Mexicali', 'Ensenada', 'Tecate', 'Playas de Rosarito'],
    'California': ['Los Ángeles', 'San Diego', 'San José', 'San Francisco', 'Fresno', 'Sacramento'],
    'Texas': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso']
  }
  
  return (citiesByState[state] || []).map(city => ({ value: city, label: city }))
}

// Mapeo de países a códigos ISO
const getCountryCode = (country: string): string => {
  const countryMap: Record<string, string> = {
    'México': 'MX',
    'Estados Unidos': 'US',
    'Colombia': 'CO',
    'Argentina': 'AR',
    'Chile': 'CL',
    'Perú': 'PE',
    'Ecuador': 'EC',
    'Venezuela': 'VE',
    'España': 'ES',
    'Costa Rica': 'CR',
    'Panamá': 'PA',
    'Guatemala': 'GT',
    'El Salvador': 'SV',
    'Honduras': 'HN',
    'Nicaragua': 'NI',
    'República Dominicana': 'DO',
    'Puerto Rico': 'PR',
    'Uruguay': 'UY',
    'Paraguay': 'PY',
    'Bolivia': 'BO'
  }
  
  return countryMap[country] || 'MX'
}

export function useGoogleMapsLocation() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getCountries = async (): Promise<LocationOption[]> => {
    isLoading.value = true
    error.value = null
    
    try {
      const countries = await getCountriesFromGoogleMaps()
      return countries
    } catch (err) {
      error.value = 'Error cargando países'
      console.error(err)
      return getLocalCountries()
    } finally {
      isLoading.value = false
    }
  }

  const getStates = async (country: string): Promise<LocationOption[]> => {
    isLoading.value = true
    error.value = null
    
    try {
      const states = await getStatesFromGoogleMaps(country)
      return states
    } catch (err) {
      error.value = 'Error cargando estados'
      console.error(err)
      return getLocalStates(country)
    } finally {
      isLoading.value = false
    }
  }

  const getCities = async (state: string, country: string): Promise<LocationOption[]> => {
    isLoading.value = true
    error.value = null
    
    try {
      const cities = await getCitiesFromGoogleMaps(state, country)
      return cities
    } catch (err) {
      error.value = 'Error cargando ciudades'
      console.error(err)
      return getLocalCities(state)
    } finally {
      isLoading.value = false
    }
  }

  return {
    getCountries,
    getStates,
    getCities,
    isLoading,
    error
  }
} 