<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">🧪 Test Firebase Functions</h1>
        <p class="text-slate-400">Prueba las funciones de sincronización de usuarios</p>
        <div class="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
          <p class="text-yellow-300 text-sm">⚠️ Solo usar en desarrollo - No en producción</p>
        </div>
      </div>

      <!-- Logs Display -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">📋 Logs de Prueba</h2>
        <div 
          ref="logsContainer"
          class="bg-slate-800 border border-slate-600 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm"
        >
          <div v-for="(log, index) in logs" :key="index" :class="getLogClass(log.type)">
            {{ log.timestamp }} - {{ log.message }}
          </div>
          <div v-if="logs.length === 0" class="text-slate-500">
            No hay logs aún. Ejecuta una prueba para ver resultados.
          </div>
        </div>
        <button 
          @click="clearLogs" 
          class="mt-2 px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm"
        >
          Limpiar Logs
        </button>
      </div>

      <!-- Test Buttons -->
      <div class="grid gap-6 md:grid-cols-2">
        
        <!-- Test 1: Cleanup Orphaned Users -->
        <div class="bg-slate-800 border border-slate-600 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-3">🧹 Test 1: Limpiar Usuarios Huérfanos</h3>
          <p class="text-slate-400 text-sm mb-4">
            La prueba más segura. Limpia documentos de usuarios que no tienen cuenta en Authentication.
          </p>
          <button 
            @click="testCleanupOrphans"
            :disabled="!!loading"
            class="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 rounded font-bold"
          >
            {{ loading === 'cleanup' ? 'Ejecutando...' : 'Ejecutar Limpieza' }}
          </button>
        </div>

        <!-- Test 2: Create Orphan Document -->
        <div class="bg-slate-800 border border-slate-600 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-3">🔧 Test 2: Crear Documento Huérfano</h3>
          <p class="text-slate-400 text-sm mb-4">
            Crea un documento de usuario sin cuenta en Authentication para simular datos huérfanos.
          </p>
          <button 
            @click="createOrphanDocument"
            :disabled="!!loading"
            class="w-full h-12 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white px-4 rounded font-bold"
          >
            {{ loading === 'orphan' ? 'Creando...' : 'Crear Documento Huérfano' }}
          </button>
        </div>

        <!-- Test 3: Auth to Firestore Sync -->
        <div class="bg-slate-800 border border-slate-600 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-3">🔄 Test 3: Sync Auth → Firestore</h3>
          <p class="text-slate-400 text-sm mb-4">
            Crea usuario y documento, luego elimina el usuario. El documento debería eliminarse automáticamente.
          </p>
          <button 
            @click="testAuthToFirestore"
            :disabled="!!loading"
            class="w-full h-12 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white px-4 rounded font-bold"
          >
            {{ loading === 'auth2firestore' ? 'Probando...' : 'Probar Sincronización' }}
          </button>
        </div>

        <!-- Test 4: Firestore to Auth Sync -->
        <div class="bg-slate-800 border border-slate-600 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-3">🔄 Test 4: Sync Firestore → Auth</h3>
          <p class="text-slate-400 text-sm mb-4">
            Crea usuario y documento, luego elimina el documento. El usuario debería eliminarse automáticamente.
          </p>
          <button 
            @click="testFirestoreToAuth"
            :disabled="!!loading"
            class="w-full h-12 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white px-4 rounded font-bold"
          >
            {{ loading === 'firestore2auth' ? 'Probando...' : 'Probar Sincronización' }}
          </button>
        </div>
      </div>

      <!-- Firebase Console Link -->
      <div class="mt-8 text-center">
        <div class="bg-slate-800 border border-slate-600 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-white mb-2">🔍 Monitorear Functions</h3>
          <p class="text-slate-400 text-sm mb-3">
            Para ver logs detallados en tiempo real:
          </p>
          <div class="space-y-2">
            <a 
              href="https://console.firebase.google.com/project/therepvana/functions/list" 
              target="_blank"
              class="inline-block bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm mr-2"
            >
              📊 Firebase Console
            </a>
            <code class="text-sm bg-slate-700 px-2 py-1 rounded text-green-400">
              firebase functions:log
            </code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import testFirebaseFunctions from '~/utils/test-functions'

