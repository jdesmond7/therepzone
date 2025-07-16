import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { getFirebaseDb } from './firebase'

// Utility function to clean names for folder structure
const cleanNameForPath = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Helper function to safely get Firebase Storage instance
const getFirebaseStorage = () => {
  try {
    console.log('🔄 Inicializando Firebase Storage...')
    
    if (!process.client) {
      throw new Error('Firebase Storage solo está disponible en el cliente')
    }
    
    // Use the existing Firebase initialization from firebase.ts
    // This will initialize Firebase if not already done
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase no está inicializado')
    }
    
    // Get Storage instance - Firebase app is already initialized
    const storage = getStorage()
    console.log('✅ Firebase Storage inicializado correctamente')
    
    return storage
  } catch (error) {
    console.error('❌ Error inicializando Firebase Storage:', error)
    throw error
  }
}

export const useFirebaseStorage = () => {

  const uploadExerciseImage = async (file: File, exerciseName: string, exerciseId?: string) => {
    try {
      console.log('📤 Iniciando subida de imagen de ejercicio...')
      console.log('📄 Archivo:', file.name, file.size, 'bytes')
      console.log('🏋️ Ejercicio:', exerciseName)
      
      // Now that Storage rules are updated, try Firebase Storage first
      try {
        console.log('🔄 Intentando subida a Firebase Storage...')
        
        // Get Firebase Storage instance
        const storage = getFirebaseStorage()
        console.log('✅ Storage obtenido, verificando autenticación...')
        
        // Clean exercise name for folder structure
        const cleanExerciseName = cleanNameForPath(exerciseName)
        console.log('🧹 Nombre limpio:', cleanExerciseName)
        
        // Create structured path: exercises/[exercise_name]/[exercise_name].webp
        const fileExtension = file.name.split('.').pop() || 'webp'
        const fileName = `${cleanExerciseName}.${fileExtension}`
        const imagePath = `exercises/${cleanExerciseName}/${fileName}`
        const imageRef = storageRef(storage, imagePath)
        
        console.log(`📁 Subiendo a Firebase Storage: ${imagePath}`)
        console.log('🔑 Intentando acceso con usuario autenticado...')
        
        // Log more info about the upload
        console.log('📦 Detalles de la subida:')
        console.log('  - Archivo:', file.name)
        console.log('  - Tamaño:', file.size, 'bytes')
        console.log('  - Tipo:', file.type)
        console.log('  - Ruta destino:', imagePath)
        
        // Upload the file to Firebase Storage
        console.log('⬆️ Ejecutando uploadBytes...')
        console.log('⏱️ Iniciando subida con timeout de 30 segundos...')
        
        // Add timeout to prevent hanging
        const uploadPromise = uploadBytes(imageRef, file)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout: La subida tomó más de 30 segundos')), 30000)
        })
        
        const snapshot = await Promise.race([uploadPromise, timeoutPromise])
        console.log('✅ Archivo subido exitosamente a Firebase Storage!')
        
        // Get the download URL
        console.log('🔗 Obteniendo URL de descarga...')
        const downloadURL = await getDownloadURL(snapshot.ref)
        console.log('✅ URL de Firebase Storage obtenida:', downloadURL)
        console.log('📁 Archivo guardado en:', snapshot.ref.fullPath)
        
        return { 
          success: true, 
          url: downloadURL, 
          path: snapshot.ref.fullPath,
          isFirebaseStorage: true,
          storageLocation: imagePath
        }
        
      } catch (storageError: any) {
        console.error('❌ Firebase Storage falló:', storageError)
        console.log('🔄 Usando método de respaldo (Data URL)...')
        
        // FALLBACK: Use Data URL method
        const reader = new FileReader()
        const dataUrlPromise = new Promise<string>((resolve, reject) => {
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string)
            } else {
              reject(new Error('Failed to read file'))
            }
          }
          reader.onerror = () => reject(new Error('FileReader error'))
          reader.readAsDataURL(file)
        })
        
        const dataUrl = await dataUrlPromise
        console.log('✅ Método de respaldo exitoso (Data URL)')
        
        // Clean exercise name for future Firebase Storage path
        const cleanExerciseName = cleanNameForPath(exerciseName)
        const fileExtension = file.name.split('.').pop() || 'webp'
        const futurePath = `exercises/${cleanExerciseName}/${cleanExerciseName}.${fileExtension}`
        
        return { 
          success: true, 
          url: dataUrl, 
          path: futurePath,
          isTemporary: true,
          fallbackUsed: true,
          storageError: storageError.message
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error general procesando imagen:', error)
      return { 
        success: false, 
        error: error.message || error.toString(),
        code: error.code,
        fullError: error
      }
    }
  }

  const deleteImage = async (imagePath: string) => {
    try {
      const storage = getFirebaseStorage()
      const imageRef = storageRef(storage, imagePath)
      await deleteObject(imageRef)
      console.log(`🗑️ Imagen eliminada: ${imagePath}`)
      return { success: true }
    } catch (error) {
      console.error('Error deleting image:', error)
      return { success: false, error }
    }
  }

  // Legacy function for backward compatibility
  const deleteExerciseImage = async (imagePath: string) => {
    return deleteImage(imagePath)
  }

  const uploadWorkoutImage = async (file: File, workoutName: string, workoutId?: string) => {
    try {
      const storage = getFirebaseStorage()
      
      // Clean workout name for folder structure
      const cleanWorkoutName = cleanNameForPath(workoutName)
      
      // Create structured path: workouts/[workout_name]/[workout_name].webp
      const fileExtension = file.name.split('.').pop() || 'webp'
      const fileName = `${cleanWorkoutName}.${fileExtension}`
      const imagePath = `workouts/${cleanWorkoutName}/${fileName}`
      const imageRef = storageRef(storage, imagePath)
      
      console.log(`📁 Subiendo imagen de entrenamiento a: ${imagePath}`)
      
      const snapshot = await uploadBytes(imageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return { success: true, url: downloadURL, path: snapshot.ref.fullPath }
    } catch (error) {
      console.error('Error uploading workout image:', error)
      return { success: false, error }
    }
  }

  const uploadProfileImage = async (file: File, userId: string, athleteName: string) => {
    try {
      const storage = getFirebaseStorage()
      
      // Clean athlete name for folder structure
      const cleanAthleteName = cleanNameForPath(athleteName)
      
      // Create structured path: athletes/[athlete_name]/[athlete_name].webp
      const fileExtension = file.name.split('.').pop() || 'webp'
      const fileName = `${cleanAthleteName}.${fileExtension}`
      const imagePath = `athletes/${cleanAthleteName}/${fileName}`
      const imageRef = storageRef(storage, imagePath)
      
      console.log(`📁 Subiendo imagen de atleta a: ${imagePath}`)
      
      const snapshot = await uploadBytes(imageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return { success: true, url: downloadURL, path: snapshot.ref.fullPath }
    } catch (error) {
      console.error('Error uploading profile image:', error)
      return { success: false, error }
    }
  }

  const uploadCredentialFile = async (file: File, path: string) => {
    try {
      const storage = getFirebaseStorage()
      
      // Create structured path for credentials
      const fileExtension = file.name.split('.').pop() || 'pdf'
      const fileName = `${Date.now()}.${fileExtension}`
      const filePath = `${path}/${fileName}`
      const fileRef = storageRef(storage, filePath)
      
      console.log(`📁 Subiendo archivo de credencial a: ${filePath}`)
      
      const snapshot = await uploadBytes(fileRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return { success: true, url: downloadURL, path: snapshot.ref.fullPath }
    } catch (error) {
      console.error('Error uploading credential file:', error)
      return { success: false, error }
    }
  }

  return {
    uploadExerciseImage,
    uploadWorkoutImage,
    uploadProfileImage,
    uploadCredentialFile,
    deleteImage,
    deleteExerciseImage // For backward compatibility
  }
} 