<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Migración a Colección Staff
        </h1>
        <p class="text-gray-600">
          Migra coaches existentes a la nueva colección de staff con UIDs personalizados
        </p>
      </div>

      <!-- Migration Status -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Estado de la Migración
        </h2>
        
        <div v-if="migrationStatus" class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 rounded-full" :class="{
              'bg-green-500': migrationStatus.success,
              'bg-red-500': !migrationStatus.success
            }"></div>
            <span class="font-medium">
              {{ migrationStatus.success ? 'Migración Completada' : 'Error en Migración' }}
            </span>
          </div>
          
          <div v-if="migrationStatus.success" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-green-600">
                {{ migrationStatus.migrated }}
              </div>
              <div class="text-sm text-green-700">Migrados Exitosamente</div>
            </div>
            <div v-if="migrationStatus.errors > 0" class="bg-red-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-red-600">
                {{ migrationStatus.errors }}
              </div>
              <div class="text-sm text-red-700">Errores</div>
            </div>
          </div>
          
          <div v-if="!migrationStatus.success" class="bg-red-50 p-4 rounded-lg">
            <div class="text-red-700">
              {{ migrationStatus.error }}
            </div>
          </div>
        </div>
        
        <div v-else class="text-gray-500">
          No se ha ejecutado ninguna migración
        </div>
      </div>

      <!-- Migration Actions -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Acciones de Migración
        </h2>
        
        <div class="space-y-4">
          <!-- Migrate Specific Athlete -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              Migrar Atleta Específico
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Migra un atleta específico a la colección de staff
            </p>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  ID del Atleta
                </label>
                <input
                  v-model="athleteToMigrate.athleteId"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="itachi_uchiha_pUlgJ"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Rol de Staff
                </label>
                <select
                  v-model="athleteToMigrate.role"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <button
                @click="migrateSpecificAthlete"
                :disabled="isMigratingAthlete"
                class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <span v-if="isMigratingAthlete">Migrando...</span>
                <span v-else>Migrar Atleta</span>
              </button>
            </div>
          </div>

          <!-- Migrate All Coaches -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              Migrar Todos los Coaches
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Migra todos los coaches existentes a la colección de staff con UIDs personalizados
            </p>
            <button
              @click="migrateAllCoaches"
              :disabled="isMigrating"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <span v-if="isMigrating">Migrando...</span>
              <span v-else>Migrar Coaches</span>
            </button>
          </div>

          <!-- Create Single Staff Member -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              Crear Miembro de Staff Individual
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Crea un nuevo miembro de staff manualmente
            </p>
            
            <form @submit.prevent="createStaffMember" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    v-model="newStaff.firstName"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    v-model="newStaff.lastName"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Apellido"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    v-model="newStaff.email"
                    type="email"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    v-model="newStaff.phone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  v-model="newStaff.role"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <button
                type="submit"
                :disabled="isCreating"
                class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <span v-if="isCreating">Creando...</span>
                <span v-else>Crear Staff</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Staff List -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Miembros de Staff Existentes
        </h2>
        
        <div v-if="staffMembers.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UID
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="staff in staffMembers" :key="staff.uid">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ staff.fullName }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ staff.email }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="{
                    'bg-blue-100 text-blue-800': staff.role === 'staff',
                    'bg-purple-100 text-purple-800': staff.role === 'admin'
                  }">
                    {{ staff.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500 font-mono">
                    {{ staff.uid }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          No hay miembros de staff registrados
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { migrateCoachesToStaff, migrateAthleteToStaff, createStaffMember as createStaffMemberUtil } from '~/utils/migrate-to-staff'
import { useStaff } from '~/composables/staff'

// State
const isMigrating = ref(false)
const isMigratingAthlete = ref(false)
const isCreating = ref(false)
const migrationStatus = ref<any>(null)
const staffMembers = ref<any[]>([])

const newStaff = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'staff' as 'staff' | 'admin'
})

const athleteToMigrate = ref({
  athleteId: 'itachi_uchiha_pUlgJ',
  role: 'staff' as 'staff' | 'admin'
})

// Load staff members
const loadStaffMembers = async () => {
  try {
    const { getStaff } = useStaff()
    const result = await getStaff()
    if (result.success && result.staff) {
      staffMembers.value = result.staff
    }
  } catch (error) {
    console.error('Error loading staff members:', error)
  }
}

// Migrate specific athlete to staff
const migrateSpecificAthlete = async () => {
  isMigratingAthlete.value = true
  try {
    const result = await migrateAthleteToStaff(athleteToMigrate.value.athleteId, athleteToMigrate.value.role)
    migrationStatus.value = result
    if (result.success) {
      await loadStaffMembers()
    }
  } catch (error) {
    console.error('Migration error:', error)
    migrationStatus.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    isMigratingAthlete.value = false
  }
}

// Migrate all coaches to staff
const migrateAllCoaches = async () => {
  isMigrating.value = true
  try {
    const result = await migrateCoachesToStaff()
    migrationStatus.value = result
    if (result.success) {
      await loadStaffMembers()
    }
  } catch (error) {
    console.error('Migration error:', error)
    migrationStatus.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    isMigrating.value = false
  }
}

// Create single staff member
const createStaffMember = async () => {
  isCreating.value = true
  try {
    const result = await createStaffMemberUtil(newStaff.value)
    if (result.success) {
      // Reset form
      newStaff.value = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'staff'
      }
      // Reload staff list
      await loadStaffMembers()
    }
  } catch (error) {
    console.error('Error creating staff member:', error)
  } finally {
    isCreating.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadStaffMembers()
})
</script> 