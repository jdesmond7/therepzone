// Firestore operations for THEREPZONE
import { getFirebaseDb } from './firebase'
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  type Timestamp 
} from 'firebase/firestore'

// Helper function to safely get Firestore instance
const getDb = () => {
  console.log('🔄 Obteniendo instancia de Firestore...')
  console.log('🌐 Process client:', process.client)
  
  const db = getFirebaseDb()
  console.log('🔗 Firestore DB obtenida:', !!db)
  
  if (!db) {
    const error = 'Firestore is not initialized. Make sure you are on the client side.'
    console.error('❌', error)
    throw new Error(error)
  }
  
  console.log('✅ Firestore conectado correctamente')
  return db
}

// Types for our collections
export interface User {
  id?: string
  fullName?: string // Mantener para compatibilidad hacia atrás
  firstName: string
  lastName: string
  email: string
  role: 'athlete' | 'coach' | 'admin'
  gymId?: string
  profileImageUrl?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  assignedWorkouts: string[]
  coachId?: string // For clients - who is their assigned coach
  authUid?: string // UID de Auth para referencia cruzada
  // Campos adicionales del perfil
  nickname?: string
  birthDate?: string // Fecha de cumpleaños en formato /yyyy
  age?: number // Mantener para compatibilidad hacia atrás
  gender?: 'masculino' | 'femenino' | 'otro'
  phone?: string
  profilePhoto?: string
  country?: string
  city?: string
  howDidYouHearAboutUs?: string
  startDate?: string // Fecha de inicio (creación del perfil completo)
  profileCompleted?: boolean // Indica si completó toda la información
  
  // Campos específicos para coaches
  specialties?: string[] // Especialidades del coach ['fuerza', 'cardio', 'flexibilidad', etc.]
  certifications?: string[] // Certificaciones del coach
  experience?: number // Años de experiencia
  bio?: string // Biografía del coach
  hourlyRate?: number // Tarifa por hora (opcional)
  availability?: string[] // Horarios disponibles ['lunes-9am', 'martes-3pm', etc.]
  isAvailable?: boolean // Si está disponiendo nuevos clientes
  maxClients?: number // Máximo número de clientes
  currentClients?: number // Número actual de clientes (se calcula automáticamente)
  uid?: string // UID de Auth para compatibilidad con el store
}

export interface Exercise {
  id?: string
  title: string
  description: string
  photo?: string // Main photo field for exercise image
  photoUrl?: string // Deprecated: keeping for backward compatibility
  imagePath?: string // Firebase Storage path for image deletion
  regionWorking: string // 'Tren Superior', 'Tren Inferior', 'Core'
  difficulty: 'principiante' | 'intermedio' | 'avanzado'
  createdAt: Timestamp
  createdBy: string // Coach ID who created this exercise
  instructions: string[]
  primaryMuscleWorking: string[] // Array of primary muscles worked
  secondaryMuscleWorking: string[] // Array of secondary muscles worked
  progressions: string[] // Array of exercise IDs that are harder versions
  regressions: string[] // Array of exercise IDs that are easier versions
}

export interface WorkoutExercise {
  exerciseId: string
  sets: number
  reps?: number // Optional, could be time-based
  weight?: number // Optional, bodyweight exercises might not have weight
  restTime: number // Rest time in seconds
  notes?: string
}

