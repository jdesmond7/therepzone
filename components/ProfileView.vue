<template>
    <div class="min-h-screen flex items-start justify-center px-4 mt-12">
      <div class="w-full max-w-2xl flex justify-center">
        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 w-full min-h-[700px] flex flex-col justify-start">
          <h2 class="text-3xl font-black text-white mb-2 text-center">Mi información</h2>
          <p class="text-slate-400 text-center mb-8">Aquí puedes editar tu información</p>
          <!-- Tabs de navegación de secciones -->
          <Tabs v-model="activeTab" :options="[
            { value: 'personales', label: 'Información Personal' },
            { value: 'metricas', label: 'Métricas Corporales' },
            { value: 'ajustes', label: 'Ajustes Generales' }
          ]" />
          <form v-if="activeTab === 'personales'" @submit.prevent="guardarPerfil" class="space-y-6 mt-12">
            <!-- Nombre -->
            <div>
              <label class="block text-sm font-bold text-white mb-2">Nombre(s)</label>
              <input v-model="form.nombres" type="text" class="w-full pl-4 pr-8 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent" placeholder="Tu nombre" />
            </div>
            <!-- Apellido -->
            <div>
              <label class="block text-sm font-bold text-white mb-2">Apellido(s)</label>
              <input v-model="form.apellidos" type="text" class="w-full pl-4 pr-8 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent" placeholder="Tus apellidos" />
            </div>
            <!-- Apodo -->
            <div>
              <label class="block text-sm font-bold text-white mb-2">Apodo</label>
              <input v-model="form.apodo" type="text" class="w-full pl-4 pr-8 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent" placeholder="¿Cómo te gusta que te llamen?" />
            </div>
            <!-- Fecha de nacimiento -->
            <div>
              <label class="block text-sm font-bold text-white mb-2">Fecha de nacimiento</label>
              <DatePickerInput v-model="form.cumple" />
            </div>
            <!-- País -->
            <div>
              <label class="block text-sm font-bold text-white mb-2">País</label>
              <CustomSelect v-model="form.pais" :options="countryOptions" placeholder="Selecciona tu país" @update:model-value="onCountryChange" />
            </div>
            <!-- Ciudad -->
            <div>
              <label class="block text-sm font-bold text-white mb-2">Ciudad</label>
              <CustomSelect v-model="form.ciudad" :options="cityOptions" placeholder="Primero selecciona un país" :disabled="!form.pais" />
            </div>
            <!-- Número de teléfono -->
            <div>
              <label class="block text-sm font-bold text-white mb-2">Número de teléfono</label>
              <input v-model="form.telefono" type="number" class="w-full pl-4 pr-8 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent" placeholder="Tu número" />
            </div>
            <!-- Género -->
            <div>
              <label class="block text-sm font-bold text-white mb-2">Género</label>
              <div class="grid grid-cols-3 gap-3">
                <button type="button" @click="form.genero = 'masculino'" :class="form.genero === 'masculino' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'" class="h-[52px] w-full rounded-lg font-medium transition-colors">Masculino</button>
                <button type="button" @click="form.genero = 'femenino'" :class="form.genero === 'femenino' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'" class="h-[52px] w-full rounded-lg font-medium transition-colors">Femenino</button>
                <button type="button" @click="form.genero = 'otro'" :class="form.genero === 'otro' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'" class="h-[52px] w-full rounded-lg font-medium transition-colors">Otro</button>
              </div>
            </div>
            <!-- Guardar -->
            <div class="mt-10">
              <button type="submit" :disabled="!formChanged() || isSaving" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]">
                <UIcon v-if="isSaving" name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
                Guardar Cambios
              </button>
            </div>
          </form>
          <!-- En Métricas Corporales -->
          <div v-if="activeTab === 'metricas'" class="py-6 mt-6">
            <div class="grid grid-cols-1 gap-2">
              <!-- Peso -->
              <div class="mb-4">
                <label class="block text-sm font-bold text-white mb-2">Peso</label>
                <div class="relative">
                  <input v-model.number="form.peso" type="number" min="0" class="w-full pl-4 pr-14 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent" placeholder="Peso" />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">Kg</span>
                </div>
              </div>
              <!-- Estatura -->
              <div class="mb-4">
                <label class="block text-sm font-bold text-white mb-2">Estatura</label>
                <div class="relative">
                  <input v-model="estaturaDisplay" type="number" min="0" class="w-full pl-4 pr-14 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent" placeholder="Estatura" />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">cm</span>
                </div>
              </div>
              <!-- Resto de métricas -->
              <div v-for="m in metricas" :key="m.key" class="mb-4">
                <label class="block text-sm font-bold text-white mb-2">{{ m.label }}</label>
                <div class="relative">
                  <input
                    v-model.number="form.medidas[m.key]"
                    type="number"
                    min="0"
                    class="w-full px-4 pr-14 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">
                    cm
                  </span>
                </div>
              </div>
            </div>
            <div class="flex justify-end mt-10">
              <button type="button" @click="guardarMetricas" :disabled="!metricasChanged" class="w-full bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">
                Guardar Cambios
              </button>
            </div>
          </div>

          <!-- En Ajustes Generales -->
          <div v-if="activeTab === 'ajustes'" class="py-6 mt-6">
            <div class="grid grid-cols-1 gap-6">
              <!-- Contraseña -->
              <div>
                <label class="block text-mb font-bold text-white mb-6">Contraseña</label>
                <button type="button" v-if="!showPasswordFields" @click="showPasswordFields = true" class="w-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition rounded-lg px-4 py-2 mb-2 bg-transparent">
                  Cambiar Contraseña
                </button>
                <div v-if="showPasswordFields" class="space-y-3 mt-2">
                  <label class="block text-sm font-bold text-white mb-2">Contraseña actual</label>
                  <PasswordInput v-model="passwordForm.current" placeholder="Contraseña actual" class="w-full bg-slate-900 text-white rounded-lg px-4 py-2 border border-slate-700 focus:outline-none h-[50px]" />
                  <label class="block text-sm font-bold text-white mb-2">Nueva contraseña</label>
                  <PasswordInput v-model="passwordForm.new" placeholder="Nueva contraseña" class="w-full bg-slate-900 text-white rounded-lg px-4 py-2 border border-slate-700 focus:outline-none h-[50px]" />
                  <label class="block text-sm font-bold text-white mb-2">Confirmar nueva contraseña</label>
                  <PasswordInput v-model="passwordForm.confirm" placeholder="Confirmar nueva contraseña" class="w-full bg-slate-900 text-white rounded-lg px-4 py-2 border border-slate-700 focus:outline-none h-[50px]" />
                  <div v-if="passwordError" class="text-red-500 text-xs">{{ passwordError }}</div>
                </div>
              </div>
              <!-- Correo electrónico -->
              <div>
                <label class="block text-sm font-bold text-white mb-2">Correo electrónico</label>
                <div class="relative flex items-center">
                  <input v-model="editableEmail" :disabled="!isEditingEmail" type="email" class="w-full pl-4 pr-24 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white min-h-[48px]" />
                  <button v-if="!isEditingEmail" @click="enableEmailEdit" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 border border-orange-500 text-orange-500 bg-transparent hover:bg-orange-500 hover:text-white font-bold py-1 px-4 rounded-lg transition-colors">Editar</button>
                </div>
              </div>
              <!-- Unidades -->
              <div>
                <label class="block text-sm font-bold text-white mb-2">Unidad de peso</label>
                <Tabs v-model="userStore.unidadPesoGlobal" :options="[{ value: 'kg', label: 'kg' }, { value: 'lbs', label: 'lbs' }]" />
              </div>
              <div>
                <label class="block text-sm font-bold text-white mb-2">Unidad de distancia</label>
                <Tabs v-model="userStore.unidadDistanciaGlobal" :options="[{ value: 'km', label: 'km' }, { value: 'mi', label: 'mi' }]" />
              </div>
              <div>
                <label class="block text-sm font-bold text-white mb-2">Unidad de altura</label>
                <Tabs v-model="userStore.unidadEstaturaGlobal" :options="[{ value: 'cm', label: 'cm' }, { value: 'in', label: 'in' }]" />
              </div>
              <div>
                <label class="block text-sm font-bold text-white mb-2">Primer día de la semana</label>
                <CustomSelect v-model="primerDiaSemana" :options="[ { value: 'domingo', label: 'Domingo' }, { value: 'lunes', label: 'Lunes' } ]" placeholder="Selecciona el día" />
              </div>
            </div>
            <div class="flex justify-end mt-10">
              <button type="button"
                @click="guardarAjustes"
                :disabled="!ajustesChanged && !passwordFieldsFilled"
                class="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useAuth } from '~/composables/firebase'
