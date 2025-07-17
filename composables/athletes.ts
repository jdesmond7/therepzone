import { doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, collection, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
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
  // Campos adicionales del perfil
  nickname?: string
  birthDate?: string
  gender?: 'masculino' | 'femenino' | 'otro'
  country?: string
  city?: string
  howDidYouHearAboutUs?: string
  startDate?: string
  authUid?: string
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
      console.log('🔍 [useAthletes] Buscando atletas para coach:', coachId)
      
      // Primero intentar con orderBy
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
        
        console.log(`✅ [useAthletes] Query con orderBy exitoso: ${athletes.length} atletas`)
        return { success: true, athletes }
      } catch (orderError) {
        console.warn('⚠️ [useAthletes] Query con orderBy falló, intentando sin orderBy...', orderError)
        
        // Fallback: query simple sin orderBy
        const athletesQuery = query(
          athletesCollection(), 
          where('coachId', '==', coachId)
        )
        const athletesSnapshot = await getDocs(athletesQuery)
        
        const athletes: Athlete[] = []
        athletesSnapshot.forEach((doc) => {
          athletes.push({ ...doc.data(), uid: doc.id } as Athlete)
        })
        
        console.log(`✅ [useAthletes] Query simple exitoso: ${athletes.length} atletas`)
        return { success: true, athletes }
      }
    } catch (error) {
      console.error('❌ [useAthletes] Error getting athletes by coach:', error)
      return { success: false, error: 'Error al obtener los atletas del coach' }
    }
  }

  // Create new athlete
  const createAthlete = async (athleteData: CreateAthleteData): Promise<{ success: boolean; athleteId?: string; error?: string }> => {
    try {
      // Generate custom UID for the athlete
      const { generateUniqueCustomUid } = await import('~/utils/custom-uid-generator')
      const customUid = await generateUniqueCustomUid({
        role: 'client',
        firstName: athleteData.firstName,
        lastName: athleteData.lastName,
        authUid: athleteData.authUid || ''
      })
      
      const athleteDoc = {
        ...athleteData,
        fullName: athleteData.fullName || `${athleteData.firstName} ${athleteData.lastName}`.trim(),
        role: 'client' as const,
        assignedWorkouts: athleteData.assignedWorkouts || [],
        profileCompleted: athleteData.profileCompleted || false,
        // Campos adicionales del perfil
        nickname: athleteData.nickname,
        birthDate: athleteData.birthDate,
        gender: athleteData.gender,
        country: athleteData.country,
        city: athleteData.city,
        howDidYouHearAboutUs: athleteData.howDidYouHearAboutUs,
        startDate: athleteData.startDate,
        authUid: athleteData.authUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      // Usar setDoc con el UID personalizado en lugar de addDoc
      const docRef = doc(getDb(), 'athletes', customUid)
      await setDoc(docRef, athleteDoc)
      return { success: true, athleteId: customUid }
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