export interface Workout {
  id?: string
  title: string
  description: string
  exercises: WorkoutExercise[]
  estimatedDuration: number // In minutes
  difficulty: 'principiante' | 'intermedio' | 'avanzado'
  regionWorking: string[] // Array of regions: 'tren superior', 'tren inferior', 'core', 'full body'
  createdBy: string // Coach ID
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface WorkoutAssignment {
  id?: string
  workoutId: string
  clientId: string
  coachId: string
  assignedDate: Timestamp
  dueDate?: Timestamp
  status: 'pending' | 'completed' | 'skipped'
  completedAt?: Timestamp
}

export interface WorkoutLog {
  id?: string
  assignmentId: string
  clientId: string
  workoutId: string
  startTime: Timestamp
  endTime?: Timestamp
  exercises: {
    exerciseId: string
    sets: {
      reps: number
      weight?: number
      duration?: number // For time-based exercises
      restTime: number
    }[]
    notes?: string
  }[]
  totalDuration?: number // In minutes
  status: 'in-progress' | 'completed' | 'abandoned'
  notes?: string
}

// User operations
export const useUsers = () => {
  const usersCollection = collection(getDb(), 'users')

  const createUser = async (customUid: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('🔄 Intentando crear usuario en Firestore con UID custom:', customUid)
      console.log('📝 Datos del usuario:', userData)
      
      const db = getDb()
      console.log('✅ Conexión a Firestore obtenida')
      
      const docData = {
        ...userData,
        id: customUid, // Store the custom UID as the document ID
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = doc(db, 'users', customUid)
      console.log('📍 Referencia del documento creada:', docRef.path)
      
      await setDoc(docRef, docData)
      console.log('✅ Documento creado exitosamente en Firestore con UID custom:', customUid)
      
      return { success: true, id: customUid }
    } catch (error: any) {
      console.error('❌ Error completo creando usuario en Firestore:', error)
      console.error('❌ Error code:', error.code)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
      
      return { 
        success: false, 
        error: error.message || error.toString(),
        code: error.code,
        fullError: error
      }
    }
  }

  const getUserById = async (userId: string) => {
    try {
      // First try to get by custom UID (document ID)
      const docRef = doc(getDb(), 'users', userId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { success: true, user: { id: docSnap.id, ...docSnap.data() } as User }
      }
      // If not found by custom UID, try to find by authUid
      console.log('🔍 Usuario no encontrado por UID custom, buscando por authUid...', userId)
      const usersQuery = query(
        collection(getDb(), 'users'),
        where('authUid', '==', userId)
      )
      const querySnapshot = await getDocs(usersQuery)
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]
        return { success: true, user: { id: userDoc.id, ...userDoc.data() } as User }
      }
      console.error('❌ Usuario no encontrado ni por UID custom ni por authUid:', userId)
      return { success: false, error: 'User not found by custom UID or authUid' }
    } catch (error) {
      console.error('Error getting user:', error)
      return { success: false, error }
    }
  }

  const getClientsByCoach = async (coachId: string) => {
    try {
          const q = query(usersCollection, where('coachId', '==', coachId), where('role', '==', 'athlete'))
    const querySnapshot = await getDocs(q)
    const athletes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
    return { success: true, athletes }
    } catch (error) {
      console.error('Error getting clients:', error)
      return { success: false, error }
    }
  }

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const docRef = doc(getDb(), 'users', userId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('Error updating user:', error)
      return { success: false, error }
    }
  }

  // Coach-specific functions
  const getCoaches = async () => {
    try {
      const q = query(usersCollection, where('role', '==', 'coach'))
      const querySnapshot = await getDocs(q)
      const coaches = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
      return { success: true, coaches }
    } catch (error) {
      console.error('Error getting coaches:', error)
      return { success: false, error }
    }
  }

  const getCoachById = async (coachId: string) => {
    try {
      const docRef = doc(getDb(), 'users', coachId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const user = { id: docSnap.id, ...docSnap.data() } as User
        if (user.role === 'coach') {
          return { success: true, coach: user }
        } else {
          return { success: false, error: 'User is not a coach' }
        }
      } else {
        return { success: false, error: 'Coach not found' }
      }
    } catch (error) {
      console.error('Error getting coach:', error)
      return { success: false, error }
    }
  }

  const assignCoachToClient = async (clientId: string, coachId: string) => {
    try {
      // Actualizar el cliente con el coach asignado
      const clientDocRef = doc(getDb(), 'users', clientId)
      await updateDoc(clientDocRef, {
        coachId: coachId,
        updatedAt: serverTimestamp()
      })
      
      // Actualizar el contador de clientes del coach
      await updateCoachClientCount(coachId)
      
      return { success: true }
    } catch (error) {
      console.error('Error assigning coach to client:', error)
      return { success: false, error }
    }
  }

  const updateCoachClientCount = async (coachId: string) => {
    try {
      // Contar clientes actuales del coach
      const q = query(usersCollection, where('coachId', '==', coachId), where('role', '==', 'athlete'))
      const querySnapshot = await getDocs(q)
      const currentAthletes = querySnapshot.size
      
      // Actualizar el contador en el documento del coach
      const coachDocRef = doc(getDb(), 'users', coachId)
      await updateDoc(coachDocRef, {
        currentAthletes: currentAthletes,
        updatedAt: serverTimestamp()
      })
      
      return { success: true, count: currentAthletes }
    } catch (error) {
      console.error('Error updating coach client count:', error)
      return { success: false, error }
    }
  }

  const getClientsWithoutCoach = async () => {
    try {
      const q = query(
        usersCollection, 
        where('role', '==', 'athlete'),
        where('coachId', '==', null)
      )
      const querySnapshot = await getDocs(q)
      const athletes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
      return { success: true, athletes }
    } catch (error) {
      console.error('Error getting clients without coach:', error)
      return { success: false, error }
    }
  }

  // Guardar histórico de métricas del usuario
  const saveUserMetricHistory = async (userId: string, metricas: Record<string, number|null>) => {
    try {
      const db = getDb()
      const metricasCollection = collection(db, 'users', userId, 'metricas')
      await addDoc(metricasCollection, {
        medidas: metricas,
        fecha: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('Error guardando histórico de métricas:', error)
      return { success: false, error }
    }
  }

  return {
    createUser,
    getUserById,
    getClientsByCoach,
    updateUser,
    getCoaches,
    getCoachById,
    assignCoachToClient,
    updateCoachClientCount,
    getClientsWithoutCoach,
    saveUserMetricHistory
  }
}

// Exercise operations
export const useExercises = () => {

  const createExercise = async (exerciseData: Omit<Exercise, 'id' | 'createdAt'>) => {
    try {
      console.log('🏋️ Intentando crear ejercicio en Firestore:', exerciseData.title)
      console.log('📝 Datos del ejercicio:', exerciseData)
      
      const db = getDb()
      console.log('✅ Conexión a Firestore obtenida para ejercicio')
      
      const docData = {
        ...exerciseData,
        createdAt: serverTimestamp()
      }
      
      console.log('📋 Preparando datos para Firestore...', docData)
      
      const exercisesCollection = collection(db, 'exercises')
      console.log('📁 Colección exercises obtenida')
      
      console.log('📤 Subiendo documento a Firestore...')
      const docRef = await addDoc(exercisesCollection, docData)
      console.log('✅ Ejercicio creado exitosamente con ID:', docRef.id)
      
      return { success: true, id: docRef.id }
    } catch (error: any) {
      console.error('❌ Error completo creando ejercicio en Firestore:', error)
      console.error('❌ Error code:', error.code)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
      
      return { 
        success: false, 
        error: error.message || error.toString(),
        code: error.code,
        fullError: error
      }
    }
  }

  const getExercises = async (category?: string) => {
    try {
      const db = getDb()
      const exercisesCollection = collection(db, 'exercises')
      
      let q
      if (category) {
        q = query(exercisesCollection, where('category', '==', category), orderBy('title'))
      } else {
        q = query(exercisesCollection)
      }
      
      const querySnapshot = await getDocs(q)
      const exercises = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise))
      
      // Sort exercises by title in memory if no category filter
      if (!category) {
        exercises.sort((a, b) => a.title.localeCompare(b.title))
      }
      
      return { success: true, exercises }
    } catch (error: any) {
      console.error('Error getting exercises:', error)
      
      // If it's an index error, try without ordering
      if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
        try {
          const db = getDb()
          const exercisesCollection = collection(db, 'exercises')
          const q = query(exercisesCollection)
          const querySnapshot = await getDocs(q)
          const exercises = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise))
          exercises.sort((a, b) => a.title.localeCompare(b.title))
          return { success: true, exercises }
        } catch (retryError) {
          console.error('Error in retry:', retryError)
          return { success: false, error: retryError }
        }
      }
      
      return { success: false, error }
    }
  }

  const getExerciseById = async (exerciseId: string) => {
    try {
      const docRef = doc(getDb(), 'exercises', exerciseId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { success: true, exercise: { id: docSnap.id, ...docSnap.data() } as Exercise }
      } else {
        return { success: false, error: 'Exercise not found' }
      }
    } catch (error) {
      console.error('Error getting exercise:', error)
      return { success: false, error }
    }
  }

  const updateExercise = async (exerciseId: string, exerciseData: Partial<Exercise>) => {
    try {
      console.log('🔄 Intentando actualizar ejercicio en Firestore:', exerciseId)
      console.log('📝 Nuevos datos del ejercicio:', exerciseData)
      
      const db = getDb()
      console.log('✅ Conexión a Firestore obtenida para actualización')
      
      const docRef = doc(db, 'exercises', exerciseId)
      console.log('📍 Referencia del documento obtenida:', docRef.path)
      
      console.log('📤 Actualizando documento en Firestore...')
      await updateDoc(docRef, exerciseData)
      console.log('✅ Ejercicio actualizado exitosamente')
      
      return { success: true }
    } catch (error: any) {
      console.error('❌ Error completo actualizando ejercicio en Firestore:', error)
      console.error('❌ Error code:', error.code)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
      
      return { 
        success: false, 
        error: error.message || error.toString(),
        code: error.code,
        fullError: error
      }
    }
  }

  const deleteExercise = async (exerciseId: string) => {
    try {
      const docRef = doc(getDb(), 'exercises', exerciseId)
      await deleteDoc(docRef)
      return { success: true }
    } catch (error) {
      console.error('Error deleting exercise:', error)
      return { success: false, error }
    }
  }

  return {
    createExercise,
    getExercises,
    getExerciseById,
    updateExercise,
    deleteExercise
  }
}

