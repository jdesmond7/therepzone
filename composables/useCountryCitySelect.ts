import { ref, computed, watch, onMounted } from 'vue'
import { useGoogleMapsLocation } from './useGoogleMapsLocation'

// Datos locales como fallback
const localCountries = [
  'México', 'Estados Unidos', 'Colombia', 'Argentina', 'Chile', 'Perú', 'Ecuador', 'Venezuela', 'España', 'Costa Rica', 'Panamá', 'Guatemala', 'El Salvador', 'Honduras', 'Nicaragua', 'República Dominicana', 'Puerto Rico', 'Uruguay', 'Paraguay', 'Bolivia'
]

// Mapeo de valores de Google Maps a valores locales
const googleMapsMapping: Record<string, { country: string, state: string, city: string }> = {
  // México - Nuevo León
  'Ciudad Apodaca': { country: 'México', state: 'Nuevo León', city: 'Apodaca' },
  'Ciudad de México': { country: 'México', state: 'Ciudad de México', city: 'Ciudad de México' },
  'Ciudad Obregón': { country: 'México', state: 'Sonora', city: 'Ciudad Obregón' },
  'Ciudad Valles': { country: 'México', state: 'San Luis Potosí', city: 'Ciudad Valles' },
  'Ciudad Fernández': { country: 'México', state: 'San Luis Potosí', city: 'Ciudad Fernández' },
  'Ciudad Santos': { country: 'México', state: 'San Luis Potosí', city: 'Ciudad Santos' },
  'Ciudad del Maíz': { country: 'México', state: 'San Luis Potosí', city: 'Ciudad del Maíz' },
  'Ciudad Juárez': { country: 'México', state: 'Chihuahua', city: 'Ciudad Juárez' },
  'Ciudad del Carmen': { country: 'México', state: 'Campeche', city: 'Ciudad del Carmen' },
  'Ciudad Madero': { country: 'México', state: 'Tamaulipas', city: 'Ciudad Madero' },
  'Ciudad Anáhuac': { country: 'México', state: 'Nuevo León', city: 'Ciudad Anáhuac' },
  
  // Estados
  'Nuevo Leon': { country: 'México', state: 'Nuevo León', city: '' },
  'Mexico City': { country: 'México', state: 'Ciudad de México', city: '' },
  'Mexico State': { country: 'México', state: 'Estado de México', city: '' },
  'San Luis Potosi': { country: 'México', state: 'San Luis Potosí', city: '' },
  'Queretaro': { country: 'México', state: 'Querétaro', city: '' },
  'Yucatan': { country: 'México', state: 'Yucatán', city: '' },
  
  // Países
  'Mexico': { country: 'México', state: '', city: '' },
  'United States': { country: 'Estados Unidos', state: '', city: '' },
  'Colombia': { country: 'Colombia', state: '', city: '' },
  'Argentina': { country: 'Argentina', state: '', city: '' },
  'Chile': { country: 'Chile', state: '', city: '' },
  'Peru': { country: 'Perú', state: '', city: '' },
  'Ecuador': { country: 'Ecuador', state: '', city: '' },
  'Venezuela': { country: 'Venezuela', state: '', city: '' },
  'Spain': { country: 'España', state: '', city: '' },
  'Costa Rica': { country: 'Costa Rica', state: '', city: '' },
  'Panama': { country: 'Panamá', state: '', city: '' },
  'Guatemala': { country: 'Guatemala', state: '', city: '' },
  'El Salvador': { country: 'El Salvador', state: '', city: '' },
  'Honduras': { country: 'Honduras', state: '', city: '' },
  'Nicaragua': { country: 'Nicaragua', state: '', city: '' },
  'Dominican Republic': { country: 'República Dominicana', state: '', city: '' },
  'Puerto Rico': { country: 'Puerto Rico', state: '', city: '' },
  'Uruguay': { country: 'Uruguay', state: '', city: '' },
  'Paraguay': { country: 'Paraguay', state: '', city: '' },
  'Bolivia': { country: 'Bolivia', state: '', city: '' }
}

