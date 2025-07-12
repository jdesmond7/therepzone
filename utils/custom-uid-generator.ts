/**
 * Generates custom UIDs for coaches and clients
 * Format: role_firstName+5digits
 * Example: coach_juan12345, client_maria67890
 */

export interface CustomUidData {
  role: 'client' | 'coach'
  firstName: string
  authUid: string // Original Firebase Auth UID
}

export function generateCustomUid(data: CustomUidData): string {
  const { role, firstName, authUid } = data
  
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
  const customUid = `${role}_${cleanFirstName}${last5Digits}`
  
  console.log(`🆔 Generated custom UID: ${customUid}`)
  console.log(`   Role: ${role}`)
  console.log(`   First Name: ${firstName} → ${cleanFirstName}`)
  console.log(`   Auth UID: ${authUid} → ${last5Digits}`)
  
  return customUid
}

/**
 * Validates if a custom UID follows the correct format
 */
export function validateCustomUid(uid: string): boolean {
  const pattern = /^(client|coach)_[a-z0-9]{1,10}[0-9]{5}$/
  return pattern.test(uid)
}

/**
 * Extracts information from a custom UID
 */
export function parseCustomUid(uid: string): { role: 'client' | 'coach', firstName: string, digits: string } | null {
  if (!validateCustomUid(uid)) {
    return null
  }
  
  const match = uid.match(/^(client|coach)_([a-z0-9]{1,10})([0-9]{5})$/)
  if (!match) {
    return null
  }
  
  return {
    role: match[1] as 'client' | 'coach',
    firstName: match[2],
    digits: match[3]
  }
}

/**
 * Checks if a custom UID already exists in Firestore
 */
export async function checkCustomUidExists(customUid: string): Promise<boolean> {
  try {
    const { getFirebaseDb } = await import('~/composables/firebase')
    const { doc, getDoc } = await import('firebase/firestore')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }
    
    const docRef = doc(db, 'users', customUid)
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
  
  while (await checkCustomUidExists(customUid) && attempts < maxAttempts) {
    attempts++
    console.log(`⚠️ Custom UID ${customUid} already exists, trying again... (attempt ${attempts})`)
    
    // Add a random suffix to make it unique
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const { role, firstName, authUid } = data
    
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
  
  console.log(`✅ Generated unique custom UID: ${customUid}`)
  return customUid
} 