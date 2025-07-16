// Firebase configuration (to be implemented)
// This file is prepared for future Firebase integration

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, type User, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase config - using environment variables
const firebaseConfig = {
  apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID
}

// Lazy Firebase initialization - only on client side
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

const initFirebase = () => {
  if (!process.client) return null
  
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    db = getFirestore(app)
  }
  
  return { app, auth, db }
}

// Getter functions for Firebase instances
export const getFirebaseAuth = () => {
  const firebase = initFirebase()
  return firebase?.auth || null
}

export const getFirebaseDb = () => {
  const firebase = initFirebase()
  return firebase?.db || null
}

// Firebase Auth functions
export const useAuth = () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value)

  // Initialize Firebase and listen to auth state changes only on client
  if (process.client) {
    const { setAuthChecked, setLoading } = useGlobalLoading()
    
        const firebaseAuth = getFirebaseAuth()
    if (firebaseAuth) {
      onAuthStateChanged(firebaseAuth, (firebaseUser) => {
        console.log('🔥 onAuthStateChanged ejecutado:', !!firebaseUser, 'en:', window.location.pathname)
        user.value = firebaseUser
        setAuthChecked(true)
        
                if (firebaseUser) {
          console.log('✅ Usuario autenticado:', firebaseUser.uid)
          
          const currentPath = window.location.pathname
          const protectedRoutes = ['/dashboard', '/coach/dashboard', '/admin/dashboard', '/complete-profile']
          const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route))
          
          if (isProtectedRoute) {
            // User is on protected route, clear redirecting flag and let middleware handle it
            localStorage.removeItem('therepzone_redirecting')
            console.log('🛡️ Usuario autenticado en ruta protegida, dejando que middleware maneje')
          } else {
            // User is on public route - don't auto-redirect here
            // Let the login form handle manual redirection
            console.log('🌍 Usuario autenticado en ruta pública:', currentPath)
          }
        } else {
          console.log('❌ Usuario no autenticado')
          setLoading(false)
        }
      })
    }
  }

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    if (!process.client) return { success: false, error: 'Not available on server' }
    
    try {
      const firebaseAuth = getFirebaseAuth()
      if (!firebaseAuth) throw new Error('Firebase not initialized')
      
      // Set persistence based on rememberMe choice
      const { setPersistence, browserLocalPersistence, browserSessionPersistence } = await import('firebase/auth')
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence
      
      console.log(`🔄 Configurando persistencia: ${rememberMe ? 'LOCAL (7 días)' : 'SESSION (hasta cerrar navegador)'}`)
      await setPersistence(firebaseAuth, persistenceType)
      
      console.log('Intentando iniciar sesión con:', email)
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
      user.value = userCredential.user
      console.log('Login exitoso:', userCredential.user)
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('therepzone_remember_me', 'true')
      } else {
        localStorage.removeItem('therepzone_remember_me')
      }
      
      return { success: true, user: userCredential.user }
    } catch (error: any) {
      console.error('Error completo de Firebase:', error)
      console.error('Código de error:', error.code)
      console.error('Mensaje de error:', error.message)
      return { 
        success: false, 
        error: error.message,
        code: error.code 
      }
    }
  }

  const logout = async () => {
    if (!process.client) return { success: false, error: 'Not available on server' }
    
    try {
      const firebaseAuth = getFirebaseAuth()
      if (!firebaseAuth) throw new Error('Firebase not initialized')
      
      // Clear remember me preference
      localStorage.removeItem('therepzone_remember_me')
      localStorage.removeItem('therepzone_redirecting')
      
      // Clear auth flow completion flags
      sessionStorage.removeItem('therepzone_auth_completed')
      sessionStorage.removeItem('therepzone_current_path')
      
      console.log('🔄 Limpiando preferencias y flags de sesión')
      
      await signOut(firebaseAuth)
      user.value = null
      console.log('✅ Sesión cerrada exitosamente')
      return { success: true }
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error)
      return { success: false, error: error.message }
    }
  }

  const register = async (email: string, password: string, fullName?: string, role: 'client' | 'coach' = 'client') => {
    if (!process.client) return { success: false, error: 'Not available on server' }
    
    try {
      const firebaseAuth = getFirebaseAuth()
      if (!firebaseAuth) throw new Error('Firebase not initialized')
      
      console.log('🔄 Creando usuario en Firebase Auth...')
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
      user.value = userCredential.user
      console.log('✅ Usuario creado en Firebase Auth:', userCredential.user.uid)
      
      // No crear perfil en Firestore aquí, solo retornar el usuario de Auth
      return { success: true, user: userCredential.user, authUid: userCredential.user.uid }
    } catch (error: any) {
      console.error('❌ Error completo al registrarse:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    user: readonly(user),
    isLoggedIn,
    login,
    logout,
    register
  }
}

export const useFirestore = () => {
  // TODO: Implement Firestore operations
  
  const getExercises = async () => {
    // TODO: Fetch exercises from Firestore
    return []
  }

  const saveWorkout = async (workout: any) => {
    // TODO: Save workout to Firestore
    console.log('Saving workout:', workout)
  }

  return {
    getExercises,
    saveWorkout
  }
} 

// Remove duplicate useFirebase function since we already have the config above 