// Workout operations
export const useWorkouts = () => {
  // Helper function to calculate region working based on exercises
  const calculateRegionWorking = (exercises: WorkoutExercise[], allExercises: Exercise[]): string[] => {
    const regions = new Set<string>()
    let hasCore = false
    
    exercises.forEach(workoutExercise => {
      const exercise = allExercises.find(e => e.id === workoutExercise.exerciseId)
      if (exercise) {
        if (exercise.regionWorking === 'Core') {
          hasCore = true
        } else {
          regions.add(exercise.regionWorking)
        }
      }
    })
    
    const regionArray = Array.from(regions)
    const finalRegions: string[] = []
    
    // Logic for determining region combinations
    if (regionArray.length === 1) {
      finalRegions.push(regionArray[0])
    } else if (regionArray.length > 1) {
      finalRegions.push('Full Body')
    }
    
    if (hasCore) {
      finalRegions.push('Core')
    }
    
    return finalRegions
  }

  const createWorkout = async (workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const db = getDb()
      const workoutsCollection = collection(db, 'workouts')
      
      // If regionWorking is not provided, calculate it from exercises
      let finalWorkoutData = { ...workoutData }
      if (!workoutData.regionWorking || workoutData.regionWorking.length === 0) {
        // Get all exercises to calculate region working
        const { getExercises } = useExercises()
        const exercisesResult = await getExercises()
        if (exercisesResult.success && exercisesResult.exercises) {
          const calculatedRegions = calculateRegionWorking(workoutData.exercises, exercisesResult.exercises)
          finalWorkoutData.regionWorking = calculatedRegions
        }
      }
      
      const docData = {
        ...finalWorkoutData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      const docRef = await addDoc(workoutsCollection, docData)
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Error creating workout:', error)
      return { success: false, error }
    }
  }

  const getWorkoutsByCoach = async (coachId: string) => {
    try {
      console.log('🔄 Obteniendo rutinas para coach:', coachId)
      const db = getDb()
      const workoutsCollection = collection(db, 'workouts')
      
      // Try with orderBy first
      try {
        console.log('📋 Intentando query con orderBy...')
        const q = query(workoutsCollection, where('createdBy', '==', coachId), orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(q)
        const workouts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout))
        console.log(`✅ Query con orderBy exitoso: ${workouts.length} rutinas`)
        return { success: true, workouts }
      } catch (orderError) {
        console.warn('⚠️ Query con orderBy falló, intentando sin orderBy...', orderError)
        
        // Fallback to simple query without orderBy
        const q = query(workoutsCollection, where('createdBy', '==', coachId))
        const querySnapshot = await getDocs(q)
        const workouts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout))
        console.log(`✅ Query simple exitoso: ${workouts.length} rutinas`)
        return { success: true, workouts }
      }
    } catch (error) {
      console.error('❌ Error completo obteniendo rutinas:', error)
      return { success: false, error }
    }
  }

  const getWorkoutById = async (workoutId: string) => {
    try {
      const docRef = doc(getDb(), 'workouts', workoutId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { success: true, workout: { id: docSnap.id, ...docSnap.data() } as Workout }
      } else {
        return { success: false, error: 'Workout not found' }
      }
    } catch (error) {
      console.error('Error getting workout:', error)
      return { success: false, error }
    }
  }

  return {
    createWorkout,
    getWorkoutsByCoach,
    getWorkoutById
  }
}

