const admin = require('firebase-admin')
const serviceAccount = require('../therepvana-3cbde07d03d0.json')

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'therepvana'
})

const db = admin.firestore()

async function migrateCoaches() {
  try {
    console.log('🔄 Iniciando migración de coaches...')
    
    // Get all users with role 'coach'
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'coach')
      .get()
    
    if (usersSnapshot.empty) {
      console.log('✅ No se encontraron coaches para migrar')
      return
    }
    
    console.log(`📊 Encontrados ${usersSnapshot.size} coaches para migrar`)
    
    const batch = db.batch()
    let migratedCount = 0
    let errorCount = 0
    
    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data()
        const userId = userDoc.id
        
        console.log(`🔄 Migrando coach: ${userData.firstName} ${userData.lastName} (${userId})`)
        
        // Prepare coach data
        const coachData = {
          uid: userId,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          profileImageUrl: userData.profileImageUrl || userData.profilePhoto || '',
          role: 'coach',
          
          // Personal information (if exists)
          gender: userData.gender || null,
          birthDate: userData.birthDate || null,
          hometown: userData.hometown || userData.city || null,
          nationality: userData.nationality || userData.country || null,
          languages: userData.languages || null,
          maritalStatus: userData.maritalStatus || null,
          currentAddress: userData.currentAddress || null,
          
          // Education and credentials (initialize as empty arrays)
          education: userData.education || [],
          credentials: userData.credentials || [],
          
          // Metadata
          createdAt: userData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
        
        // Create coach document
        const coachRef = db.collection('coaches').doc(userId)
        batch.set(coachRef, coachData)
        
        // Update user document to remove coach-specific fields
        const userUpdateData = {
          role: 'client', // Change role to client since coach data is now in coaches collection
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
        
        // Remove coach-specific fields from user document
        const fieldsToRemove = [
          'gender', 'birthDate', 'hometown', 'nationality', 'languages', 
          'maritalStatus', 'currentAddress', 'education', 'credentials'
        ]
        
        fieldsToRemove.forEach(field => {
          if (userData[field] !== undefined) {
            userUpdateData[field] = admin.firestore.FieldValue.delete()
          }
        })
        
        const userRef = db.collection('users').doc(userId)
        batch.update(userRef, userUpdateData)
        
        migratedCount++
        console.log(`✅ Coach migrado exitosamente: ${userData.firstName} ${userData.lastName}`)
        
      } catch (error) {
        errorCount++
        console.error(`❌ Error migrando coach ${userDoc.id}:`, error.message)
      }
    }
    
    // Commit the batch
    console.log('🔄 Confirmando cambios en Firestore...')
    await batch.commit()
    
    console.log('🎉 Migración completada!')
    console.log(`✅ Coaches migrados: ${migratedCount}`)
    console.log(`❌ Errores: ${errorCount}`)
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
  } finally {
    process.exit(0)
  }
}

// Run migration
migrateCoaches() 