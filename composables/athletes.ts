import { doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, collection, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

export interface Athlete {
  uid: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string
  profileImageUrl?: string
  role: 'client'
  
  // Personal information
  gender?: 'masculino' | 'femenino' | 'otro'
  birthDate?: string
  hometown?: string
  nationality?: string
  currentAddress?: string
  biography?: string
  
  // Coach assignment
  coachId?: string
  
  // Workout assignments
  assignedWorkouts: string[]
  
  // Profile completion
  profileCompleted?: boolean
  startDate?: string
  
  // Metadata
  authUid?: string // Original Firebase Auth UID
  createdAt: any
  updatedAt: any
}

export interface CreateAthleteData {
  firstName: string
  lastName: string
  fullName?: string
  email: string
  phone?: string
  profileImageUrl?: string
  coachId?: string
  assignedWorkouts?: string[]
  profileCompleted?: boolean
}

export interface UpdateAthleteData {
  firstName?: string
  lastName?: string
  fullName?: string
  email?: string
  phone?: string
  profileImageUrl?: string
  coachId?: string
  assignedWorkouts?: string[]
  profileCompleted?: boolean
  gender?: 'masculino' | 'femenino' | 'otro'
  birthDate?: string
  hometown?: string
  nationality?: string
  currentAddress?: string
  biography?: string
}

export const useAthletes = () => {
  const getDb = () => {
    const db = getFirebaseDb()
    if (!db) throw new Error('Firebase not initialized')
    return db
  }

  const athletesCollection = () => collection(getDb(), 'athletes')

  // Get athlete by ID
  const getAthleteById = async (athleteId: string): Promise<{ success: boolean; athlete?: Athlete; error?: string }> => {
    try {
      console.log('🔍 [useAthletes] Buscando atleta con ID:', athleteId)
      const athleteDoc = await getDoc(doc(getDb(), 'athletes', athleteId))
      
      console.log('📄 [useAthletes] Documento existe:', athleteDoc.exists())
      
      if (athleteDoc.exists()) {
        const athleteData = athleteDoc.data() as Athlete
        console.log('✅ [useAthletes] Atleta encontrado:', athleteData)
        return { success: true, athlete: { ...athleteData, uid: athleteId } }
      } else {
        console.log('❌ [useAthletes] Atleta no encontrado para ID:', athleteId)
        return { success: false, error: 'Atleta no encontrado' }
      }
    } catch (error) {
      console.error('❌ [useAthletes] Error getting athlete:', error)
      return { success: false, error: 'Error al obtener el atleta' }
    }
  }

  // Get athlete by auth UID
  const getAthleteByAuthUID = async (authUID: string): Promise<{ success: boolean; athlete?: Athlete; error?: string }> => {
    try {
      console.log('🔍 [useAthletes] Buscando atleta por auth UID:', authUID)
      const athletesQuery = query(athletesCollection(), where('authUid', '==', authUID))
      const athletesSnapshot = await getDocs(athletesQuery)
      
      if (!athletesSnapshot.empty) {
        const athleteDoc = athletesSnapshot.docs[0]
        const athleteData = athleteDoc.data() as Athlete
        console.log('✅ [useAthletes] Atleta encontrado por auth UID:', athleteData)
        return { success: true, athlete: { ...athleteData, uid: athleteDoc.id } }
      } else {
        console.log('❌ [useAthletes] Atleta no encontrado por auth UID:', authUID)
        return { success: false, error: 'Atleta no encontrado' }
      }
    } catch (error) {
      console.error('❌ [useAthletes] Error getting athlete by auth UID:', error)
      return { success: false, error: 'Error al obtener el atleta' }
    }
  }

  // Get all athletes
  const getAllAthletes = async (): Promise<{ success: boolean; athletes?: Athlete[]; error?: string }> => {
    try {
      const athletesQuery = query(athletesCollection(), orderBy('createdAt', 'desc'))
      const athletesSnapshot = await getDocs(athletesQuery)
      
      const athletes: Athlete[] = []
      athletesSnapshot.forEach((doc) => {
        athletes.push({ ...doc.data(), uid: doc.id } as Athlete)
      })
      
      return { success: true, athletes }
    } catch (error) {
      console.error('Error getting athletes:', error)
      return { success: false, error: 'Error al obtener los atletas' }
    }
  }

  // Get athletes by coach
  const getAthletesByCoach = async (coachId: string): Promise<{ success: boolean; athletes?: Athlete[]; error?: string }> => {
    try {
      const athletesQuery = query(
        athletesCollection(), 
        where('coachId', '==', coachId),
        orderBy('createdAt', 'desc')
      )
      const athletesSnapshot = await getDocs(athletesQuery)
      
      const athletes: Athlete[] = []
      athletesSnapshot.forEach((doc) => {
        athletes.push({ ...doc.data(), uid: doc.id } as Athlete)
      })
      
      return { success: true, athletes }
    } catch (error) {
      console.error('Error getting athletes by coach:', error)
      return { success: false, error: 'Error al obtener los atletas del coach' }
    }
  }

  // Create new athlete
  const createAthlete = async (athleteData: CreateAthleteData): Promise<{ success: boolean; athleteId?: string; error?: string }> => {
    try {
      const athleteDoc = {
        ...athleteData,
        fullName: athleteData.fullName || `${athleteData.firstName} ${athleteData.lastName}`.trim(),
        role: 'client' as const,
        assignedWorkouts: athleteData.assignedWorkouts || [],
        profileCompleted: athleteData.profileCompleted || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(athletesCollection(), athleteDoc)
      return { success: true, athleteId: docRef.id }
    } catch (error) {
      console.error('Error creating athlete:', error)
      return { success: false, error: 'Error al crear el atleta' }
    }
  }

  // Update athlete
  const updateAthlete = async (athleteId: string, updateData: UpdateAthleteData): Promise<{ success: boolean; error?: string }> => {
    try {
      const athleteRef = doc(getDb(), 'athletes', athleteId)
      await updateDoc(athleteRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error updating athlete:', error)
      return { success: false, error: 'Error al actualizar el atleta' }
    }
  }

  // Delete athlete
  const deleteAthlete = async (athleteId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await deleteDoc(doc(getDb(), 'athletes', athleteId))
      return { success: true }
    } catch (error) {
      console.error('Error deleting athlete:', error)
      return { success: false, error: 'Error al eliminar el atleta' }
    }
  }

  // Get athletes by criteria
  const getAthletesByCriteria = async (criteria: { [key: string]: any }): Promise<{ success: boolean; athletes?: Athlete[]; error?: string }> => {
    try {
      const constraints = Object.entries(criteria).map(([key, value]) => where(key, '==', value))
      const athletesQuery = query(athletesCollection(), ...constraints, orderBy('createdAt', 'desc'))
      const athletesSnapshot = await getDocs(athletesQuery)
      
      const athletes: Athlete[] = []
      athletesSnapshot.forEach((doc) => {
        athletes.push({ ...doc.data(), uid: doc.id } as Athlete)
      })
      
      return { success: true, athletes }
    } catch (error) {
      console.error('Error getting athletes by criteria:', error)
      return { success: false, error: 'Error al obtener los atletas' }
    }
  }

  return {
    getAthleteById,
    getAthleteByAuthUID,
    getAllAthletes,
    getAthletesByCoach,
    createAthlete,
    updateAthlete,
    deleteAthlete,
    getAthletesByCriteria
  }
} 