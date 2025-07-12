// Database cleanup and setup utilities for THEREPZONE
import { useExercises, type Exercise } from '~/composables/firestore'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { getFirebaseDb } from '~/composables/firebase'
import { serverTimestamp } from 'firebase/firestore'

// Pull-ups exercise data with correct structure
export const pullUpsExercise: Omit<Exercise, 'id' | 'createdAt'> = {
  title: "Pull-ups",
  description: "Ejercicio de tracción que trabaja la espalda y los brazos usando el peso corporal", 
  photo: "", // Will be set when image is uploaded
  category: "pull", 
  difficulty: "intermedio",
  createdBy: "coach",
  instructions: [
    "Cuelga de la barra con un agarre prono, manos a la altura de los hombros",
    "Activa el core y los omóplatos", 
    "Tira del cuerpo hacia arriba hasta que la barbilla pase la barra",
    "Baja lentamente hasta la posición inicial y repite"
  ],
  muscleGroups: [
    "dorsales",
    "bíceps", 
    "trapecio",
    "romboides",
    "deltoides posteriores"
  ],
  progressions: [],
  regressions: []
}

// Function to delete all existing exercises
export const clearAllExercises = async () => {
  try {
    console.log('🧹 Iniciando limpieza de ejercicios...')
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firestore no está disponible')
    }
    
    const exercisesCollection = collection(db, 'exercises')
    const querySnapshot = await getDocs(exercisesCollection)
    
    console.log(`📋 Encontrados ${querySnapshot.docs.length} ejercicios para eliminar`)
    
    const deletePromises = querySnapshot.docs.map(exerciseDoc => {
      console.log(`🗑️ Eliminando ejercicio: ${exerciseDoc.id}`)
      return deleteDoc(doc(db, 'exercises', exerciseDoc.id))
    })
    
    await Promise.all(deletePromises)
    
    console.log('✅ Todos los ejercicios eliminados exitosamente')
    return { success: true, deletedCount: querySnapshot.docs.length }
    
  } catch (error) {
    console.error('❌ Error limpiando ejercicios:', error)
    return { success: false, error }
  }
}

// Function to create the Pull-ups exercise
export const createPullUpsExercise = async () => {
  try {
    console.log('🏗️ Creando ejercicio Pull-ups...')
    
    const { createExercise } = useExercises()
    
    // Don't add serverTimestamp here - let the createExercise function handle it
    const exerciseData = pullUpsExercise
    
    console.log('📝 Datos del Pull-ups:', exerciseData)
    
    const result = await createExercise(exerciseData)
    
    if (result.success) {
      console.log('✅ Pull-ups creado exitosamente con ID:', result.id)
      return { success: true, id: result.id }
    } else {
      console.error('❌ Error creando Pull-ups:', result.error)
      return { success: false, error: result.error }
    }
    
  } catch (error) {
    console.error('❌ Error inesperado creando Pull-ups:', error)
    return { success: false, error }
  }
}

// Function to clean and setup database
export const cleanAndSetupDatabase = async () => {
  try {
    console.log('🚀 Iniciando limpieza y configuración de la base de datos...')
    
    // Step 1: Clear all existing exercises
    const clearResult = await clearAllExercises()
    if (!clearResult.success) {
      throw new Error(`Error en limpieza: ${clearResult.error}`)
    }
    
    // Step 2: Create Pull-ups exercise
    const pullUpsResult = await createPullUpsExercise()
    if (!pullUpsResult.success) {
      throw new Error(`Error creando Pull-ups: ${pullUpsResult.error}`)
    }
    
    console.log('🎉 Base de datos limpiada y configurada exitosamente!')
    return { 
      success: true, 
      cleared: clearResult.deletedCount,
      pullUpsId: pullUpsResult.id
    }
    
  } catch (error) {
    console.error('❌ Error en configuración de la base de datos:', error)
    return { success: false, error }
  }
} 