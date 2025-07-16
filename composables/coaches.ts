import { doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, collection, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

export interface Coach {
  uid: string
  firstName: string
  lastName: string
  fullName: string
  nickname?: string
  email: string
  phone?: string
  profileImageUrl?: string
  presentationTitle: string
  role: 'coach'
  
  // Personal information
  gender?: 'masculino' | 'femenino' | 'otro'
  birthDate?: string
  country?: string
  state?: string
  city?: string
  nationality?: string
  currentAddress?: string
  addressLine1?: string
  addressLine2?: string
  postalCode?: string
  biography?: string
  
  // Education
  education?: Array<{
    degree: string
    institution: string
    period: string
  }>
  
  // Credentials
  credentials?: Array<{
    name: string
    issuer: string
    date: string
    fileUrl?: string
    fileName?: string
  }>
  
  // Metadata
  createdAt: any
  updatedAt: any
}

export interface CreateCoachData {
  uid: string
  firstName: string
  lastName: string
  fullName: string
  nickname?: string
  email: string
  phone?: string
  profileImageUrl?: string
  presentationTitle?: string
  gender?: 'masculino' | 'femenino' | 'otro'
  birthDate?: string
  country?: string
  state?: string
  city?: string
  nationality?: string
  currentAddress?: string
  addressLine1?: string
  addressLine2?: string
  postalCode?: string
  biography?: string
  education?: Array<{
    degree: string
    institution: string
    period: string
  }>
  credentials?: Array<{
    name: string
    issuer: string
    date: string
    fileUrl?: string
    fileName?: string
  }>
}

export interface UpdateCoachData {
  firstName?: string
  lastName?: string
  fullName?: string
  nickname?: string
  email?: string
  phone?: string
  profileImageUrl?: string
  presentationTitle?: string
  gender?: 'masculino' | 'femenino' | 'otro'
  birthDate?: string
  country?: string
  state?: string
  city?: string
  nationality?: string
  currentAddress?: string
  addressLine1?: string
  addressLine2?: string
  postalCode?: string
  biography?: string
  education?: Array<{
    degree: string
    institution: string
    period: string
  }>
  credentials?: Array<{
    name: string
    issuer: string
    date: string
    fileUrl?: string
    fileName?: string
  }>
}

export const useCoaches = () => {
  const getDb = () => {
    const db = getFirebaseDb()
    if (!db) throw new Error('Firebase not initialized')
    return db
  }

  const coachesCollection = () => collection(getDb(), 'coaches')

  // Get coach by ID
  const getCoachById = async (coachId: string): Promise<{ success: boolean; coach?: Coach; error?: string }> => {
    try {
      console.log('🔍 [useCoaches] Buscando coach con ID:', coachId)
      const coachDoc = await getDoc(doc(getDb(), 'coaches', coachId))
      
      console.log('📄 [useCoaches] Documento existe:', coachDoc.exists())
      
      if (coachDoc.exists()) {
        const coachData = coachDoc.data() as Coach
        console.log('✅ [useCoaches] Coach encontrado:', coachData)
        return { success: true, coach: { ...coachData, uid: coachId } }
      } else {
        console.log('❌ [useCoaches] Coach no encontrado para ID:', coachId)
        return { success: false, error: 'Coach no encontrado' }
      }
    } catch (error) {
      console.error('❌ [useCoaches] Error getting coach:', error)
      return { success: false, error: 'Error al obtener el coach' }
    }
  }

  // Get coach by auth UID
  const getCoachByAuthUID = async (authUID: string): Promise<{ success: boolean; coach?: Coach; error?: string }> => {
    try {
      console.log('🔍 [useCoaches] Buscando coach por auth UID:', authUID)
      const coachesQuery = query(coachesCollection(), where('authUid', '==', authUID))
      const coachesSnapshot = await getDocs(coachesQuery)
      
      if (!coachesSnapshot.empty) {
        const coachDoc = coachesSnapshot.docs[0]
        const coachData = coachDoc.data() as Coach
        console.log('✅ [useCoaches] Coach encontrado por auth UID:', coachData)
        return { success: true, coach: { ...coachData, uid: coachDoc.id } }
      } else {
        console.log('❌ [useCoaches] Coach no encontrado por auth UID:', authUID)
        return { success: false, error: 'Coach no encontrado' }
      }
    } catch (error) {
      console.error('❌ [useCoaches] Error getting coach by auth UID:', error)
      return { success: false, error: 'Error al obtener el coach' }
    }
  }

  // Get all coaches
  const getAllCoaches = async (): Promise<{ success: boolean; coaches?: Coach[]; error?: string }> => {
    try {
      const coachesQuery = query(coachesCollection(), orderBy('createdAt', 'desc'))
      const coachesSnapshot = await getDocs(coachesQuery)
      
      const coaches: Coach[] = []
      coachesSnapshot.forEach((doc) => {
        coaches.push({ ...doc.data(), uid: doc.id } as Coach)
      })
      
      return { success: true, coaches }
    } catch (error) {
      console.error('Error getting coaches:', error)
      return { success: false, error: 'Error al obtener los coaches' }
    }
  }

  // Create new coach
  const createCoach = async (coachData: CreateCoachData): Promise<{ success: boolean; coachId?: string; error?: string }> => {
    try {
      const coachDoc = {
        ...coachData,
        fullName: coachData.fullName || `${coachData.firstName} ${coachData.lastName}`.trim(),
        presentationTitle: coachData.presentationTitle || 'Fitness Coach',
        role: 'coach' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(coachesCollection(), coachDoc)
      return { success: true, coachId: docRef.id }
    } catch (error) {
      console.error('Error creating coach:', error)
      return { success: false, error: 'Error al crear el coach' }
    }
  }

  // Update coach
  const updateCoach = async (coachId: string, updateData: UpdateCoachData): Promise<{ success: boolean; error?: string }> => {
    try {
      const coachRef = doc(getDb(), 'coaches', coachId)
      await updateDoc(coachRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error updating coach:', error)
      return { success: false, error: 'Error al actualizar el coach' }
    }
  }

  // Delete coach
  const deleteCoach = async (coachId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await deleteDoc(doc(getDb(), 'coaches', coachId))
      return { success: true }
    } catch (error) {
      console.error('Error deleting coach:', error)
      return { success: false, error: 'Error al eliminar el coach' }
    }
  }

  // Get coaches by criteria
  const getCoachesByCriteria = async (criteria: { [key: string]: any }): Promise<{ success: boolean; coaches?: Coach[]; error?: string }> => {
    try {
      const constraints = Object.entries(criteria).map(([key, value]) => where(key, '==', value))
      const coachesQuery = query(coachesCollection(), ...constraints, orderBy('createdAt', 'desc'))
      const coachesSnapshot = await getDocs(coachesQuery)
      
      const coaches: Coach[] = []
      coachesSnapshot.forEach((doc) => {
        coaches.push({ ...doc.data(), uid: doc.id } as Coach)
      })
      
      return { success: true, coaches }
    } catch (error) {
      console.error('Error getting coaches by criteria:', error)
      return { success: false, error: 'Error al obtener los coaches' }
    }
  }

  return {
    getCoachById,
    getCoachByAuthUID,
    getAllCoaches,
    createCoach,
    updateCoach,
    deleteCoach,
    getCoachesByCriteria
  }
} 