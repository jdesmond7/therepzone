// Simple test script to verify Firebase connection to the new project
import { getFirebaseDb } from '~/composables/firebase'
import { collection, getDocs } from 'firebase/firestore'

export async function testNewFirebaseConnection() {
  try {
    console.log('🧪 Testing Firebase connection to new project...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    console.log('✅ Firebase initialized successfully')

    // Test reading from a test collection (this should work with our updated rules)
    console.log('📖 Testing Firestore read access...')
    const testCollection = collection(db, 'test')
    const snapshot = await getDocs(testCollection)
    
    console.log(`✅ Firestore read successful. Found ${snapshot.size} documents in test collection`)
    
    // Test reading from athletes collection
    console.log('📖 Testing athletes collection access...')
    const athletesCollection = collection(db, 'athletes')
    const athletesSnapshot = await getDocs(athletesCollection)
    
    console.log(`✅ Athletes collection accessible. Found ${athletesSnapshot.size} athletes`)
    
    // Test reading from coaches collection
    console.log('📖 Testing coaches collection access...')
    const coachesCollection = collection(db, 'coaches')
    const coachesSnapshot = await getDocs(coachesCollection)
    
    console.log(`✅ Coaches collection accessible. Found ${coachesSnapshot.size} coaches`)
    
    // Test reading from exercises collection
    console.log('📖 Testing exercises collection access...')
    const exercisesCollection = collection(db, 'exercises')
    const exercisesSnapshot = await getDocs(exercisesCollection)
    
    console.log(`✅ Exercises collection accessible. Found ${exercisesSnapshot.size} exercises`)
    
    console.log('\n🎉 All Firebase connections successful!')
    console.log('✅ Your new Firebase project is properly configured and accessible')
    
    return {
      success: true,
      athletesCount: athletesSnapshot.size,
      coachesCount: coachesSnapshot.size,
      exercisesCount: exercisesSnapshot.size
    }
    
  } catch (error: any) {
    console.error('❌ Firebase connection test failed:')
    console.error('Error:', error.message)
    console.error('Code:', error.code)
    
    if (error.code === 'permission-denied') {
      console.log('\n🔧 Permission denied error detected.')
      console.log('This usually means:')
      console.log('1. The user is not authenticated')
      console.log('2. Firestore rules are too restrictive')
      console.log('3. The collection does not exist yet')
      
      console.log('\n💡 Solutions:')
      console.log('1. Make sure you are logged in to the application')
      console.log('2. Check that Firestore rules allow authenticated reads')
      console.log('3. Try creating some test data first')
    }
    
    return {
      success: false,
      error: error.message,
      code: error.code
    }
  }
} 