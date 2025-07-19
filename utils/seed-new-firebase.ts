// Script to seed the new Firebase project with sample data
// This helps test the migration structure and custom UID generation

import { getFirebaseDb } from '~/composables/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

// Custom UID generator
function generateCustomUid(firstName: string, lastName: string, authUid: string): string {
  const cleanFirstName = firstName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .split(' ')[0] // Primer nombre completo
  
  const cleanLastName = lastName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .split(' ')[0] // Primer apellido completo
  
  // Get last 5 digits from authUid
  const last5Digits = authUid.slice(-5)
  
  return `${cleanFirstName}_${cleanLastName}_${last5Digits}`
}

// Sample data
const sampleAthletes = [
  {
    firstName: 'Juan',
    lastName: 'Pérez',
    fullName: 'Juan Pérez',
    email: 'juan.perez@example.com',
    phone: '+1234567890',
    role: 'client' as const,
    gender: 'masculino' as const,
    birthDate: '1990-05-15',
    hometown: 'Ciudad de México',
    nationality: 'Mexicana',
    profileCompleted: true,
    assignedWorkouts: [],
    authUid: 'auth123456789'
  },
  {
    firstName: 'María',
    lastName: 'García',
    fullName: 'María García',
    email: 'maria.garcia@example.com',
    phone: '+1234567891',
    role: 'client' as const,
    gender: 'femenino' as const,
    birthDate: '1988-12-03',
    hometown: 'Guadalajara',
    nationality: 'Mexicana',
    profileCompleted: true,
    assignedWorkouts: [],
    authUid: 'auth987654321'
  }
]

const sampleCoaches = [
  {
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    fullName: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@therepzone.com',
    phone: '+1234567892',
    role: 'coach' as const,
    gender: 'masculino' as const,
    birthDate: '1985-08-20',
    hometown: 'Monterrey',
    nationality: 'Mexicana',
    profileCompleted: true,
    specialties: ['fuerza', 'cardio'],
    experience: 5,
    bio: 'Entrenador certificado con 5 años de experiencia',
    authUid: 'auth555666777'
  }
]

const sampleStaff = [
  {
    firstName: 'Ana',
    lastName: 'López',
    fullName: 'Ana López',
    email: 'ana.lopez@therepzone.com',
    phone: '+1234567893',
    role: 'staff' as const,
    gender: 'femenino' as const,
    birthDate: '1992-03-10',
    hometown: 'Puebla',
    nationality: 'Mexicana',
    profileCompleted: true,
    authUid: 'auth111222333'
  }
]

const sampleExercises = [
  {
    title: 'Sentadillas',
    description: 'Ejercicio fundamental para piernas',
    regionWorking: 'piernas',
    difficulty: 'principiante' as const,
    primaryMuscleWorking: 'cuádriceps',
    secondaryMuscleWorking: ['glúteos', 'isquiotibiales'],
    instructions: [
      'Ponte de pie con los pies separados al ancho de los hombros',
      'Baja el cuerpo como si te sentaras en una silla',
      'Mantén el pecho arriba y las rodillas alineadas con los pies',
      'Vuelve a la posición inicial'
    ],
    progressions: ['sentadillas con peso', 'sentadillas con salto'],
    regressions: ['sentadillas asistidas', 'sentadillas parciales']
  },
  {
    title: 'Flexiones',
    description: 'Ejercicio para pecho y tríceps',
    regionWorking: 'torso',
    difficulty: 'intermedio' as const,
    primaryMuscleWorking: 'pectorales',
    secondaryMuscleWorking: ['tríceps', 'hombros'],
    instructions: [
      'Colócate en posición de plancha',
      'Baja el cuerpo hasta que el pecho toque el suelo',
      'Empuja hacia arriba hasta la posición inicial',
      'Mantén el cuerpo recto durante todo el movimiento'
    ],
    progressions: ['flexiones con palmada', 'flexiones con una mano'],
    regressions: ['flexiones de rodillas', 'flexiones inclinadas']
  }
]

const sampleWorkouts = [
  {
    title: 'Entrenamiento de Fuerza',
    description: 'Rutina completa para desarrollar fuerza',
    difficulty: 'intermedio' as const,
    duration: 60,
    exercises: [
      {
        exerciseId: 'sentadillas',
        sets: 3,
        reps: 12,
        rest: 90
      },
      {
        exerciseId: 'flexiones',
        sets: 3,
        reps: 10,
        rest: 60
      }
    ],
    createdBy: 'carlos_rodriguez_777'
  }
]

