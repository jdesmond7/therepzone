// Debug script to check user data in Firestore
// This will help us understand why users are being skipped in auth migration

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
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

// Main function to debug user data
export async function debugUsers() {
  console.log('🔍 INICIANDO DEBUG DE USUARIOS')
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
    const oldApp = initializeApp(OLD_FIREBASE_CONFIG, 'old-debug')
    const newApp = initializeApp(newConfig, 'new-debug')
    
    console.log('✅ Firebase apps inicializadas')
    
    const oldDb = getFirestore(oldApp)
    const newDb = getFirestore(newApp)
    
    console.log('✅ Servicios de Firebase inicializados')
    
    // Debug users from old project
    console.log('\n📋 DEBUGGING USUARIOS DEL PROYECTO ANTERIOR')
    console.log('='.repeat(60))
    
    const collections = ['athletes', 'coaches', 'staff']
    let totalUsers = 0
    let usersWithEmail = 0
    let usersWithPassword = 0
    let usersWithBoth = 0
    
    for (const collectionName of collections) {
      console.log(`\n📋 Colección: ${collectionName}`)
      console.log('-'.repeat(40))
      
      try {
        const snapshot = await getDocs(collection(oldDb, collectionName))
        console.log(`📊 Total documentos: ${snapshot.size}`)
        
        for (const docSnapshot of snapshot.docs) {
          const userData = docSnapshot.data()
          const userId = docSnapshot.id
          
          totalUsers++
          
          console.log(`\n👤 Usuario: ${userData.fullName || userData.email || userId}`)
          console.log(`   ID: ${userId}`)
          console.log(`   Email: ${userData.email || '❌ NO TIENE'}`)
          console.log(`   Password: ${userData.password ? '✅ TIENE' : '❌ NO TIENE'}`)
          console.log(`   Auth UID: ${userData.authUid || '❌ NO TIENE'}`)
          console.log(`   Role: ${userData.role || '❌ NO TIENE'}`)
          
          if (userData.email) usersWithEmail++
          if (userData.password) usersWithPassword++
          if (userData.email && userData.password) usersWithBoth++
          
          // Show all fields for debugging
          console.log(`   📋 Todos los campos:`)
          Object.keys(userData).forEach(key => {
            const value = userData[key]
            if (typeof value === 'string' && value.length > 50) {
              console.log(`     ${key}: ${value.substring(0, 50)}...`)
            } else {
              console.log(`     ${key}: ${value}`)
            }
          })
        }
      } catch (error) {
        console.error(`❌ Error accediendo a colección ${collectionName}:`, error)
      }
    }
    
    // Debug users from new project
    console.log('\n📋 DEBUGGING USUARIOS DEL PROYECTO NUEVO')
    console.log('='.repeat(60))
    
    let newTotalUsers = 0
    
    for (const collectionName of collections) {
      console.log(`\n📋 Colección: ${collectionName}`)
      console.log('-'.repeat(40))
      
      try {
        const snapshot = await getDocs(collection(newDb, collectionName))
        console.log(`📊 Total documentos: ${snapshot.size}`)
        
        for (const docSnapshot of snapshot.docs) {
          const userData = docSnapshot.data()
          const userId = docSnapshot.id
          
          newTotalUsers++
          
          console.log(`\n👤 Usuario: ${userData.fullName || userData.email || userId}`)
          console.log(`   ID: ${userId}`)
          console.log(`   Email: ${userData.email || '❌ NO TIENE'}`)
          console.log(`   Password: ${userData.password ? '✅ TIENE' : '❌ NO TIENE'}`)
          console.log(`   Auth UID: ${userData.authUid || '❌ NO TIENE'}`)
          console.log(`   Migrated From: ${userData.migratedFrom || '❌ NO TIENE'}`)
        }
      } catch (error) {
        console.error(`❌ Error accediendo a colección ${collectionName}:`, error)
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN DE DEBUG')
    console.log('='.repeat(60))
    console.log(`📊 Proyecto anterior:`)
    console.log(`   Total usuarios: ${totalUsers}`)
    console.log(`   Con email: ${usersWithEmail}`)
    console.log(`   Con password: ${usersWithPassword}`)
    console.log(`   Con email Y password: ${usersWithBoth}`)
    console.log(`   Migrables: ${usersWithBoth}`)
    console.log(`\n📊 Proyecto nuevo:`)
    console.log(`   Total usuarios: ${newTotalUsers}`)
    console.log(`   Migrados: ${newTotalUsers}`)
    
    return {
      oldProject: {
        total: totalUsers,
        withEmail: usersWithEmail,
        withPassword: usersWithPassword,
        withBoth: usersWithBoth
      },
      newProject: {
        total: newTotalUsers
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante el debug:', error)
    throw error
  }
} 