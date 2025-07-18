// Specific script to migrate Itachi Uchiha to staff
import { getFirebaseDb } from '~/composables/firebase'
import { 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore'

export const migrateItachiToStaff = async () => {
  try {
    console.log('🚀 Migrating Itachi Uchiha to staff...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    const athleteId = 'itachi_uchiha_pUlgJ'
    
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
    const staffUid = `staff_itachi_uchiha_${timestamp}`
    
    // Create staff document with athlete data
    const { uid: _, ...athleteDataWithoutUid } = athleteData
    const staffData = {
      ...athleteDataWithoutUid,
      uid: staffUid,
      role: 'staff' as const,
      presentationTitle: 'Staff Member',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    // Create staff document
    const staffRef = doc(db, 'staff', staffUid)
    await setDoc(staffRef, staffData)
    
    console.log(`✅ Successfully migrated Itachi Uchiha to staff with UID: ${staffUid}`)
    console.log(`📊 Staff data:`, {
      uid: staffUid,
      fullName: (staffData as any).fullName || 'Itachi Uchiha',
      email: (staffData as any).email || 'N/A',
      role: staffData.role
    })
    
    return {
      success: true,
      staffId: staffUid,
      originalAthleteId: athleteId,
      staff: staffData
    }
    
  } catch (error) {
    console.error('❌ Error migrating Itachi to staff:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}



// Function to check if Itachi exists as staff
export const checkItachiAsStaff = async () => {
  try {
    console.log('🔍 Checking if Itachi exists as staff...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    // Search for Itachi in staff collection by name
    const { useStaff } = await import('~/composables/staff')
    const { getStaff } = useStaff()
    const result = await getStaff()
    
    if (result.success && result.staff) {
      const itachiStaff = result.staff.find((staff: any) => 
        staff.fullName?.toLowerCase().includes('itachi') || 
        staff.firstName?.toLowerCase().includes('itachi')
      )
      
      if (itachiStaff) {
        console.log(`✅ Itachi found as staff:`, {
          uid: itachiStaff.uid,
          fullName: itachiStaff.fullName,
          email: itachiStaff.email,
          role: itachiStaff.role
        })
        return {
          success: true,
          exists: true,
          staff: itachiStaff
        }
      } else {
        console.log(`❌ Itachi not found as staff`)
        return {
          success: true,
          exists: false
        }
      }
    } else {
      console.log(`❌ Error getting staff list`)
      return {
        success: false,
        error: result.error
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking Itachi as staff:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 

// Function to update Itachi's customUid to firstName_lastName_5digitAuthUid format
export const updateItachiCustomUid = async () => {
  try {
    console.log('🔄 Updating Itachi customUid format...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    // First, find Itachi in staff collection
    const { useStaff } = await import('~/composables/staff')
    const { getStaff } = useStaff()
    const result = await getStaff()
    
    if (!result.success || !result.staff) {
      throw new Error('Could not get staff list')
    }
    
    const itachiStaff = result.staff.find((staff: any) => 
      staff.fullName?.toLowerCase().includes('itachi') || 
      staff.firstName?.toLowerCase().includes('itachi')
    )
    
    if (!itachiStaff) {
      throw new Error('Itachi not found in staff collection')
    }
    
    console.log(`📋 Found Itachi in staff: ${itachiStaff.fullName}`)
    console.log(`🆔 Current UID: ${itachiStaff.uid}`)
    
    // Get the original authUid from the athlete data
    const athleteId = 'itachi_uchiha_pUlgJ'
    const athleteRef = doc(db, 'athletes', athleteId)
    const athleteSnap = await getDoc(athleteRef)
    
    let authUid = itachiStaff.authUid
    
    // If no authUid in staff, try to get it from athlete data
    if (!authUid && athleteSnap.exists()) {
      const athleteData = athleteSnap.data()
      authUid = athleteData.authUid
    }
    
    if (!authUid) {
      throw new Error('Could not find authUid for Itachi')
    }
    
    // Generate new customUid format: firstName_lastName_5digitAuthUid
    const firstName = itachiStaff.firstName || 'itachi'
    const lastName = itachiStaff.lastName || 'uchiha'
    
    // Clean names (remove special characters, lowercase)
    const cleanFirstName = firstName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]/g, '') // Remove special characters
    
    const cleanLastName = lastName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]/g, '') // Remove special characters
    
    // Get last 5 digits from authUid
    const last5Digits = authUid.slice(-5)
    
    // Generate new customUid
    const newCustomUid = `${cleanFirstName}_${cleanLastName}_${last5Digits}`
    
    console.log(`🆔 New UID format: ${newCustomUid}`)
    console.log(`📊 Details: firstName=${cleanFirstName}, lastName=${cleanLastName}, authUid=${authUid}, last5Digits=${last5Digits}`)
    
    // Create new staff document with new UID
    const { uid: _, ...staffDataWithoutUid } = itachiStaff
    const updatedStaffData = {
      ...staffDataWithoutUid,
      uid: newCustomUid,
      updatedAt: serverTimestamp()
    }
    
    // Create new document with new UID
    const newStaffRef = doc(db, 'staff', newCustomUid)
    await setDoc(newStaffRef, updatedStaffData)
    
    // Delete old document
    const oldStaffRef = doc(db, 'staff', itachiStaff.uid)
    await deleteDoc(oldStaffRef)
    
    console.log(`✅ Successfully updated Itachi's UID: ${itachiStaff.uid} → ${newCustomUid}`)
    
    return {
      success: true,
      oldUid: itachiStaff.uid,
      newUid: newCustomUid,
      staff: updatedStaffData
    }
    
  } catch (error) {
    console.error('❌ Error updating Itachi customUid:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 