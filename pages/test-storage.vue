<template>
  <div class="min-h-screen bg-slate-900 text-white p-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-8 text-center">Test Firebase Storage</h1>
      
      <!-- Auth Status -->
      <div class="bg-slate-800 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Estado de Autenticación</h2>
        <div class="space-y-2">
          <div :class="isLoggedIn ? 'text-green-400' : 'text-red-400'">
            {{ isLoggedIn ? '✅ Usuario autenticado' : '❌ Usuario no autenticado' }}
          </div>
          <div v-if="user" class="text-blue-400">
            👤 Usuario: {{ user.email }}
          </div>
          <div v-if="user" class="text-blue-400">
            🆔 UID: {{ user.uid }}
          </div>
          <div v-if="!isLoggedIn" class="text-yellow-400">
            ⚠️ Nota: Necesitas estar autenticado para subir archivos a Firebase Storage
          </div>
        </div>
      </div>
      
      <div class="bg-slate-800 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Diagnóstico de Subida de Imágenes</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Seleccionar imagen:</label>
            <input
              type="file"
              @change="handleFileSelect"
              accept="image/*"
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>
          
          <div v-if="selectedFile" class="p-4 bg-slate-700 rounded-lg">
            <p><strong>Archivo seleccionado:</strong> {{ selectedFile.name }}</p>
            <p><strong>Tamaño:</strong> {{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
            <p><strong>Tipo:</strong> {{ selectedFile.type }}</p>
          </div>
          
          <div class="flex gap-4">
            <button
              @click="testFirebaseConnection"
              :disabled="!isLoggedIn"
              class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
            >
              Test Conexión Firebase
            </button>
            
            <button
              @click="testSmallFileUpload"
              :disabled="!isLoggedIn"
              class="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
            >
              Test Archivo Pequeño
            </button>
            
            <button
              @click="testDirectUpload"
              :disabled="!selectedFile || isUploading || !isLoggedIn"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
            >
              {{ isUploading ? 'Subiendo...' : 'Test Upload Directo' }}
            </button>
            
            <button
              @click="testWebPConversion"
              :disabled="!selectedFile || isConverting || !isLoggedIn"
              class="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
            >
              {{ isConverting ? 'Convirtiendo...' : 'Test Conversión WebP' }}
            </button>
          </div>
          
          <div v-if="!isLoggedIn" class="bg-red-900 border border-red-600 rounded-lg p-4">
            <p class="text-red-400">
              ⚠️ Necesitas iniciar sesión para probar la subida de archivos.
            </p>
            <button
              @click="navigateTo('/login')"
              class="mt-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors"
            >
              Ir a Login
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="logs.length > 0" class="bg-slate-800 rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-3">Logs de Diagnóstico:</h3>
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="(log, index) in logs"
            :key="index"
            :class="{
              'text-green-400': log.type === 'success',
              'text-red-400': log.type === 'error',
              'text-yellow-400': log.type === 'warning',
              'text-blue-400': log.type === 'info'
            }"
            class="text-sm font-mono"
          >
            [{{ log.timestamp }}] {{ log.message }}
          </div>
        </div>
        
        <button
          @click="clearLogs"
          class="mt-4 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
        >
          Limpiar Logs
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFirebaseStorage } from '~/composables/firebase-storage'
import { useAuth } from '~/composables/firebase'

// Auth state
const { user, isLoggedIn } = useAuth()

const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const isConverting = ref(false)

interface Log {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

const logs = ref<Log[]>([])

const addLog = (message: string, type: Log['type'] = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push({ timestamp, message, type })
  
  // Keep only last 50 logs
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(-50)
  }
}

