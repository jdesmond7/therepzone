const admin = require('firebase-admin')
const serviceAccount = require('../therepvana-3cbde07d03d0.json')

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'therepvana'
})

const db = admin.firestore()

// Helper function to generate custom UID
function generateCustomUID(firstName, lastName, originalUID) {
  // Clean and normalize names
  const cleanFirstName = (firstName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '')
  const cleanLastName = (lastName || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  
  // Get last 5 characters of original UID
  const last5 = originalUID.slice(-5)
  
  // Generate custom UID
  if (cleanLastName) {
    return `${cleanFirstName}_${cleanLastName}_${last5}`
  } else {
    return `${cleanFirstName}_${last5}`
  }
}

// Helper function to check if custom UID already exists
async function checkUIDExists(collection, customUID) {
  const docRef = db.collection(collection).doc(customUID)
  const doc = await docRef.get()
  return doc.exists
}

// Helper function to generate unique UID
async function generateUniqueUID(firstName, lastName, originalUID, collection) {
  let customUID = generateCustomUID(firstName, lastName, originalUID)
  let counter = 1
  
  while (await checkUIDExists(collection, customUID)) {
    customUID = generateCustomUID(firstName, lastName, originalUID) + `_${counter}`
    counter++
  }
  
  return customUID
}

async function migrateToCustomUIDs() {
  try {
    console.log('🚀 Iniciando migración a UIDs personalizados...')
    
    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get()
    
    if (usersSnapshot.empty) {
      console.log('📭 No se encontraron usuarios en Firestore')
      return
    }
    
    console.log(`📊 Encontrados ${usersSnapshot.size} usuarios para migrar`)
    
    const migrationResults = {
      coaches: { success: 0, errors: 0, details: [] },
      athletes: { success: 0, errors: 0, details: [] },
      admins: { success: 0, errors: 0, details: [] },
      skipped: 0
    }
    
    // First pass: collect all data and generate new UIDs
    const migrationData = []
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data()
      const currentUID = userDoc.id
      
      console.log(`\n🔄 Procesando usuario: ${currentUID}`)
      console.log(`   Nombre: ${userData.fullName || userData.firstName || 'Unknown'}`)
      console.log(`   Rol: ${userData.role}`)
      console.log(`   Email: ${userData.email}`)
      
      // Determine target collection based on role
      let targetCollection
      switch (userData.role) {
        case 'coach':
          targetCollection = 'coaches'
          break
        case 'client':
          targetCollection = 'athletes'
          break
        case 'admin':
          targetCollection = 'admins'
          break
        default:
          console.log(`   ⚠️ Rol desconocido: ${userData.role}, saltando...`)
          migrationResults.skipped++
          continue
      }
      
      // Generate custom UID
      const customUID = await generateUniqueUID(
        userData.firstName || userData.fullName?.split(' ')[0],
        userData.lastName || userData.fullName?.split(' ').slice(1).join(' '),
        currentUID,
        targetCollection
      )
      
      console.log(`   🆔 Nuevo UID: ${customUID}`)
      console.log(`   📁 Colección destino: ${targetCollection}`)
      
      migrationData.push({
        oldUID: currentUID,
        newUID: customUID,
        targetCollection,
        userData,
        originalUID: currentUID
      })
    }
    
    // Second pass: perform the migration
    console.log('\n🔄 Iniciando migración de documentos...')
    
    for (const data of migrationData) {
      try {
        const { oldUID, newUID, targetCollection, userData, originalUID } = data
        
        console.log(`\n📝 Migrando: ${oldUID} → ${newUID} (${targetCollection})`)
        
        // Prepare data for new document
        const newDocumentData = {
          ...userData,
          authUid: originalUID, // Keep reference to original Firebase Auth UID
          uid: newUID, // Update uid field
          migratedFrom: oldUID, // Track migration
          migratedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
        
        // Create new document in target collection
        const newDocRef = db.collection(targetCollection).doc(newUID)
        await newDocRef.set(newDocumentData)
        
        console.log(`   ✅ Documento creado en ${targetCollection}`)
        
        // Track success
        migrationResults[targetCollection].success++
        migrationResults[targetCollection].details.push({
          oldUID,
          newUID,
          name: userData.fullName || userData.firstName || 'Unknown',
          email: userData.email
        })
        
      } catch (error) {
        console.error(`   ❌ Error migrando ${data.oldUID}:`, error.message)
        migrationResults[data.targetCollection].errors++
        migrationResults[data.targetCollection].details.push({
          oldUID: data.oldUID,
          error: error.message
        })
      }
    }
    
    // Third pass: update cross-references (coachId in athletes)
    console.log('\n🔄 Actualizando referencias cruzadas...')
    
    const athletesSnapshot = await db.collection('athletes').get()
    let referenceUpdates = 0
    
    for (const athleteDoc of athletesSnapshot.docs) {
      const athleteData = athleteDoc.data()
      
      if (athleteData.coachId) {
        // Find the coach's new UID
        const coachMigration = migrationData.find(d => 
          d.oldUID === athleteData.coachId && d.targetCollection === 'coaches'
        )
        
        if (coachMigration) {
          try {
            await athleteDoc.ref.update({
              coachId: coachMigration.newUID,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })
            console.log(`   ✅ Actualizado coachId para ${athleteDoc.id}: ${athleteData.coachId} → ${coachMigration.newUID}`)
            referenceUpdates++
          } catch (error) {
            console.error(`   ❌ Error actualizando coachId para ${athleteDoc.id}:`, error.message)
          }
        }
      }
    }
    
    // Fourth pass: delete old documents
    console.log('\n🗑️ Eliminando documentos antiguos...')
    
    for (const data of migrationData) {
      try {
        const oldDocRef = db.collection('users').doc(data.oldUID)
        await oldDocRef.delete()
        console.log(`   ✅ Eliminado documento antiguo: ${data.oldUID}`)
      } catch (error) {
        console.error(`   ❌ Error eliminando ${data.oldUID}:`, error.message)
      }
    }
    
    // Print migration summary
    console.log('\n📋 Resumen de la migración:')
    console.log(`👨‍💼 Coaches migrados: ${migrationResults.coaches.success}`)
    console.log(`🏃‍♂️ Atletas migrados: ${migrationResults.athletes.success}`)
    console.log(`👨‍💻 Admins migrados: ${migrationResults.admins.success}`)
    console.log(`⏭️ Saltados: ${migrationResults.skipped}`)
    console.log(`🔗 Referencias actualizadas: ${referenceUpdates}`)
    
    if (migrationResults.coaches.errors > 0 || migrationResults.athletes.errors > 0 || migrationResults.admins.errors > 0) {
      console.log('\n❌ Errores durante la migración:')
      Object.entries(migrationResults).forEach(([collection, result]) => {
        if (result.errors > 0) {
          console.log(`   ${collection}: ${result.errors} errores`)
        }
      })
    }
    
    console.log('\n🎉 ¡Migración completada!')
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
  } finally {
    process.exit(0)
  }
}

// Run migration
migrateToCustomUIDs() 