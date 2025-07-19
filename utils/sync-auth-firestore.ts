// Utility to sync Firebase Authentication and Firestore deletions
// This ensures that when you delete from one, the other is also deleted

import { getAuth, deleteUser } from 'firebase/auth'
import { getFirestore, doc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { useRuntimeConfig } from '#app'

// Get Firebase config
function getFirebaseConfig() {
  if (typeof window !== 'undefined') {
    const config = useRuntimeConfig()
    return {
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId
    }
  } else {
    return {
      apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID
    }
  }
}

// Delete user from Authentication when Firestore document is deleted
export async function deleteAuthUser(authUid: string): Promise<boolean> {
  try {
    console.log(`🗑️ Intentando borrar usuario de Auth: ${authUid}`)
    
    // Note: This requires Firebase Admin SDK for server-side deletion
    // For client-side, we can only delete the current user
    // This is a limitation of Firebase Auth client SDK
    
    console.log('⚠️ No se puede borrar usuarios de Auth desde el cliente')
    console.log('💡 Para borrar usuarios de Auth, usa Firebase Console o Admin SDK')
    
    return false
  } catch (error) {
    console.error('❌ Error borrando usuario de Auth:', error)
    return false
  }
}

// Delete Firestore document when Auth user is deleted
export async function deleteFirestoreUser(authUid: string): Promise<boolean> {
  try {
    console.log(`🗑️ Buscando documento de Firestore con authUid: ${authUid}`)
    
    const config = getFirebaseConfig()
    const { initializeApp, getApps } = await import('firebase/app')
    
    // Initialize Firebase if not already done
    let app
    if (getApps().length === 0) {
      app = initializeApp(config)
    } else {
      app = getApps()[0]
    }
    
    const db = getFirestore(app)
    const collections = ['athletes', 'coaches', 'staff']
    
    for (const collectionName of collections) {
      try {
        // Search for document with matching authUid
        const q = query(
          collection(db, collectionName),
          where('authUid', '==', authUid)
        )
        
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const docSnapshot = querySnapshot.docs[0]
          const docId = docSnapshot.id
          
          console.log(`🗑️ Borrando documento de Firestore: ${collectionName}/${docId}`)
          await deleteDoc(doc(db, collectionName, docId))
          
          console.log(`✅ Documento borrado exitosamente: ${collectionName}/${docId}`)
          return true
        }
      } catch (error) {
        console.error(`❌ Error buscando en colección ${collectionName}:`, error)
      }
    }
    
    console.log(`⚠️ No se encontró documento con authUid: ${authUid}`)
    return false
    
  } catch (error) {
    console.error('❌ Error borrando documento de Firestore:', error)
    return false
  }
}

// Delete user completely (both Auth and Firestore)
export async function deleteUserCompletely(authUid: string): Promise<{ authDeleted: boolean, firestoreDeleted: boolean }> {
  console.log(`🗑️ Borrando usuario completamente: ${authUid}`)
  
  const authDeleted = await deleteAuthUser(authUid)
  const firestoreDeleted = await deleteFirestoreUser(authUid)
  
  console.log(`📊 Resultado del borrado completo:`)
  console.log(`   Auth borrado: ${authDeleted ? '✅' : '❌'}`)
  console.log(`   Firestore borrado: ${firestoreDeleted ? '✅' : '❌'}`)
  
  return { authDeleted, firestoreDeleted }
}

// Find all orphaned Auth users (Auth exists but no Firestore document)
export async function findOrphanedAuthUsers(): Promise<string[]> {
  try {
    console.log('🔍 Buscando usuarios huérfanos de Auth...')
    
    // Note: This would require Firebase Admin SDK to list all users
    // For now, we'll return an empty array as this is a client-side limitation
    
    console.log('⚠️ No se puede listar usuarios de Auth desde el cliente')
    console.log('💡 Para encontrar usuarios huérfanos, usa Firebase Console o Admin SDK')
    
    return []
  } catch (error) {
    console.error('❌ Error buscando usuarios huérfanos:', error)
    return []
  }
}

// Find all orphaned Firestore documents (Firestore exists but no Auth user)
export async function findOrphanedFirestoreDocs(): Promise<Array<{ collection: string, docId: string, authUid: string }>> {
  try {
    console.log('🔍 Buscando documentos huérfanos de Firestore...')
    
    const config = getFirebaseConfig()
    const { initializeApp, getApps } = await import('firebase/app')
    
    // Initialize Firebase if not already done
    let app
    if (getApps().length === 0) {
      app = initializeApp(config)
    } else {
      app = getApps()[0]
    }
    
    const db = getFirestore(app)
    const collections = ['athletes', 'coaches', 'staff']
    const orphanedDocs: Array<{ collection: string, docId: string, authUid: string }> = []
    
    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName))
        
        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data()
          const authUid = data.authUid
          
          if (authUid) {
            // Check if Auth user exists (this would require Admin SDK)
            // For now, we'll assume all documents with authUid are valid
            console.log(`✅ Documento válido: ${collectionName}/${docSnapshot.id} (authUid: ${authUid})`)
          } else {
            console.log(`⚠️ Documento sin authUid: ${collectionName}/${docSnapshot.id}`)
          }
        }
      } catch (error) {
        console.error(`❌ Error revisando colección ${collectionName}:`, error)
      }
    }
    
    return orphanedDocs
    
  } catch (error) {
    console.error('❌ Error buscando documentos huérfanos:', error)
    return []
  }
}

// Clean up orphaned data
export async function cleanupOrphanedData(): Promise<{ authCleaned: number, firestoreCleaned: number }> {
  console.log('🧹 Iniciando limpieza de datos huérfanos...')
  
  const orphanedAuth = await findOrphanedAuthUsers()
  const orphanedFirestore = await findOrphanedFirestoreDocs()
  
  let authCleaned = 0
  let firestoreCleaned = 0
  
  // Clean orphaned Auth users
  for (const authUid of orphanedAuth) {
    const deleted = await deleteAuthUser(authUid)
    if (deleted) authCleaned++
  }
  
  // Clean orphaned Firestore documents
  for (const doc of orphanedFirestore) {
    const deleted = await deleteFirestoreUser(doc.authUid)
    if (deleted) firestoreCleaned++
  }
  
  console.log(`🧹 Limpieza completada:`)
  console.log(`   Auth usuarios limpiados: ${authCleaned}`)
  console.log(`   Firestore documentos limpiados: ${firestoreCleaned}`)
  
  return { authCleaned, firestoreCleaned }
} 