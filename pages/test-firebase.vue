<template>
  <div class="min-h-screen bg-slate-900 text-white p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">Test de Firebase</h1>
      
      <div class="space-y-4">
        <button @click="testConnection" class="bg-blue-600 px-4 py-2 rounded">
          Test Conexión
        </button>
        
        <button @click="testReadExercises" class="bg-green-600 px-4 py-2 rounded">
          Test Leer Ejercicios
        </button>
        
        <button @click="testReadWorkouts" class="bg-yellow-600 px-4 py-2 rounded">
          Test Leer Rutinas
        </button>
        
        <button @click="testWriteWorkout" class="bg-red-600 px-4 py-2 rounded">
          Test Escribir Rutina
        </button>
        
        <button @click="testReadUsers" class="bg-orange-600 px-4 py-2 rounded">
          Test Leer Usuarios
        </button>
        
        <button @click="forceReauth" class="bg-purple-600 px-4 py-2 rounded">
          Forzar Reautenticación
        </button>
      </div>
      
      <div v-if="logs.length > 0" class="mt-6 bg-slate-800 p-4 rounded">
        <h2 class="text-xl font-bold mb-2">Logs:</h2>
        <div class="space-y-1">
          <div v-for="(log, index) in logs" :key="index" class="text-sm">
            <span class="text-slate-400">{{ log.timestamp }}</span>
            <span :class="log.type === 'error' ? 'text-red-400' : 'text-white'">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getFirebaseDb, getFirebaseAuth } from '~/composables/firebase'
import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore'

const logs = ref<Array<{timestamp: string, type: 'info' | 'error' | 'success', message: string}>>([])

const addLog = (type: 'info' | 'error' | 'success', message: string) => {
  logs.value.push({
    timestamp: new Date().toLocaleTimeString(),
    type,
    message
  })
}

const testConnection = () => {
  addLog('info', '🔄 Probando conexión a Firebase...')
  
  const auth = getFirebaseAuth()
  const db = getFirebaseDb()
  
  if (auth) {
    addLog('success', '✅ Firebase Auth conectado')
    
    // Check if user is authenticated
    if (auth.currentUser) {
      addLog('success', `✅ Usuario autenticado: ${auth.currentUser.email}`)
      addLog('info', `UID: ${auth.currentUser.uid}`)
    } else {
      addLog('error', '❌ Usuario NO autenticado en Firebase Auth')
    }
  } else {
    addLog('error', '❌ Firebase Auth no conectado')
  }
  
  if (db) {
    addLog('success', '✅ Firebase Firestore conectado')
  } else {
    addLog('error', '❌ Firebase Firestore no conectado')
  }
  
  // Check Nuxt Auth state
  const { user, isLoggedIn } = useAuth()
  addLog('info', `Nuxt Auth - isLoggedIn: ${isLoggedIn.value}`)
  addLog('info', `Nuxt Auth - user: ${user.value ? 'Presente' : 'No presente'}`)
  
  if (user.value) {
    addLog('success', `Nuxt Auth - Email: ${user.value.email}`)
    addLog('info', `Nuxt Auth - UID: ${user.value.uid}`)
  }
}

const testReadExercises = async () => {
  addLog('info', '🔄 Probando lectura de ejercicios...')
  
  try {
    const db = getFirebaseDb()
    if (!db) {
      addLog('error', '❌ No hay conexión a Firestore')
      return
    }
    
    const exercisesCollection = collection(db, 'exercises')
    const querySnapshot = await getDocs(exercisesCollection)
    
    addLog('success', `✅ Ejercicios leídos: ${querySnapshot.size} documentos`)
  } catch (error: any) {
    addLog('error', `❌ Error leyendo ejercicios: ${error.message}`)
  }
}