// Workout Assignment operations
export const useWorkoutAssignments = () => {

  const assignWorkout = async (assignmentData: Omit<WorkoutAssignment, 'id' | 'assignedDate'>) => {
    try {
      const db = getDb()
      const assignmentsCollection = collection(db, 'workoutAssignments')
      
      const docData = {
        ...assignmentData,
        assignedDate: serverTimestamp()
      }
      const docRef = await addDoc(assignmentsCollection, docData)
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Error assigning workout:', error)
      return { success: false, error }
    }
  }

  const getClientAssignments = async (clientId: string) => {
    try {
      const db = getDb()
      const assignmentsCollection = collection(db, 'workoutAssignments')
      
      const q = query(
        assignmentsCollection, 
        where('clientId', '==', clientId), 
        orderBy('assignedDate', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const assignments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutAssignment))
      return { success: true, assignments }
    } catch (error) {
      console.error('Error getting client assignments:', error)
      return { success: false, error }
    }
  }

  const updateAssignmentStatus = async (assignmentId: string, status: WorkoutAssignment['status']) => {
    try {
      const docRef = doc(getDb(), 'workoutAssignments', assignmentId)
      const updates: any = { status }
      if (status === 'completed') {
        updates.completedAt = serverTimestamp()
      }
      await updateDoc(docRef, updates)
      return { success: true }
    } catch (error) {
      console.error('Error updating assignment status:', error)
      return { success: false, error }
    }
  }

  return {
    assignWorkout,
    getClientAssignments,
    updateAssignmentStatus
  }
}

