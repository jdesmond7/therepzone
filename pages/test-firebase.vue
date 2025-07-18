<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Test de Acceso a Firebase
        </h1>
        <p class="text-gray-600">
          Prueba el acceso a las colecciones de Firebase
        </p>
      </div>

      <!-- Test Actions -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Acciones de Prueba
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Test Firebase Access -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              Test de Acceso General
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Prueba el acceso a todas las colecciones
            </p>
            <button
              @click="testAccess"
              :disabled="isTesting"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <span v-if="isTesting">Probando...</span>
              <span v-else>Test de Acceso</span>
            </button>
          </div>

          <!-- Find Itachi -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              Buscar Itachi
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Busca específicamente a Itachi en la base de datos
            </p>
            <button
              @click="findItachi"
              :disabled="isFinding"
              class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <span v-if="isFinding">Buscando...</span>
              <span v-else>Buscar Itachi</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Test Results -->
      <div v-if="testResults" class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Resultados del Test
        </h2>
        
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 rounded-full" :class="{
              'bg-green-500': testResults.success,
              'bg-red-500': !testResults.success
            }"></div>
            <span class="font-medium">
              {{ testResults.success ? 'Test Exitoso' : 'Test Fallido' }}
            </span>
          </div>
          
          <div v-if="testResults.success" class="bg-green-50 p-4 rounded-lg">
            <div class="text-sm text-green-700">
              <div><strong>Athletes:</strong> {{ testResults.athletesCount }} documentos</div>
              <div><strong>Coaches:</strong> {{ testResults.coachesCount }} documentos</div>
              <div><strong>Staff:</strong> {{ testResults.staffCount }} documentos</div>
            </div>
            
            <div v-if="testResults.athletes && testResults.athletes.length > 0" class="mt-4">
              <h4 class="font-medium text-green-800 mb-2">Athletes encontrados:</h4>
              <div class="space-y-1">
                <div v-for="athlete in testResults.athletes" :key="athlete.uid" class="text-xs text-green-700">
                  • {{ athlete.fullName }} ({{ athlete.uid }}) - {{ athlete.email }}
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="!testResults.success" class="bg-red-50 p-4 rounded-lg">
            <div class="text-red-700">
              {{ testResults.error }}
            </div>
          </div>
        </div>
      </div>

      <!-- Itachi Results -->
      <div v-if="itachiResults" class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Resultados de Búsqueda de Itachi
        </h2>
        
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 rounded-full" :class="{
              'bg-green-500': itachiResults.success,
              'bg-red-500': !itachiResults.success
            }"></div>
            <span class="font-medium">
              {{ itachiResults.success ? 'Búsqueda Exitosa' : 'Búsqueda Fallida' }}
            </span>
          </div>
          
          <div v-if="itachiResults.success && itachiResults.found" class="bg-green-50 p-4 rounded-lg">
            <div class="text-sm text-green-700">
              <div><strong>Colección:</strong> {{ itachiResults.collection }}</div>
              <div><strong>UID:</strong> {{ itachiResults.data.uid }}</div>
              <div><strong>Nombre:</strong> {{ itachiResults.data.fullName }}</div>
              <div><strong>Email:</strong> {{ itachiResults.data.email }}</div>
              <div><strong>Rol:</strong> {{ itachiResults.data.role }}</div>
            </div>
          </div>
          
          <div v-if="itachiResults.success && !itachiResults.found" class="bg-yellow-50 p-4 rounded-lg">
            <div class="text-yellow-700">
              {{ itachiResults.message }}
            </div>
          </div>
          
          <div v-if="!itachiResults.success" class="bg-red-50 p-4 rounded-lg">
            <div class="text-red-700">
              {{ itachiResults.error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { testFirebaseAccess, findItachi as findItachiUtil } from '~/utils/test-firebase-access'

// State
const isTesting = ref(false)
const isFinding = ref(false)
const testResults = ref<any>(null)
const itachiResults = ref<any>(null)

// Test Firebase access
const testAccess = async () => {
  isTesting.value = true
  try {
    const result = await testFirebaseAccess()
    testResults.value = result
  } catch (error) {
    console.error('Error testing access:', error)
    testResults.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    isTesting.value = false
  }
}

// Find Itachi
const findItachi = async () => {
  isFinding.value = true
  try {
    const result = await findItachiUtil()
    itachiResults.value = result
  } catch (error) {
    console.error('Error finding Itachi:', error)
    itachiResults.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    isFinding.value = false
  }
}
</script> 