// Types
interface LogEntry {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
}

// State
const logs = ref<LogEntry[]>([])
const loading = ref<string | null>(null)
const logsContainer = ref<HTMLElement>()

// Methods
const addLog = (message: string, type: LogEntry['type'] = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push({ timestamp, message, type })
  
  // Auto scroll to bottom
  nextTick(() => {
    if (logsContainer.value) {
      logsContainer.value.scrollTop = logsContainer.value.scrollHeight
    }
  })
}

const clearLogs = () => {
  logs.value = []
}

const getLogClass = (type: LogEntry['type']) => {
  const baseClass = 'mb-1'
  switch (type) {
    case 'success': return `${baseClass} text-green-400`
    case 'error': return `${baseClass} text-red-400`
    case 'warning': return `${baseClass} text-yellow-400`
    default: return `${baseClass} text-slate-300`
  }
}

// Test Functions
const testCleanupOrphans = async () => {
  loading.value = 'cleanup'
  addLog('🧹 Iniciando prueba de limpieza de usuarios huérfanos...', 'info')
  
  try {
    const result = await testFirebaseFunctions.testCleanupOrphanedUsers() as { orphanedDocsDeleted: number }
    addLog(`✅ Limpieza completada: ${result.orphanedDocsDeleted} documentos eliminados`, 'success')
  } catch (error: any) {
    addLog(`❌ Error en limpieza: ${error.message}`, 'error')
  } finally {
    loading.value = null
  }
}

const createOrphanDocument = async () => {
  loading.value = 'orphan'
  addLog('🔧 Creando documento huérfano de prueba...', 'info')
  
  try {
    const userId = await testFirebaseFunctions.createTestOrphanDocument()
    addLog(`✅ Documento huérfano creado: ${userId}`, 'success')
    addLog('💡 Ahora puedes ejecutar "Limpiar Usuarios Huérfanos" para probarlo', 'warning')
  } catch (error: any) {
    addLog(`❌ Error creando documento: ${error.message}`, 'error')
  } finally {
    loading.value = null
  }
}

const testAuthToFirestore = async () => {
  loading.value = 'auth2firestore'
  addLog('🔄 Iniciando prueba de sincronización Auth → Firestore...', 'info')
  
  try {
    const userId = await testFirebaseFunctions.testAuthToFirestoreSync()
    addLog(`✅ Prueba iniciada para usuario: ${userId}`, 'success')
    addLog('⏳ Esperando que la función elimine el documento automáticamente...', 'warning')
    addLog('📊 Ve los logs de Firebase Console para más detalles', 'info')
  } catch (error: any) {
    addLog(`❌ Error en sincronización: ${error.message}`, 'error')
  } finally {
    loading.value = null
  }
}

const testFirestoreToAuth = async () => {
  loading.value = 'firestore2auth'
  addLog('🔄 Iniciando prueba de sincronización Firestore → Auth...', 'info')
  
  try {
    const userId = await testFirebaseFunctions.testFirestoreToAuthSync()
    addLog(`✅ Prueba iniciada para usuario: ${userId}`, 'success')
    addLog('⏳ Esperando que la función elimine el usuario automáticamente...', 'warning')
    addLog('📊 Ve los logs de Firebase Console para más detalles', 'info')
  } catch (error: any) {
    addLog(`❌ Error en sincronización: ${error.message}`, 'error')
  } finally {
    loading.value = null
  }
}

// Page Meta
definePageMeta({
  ssr: false // Client-side only
})

useHead({
  title: 'Test Firebase Functions - THEREPZONE',
  meta: [
    { name: 'description', content: 'Página de prueba para Firebase Functions' }
  ]
})

// Initial log
onMounted(() => {
  addLog('🚀 Página de pruebas cargada. Listo para probar Firebase Functions.', 'success')
})
</script> 