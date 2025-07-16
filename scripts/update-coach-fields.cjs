const admin = require('firebase-admin')
const serviceAccount = require('../therepvana-3cbde07d03d0.json')

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'therepvana'
})

const db = admin.firestore()

async function updateCoachFields() {
  try {
    console.log('🔄 Actualizando campos del coach...')
    
    // Get the coach document
    const coachId = 'coach_jorgeM4eZ2' // Replace with actual coach ID
    const coachRef = db.collection('coaches').doc(coachId)
    const coachDoc = await coachRef.get()
    
    if (!coachDoc.exists) {
      console.log('❌ Coach no encontrado')
      return
    }
    
    const coachData = coachDoc.data()
    console.log('📊 Datos actuales del coach:', coachData)
    
    // Prepare update data
    const updateData = {
      fullName: coachData.fullName || `${coachData.firstName} ${coachData.lastName}`.trim(),
      presentationTitle: coachData.presentationTitle || 'Fitness Coach',
      biography: coachData.biography || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
    
    // Remove old fields if they exist
    const fieldsToRemove = ['languages', 'maritalStatus']
    fieldsToRemove.forEach(field => {
      if (coachData[field] !== undefined) {
        updateData[field] = admin.firestore.FieldValue.delete()
      }
    })
    
    console.log('🔄 Actualizando con:', updateData)
    
    // Update the coach document
    await coachRef.update(updateData)
    
    console.log('✅ Coach actualizado exitosamente')
    
  } catch (error) {
    console.error('❌ Error durante la actualización:', error)
  } finally {
    process.exit(0)
  }
}

// Run update
updateCoachFields() 