const clearLogs = () => {
  logs.value = []
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    selectedFile.value = file
    addLog(`Archivo seleccionado: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'info')
  }
}

const testFirebaseConnection = async () => {
  addLog('🔄 Verificando conexión a Firebase Storage...', 'info')
  
  try {
    // Test Firebase auth first
    if (!isLoggedIn.value) {
      addLog('❌ Usuario no autenticado', 'error')
      return
    }
    
    addLog(`👤 Usuario autenticado: ${user.value?.email}`, 'info')
    
    // Test Firebase Storage initialization
    const { useFirebaseStorage } = await import('~/composables/firebase-storage')
    const { uploadExerciseImage } = useFirebaseStorage()
    addLog('✅ Composable Firebase Storage inicializado', 'success')
    
    // Test Firebase app initialization
    const { getFirebaseDb } = await import('~/composables/firebase')
    const db = getFirebaseDb()
    
    if (db) {
      addLog('✅ Firebase app inicializado correctamente', 'success')
    } else {
      addLog('❌ Firebase app no inicializado', 'error')
      return
    }
    
    // Test Storage instance
    const { getStorage } = await import('firebase/storage')
    const storage = getStorage()
    
    if (storage) {
      addLog('✅ Firebase Storage instance obtenida', 'success')
      addLog(`📁 Bucket: ${storage.app.options.storageBucket}`, 'info')
    } else {
      addLog('❌ No se pudo obtener Firebase Storage instance', 'error')
    }
    
    addLog('🎉 Conexión a Firebase Storage verificada exitosamente', 'success')
    
  } catch (error: any) {
    addLog(`❌ Error al verificar conexión a Firebase Storage: ${error.message}`, 'error')
    console.error('Error detallado:', error)
    
    if (error.code) {
      addLog(`🔍 Código de error: ${error.code}`, 'error')
    }
  }
}

const testSmallFileUpload = async () => {
  addLog('🔄 Iniciando test con archivo pequeño...', 'info')
  
  try {
    if (!isLoggedIn.value) {
      addLog('❌ Usuario no autenticado', 'error')
      return
    }
    
    addLog(`👤 Usuario autenticado: ${user.value?.email}`, 'info')
    
    // Create a small test file (1KB)
    const testContent = 'Test file content for Firebase Storage upload test'
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' })
    
    addLog(`📄 Archivo de prueba creado: ${testFile.name} (${testFile.size} bytes)`, 'info')
    
    // Test upload using the composable
    const { uploadExerciseImage } = useFirebaseStorage()
    addLog('✅ Composable Firebase Storage inicializado', 'success')
    
    addLog('⬆️ Subiendo archivo de prueba...', 'info')
    const result = await uploadExerciseImage(
      testFile,
      'test-small-file',
      `test-small-${Date.now()}`
    )
    
    if (result.success) {
      addLog('✅ Archivo pequeño subido exitosamente!', 'success')
      addLog(`✅ URL obtenida: ${result.url}`, 'success')
      addLog(`📁 Path: ${result.path}`, 'success')
      
      if (result.isFirebaseStorage) {
        addLog('✅ Subido a Firebase Storage', 'success')
      } else if (result.fallbackUsed) {
        addLog('⚠️ Usó método de respaldo (Data URL)', 'warning')
        addLog(`⚠️ Error original: ${result.storageError}`, 'warning')
      }
    } else {
      addLog(`❌ Error subiendo archivo pequeño: ${result.error}`, 'error')
      
      if (result.code) {
        addLog(`🔍 Código de error: ${result.code}`, 'error')
      }
    }
    
  } catch (error: any) {
    addLog(`❌ Error en test de archivo pequeño: ${error.message}`, 'error')
    console.error('Error detallado:', error)
    
    if (error.code) {
      addLog(`🔍 Código de error: ${error.code}`, 'error')
    }
  }
}

const testDirectUpload = async () => {
  if (!selectedFile.value) return
  
  if (!isLoggedIn.value) {
    addLog('❌ Usuario no autenticado - la subida fallará', 'error')
    return
  }
  
  isUploading.value = true
  addLog('🔄 Iniciando test de subida directa a Firebase Storage...', 'info')
  addLog(`👤 Usuario autenticado: ${user.value?.email}`, 'info')
  
  try {
    // Use the same Firebase Storage logic as the composable
    addLog('🔄 Usando useFirebaseStorage composable...', 'info')
    const { uploadExerciseImage } = useFirebaseStorage()
    addLog('✅ Composable de Firebase Storage inicializado', 'success')
    
    // Test direct upload using the composable
    addLog('⬆️ Ejecutando uploadExerciseImage...', 'info')
    const result = await uploadExerciseImage(
      selectedFile.value,
      'test-exercise',
      `test-${Date.now()}`
    )
    
    if (result.success) {
      addLog('✅ Archivo subido exitosamente!', 'success')
      addLog(`✅ URL obtenida: ${result.url}`, 'success')
      addLog(`📁 Path: ${result.path}`, 'success')
      
      if (result.isFirebaseStorage) {
        addLog('✅ Subido a Firebase Storage', 'success')
      } else if (result.fallbackUsed) {
        addLog('⚠️ Usó método de respaldo (Data URL)', 'warning')
        addLog(`⚠️ Error original: ${result.storageError}`, 'warning')
      }
    } else {
      addLog(`❌ Error en subida: ${result.error}`, 'error')
      
      if (result.code) {
        addLog(`🔍 Código de error: ${result.code}`, 'error')
      }
    }
    
  } catch (error: any) {
    addLog(`❌ Error en subida directa: ${error.message}`, 'error')
    console.error('Error detallado:', error)
    
    if (error.code) {
      addLog(`🔍 Código de error: ${error.code}`, 'error')
    }
  } finally {
    isUploading.value = false
  }
}

const testWebPConversion = async () => {
  if (!selectedFile.value) return
  
  if (!isLoggedIn.value) {
    addLog('❌ Usuario no autenticado - la subida fallará', 'error')
    return
  }
  
  isConverting.value = true
  addLog('🔄 Iniciando test de conversión WebP...', 'info')
  addLog(`👤 Usuario autenticado: ${user.value?.email}`, 'info')
  
  try {
    // Test WebP conversion
    addLog('🔄 Cargando utilidad de conversión...', 'info')
    const { convertImageToWebP, createWebPFile } = await import('~/utils/image-converter')
    addLog('✅ Utilidad de conversión cargada', 'success')
    
    addLog('🔄 Convirtiendo imagen a WebP...', 'info')
    const { blob, dataUrl } = await convertImageToWebP(selectedFile.value, 0.8, 1200, 1200)
    addLog(`✅ Imagen convertida: ${(blob.size / 1024).toFixed(1)} KB`, 'success')
    
    addLog('🔄 Creando archivo WebP...', 'info')
    const webpFile = createWebPFile(blob, selectedFile.value.name)
    addLog(`✅ Archivo WebP creado: ${webpFile.name}`, 'success')
    
    // Now try to upload the WebP file using the composable
    addLog('🔄 Subiendo archivo WebP usando composable...', 'info')
    const { uploadExerciseImage } = useFirebaseStorage()
    
    const result = await uploadExerciseImage(
      webpFile,
      'test-webp-exercise',
      `test-webp-${Date.now()}`
    )
    
    if (result.success) {
      addLog('✅ Archivo WebP subido exitosamente!', 'success')
      addLog(`✅ URL WebP obtenida: ${result.url}`, 'success')
      addLog(`📁 Path: ${result.path}`, 'success')
      
      if (result.isFirebaseStorage) {
        addLog('✅ Subido a Firebase Storage', 'success')
      } else if (result.fallbackUsed) {
        addLog('⚠️ Usó método de respaldo (Data URL)', 'warning')
        addLog(`⚠️ Error original: ${result.storageError}`, 'warning')
      }
    } else {
      addLog(`❌ Error en subida WebP: ${result.error}`, 'error')
      
      if (result.code) {
        addLog(`🔍 Código de error: ${result.code}`, 'error')
      }
    }
    
  } catch (error: any) {
    addLog(`❌ Error en conversión WebP: ${error.message}`, 'error')
    console.error('Error detallado:', error)
    
    if (error.code) {
      addLog(`🔍 Código de error: ${error.code}`, 'error')
    }
  } finally {
    isConverting.value = false
  }
}

// Initialize with some diagnostic info
onMounted(() => {
  addLog('🏃 Página de diagnóstico iniciada', 'info')
  addLog(`🌐 Entorno: ${process.client ? 'Cliente' : 'Servidor'}`, 'info')
  
  if (process.client) {
    addLog('✅ Ejecutándose en el cliente', 'success')
    
    // Check auth state
    if (isLoggedIn.value) {
      addLog('✅ Usuario autenticado', 'success')
      addLog(`👤 Email: ${user.value?.email}`, 'info')
      addLog(`🆔 UID: ${user.value?.uid}`, 'info')
    } else {
      addLog('❌ Usuario no autenticado', 'error')
      addLog('⚠️ Las pruebas de subida fallarán sin autenticación', 'warning')
    }
  } else {
    addLog('⚠️ Ejecutándose en el servidor', 'warning')
  }
})

// Disable auth middleware for this page since we want to allow unauthenticated users to see the diagnostic info
definePageMeta({
  middleware: [] // Disable auth middleware
})
</script> 