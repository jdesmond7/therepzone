<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-white">Programación de Rutinas</h1>
        <p class="text-slate-400">Gestiona y programa los entrenamientos de tus atletas.</p>
      </div>
      <div class="flex items-center gap-4">
        <button
          @click="viewMode = 'semana'"
          :class="viewMode === 'semana' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:text-white'"
          class="px-4 py-2 rounded-lg font-bold transition-colors"
        >
          Vista Semanal
        </button>
        <button
          @click="viewMode = 'mes'"
          :class="viewMode === 'mes' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:text-white'"
          class="px-4 py-2 rounded-lg font-bold transition-colors"
        >
          Vista Mensual
        </button>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex flex-col md:flex-row md:items-center gap-4">
      <!-- Client Selector -->
      <div class="w-full md:w-[300px]">
        <CustomSelect
          v-model="selectedClient"
          :options="clientOptions"
          placeholder="Seleccionar cliente"
          @update:model-value="loadClientProgramming"
        />
      </div>
      
      <!-- Create Programming Button -->
      <AppButtonPrimary
        @click="showCreateModal = true"
        :disabled="!selectedClient"
        icon="i-heroicons-plus"
      >
        Crear Programación
      </AppButtonPrimary>
    </div>

    <!-- Client Programming Display -->
    <div v-if="selectedClient" class="space-y-4">
      <!-- Instructional Text -->
      <div class="text-slate-400 text-sm">
        Los días que no tengan una rutina asignada se mostrarán como descanso para el atleta.
      </div>

      <!-- Weekly Schedule Grid -->
      <div class="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div v-for="(day, idx) in weekDays" :key="day" class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 min-h-[200px] flex flex-col">
          <div class="font-bold text-purple-300 mb-3">{{ day }}</div>
          <!-- Routines assigned to this day -->
          <div class="flex-1 flex flex-col gap-2">
            <div v-if="routinesByDay[day] && routinesByDay[day].length">
              <div v-for="routine in routinesByDay[day]" :key="routine.id" class="bg-slate-700/50 rounded-lg p-3 text-white border border-slate-600 hover:border-orange-500/50 transition-colors">
                <div class="font-semibold text-sm">{{ routine.title }}</div>
                <div class="text-xs text-slate-300 mt-1">{{ routine.description }}</div>
                <div class="flex items-center gap-2 mt-2">
                  <button 
                    @click="editRoutine(routine, day)"
                    class="text-xs bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded transition-colors"
                  >
                    Editar
                  </button>
                  <button 
                    @click="removeRoutine(routine, day)"
                    class="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-slate-400 text-sm italic flex-1 flex items-center justify-center">
              Descanso
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Note -->
      <div class="text-slate-400 text-sm">
        Puedes modificar el plan cuando lo necesites. ¡Flexibilidad total para tus atletas!
      </div>
    </div>

    <!-- No Client Selected State -->
    <div v-else class="text-center py-12">
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <UIcon name="i-heroicons-users" class="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-white mb-2">Selecciona un Cliente</h3>
        <p class="text-slate-400">Elige un cliente de la lista para ver y gestionar su programación de rutinas.</p>
      </div>
    </div>

    <!-- Create Programming Modal -->
    <transition name="modal-fade">
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="closeCreateModal"></div>
        <transition name="modal-slide">
          <div v-if="showCreateModal" @click.stop class="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-white">Crear Programación</h3>
                <button 
                  @click="closeCreateModal"
                  class="text-slate-400 hover:text-white cursor-pointer"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
                </button>
              </div>

              <div class="space-y-6">
                <!-- Programming Name -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Nombre de la Programación</label>
                  <AppInput
                    v-model="programmingForm.name"
                    placeholder="Ej: Programación Semanal de Fuerza"
                    required
                  />
                </div>

                <!-- Frequency -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Frecuencia</label>
                  <CustomSelect
                    v-model="programmingForm.frequency"
                    :options="frequencyOptions"
                    placeholder="Selecciona la frecuencia"
                  />
                </div>

                <!-- Start Date -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Fecha de Inicio</label>
                  <DatePickerInput
                    v-model="programmingForm.startDate"
                    placeholder="Selecciona la fecha de inicio"
                  />
                </div>

                <!-- Weekly Schedule -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Programación Semanal</label>
                  <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
                    <div v-for="day in weekDays" :key="day" class="space-y-2">
                      <div class="font-medium text-slate-300 text-sm">{{ day }}</div>
                                             <CustomSelect
                         v-model="programmingForm.schedule[day as 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes' | 'Sabado' | 'Domingo']"
                         :options="workoutOptions"
                         placeholder="Seleccionar rutina"
                         class="text-xs"
                       />
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Notas Adicionales</label>
                  <AppTextarea
                    v-model="programmingForm.notes"
                    :rows="3"
                    placeholder="Notas especiales para el cliente..."
                  />
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end gap-4 pt-4 border-t border-slate-700">
                  <AppButtonSecondary
                    @click="closeCreateModal"
                  >
                    Cancelar
                  </AppButtonSecondary>
                  <AppButtonPrimary
                    @click="saveProgramming"
                    :disabled="isSaving"
                  >
                    {{ isSaving ? 'Guardando...' : 'Guardar Programación' }}
                  </AppButtonPrimary>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useUsers, useWorkouts } from '~/composables/firestore'
