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
                'group': !isEditingProfile && profileData.profileImageUrl
              }"
              @click="isEditingProfile ? triggerImageUpload() : null"
            >
              <img 
                v-if="profileData.profileImageUrl" 
                :src="profileData.profileImageUrl" 
                alt="Profile" 
                class="w-full h-full object-cover"
              />
              <UIcon v-else name="i-heroicons-user" class="w-16 h-16 text-white" />
              
              <!-- Hover overlay for delete (when not editing and has image) -->
              <div 
                v-if="!isEditingProfile && profileData.profileImageUrl"
                class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
                @click="handleDeleteImage"
              >
                <UIcon name="i-heroicons-trash" class="w-8 h-8 text-white" />
              </div>
            </div>
            
            <!-- Camera button (when editing) -->
            <button 
              v-if="isEditingProfile"
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

              <!-- Row 2: Título, Género, Edad -->
              <div class="grid grid-cols-3 gap-4">
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
                <div>
                  <DatePickerInput 
                    v-model="profileData.birthDate"
                    label="Fecha de nacimiento:"
                    placeholder="dd/mm/yyyy"
                  />
                </div>
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
              <!-- Address Search -->
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Dirección (con autocompletado)</label>
                <GoogleAddressAutocomplete 
                  v-model="addressSearchQuery"
                  placeholder="Buscar dirección..."
                  @address-selected="handleAddressSelected"
                />
              </div>
              
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
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">País</label>
                <CustomSelect 
                  v-model="profileData.country"
                  :options="countryOptions"
                  placeholder="Seleccionar país"
                  @update:modelValue="onCountryChange"
                />
              </div>
              
              <!-- State -->
              <div>
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
              <div>
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
      </div>

      <!-- Credentials Section -->
      <AppCard>
        <div class="flex items-center justify-between mb-6">
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
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="(credential, index) in profileData.credentials" 
            :key="index"
            class="bg-slate-600/50 rounded-lg p-4 border border-slate-500"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div v-if="!isEditingCredentials" class="font-medium text-white mb-1">{{ credential.name }}</div>
                <AppInput 
                  v-else
                  v-model="credential.name"
                  placeholder="Nombre de la credencial"
                />
                
                <div v-if="!isEditingCredentials" class="text-slate-400 text-sm mb-2">{{ credential.issuer }}</div>
                <AppInput 
                  v-else
                  v-model="credential.issuer"
                  placeholder="Institución emisora"
                />
                
                <div v-if="!isEditingCredentials" class="text-slate-400 text-xs">{{ credential.date }}</div>
                <AppInput 
                  v-else
                  v-model="credential.date"
                  type="date"
                />
              </div>
              
              <div class="flex gap-2">
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
          
          <button 
            v-if="isEditingCredentials"
            @click="addCredential"
            class="md:col-span-2 lg:col-span-3 w-full mt-4 p-4 border-2 border-dashed border-slate-500 rounded-lg text-slate-400 hover:text-slate-300 hover:border-slate-400 transition-colors"
          >
            <UIcon name="i-heroicons-plus" class="w-5 h-5 mx-auto mb-1" />
            Agregar credencial
          </button>
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
import AppButtonSecondary from '~/components/AppButtonSecondary.vue'
import AppButtonPrimary from '~/components/AppButtonPrimary.vue'
import GoogleAddressAutocomplete from '~/components/GoogleAddressAutocomplete.vue'
import DatePickerInput from '~/components/DatePickerInput.vue'

const { user } = useAuth()
const { uploadProfileImage, uploadCredentialFile } = useFirebaseStorage()
const { getCoachById, getCoachByAuthUID, updateCoach } = useCoaches()

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

