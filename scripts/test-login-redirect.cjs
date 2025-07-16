const admin = require('firebase-admin')
const serviceAccount = require('../therepvana-3cbde07d03d0.json')

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'therepvana'
})

const db = admin.firestore()

async function testLoginRedirect() {
  try {
    console.log('🧪 Probando sistema de redirección de login...')
    
    // Test coach login
    console.log('\n👨‍💼 Probando login de coach...')
    const coachAuthUID = 'CM3RDr6hI9nKk7i7LoMf4e2Z'
    
    // Simulate finding coach by auth UID
    const coachesQuery = await db.collection('coaches').where('authUid', '==', coachAuthUID).get()
    
    if (!coachesQuery.empty) {
      const coachDoc = coachesQuery.docs[0]
      const coachData = coachDoc.data()
      console.log('✅ Coach encontrado:')
      console.log(`   ID: ${coachDoc.id}`)
      console.log(`   Nombre: ${coachData.fullName}`)
      console.log(`   Rol: ${coachData.role}`)
      console.log(`   Email: ${coachData.email}`)
      console.log('   🎯 Redirección: /coach/dashboard')
    } else {
      console.log('❌ Coach no encontrado')
    }
    
    // Test athlete login
    console.log('\n🏃‍♂️ Probando login de atleta...')
    const athleteAuthUID = 'client_elizabethsrg62' // This should be the original Firebase Auth UID
    
    // First, let's see what athletes we have
    const athletesSnapshot = await db.collection('athletes').get()
    console.log(`📊 Encontrados ${athletesSnapshot.size} atletas:`)
    
    athletesSnapshot.forEach((doc) => {
      const athleteData = doc.data()
      console.log(`   👤 ${athleteData.fullName} (${doc.id})`)
      console.log(`      Auth UID: ${athleteData.authUid}`)
      console.log(`      Rol: ${athleteData.role}`)
      console.log(`      Email: ${athleteData.email}`)
      console.log('      🎯 Redirección: /dashboard')
    })
    
    // Test specific athlete login
    const athleteQuery = await db.collection('athletes').where('authUid', '==', athleteAuthUID).get()
    
    if (!athleteQuery.empty) {
      const athleteDoc = athleteQuery.docs[0]
      const athleteData = athleteDoc.data()
      console.log('\n✅ Atleta encontrado:')
      console.log(`   ID: ${athleteDoc.id}`)
      console.log(`   Nombre: ${athleteData.fullName}`)
      console.log(`   Rol: ${athleteData.role}`)
      console.log(`   Email: ${athleteData.email}`)
      console.log('   🎯 Redirección: /dashboard')
    } else {
      console.log('\n❌ Atleta no encontrado con auth UID:', athleteAuthUID)
      
      // Let's check what auth UIDs we actually have
      console.log('\n🔍 Auth UIDs disponibles en atletas:')
      athletesSnapshot.forEach((doc) => {
        const athleteData = doc.data()
        console.log(`   ${athleteData.authUid} -> ${athleteData.fullName}`)
      })
    }
    
    console.log('\n📋 Resumen del sistema de redirección:')
    console.log('👨‍💼 Coaches: /coach/dashboard')
    console.log('🏃‍♂️ Atletas: /dashboard')
    console.log('👨‍💻 Admins: /admin/dashboard (futuro)')
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error)
  } finally {
    process.exit(0)
  }
}

// Run test
testLoginRedirect() 