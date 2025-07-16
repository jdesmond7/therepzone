const admin = require('firebase-admin')
const serviceAccount = require('../therepvana-3cbde07d03d0.json')

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'therepvana'
})

const db = admin.firestore()

async function fixCoachUIDMismatch() {
  try {
    console.log('🔧 Arreglando UID del coach...')
    
    // Obtener el documento actual del coach con UID incorrecto
    const oldCoachId = 'CM3RDr6h19nKk7i7LoMf4e2Z' // UID con '1' en lugar de 'I'
    const newCoachId = 'CM3RDr6hI9nKk7i7LoMf4e2Z' // UID correcto de Firebase Auth
    
    console.log(`🔄 Migrando de: ${oldCoachId} a: ${newCoachId}`)
    
    // Obtener el documento actual
    const oldCoachRef = db.collection('coaches').doc(oldCoachId)
    const oldCoachDoc = await oldCoachRef.get()
    
    if (!oldCoachDoc.exists) {
      console.log('❌ No se encontró el coach con el ID anterior')
      return
    }
    
    const coachData = oldCoachDoc.data()
    console.log('📊 Datos del coach actual:', coachData)
    
    // Verificar si ya existe un documento con el nuevo ID
    const newCoachRef = db.collection('coaches').doc(newCoachId)
    const newCoachDoc = await newCoachRef.get()
    
    if (newCoachDoc.exists) {
      console.log('⚠️ Ya existe un documento con el nuevo ID, sobrescribiendo...')
    }
    
    // Preparar los datos actualizados
    const updatedCoachData = {
      ...coachData,
      uid: newCoachId, // Actualizar el campo uid también
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
    
    console.log('📝 Datos actualizados:', updatedCoachData)
    
    // Crear el nuevo documento con el UID correcto
    await newCoachRef.set(updatedCoachData)
    console.log('✅ Nuevo documento creado con UID correcto')
    
    // Eliminar el documento anterior
    await oldCoachRef.delete()
    console.log('🗑️ Documento anterior eliminado')
    
    // Verificar que el nuevo documento existe
    const verificationDoc = await newCoachRef.get()
    if (verificationDoc.exists) {
      console.log('✅ Verificación exitosa: el nuevo documento existe')
      console.log('📊 Datos del nuevo documento:', verificationDoc.data())
    } else {
      console.log('❌ Error: el nuevo documento no existe después de la migración')
    }
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error)
  } finally {
    process.exit(0)
  }
}

// Ejecutar la corrección
fixCoachUIDMismatch() 