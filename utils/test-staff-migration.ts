// Test script for staff migration
import { getFirebaseDb } from '~/composables/firebase'
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'

// Test function to create a sample staff member
export const createTestStaffMember = async () => {
  try {
    console.log('🧪 Creating test staff member...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    // Generate test UID
    const timestamp = Date.now().toString().slice(-6)
    const testUid = `staff_test_member_${timestamp}`

    // Create test staff data
    const testStaffData = {
      uid: testUid,
      firstName: 'Test',
      lastName: 'Staff',
      fullName: 'Test Staff Member',
      email: 'test.staff@therepzone.com',
      phone: '+1234567890',
      presentationTitle: 'Test Staff Member',
      role: 'staff' as const,
      profileCompleted: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    // Create document
    const staffRef = doc(db, 'staff', testUid)
    await setDoc(staffRef, testStaffData)

    console.log(`✅ Test staff member created with UID: ${testUid}`)
    
    return {
      success: true,
      staffId: testUid,
      staff: testStaffData
    }

  } catch (error) {
    console.error('❌ Error creating test staff member:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Test function to list all staff members
export const listAllStaff = async () => {
  try {
    console.log('📋 Listing all staff members...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    const staffQuery = query(collection(db, 'staff'), orderBy('createdAt', 'desc'))
    const staffSnapshot = await getDocs(staffQuery)
    
    const staffMembers: any[] = []
    staffSnapshot.forEach((doc) => {
      staffMembers.push({ ...doc.data(), uid: doc.id })
    })
    
    console.log(`📊 Found ${staffMembers.length} staff members:`)
    staffMembers.forEach((staff, index) => {
      console.log(`${index + 1}. ${staff.fullName} (${staff.uid}) - ${staff.role}`)
    })
    
    return {
      success: true,
      count: staffMembers.length,
      staff: staffMembers
    }

  } catch (error) {
    console.error('❌ Error listing staff members:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Test function to verify staff collection structure
export const verifyStaffCollection = async () => {
  try {
    console.log('🔍 Verifying staff collection structure...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    const staffQuery = query(collection(db, 'staff'), orderBy('createdAt', 'desc'))
    const staffSnapshot = await getDocs(staffQuery)
    
    if (staffSnapshot.empty) {
      console.log('📭 Staff collection is empty')
      return {
        success: true,
        isEmpty: true,
        message: 'Staff collection is empty'
      }
    }
    
    const sampleStaff = staffSnapshot.docs[0].data()
    console.log('📋 Sample staff document structure:', Object.keys(sampleStaff))
    
    // Check required fields
    const requiredFields = ['uid', 'firstName', 'lastName', 'fullName', 'email', 'role']
    const missingFields = requiredFields.filter(field => !(field in sampleStaff))
    
    if (missingFields.length > 0) {
      console.log('⚠️ Missing required fields:', missingFields)
      return {
        success: false,
        missingFields,
        message: 'Staff collection is missing required fields'
      }
    }
    
    console.log('✅ Staff collection structure is valid')
    return {
      success: true,
      fieldCount: Object.keys(sampleStaff).length,
      message: 'Staff collection structure is valid'
    }

  } catch (error) {
    console.error('❌ Error verifying staff collection:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Run all tests
export const runStaffTests = async () => {
  console.log('🚀 Running staff migration tests...')
  
  // Test 1: Create test staff member
  console.log('\n📝 Test 1: Creating test staff member')
  const createResult = await createTestStaffMember()
  console.log('Result:', createResult)
  
  // Test 2: List all staff
  console.log('\n📋 Test 2: Listing all staff members')
  const listResult = await listAllStaff()
  console.log('Result:', listResult)
  
  // Test 3: Verify collection structure
  console.log('\n🔍 Test 3: Verifying collection structure')
  const verifyResult = await verifyStaffCollection()
  console.log('Result:', verifyResult)
  
  console.log('\n🎉 Staff tests completed!')
  
  return {
    createTest: createResult,
    listStaff: listResult,
    verifyStructure: verifyResult
  }
} 