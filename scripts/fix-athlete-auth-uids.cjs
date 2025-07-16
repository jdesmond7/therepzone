const admin = require('firebase-admin')
const serviceAccount = require('../therepvana-3cbde07d03d0.json')

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'therepvana'
})

const db = admin.firestore()

async function fixAthleteAuthUIDs() {
  try {
    console.log('🔧 Arreglando authUid de atletas...')
    
    // Get all athletes
    const athletesSnapshot = await db.collection('athletes').get()
    
    if (athletesSnapshot.empty) {
      console.log('📭 No se encontraron atletas')
      return
    }
    
    console.log(`📊 Encontrados ${athletesSnapshot.size} atletas para corregir:`)
    
    for (const athleteDoc of athletesSnapshot.docs) {
      const athleteData = athleteDoc.data()
      const currentAuthUid = athleteData.authUid
      
      console.log(`\n🔄 Procesando atleta: ${athleteData.fullName}`)
      console.log(`   ID actual: ${athleteDoc.id}`)
      console.log(`   Auth UID actual: ${currentAuthUid}`)
      
      // Check if the current authUid looks like a custom UID (contains underscores)
      if (currentAuthUid && currentAuthUid.includes('_')) {
        console.log('   ⚠️ Auth UID parece ser un UID personalizado, necesitamos el UID original de Firebase Auth')
        console.log('   💡 Para corregir esto, necesitas proporcionar el UID original de Firebase Auth')
        console.log('   📝 Ejemplo: Si el atleta se registró con email "prueba@mail.com",')
        console.log('      necesitas encontrar su UID original en Firebase Auth Console')
      } else {
        console.log('   ✅ Auth UID parece ser correcto (UID original de Firebase Auth)')
      }
    }
    
    console.log('\n📋 Para corregir los authUid:')
    console.log('1. Ve a Firebase Console > Authentication > Users')
    console.log('2. Encuentra los usuarios por email')
    console.log('3. Copia el UID original de cada usuario')
    console.log('4. Actualiza el campo authUid en la colección athletes')
    
    // Example of how to update (commented out for safety)
    /*
    // Example update for Elizabeth
    const elizabethRef = db.collection('athletes').doc('elizabeth_skyler_srg62')
    await elizabethRef.update({
      authUid: 'ORIGINAL_FIREBASE_AUTH_UID_HERE',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })
    */
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error)
  } finally {
    process.exit(0)
  }
}

// Run fix
fixAthleteAuthUIDs() 