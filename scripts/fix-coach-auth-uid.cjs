const admin = require('firebase-admin')
const serviceAccount = require('../therepvana-3cbde07d03d0.json')

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'therepvana'
})

const db = admin.firestore()

async function fixCoachAuthUID() {
  try {
    console.log('🔧 Arreglando authUid del coach...')
    
    // Get the coach from Firestore
    const coachId = 'jorge_desmond_f4e2Z'
    const coachRef = db.collection('coaches').doc(coachId)
    const coachDoc = await coachRef.get()
    
    if (!coachDoc.exists) {
      console.log('❌ Coach no encontrado')
      return
    }
    
    const coachData = coachDoc.data()
    console.log('📊 Datos del coach actual:', coachData)
    
    // Get the correct UID from Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(coachData.email)
    const correctAuthUID = userRecord.uid
    
    console.log(`🆔 UID correcto de Firebase Auth: ${correctAuthUID}`)
    console.log(`🆔 UID actual en Firestore: ${coachData.authUid}`)
    
    if (coachData.authUid === correctAuthUID) {
      console.log('✅ Los UIDs ya coinciden, no hay nada que arreglar')
      return
    }
    
    // Update the authUid
    await coachRef.update({
      authUid: correctAuthUID,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })
    
    console.log('✅ Auth UID actualizado correctamente')
    
    // Verify the update
    const updatedDoc = await coachRef.get()
    const updatedData = updatedDoc.data()
    console.log('📊 Datos actualizados:', updatedData)
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error)
  } finally {
    process.exit(0)
  }
}

// Run fix
fixCoachAuthUID() 