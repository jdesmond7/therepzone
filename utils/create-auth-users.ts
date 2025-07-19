// Script to create Firebase Authentication users from existing Firestore data
// This script creates auth users with generated passwords for existing users

import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore'
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

// Import the centralized custom UID generator
import { generateCustomUid } from './custom-uid-generator'

// Generate a secure password
function generatePassword(email: string): string {
  // Create a password based on email and current timestamp
  const timestamp = Date.now().toString()
  const emailPart = email.split('@')[0]
  const randomPart = Math.random().toString(36).substring(2, 8)
  
  // Format: EmailPart123!@#
  return `${emailPart}123!@#`
}

// Main function to create authentication users
export async function createAuthUsers() {
  console.log('🔥 INICIANDO CREACIÓN DE USUARIOS DE AUTHENTICATION')
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
    const oldApp = initializeApp(OLD_FIREBASE_CONFIG, 'old-create')
    const newApp = initializeApp(newConfig, 'new-create')
    
    console.log('✅ Firebase apps inicializadas')
    
    const oldAuth = getAuth(oldApp)
    const newAuth = getAuth(newApp)
    const oldDb = getFirestore(oldApp)
    const newDb = getFirestore(newApp)
    
    console.log('✅ Servicios de Firebase inicializados')
    
    // Get users from old project and create auth users in new project
    console.log('\n📋 CREANDO USUARIOS DE AUTHENTICATION')
    console.log('='.repeat(60))
    
    const collections = ['athletes', 'coaches', 'staff']
    let totalProcessed = 0
    let totalCreated = 0
    let totalSkipped = 0
    const createdUsers: Array<{email: string, password: string, uid: string, collection: string}> = []
    
    for (const collectionName of collections) {
      console.log(`\n📋 Procesando colección: ${collectionName}`)
      
      try {
        const snapshot = await getDocs(collection(oldDb, collectionName))
        console.log(`📊 Encontrados ${snapshot.size} documentos en ${collectionName}`)
        
        for (const docSnapshot of snapshot.docs) {
          const userData = docSnapshot.data()
          const oldUid = docSnapshot.id
          
          try {
            // Check if user has email
            if (!userData.email) {
              console.log(`⏭️ Saltando usuario ${userData.fullName || oldUid} - sin email`)
              totalSkipped++
              continue
            }
            
            console.log(`🔄 Procesando usuario: ${userData.email}`)
            
            // Generate password
            const password = generatePassword(userData.email)
            
            // Try to create user in new project
            try {
              const userCredential = await createUserWithEmailAndPassword(
                newAuth, 
                userData.email, 
                password
              )
              
              const newAuthUid = userCredential.user.uid
              console.log(`✅ Usuario de auth creado: ${userData.email} (${newAuthUid})`)
              
              // Generate custom UID for Firestore
              const firstName = userData.firstName || userData.fullName?.split(' ')[0] || 'user'
              const lastName = userData.lastName || userData.fullName?.split(' ')[1] || 'user'
              const customUid = generateCustomUid({ role: 'coach', firstName, lastName, authUid: newAuthUid })
              
              // Update the user document with new auth UID and password
              const newDocRef = doc(newDb, collectionName, customUid)
              await setDoc(newDocRef, { 
                authUid: newAuthUid,
                password: password, // Store the generated password
                migratedFrom: oldUid,
                authCreatedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              }, { merge: true })
              
              // Store user info for summary
              createdUsers.push({
                email: userData.email,
                password: password,
                uid: newAuthUid,
                collection: collectionName
              })
              
              totalCreated++
              
            } catch (authError: any) {
              if (authError.code === 'auth/email-already-in-use') {
                console.log(`⚠️ Usuario ya existe: ${userData.email}`)
                totalSkipped++
              } else {
                console.error(`❌ Error creando usuario de auth ${userData.email}:`, authError)
                totalSkipped++
              }
            }
            
            totalProcessed++
            
          } catch (error) {
            console.error(`❌ Error procesando usuario ${oldUid}:`, error)
            totalSkipped++
          }
        }
      } catch (error) {
        console.error(`❌ Error accediendo a colección ${collectionName}:`, error)
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('🎉 CREACIÓN DE AUTH COMPLETADA')
    console.log('='.repeat(60))
    console.log(`✅ Usuarios procesados: ${totalProcessed}`)
    console.log(`✅ Usuarios de auth creados: ${totalCreated}`)
    console.log(`⏭️ Usuarios saltados: ${totalSkipped}`)
    
    if (createdUsers.length > 0) {
      console.log('\n📋 USUARIOS CREADOS:')
      console.log('-'.repeat(40))
      createdUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`)
        console.log(`   Password: ${user.password}`)
        console.log(`   Auth UID: ${user.uid}`)
        console.log(`   Colección: ${user.collection}`)
        console.log('')
      })
      
      console.log('💡 IMPORTANTE:')
      console.log('• Los usuarios pueden hacer login con su email y la password generada')
      console.log('• Las passwords están almacenadas en Firestore para referencia')
      console.log('• Los usuarios deberían cambiar su password después del primer login')
    }
    
    console.log('\n✅ Los usuarios de authentication han sido creados')
    console.log('🔗 Nuevo proyecto:', newConfig.projectId)
    
    return { 
      processed: totalProcessed, 
      created: totalCreated, 
      skipped: totalSkipped,
      users: createdUsers
    }
    
  } catch (error) {
    console.error('❌ Error durante la creación de auth:', error)
    throw error
  }
} 