// Handle address selection from Google Autocomplete
const handleAddressSelected = (address: {
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  postalCode: string
}) => {
  console.log('📍 Dirección seleccionada:', address)
  
  // Update address fields
  profileData.addressLine1 = address.addressLine1
  profileData.addressLine2 = address.addressLine2
  profileData.postalCode = address.postalCode
  
  // Map Google values to our local values
  const countryMapping: Record<string, string> = {
    'Mexico': 'México',
    'United States': 'Estados Unidos',
    'Colombia': 'Colombia',
    'Argentina': 'Argentina',
    'Chile': 'Chile',
    'Peru': 'Perú',
    'Ecuador': 'Ecuador',
    'Venezuela': 'Venezuela',
    'Spain': 'España',
    'Costa Rica': 'Costa Rica',
    'Panama': 'Panamá',
    'Guatemala': 'Guatemala',
    'El Salvador': 'El Salvador',
    'Honduras': 'Honduras',
    'Nicaragua': 'Nicaragua',
    'Dominican Republic': 'República Dominicana',
    'Puerto Rico': 'Puerto Rico',
    'Uruguay': 'Uruguay',
    'Paraguay': 'Paraguay',
    'Bolivia': 'Bolivia'
  }
  
  const stateMapping: Record<string, string> = {
    'Nuevo Leon': 'Nuevo León',
    'Mexico City': 'Ciudad de México',
    'Mexico State': 'Estado de México',
    'San Luis Potosi': 'San Luis Potosí',
    'Queretaro': 'Querétaro',
    'Yucatan': 'Yucatán',
    'Quintana Roo': 'Quintana Roo',
    'Veracruz': 'Veracruz',
    'Tamaulipas': 'Tamaulipas',
    'Tabasco': 'Tabasco',
    'Sonora': 'Sonora',
    'Sinaloa': 'Sinaloa',
    'San Luis Potosí': 'San Luis Potosí',
    'Querétaro': 'Querétaro',
    'Yucatán': 'Yucatán',
    'Nuevo León': 'Nuevo León'
  }
  
  const cityMapping: Record<string, string> = {
    // Nuevo León
    'Monterrey': 'Monterrey',
    'San Pedro Garza Garcia': 'San Pedro Garza García',
    'San Nicolas de los Garza': 'San Nicolás de los Garza',
    'Santa Catarina': 'Santa Catarina',
    'General Escobedo': 'General Escobedo',
    'Apodaca': 'Apodaca',
    'Linares': 'Linares',
    'Montemorelos': 'Montemorelos',
    'Santiago': 'Santiago',
    'Allende': 'Allende',
    'El Carmen': 'El Carmen',
    'General Teran': 'General Terán',
    'Hualahuises': 'Hualahuises',
    'Rayones': 'Rayones',
    'Sabinas Hidalgo': 'Sabinas Hidalgo',
    'Salinas Victoria': 'Salinas Victoria',
    'Villaldama': 'Villaldama',
    'Aramberri': 'Aramberri',
    'Bustamante': 'Bustamante',
    'Cadereyta Jimenez': 'Cadereyta Jiménez',
    'Cerralvo': 'Cerralvo',
    'Cienega de Flores': 'Ciénega de Flores',
    'Ciudad Anahuac': 'Ciudad Anáhuac',
    'Doctor Arroyo': 'Doctor Arroyo',
    'Doctor Coss': 'Doctor Coss',
    'Doctor Gonzalez': 'Doctor González',
    'Galeana': 'Galeana',
    'Garcia': 'García',
    'General Bravo': 'General Bravo',
    
    // Ciudad de México
    'Alvaro Obregon': 'Álvaro Obregón',
    'Azcapotzalco': 'Azcapotzalco',
    'Benito Juarez': 'Benito Juárez',
    'Coyoacan': 'Coyoacán',
    'Cuajimalpa de Morelos': 'Cuajimalpa de Morelos',
    'Cuauhtemoc': 'Cuauhtémoc',
    'Gustavo A. Madero': 'Gustavo A. Madero',
    'Iztacalco': 'Iztacalco',
    'Iztapalapa': 'Iztapalapa',
    'La Magdalena Contreras': 'La Magdalena Contreras',
    'Miguel Hidalgo': 'Miguel Hidalgo',
    'Milpa Alta': 'Milpa Alta',
    'Tlahuac': 'Tláhuac',
    'Tlalpan': 'Tlalpan',
    'Venustiano Carranza': 'Venustiano Carranza',
    'Xochimilco': 'Xochimilco',
    
    // Estado de México
    'Toluca': 'Toluca',
    'Ecatepec de Morelos': 'Ecatepec de Morelos',
    'Nezahualcoyotl': 'Nezahualcóyotl',
    'Naucalpan de Juarez': 'Naucalpan de Juárez',
    'Cuautitlan Izcalli': 'Cuautitlán Izcalli',
    'Chimalhuacan': 'Chimalhuacán',
    'Ixtapaluca': 'Ixtapaluca',
    'Tlalnepantla de Baz': 'Tlalnepantla de Baz',
    'Atizapan de Zaragoza': 'Atizapán de Zaragoza',
    'Cuautitlan': 'Cuautitlán',
    'Tultitlan': 'Tultitlán',
    'Coacalco de Berriozabal': 'Coacalco de Berriozábal',
    'Chalco': 'Chalco',
    'Valle de Chalco Solidaridad': 'Valle de Chalco Solidaridad',
    
    // Jalisco
    'Guadalajara': 'Guadalajara',
    'Zapopan': 'Zapopan',
    'San Pedro Tlaquepaque': 'San Pedro Tlaquepaque',
    'Tlaquepaque': 'Tlaquepaque',
    'Tonala': 'Tonalá',
    'Puerto Vallarta': 'Puerto Vallarta',
    'Lagos de Moreno': 'Lagos de Moreno',
    'El Salto': 'El Salto',
    'Tepatitlan de Morelos': 'Tepatitlán de Morelos',
    'Tlajomulco de Zuniga': 'Tlajomulco de Zúñiga',
    'Zapotlan el Grande': 'Zapotlán el Grande',
    'Autlan de Navarro': 'Autlán de Navarro',
    'Ameca': 'Ameca',
    'Arandas': 'Arandas',
    'Atotonilco el Alto': 'Atotonilco el Alto',
    'Ayotlan': 'Ayotlán',
    'Bolanos': 'Bolaños',
    'Cabo Corrientes': 'Cabo Corrientes',
    'Casimiro Castillo': 'Casimiro Castillo',
    'Chapala': 'Chapala',
    'Chimaltitan': 'Chimaltitán',
    'Chiquilistlan': 'Chiquilistlán',
    'Cihuatlan': 'Cihuatlán',
    'Cocula': 'Cocula',
    'Colotlan': 'Colotlán',
    
    // Guanajuato
    'Leon': 'León',
    'Irapuato': 'Irapuato',
    'Celaya': 'Celaya',
    'Salamanca': 'Salamanca',
    'Guanajuato': 'Guanajuato',
    'Silao': 'Silao',
    'San Miguel de Allende': 'San Miguel de Allende',
    'Dolores Hidalgo': 'Dolores Hidalgo',
    'Valle de Santiago': 'Valle de Santiago',
    'Penjamo': 'Pénjamo',
    'San Luis de la Paz': 'San Luis de la Paz',
    'Acambaro': 'Acámbaro',
    'Comonfort': 'Comonfort',
    'Cortazar': 'Cortazar',
    'Abasolo': 'Abasolo',
    'San Felipe': 'San Felipe',
    'Purisima del Rincon': 'Purísima del Rincón',
    
    // Querétaro
    'Santiago de Queretaro': 'Santiago de Querétaro',
    'San Juan del Rio': 'San Juan del Río',
    'Corregidora': 'Corregidora',
    'El Marques': 'El Marqués',
    'Pedro Escobedo': 'Pedro Escobedo',
    'Amealco de Bonfil': 'Amealco de Bonfil',
    'Arroyo Seco': 'Arroyo Seco',
    'Cadereyta de Montes': 'Cadereyta de Montes',
    'Colon': 'Colón',
    'Jalpan de Serra': 'Jalpan de Serra',
    'Landa de Matamoros': 'Landa de Matamoros',
    'Penamiller': 'Peñamiller',
    'Pinal de Amoles': 'Pinal de Amoles',
    'San Joaquin': 'San Joaquín',
    'Tequisquiapan': 'Tequisquiapan',
    'Toliman': 'Tolimán',
    'Villa Corregidora': 'Villa Corregidora',
    
    // San Luis Potosí
    'San Luis Potosi': 'San Luis Potosí',
    'Soledad de Graciano Sanchez': 'Soledad de Graciano Sánchez',
    'Ciudad Valles': 'Ciudad Valles',
    'Matehuala': 'Matehuala',
    'Rioverde': 'Rioverde',
    'Ciudad Fernandez': 'Ciudad Fernández',
    'Xilitla': 'Xilitla',
    'Ciudad Santos': 'Ciudad Santos',
    'Tamasopo': 'Tamasopo',
    'Rayon': 'Rayón',
    'Aquismon': 'Aquismón',
    'Axtla de Terrazas': 'Axtla de Terrazas',
    'Cardenas': 'Cárdenas',
    'Catorce': 'Catorce',
    'Cedral': 'Cedral',
    'Cerritos': 'Cerritos',
    'Charcas': 'Charcas',
    'Ciudad del Maiz': 'Ciudad del Maíz',
    'Tancanhuitz': 'Tancanhuitz',
    'Tamuin': 'Tamuín',
    'Tanlajas': 'Tanlajás',
    'Tierra Nueva': 'Tierra Nueva',
    'Vanegas': 'Vanegas',
    'Venado': 'Venado',
    'Villa de Arista': 'Villa de Arista',
    
    // Yucatán
    'Merida': 'Mérida',
    'Valladolid': 'Valladolid',
    'Progreso': 'Progreso',
    'Kanasin': 'Kanasín',
    'Uman': 'Umán',
    'Tekax': 'Tekax',
    'Izamal': 'Izamal',
    'Hunucma': 'Hunucmá',
    'Tizimin': 'Tizimín',
    'Motul': 'Motul',
    'Tekit': 'Tekit',
    'Hocaba': 'Hocabá',
    'Seye': 'Seyé',
    'Yaxcaba': 'Yaxcabá',
    'Yobain': 'Yobaín',
    
    // Quintana Roo
    'Benito Juarez': 'Benito Juárez',
    'Othon P. Blanco': 'Othón P. Blanco',
    'Felipe Carrillo Puerto': 'Felipe Carrillo Puerto',
    'Lazaro Cardenas': 'Lázaro Cárdenas',
    'Isla Mujeres': 'Isla Mujeres',
    'Jose Maria Morelos': 'José María Morelos',
    'Tulum': 'Tulum',
    'Bacalar': 'Bacalar',
    'Cozumel': 'Cozumel',
    'Solidaridad': 'Solidaridad',
    
    // Veracruz
    'Veracruz': 'Veracruz',
    'Xalapa-Enriquez': 'Xalapa-Enríquez',
    'Orizaba': 'Orizaba',
    'Cordoba': 'Córdoba',
    'Poza Rica de Hidalgo': 'Poza Rica de Hidalgo',
    'San Andres Tuxtla': 'San Andrés Tuxtla',
    'Minatitlan': 'Minatitlán',
    'Coatzacoalcos': 'Coatzacoalcos',
    'Tuxpan de Rodriguez Cano': 'Tuxpan de Rodríguez Cano',
    'Boca del Rio': 'Boca del Río',
    'San Juan Evangelista': 'San Juan Evangelista',
    'Tierra Blanca': 'Tierra Blanca',
    'Cosamaloapan de Carpio': 'Cosamaloapan de Carpio',
    'Carlos A. Carrillo': 'Carlos A. Carrillo',
    'Tantoyuca': 'Tantoyuca',
    'Panuco': 'Pánuco',
    'Ozuluama de Mascarenas': 'Ozuluama de Mascareñas',
    'Tampico Alto': 'Tampico Alto',
    'Tempoal': 'Tempoal',
    'Platon Sanchez': 'Platón Sánchez',
    'Chicontepec': 'Chicontepec',
    
    // Tamaulipas
    'Reynosa': 'Reynosa',
    'Matamoros': 'Matamoros',
    'Nuevo Laredo': 'Nuevo Laredo',
    'Victoria': 'Victoria',
    'Tampico': 'Tampico',
    'Ciudad Madero': 'Ciudad Madero',
    'Altamira': 'Altamira',
    'Rio Bravo': 'Río Bravo',
    'Mante': 'Mante',
    'Xicotencatl': 'Xicoténcatl',
    'San Fernando': 'San Fernando',
    'Valle Hermoso': 'Valle Hermoso',
    'Gomez Farias': 'Gómez Farías',
    'El Mante': 'El Mante',
    'Guemez': 'Güémez',
    'Gustavo Diaz Ordaz': 'Gustavo Díaz Ordaz',
    'Hidalgo': 'Hidalgo',
    'Jaumave': 'Jaumave',
    'Jimenez': 'Jiménez',
    'Llera': 'Llera',
    'Mainero': 'Mainero',
    'Mendez': 'Méndez',
    'Mier': 'Mier',
    'Miguel Aleman': 'Miguel Alemán',
    'Miquihuana': 'Miquihuana',
    'Nuevo Morelos': 'Nuevo Morelos',
    
    // Tabasco
    'Centro': 'Centro',
    'Cardenas': 'Cárdenas',
    'Cunduacan': 'Cunduacán',
    'Comalcalco': 'Comalcalco',
    'Huimanguillo': 'Huimanguillo',
    'Teapa': 'Teapa',
    'Jalpa de Mendez': 'Jalpa de Méndez',
    'Nacajuca': 'Nacajuca',
    'Tenosique': 'Tenosique',
    'Balancan': 'Balancán',
    'Emiliano Zapata': 'Emiliano Zapata',
    'Jonuta': 'Jonuta',
    'Macuspana': 'Macuspana',
    'Paraiso': 'Paraíso',
    'Tacotalpa': 'Tacotalpa',
    
    // Sonora
    'Hermosillo': 'Hermosillo',
    'Ciudad Obregon': 'Ciudad Obregón',
    'Nogales': 'Nogales',
    'San Luis Rio Colorado': 'San Luis Río Colorado',
    'Huatabampo': 'Huatabampo',
    'Puerto Penasco': 'Puerto Peñasco',
    'Guaymas': 'Guaymas',
    'Navojoa': 'Navojoa',
    'Cananea': 'Cananea',
    'Agua Prieta': 'Agua Prieta',
    'Altar': 'Altar',
    'Arizpe': 'Arizpe',
    'Atil': 'Atil',
    'Bacadehuachi': 'Bacadéhuachi',
    'Bacanora': 'Bacanora',
    'Bacerac': 'Bacerac',
    'Bacoachi': 'Bacoachi',
    'Bacum': 'Bácum',
    'Banamichi': 'Banámichi',
    'Baviacora': 'Baviácora',
    'Bavispe': 'Bavispe',
    'Benito Juarez': 'Benito Juárez',
    'Benjamin Hill': 'Benjamín Hill',
    'Caborca': 'Caborca',
    
    // Sinaloa
    'Culiacan Rosales': 'Culiacán Rosales',
    'Mazatlan': 'Mazatlán',
    'Los Mochis': 'Los Mochis',
    'Guasave': 'Guasave',
    'Navolato': 'Navolato',
    'El Rosario': 'El Rosario',
    'El Fuerte': 'El Fuerte',
    'El Dorado': 'El Dorado',
    'Concordia': 'Concordia',
    'Cosala': 'Cosalá',
    'Escuinapa': 'Escuinapa',
    'San Ignacio': 'San Ignacio',
    'Badiraguato': 'Badiraguato',
    'Choix': 'Choix',
    'Salvador Alvarado': 'Salvador Alvarado',
    
    // Michoacán
    'Morelia': 'Morelia',
    'Uruapan': 'Uruapan',
    'Zamora de Hidalgo': 'Zamora de Hidalgo',
    'Lazaro Cardenas': 'Lázaro Cárdenas',
    'Zitacuaro': 'Zitácuaro',
    'Hidalgo': 'Hidalgo',
    'Apatzingan': 'Apatzingán',
    'La Piedad de Cabadas': 'La Piedad de Cabadas',
    'Patzcuaro': 'Pátzcuaro',
    'Sahuayo': 'Sahuayo',
    'Nueva Italia': 'Nueva Italia',
    'Paracho': 'Paracho',
    'Tacambaro': 'Tacámbaro',
    'Tinguindin': 'Tingüindín',
    'Tuxpan': 'Tuxpan',
    'Villa Jimenez': 'Villa Jiménez',
    'Yurecuaro': 'Yurécuaro',
    'Zacapu': 'Zacapu',
    'Zamora': 'Zamora',
    
    // Morelos
    'Cuernavaca': 'Cuernavaca',
    'Jiutepec': 'Jiutepec',
    'Ayala': 'Ayala',
    'Emiliano Zapata': 'Emiliano Zapata',
    'Temixco': 'Temixco',
    'Xochitepec': 'Xochitepec',
    'Puente de Ixtla': 'Puente de Ixtla',
    'Amacuzac': 'Amacuzac',
    'Atlatlahucan': 'Atlatlahucan',
    'Axochiapan': 'Axochiapan',
    'Coatlan del Rio': 'Coatlán del Río',
    'Cuautla': 'Cuautla',
    'Huitzilac': 'Huitzilac',
    'Jantetelco': 'Jantetelco',
    'Jonacatepec': 'Jonacatepec',
    'Mazatepec': 'Mazatepec',
    'Miacatlan': 'Miacatlán',
    'Ocuituco': 'Ocuituco',
    'Temoac': 'Temoac',
    'Tepalcingo': 'Tepalcingo',
    
    // Nayarit
    'Tepic': 'Tepic',
    'Bahia de Banderas': 'Bahía de Banderas',
    'Santiago Ixcuintla': 'Santiago Ixcuintla',
    'Tuxpan': 'Tuxpan',
    'Ixtlan del Rio': 'Ixtlán del Río',
    'Xalisco': 'Xalisco',
    'San Blas': 'San Blas',
    'Compostela': 'Compostela',
    'Tecuala': 'Tecuala',
    'Jala': 'Jala',
    'La Yesca': 'La Yesca',
    'Rosamorada': 'Rosamorada',
    'Ruiz': 'Ruíz',
    'San Pedro Lagunillas': 'San Pedro Lagunillas',
    'Santa Maria del Oro': 'Santa María del Oro',
    
    // Oaxaca
    'Oaxaca de Juarez': 'Oaxaca de Juárez',
    'Tuxtepec': 'Tuxtepec',
    'Santa Cruz Xoxocotlan': 'Santa Cruz Xoxocotlán',
    'Santa Lucia del Camino': 'Santa Lucía del Camino',
    'Villa de Zaachila': 'Villa de Zaachila',
    'San Antonio de la Cal': 'San Antonio de la Cal',
    'San Agustin de las Juntas': 'San Agustín de las Juntas',
    'San Jacinto Amilpas': 'San Jacinto Amilpas',
    'San Andres Huayapam': 'San Andrés Huayapam',
    'San Agustin Yatareni': 'San Agustín Yatareni',
    'Santa Maria Atzompa': 'Santa María Atzompa',
    'Santa Maria del Tule': 'Santa María del Tule',
    'San Sebastian Tutla': 'San Sebastián Tutla',
    'San Raymundo Jalpan': 'San Raymundo Jalpan',
    'San Pablo Etla': 'San Pablo Etla',
    'San Pedro Ixtlahuaca': 'San Pedro Ixtlahuaca',
    'San Pedro Mixtepec': 'San Pedro Mixtepec',
    'San Pedro Pochutla': 'San Pedro Pochutla',
    'San Pedro Tapanatepec': 'San Pedro Tapanatepec',
    'San Pedro Taviche': 'San Pedro Taviche',
    'San Pedro y San Pablo Ayutla': 'San Pedro y San Pablo Ayutla',
    
    // Puebla
    'Puebla de Zaragoza': 'Puebla de Zaragoza',
    'Amozoc de Mota': 'Amozoc de Mota',
    'Atlixco': 'Atlixco',
    'Cuautlancingo': 'Cuautlancingo',
    'San Pedro Cholula': 'San Pedro Cholula',
    'San Andres Cholula': 'San Andrés Cholula',
    'Teziutlan': 'Teziutlán',
    'San Martin Texmelucan': 'San Martín Texmelucan',
    'Huauchinango': 'Huauchinango',
    'Tehuacan': 'Tehuacán',
    'San Pedro Pochutla': 'San Pedro Pochutla',
    'Izucar de Matamoros': 'Izúcar de Matamoros',
    'Ajalpan': 'Ajalpan',
    'Acatlan de Osorio': 'Acatlán de Osorio',
    'Acajete': 'Acajete',
    'Acteopan': 'Acteopan',
    'Ahuacatlan': 'Ahuacatlán',
    'Ahuatlan': 'Ahuatlán',
    'Ahuazotepec': 'Ahuazotepec',
    'Ahuehuetitla': 'Ahuehuetitla',
    'Albino Zertuche': 'Albino Zertuche',
    
    // Aguascalientes
    'Aguascalientes': 'Aguascalientes',
    'Jesus Maria': 'Jesús María',
    'San Francisco de los Romo': 'San Francisco de los Romo',
    'Calvillo': 'Calvillo',
    'Rincon de Romos': 'Rincón de Romos',
    'Pabellon de Arteaga': 'Pabellón de Arteaga',
    'Asientos': 'Asientos',
    'Cosio': 'Cosío',
    'San Jose de Gracia': 'San José de Gracia',
    'Tepezala': 'Tepezalá',
    'El Llano': 'El Llano',
    
    // Baja California
    'Tijuana': 'Tijuana',
    'Mexicali': 'Mexicali',
    'Ensenada': 'Ensenada',
    'Tecate': 'Tecate',
    'Playas de Rosarito': 'Playas de Rosarito',
    'San Quintin': 'San Quintín',
    'San Felipe': 'San Felipe',
    'Punta Colonet': 'Punta Colonet',
    'La Rumorosa': 'La Rumorosa',
    'El Hongo': 'El Hongo',
    'Ojos Negros': 'Ojos Negros',
    'Valle de Guadalupe': 'Valle de Guadalupe',
    
    // Baja California Sur
    'La Paz': 'La Paz',
    'San Jose del Cabo': 'San José del Cabo',
    'Cabo San Lucas': 'Cabo San Lucas',
    'Loreto': 'Loreto',
    'Santa Rosalia': 'Santa Rosalía',
    'Mulege': 'Mulegé',
    'Comondu': 'Comondú',
    'Todos Santos': 'Todos Santos',
    'San Ignacio': 'San Ignacio',
    'Villa Alberto Andres Alvarado Aramburo': 'Villa Alberto Andrés Alvarado Arámburo',
    
    // Campeche
    'San Francisco de Campeche': 'San Francisco de Campeche',
    'Ciudad del Carmen': 'Ciudad del Carmen',
    'Champoton': 'Champotón',
    'Escarcega': 'Escárcega',
    'Calkini': 'Calkiní',
    'Dzitbalche': 'Dzitbalché',
    'Tenabo': 'Tenabo',
    'Hopelchen': 'Hopelchén',
    'Palizada': 'Palizada',
    'Seybaplaya': 'Seybaplaya',
    
    // Chiapas
    'Tuxtla Gutierrez': 'Tuxtla Gutiérrez',
    'Tapachula': 'Tapachula',
    'San Cristobal de las Casas': 'San Cristóbal de las Casas',
    'Comitan de Dominguez': 'Comitán de Domínguez',
    'Chiapa de Corzo': 'Chiapa de Corzo',
    'Villaflores': 'Villaflores',
    'Tonala': 'Tonalá',
    'Villahermosa': 'Villahermosa',
    'Palenque': 'Palenque',
    'Ocosingo': 'Ocosingo',
    'Cintalapa': 'Cintalapa',
    'San Juan Chamula': 'San Juan Chamula',
    'Bochil': 'Bochil',
    'Ocozocoautla de Espinosa': 'Ocozocoautla de Espinosa',
    
    // Chihuahua
    'Chihuahua': 'Chihuahua',
    'Ciudad Juarez': 'Ciudad Juárez',
    'Delicias': 'Delicias',
    'Cuauhtemoc': 'Cuauhtémoc',
    'Nuevo Casas Grandes': 'Nuevo Casas Grandes',
    'Hidalgo del Parral': 'Hidalgo del Parral',
    'Meoqui': 'Meoqui',
    'Camargo': 'Camargo',
    'Jimenez': 'Jiménez',
    'Aldama': 'Aldama',
    'Aquiles Serdan': 'Aquiles Serdán',
    'Bachiniva': 'Bachíniva',
    'Balleza': 'Balleza',
    'Batopilas': 'Batopilas',
    
    // Coahuila
    'Saltillo': 'Saltillo',
    'Torreon': 'Torreón',
    'Monclova': 'Monclova',
    'Piedras Negras': 'Piedras Negras',
    'Ramos Arizpe': 'Ramos Arizpe',
    'Matamoros': 'Matamoros',
    'San Pedro': 'San Pedro',
    'Frontera': 'Frontera',
    'Acuna': 'Acuña',
    'Muzquiz': 'Múzquiz',
    'San Buenaventura': 'San Buenaventura',
    'Allende': 'Allende',
    'Arteaga': 'Arteaga',
    'Candela': 'Candela',
    
    // Colima
    'Colima': 'Colima',
    'Manzanillo': 'Manzanillo',
    'Villa de Alvarez': 'Villa de Álvarez',
    'Tecoman': 'Tecomán',
    'Comala': 'Comala',
    'Coquimatlan': 'Coquimatlán',
    'Cuauhtemoc': 'Cuauhtémoc',
    'Ixtlahuacan': 'Ixtlahuacán',
    'Minatitlan': 'Minatitlán',
    'Armeria': 'Armería',
    
    // Durango
    'Victoria de Durango': 'Victoria de Durango',
    'Gomez Palacio': 'Gómez Palacio',
    'Lerdo': 'Lerdo',
    'El Oro': 'El Oro',
    'Santiago Papasquiaro': 'Santiago Papasquiaro',
    'Poanas': 'Poanas',
    'Mapimi': 'Mapimí',
    'Nombre de Dios': 'Nombre de Dios',
    'Pueblo Nuevo': 'Pueblo Nuevo',
    'San Dimas': 'San Dimas',
    'San Juan del Rio': 'San Juan del Río',
    'Suchil': 'Súchil',
    
    // Guerrero
    'Acapulco de Juarez': 'Acapulco de Juárez',
    'Chilpancingo de los Bravo': 'Chilpancingo de los Bravo',
    'Iguala de la Independencia': 'Iguala de la Independencia',
    'Chilapa de Alvarez': 'Chilapa de Álvarez',
    'Tlapa de Comonfort': 'Tlapa de Comonfort',
    'Ayutla de los Libres': 'Ayutla de los Libres',
    'Atoyac de Alvarez': 'Atoyac de Álvarez',
    'Tecpan de Galeana': 'Técpan de Galeana',
    'San Marcos': 'San Marcos',
    'Florencio Villarreal': 'Florencio Villarreal',
    'Cruz Grande': 'Cruz Grande',
    'Tlalchapa': 'Tlalchapa',
    'Arcelia': 'Arcelia',
    'Tlapehuala': 'Tlapehuala',
    
    // Hidalgo
    'Pachuca de Soto': 'Pachuca de Soto',
    'Tizayuca': 'Tizayuca',
    'Tulancingo de Bravo': 'Tulancingo de Bravo',
    'Ixmiquilpan': 'Ixmiquilpan',
    'Mixquiahuala de Juarez': 'Mixquiahuala de Juárez',
    'Actopan': 'Actopan',
    'Zimapan': 'Zimapán',
    'Tula de Allende': 'Tula de Allende',
    'Huejutla de Reyes': 'Huejutla de Reyes',
    'San Salvador': 'San Salvador',
    'Santiago Tulantepec': 'Santiago Tulantepec',
    'Mineral de la Reforma': 'Mineral de la Reforma',
    'San Agustin Tlaxiaca': 'San Agustín Tlaxiaca',
    'Epazoyucan': 'Epazoyucan',
    
    // Tlaxcala
    'Tlaxcala de Xicohtencatl': 'Tlaxcala de Xicohténcatl',
    'San Pablo del Monte': 'San Pablo del Monte',
    'Apizaco': 'Apizaco',
    'Calpulalpan': 'Calpulalpan',
    'Chiautempan': 'Chiautempan',
    'Contla de Juan Cuamatzi': 'Contla de Juan Cuamatzi',
    'Huamantla': 'Huamantla',
    'Papalotla de Xicohtencatl': 'Papalotla de Xicohténcatl',
    'Sanctorum de Lazaro Cardenas': 'Sanctórum de Lázaro Cárdenas',
    'Tlaxco': 'Tlaxco',
    'Zacatelco': 'Zacatelco',
    'Acuamanala de Miguel Hidalgo': 'Acuamanala de Miguel Hidalgo',
    'Amaxac de Guerrero': 'Amaxac de Guerrero',
    'Apetatitlan de Antonio Carvajal': 'Apetatitlán de Antonio Carvajal',
    'Atlangatepec': 'Atlangatepec',
    'Atltzayanca': 'Atltzayanca',
    'Benito Juarez': 'Benito Juárez',
    
    // Zacatecas
    'Zacatecas': 'Zacatecas',
    'Fresnillo': 'Fresnillo',
    'Calera de Victor Rosales': 'Calera de Víctor Rosales',
    'Sombrerete': 'Sombrerete',
    'Loreto': 'Loreto',
    'Nochistlan de Mejia': 'Nochistlán de Mejía',
    'Jerez de Garcia Salinas': 'Jerez de García Salinas',
    'Rio Grande': 'Río Grande',
    'Ojocaliente': 'Ojocaliente',
    'Luis Moya': 'Luis Moya',
    'Genaro Codina': 'Genaro Codina',
    'General Enrique Estrada': 'General Enrique Estrada',
    'General Francisco R. Murguia': 'General Francisco R. Murguía',
    'General Panfilo Natera': 'General Pánfilo Natera',
    'Guadalupe': 'Guadalupe',
    'Huanusco': 'Huanusco',
    'Jalpa': 'Jalpa',
    'Jerez': 'Jerez',
    'Jimenez del Teul': 'Jiménez del Teul',
    'Juan Aldama': 'Juan Aldama',
    'Juchipila': 'Juchipila'
  }
  
  // Map the values
  const mappedCountry = countryMapping[address.country] || address.country
  const mappedState = stateMapping[address.state] || address.state
  const mappedCity = cityMapping[address.city] || address.city
  
  // Update location fields with mapped values
  profileData.country = mappedCountry
  profileData.state = mappedState
  profileData.city = mappedCity
  
  // Update the country/state/city selects to trigger dropdown updates
  onCountryChange(mappedCountry)
  onStateChange(mappedState)
  onCityChange(mappedCity)
  
  console.log('✅ Campos actualizados:', {
    addressLine1: profileData.addressLine1,
    addressLine2: profileData.addressLine2,
    city: profileData.city,
    state: profileData.state,
    country: profileData.country,
    postalCode: profileData.postalCode
  })
}

