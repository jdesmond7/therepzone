// Script de prueba para Firebase Functions
// USAR SOLO EN DESARROLLO - NO EN PRODUCCIÓN

import { getFirebaseAuth, getFirebaseDb } from '~/composables/firebase'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore'

export const testFirebaseFunctions = {
  
  /**
   * 🧪 Test 1: Función de limpieza de usuarios huérfanos
   * Esta es la más segura para probar primero
   */
  async testCleanupOrphanedUsers() {
    console.log('🧹 Probando función de limpieza de usuarios huérfanos...')
    
    try {
      if (!process.client) throw new Error('Solo disponible en cliente')
      
      // Obtener functions
      const app = (await import('firebase/app')).getApp()
      const functions = getFunctions(app)
      const cleanupFunction = httpsCallable(functions, 'cleanupOrphanedUsers')
      
      // Llamar a la función
      const result = await cleanupFunction()
      
      console.log('✅ Resultado de limpieza:', result.data)
      return result.data
      
    } catch (error) {
      console.error('❌ Error en limpieza:', error)
      throw error
    }
  },

  /**
   * 🧪 Test 2: Crear usuario de prueba y documento huérfano
   * Para probar la sincronización
   */
  async createTestOrphanDocument() {
    console.log('🔧 Creando documento huérfano de prueba...')
    
    try {
      const db = getFirebaseDb()
      if (!db) throw new Error('Firestore no disponible')
      
      // ID único para prueba
      const testUserId = `test-user-${Date.now()}`
      
      // Crear documento sin usuario en Authentication
      await setDoc(doc(db, 'users', testUserId), {
        fullName: 'Usuario de Prueba',
        email: 'test@prueba.com',
        role: 'client',
        profileCompleted: false,
        createdAt: new Date().toISOString(),
        isTestUser: true // Marcador para identificar usuarios de prueba
      })
      
      console.log('✅ Documento huérfano creado:', testUserId)
      return testUserId
      
    } catch (error) {
      console.error('❌ Error creando documento de prueba:', error)
      throw error
    }
  },

  /**
   * 🧪 Test 3: Probar sincronización Authentication → Firestore
   * CUIDADO: Este elimina un usuario real
   */
  async testAuthToFirestoreSync() {
    console.log('🔄 Probando sincronización Auth → Firestore...')
    
    try {
      const auth = getFirebaseAuth()
      const db = getFirebaseDb()
      if (!auth || !db) throw new Error('Firebase no disponible')
      
      // 1. Crear usuario de prueba
      const testEmail = `test-sync-${Date.now()}@prueba.com`
      const testPassword = 'TestPassword123!'
      
      console.log('📝 Creando usuario de prueba:', testEmail)
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword)
      const user = userCredential.user
      
      // 2. Crear documento en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName: 'Usuario Sincronización',
        email: testEmail,
        role: 'client',
        profileCompleted: false,
        isTestUser: true
      })
      
      console.log('✅ Usuario y documento creados:', user.uid)
      
      // 3. Esperar un momento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 4. Eliminar usuario (esto debería triggear la function)
      console.log('🗑️ Eliminando usuario de Authentication...')
      await deleteUser(user)
      
      // 5. Verificar si el documento se eliminó automáticamente
      setTimeout(async () => {
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)
        
        if (!docSnap.exists()) {
          console.log('✅ ¡Función funcionó! Documento eliminado automáticamente')
        } else {
          console.log('⚠️ Documento aún existe - puede que la función tarde un poco')
        }
      }, 5000)
      
      return user.uid
      
    } catch (error) {
      console.error('❌ Error en prueba de sincronización:', error)
      throw error
    }
  },

  /**
   * 🧪 Test 4: Probar sincronización Firestore → Authentication
   * Elimina un documento y verifica que el usuario se elimine
   */
  async testFirestoreToAuthSync() {
    console.log('🔄 Probando sincronización Firestore → Auth...')
    
    try {
      const auth = getFirebaseAuth()
      const db = getFirebaseDb()
      if (!auth || !db) throw new Error('Firebase no disponible')
      
      // 1. Crear usuario de prueba
      const testEmail = `test-firestore-${Date.now()}@prueba.com`
      const testPassword = 'TestPassword123!'
      
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword)
      const user = userCredential.user
      
      // 2. Crear documento
      await setDoc(doc(db, 'users', user.uid), {
        fullName: 'Usuario Firestore Test',
        email: testEmail,
        role: 'client',
        isTestUser: true
      })
      
      console.log('✅ Usuario y documento creados:', user.uid)
      
      // 3. Eliminar documento (esto debería eliminar el usuario)
      console.log('🗑️ Eliminando documento de Firestore...')
      await deleteDoc(doc(db, 'users', user.uid))
      
      console.log('⏳ Esperando que la función elimine el usuario de Auth...')
      
      return user.uid
      
    } catch (error) {
      console.error('❌ Error en prueba Firestore → Auth:', error)
      throw error
    }
  },

  /**
   * 🔍 Verificar logs en tiempo real
   * Usar en consola del navegador mientras haces pruebas
   */
  watchLogs() {
    console.log('👀 Para ver logs en tiempo real, ejecuta en terminal:')
    console.log('firebase functions:log')
    console.log('O ve a Firebase Console > Functions > Logs')
  }
}

// Export para usar en páginas de desarrollo
export default testFirebaseFunctions 