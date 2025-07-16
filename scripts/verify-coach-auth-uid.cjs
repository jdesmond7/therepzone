const admin = require('firebase-admin')
const serviceAccount = require('../therepvana-3cbde07d03d0.json')

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'therepvana'
})

const db = admin.firestore()

async function verifyCoachAuthUID() {
  try {
    console.log('🔍 Verificando UID del coach en Firebase Auth vs Firestore...')
    
    // Get the coach from Firestore
    const coachesSnapshot = await db.collection('coaches').get()
    
    if (coachesSnapshot.empty) {
      console.log('❌ No se encontraron coaches')
      return
    }
    
    console.log(`📊 Encontrados ${coachesSnapshot.size} coaches:`)
    
    for (const coachDoc of coachesSnapshot.docs) {
      const coachData = coachDoc.data()
      console.log(`\n👤 Coach: ${coachData.fullName}`)
      console.log(`   Document ID: ${coachDoc.id}`)
      console.log(`   Auth UID en Firestore: ${coachData.authUid}`)
      console.log(`   Email: ${coachData.email}`)
      console.log(`   Rol: ${coachData.role}`)
      
      // Try to get user from Firebase Auth
      try {
        const userRecord = await admin.auth().getUserByEmail(coachData.email)
        console.log(`   ✅ Usuario encontrado en Firebase Auth:`)
        console.log(`      Firebase Auth UID: ${userRecord.uid}`)
        console.log(`      Email verificado: ${userRecord.emailVerified}`)
        console.log(`      Fecha de creación: ${userRecord.metadata.creationTime}`)
        
        // Check if UIDs match
        if (coachData.authUid === userRecord.uid) {
          console.log(`   ✅ UIDs coinciden correctamente`)
        } else {
          console.log(`   ❌ UIDs NO coinciden!`)
          console.log(`      Firestore authUid: ${coachData.authUid}`)
          console.log(`      Firebase Auth UID: ${userRecord.uid}`)
        }
      } catch (error) {
        console.log(`   ❌ Error obteniendo usuario de Firebase Auth:`, error.message)
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error)
  } finally {
    process.exit(0)
  }
}

// Run verification
verifyCoachAuthUID() 