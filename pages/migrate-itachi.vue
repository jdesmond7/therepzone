<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Migrar Itachi Uchiha a Staff
        </h1>
        <p class="text-gray-600">
          Migra específicamente al atleta Itachi Uchiha (itachi_uchiha_pUlgJ) a la colección de staff
        </p>
      </div>

      <!-- Status -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Estado de Itachi
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Athlete Status -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">Como Atleta</h3>
            <div v-if="athleteStatus" class="space-y-2">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full" :class="{
                  'bg-green-500': athleteStatus.exists,
                  'bg-red-500': !athleteStatus.exists
                }"></div>
                <span class="text-sm">
                  {{ athleteStatus.exists ? 'Encontrado' : 'No encontrado' }}
                </span>
              </div>
              <div v-if="athleteStatus.exists && athleteStatus.athlete" class="text-sm text-gray-600">
                <div><strong>Nombre:</strong> {{ athleteStatus.athlete.fullName }}</div>
                <div><strong>Email:</strong> {{ athleteStatus.athlete.email }}</div>
                <div><strong>UID:</strong> {{ athleteStatus.athlete.uid }}</div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">
              Verificando...
            </div>
          </div>

          <!-- Staff Status -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">Como Staff</h3>
            <div v-if="staffStatus" class="space-y-2">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full" :class="{
                  'bg-green-500': staffStatus.exists,
                  'bg-red-500': !staffStatus.exists
                }"></div>
                <span class="text-sm">
                  {{ staffStatus.exists ? 'Encontrado' : 'No encontrado' }}
                </span>
              </div>
              <div v-if="staffStatus.exists && staffStatus.staff" class="text-sm text-gray-600">
                <div><strong>Nombre:</strong> {{ staffStatus.staff.fullName }}</div>
                <div><strong>Email:</strong> {{ staffStatus.staff.email }}</div>
                <div><strong>UID:</strong> {{ staffStatus.staff.uid }}</div>
                <div><strong>Rol:</strong> {{ staffStatus.staff.role }}</div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">
              Verificando...
            </div>
          </div>
        </div>
      </div>

      <!-- Migration Action -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Acción de Migración
        </h2>
        
        <div class="space-y-4">
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              Migrar Itachi a Staff
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Migra a Itachi Uchiha de la colección de atletas a la colección de staff
            </p>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Rol de Staff
                </label>
                <select
                  v-model="selectedRole"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <button
                @click="migrateItachi"
                :disabled="isMigrating || !canMigrate"
                class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <span v-if="isMigrating">Migrando...</span>
                <span v-else>Migrar Itachi a Staff</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Migration Result -->
      <div v-if="migrationResult" class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Resultado de la Migración
        </h2>
        
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 rounded-full" :class="{
              'bg-green-500': migrationResult.success,
              'bg-red-500': !migrationResult.success
            }"></div>
            <span class="font-medium">
              {{ migrationResult.success ? 'Migración Exitosa' : 'Error en Migración' }}
            </span>
          </div>
          
          <div v-if="migrationResult.success" class="bg-green-50 p-4 rounded-lg">
            <div class="text-sm text-green-700">
              <div><strong>Staff UID:</strong> {{ migrationResult.staffId }}</div>
              <div><strong>Atleta Original:</strong> {{ migrationResult.originalAthleteId }}</div>
            </div>
          </div>
          
          <div v-if="!migrationResult.success" class="bg-red-50 p-4 rounded-lg">
            <div class="text-red-700">
              {{ migrationResult.error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { migrateAthleteToStaff } from '~/utils/migrate-to-staff'

// State
const isMigrating = ref(false)
const selectedRole = ref<'staff' | 'admin'>('staff')
const athleteStatus = ref<any>(null)
const staffStatus = ref<any>(null)
const migrationResult = ref<any>(null)

// Computed
const canMigrate = computed(() => {
  return athleteStatus.value?.exists && !staffStatus.value?.exists
})

// Check athlete status
const checkAthleteStatus = async () => {
  try {
    const { useAthletes } = await import('~/composables/athletes')
    const { getAthleteById } = useAthletes()
    
    const result = await getAthleteById('itachi_uchiha_pUlgJ')
    athleteStatus.value = {
      exists: result.success && result.athlete,
      athlete: result.athlete
    }
  } catch (error) {
    console.error('Error checking athlete status:', error)
    athleteStatus.value = { exists: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Check staff status
const checkStaffStatus = async () => {
  try {
    const { useStaff } = await import('~/composables/staff')
    const { getStaff } = useStaff()
    const result = await getStaff()
    
    if (result.success && result.staff) {
      const itachiStaff = result.staff.find((staff: any) => 
        staff.fullName?.toLowerCase().includes('itachi') || 
        staff.firstName?.toLowerCase().includes('itachi')
      )
      
      staffStatus.value = {
        exists: !!itachiStaff,
        staff: itachiStaff
      }
    } else {
      staffStatus.value = { exists: false }
    }
  } catch (error) {
    console.error('Error checking staff status:', error)
    staffStatus.value = { exists: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Migrate Itachi
const migrateItachi = async () => {
  isMigrating.value = true
  try {
    const result = await migrateAthleteToStaff('itachi_uchiha_pUlgJ', selectedRole.value)
    migrationResult.value = result
    
    if (result.success) {
      // Refresh status
      await checkAthleteStatus()
      await checkStaffStatus()
    }
  } catch (error) {
    console.error('Migration error:', error)
    migrationResult.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    isMigrating.value = false
  }
}

// Load data on mount
onMounted(async () => {
  await checkAthleteStatus()
  await checkStaffStatus()
})
</script> 