// Reactive state
const isEditing = ref(false)
const isEditingProfile = ref(false)
const isEditingPersonal = ref(false)
const isEditingEducation = ref(false)
const isEditingCredentials = ref(false)
const imageInput = ref<HTMLInputElement>()
const uidError = ref('')
const addressSearchQuery = ref('')

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
  presentationTitle: 'Fitness Coach',
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
    console.log('🔄 Guardando perfil...')
    console.log('📝 Datos a guardar:', {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      fullName: profileData.fullName,
      nickname: profileData.nickname,
      phone: profileData.phone,
      email: profileData.email,
      presentationTitle: profileData.presentationTitle
    })
    
    // First get the coach to find the correct document ID
    const coachResult = await getCoachByAuthUID(user.value.uid)
    if (!coachResult.success || !coachResult.coach) {
      console.error('❌ No se pudo encontrar el coach para guardar')
      return
    }
    
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
    
    console.log('💾 Actualizando coach con ID:', coachResult.coach.uid)
    console.log('📊 Datos de actualización:', updateData)
    
    // Save to coaches collection using the coach's document ID
    const result = await updateCoach(coachResult.coach.uid, updateData)
    
    if (result.success) {
      console.log('✅ Perfil guardado exitosamente')
    } else {
      console.error('❌ Error al guardar perfil:', result.error)
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

const handleDeleteImage = async () => {
  try {
    // Clear the image URL
    profileData.profileImageUrl = ''
    
    // Save the change to Firestore
    await saveProfile()
    
    console.log('✅ Imagen de perfil eliminada exitosamente')
  } catch (error) {
    console.error('Error deleting profile image:', error)
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

// Validate UID uniqueness
const validateUid = async () => {
  if (!profileData.uid || profileData.uid.trim() === '') {
    uidError.value = ''
    return
  }
  
  try {
    // Check if UID already exists in coaches collection
    const { getCoachById } = useCoaches()
    const result = await getCoachById(profileData.uid)
    
    if (result.success && result.coach) {
      // If found and it's not the current user, show error
      if (result.coach.uid !== user.value?.uid) {
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
      const fullName = result.coach.fullName || `${result.coach.firstName} ${result.coach.lastName}`.trim()
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      const updatedData = {
        fullName: fullName,
        firstName: result.coach.firstName || firstName,
        lastName: result.coach.lastName || lastName,
        nickname: result.coach.nickname || '',
        presentationTitle: result.coach.presentationTitle || 'Fitness Coach',
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