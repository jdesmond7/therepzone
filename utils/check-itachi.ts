// Simple script to check if Itachi exists
import { getFirebaseDb } from '~/composables/firebase'
import { doc, getDoc } from 'firebase/firestore'

export const checkItachiExists = async () => {
  try {
    console.log('🔍 Checking if Itachi exists...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    const athleteId = 'itachi_uchiha_pUlgJ'
    
    // Check in athletes collection
    const athleteRef = doc(db, 'athletes', athleteId)
    const athleteSnap = await getDoc(athleteRef)
    
    if (athleteSnap.exists()) {
      const athleteData = athleteSnap.data()
      console.log('✅ Itachi found as athlete:', {
        uid: athleteId,
        fullName: athleteData.fullName,
        email: athleteData.email,
        role: athleteData.role
      })
      return {
        success: true,
        exists: true,
        collection: 'athletes',
        data: { ...athleteData, uid: athleteId }
      }
    } else {
      console.log('❌ Itachi not found as athlete')
      
      // Check in coaches collection
      const coachRef = doc(db, 'coaches', athleteId)
      const coachSnap = await getDoc(coachRef)
      
      if (coachSnap.exists()) {
        const coachData = coachSnap.data()
        console.log('✅ Itachi found as coach:', {
          uid: athleteId,
          fullName: coachData.fullName,
          email: coachData.email,
          role: coachData.role
        })
        return {
          success: true,
          exists: true,
          collection: 'coaches',
          data: { ...coachData, uid: athleteId }
        }
      } else {
        console.log('❌ Itachi not found as coach either')
        return {
          success: true,
          exists: false,
          message: 'Itachi not found in athletes or coaches collections'
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking Itachi:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Function to list all athletes to see what's available
export const listAllAthletes = async () => {
  try {
    console.log('📋 Listing all athletes...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
    const athletesQuery = query(collection(db, 'athletes'), orderBy('createdAt', 'desc'))
    const athletesSnapshot = await getDocs(athletesQuery)
    
    const athletes: any[] = []
    athletesSnapshot.forEach((doc) => {
      athletes.push({ ...doc.data(), uid: doc.id })
    })
    
    console.log(`📊 Found ${athletes.length} athletes:`)
    athletes.forEach((athlete, index) => {
      console.log(`${index + 1}. ${athlete.fullName} (${athlete.uid}) - ${athlete.email}`)
    })
    
    return {
      success: true,
      count: athletes.length,
      athletes
    }

  } catch (error) {
    console.error('❌ Error listing athletes:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 