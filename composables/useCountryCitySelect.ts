import { ref, computed } from 'vue'

const countries = [
  'México', 'Estados Unidos', 'Colombia', 'Argentina', 'Chile', 'Perú', 'Ecuador', 'Venezuela', 'España', 'Costa Rica', 'Panamá', 'Guatemala', 'El Salvador', 'Honduras', 'Nicaragua', 'República Dominicana', 'Puerto Rico', 'Uruguay', 'Paraguay', 'Bolivia'
]

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
    'Ixtlahuacán', 'Minatitlán', 'Armería', 'Coquimatlán', 'Villa de Álvarez'
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
    'Acapulco de Juárez', 'Chilpancingo de los Bravo', 'Iguala de la Independencia', 'Chilapa de Álvarez',
    'Tlapa de Comonfort', 'Ayutla de los Libres', 'Atoyac de Álvarez', 'Técpan de Galeana',
    'San Marcos', 'Florencio Villarreal', 'Cruz Grande', 'Tlalchapa', 'Arcelia', 'Tlapehuala'
  ],
  // México - Hidalgo
  'Hidalgo': [
    'Pachuca de Soto', 'Tizayuca', 'Tulancingo de Bravo', 'Ixmiquilpan', 'Mixquiahuala de Juárez',
    'Actopan', 'Zimapán', 'Tula de Allende', 'Huejutla de Reyes', 'San Salvador', 'Santiago Tulantepec',
    'Tizayuca', 'Mineral de la Reforma', 'San Agustín Tlaxiaca', 'Epazoyucan'
  ],
  // México - Jalisco
  'Jalisco': [
    'Guadalajara', 'Zapopan', 'San Pedro Tlaquepaque', 'Tlaquepaque', 'Tonalá', 'Puerto Vallarta',
    'Lagos de Moreno', 'El Salto', 'Tepatitlán de Morelos', 'Tlajomulco de Zúñiga', 'Zapotlán el Grande',
    'Autlán de Navarro', 'Ameca', 'Arandas', 'Atotonilco el Alto', 'Ayotlán', 'Bolaños', 'Cabo Corrientes',
    'Casimiro Castillo', 'Chapala', 'Chimaltitán', 'Chiquilistlán', 'Cihuatlán', 'Cocula', 'Colotlán'
  ],
  // México - Michoacán
  'Michoacán': [
    'Morelia', 'Uruapan', 'Zamora de Hidalgo', 'Lázaro Cárdenas', 'Zitácuaro', 'Hidalgo', 'Apatzingán',
    'La Piedad de Cabadas', 'Pátzcuaro', 'Sahuayo', 'Nueva Italia', 'Paracho', 'Tacámbaro',
    'Tingüindín', 'Tuxpan', 'Villa Jiménez', 'Yurécuaro', 'Zacapu', 'Zamora'
  ],
  // México - Morelos
  'Morelos': [
    'Cuernavaca', 'Jiutepec', 'Ayala', 'Emiliano Zapata', 'Temixco', 'Xochitepec', 'Puente de Ixtla',
    'Amacuzac', 'Atlatlahucan', 'Axochiapan', 'Coatlán del Río', 'Cuautla', 'Huitzilac', 'Jantetelco',
    'Jonacatepec', 'Mazatepec', 'Miacatlán', 'Ocuituco', 'Puente de Ixtla', 'Temoac', 'Tepalcingo'
  ],
  // México - Nayarit
  'Nayarit': [
    'Tepic', 'Bahía de Banderas', 'Santiago Ixcuintla', 'Tuxpan', 'Ixtlán del Río', 'Xalisco',
    'San Blas', 'Compostela', 'Tecuala', 'Ixtlán del Río', 'Jala', 'La Yesca', 'Rosamorada',
    'Ruíz', 'San Pedro Lagunillas', 'Santa María del Oro', 'Santiago Ixcuintla', 'Tecuala'
  ],
  // México - Nuevo León
  'Nuevo León': [
    'Monterrey', 'San Pedro Garza García', 'Guadalupe', 'San Nicolás de los Garza', 'Santa Catarina',
    'General Escobedo', 'Apodaca', 'Linares', 'Montemorelos', 'Santiago', 'Allende', 'El Carmen',
    'General Terán', 'Hualahuises', 'Rayones', 'Sabinas Hidalgo', 'Salinas Victoria', 'Villaldama',
    'Aramberri', 'Bustamante', 'Cadereyta Jiménez', 'Cerralvo', 'Ciénega de Flores', 'Ciudad Anáhuac',
    'Doctor Arroyo', 'Doctor Coss', 'Doctor González', 'El Carmen', 'Galeana', 'García', 'General Bravo'
  ],
  // México - Oaxaca
  'Oaxaca': [
    'Oaxaca de Juárez', 'Tuxtepec', 'Santa Cruz Xoxocotlán', 'Santa Lucía del Camino', 'Villa de Zaachila',
    'San Antonio de la Cal', 'San Agustín de las Juntas', 'San Jacinto Amilpas', 'San Andrés Huayapam',
    'San Agustín Yatareni', 'Santa María Atzompa', 'Santa María del Tule', 'San Sebastián Tutla',
    'San Raymundo Jalpan', 'San Pablo Etla', 'San Pedro Ixtlahuaca', 'San Pedro Mixtepec',
    'San Pedro Pochutla', 'San Pedro Tapanatepec', 'San Pedro Taviche', 'San Pedro y San Pablo Ayutla'
  ],
  // México - Puebla
  'Puebla': [
    'Puebla de Zaragoza', 'Amozoc de Mota', 'Atlixco', 'Cuautlancingo', 'San Pedro Cholula',
    'San Andrés Cholula', 'Teziutlán', 'San Martín Texmelucan', 'Huauchinango', 'Tehuacán',
    'San Pedro Pochutla', 'Izúcar de Matamoros', 'Ajalpan', 'Acatlán de Osorio', 'Acajete',
    'Acteopan', 'Ahuacatlán', 'Ahuatlán', 'Ahuazotepec', 'Ahuehuetitla', 'Ajalpan', 'Albino Zertuche'
  ],
  // México - Querétaro
  'Querétaro': [
    'Santiago de Querétaro', 'San Juan del Río', 'Corregidora', 'El Marqués', 'Pedro Escobedo',
    'Amealco de Bonfil', 'Arroyo Seco', 'Cadereyta de Montes', 'Colón', 'Jalpan de Serra',
    'Landa de Matamoros', 'Peñamiller', 'Pinal de Amoles', 'San Joaquín', 'Tequisquiapan',
    'Tolimán', 'Villa Corregidora'
  ],
  // México - Quintana Roo
  'Quintana Roo': [
    'Benito Juárez', 'Othón P. Blanco', 'Felipe Carrillo Puerto', 'Lázaro Cárdenas', 'Isla Mujeres',
    'José María Morelos', 'Tulum', 'Bacalar', 'Cozumel', 'Solidaridad', 'Lázaro Cárdenas',
    'Isla Mujeres', 'José María Morelos', 'Tulum', 'Bacalar', 'Cozumel', 'Solidaridad'
  ],
  // México - San Luis Potosí
  'San Luis Potosí': [
    'San Luis Potosí', 'Soledad de Graciano Sánchez', 'Ciudad Valles', 'Matehuala', 'Rioverde',
    'Ciudad Fernández', 'Xilitla', 'Ciudad Santos', 'Tamasopo', 'Rayón', 'Aquismón', 'Axtla de Terrazas',
    'Cárdenas', 'Catorce', 'Cedral', 'Cerritos', 'Charcas', 'Ciudad del Maíz', 'Ciudad Fernández',
    'Tancanhuitz', 'Tamuín', 'Tanlajás', 'Tierra Nueva', 'Vanegas', 'Venado', 'Villa de Arista'
  ],
  // México - Sinaloa
  'Sinaloa': [
    'Culiacán Rosales', 'Mazatlán', 'Los Mochis', 'Guasave', 'Navolato', 'El Rosario', 'El Fuerte',
    'El Dorado', 'Concordia', 'Cosalá', 'Escuinapa', 'San Ignacio', 'Badiraguato', 'Choix',
    'El Fuerte', 'El Rosario', 'Escuinapa', 'Guasave', 'Mazatlán', 'Navolato', 'Salvador Alvarado'
  ],
  // México - Sonora
  'Sonora': [
    'Hermosillo', 'Ciudad Obregón', 'Nogales', 'San Luis Río Colorado', 'Huatabampo', 'Puerto Peñasco',
    'Guaymas', 'Navojoa', 'Cananea', 'Huatabampo', 'Puerto Peñasco', 'San Luis Río Colorado',
    'Agua Prieta', 'Altar', 'Arizpe', 'Atil', 'Bacadéhuachi', 'Bacanora', 'Bacerac', 'Bacoachi',
    'Bácum', 'Banámichi', 'Baviácora', 'Bavispe', 'Benito Juárez', 'Benjamín Hill', 'Caborca'
  ],
  // México - Tabasco
  'Tabasco': [
    'Centro', 'Cárdenas', 'Cunduacán', 'Comalcalco', 'Huimanguillo', 'Teapa', 'Jalpa de Méndez',
    'Nacajuca', 'Tenosique', 'Balancán', 'Cárdenas', 'Centro', 'Comalcalco', 'Cunduacán',
    'Emiliano Zapata', 'Huimanguillo', 'Jalpa de Méndez', 'Jonuta', 'Macuspana', 'Nacajuca',
    'Paraíso', 'Tacotalpa', 'Teapa', 'Tenosique'
  ],
  // México - Tamaulipas
  'Tamaulipas': [
    'Reynosa', 'Matamoros', 'Nuevo Laredo', 'Victoria', 'Tampico', 'Ciudad Madero', 'Altamira',
    'Río Bravo', 'Mante', 'Xicoténcatl', 'San Fernando', 'Valle Hermoso', 'Gómez Farías',
    'El Mante', 'Güémez', 'Gustavo Díaz Ordaz', 'Hidalgo', 'Jaumave', 'Jiménez', 'Llera',
    'Mainero', 'Méndez', 'Mier', 'Miguel Alemán', 'Miquihuana', 'Nuevo Laredo', 'Nuevo Morelos'
  ],
  // México - Tlaxcala
  'Tlaxcala': [
    'Tlaxcala de Xicohténcatl', 'San Pablo del Monte', 'Apizaco', 'Calpulalpan', 'Chiautempan',
    'Contla de Juan Cuamatzi', 'Huamantla', 'Papalotla de Xicohténcatl', 'Sanctórum de Lázaro Cárdenas',
    'Tlaxco', 'Zacatelco', 'Acuamanala de Miguel Hidalgo', 'Amaxac de Guerrero', 'Apetatitlán de Antonio Carvajal',
    'Atlangatepec', 'Atltzayanca', 'Benito Juárez', 'Calpulalpan', 'Chiautempan', 'Contla de Juan Cuamatzi'
  ],
  // México - Veracruz
  'Veracruz': [
    'Veracruz', 'Xalapa-Enríquez', 'Orizaba', 'Córdoba', 'Poza Rica de Hidalgo', 'San Andrés Tuxtla',
    'Minatitlán', 'Coatzacoalcos', 'Tuxpan de Rodríguez Cano', 'Boca del Río', 'San Juan Evangelista',
    'Tierra Blanca', 'Cosamaloapan de Carpio', 'Carlos A. Carrillo', 'Tantoyuca', 'Pánuco',
    'Ozuluama de Mascareñas', 'Tampico Alto', 'Tempoal', 'Platón Sánchez', 'Chicontepec'
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
  const countryOptions = computed(() => countries.map(country => ({ value: country, label: country })))
  
  const stateOptions = computed(() => {
    return statesByCountry[selectedCountry.value] ? statesByCountry[selectedCountry.value].map(state => ({ value: state, label: state })) : []
  })
  
  const cityOptions = computed(() => {
    return citiesByState[selectedState.value] ? citiesByState[selectedState.value].map(city => ({ value: city, label: city })) : []
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
    countryOptions, 
    stateOptions, 
    cityOptions, 
    onCountryChange, 
    onStateChange,
    onCityChange
  }
} 