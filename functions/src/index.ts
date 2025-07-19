import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Initialize Firebase Admin
admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()

// Function to delete user from Auth when athletes document is deleted
export const onAthleteDeleted = functions.firestore
  .document('athletes/{docId}')
  .onDelete(async (snap, context) => {
    const deletedData = snap.data()
    const docId = context.params.docId
    
    console.log(`🗑️ Documento borrado: athletes/${docId}`)
    
    // Check if the deleted document had an authUid
    if (deletedData && deletedData.authUid) {
      const authUid = deletedData.authUid
      console.log(`🔍 Documento tenía authUid: ${authUid}`)
      
      try {
        // Try to delete the Auth user
        await auth.deleteUser(authUid)
        console.log(`✅ Usuario de Auth borrado exitosamente: ${authUid}`)
        
        return {
          success: true,
          message: `Auth user ${authUid} deleted successfully`,
          authUid: authUid
        }
      } catch (error: any) {
        console.error(`❌ Error borrando usuario de Auth ${authUid}:`, error.message)
        
        // If user doesn't exist in Auth, that's fine
        if (error.code === 'auth/user-not-found') {
          console.log(`ℹ️ Usuario de Auth ${authUid} no existe (ya fue borrado)`)
          return {
            success: true,
            message: `Auth user ${authUid} was already deleted`,
            authUid: authUid
          }
        }
        
        return {
          success: false,
          error: error.message,
          authUid: authUid
        }
      }
    } else {
      console.log(`ℹ️ Documento athletes/${docId} no tenía authUid`)
      return {
        success: true,
        message: `Document athletes/${docId} had no authUid`
      }
    }
  })

// Function to delete user from Auth when coaches document is deleted
export const onCoachDeleted = functions.firestore
  .document('coaches/{docId}')
  .onDelete(async (snap, context) => {
    const deletedData = snap.data()
    const docId = context.params.docId
    
    console.log(`🗑️ Documento borrado: coaches/${docId}`)
    
    // Check if the deleted document had an authUid
    if (deletedData && deletedData.authUid) {
      const authUid = deletedData.authUid
      console.log(`🔍 Documento tenía authUid: ${authUid}`)
      
      try {
        // Try to delete the Auth user
        await auth.deleteUser(authUid)
        console.log(`✅ Usuario de Auth borrado exitosamente: ${authUid}`)
        
        return {
          success: true,
          message: `Auth user ${authUid} deleted successfully`,
          authUid: authUid
        }
      } catch (error: any) {
        console.error(`❌ Error borrando usuario de Auth ${authUid}:`, error.message)
        
        // If user doesn't exist in Auth, that's fine
        if (error.code === 'auth/user-not-found') {
          console.log(`ℹ️ Usuario de Auth ${authUid} no existe (ya fue borrado)`)
          return {
            success: true,
            message: `Auth user ${authUid} was already deleted`,
            authUid: authUid
          }
        }
        
        return {
          success: false,
          error: error.message,
          authUid: authUid
        }
      }
    } else {
      console.log(`ℹ️ Documento coaches/${docId} no tenía authUid`)
      return {
        success: true,
        message: `Document coaches/${docId} had no authUid`
      }
    }
  })

// Function to delete user from Auth when staff document is deleted
export const onStaffDeleted = functions.firestore
  .document('staff/{docId}')
  .onDelete(async (snap, context) => {
    const deletedData = snap.data()
    const docId = context.params.docId
    
    console.log(`🗑️ Documento borrado: staff/${docId}`)
    
    // Check if the deleted document had an authUid
    if (deletedData && deletedData.authUid) {
      const authUid = deletedData.authUid
      console.log(`🔍 Documento tenía authUid: ${authUid}`)
      
      try {
        // Try to delete the Auth user
        await auth.deleteUser(authUid)
        console.log(`✅ Usuario de Auth borrado exitosamente: ${authUid}`)
        
        return {
          success: true,
          message: `Auth user ${authUid} deleted successfully`,
          authUid: authUid
        }
      } catch (error: any) {
        console.error(`❌ Error borrando usuario de Auth ${authUid}:`, error.message)
        
        // If user doesn't exist in Auth, that's fine
        if (error.code === 'auth/user-not-found') {
          console.log(`ℹ️ Usuario de Auth ${authUid} no existe (ya fue borrado)`)
          return {
            success: true,
            message: `Auth user ${authUid} was already deleted`,
            authUid: authUid
          }
        }
        
        return {
          success: false,
          error: error.message,
          authUid: authUid
        }
      }
    } else {
      console.log(`ℹ️ Documento staff/${docId} no tenía authUid`)
      return {
        success: true,
        message: `Document staff/${docId} had no authUid`
      }
    }
  })

// Function to delete Firestore document when Auth user is deleted
export const onAuthUserDel = functions.auth.user().onDelete(async (user) => {
  const authUid = user.uid
  console.log(`🗑️ Usuario de Auth borrado: ${authUid}`)
  
  try {
    // Search for documents with this authUid in all collections
    const collections = ['athletes', 'coaches', 'staff']
    let deletedCount = 0
    
    for (const collectionName of collections) {
      const querySnapshot = await db.collection(collectionName)
        .where('authUid', '==', authUid)
        .get()
      
      if (!querySnapshot.empty) {
        const batch = db.batch()
        
        querySnapshot.docs.forEach((doc) => {
          console.log(`🗑️ Borrando documento: ${collectionName}/${doc.id}`)
          batch.delete(doc.ref)
          deletedCount++
        })
        
        await batch.commit()
        console.log(`✅ ${deletedCount} documentos borrados de ${collectionName}`)
      }
    }
    
    console.log(`📊 Total de documentos borrados: ${deletedCount}`)
    
    return {
      success: true,
      message: `${deletedCount} Firestore documents deleted for Auth user ${authUid}`,
      authUid: authUid,
      deletedCount: deletedCount
    }
    
  } catch (error: any) {
    console.error(`❌ Error borrando documentos de Firestore para Auth user ${authUid}:`, error.message)
    
    return {
      success: false,
      error: error.message,
      authUid: authUid
    }
  }
})