import { useUsers } from '~/composables/firestore'
import { useFirebaseStorage } from '~/composables/firebase-storage'
import UIcon from '~/components/GlobalLoading.vue'
import CustomSelect from '~/components/CustomSelect.vue'
import DatePickerInput from '~/components/DatePickerInput.vue'
import { useCountryCitySelect } from '~/composables/useCountryCitySelect'
import { isEqual } from 'lodash-es'
import { useUserStore } from '~/stores/user'
import { toast } from 'vue3-toastify'
import Tabs from '~/components/Tabs.vue'

const userStore = useUserStore()
const showPasswordFields = ref(false)
const passwordForm = ref({ current: '', new: '', confirm: '' })
const passwordError = ref('')
const defaultAvatar = '/images/default-avatar.png'
const { user } = useAuth()
const { getUserById, updateUser, saveUserMetricHistory } = useUsers()
const { uploadProfileImage } = useFirebaseStorage()

const activeTab = ref<'personales' | 'metricas' | 'ajustes'>('personales')
const isSaving = ref(false)
const fileInput = ref<HTMLInputElement>()

// Unidades globales desde Pinia
const unidadPesoGlobal = computed(() => userStore.unidadPesoGlobal)
const unidadEstaturaGlobal = computed(() => userStore.unidadEstaturaGlobal)

