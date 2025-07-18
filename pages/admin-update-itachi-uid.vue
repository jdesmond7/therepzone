<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">
          Actualizar UID de Itachi
        </h1>
        
        <!-- Estado actual -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Estado Actual</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-gray-700 mb-2">Como Staff</h3>
              <div v-if="itachiStaff" class="space-y-2">
                <p><span class="font-medium">Nombre:</span> {{ itachiStaff.fullName }}</p>
                <p><span class="font-medium">Email:</span> {{ itachiStaff.email }}</p>
                <p><span class="font-medium">UID Actual:</span> 
                  <code class="bg-gray-200 px-2 py-1 rounded text-sm">{{ itachiStaff.uid }}</code>
                </p>
                <p><span class="font-medium">Rol:</span> {{ itachiStaff.role }}</p>
              </div>
              <div v-else class="text-gray-500">
                No encontrado como staff
              </div>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-gray-700 mb-2">Nuevo UID</h3>
              <div v-if="newUid" class="space-y-2">
                <p><span class="font-medium">Formato:</span> firstName_lastName_5digitAuthUid</p>
                <p><span class="font-medium">Nuevo UID:</span> 
                  <code class="bg-blue-100 px-2 py-1 rounded text-sm text-blue-800">{{ newUid }}</code>
                </p>
              </div>
              <div v-else class="text-gray-500">
                Calculando nuevo UID...
              </div>
            </div>
          </div>
        </div>
        
        <!-- Acción de actualización -->
        <div class="border-t pt-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Actualizar UID</h2>
          <p class="text-gray-600 mb-4">
            Cambia el UID de Itachi del formato actual al formato firstName_lastName_5digitAuthUid
          </p>
          
          <div class="flex items-center gap-4">
            <button
              @click="updateItachiUid"
              :disabled="isUpdating || !itachiStaff"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="isUpdating">Actualizando...</span>
              <span v-else>Actualizar UID de Itachi</span>
            </button>
            
            <button
              @click="checkStatus"
              :disabled="isChecking"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="isChecking">Verificando...</span>
              <span v-else>Verificar Estado</span>
            </button>
          </div>
        </div>
        
        <!-- Resultado -->
        <div v-if="result" class="mt-6 p-4 rounded-lg" :class="result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
          <h3 class="font-medium mb-2" :class="result.success ? 'text-green-800' : 'text-red-800'">
            {{ result.success ? '✅ Actualización Exitosa' : '❌ Error en la Actualización' }}
          </h3>
          <div class="text-sm" :class="result.success ? 'text-green-700' : 'text-red-700'">
            <p v-if="result.success">
              UID actualizado: {{ result.oldUid }} → {{ result.newUid }}
            </p>
            <p v-else>
              Error: {{ result.error }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const itachiStaff = ref<any>(null)
const newUid = ref<string>('')
const isUpdating = ref(false)
const isChecking = ref(false)
const result = ref<any>(null)

const checkStatus = async () => {
  isChecking.value = true
  result.value = null
  
  try {
    // Check if Itachi exists as staff
    const { checkItachiAsStaff } = await import('~/utils/migrate-itachi-to-staff')
    const staffResult = await checkItachiAsStaff()
    
    if (staffResult.success && staffResult.exists && staffResult.staff) {
      itachiStaff.value = staffResult.staff
      
      // Calculate new UID format
      const firstName = staffResult.staff.firstName || 'itachi'
      const lastName = staffResult.staff.lastName || 'uchiha'
      const authUid = staffResult.staff.authUid || 'unknown'
      
      // Clean names
      const cleanFirstName = firstName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
      
      const cleanLastName = lastName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
      
      // Get last 5 digits from authUid
      const last5Digits = authUid.slice(-5)
      
      newUid.value = `${cleanFirstName}_${cleanLastName}_${last5Digits}`
      
    } else {
      itachiStaff.value = null
      newUid.value = ''
    }
    
  } catch (error) {
    console.error('Error checking status:', error)
    result.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    isChecking.value = false
  }
}

const updateItachiUid = async () => {
  isUpdating.value = true
  result.value = null
  
  try {
    const { updateItachiCustomUid } = await import('~/utils/migrate-itachi-to-staff')
    const updateResult = await updateItachiCustomUid()
    
    result.value = updateResult
    
    if (updateResult.success) {
      // Refresh status after successful update
      await checkStatus()
    }
    
  } catch (error) {
    console.error('Error updating Itachi UID:', error)
    result.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    isUpdating.value = false
  }
}

onMounted(() => {
  checkStatus()
})
</script> 