// Seed functions
export async function seedAthletes() {
  console.log('🌱 Sembrando atletas de ejemplo...')
  
  const db = getFirebaseDb()
  if (!db) {
    throw new Error('Firebase not initialized')
  }
  
  let seededCount = 0
  
  for (const athleteData of sampleAthletes) {
    try {
      const customUid = generateCustomUid(
        athleteData.firstName,
        athleteData.lastName,
        athleteData.authUid
      )
      
      console.log(`🔄 Creando atleta: ${athleteData.fullName} → ${customUid}`)
      
      const athleteDoc = {
        ...athleteData,
        uid: customUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = doc(db, 'athletes', customUid)
      await setDoc(docRef, athleteDoc)
      
      seededCount++
      console.log(`✅ Atleta creado: ${athleteData.fullName}`)
      
    } catch (error) {
      console.error(`❌ Error creando atleta ${athleteData.fullName}:`, error)
    }
  }
  
  console.log(`🎉 ${seededCount} atletas sembrados exitosamente`)
  return seededCount
}

export async function seedCoaches() {
  console.log('🌱 Sembrando coaches de ejemplo...')
  
  const db = getFirebaseDb()
  if (!db) {
    throw new Error('Firebase not initialized')
  }
  
  let seededCount = 0
  
  for (const coachData of sampleCoaches) {
    try {
      const customUid = generateCustomUid(
        coachData.firstName,
        coachData.lastName,
        coachData.authUid
      )
      
      console.log(`🔄 Creando coach: ${coachData.fullName} → ${customUid}`)
      
      const coachDoc = {
        ...coachData,
        uid: customUid,
        presentationTitle: 'Fitness Coach',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = doc(db, 'coaches', customUid)
      await setDoc(docRef, coachDoc)
      
      seededCount++
      console.log(`✅ Coach creado: ${coachData.fullName}`)
      
    } catch (error) {
      console.error(`❌ Error creando coach ${coachData.fullName}:`, error)
    }
  }
  
  console.log(`🎉 ${seededCount} coaches sembrados exitosamente`)
  return seededCount
}

export async function seedStaff() {
  console.log('🌱 Sembrando staff de ejemplo...')
  
  const db = getFirebaseDb()
  if (!db) {
    throw new Error('Firebase not initialized')
  }
  
  let seededCount = 0
  
  for (const staffData of sampleStaff) {
    try {
      const customUid = generateCustomUid(
        staffData.firstName,
        staffData.lastName,
        staffData.authUid
      )
      
      console.log(`🔄 Creando staff: ${staffData.fullName} → ${customUid}`)
      
      const staffDoc = {
        ...staffData,
        uid: customUid,
        presentationTitle: 'Staff Member',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = doc(db, 'staff', customUid)
      await setDoc(docRef, staffDoc)
      
      seededCount++
      console.log(`✅ Staff creado: ${staffData.fullName}`)
      
    } catch (error) {
      console.error(`❌ Error creando staff ${staffData.fullName}:`, error)
    }
  }
  
  console.log(`🎉 ${seededCount} staff sembrados exitosamente`)
  return seededCount
}

export async function seedExercises() {
  console.log('🌱 Sembrando ejercicios de ejemplo...')
  
  const db = getFirebaseDb()
  if (!db) {
    throw new Error('Firebase not initialized')
  }
  
  let seededCount = 0
  
  for (const exerciseData of sampleExercises) {
    try {
      const exerciseId = exerciseData.title.toLowerCase().replace(/\s+/g, '-')
      
      console.log(`🔄 Creando ejercicio: ${exerciseData.title}`)
      
      const exerciseDoc = {
        ...exerciseData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = doc(db, 'exercises', exerciseId)
      await setDoc(docRef, exerciseDoc)
      
      seededCount++
      console.log(`✅ Ejercicio creado: ${exerciseData.title}`)
      
    } catch (error) {
      console.error(`❌ Error creando ejercicio ${exerciseData.title}:`, error)
    }
  }
  
  console.log(`🎉 ${seededCount} ejercicios sembrados exitosamente`)
  return seededCount
}

export async function seedWorkouts() {
  console.log('🌱 Sembrando rutinas de ejemplo...')
  
  const db = getFirebaseDb()
  if (!db) {
    throw new Error('Firebase not initialized')
  }
  
  let seededCount = 0
  
  for (const workoutData of sampleWorkouts) {
    try {
      const workoutId = workoutData.title.toLowerCase().replace(/\s+/g, '-')
      
      console.log(`🔄 Creando rutina: ${workoutData.title}`)
      
      const workoutDoc = {
        ...workoutData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = doc(db, 'workouts', workoutId)
      await setDoc(docRef, workoutDoc)
      
      seededCount++
      console.log(`✅ Rutina creada: ${workoutData.title}`)
      
    } catch (error) {
      console.error(`❌ Error creando rutina ${workoutData.title}:`, error)
    }
  }
  
  console.log(`🎉 ${seededCount} rutinas sembradas exitosamente`)
  return seededCount
}

// Main seed function
export async function seedNewFirebase() {
  console.log('🌱 INICIANDO SIEMBRA DE DATOS DE EJEMPLO')
  console.log('📊 Proyecto: therepzone1')
  console.log('='.repeat(50))
  
  try {
    const startTime = Date.now()
    
    // Seed all data
    const athletesSeeded = await seedAthletes()
    const coachesSeeded = await seedCoaches()
    const staffSeeded = await seedStaff()
    const exercisesSeeded = await seedExercises()
    const workoutsSeeded = await seedWorkouts()
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log('\n' + '='.repeat(50))
    console.log('🎉 SIEMBRA COMPLETADA EXITOSAMENTE')
    console.log('='.repeat(50))
    console.log(`⏱️ Tiempo total: ${duration.toFixed(2)} segundos`)
    console.log(`👥 Atletas sembrados: ${athletesSeeded}`)
    console.log(`🏋️ Coaches sembrados: ${coachesSeeded}`)
    console.log(`👨‍💼 Staff sembrado: ${staffSeeded}`)
    console.log(`💪 Ejercicios sembrados: ${exercisesSeeded}`)
    console.log(`📋 Rutinas sembradas: ${workoutsSeeded}`)
    console.log(`📊 Total de documentos: ${athletesSeeded + coachesSeeded + staffSeeded + exercisesSeeded + workoutsSeeded}`)
    console.log('\n✅ Datos de ejemplo sembrados en el nuevo proyecto Firebase')
    console.log('🔗 Proyecto:', 'therepzone1')
    
  } catch (error) {
    console.error('❌ Error durante la siembra:', error)
    throw error
  }
} 