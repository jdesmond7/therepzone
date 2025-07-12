import { ref, computed } from 'vue'

const countries = [
  'México', 'Estados Unidos', 'Colombia', 'Argentina', 'Chile', 'Perú', 'Ecuador', 'Venezuela', 'España', 'Costa Rica', 'Panamá', 'Guatemala', 'El Salvador', 'Honduras', 'Nicaragua', 'República Dominicana', 'Puerto Rico', 'Uruguay', 'Paraguay', 'Bolivia'
]

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
}

export function useCountryCitySelect(selectedCountry: any, selectedCity: any) {
  const countryOptions = computed(() => countries.map(country => ({ value: country, label: country })))
  const cityOptions = computed(() => {
    return citiesByCountry[selectedCountry.value] ? citiesByCountry[selectedCountry.value].map(city => ({ value: city, label: city })) : []
  })
  function onCountryChange(newCountry: string) {
    selectedCountry.value = newCountry
    selectedCity.value = ''
  }
  return { countryOptions, cityOptions, onCountryChange }
} 