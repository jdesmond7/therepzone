// Script to create Itachi as an athlete
import { getFirebaseDb } from '~/composables/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export const createItachiAthlete = async () => {
  try {
    console.log('🚀 Creating Itachi as athlete...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    const athleteId = 'itachi_uchiha_pUlgJ'
    
    // Create athlete data
    const athleteData = {
      uid: athleteId,
      firstName: 'Itachi',
      lastName: 'Uchiha',
      fullName: 'Itachi Uchiha',
      email: 'itachi.uchiha@therepzone.com',
      phone: '+1234567890',
      role: 'client' as const,
      profileCompleted: true,
      assignedWorkouts: [],
      coachId: null,
      // Personal information
      gender: 'masculino' as const,
      birthDate: '1985-06-09',
      hometown: 'Konoha',
      nationality: 'Japonesa',
      currentAddress: 'Konoha Village',
      biography: 'Miembro del clan Uchiha y ex-ANBU',
      // Metadata
      authUid: null, // Will be set when user logs in
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    // Create athlete document
    const athleteRef = doc(db, 'athletes', athleteId)
    await setDoc(athleteRef, athleteData)
    
    console.log(`✅ Successfully created Itachi as athlete with UID: ${athleteId}`)
    console.log(`📊 Athlete data:`, {
      uid: athleteId,
      fullName: athleteData.fullName,
      email: athleteData.email,
      role: athleteData.role
    })
    
    return {
      success: true,
      athleteId: athleteId,
      athlete: athleteData
    }
    
  } catch (error) {
    console.error('❌ Error creating Itachi athlete:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Function to check if Itachi exists and create if not
export const ensureItachiExists = async () => {
  try {
    console.log('🔍 Ensuring Itachi exists as athlete...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    const { getDoc } = await import('firebase/firestore')
    const athleteId = 'itachi_uchiha_pUlgJ'
    
    // Check if Itachi exists
    const athleteRef = doc(db, 'athletes', athleteId)
    const athleteSnap = await getDoc(athleteRef)
    
    if (athleteSnap.exists()) {
      const athleteData = athleteSnap.data()
      console.log(`✅ Itachi already exists as athlete:`, {
        uid: athleteId,
        fullName: athleteData.fullName,
        email: athleteData.email,
        role: athleteData.role
      })
      return {
        success: true,
        exists: true,
        athlete: { ...athleteData, uid: athleteId }
      }
    } else {
      console.log(`❌ Itachi doesn't exist, creating...`)
      return await createItachiAthlete()
    }
    
  } catch (error) {
    console.error('❌ Error ensuring Itachi exists:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 