// HTTP function to manually delete a user completely
export const deleteUserCompletely = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and has admin role
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }
  
  const { authUid } = data
  
  if (!authUid) {
    throw new functions.https.HttpsError('invalid-argument', 'authUid is required')
  }
  
  console.log(`🗑️ Borrado manual de usuario: ${authUid}`)
  
  try {
    let authDeleted = false
    let firestoreDeleted = 0
    
    // First, delete Firestore documents
    const collections = ['athletes', 'coaches', 'staff']
    
    for (const collectionName of collections) {
      const querySnapshot = await db.collection(collectionName)
        .where('authUid', '==', authUid)
        .get()
      
      if (!querySnapshot.empty) {
        const batch = db.batch()
        
        querySnapshot.docs.forEach((doc) => {
          console.log(`🗑️ Borrando documento: ${collectionName}/${doc.id}`)
          batch.delete(doc.ref)
          firestoreDeleted++
        })
        
        await batch.commit()
      }
    }
    
    // Then, try to delete Auth user
    try {
      await auth.deleteUser(authUid)
      authDeleted = true
      console.log(`✅ Usuario de Auth borrado: ${authUid}`)
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log(`ℹ️ Usuario de Auth ${authUid} no existe`)
        authDeleted = true // Consider it "deleted" if it doesn't exist
      } else {
        console.error(`❌ Error borrando usuario de Auth ${authUid}:`, error.message)
        throw error
      }
    }
    
    return {
      success: true,
      message: `User ${authUid} deleted completely`,
      authUid: authUid,
      authDeleted: authDeleted,
      firestoreDeleted: firestoreDeleted
    }
    
  } catch (error: any) {
    console.error(`❌ Error en borrado completo de usuario ${authUid}:`, error.message)
    throw new functions.https.HttpsError('internal', error.message)
  }
})

// HTTP function to find orphaned data
export const findOrphanedData = functions.https.onCall(async (data, context) => {
  // Allow access without authentication for analysis (admin function)
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  // }
  
  console.log('🔍 Buscando datos huérfanos...')
  
  try {
    const collections = ['athletes', 'coaches', 'staff']
    const orphanedDocs: Array<{ collection: string, docId: string, authUid: string }> = []
    const orphanedAuth: string[] = []
    
    // Find Firestore documents without valid Auth users
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get()
      
      for (const doc of snapshot.docs) {
        const data = doc.data()
        if (data.authUid) {
          try {
            // Check if Auth user exists
            await auth.getUser(data.authUid)
          } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
              orphanedDocs.push({
                collection: collectionName,
                docId: doc.id,
                authUid: data.authUid
              })
            }
          }
        }
      }
    }
    
    // Find Auth users without Firestore documents
    const listUsersResult = await auth.listUsers()
    
    for (const userRecord of listUsersResult.users) {
      let hasDocument = false
      
      for (const collectionName of collections) {
        const querySnapshot = await db.collection(collectionName)
          .where('authUid', '==', userRecord.uid)
          .limit(1)
          .get()
        
        if (!querySnapshot.empty) {
          hasDocument = true
          break
        }
      }
      
      if (!hasDocument) {
        orphanedAuth.push(userRecord.uid)
      }
    }
    
    return {
      success: true,
      orphanedDocs: orphanedDocs,
      orphanedAuth: orphanedAuth,
      summary: {
        orphanedDocsCount: orphanedDocs.length,
        orphanedAuthCount: orphanedAuth.length
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error buscando datos huérfanos:', error.message)
    throw new functions.https.HttpsError('internal', error.message)
  }
})

// HTTP function to cleanup orphaned data
export const cleanupOrphanedData = functions.https.onCall(async (data, context) => {
  // Allow access without authentication for cleanup (admin function)
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  // }
  
  console.log('🧹 Iniciando limpieza de datos huérfanos...')
  
  try {
    const collections = ['athletes', 'coaches', 'staff']
    let firestoreCleaned = 0
    let authCleaned = 0
    
    // Clean orphaned Firestore documents
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get()
      
      for (const doc of snapshot.docs) {
        const data = doc.data()
        if (data.authUid) {
          try {
            // Check if Auth user exists
            await auth.getUser(data.authUid)
          } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
              console.log(`🗑️ Borrando documento huérfano: ${collectionName}/${doc.id}`)
              await doc.ref.delete()
              firestoreCleaned++
            }
          }
        }
      }
    }
    
    // Clean orphaned Auth users
    const listUsersResult = await auth.listUsers()
    
    for (const userRecord of listUsersResult.users) {
      let hasDocument = false
      
      for (const collectionName of collections) {
        const querySnapshot = await db.collection(collectionName)
          .where('authUid', '==', userRecord.uid)
          .limit(1)
          .get()
        
        if (!querySnapshot.empty) {
          hasDocument = true
          break
        }
      }
      
      if (!hasDocument) {
        console.log(`🗑️ Borrando usuario de Auth huérfano: ${userRecord.uid}`)
        await auth.deleteUser(userRecord.uid)
        authCleaned++
      }
    }
    
    return {
      success: true,
      message: 'Orphaned data cleanup completed',
      summary: {
        firestoreCleaned: firestoreCleaned,
        authCleaned: authCleaned
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error limpiando datos huérfanos:', error.message)
    throw new functions.https.HttpsError('internal', error.message)
  }
}) 