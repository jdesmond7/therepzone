<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Pruebas de Colección Staff
        </h1>
        <p class="text-gray-600">
          Prueba la funcionalidad de la nueva colección de staff
        </p>
      </div>

      <!-- Test Actions -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Acciones de Prueba
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Create Test Staff -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              Crear Staff de Prueba
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Crea un miembro de staff de prueba
            </p>
            <button
              @click="createTestStaff"
              :disabled="isCreating"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <span v-if="isCreating">Creando...</span>
              <span v-else>Crear Test Staff</span>
            </button>
          </div>

          <!-- List All Staff -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              Listar Todo el Staff
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Muestra todos los miembros de staff
            </p>
            <button
              @click="listAllStaff"
              :disabled="isListing"
              class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <span v-if="isListing">Listando...</span>
              <span v-else>Listar Staff</span>
            </button>
          </div>

          <!-- Verify Collection -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              Verificar Estructura
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Verifica la estructura de la colección
            </p>
            <button
              @click="verifyCollection"
              :disabled="isVerifying"
              class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <span v-if="isVerifying">Verificando...</span>
              <span v-else>Verificar</span>
            </button>
          </div>

          <!-- Run All Tests -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              Ejecutar Todas las Pruebas
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Ejecuta todas las pruebas en secuencia
            </p>
            <button
              @click="runAllTests"
              :disabled="isRunningAll"
              class="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <span v-if="isRunningAll">Ejecutando...</span>
              <span v-else>Ejecutar Todo</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Resultados de las Pruebas
        </h2>
        
        <div v-if="testResults.length > 0" class="space-y-4">
          <div v-for="(result, index) in testResults" :key="index" class="border rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-medium text-gray-900">
                {{ result.testName }}
              </h3>
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="{
                'bg-green-100 text-green-800': result.success,
                'bg-red-100 text-red-800': !result.success
              }">
                {{ result.success ? 'Éxito' : 'Error' }}
              </span>
            </div>
            
            <div class="text-sm text-gray-600 mb-2">
              {{ result.message }}
            </div>
            
            <div v-if="result.data" class="bg-gray-50 p-3 rounded text-xs font-mono">
              <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
            </div>
            
            <div v-if="result.error" class="bg-red-50 p-3 rounded text-xs text-red-700">
              {{ result.error }}
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          No se han ejecutado pruebas aún
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  createTestStaffMember, 
  listAllStaff as listAllStaffUtil, 
  verifyStaffCollection, 
  runStaffTests 
} from '~/utils/test-staff-migration'

// State
const isCreating = ref(false)
const isListing = ref(false)
const isVerifying = ref(false)
const isRunningAll = ref(false)
const testResults = ref<any[]>([])

// Add test result
const addTestResult = (testName: string, result: any) => {
  testResults.value.unshift({
    testName,
    success: result.success,
    message: result.message || result.error || 'Test completed',
    data: result,
    error: result.error,
    timestamp: new Date().toLocaleTimeString()
  })
}

// Create test staff
const createTestStaff = async () => {
  isCreating.value = true
  try {
    const result = await createTestStaffMember()
    addTestResult('Crear Staff de Prueba', result)
  } catch (error) {
    addTestResult('Crear Staff de Prueba', {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    isCreating.value = false
  }
}

// List all staff
const listAllStaff = async () => {
  isListing.value = true
  try {
    const result = await listAllStaffUtil()
    addTestResult('Listar Todo el Staff', result)
  } catch (error) {
    addTestResult('Listar Todo el Staff', {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    isListing.value = false
  }
}

// Verify collection
const verifyCollection = async () => {
  isVerifying.value = true
  try {
    const result = await verifyStaffCollection()
    addTestResult('Verificar Estructura', result)
  } catch (error) {
    addTestResult('Verificar Estructura', {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    isVerifying.value = false
  }
}

// Run all tests
const runAllTests = async () => {
  isRunningAll.value = true
  try {
    const results = await runStaffTests()
    
    // Add individual test results
    addTestResult('Crear Test Staff', results.createTest)
    addTestResult('Listar Staff', results.listStaff)
    addTestResult('Verificar Estructura', results.verifyStructure)
    
    // Add overall result
    const allSuccess = results.createTest.success && results.listStaff.success && results.verifyStructure.success
    addTestResult('Ejecutar Todas las Pruebas', {
      success: allSuccess,
      message: allSuccess ? 'Todas las pruebas pasaron' : 'Algunas pruebas fallaron',
      data: results
    })
  } catch (error) {
    addTestResult('Ejecutar Todas las Pruebas', {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    isRunningAll.value = false
  }
}
</script> 