// Conversión automática de valores
watch(unidadPesoGlobal, (newUnidad, oldUnidad) => {
  if (oldUnidad && newUnidad && newUnidad !== oldUnidad) {
    if (newUnidad === 'kg' && oldUnidad === 'lbs' && form.peso != null) {
      form.peso = +(form.peso / 2.20462).toFixed(2)
    } else if (newUnidad === 'lbs' && oldUnidad === 'kg' && form.peso != null) {
      form.peso = +(form.peso * 2.20462).toFixed(2)
    }
  }
})
watch(unidadEstaturaGlobal, (newUnidad, oldUnidad) => {
  if (oldUnidad && newUnidad && newUnidad !== oldUnidad) {
    if (newUnidad === 'cm' && oldUnidad === 'in' && form.estatura != null) {
      form.estatura = +(form.estatura * 2.54).toFixed(2)
    } else if (newUnidad === 'in' && oldUnidad === 'cm' && form.estatura != null) {
      form.estatura = +(form.estatura / 2.54).toFixed(2)
    }
  }
})

// Para cambio de contraseña
const isSendingReset = ref(false)
const resetSent = ref(false)
const sendPasswordReset = async () => {
  if (!form.email) return
  isSendingReset.value = true
  resetSent.value = false
  try {
    const { sendPasswordResetEmail } = await import('firebase/auth')
    const { auth } = await import('~/composables/firebase')
    await sendPasswordResetEmail(auth, form.email)
    resetSent.value = true
  } catch (e) {
    resetSent.value = false
    // Puedes mostrar un toast o mensaje de error
  } finally {
    isSendingReset.value = false
  }
}

// Métricas/circunferencias
const metricas = [
  { key: 'pesoCorporal', label: 'Peso Corporal' },
  { key: 'cintura', label: 'Cintura' },
  { key: 'grasaCorporal', label: 'Grasa Corporal (%)' },
  { key: 'cuello', label: 'Cuello' },
  { key: 'hombro', label: 'Hombro' },
  { key: 'pecho', label: 'Pecho' },
  { key: 'bicepsIzq', label: 'Bíceps Izquierdo' },
  { key: 'bicepsDer', label: 'Bíceps Derecho' },
  { key: 'antebrazoIzq', label: 'Antebrazo Izquierdo' },
  { key: 'antebrazoDer', label: 'Antebrazo Derecho' },
  { key: 'abdomen', label: 'Abdomen' },
  { key: 'caderas', label: 'Caderas' },
  { key: 'musloIzq', label: 'Muslo Izquierdo' },
  { key: 'musloDer', label: 'Muslo Derecho' },
  { key: 'gemeloIzq', label: 'Gemelo Izquierda' },
  { key: 'gemeloDer', label: 'Gemelo Derecha' }
]

