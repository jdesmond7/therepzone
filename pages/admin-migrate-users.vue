<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
        <h1 class="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          🔧 Migración de Usuarios
        </h1>

        <div class="mb-8">
          <h2 class="text-xl font-bold text-white mb-4">Crear Perfil para Usuario Existente</h2>
          <p class="text-slate-400 mb-6">
            Si ya tienes usuarios en Firebase Auth pero no tienen perfil en Firestore, usa esta herramienta para crear sus perfiles.
          </p>

          <form @submit.prevent="createUserProfile" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Email del Usuario</label>
              <input
                v-model="userForm.email"
                type="email"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
                placeholder="prueba@mail.com"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-2">Nombre Completo</label>
              <input
                v-model="userForm.fullName"
                type="text"
                autocomplete="off"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
                placeholder="Nombre del usuario"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-2">Rol</label>
              <select
                v-model="userForm.role"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                required
              >
                <option value="client">Cliente</option>
                <option value="coach">Coach</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-2">UID de Firebase Auth</label>
              <input
                v-model="userForm.uid"
                type="text"
                autocomplete="off"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
                placeholder="b500JqVtdSSQhXR66iCoQCL... (copia desde Auth console)"
                required
              />
              <p class="text-xs text-slate-400 mt-1">
                Copia el UID desde Firebase Authentication console
              </p>
            </div>

            <button
              type="submit"
              :disabled="isCreating"
              class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <span v-if="isCreating">Creando perfil...</span>
              <span v-else">Crear Perfil en Firestore</span>
            </button>
          </form>
        </div>

        <!-- Información Actual del Usuario Logueado -->
        <div v-if="user" class="mb-8 bg-slate-700/50 rounded-lg p-4">
          <h3 class="text-lg font-bold text-white mb-2">Usuario Actual Logueado</h3>
          <div class="text-sm text-slate-300">
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>UID:</strong> {{ user.uid }}</p>
            <p class="text-slate-400 mt-2">
              Puedes usar estos datos para crear tu perfil si no existe aún.
            </p>
          </div>
        </div>

        <!-- Console Logs -->
        <div class="mb-8">
          <h2 class="text-xl font-bold text-white mb-4">Logs</h2>
          <div class="bg-slate-900 border border-slate-600 rounded-lg p-4 h-48 overflow-y-auto">
            <div v-if="logs.length === 0" class="text-slate-500 text-center py-8">
              No hay logs aún...
            </div>
            <div v-for="(log, index) in logs" :key="index" class="mb-2">
              <span 
                :class="{
                  'text-green-400': log.type === 'success',
                  'text-red-400': log.type === 'error',
                  'text-blue-400': log.type === 'info',
                  'text-slate-300': log.type === 'default'
                }"
                class="font-mono text-sm"
              >
                {{ log.message }}
              </span>
            </div>
          </div>
        </div>

        <!-- Verificar Usuarios -->
        <div class="mb-8">
          <h2 class="text-xl font-bold text-white mb-4">Verificar Usuarios</h2>
          <button 
            @click="checkUsersCollection"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition-colors mr-4"
          >
            Verificar Colección Users
          </button>
          
          <button 
            @click="clearLogs"
            class="bg-slate-600 hover:bg-slate-700 text-white font-bold px-4 py-3 rounded-lg transition-colors"
          >
            Limpiar Logs
          </button>
        </div>

        <!-- Back -->
        <div class="pt-8 border-t border-slate-700">
          <NuxtLink 
            to="/admin-seed" 
            class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors inline-block"
          >
            ← Volver al Admin Panel
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUsers } from '~/composables/firestore'
import { collection, getDocs } from 'firebase/firestore'

const { user } = useAuth()
const isCreating = ref(false)
const logs = ref<{ message: string; type: string }[]>([])

const userForm = reactive({
  email: '',
  fullName: '',
  role: 'client' as 'client' | 'coach' | 'admin',
  uid: ''
})

// Add log function
const addLog = (message: string, type: 'success' | 'error' | 'info' | 'default' = 'default') => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push({ message: `[${timestamp}] ${message}`, type })
  
  // Auto-scroll to bottom
  nextTick(() => {
    const logContainer = document.querySelector('.overflow-y-auto')
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight
    }
  })
}

const createUserProfile = async () => {
  if (!userForm.uid || !userForm.email || !userForm.fullName) {
    addLog('❌ Por favor completa todos los campos', 'error')
    return
  }

  isCreating.value = true
  addLog(`🔄 Creando perfil para ${userForm.email}...`, 'info')

  try {
    const { createUser } = useUsers()
    
    const result = await createUser(userForm.uid, {
      fullName: userForm.fullName,
      email: userForm.email,
      role: userForm.role,
      assignedWorkouts: [],
      coachId: userForm.role === 'client' ? undefined : undefined
    })

    if (result.success) {
      addLog(`✅ Perfil creado exitosamente para ${userForm.email}`, 'success')
      addLog(`📝 UID: ${userForm.uid}`, 'info')
      addLog(`👤 Rol: ${userForm.role}`, 'info')
      
      // Reset form
      userForm.email = ''
      userForm.fullName = ''
      userForm.role = 'client'
      userForm.uid = ''
    } else {
      addLog(`❌ Error creando perfil: ${result.error}`, 'error')
    }
  } catch (error) {
    addLog(`❌ Error: ${error}`, 'error')
  } finally {
    isCreating.value = false
  }
}

const checkUsersCollection = async () => {
  addLog('🔍 Verificando colección users...', 'info')
  
  try {
    const { getFirebaseDb } = await import('~/composables/firebase')
    const db = getFirebaseDb()
    
    if (!db) {
      addLog('❌ No se pudo conectar a Firestore', 'error')
      return
    }

    const usersCollection = collection(db, 'users')
    const snapshot = await getDocs(usersCollection)
    
    if (snapshot.empty) {
      addLog('📭 La colección "users" está vacía o no existe', 'info')
    } else {
      addLog(`✅ Encontrados ${snapshot.size} usuarios en Firestore:`, 'success')
      snapshot.forEach((doc) => {
        const userData = doc.data()
        addLog(`  👤 ${userData.email} (${userData.role}) - ID: ${doc.id}`, 'info')
      })
    }
  } catch (error) {
    addLog(`❌ Error verificando users: ${error}`, 'error')
  }
}

const clearLogs = () => {
  logs.value = []
  addLog('🗑️ Logs limpiados', 'info')
}

onMounted(() => {
  addLog('🚀 Herramienta de migración cargada', 'info')
  if (user.value) {
    addLog(`👋 Usuario logueado: ${user.value.email}`, 'info')
    // Pre-fill form with current user data
    userForm.email = user.value.email || ''
    userForm.uid = user.value.uid || ''
  }
})

definePageMeta({
  ssr: false
})
</script> 