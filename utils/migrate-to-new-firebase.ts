// Comprehensive migration script to move all data to new Firebase project
// This script migrates users, exercises, workouts, and images with custom UIDs

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, listAll } from 'firebase/storage'
import { useRuntimeConfig } from '#app'

// OLD Firebase config (replace with your old project config)
const OLD_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDHHTMz2IHf-rcKjzF0nkGtGqwzzMtl3PU",
  authDomain: "therepvana.firebaseapp.com",
  projectId: "therepvana",
  storageBucket: "therepvana.firebasestorage.app",
  messagingSenderId: "899532370249",
  appId: "1:899532370249:web:3e77341c8c3d96c2d2aa98"
} as any

// NEW Firebase config (will be loaded from runtime config)
let NEW_FIREBASE_CONFIG: any = null

function getNewFirebaseConfig() {
  if (!NEW_FIREBASE_CONFIG) {
    // Try to get from runtime config (client-side)
    if (typeof window !== 'undefined') {
      const config = useRuntimeConfig()
      NEW_FIREBASE_CONFIG = {
        apiKey: config.public.firebaseApiKey,
        authDomain: config.public.firebaseAuthDomain,
        projectId: config.public.firebaseProjectId,
        storageBucket: config.public.firebaseStorageBucket,
        messagingSenderId: config.public.firebaseMessagingSenderId,
        appId: config.public.firebaseAppId
      }
    } else {
      // Fallback for server-side
      NEW_FIREBASE_CONFIG = {
        apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID
      }
    }
  }
  return NEW_FIREBASE_CONFIG
}

// These will be initialized in the main function
let oldDb: any
let newDb: any
let oldStorage: any
let newStorage: any

// Import the centralized custom UID generator
import { generateCustomUid } from './custom-uid-generator'

