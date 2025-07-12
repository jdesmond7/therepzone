<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
    <div class="max-w-2xl w-full mx-auto py-8 px-4">
      <h1 class="text-3xl font-black text-white mb-6">Mi Perfil</h1>
      <!-- Tabs -->
      <div class="flex w-full rounded-lg bg-slate-900 border border-slate-600 p-1 mb-8">
        <button
          type="button"
          @click="activeTab = 'personales'"
          :class="[
            'flex-1 py-2 px-4 text-base font-medium rounded-md transition-colors',
            activeTab === 'personales' 
              ? 'text-white bg-orange-600 border border-orange-600' 
              : 'text-slate-400 hover:text-slate-200'
          ]"
        >
          Datos Personales
        </button>
        <button
          type="button"
          @click="activeTab = 'medidas'"
          :class="[
            'flex-1 py-2 px-4 text-base font-medium rounded-md transition-colors',
            activeTab === 'medidas' 
              ? 'text-white bg-orange-600 border border-orange-600' 
              : 'text-slate-400 hover:text-slate-200'
          ]"
        >
          Medidas Corporales
        </button>
      </div>

      <!-- Tab Content -->
      <div v-if="activeTab === 'personales'" class="space-y-10">
        <!-- Información de Cuenta -->
        <section>
          <h2 class="text-lg font-bold text-slate-300 mb-4">Información de Cuenta</h2>
          <div class="flex items-center gap-6 mb-6">
            <div class="relative w-24 h-24">
              <img :src="form.foto || defaultAvatar" alt="Foto de perfil" class="w-24 h-24 rounded-full object-cover border-4 border-slate-700" />
              <input type="file" accept="image/*" class="hidden" ref="fileInput" @change="onImageChange" />
              <button @click="fileInput?.click()" class="absolute bottom-0 right-0 bg-orange-600 hover:bg-orange-700 text-white rounded-full p-2 shadow-lg">
                <UIcon name="i-heroicons-camera" class="w-5 h-5" />
              </button>
            </div>
            <div>
              <p class="text-slate-400 text-sm mb-1">Correo electrónico</p>
              <p class="text-white font-bold">{{ form.email }}</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-white mb-2">Nombre(s)</label>
              <input v-model="form.nombres" type="text" class="w-full px-4 pr-8 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600" placeholder="Tu nombre" />
            </div>
            <div>
              <label class="block text-sm font-bold text-white mb-2">Apellido(s)</label>
              <input v-model="form.apellidos" type="text" class="w-full px-4 pr-8 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600" placeholder="Tus apellidos" />
            </div>
            <div>
              <label class="block text-sm font-bold text-white mb-2">Apodo</label>
              <input v-model="form.apodo" type="text" class="w-full px-4 pr-8 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600" placeholder="¿Cómo te gusta que te llamen?" />
            </div>
            <div>
              <label class="block text-sm font-bold text-white mb-2">Número de teléfono</label>
              <input v-model="form.telefono" type="tel" class="w-full px-4 pr-8 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600" placeholder="Tu número" />
            </div>
            <div>
              <label class="block text-sm font-bold text-white mb-2">Fecha de cumpleaños</label>
              <input v-model="form.cumple" type="date" class="w-full px-4 pr-8 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600" />
            </div>
            <div>
              <label class="block text-sm font-bold text-white mb-2">País</label>
              <input v-model="form.pais" type="text" class="w-full px-4 pr-8 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600" placeholder="País" />
            </div>
            <div>
              <label class="block text-sm font-bold text-white mb-2">Ciudad</label>
              <input v-model="form.ciudad" type="text" class="w-full px-4 pr-8 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600" placeholder="Ciudad" />
            </div>
          </div>
        </section>

        <!-- Información Física -->
        <section>
          <h2 class="text-lg font-bold text-slate-300 mb-4">Información Física</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-bold text-white mb-2">Género</label>
              <div class="flex gap-2">
                <button v-for="g in generos" :key="g" @click="form.genero = g" :class="form.genero === g ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'" class="py-2 px-4 rounded-lg font-medium transition-colors">
                  {{ g.charAt(0).toUpperCase() + g.slice(1) }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-bold text-white mb-2">Peso</label>
              <div class="flex gap-2 items-center">
                <input v-model.number="form.peso" type="number" min="0" class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600" placeholder="Peso" />
                <div class="flex bg-slate-800 rounded-lg overflow-hidden border border-slate-600">
                  <button @click="unidadPeso = 'kg'" :class="unidadPeso === 'kg' ? 'bg-orange-600 text-white' : 'text-slate-400'" class="px-3 py-1 font-bold">kg</button>
                  <button @click="unidadPeso = 'lbs'" :class="unidadPeso === 'lbs' ? 'bg-orange-600 text-white' : 'text-slate-400'" class="px-3 py-1 font-bold">lbs</button>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-bold text-white mb-2">Estatura</label>
              <div class="flex gap-2 items-center">
                <input v-model.number="form.estatura" type="number" min="0" class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600" placeholder="Estatura" />
                <div class="flex bg-slate-800 rounded-lg overflow-hidden border border-slate-600">
                  <button @click="unidadEstatura = 'cm'" :class="unidadEstatura === 'cm' ? 'bg-orange-600 text-white' : 'text-slate-400'" class="px-3 py-1 font-bold">cm</button>
                  <button @click="unidadEstatura = 'in'" :class="unidadEstatura === 'in' ? 'bg-orange-600 text-white' : 'text-slate-400'" class="px-3 py-1 font-bold">in</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Medidas Corporales -->
      <div v-else class="space-y-10">
        <section>
          <h2 class="text-lg font-bold text-slate-300 mb-4">Medidas Corporales</h2>
          <div class="flex justify-end mb-4">
            <div class="flex bg-slate-800 rounded-lg overflow-hidden border border-slate-600">
              <button @click="unidadMedidas = 'cm'" :class="unidadMedidas === 'cm' ? 'bg-orange-600 text-white' : 'text-slate-400'" class="px-3 py-1 font-bold">cm</button>
              <button @click="unidadMedidas = 'in'" :class="unidadMedidas === 'in' ? 'bg-orange-600 text-white' : 'text-slate-400'" class="px-3 py-1 font-bold">in</button>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="m in medidas" :key="m.key">
              <label class="block text-sm font-bold text-white mb-2">{{ m.label }}</label>
              <input v-model.number="form.medidas[m.key]" type="number" min="0" class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600" :placeholder="m.label" />
            </div>
          </div>
        </section>
      </div>

      <!-- Guardar -->
      <div class="flex justify-end mt-10">
        <button @click="guardarPerfil" :disabled="isSaving" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
          <UIcon v-if="isSaving" name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
          <span v-else>Guardar Cambios</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '~/composables/firebase'
import { useUsers } from '~/composables/firestore'
import UIcon from '~/components/GlobalLoading.vue'

const defaultAvatar = '/images/default-avatar.png'
const { user } = useAuth()
const { getUserById, updateUser } = useUsers()

const activeTab = ref<'personales' | 'medidas'>('personales')
const isSaving = ref(false)
const fileInput = ref<HTMLInputElement>()

const generos = ['masculino', 'femenino', 'otro']
const unidadPeso = ref<'kg' | 'lbs'>('kg')
const unidadEstatura = ref<'cm' | 'in'>('cm')
const unidadMedidas = ref<'cm' | 'in'>('cm')

const medidas = [
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

const onImageChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  // Aquí puedes agregar lógica para subir la imagen a Firebase Storage
  // y actualizar form.foto con la URL
}

const guardarPerfil = async () => {
  isSaving.value = true
  try {
    // Aquí va la lógica para guardar los datos en Firestore
    // await updateUser(user.value.uid, { ...form })
  } finally {
    isSaving.value = false
  }
}
</script> 