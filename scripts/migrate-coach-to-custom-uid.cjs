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

async function migrateCoachToCustomUID() {
  try {
    console.log('🚀 Migrando coach a UID personalizado...')
    
    // Get the current coach document
    const currentCoachId = 'CM3RDr6hI9nKk7i7LoMf4e2Z'
    const currentCoachRef = db.collection('coaches').doc(currentCoachId)
    const currentCoachDoc = await currentCoachRef.get()
    
    if (!currentCoachDoc.exists) {
      console.log('❌ No se encontró el coach con el ID actual')
      return
    }
    
    const coachData = currentCoachDoc.data()
    console.log('📊 Datos del coach actual:', coachData)
    
    // Generate new custom UID
    const newCoachId = generateCustomUID(
      coachData.firstName || 'jorge',
      coachData.lastName || 'desmond',
      currentCoachId
    )
    
    console.log(`🆔 Nuevo UID generado: ${newCoachId}`)
    
    // Check if new UID already exists
    const newCoachRef = db.collection('coaches').doc(newCoachId)
    const newCoachDoc = await newCoachRef.get()
    
    if (newCoachDoc.exists) {
      console.log('⚠️ Ya existe un documento con el nuevo UID, sobrescribiendo...')
    }
    
    // Prepare updated data
    const updatedCoachData = {
      ...coachData,
      uid: newCoachId, // Update uid field
      authUid: currentCoachId, // Keep reference to original Firebase Auth UID
      migratedFrom: currentCoachId, // Track migration
      migratedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
    
    console.log('📝 Datos actualizados:', updatedCoachData)
    
    // Create new document with custom UID
    await newCoachRef.set(updatedCoachData)
    console.log('✅ Nuevo documento creado con UID personalizado')
    
    // Delete old document
    await currentCoachRef.delete()
    console.log('🗑️ Documento anterior eliminado')
    
    // Update coachId references in athletes
    console.log('🔄 Actualizando referencias en atletas...')
    const athletesSnapshot = await db.collection('athletes').get()
    let referenceUpdates = 0
    
    for (const athleteDoc of athletesSnapshot.docs) {
      const athleteData = athleteDoc.data()
      
      if (athleteData.coachId === currentCoachId) {
        try {
          await athleteDoc.ref.update({
            coachId: newCoachId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
          console.log(`   ✅ Actualizado coachId para ${athleteDoc.id}: ${currentCoachId} → ${newCoachId}`)
          referenceUpdates++
        } catch (error) {
          console.error(`   ❌ Error actualizando coachId para ${athleteDoc.id}:`, error.message)
        }
      }
    }
    
    // Verify the new document exists
    const verificationDoc = await newCoachRef.get()
    if (verificationDoc.exists) {
      console.log('✅ Verificación exitosa: el nuevo documento existe')
      console.log('📊 Datos del nuevo documento:', verificationDoc.data())
    } else {
      console.log('❌ Error: el nuevo documento no existe después de la migración')
    }
    
    console.log('\n📋 Resumen de la migración:')
    console.log(`👨‍💼 Coach migrado: ${currentCoachId} → ${newCoachId}`)
    console.log(`🔗 Referencias actualizadas: ${referenceUpdates}`)
    console.log('🎉 ¡Migración completada!')
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
  } finally {
    process.exit(0)
  }
}

// Run migration
migrateCoachToCustomUID() 