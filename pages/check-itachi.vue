<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Verificar Itachi y Atletas
        </h1>
        <p class="text-gray-600">
          Verifica si Itachi existe y lista todos los atletas disponibles
        </p>
      </div>

      <!-- Actions -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Acciones
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Check Itachi -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              Verificar Itachi
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Busca si Itachi existe en la base de datos
            </p>
            <button
              @click="checkItachi"
              :disabled="isChecking"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <span v-if="isChecking">Verificando...</span>
              <span v-else>Verificar Itachi</span>
            </button>
          </div>

          <!-- List Athletes -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              Listar Atletas
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Muestra todos los atletas disponibles
            </p>
            <button
              @click="listAthletes"
              :disabled="isListing"
              class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <span v-if="isListing">Listando...</span>
              <span v-else>Listar Atletas</span>
            </button>
          </div>

          <!-- Create Itachi -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              Crear Itachi
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Crea a Itachi como atleta si no existe
            </p>
            <button
              @click="createItachi"
              :disabled="isCreating"
              class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <span v-if="isCreating">Creando...</span>
              <span v-else>Crear Itachi</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Itachi Status -->
      <div v-if="itachiStatus" class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Estado de Itachi
        </h2>
        
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 rounded-full" :class="{
              'bg-green-500': itachiStatus.exists,
              'bg-red-500': !itachiStatus.exists
            }"></div>
            <span class="font-medium">
              {{ itachiStatus.exists ? 'Encontrado' : 'No encontrado' }}
            </span>
          </div>
          
          <div v-if="itachiStatus.exists" class="bg-green-50 p-4 rounded-lg">
            <div class="text-sm text-green-700">
              <div><strong>Colección:</strong> {{ itachiStatus.collection }}</div>
              <div><strong>UID:</strong> {{ itachiStatus.data.uid }}</div>
              <div><strong>Nombre:</strong> {{ itachiStatus.data.fullName }}</div>
              <div><strong>Email:</strong> {{ itachiStatus.data.email }}</div>
              <div><strong>Rol:</strong> {{ itachiStatus.data.role }}</div>
            </div>
          </div>
          
          <div v-if="!itachiStatus.exists" class="bg-red-50 p-4 rounded-lg">
            <div class="text-red-700">
              {{ itachiStatus.message }}
            </div>
          </div>
        </div>
      </div>

      <!-- Athletes List -->
      <div v-if="athletesList" class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Lista de Atletas ({{ athletesList.count }})
        </h2>
        
        <div v-if="athletesList.athletes && athletesList.athletes.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UID
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(athlete, index) in athletesList.athletes" :key="athlete.uid">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ index + 1 }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ athlete.fullName }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ athlete.email }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500 font-mono">
                    {{ athlete.uid }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          No hay atletas registrados
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { checkItachiExists, listAllAthletes } from '~/utils/check-itachi'
import { ensureItachiExists } from '~/utils/create-itachi-athlete'

// State
const isChecking = ref(false)
const isListing = ref(false)
const isCreating = ref(false)
const itachiStatus = ref<any>(null)
const athletesList = ref<any>(null)

// Check Itachi
const checkItachi = async () => {
  isChecking.value = true
  try {
    const result = await checkItachiExists()
    itachiStatus.value = result
  } catch (error) {
    console.error('Error checking Itachi:', error)
    itachiStatus.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    isChecking.value = false
  }
}

// List athletes
const listAthletes = async () => {
  isListing.value = true
  try {
    const result = await listAllAthletes()
    athletesList.value = result
  } catch (error) {
    console.error('Error listing athletes:', error)
    athletesList.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    isListing.value = false
  }
}

// Create Itachi
const createItachi = async () => {
  isCreating.value = true
  try {
    const result = await ensureItachiExists()
    itachiStatus.value = result
    
    if (result.success) {
      // Refresh athletes list
      await listAthletes()
    }
  } catch (error) {
    console.error('Error creating Itachi:', error)
    itachiStatus.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    isCreating.value = false
  }
}
</script> 