/**
 * Migration script to update existing users with custom UIDs
 * Format: role_firstName+5digits
 * 
 * Usage: node utils/migrate-to-custom-uids.cjs
 */

const admin = require('firebase-admin')
const path = require('path')

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '..', 'therepvana-3cbde07d03d0.json')
const serviceAccount = require(serviceAccountPath)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'therepvana'
})

const db = admin.firestore()

/**
 * Generate custom UID for a user
 */
function generateCustomUid(role, firstName, authUid) {
  // Clean and normalize firstName
  const cleanFirstName = firstName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .substring(0, 10) // Limit to 10 characters
  
  // Get last 5 digits from authUid
  const last5Digits = authUid.slice(-5)
  
  // Generate custom UID
  return `${role}_${cleanFirstName}${last5Digits}`
}

/**
 * Check if a custom UID already exists
 */
async function checkCustomUidExists(customUid) {
  try {
    const docRef = db.collection('users').doc(customUid)
    const doc = await docRef.get()
    return doc.exists
  } catch (error) {
    console.error('Error checking if custom UID exists:', error)
    return false
  }
}

/**
 * Generate unique custom UID
 */
async function generateUniqueCustomUid(role, firstName, authUid) {
  let customUid = generateCustomUid(role, firstName, authUid)
  let attempts = 0
  const maxAttempts = 10
  
  while (await checkCustomUidExists(customUid) && attempts < maxAttempts) {
    attempts++
    console.log(`⚠️ Custom UID ${customUid} already exists, trying again... (attempt ${attempts})`)
    
    // Add a random suffix to make it unique
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    
    const cleanFirstName = firstName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 7) // Shorter to make room for suffix
    
    const last5Digits = authUid.slice(-5)
    customUid = `${role}_${cleanFirstName}${randomSuffix}${last5Digits.slice(-2)}`
  }
  
  if (attempts >= maxAttempts) {
    throw new Error('Could not generate unique custom UID after maximum attempts')
  }
  
  return customUid
}

/**
 * Migrate users to custom UIDs
 */
async function migrateUsersToCustomUids() {
  console.log('🚀 Starting migration to custom UIDs...')
  
  try {
    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get()
    
    if (usersSnapshot.empty) {
      console.log('📭 No users found in Firestore')
      return
    }
    
    console.log(`📊 Found ${usersSnapshot.size} users to migrate`)
    
    const migrationResults = {
      success: 0,
      skipped: 0,
      errors: 0,
      details: []
    }
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data()
      const currentUid = userDoc.id
      
      console.log(`\n🔄 Processing user: ${currentUid}`)
      console.log(`   Name: ${userData.fullName || userData.firstName || 'Unknown'}`)
      console.log(`   Role: ${userData.role}`)
      console.log(`   Email: ${userData.email}`)
      
      // Skip if already has custom UID format
      if (currentUid.match(/^(client|coach)_[a-z0-9]{1,10}[0-9]{5}$/)) {
        console.log(`   ⏭️ Already has custom UID format, skipping`)
        migrationResults.skipped++
        migrationResults.details.push({
          uid: currentUid,
          status: 'skipped',
          reason: 'Already has custom UID format'
        })
        continue
      }
      
      // Skip if no authUid (shouldn't happen but just in case)
      if (!userData.authUid) {
        console.log(`   ⚠️ No authUid found, skipping`)
        migrationResults.skipped++
        migrationResults.details.push({
          uid: currentUid,
          status: 'skipped',
          reason: 'No authUid found'
        })
        continue
      }
      
      try {
        // Generate custom UID
        const firstName = userData.firstName || userData.fullName?.split(' ')[0] || 'user'
        const customUid = await generateUniqueCustomUid(
          userData.role || 'client',
          firstName,
          userData.authUid
        )
        
        console.log(`   🆔 Generated custom UID: ${customUid}`)
        
        // Create new document with custom UID
        const newDocRef = db.collection('users').doc(customUid)
        await newDocRef.set({
          ...userData,
          id: customUid, // Ensure ID field is set
          migratedFrom: currentUid, // Track migration
          migratedAt: admin.firestore.FieldValue.serverTimestamp()
        })
        
        // Delete old document
        await userDoc.ref.delete()
        
        console.log(`   ✅ Successfully migrated: ${currentUid} → ${customUid}`)
        migrationResults.success++
        migrationResults.details.push({
          oldUid: currentUid,
          newUid: customUid,
          status: 'success'
        })
        
      } catch (error) {
        console.error(`   ❌ Error migrating user ${currentUid}:`, error.message)
        migrationResults.errors++
        migrationResults.details.push({
          uid: currentUid,
          status: 'error',
          error: error.message
        })
      }
    }
    
    // Print migration summary
    console.log('\n📋 Migration Summary:')
    console.log(`✅ Successfully migrated: ${migrationResults.success}`)
    console.log(`⏭️ Skipped: ${migrationResults.skipped}`)
    console.log(`❌ Errors: ${migrationResults.errors}`)
    
    if (migrationResults.errors > 0) {
      console.log('\n❌ Failed migrations:')
      migrationResults.details
        .filter(d => d.status === 'error')
        .forEach(d => console.log(`   - ${d.uid}: ${d.error}`))
    }
    
    console.log('\n🎉 Migration completed!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateUsersToCustomUids()
    .then(() => {
      console.log('✅ Migration script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
}

module.exports = {
  migrateUsersToCustomUids,
  generateCustomUid,
  generateUniqueCustomUid
} 