// Estados por país
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
  ],
  'Colombia': [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 
    'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 
    'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 
    'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 
    'Valle del Cauca', 'Vaupés', 'Vichada'
  ],
  'Argentina': [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Ciudad Autónoma de Buenos Aires', 'Córdoba', 
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 
    'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 
    'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ],
  'Chile': [
    'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 
    'Región Metropolitana de Santiago', 'O\'Higgins', 'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 
    'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
  ]
}

// Ciudades por estado (expandido para todos los estados de México)
const citiesByState: Record<string, string[]> = {
  // México - Aguascalientes
  'Aguascalientes': [
    'Aguascalientes', 'Jesús María', 'San Francisco de los Romo', 'Calvillo', 'Rincón de Romos',
    'Pabellón de Arteaga', 'Asientos', 'Cosío', 'San José de Gracia', 'Tepezalá', 'El Llano'
  ],
  // México - Baja California
  'Baja California': [
    'Tijuana', 'Mexicali', 'Ensenada', 'Tecate', 'Playas de Rosarito', 'San Quintín', 'San Felipe',
    'Punta Colonet', 'La Rumorosa', 'El Hongo', 'Ojos Negros', 'Valle de Guadalupe'
  ],
  // México - Baja California Sur
  'Baja California Sur': [
    'La Paz', 'San José del Cabo', 'Cabo San Lucas', 'Loreto', 'Santa Rosalía', 'Mulegé',
    'Comondú', 'Todos Santos', 'San Ignacio', 'Villa Alberto Andrés Alvarado Arámburo'
  ],
  // México - Campeche
  'Campeche': [
    'San Francisco de Campeche', 'Ciudad del Carmen', 'Champotón', 'Escárcega', 'Calkiní',
    'Dzitbalché', 'Tenabo', 'Hopelchén', 'Palizada', 'Seybaplaya'
  ],
  // México - Chiapas
  'Chiapas': [
    'Tuxtla Gutiérrez', 'Tapachula', 'San Cristóbal de las Casas', 'Comitán de Domínguez',
    'Chiapa de Corzo', 'Villaflores', 'Tonalá', 'Villahermosa', 'Palenque', 'Ocosingo',
    'Cintalapa', 'San Juan Chamula', 'Bochil', 'Ocozocoautla de Espinosa'
  ],
  // México - Chihuahua
  'Chihuahua': [
    'Chihuahua', 'Ciudad Juárez', 'Delicias', 'Cuauhtémoc', 'Nuevo Casas Grandes', 'Hidalgo del Parral',
    'Meoqui', 'Camargo', 'Jiménez', 'Aldama', 'Aquiles Serdán', 'Bachíniva', 'Balleza', 'Batopilas'
  ],
  // México - Ciudad de México
  'Ciudad de México': [
    'Álvaro Obregón', 'Azcapotzalco', 'Benito Juárez', 'Coyoacán', 'Cuajimalpa de Morelos',
    'Cuauhtémoc', 'Gustavo A. Madero', 'Iztacalco', 'Iztapalapa', 'La Magdalena Contreras',
    'Miguel Hidalgo', 'Milpa Alta', 'Tláhuac', 'Tlalpan', 'Venustiano Carranza', 'Xochimilco'
  ],
  // México - Coahuila
  'Coahuila': [
    'Saltillo', 'Torreón', 'Monclova', 'Piedras Negras', 'Ramos Arizpe', 'Matamoros', 'San Pedro',
    'Frontera', 'Acuña', 'Múzquiz', 'San Buenaventura', 'Allende', 'Arteaga', 'Candela'
  ],
  // México - Colima
  'Colima': [
    'Colima', 'Manzanillo', 'Villa de Álvarez', 'Tecomán', 'Comala', 'Coquimatlán', 'Cuauhtémoc',
    'Ixtlahuacán', 'Minatitlán', 'Armería'
  ],
  // México - Durango
  'Durango': [
    'Victoria de Durango', 'Gómez Palacio', 'Lerdo', 'El Oro', 'Santiago Papasquiaro', 'Poanas',
    'Mapimí', 'Nombre de Dios', 'Pueblo Nuevo', 'San Dimas', 'San Juan del Río', 'Súchil'
  ],
  // México - Estado de México
  'Estado de México': [
    'Toluca', 'Ecatepec de Morelos', 'Nezahualcóyotl', 'Naucalpan de Juárez', 'Cuautitlán Izcalli',
    'Chimalhuacán', 'Ixtapaluca', 'Tlalnepantla de Baz', 'Atizapán de Zaragoza', 'Iztapaluca',
    'Cuautitlán', 'Tultitlán', 'Coacalco de Berriozábal', 'Chalco', 'Valle de Chalco Solidaridad'
  ],
  // México - Guanajuato
  'Guanajuato': [
    'León', 'Irapuato', 'Celaya', 'Salamanca', 'Guanajuato', 'Silao', 'San Miguel de Allende',
    'Dolores Hidalgo', 'Valle de Santiago', 'Pénjamo', 'San Luis de la Paz', 'Acámbaro',
    'Comonfort', 'Cortazar', 'Abasolo', 'San Felipe', 'Purísima del Rincón'
  ],
  // México - Guerrero
  'Guerrero': [
    'Acapulco de Juárez', 'Chilpancingo de los Bravo', 'Iguala de la Independencia', 'Tlapa de Comonfort',
    'Taxco de Alarcón', 'Ayutla de los Libres', 'Atoyac de Álvarez', 'Técpan de Galeana', 'Zihuatanejo',
    'Chilapa de Álvarez', 'Tlapa', 'Ayutla', 'Atoyac', 'Técpan', 'Zihuatanejo de Azueta'
  ],
  // México - Hidalgo
  'Hidalgo': [
    'Pachuca de Soto', 'Tizayuca', 'Tula de Allende', 'Ixmiquilpan', 'Mixquiahuala de Juárez',
    'Actopan', 'Zimapán', 'Tula', 'Ixmiquilpan', 'Mixquiahuala', 'Actopan', 'Zimapán'
  ],
  // México - Jalisco
  'Jalisco': [
    'Guadalajara', 'Zapopan', 'San Pedro Tlaquepaque', 'Tonalá', 'Tlajomulco de Zúñiga', 'Puerto Vallarta',
    'El Salto', 'Lagos de Moreno', 'Tepatitlán de Morelos', 'Autlán de Navarro', 'Zapotlán el Grande',
    'San Juan de los Lagos', 'Tala', 'La Barca', 'Arandas', 'Ameca', 'Lagos de Moreno'
  ],
  // México - Michoacán
  'Michoacán': [
    'Morelia', 'Uruapan', 'Zamora de Hidalgo', 'Lázaro Cárdenas', 'Zitácuaro', 'Hidalgo',
    'Apatzingán de la Constitución', 'La Piedad de Cabadas', 'Pátzcuaro', 'Sahuayo de Morelos',
    'Hidalgo', 'Apatzingán', 'La Piedad', 'Pátzcuaro', 'Sahuayo'
  ],
  // México - Morelos
  'Morelos': [
    'Cuernavaca', 'Ayala', 'Emiliano Zapata', 'Temixco', 'Jiutepec', 'Cuautla', 'Puente de Ixtla',
    'Xochitepec', 'Ayala', 'Emiliano Zapata', 'Temixco', 'Jiutepec', 'Cuautla Morelos', 'Puente de Ixtla',
    'Xochitepec'
  ],
  // México - Nayarit
  'Nayarit': [
    'Tepic', 'Bahía de Banderas', 'Santiago Ixcuintla', 'Tuxpan', 'Ixtlán del Río', 'Compostela',
    'Xalisco', 'San Blas', 'Ixtlán del Río', 'Compostela', 'Xalisco', 'San Blas'
  ],
  // México - Nuevo León
  'Nuevo León': [
    'Monterrey', 'San Nicolás de los Garza', 'Guadalupe', 'Santa Catarina', 'Apodaca', 'General Escobedo',
    'San Pedro Garza García', 'Linares', 'Montemorelos', 'Cadereyta Jiménez', 'Allende', 'El Carmen',
    'General Terán', 'Hualahuises', 'Iturbide', 'Lampazos de Naranjo', 'Los Herreras', 'Marín',
    'Melchor Ocampo', 'Mier y Noriega', 'Mina', 'Pesquería', 'Rayones', 'Sabinas Hidalgo',
    'Salinas Victoria', 'San Nicolás de los Garza', 'Villaldama', 'Ciudad Apodaca', 'San Pedro Garza García',
    'Santa Catarina', 'General Escobedo', 'San Nicolás de los Garza', 'Guadalupe', 'Juárez', 'García',
    'San Pedro Garza García', 'Santa Catarina', 'General Escobedo', 'San Nicolás de los Garza', 'Guadalupe',
    'Juárez', 'García', 'Linares', 'Montemorelos', 'Cadereyta Jiménez', 'Allende', 'El Carmen',
    'General Terán', 'Hualahuises', 'Iturbide', 'Lampazos de Naranjo', 'Los Herreras', 'Marín',
    'Melchor Ocampo', 'Mier y Noriega', 'Mina', 'Pesquería', 'Rayones', 'Sabinas Hidalgo',
    'Salinas Victoria', 'Villaldama', 'Aramberri', 'Bustamante', 'Cerralvo', 'Ciénega de Flores',
    'Ciudad Anáhuac', 'Doctor Arroyo', 'Doctor Coss', 'Doctor González', 'Galeana', 'García',
    'General Bravo', 'General Zaragoza', 'Hidalgo', 'Lampazos de Naranjo', 'Los Aldamas', 'Los Herreras',
    'Los Ramones', 'Marín', 'Melchor Ocampo', 'Mier y Noriega', 'Mina', 'Montemorelos', 'Parás',
    'Pesquería', 'Rayones', 'Sabinas Hidalgo', 'Salinas Victoria', 'San Nicolás de los Garza',
    'Santa Catarina', 'Santiago', 'Vallecillo', 'Villaldama'
  ],
  // México - Oaxaca
  'Oaxaca': [
    'Oaxaca de Juárez', 'Tuxtepec', 'Santa Cruz Xoxocotlán', 'Villa de Zaachila', 'Santa Lucía del Camino',
    'San Antonio de la Cal', 'San Jacinto Amilpas', 'San Raymundo Jalpan', 'Santa María Atzompa',
    'Santa María del Tule', 'Tlalixtac de Cabrera', 'Villa de Etla', 'Villa de Zaachila'
  ],
  // México - Puebla
  'Puebla': [
    'Puebla de Zaragoza', 'Amozoc de Mota', 'Atlixco', 'Cuautlancingo', 'Huauchinango', 'Izúcar de Matamoros',
    'San Martín Texmelucan', 'San Pedro Cholula', 'Tehuacán', 'Teziutlán', 'Amozoc', 'Atlixco',
    'Cuautlancingo', 'Huauchinango', 'Izúcar de Matamoros', 'San Martín Texmelucan', 'San Pedro Cholula',
    'Tehuacán', 'Teziutlán'
  ],
  // México - Querétaro
  'Querétaro': [
    'Querétaro', 'San Juan del Río', 'Corregidora', 'El Marqués', 'Colón', 'Amealco de Bonfil',
    'Arroyo Seco', 'Cadereyta de Montes', 'Jalpan de Serra', 'Landa de Matamoros', 'Pedro Escobedo',
    'Peñamiller', 'Pinal de Amoles', 'San Joaquín', 'Tequisquiapan', 'Tolimán'
  ],
  // México - Quintana Roo
  'Quintana Roo': [
    'Benito Juárez', 'Othón P. Blanco', 'Felipe Carrillo Puerto', 'Lázaro Cárdenas', 'Isla Mujeres',
    'José María Morelos', 'Tulum', 'Bacalar', 'Cozumel', 'Lázaro Cárdenas', 'Isla Mujeres',
    'José María Morelos', 'Tulum', 'Bacalar', 'Cozumel'
  ],
  // México - San Luis Potosí
  'San Luis Potosí': [
    'San Luis Potosí', 'Soledad de Graciano Sánchez', 'Ciudad Valles', 'Matehuala', 'Rioverde',
    'Ciudad Fernández', 'Xilitla', 'Ciudad Valles', 'Matehuala', 'Rioverde', 'Ciudad Fernández',
    'Xilitla'
  ],
  // México - Sinaloa
  'Sinaloa': [
    'Culiacán Rosales', 'Mazatlán', 'Los Mochis', 'Guasave', 'Navolato', 'El Rosario', 'El Fuerte',
    'El Rosario', 'El Fuerte', 'Guasave', 'Los Mochis', 'Mazatlán', 'Navolato'
  ],
  // México - Sonora
  'Sonora': [
    'Hermosillo', 'Ciudad Obregón', 'Nogales', 'San Luis Río Colorado', 'Huatabampo', 'Puerto Peñasco',
    'Cananea', 'Navojoa', 'Huatabampo', 'Puerto Peñasco', 'Cananea', 'Navojoa'
  ],
  // México - Tabasco
  'Tabasco': [
    'Centro', 'Cárdenas', 'Comalcalco', 'Cunduacán', 'Emiliano Zapata', 'Huimanguillo', 'Jalpa de Méndez',
    'Jalpa de Méndez', 'Cárdenas', 'Comalcalco', 'Cunduacán', 'Emiliano Zapata', 'Huimanguillo'
  ],
  // México - Tamaulipas
  'Tamaulipas': [
    'Reynosa', 'Matamoros', 'Nuevo Laredo', 'Victoria', 'Ciudad Madero', 'Tampico', 'Altamira',
    'Río Bravo', 'Mante', 'Xicoténcatl', 'Altamira', 'Ciudad Madero', 'Mante', 'Matamoros',
    'Nuevo Laredo', 'Reynosa', 'Río Bravo', 'Tampico', 'Victoria', 'Xicoténcatl'
  ],
  // México - Tlaxcala
  'Tlaxcala': [
    'Tlaxcala de Xicohténcatl', 'San Pablo del Monte', 'Calpulalpan', 'Chiautempan', 'Contla de Juan Cuamatzi',
    'Huamantla', 'Papalotla de Xicohténcatl', 'Sanctórum de Lázaro Cárdenas', 'Tlaxco', 'Zacatelco',
    'Calpulalpan', 'Chiautempan', 'Contla de Juan Cuamatzi', 'Huamantla', 'Papalotla de Xicohténcatl',
    'San Pablo del Monte', 'Sanctórum de Lázaro Cárdenas', 'Tlaxco', 'Zacatelco'
  ],
  // México - Veracruz
  'Veracruz': [
    'Veracruz', 'Xalapa-Enríquez', 'Orizaba', 'Córdoba', 'Poza Rica de Hidalgo', 'San Andrés Tuxtla',
    'Minatitlán', 'Boca del Río', 'Tuxpan de Rodríguez Cano', 'San Andrés Tuxtla', 'Boca del Río',
    'Córdoba', 'Minatitlán', 'Orizaba', 'Poza Rica de Hidalgo', 'San Andrés Tuxtla', 'Tuxpan de Rodríguez Cano',
    'Xalapa-Enríquez'
  ],
  // México - Yucatán
  'Yucatán': [
    'Mérida', 'Valladolid', 'Progreso', 'Kanasín', 'Umán', 'Tekax', 'Izamal', 'Hunucmá', 'Tizimín',
    'Motul', 'Tekit', 'Hocabá', 'Seyé', 'Hunucmá', 'Kanasín', 'Mérida', 'Progreso', 'Tekax',
    'Tizimín', 'Umán', 'Valladolid', 'Yaxcabá', 'Yobaín', 'Yucatán'
  ],
  // México - Zacatecas
  'Zacatecas': [
    'Zacatecas', 'Fresnillo', 'Calera de Víctor Rosales', 'Sombrerete', 'Loreto', 'Nochistlán de Mejía',
    'Jerez de García Salinas', 'Río Grande', 'Ojocaliente', 'Luis Moya', 'Genaro Codina',
    'General Enrique Estrada', 'General Francisco R. Murguía', 'General Pánfilo Natera',
    'Guadalupe', 'Huanusco', 'Jalpa', 'Jerez', 'Jiménez del Teul', 'Juan Aldama', 'Juchipila'
  ],
  // Estados Unidos - California
  'California': [
    'Los Ángeles', 'San Diego', 'San José', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach',
    'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside', 'Stockton', 'Irvine', 'Fremont',
    'San Bernardino', 'Modesto', 'Fontana', 'Oxnard', 'Moreno Valley', 'Huntington Beach'
  ],
  // Estados Unidos - Texas
  'Texas': [
    'Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi',
    'Plano', 'Lubbock', 'Garland', 'Irving', 'Amarillo', 'Grand Prairie', 'Brownsville', 'Pasadena',
    'McKinney', 'Mesquite', 'McAllen', 'Killeen', 'Frisco', 'Waco', 'Carrollton', 'Denton'
  ],
  // Estados Unidos - Nueva York
  'Nueva York': [
    'Nueva York', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle',
    'Mount Vernon', 'Schenectady', 'Utica', 'White Plains', 'Hempstead', 'Troy', 'Niagara Falls',
    'Binghamton', 'Freeport', 'Valley Stream', 'Long Beach', 'Rome', 'North Tonawanda'
  ]
}