const form = reactive({
  foto: '',
  nombres: '',
  apellidos: '',
  apodo: '',
  email: '',
  telefono: '',
  cumple: '',
  pais: '',
  ciudad: '',
  genero: '',
  peso: null,
  estatura: null,
  medidas: {} as Record<string, number|null>
})

let originalPhotoUrl = ''

// País y ciudad reactivos y lógica dependiente
const selectedCountry = ref('')
const selectedCity = ref('')
const { countryOptions, cityOptions, onCountryChange } = useCountryCitySelect(selectedCountry, selectedCity)

watch(() => form.pais, (val) => { selectedCountry.value = val })
watch(() => form.ciudad, (val) => { selectedCity.value = val })
watch(selectedCountry, (val) => { form.pais = val })
watch(selectedCity, (val) => { form.ciudad = val })

const initialForm = ref({ ...form })

function formChanged() {
  // Compara el form actual con el inicial, ignorando unidades de peso/estatura
  const clean = (obj: any) => {
    const { unidadPeso, unidadEstatura, ...rest } = obj
    return rest
  }
  return !isEqual(clean(form), clean(initialForm.value))
}

watch(form, () => {}, { deep: true }) // Para reactividad

const cargarPerfil = async () => {
  console.log('UID actual:', user.value?.uid)
  if (!user.value?.uid) {
    console.log('No UID de usuario');
    return;
  }
  const result = await getUserById(user.value.uid);
  console.log('Resultado getUserById:', result);
  if (result.success && result.user) {
    console.log('Usuario recibido:', result.user);
    const u: any = result.user;
    const f: any = form;
    const fieldMap = {
      nombres: 'firstName',
      apellidos: 'lastName',
      apodo: 'nickname',
      email: 'email',
      telefono: 'phone',
      cumple: 'birthDate',
      pais: 'country',
      ciudad: 'city',
      genero: 'gender',
      peso: 'peso',
      estatura: 'estatura',
      foto: ['profilePhoto', 'profileImageUrl'],
      medidas: 'medidas'
    };
    for (const [formKey, firestoreKey] of Object.entries(fieldMap)) {
      if (Array.isArray(firestoreKey)) {
        f[formKey] = firestoreKey.map(k => u[k]).find((v: any) => !!v) || '';
      } else if (formKey === 'medidas') {
        f.medidas = u.medidas ? { ...u.medidas } : {};
      } else {
        f[formKey] = u[firestoreKey] ?? (typeof f[formKey] === 'number' ? null : '');
      }
    }
    originalPhotoUrl = form.foto || '';
    // Sincronizar selects dependientes
    selectedCountry.value = form.pais
    selectedCity.value = form.ciudad
    initialForm.value = { ...form }
    console.log('Datos asignados a form:', JSON.parse(JSON.stringify(form)));
  } else {
    console.log('No se encontró usuario o error:', result.error);
  }
}

onMounted(cargarPerfil)
watch(() => user.value?.uid, (newUid) => {
  if (newUid) cargarPerfil()
})

const onImageChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !user.value?.uid) return
  // Subir imagen a Firebase Storage
  const upload = await uploadProfileImage(file, user.value.uid, form.nombres || 'usuario')
  if (upload.success) {
    form.foto = upload.url
  }
}

const guardarPerfil = async () => {
  if (!user.value?.uid) return
  isSaving.value = true
  try {
    // Construir objeto de actualización
    const updates: any = {
      firstName: form.nombres,
      lastName: form.apellidos,
      fullName: `${form.nombres} ${form.apellidos}`.trim(),
      nickname: form.apodo,
      email: form.email,
      phone: form.telefono,
      birthDate: form.cumple,
      country: form.pais,
      city: form.ciudad,
      gender: form.genero,
      peso: form.peso,
      estatura: form.estatura,
      medidas: form.medidas,
      profilePhoto: form.foto || originalPhotoUrl
    }
    await userStore.updateUserProfile(user.value.uid, updates)
    toast.success('Cambios guardados correctamente')
  } finally {
    isSaving.value = false
  }
}

