// Simple test script to verify Firebase access
import { getFirebaseDb } from '~/composables/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

export const testFirebaseAccess = async () => {
  try {
    console.log('🧪 Testing Firebase access...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    console.log('✅ Firebase initialized successfully')

    // Test athletes collection
    console.log('📋 Testing athletes collection...')
    const athletesQuery = query(collection(db, 'athletes'), orderBy('createdAt', 'desc'))
    const athletesSnapshot = await getDocs(athletesQuery)
    
    console.log(`✅ Athletes collection accessible. Found ${athletesSnapshot.size} documents`)
    
    const athletes: any[] = []
    athletesSnapshot.forEach((doc) => {
      const data = doc.data()
      athletes.push({
        uid: doc.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role
      })
    })
    
    console.log('📊 Athletes found:', athletes)
    
    // Test coaches collection
    console.log('📋 Testing coaches collection...')
    const coachesQuery = query(collection(db, 'coaches'), orderBy('createdAt', 'desc'))
    const coachesSnapshot = await getDocs(coachesQuery)
    
    console.log(`✅ Coaches collection accessible. Found ${coachesSnapshot.size} documents`)
    
    // Test staff collection
    console.log('📋 Testing staff collection...')
    const staffQuery = query(collection(db, 'staff'), orderBy('createdAt', 'desc'))
    const staffSnapshot = await getDocs(staffQuery)
    
    console.log(`✅ Staff collection accessible. Found ${staffSnapshot.size} documents`)
    
    return {
      success: true,
      athletes: athletes,
      athletesCount: athletesSnapshot.size,
      coachesCount: coachesSnapshot.size,
      staffCount: staffSnapshot.size
    }
    
  } catch (error) {
    console.error('❌ Error testing Firebase access:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Function to specifically check for Itachi
export const findItachi = async () => {
  try {
    console.log('🔍 Looking for Itachi specifically...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    const { doc, getDoc } = await import('firebase/firestore')
    const athleteId = 'itachi_uchiha_pUlgJ'
    
    // Check in athletes collection
    const athleteRef = doc(db, 'athletes', athleteId)
    const athleteSnap = await getDoc(athleteRef)
    
    if (athleteSnap.exists()) {
      const athleteData = athleteSnap.data()
      console.log('✅ Itachi found in athletes collection:', {
        uid: athleteId,
        fullName: athleteData.fullName,
        email: athleteData.email,
        role: athleteData.role
      })
      return {
        success: true,
        found: true,
        collection: 'athletes',
        data: { ...athleteData, uid: athleteId }
      }
    } else {
      console.log('❌ Itachi not found in athletes collection')
      
      // Check in coaches collection
      const coachRef = doc(db, 'coaches', athleteId)
      const coachSnap = await getDoc(coachRef)
      
      if (coachSnap.exists()) {
        const coachData = coachSnap.data()
        console.log('✅ Itachi found in coaches collection:', {
          uid: athleteId,
          fullName: coachData.fullName,
          email: coachData.email,
          role: coachData.role
        })
        return {
          success: true,
          found: true,
          collection: 'coaches',
          data: { ...coachData, uid: athleteId }
        }
      } else {
        console.log('❌ Itachi not found in coaches collection either')
        return {
          success: true,
          found: false,
          message: 'Itachi not found in athletes or coaches collections'
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error finding Itachi:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 