// Utility function to clean names for folder structure
function cleanNameForPath(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Download and upload image
async function migrateImage(oldPath: string, newPath: string, oldStorage: any, newStorage: any): Promise<string | null> {
  try {
    console.log(`🔄 Migrando imagen: ${oldPath} → ${newPath}`)
    
    // Download from old storage
    const oldImageRef = storageRef(oldStorage, oldPath)
    const oldUrl = await getDownloadURL(oldImageRef)
    
    // Fetch the image
    const response = await fetch(oldUrl)
    const blob = await response.blob()
    
    // Upload to new storage
    const newImageRef = storageRef(newStorage, newPath)
    await uploadBytes(newImageRef, blob)
    
    // Get new URL
    const newUrl = await getDownloadURL(newImageRef)
    console.log(`✅ Imagen migrada exitosamente: ${newUrl}`)
    
    return newUrl
  } catch (error) {
    console.error(`❌ Error migrando imagen ${oldPath}:`, error)
    return null
  }
}

// Migrate users (athletes, coaches, staff)
async function migrateUsers(oldDb: any, newDb: any, oldStorage: any, newStorage: any) {
  console.log('🚀 Iniciando migración de usuarios...')
  
  const collections = ['athletes', 'coaches', 'staff']
  let totalMigrated = 0
  
  for (const collectionName of collections) {
    console.log(`\n📋 Migrando colección: ${collectionName}`)
    
    try {
      const snapshot = await getDocs(collection(oldDb, collectionName))
      console.log(`📊 Encontrados ${snapshot.size} documentos en ${collectionName}`)
      
      for (const docSnapshot of snapshot.docs) {
        const userData = docSnapshot.data()
        const oldUid = docSnapshot.id
        
        try {
          // Generate custom UID
          const firstName = userData.firstName || userData.fullName?.split(' ')[0] || 'user'
          const lastName = userData.lastName || userData.fullName?.split(' ')[1] || 'user'
          const authUid = userData.authUid || oldUid
          
          const customUid = generateCustomUid({ role: 'coach', firstName, lastName, authUid })
          
          console.log(`🔄 Migrando usuario: ${userData.fullName || userData.email}`)
          console.log(`   Old UID: ${oldUid}`)
          console.log(`   New UID: ${customUid}`)
          
          // Prepare user data for new collection
          const newUserData = {
            ...userData,
            uid: customUid,
            migratedFrom: oldUid,
            migratedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }
          
          // Create document in new collection
          const newDocRef = doc(newDb, collectionName, customUid)
          await setDoc(newDocRef, newUserData)
          
          // Migrate profile image if exists
          if (userData.profileImageUrl && userData.profileImageUrl.includes('firebase')) {
            const cleanName = cleanNameForPath(userData.fullName || firstName)
            const oldImagePath = `${collectionName}/${cleanName}/${cleanName}.webp`
            const newImagePath = `${collectionName}/${cleanName}/${cleanName}.webp`
            
            const newImageUrl = await migrateImage(oldImagePath, newImagePath, oldStorage, newStorage)
            if (newImageUrl) {
              await setDoc(newDocRef, { profileImageUrl: newImageUrl }, { merge: true })
            }
          }
          
          totalMigrated++
          console.log(`✅ Usuario migrado exitosamente`)
          
        } catch (error) {
          console.error(`❌ Error migrando usuario ${oldUid}:`, error)
        }
      }
    } catch (error) {
      console.error(`❌ Error accediendo a colección ${collectionName}:`, error)
    }
  }
  
  console.log(`\n🎉 Migración de usuarios completada: ${totalMigrated} usuarios migrados`)
  return totalMigrated
}

// Migrate exercises
async function migrateExercises(oldDb: any, newDb: any, oldStorage: any, newStorage: any) {
  console.log('\n🚀 Iniciando migración de ejercicios...')
  
  try {
    const snapshot = await getDocs(collection(oldDb, 'exercises'))
    console.log(`📊 Encontrados ${snapshot.size} ejercicios`)
    
    let migratedCount = 0
    
    for (const docSnapshot of snapshot.docs) {
      const exerciseData = docSnapshot.data()
      const exerciseId = docSnapshot.id
      
      try {
        console.log(`🔄 Migrando ejercicio: ${exerciseData.title}`)
        
        // Migrate exercise image if exists
        if (exerciseData.photo && exerciseData.photo.includes('firebase')) {
          const cleanExerciseName = cleanNameForPath(exerciseData.title)
          const oldImagePath = `exercises/${cleanExerciseName}/${cleanExerciseName}.webp`
          const newImagePath = `exercises/${cleanExerciseName}/${cleanExerciseName}.webp`
          
          const newImageUrl = await migrateImage(oldImagePath, newImagePath, oldStorage, newStorage)
          if (newImageUrl) {
            exerciseData.photo = newImageUrl
          }
        }
        
        // Create exercise in new database
        const newDocRef = doc(newDb, 'exercises', exerciseId)
        await setDoc(newDocRef, {
          ...exerciseData,
          migratedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        migratedCount++
        console.log(`✅ Ejercicio migrado: ${exerciseData.title}`)
        
      } catch (error) {
        console.error(`❌ Error migrando ejercicio ${exerciseId}:`, error)
      }
    }
    
    console.log(`🎉 Migración de ejercicios completada: ${migratedCount} ejercicios migrados`)
    return migratedCount
    
  } catch (error) {
    console.error('❌ Error accediendo a ejercicios:', error)
    return 0
  }
}

// Migrate workouts
async function migrateWorkouts(oldDb: any, newDb: any, oldStorage: any, newStorage: any) {
  console.log('\n🚀 Iniciando migración de rutinas...')
  
  try {
    const snapshot = await getDocs(collection(oldDb, 'workouts'))
    console.log(`📊 Encontrados ${snapshot.size} rutinas`)
    
    let migratedCount = 0
    
    for (const docSnapshot of snapshot.docs) {
      const workoutData = docSnapshot.data()
      const workoutId = docSnapshot.id
      
      try {
        console.log(`🔄 Migrando rutina: ${workoutData.title}`)
        
        // Migrate workout image if exists
        if (workoutData.photo && workoutData.photo.includes('firebase')) {
          const cleanWorkoutName = cleanNameForPath(workoutData.title)
          const oldImagePath = `workouts/${cleanWorkoutName}/${cleanWorkoutName}.webp`
          const newImagePath = `workouts/${cleanWorkoutName}/${cleanWorkoutName}.webp`
          
          const newImageUrl = await migrateImage(oldImagePath, newImagePath, oldStorage, newStorage)
          if (newImageUrl) {
            workoutData.photo = newImageUrl
          }
        }
        
        // Create workout in new database
        const newDocRef = doc(newDb, 'workouts', workoutId)
        await setDoc(newDocRef, {
          ...workoutData,
          migratedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        migratedCount++
        console.log(`✅ Rutina migrada: ${workoutData.title}`)
        
      } catch (error) {
        console.error(`❌ Error migrando rutina ${workoutId}:`, error)
      }
    }
    
    console.log(`🎉 Migración de rutinas completada: ${migratedCount} rutinas migradas`)
    return migratedCount
    
  } catch (error) {
    console.error('❌ Error accediendo a rutinas:', error)
    return 0
  }
}

// Migrate other collections
async function migrateOtherCollections(oldDb: any, newDb: any, oldStorage: any, newStorage: any) {
  console.log('\n🚀 Iniciando migración de otras colecciones...')
  
  const collections = ['workoutAssignments', 'workoutLogs']
  let totalMigrated = 0
  
  for (const collectionName of collections) {
    console.log(`\n📋 Migrando colección: ${collectionName}`)
    
    try {
      const snapshot = await getDocs(collection(oldDb, collectionName))
      console.log(`📊 Encontrados ${snapshot.size} documentos en ${collectionName}`)
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data()
        const docId = docSnapshot.id
        
        try {
          // Create document in new collection
          const newDocRef = doc(newDb, collectionName, docId)
          await setDoc(newDocRef, {
            ...data,
            migratedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
          
          totalMigrated++
          
        } catch (error) {
          console.error(`❌ Error migrando documento ${docId}:`, error)
        }
      }
    } catch (error) {
      console.error(`❌ Error accediendo a colección ${collectionName}:`, error)
    }
  }
  
  console.log(`🎉 Migración de otras colecciones completada: ${totalMigrated} documentos migrados`)
  return totalMigrated
}

// Main migration function
export async function migrateToNewFirebase() {
  console.log('🔥 INICIANDO MIGRACIÓN COMPLETA A NUEVO FIREBASE')
  console.log('📊 Proyecto origen:', OLD_FIREBASE_CONFIG.projectId)
  
  // Get new config
  const newConfig = getNewFirebaseConfig()
  console.log('📊 Proyecto destino:', newConfig.projectId)
  console.log('='.repeat(60))
  
  try {
    console.log('🔧 Verificando configuración...')
    
    // Verify old config
    if (!OLD_FIREBASE_CONFIG.apiKey || !OLD_FIREBASE_CONFIG.projectId) {
      throw new Error('Configuración del proyecto anterior incompleta')
    }
    
    // Verify new config
    if (!newConfig.apiKey || !newConfig.projectId) {
      throw new Error('Configuración del proyecto nuevo incompleta')
    }
    
    console.log('✅ Configuración verificada correctamente')
    console.log('🚀 Inicializando Firebase apps...')
    
    // Initialize both Firebase instances
    const oldApp = initializeApp(OLD_FIREBASE_CONFIG, 'old')
    const newApp = initializeApp(newConfig, 'new')
    
    console.log('✅ Firebase apps inicializadas')
    
    const oldDb = getFirestore(oldApp)
    const newDb = getFirestore(newApp)
    const oldStorage = getStorage(oldApp)
    const newStorage = getStorage(newApp)
    
    console.log('✅ Servicios de Firebase inicializados')
    
    const startTime = Date.now()
    
    // Migrate all data
    const usersMigrated = await migrateUsers(oldDb, newDb, oldStorage, newStorage)
    const exercisesMigrated = await migrateExercises(oldDb, newDb, oldStorage, newStorage)
    const workoutsMigrated = await migrateWorkouts(oldDb, newDb, oldStorage, newStorage)
    const othersMigrated = await migrateOtherCollections(oldDb, newDb, oldStorage, newStorage)
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE')
    console.log('='.repeat(60))
    console.log(`⏱️ Tiempo total: ${duration.toFixed(2)} segundos`)
    console.log(`👥 Usuarios migrados: ${usersMigrated}`)
    console.log(`🏋️ Ejercicios migrados: ${exercisesMigrated}`)
    console.log(`📋 Rutinas migradas: ${workoutsMigrated}`)
    console.log(`📄 Otros documentos migrados: ${othersMigrated}`)
    console.log(`📊 Total de documentos migrados: ${usersMigrated + exercisesMigrated + workoutsMigrated + othersMigrated}`)
    console.log('\n✅ Todos los datos han sido migrados al nuevo proyecto Firebase')
    console.log('🔗 Nuevo proyecto:', newConfig.projectId)
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    throw error
  }
}

// Export individual functions for testing
export {
  migrateUsers,
  migrateExercises,
  migrateWorkouts,
  migrateOtherCollections,
  generateCustomUid,
  migrateImage
} 