import { useUserStore } from '~/stores/user'
import CustomSelect from '~/components/CustomSelect.vue'
import AppInput from '~/components/AppInput.vue'
import AppTextarea from '~/components/AppTextarea.vue'
import DatePickerInput from '~/components/DatePickerInput.vue'

const userStore = useUserStore()
const { user } = useAuth()

// State
const selectedClient = ref('')
const viewMode = ref('semana')
const showCreateModal = ref(false)
const isSaving = ref(false)
const clients = ref<any[]>([])
const workouts = ref<any[]>([])
const routinesByDay = ref<{ [key: string]: any[] }>({
  Lunes: [],
  Martes: [],
  Miercoles: [],
  Jueves: [],
  Viernes: [],
  Sabado: [],
  Domingo: []
})

// Form data
const programmingForm = reactive({
  name: '',
  frequency: '',
  startDate: '',
  schedule: {
    Lunes: '',
    Martes: '',
    Miercoles: '',
    Jueves: '',
    Viernes: '',
    Sabado: '',
    Domingo: ''
  },
  notes: ''
})

// Constants
const weekDays = [
  'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'
]

const frequencyOptions = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' }
]

// Computed
const clientOptions = computed(() => {
  return clients.value.map(client => ({
    value: client.id,
    label: client.fullName || client.nickname || client.email
  }))
})

const workoutOptions = computed(() => {
  return [
    { value: '', label: 'Descanso' },
    ...workouts.value.map(workout => ({
      value: workout.id,
      label: workout.title
    }))
  ]
})

// Methods
const loadClients = async () => {
  if (!user.value?.uid) return
  
  try {
    const { getClientsByCoach } = useUsers()
    const result = await getClientsByCoach(user.value.uid)
    
    if (result.success && result.clients) {
      clients.value = result.clients
    }
  } catch (error) {
    console.error('Error loading clients:', error)
  }
}

const loadWorkouts = async () => {
  if (!user.value?.uid) return
  
  try {
    const { getWorkoutsByCoach } = useWorkouts()
    const result = await getWorkoutsByCoach(user.value.uid)
    
    if (result.success && result.workouts) {
      workouts.value = result.workouts
    }
  } catch (error) {
    console.error('Error loading workouts:', error)
  }
}

const loadClientProgramming = async () => {
  if (!selectedClient.value) {
    routinesByDay.value = {
      Lunes: [],
      Martes: [],
      Miercoles: [],
      Jueves: [],
      Viernes: [],
      Sabado: [],
      Domingo: []
    }
    return
  }
  
  // TODO: Load client programming from database
  // For now, using placeholder data
  console.log('Loading programming for client:', selectedClient.value)
}

const editRoutine = (routine: any, day: string) => {
  // TODO: Implement edit routine functionality
  console.log('Edit routine:', routine, 'for day:', day)
}

const removeRoutine = (routine: any, day: string) => {
  // TODO: Implement remove routine functionality
  console.log('Remove routine:', routine, 'from day:', day)
}

const closeCreateModal = () => {
  showCreateModal.value = false
  // Reset form
  programmingForm.name = ''
  programmingForm.frequency = ''
  programmingForm.startDate = ''
  programmingForm.schedule = {
    Lunes: '',
    Martes: '',
    Miercoles: '',
    Jueves: '',
    Viernes: '',
    Sabado: '',
    Domingo: ''
  }
  programmingForm.notes = ''
}

const saveProgramming = async () => {
  if (!selectedClient.value || !user.value?.uid) return
  
  isSaving.value = true
  try {
    // TODO: Save programming to database
    console.log('Saving programming:', programmingForm)
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    closeCreateModal()
    await loadClientProgramming()
    
    console.log('✅ Programación guardada exitosamente')
  } catch (error) {
    console.error('Error saving programming:', error)
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadClients(),
    loadWorkouts()
  ])
})
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.35s cubic-bezier(0.4,0,0.2,1);
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-to, .modal-fade-leave-from {
  opacity: 1;
}
.modal-slide-enter-active {
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s cubic-bezier(0.4,0,0.2,1);
}
.modal-slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s cubic-bezier(0.4,0,0.2,1);
}
.modal-slide-enter-from {
  transform: translateY(-60vh);
  opacity: 0;
}
.modal-slide-leave-to {
  transform: translateY(-60vh);
  opacity: 0;
}
</style> 