const primerDiaSemana = ref('domingo')

// Mostrar estatura en pies/pulgadas si la unidad es in
const estaturaDisplay = computed({
  get() {
    if (unidadEstaturaGlobal.value === 'in' && form.estatura != null) {
      const totalInches = form.estatura
      const feet = Math.floor(totalInches / 12)
      const inches = Math.round(totalInches % 12)
      return `${feet}' ${inches}\"`
    }
    return form.estatura
  },
  set(val) {
    if (unidadEstaturaGlobal.value === 'in') {
      // Permitir entrada directa en pulgadas
      form.estatura = Number(val)
    } else {
      form.estatura = Number(val)
    }
  }
})

// Lógica para detectar cambios en ajustes generales
const ajustesOriginales = ref({
  unidadPeso: userStore.unidadPesoGlobal,
  unidadDistancia: userStore.unidadDistanciaGlobal,
  unidadEstatura: userStore.unidadEstaturaGlobal,
  primerDiaSemana: 'domingo',
})
const isEditingEmail = ref(false)
const editableEmail = ref(form.email)
watch(() => form.email, val => { if (!isEditingEmail.value) editableEmail.value = val })
const enableEmailEdit = () => { isEditingEmail.value = true }
const ajustesChanged = computed(() => {
  return (
    userStore.unidadPesoGlobal !== ajustesOriginales.value.unidadPeso ||
    userStore.unidadDistanciaGlobal !== ajustesOriginales.value.unidadDistancia ||
    userStore.unidadEstaturaGlobal !== ajustesOriginales.value.unidadEstatura ||
    primerDiaSemana.value !== ajustesOriginales.value.primerDiaSemana ||
    (isEditingEmail.value && editableEmail.value !== form.email)
  )
})

// Lógica para detectar cambios en métricas
const metricasOriginales = ref({ ...form.medidas })
const metricasChanged = computed(() => {
  return !isEqual(form.medidas, metricasOriginales.value)
})

const passwordFieldsFilled = computed(() => {
  return (
    showPasswordFields.value &&
    !!passwordForm.value.current &&
    !!passwordForm.value.new &&
    !!passwordForm.value.confirm
  )
})

const guardarAjustes = async () => {
  passwordError.value = ''
  // Validar y actualizar contraseña si corresponde
  if (showPasswordFields.value) {
    if (!passwordForm.value.current || !passwordForm.value.new || !passwordForm.value.confirm) {
      passwordError.value = 'Completa todos los campos de contraseña.'
      return
    }
    if (passwordForm.value.new !== passwordForm.value.confirm) {
      passwordError.value = 'Las contraseñas no coinciden.'
      return
    }
    // Aquí va la lógica para actualizar la contraseña en Firebase
    try {
      await userStore.updatePassword(passwordForm.value.current, passwordForm.value.new)
      showPasswordFields.value = false
      passwordForm.value = { current: '', new: '', confirm: '' }
      toast.success('Cambios guardados correctamente')
    } catch (e: any) {
      passwordError.value = e.message || 'Error al actualizar la contraseña.'
      return
    }
  }
  // Guardar preferencias de unidades localmente (en el store)
  userStore.userProfile.unidadPeso = userStore.unidadPesoGlobal
  userStore.userProfile.unidadEstatura = userStore.unidadEstaturaGlobal
  userStore.userProfile.unidadDistancia = userStore.unidadDistanciaGlobal
  // Si quieres persistir en Firestore, puedes hacerlo aquí
  if (isEditingEmail.value && editableEmail.value !== form.email) {
    form.email = editableEmail.value
    isEditingEmail.value = false
  }
  toast.success('Cambios guardados correctamente')
}
const guardarMetricas = async () => {
  if (!user.value?.uid) return
  // Guardar métricas actuales (si es necesario)
  // Guardar histórico en subcolección
  await saveUserMetricHistory(user.value.uid, form.medidas)
  metricasOriginales.value = { ...form.medidas }
  toast.success('Cambios guardados correctamente')
}
</script> 