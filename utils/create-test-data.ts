// Simple script to create test data in the new Firebase project
import { getFirebaseDb } from '~/composables/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export async function createTestData() {
  try {
    console.log('🌱 Creating test data in new Firebase project...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    console.log('✅ Firebase initialized successfully')

    // Create a test document
    console.log('📝 Creating test document...')
    await setDoc(doc(db, 'test', 'test-doc'), {
      message: 'Hello from THEREPZONE!',
      timestamp: serverTimestamp(),
      project: 'therepzone1'
    })
    
    console.log('✅ Test document created successfully')

    // Create a test athlete
    console.log('👤 Creating test athlete...')
    await setDoc(doc(db, 'athletes', 'test-athlete'), {
      firstName: 'Test',
      lastName: 'Athlete',
      email: 'test@example.com',
      role: 'client',
      createdAt: serverTimestamp(),
      customUid: 'test_athlete_12345'
    })
    
    console.log('✅ Test athlete created successfully')

    // Create a test exercise
    console.log('💪 Creating test exercise...')
    await setDoc(doc(db, 'exercises', 'test-exercise'), {
      title: 'Test Exercise',
      description: 'This is a test exercise',
      category: 'strength',
      createdBy: 'test-coach',
      createdAt: serverTimestamp()
    })
    
    console.log('✅ Test exercise created successfully')

    console.log('\n🎉 Test data created successfully!')
    console.log('✅ Your new Firebase project now has sample data')
    
    return {
      success: true,
      documentsCreated: 3
    }
    
  } catch (error: any) {
    console.error('❌ Error creating test data:')
    console.error('Error:', error.message)
    console.error('Code:', error.code)
    
    return {
      success: false,
      error: error.message,
      code: error.code
    }
  }
} 