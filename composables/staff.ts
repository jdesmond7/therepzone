// Staff operations for THEREPZONE
import { getFirebaseDb } from './firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  type Timestamp 
} from 'firebase/firestore'

// Helper function to safely get Firestore instance
const getDb = () => {
  const db = getFirebaseDb()
  if (!db) {
    throw new Error('Firestore is not initialized')
  }
  return db
}

// Staff interface - same as coach but for staff
export interface Staff {
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
  howDidYouHearAboutUs?: string
  startDate?: string
  profileCompleted?: boolean
  authUid?: string
  role: 'staff' | 'admin'
  createdAt: Timestamp
  updatedAt: Timestamp
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

export interface CreateStaffData {
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
  howDidYouHearAboutUs?: string
  startDate?: string
  profileCompleted?: boolean
  authUid?: string
  role?: 'staff' | 'admin'
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

export interface UpdateStaffData {
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
  howDidYouHearAboutUs?: string
  startDate?: string
  profileCompleted?: boolean
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

export const useStaff = () => {
  const staffCollection = collection(getDb(), 'staff')

  // Get all staff members
  const getStaff = async (): Promise<{ success: boolean; staff?: Staff[]; error?: string }> => {
    try {
      const q = query(staffCollection, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const staff = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as Staff))
      return { success: true, staff }
    } catch (error) {
      console.error('Error getting staff:', error)
      return { success: false, error: 'Error al obtener el personal' }
    }
  }

  // Get staff by custom UID
  const getStaffById = async (staffId: string): Promise<{ success: boolean; staff?: Staff; error?: string }> => {
    try {
      const docRef = doc(getDb(), 'staff', staffId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const staff = { ...docSnap.data(), uid: docSnap.id } as Staff
        return { success: true, staff }
      } else {
        return { success: false, error: 'Personal no encontrado' }
      }
    } catch (error) {
      console.error('Error getting staff by ID:', error)
      return { success: false, error: 'Error al obtener el personal' }
    }
  }

  // Get staff by auth UID
  const getStaffByAuthUID = async (authUid: string): Promise<{ success: boolean; staff?: Staff; error?: string }> => {
    try {
      const q = query(staffCollection, where('authUid', '==', authUid))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const staff = { ...doc.data(), uid: doc.id } as Staff
        return { success: true, staff }
      } else {
        return { success: false, error: 'Personal no encontrado' }
      }
    } catch (error) {
      console.error('Error getting staff by auth UID:', error)
      return { success: false, error: 'Error al obtener el personal' }
    }
  }

  // Create new staff member
  const createStaff = async (staffData: CreateStaffData): Promise<{ success: boolean; staffId?: string; error?: string }> => {
    try {
      const staffDoc = {
        ...staffData,
        fullName: staffData.fullName || `${staffData.firstName} ${staffData.lastName}`.trim(),
        presentationTitle: staffData.presentationTitle || 'Staff Member',
        role: staffData.role || 'staff',
        // Campos adicionales del perfil
        nickname: staffData.nickname,
        birthDate: staffData.birthDate,
        gender: staffData.gender,
        country: staffData.country,
        city: staffData.city,
        howDidYouHearAboutUs: staffData.howDidYouHearAboutUs,
        startDate: staffData.startDate,
        profileCompleted: staffData.profileCompleted,
        authUid: staffData.authUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      // Usar setDoc con el UID personalizado en lugar de addDoc
      const docRef = doc(getDb(), 'staff', staffData.uid)
      await setDoc(docRef, staffDoc)
      return { success: true, staffId: staffData.uid }
    } catch (error) {
      console.error('Error creating staff:', error)
      return { success: false, error: 'Error al crear el personal' }
    }
  }

  // Update staff
  const updateStaff = async (staffId: string, updateData: UpdateStaffData): Promise<{ success: boolean; error?: string }> => {
    try {
      const staffRef = doc(getDb(), 'staff', staffId)
      await updateDoc(staffRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error updating staff:', error)
      return { success: false, error: 'Error al actualizar el personal' }
    }
  }

  // Delete staff
  const deleteStaff = async (staffId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const staffRef = doc(getDb(), 'staff', staffId)
      await deleteDoc(staffRef)
      return { success: true }
    } catch (error) {
      console.error('Error deleting staff:', error)
      return { success: false, error: 'Error al eliminar el personal' }
    }
  }

  return {
    getStaff,
    getStaffById,
    getStaffByAuthUID,
    createStaff,
    updateStaff,
    deleteStaff
  }
} 