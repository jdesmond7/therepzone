/**
 * Generates custom UIDs for coaches and clients
 * Format: firstName(primer nombre)_lastName(primer apellido)_5digitosUID
 * Example: juan_perez_12345, maria_garcia_67890
 */

export interface CustomUidData {
  role: 'athlete' | 'coach'
  firstName: string
  lastName: string
  authUid: string // Original Firebase Auth UID
}

export function generateCustomUid(data: CustomUidData): string {
  const { firstName, lastName, authUid } = data
  
  console.log('🔄 [generateCustomUid] Input data:', { firstName, lastName, authUid })
  
  // Clean and normalize firstName (primer nombre)
  const cleanFirstName = firstName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters but keep spaces
    .trim()
    .split(' ')[0] // Solo el primer nombre
  
  // Clean and normalize lastName (primer apellido)
  const cleanLastName = lastName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters but keep spaces
    .trim()
    .split(' ')[0] // Solo el primer apellido
  
  // Get last 5 digits from authUid
  const last5Digits = authUid.slice(-5)
  
  // Generate custom UID
  const customUid = `${cleanFirstName}_${cleanLastName}_${last5Digits}`
  
  console.log(`🆔 [generateCustomUid] Generated custom UID: ${customUid}`)
  console.log(`   First Name: "${firstName}" → "${cleanFirstName}"`)
  console.log(`   Last Name: "${lastName}" → "${cleanLastName}"`)
  console.log(`   Auth UID: "${authUid}" → "${last5Digits}"`)
  console.log(`   Final UID: "${customUid}"`)
  
  return customUid
}

/**
 * Validates if a custom UID follows the correct format
 */
export function validateCustomUid(uid: string): boolean {
  const pattern = /^[a-z]+_[a-z]+_[0-9]{5}$/
  return pattern.test(uid)
}

/**
 * Extracts information from a custom UID
 */
export function parseCustomUid(uid: string): { firstName: string, lastName: string, digits: string } | null {
  if (!validateCustomUid(uid)) {
    return null
  }
  
  const match = uid.match(/^([a-z]+)_([a-z]+)_([0-9]{5})$/)
  if (!match) {
    return null
  }
  
  return {
    firstName: match[1],
    lastName: match[2],
    digits: match[3]
  }
}

/**
 * Checks if a custom UID already exists in Firestore
 */
export async function checkCustomUidExists(customUid: string, role: 'athlete' | 'coach'): Promise<boolean> {
  try {
    const { getFirebaseDb } = await import('~/composables/firebase')
    const { doc, getDoc } = await import('firebase/firestore')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }
    
    // Check in the appropriate collection based on role
    const collection = role === 'coach' ? 'coaches' : 'athletes'
    const docRef = doc(db, collection, customUid)
    const docSnap = await getDoc(docRef)
    
    return docSnap.exists()
  } catch (error) {
    console.error('Error checking if custom UID exists:', error)
    return false
  }
}

/**
 * Generates a unique custom UID by checking for conflicts
 */
export async function generateUniqueCustomUid(data: CustomUidData): Promise<string> {
  let customUid = generateCustomUid(data)
  let attempts = 0
  const maxAttempts = 10
  
  while (await checkCustomUidExists(customUid, data.role) && attempts < maxAttempts) {
    attempts++
    console.log(`⚠️ Custom UID ${customUid} already exists, trying again... (attempt ${attempts})`)
    
    // Add a random suffix to make it unique
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const { firstName, lastName, authUid } = data
    
    const cleanFirstName = firstName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters but keep spaces
      .trim()
      .split(' ')[0] // Solo el primer nombre
    
    const cleanLastName = lastName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters but keep spaces
      .trim()
      .split(' ')[0] // Solo el primer apellido
    
    const last5Digits = authUid.slice(-5)
    customUid = `${cleanFirstName}_${cleanLastName}_${randomSuffix}${last5Digits.slice(-2)}`
  }
  
  if (attempts >= maxAttempts) {
    throw new Error('Could not generate unique custom UID after maximum attempts')
  }
  
  console.log(`✅ Generated unique custom UID: ${customUid}`)
  return customUid
} 