const testReadWorkouts = async () => {
  addLog('info', '🔄 Probando lectura de rutinas...')
  
  try {
    const db = getFirebaseDb()
    if (!db) {
      addLog('error', '❌ No hay conexión a Firestore')
      return
    }
    
    const auth = getFirebaseAuth()
    if (!auth?.currentUser) {
      addLog('error', '❌ No hay usuario autenticado en Firebase Auth')
      return
    }
    
    addLog('info', `Usuario autenticado: ${auth.currentUser.email}`)
    addLog('info', `UID: ${auth.currentUser.uid}`)
    
    const workoutsCollection = collection(db, 'workouts')
    const querySnapshot = await getDocs(workoutsCollection)
    
    addLog('success', `✅ Rutinas leídas: ${querySnapshot.size} documentos`)
    
    // Try to read a specific workout if any exist
    if (querySnapshot.size > 0) {
      const firstDoc = querySnapshot.docs[0]
      addLog('info', `Primera rutina: ${firstDoc.id}`)
      
      // Try to get the specific document
      const docRef = doc(db, 'workouts', firstDoc.id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        addLog('success', `✅ Documento específico leído: ${docSnap.data().title || 'Sin título'}`)
      } else {
        addLog('error', '❌ Documento específico no existe')
      }
    }
  } catch (error: any) {
    addLog('error', `❌ Error leyendo rutinas: ${error.message}`)
    addLog('error', `Código: ${error.code}`)
  }
}

const testWriteWorkout = async () => {
  addLog('info', '🔄 Probando escritura de rutina...')
  
  try {
    const db = getFirebaseDb()
    if (!db) {
      addLog('error', '❌ No hay conexión a Firestore')
      return
    }
    
    const { user } = useAuth()
    if (!user.value) {
      addLog('error', '❌ No hay usuario autenticado en Nuxt Auth')
      return
    }
    
    addLog('info', `Usuario autenticado: ${user.value.email}`)
    addLog('info', `UID: ${user.value.uid}`)
    
    const workoutsCollection = collection(db, 'workouts')
    const testWorkout = {
      title: 'Test Workout',
      description: 'Test workout for migration',
      createdBy: user.value.uid,
      createdAt: new Date(),
      regionWorking: ['test']
    }
    
    const docRef = await addDoc(workoutsCollection, testWorkout)
    addLog('success', `✅ Rutina creada: ${docRef.id}`)
  } catch (error: any) {
    addLog('error', `❌ Error creando rutina: ${error.message}`)
  }
}

const forceReauth = async () => {
  addLog('info', '🔄 Forzando reautenticación...')
  
  // Prompt for credentials
  const email = prompt('Ingresa tu email:')
  const password = prompt('Ingresa tu contraseña:')
  
  if (!email || !password) {
    addLog('error', '❌ Credenciales no proporcionadas')
    return
  }
  
  try {
    const { login } = useAuth()
    const result = await login(email, password, true)
    
    if (result.success) {
      addLog('success', '✅ Reautenticación exitosa')
      // Wait a moment and test connection again
      setTimeout(() => {
        testConnection()
      }, 1000)
    } else {
      addLog('error', `❌ Error en reautenticación: ${result.error}`)
    }
  } catch (error: any) {
    addLog('error', `❌ Error forzando reautenticación: ${error.message}`)
  }
}

const testReadUsers = async () => {
  addLog('info', '🔄 Probando lectura de usuarios...')
  
  try {
    const db = getFirebaseDb()
    if (!db) {
      addLog('error', '❌ No hay conexión a Firestore')
      return
    }
    
    const auth = getFirebaseAuth()
    if (!auth?.currentUser) {
      addLog('error', '❌ No hay usuario autenticado en Firebase Auth')
      return
    }
    
    addLog('info', `Usuario autenticado: ${auth.currentUser.email}`)
    addLog('info', `UID: ${auth.currentUser.uid}`)
    
    const usersCollection = collection(db, 'users')
    const querySnapshot = await getDocs(usersCollection)
    
    addLog('success', `✅ Usuarios leídos: ${querySnapshot.size} documentos`)
  } catch (error: any) {
    addLog('error', `❌ Error leyendo usuarios: ${error.message}`)
    addLog('error', `Código: ${error.code}`)
  }
}
</script> 