const admin = require('firebase-admin')
const serviceAccount = require('../therepvana-3cbde07d03d0.json')

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'therepvana'
})

const db = admin.firestore()

async function checkCoachUID() {
  try {
    console.log('🔍 Verificando coaches en Firebase...')
    
    // Get all coaches
    const coachesSnapshot = await db.collection('coaches').get()
    
    if (coachesSnapshot.empty) {
      console.log('❌ No se encontraron coaches')
      return
    }
    
    console.log(`📊 Encontrados ${coachesSnapshot.size} coaches:`)
    
    coachesSnapshot.forEach((doc) => {
      const coachData = doc.data()
      console.log(`\n👤 Coach ID: ${doc.id}`)
      console.log(`   UID: ${coachData.uid}`)
      console.log(`   Nombre: ${coachData.fullName || `${coachData.firstName} ${coachData.lastName}`}`)
      console.log(`   Email: ${coachData.email}`)
      console.log(`   Título: ${coachData.presentationTitle}`)
      console.log(`   Teléfono: ${coachData.phone}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    process.exit(0)
  }
}

// Run check
checkCoachUID() 