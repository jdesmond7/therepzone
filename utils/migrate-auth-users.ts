// Script to migrate Firebase Authentication users
// This script migrates users from Firebase Auth (not Firestore documents)

import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'
import { useRuntimeConfig } from '#app'

// OLD Firebase config
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

// Custom UID generator (same as in migration script)
function generateCustomUid(firstName: string, lastName: string, authUid: string): string {
  // Take only the first name (before any space)
  const firstFirstName = firstName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .split(' ')[0] // Solo el primer nombre
  
  // Take only the first last name (before any space)
  const firstLastName = lastName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .split(' ')[0] // Solo el primer apellido
  
  // Get last 5 digits from authUid
  const last5Digits = authUid.slice(-5)
  
  return `${firstFirstName}_${firstLastName}_${last5Digits}`
}

// Main function to migrate authentication users
export async function migrateAuthUsers() {
  console.log('🔥 INICIANDO MIGRACIÓN DE USUARIOS DE AUTHENTICATION')
  console.log('📊 Proyecto origen:', OLD_FIREBASE_CONFIG.projectId)
  
  const newConfig = getNewFirebaseConfig()
  console.log('📊 Proyecto destino:', newConfig.projectId)
  console.log('='.repeat(60))
  
  try {
    console.log('🔧 Verificando configuración...')
    
    // Verify configs
    if (!OLD_FIREBASE_CONFIG.apiKey || !OLD_FIREBASE_CONFIG.projectId) {
      throw new Error('Configuración del proyecto anterior incompleta')
    }
    
    if (!newConfig.apiKey || !newConfig.projectId) {
      throw new Error('Configuración del proyecto nuevo incompleta')
    }
    
    console.log('✅ Configuración verificada correctamente')
    console.log('🚀 Inicializando Firebase apps...')
    
    // Initialize both Firebase instances
    const oldApp = initializeApp(OLD_FIREBASE_CONFIG, 'old-auth')
    const newApp = initializeApp(newConfig, 'new-auth')
    
    console.log('✅ Firebase apps inicializadas')
    
    const oldAuth = getAuth(oldApp)
    const newAuth = getAuth(newApp)
    const oldDb = getFirestore(oldApp)
    const newDb = getFirestore(newApp)
    
    console.log('✅ Servicios de Firebase inicializados')
    
    // Get all users from old project
    console.log('📋 Obteniendo usuarios del proyecto anterior...')
    
    // Note: listUsers requires Firebase Admin SDK, which we can't use in browser
    // Instead, we'll get users from Firestore and try to recreate them
    
    const collections = ['athletes', 'coaches', 'staff']
    let totalMigrated = 0
    let totalSkipped = 0
    
    for (const collectionName of collections) {
      console.log(`\n📋 Procesando colección: ${collectionName}`)
      
      try {
        const snapshot = await getDocs(collection(oldDb, collectionName))
        console.log(`📊 Encontrados ${snapshot.size} documentos en ${collectionName}`)
        
        for (const docSnapshot of snapshot.docs) {
          const userData = docSnapshot.data()
          const oldUid = docSnapshot.id
          
          try {
            // Check if user has email and password
            if (!userData.email || !userData.password) {
              console.log(`⏭️ Saltando usuario ${userData.fullName || userData.email} - sin email o password`)
              totalSkipped++
              continue
            }
            
            console.log(`🔄 Migrando usuario de auth: ${userData.email}`)
            
            // Generate custom UID
            const firstName = userData.firstName || userData.fullName?.split(' ')[0] || 'user'
            const lastName = userData.lastName || userData.fullName?.split(' ')[1] || 'user'
            const authUid = userData.authUid || oldUid
            
            const customUid = generateCustomUid(firstName, lastName, authUid)
            
            // Try to create user in new project
            try {
              // Note: We can't create users with custom UIDs from client-side
              // We'll create them with email/password and update the document
              const userCredential = await createUserWithEmailAndPassword(
                newAuth, 
                userData.email, 
                userData.password
              )
              
              const newUid = userCredential.user.uid
              console.log(`✅ Usuario de auth creado: ${userData.email} (${newUid})`)
              
              // Update the user document with new auth UID
              const newDocRef = doc(newDb, collectionName, customUid)
              await setDoc(newDocRef, { 
                authUid: newUid,
                migratedFromAuth: oldUid,
                authMigratedAt: serverTimestamp()
              }, { merge: true })
              
              totalMigrated++
              
            } catch (authError: any) {
              if (authError.code === 'auth/email-already-in-use') {
                console.log(`⚠️ Usuario ya existe: ${userData.email}`)
                totalSkipped++
              } else {
                console.error(`❌ Error creando usuario de auth ${userData.email}:`, authError)
                totalSkipped++
              }
            }
            
          } catch (error) {
            console.error(`❌ Error procesando usuario ${oldUid}:`, error)
            totalSkipped++
          }
        }
      } catch (error) {
        console.error(`❌ Error accediendo a colección ${collectionName}:`, error)
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 MIGRACIÓN DE AUTH COMPLETADA')
    console.log('='.repeat(60))
    console.log(`✅ Usuarios de auth migrados: ${totalMigrated}`)
    console.log(`⏭️ Usuarios saltados: ${totalSkipped}`)
    console.log(`📊 Total procesados: ${totalMigrated + totalSkipped}`)
    console.log('\n✅ Los usuarios de authentication han sido migrados')
    console.log('🔗 Nuevo proyecto:', newConfig.projectId)
    
    return { migrated: totalMigrated, skipped: totalSkipped }
    
  } catch (error) {
    console.error('❌ Error durante la migración de auth:', error)
    throw error
  }
} 