export function useCountryCitySelect(selectedCountry: any, selectedState: any, selectedCity: any) {
  const { getCountries, getStates, getCities, isLoading, error } = useGoogleMapsLocation()
  
  // Reactive options
  const countryOptions = ref<Array<{ value: string, label: string }>>([])
  const stateOptions = ref<Array<{ value: string, label: string }>>([])
  const cityOptions = ref<Array<{ value: string, label: string }>>([])
  
  // Load countries on mount
  const loadCountries = async () => {
    try {
      const countries = await getCountries()
      countryOptions.value = countries
    } catch (err) {
      // Fallback to local data
      countryOptions.value = localCountries.map(country => ({ value: country, label: country }))
    }
  }
  
  // Load states when country changes
  const loadStates = async (country: string) => {
    if (!country) {
      stateOptions.value = []
      return
    }
    
    try {
      const states = await getStates(country)
      stateOptions.value = states
    } catch (err) {
      // Fallback to local data
      const localStates = statesByCountry[country] || []
      stateOptions.value = localStates.map(state => ({ value: state, label: state }))
    }
  }
  
  // Load cities when state changes
  const loadCities = async (state: string, country: string) => {
    if (!state || !country) {
      cityOptions.value = []
      return
    }
    
    try {
      const cities = await getCities(state, country)
      cityOptions.value = cities
    } catch (err) {
      // Fallback to local data
      const localCities = citiesByState[state] || []
      cityOptions.value = localCities.map(city => ({ value: city, label: city }))
    }
  }

  // Function to map Google Maps values to local values
  const mapGoogleMapsValueToLocal = (value: string) => {
    const mapped = googleMapsMapping[value]
    if (mapped) {
      return mapped
    }
    return { country: value, state: '', city: '' }
  }

  // Function to map multiple Google Maps values to local values
  const mapGoogleToLocal = ({ country, state, city }: { country?: string, state?: string, city?: string }) => {
    // If there's an exact mapping for the city
    if (city && googleMapsMapping[city]) {
      return googleMapsMapping[city]
    }
    // If there's an exact mapping for the state
    if (state && googleMapsMapping[state]) {
      return googleMapsMapping[state]
    }
    // If there's an exact mapping for the country
    if (country && googleMapsMapping[country]) {
      return googleMapsMapping[country]
    }
    // If no mapping, return original values
    return { country: country || '', state: state || '', city: city || '' }
  }
  
  // Watch for changes and load data
  watch(selectedCountry, (newCountry) => {
    if (newCountry) {
      loadStates(newCountry)
    } else {
      stateOptions.value = []
      cityOptions.value = []
    }
  })
  
  watch(selectedState, (newState) => {
    if (newState && selectedCountry.value) {
      loadCities(newState, selectedCountry.value)
    } else {
      cityOptions.value = []
    }
  })
  
  // Load initial data
  onMounted(() => {
    loadCountries()
  })
  
  function onCountryChange(newCountry: string) {
    selectedCountry.value = newCountry
    selectedState.value = ''
    selectedCity.value = ''
  }
  
  function onStateChange(newState: string) {
    selectedState.value = newState
    selectedCity.value = ''
  }
  
  function onCityChange(newCity: string) {
    selectedCity.value = newCity
  }
  
  return { 
    countryOptions: computed(() => countryOptions.value), 
    stateOptions: computed(() => stateOptions.value), 
    cityOptions: computed(() => cityOptions.value), 
    onCountryChange, 
    onStateChange,
    onCityChange,
    isLoading,
    error,
    mapGoogleMapsValueToLocal,
    mapGoogleToLocal
  }
} 