// Workout Log operations
export const useWorkoutLogs = () => {

  const startWorkoutLog = async (logData: Omit<WorkoutLog, 'id' | 'startTime'>) => {
    try {
      const db = getDb()
      const logsCollection = collection(db, 'workoutLogs')
      
      const docData = {
        ...logData,
        startTime: serverTimestamp()
      }
      const docRef = await addDoc(logsCollection, docData)
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Error starting workout log:', error)
      return { success: false, error }
    }
  }

  const updateWorkoutLog = async (logId: string, updates: Partial<WorkoutLog>) => {
    try {
      const docRef = doc(getDb(), 'workoutLogs', logId)
      await updateDoc(docRef, updates)
      return { success: true }
    } catch (error) {
      console.error('Error updating workout log:', error)
      return { success: false, error }
    }
  }

  const completeWorkoutLog = async (logId: string, finalData: Partial<WorkoutLog>) => {
    try {
      const docRef = doc(getDb(), 'workoutLogs', logId)
      await updateDoc(docRef, {
        ...finalData,
        endTime: serverTimestamp(),
        status: 'completed'
      })
      return { success: true }
    } catch (error) {
      console.error('Error completing workout log:', error)
      return { success: false, error }
    }
  }

  const getClientWorkoutLogs = async (clientId: string) => {
    try {
      const db = getDb()
      const logsCollection = collection(db, 'workoutLogs')
      
      const q = query(
        logsCollection, 
        where('clientId', '==', clientId), 
        orderBy('startTime', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const logs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutLog))
      return { success: true, logs }
    } catch (error) {
      console.error('Error getting workout logs:', error)
      return { success: false, error }
    }
  }

  return {
    startWorkoutLog,
    updateWorkoutLog,
    completeWorkoutLog,
    getClientWorkoutLogs
  }
} 