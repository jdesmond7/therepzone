// Script to clean the Firebase database and remove all test data
import { getFirebaseDb } from '~/composables/firebase'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'

export async function cleanDatabase() {
  try {
    console.log('🧹 Iniciando limpieza de la base de datos...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    console.log('✅ Firebase inicializado correctamente')

    // Collections to clean
    const collectionsToClean = [
      'athletes',
      'coaches', 
      'staff',
      'exercises',
      'workouts',
      'workoutAssignments',
      'workoutLogs',
      'test'
    ]

    let totalDeleted = 0

    for (const collectionName of collectionsToClean) {
      console.log(`\n🗑️ Limpiando colección: ${collectionName}`)
      
      try {
        const snapshot = await getDocs(collection(db, collectionName))
        console.log(`📊 Encontrados ${snapshot.size} documentos en ${collectionName}`)
        
        if (snapshot.size === 0) {
          console.log(`✅ Colección ${collectionName} ya está vacía`)
          continue
        }

        // Delete all documents in the collection
        const deletePromises = snapshot.docs.map(async (docSnapshot) => {
          try {
            await deleteDoc(doc(db, collectionName, docSnapshot.id))
            console.log(`🗑️ Eliminado: ${collectionName}/${docSnapshot.id}`)
            return 1
          } catch (error) {
            console.error(`❌ Error eliminando ${collectionName}/${docSnapshot.id}:`, error)
            return 0
          }
        })

        const deletedCount = await Promise.all(deletePromises)
        const successfulDeletes = deletedCount.reduce((sum: number, count: number) => sum + count, 0)
        
        totalDeleted += successfulDeletes
        console.log(`✅ ${successfulDeletes} documentos eliminados de ${collectionName}`)
        
      } catch (error) {
        console.error(`❌ Error accediendo a colección ${collectionName}:`, error)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 LIMPIEZA COMPLETADA EXITOSAMENTE')
    console.log('='.repeat(50))
    console.log(`🗑️ Total de documentos eliminados: ${totalDeleted}`)
    console.log('✅ Base de datos limpia y lista para la migración')
    console.log('🔗 Proyecto: therepzone1')
    
    return {
      success: true,
      documentsDeleted: totalDeleted
    }
    
  } catch (error: any) {
    console.error('❌ Error durante la limpieza:')
    console.error('Error:', error.message)
    console.error('Code:', error.code)
    
    return {
      success: false,
      error: error.message,
      code: error.code
    }
  }
} 