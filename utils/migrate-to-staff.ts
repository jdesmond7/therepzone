// Migration script to create staff collection from coaches
import { getFirebaseDb } from '~/composables/firebase'
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'

// Custom UID generator for staff
const generateStaffUid = (firstName: string, lastName: string, index: number): string => {
  const cleanFirstName = firstName.toLowerCase().replace(/[^a-z]/g, '')
  const cleanLastName = lastName.toLowerCase().replace(/[^a-z]/g, '')
  const timestamp = Date.now().toString().slice(-6)
  return `staff_${cleanFirstName}_${cleanLastName}_${timestamp}_${index}`
}

export const migrateCoachesToStaff = async () => {
  try {
    console.log('🚀 Starting migration from coaches to staff...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    // Get all coaches
    const coachesQuery = query(collection(db, 'coaches'), orderBy('createdAt', 'desc'))
    const coachesSnapshot = await getDocs(coachesQuery)
    
    console.log(`📊 Found ${coachesSnapshot.size} coaches to migrate`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < coachesSnapshot.docs.length; i++) {
      const coachDoc = coachesSnapshot.docs[i]
      const coachData = coachDoc.data()
      
      try {
        // Generate custom UID for staff
        const staffUid = generateStaffUid(
          coachData.firstName || 'staff',
          coachData.lastName || 'member',
          i
        )
        
        // Create staff document with same data structure
        const { uid: _, ...coachDataWithoutUid } = coachData
        const staffData = {
          ...coachDataWithoutUid,
          uid: staffUid,
          role: 'staff' as const, // Change role to staff
          presentationTitle: coachData.presentationTitle || 'Staff Member',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        
        // Create staff document
        const staffRef = doc(db, 'staff', staffUid)
        await setDoc(staffRef, staffData)
        
        console.log(`✅ Migrated coach ${coachData.fullName} to staff with UID: ${staffUid}`)
        successCount++
        
      } catch (error) {
        console.error(`❌ Error migrating coach ${coachData.fullName}:`, error)
        errorCount++
      }
    }
    
    console.log(`🎉 Migration completed!`)
    console.log(`✅ Successfully migrated: ${successCount} coaches`)
    console.log(`❌ Errors: ${errorCount} coaches`)
    
    return {
      success: true,
      migrated: successCount,
      errors: errorCount
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Function to migrate a specific athlete to staff
export const migrateAthleteToStaff = async (athleteId: string, role: 'staff' | 'admin' = 'staff') => {
  try {
    console.log(`🚀 Migrating athlete ${athleteId} to staff...`)
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    // Get the athlete document
    const athleteRef = doc(db, 'athletes', athleteId)
    const athleteSnap = await getDoc(athleteRef)
    
    if (!athleteSnap.exists()) {
      throw new Error(`Athlete with ID ${athleteId} not found`)
    }
    
    const athleteData = athleteSnap.data()
    console.log(`📋 Found athlete: ${athleteData.fullName}`)
    
    // Generate custom UID for staff
    const timestamp = Date.now().toString().slice(-6)
    const cleanFirstName = (athleteData.firstName || 'staff').toLowerCase().replace(/[^a-z]/g, '')
    const cleanLastName = (athleteData.lastName || 'member').toLowerCase().replace(/[^a-z]/g, '')
    const staffUid = `staff_${cleanFirstName}_${cleanLastName}_${timestamp}`
    
    // Create staff document with athlete data
    const { uid: _, ...athleteDataWithoutUid } = athleteData
    const staffData = {
      ...athleteDataWithoutUid,
      uid: staffUid,
      role: role,
      presentationTitle: athleteData.presentationTitle || 'Staff Member',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    // Create staff document
    const staffRef = doc(db, 'staff', staffUid)
    await setDoc(staffRef, staffData)
    
    console.log(`✅ Successfully migrated athlete ${athleteData.fullName} to staff with UID: ${staffUid}`)
    
    return {
      success: true,
      staffId: staffUid,
      originalAthleteId: athleteId,
      staff: staffData
    }
    
  } catch (error) {
    console.error(`❌ Error migrating athlete ${athleteId} to staff:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Function to create a single staff member manually
export const createStaffMember = async (staffData: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  profileImageUrl?: string
  role?: 'staff' | 'admin'
  authUid?: string
}) => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    // Generate custom UID
    const timestamp = Date.now().toString().slice(-6)
    const cleanFirstName = staffData.firstName.toLowerCase().replace(/[^a-z]/g, '')
    const cleanLastName = staffData.lastName.toLowerCase().replace(/[^a-z]/g, '')
    const staffUid = `staff_${cleanFirstName}_${cleanLastName}_${timestamp}`

    // Create staff document
    const newStaffData = {
      uid: staffUid,
      firstName: staffData.firstName,
      lastName: staffData.lastName,
      fullName: `${staffData.firstName} ${staffData.lastName}`,
      email: staffData.email,
      phone: staffData.phone,
      profileImageUrl: staffData.profileImageUrl,
      presentationTitle: 'Staff Member',
      role: staffData.role || 'staff',
      authUid: staffData.authUid,
      profileCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const staffRef = doc(db, 'staff', staffUid)
    await setDoc(staffRef, newStaffData)

    console.log(`✅ Created staff member: ${newStaffData.fullName} with UID: ${staffUid}`)
    
    return {
      success: true,
      staffId: staffUid,
      staff: newStaffData
    }

  } catch (error) {
    console.error('❌ Error creating staff member:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 