// Seed data for THEREPZONE database
import { useExercises, useWorkouts, type Exercise, type Workout } from '~/composables/firestore'

export const sampleExercises: Omit<Exercise, 'id' | 'createdAt'>[] = [
  // Pecho
  {
    title: "Flexiones",
    description: "Ejercicio clásico de peso corporal para desarrollar fuerza en pecho, hombros y tríceps",
    category: "pecho",
    difficulty: "principiante",
    instructions: [
      "Colócate en posición de plancha con las manos separadas al ancho de los hombros",
      "Mantén el cuerpo recto desde la cabeza hasta los talones",
      "Baja el pecho hacia el suelo manteniendo los codos cerca del cuerpo",
      "Empuja hacia arriba hasta la posición inicial"
    ],
    muscleGroups: ["pectorales", "deltoides", "tríceps", "core"],
    progressions: [], // Se llenarán después de crear todos los ejercicios
    regressions: [],
    createdBy: "demo-coach-id"
  },
  {
    title: "Flexiones con Rodillas",
    description: "Versión modificada de flexiones para principiantes",
    category: "pecho",
    difficulty: "principiante",
    instructions: [
      "Colócate en posición de flexión pero apoyando las rodillas en el suelo",
      "Mantén las manos separadas al ancho de los hombros",
      "Baja el pecho hacia el suelo",
      "Empuja hacia arriba manteniendo la espalda recta"
    ],
    muscleGroups: ["pectorales", "deltoides", "tríceps"],
    progressions: [],
    regressions: [],
    createdBy: "demo-coach-id"
  },
  {
    title: "Flexiones Diamante",
    description: "Variación avanzada de flexiones que enfatiza los tríceps",
    category: "pecho",
    difficulty: "avanzado",
    instructions: [
      "Colócate en posición de flexión",
      "Junta las manos formando un diamante con los dedos",
      "Baja el pecho hacia las manos",
      "Empuja hacia arriba manteniendo la forma"
    ],
    muscleGroups: ["tríceps", "pectorales", "deltoides"],
    progressions: [],
    regressions: [],
    createdBy: "demo-coach-id"
  },

  // Espalda
  {
    title: "Dominadas",
    description: "Ejercicio de tracción vertical para desarrollar la espalda y bíceps",
    category: "espalda",
    difficulty: "intermedio",
    instructions: [
      "Cuélgate de una barra con agarre pronado, manos separadas al ancho de los hombros",
      "Mantén el cuerpo recto y el core activado",
      "Tira hacia arriba hasta que la barbilla pase la barra",
      "Baja de forma controlada hasta la posición inicial"
    ],
    muscleGroups: ["dorsal ancho", "romboides", "bíceps", "core"],
    progressions: [],
    regressions: [],
    createdBy: "demo-coach-id"
  },
  {
    title: "Dominadas Asistidas",
    description: "Dominadas con ayuda de banda elástica o máquina",
    category: "espalda",
    difficulty: "principiante",
    instructions: [
      "Usa una banda elástica o máquina de asistencia",
      "Cuélgate de la barra con agarre pronado",
      "Tira hacia arriba usando la asistencia",
      "Baja de forma controlada"
    ],
    muscleGroups: ["dorsal ancho", "romboides", "bíceps"],
    progressions: [],
    regressions: [],
    createdBy: "demo-coach-id"
  },

  // Piernas
  {
    title: "Sentadillas",
    description: "Ejercicio fundamental para el desarrollo de las piernas y glúteos",
    category: "piernas",
    difficulty: "principiante",
    instructions: [
      "Párate con los pies separados al ancho de los hombros",
      "Baja como si te fueras a sentar, manteniendo el pecho erguido",
      "Baja hasta que los muslos estén paralelos al suelo",
      "Empuja a través de los talones para volver a la posición inicial"
    ],
    muscleGroups: ["cuádriceps", "glúteos", "isquiotibiales", "core"],
    progressions: [],
    regressions: [],
    createdBy: "demo-coach-id"
  },
  {
    title: "Sentadillas con Salto",
    description: "Variación explosiva de las sentadillas para potencia",
    category: "piernas",
    difficulty: "intermedio",
    instructions: [
      "Realiza una sentadilla normal",
      "Al subir, explota hacia arriba saltando",
      "Aterriza suavemente en posición de sentadilla",
      "Repite el movimiento de forma fluida"
    ],
    muscleGroups: ["cuádriceps", "glúteos", "pantorrillas", "core"],
    progressions: [],
    regressions: [],
    createdBy: "demo-coach-id"
  },

  // Core
  {
    title: "Plancha",
    description: "Ejercicio isométrico para fortalecer el core y la estabilidad",
    category: "core",
    difficulty: "principiante",
    instructions: [
      "Colócate en posición de flexión pero apoyando los antebrazos",
      "Mantén el cuerpo en línea recta desde la cabeza hasta los talones",
      "Contrae el core y mantén la posición",
      "Respira de forma controlada durante todo el ejercicio"
    ],
    muscleGroups: ["core", "deltoides", "glúteos"],
    progressions: [],
    regressions: [],
    createdBy: "demo-coach-id"
  },
  {
    title: "Plancha Lateral",
    description: "Variación de plancha que trabaja los oblicuos",
    category: "core",
    difficulty: "intermedio",
    instructions: [
      "Acuéstate de lado apoyando el antebrazo",
      "Levanta las caderas formando una línea recta",
      "Mantén el core contraído",
      "Sostén la posición y repite del otro lado"
    ],
    muscleGroups: ["oblicuos", "core", "deltoides"],
    progressions: [],
    regressions: [],
    createdBy: "demo-coach-id"
  }
]

export const sampleWorkouts: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "Rutina de Pecho y Tríceps",
    description: "Entrenamiento completo para desarrollar pecho y tríceps usando peso corporal",
    exercises: [
      {
        exerciseId: "flexiones-id", // Se actualizará con IDs reales
        sets: 3,
        reps: 12,
        restTime: 60,
        notes: "Mantén la forma correcta"
      },
      {
        exerciseId: "flexiones-diamante-id",
        sets: 3,
        reps: 8,
        restTime: 90,
        notes: "Enfócate en los tríceps"
      },
      {
        exerciseId: "plancha-id",
        sets: 3,
        reps: 30, // 30 segundos
        restTime: 60,
        notes: "Mantén el core activado"
      }
    ],
    estimatedDuration: 25,
    difficulty: "intermedio",
    category: "tren superior",
    createdBy: "demo-coach-id"
  },
  {
    title: "Rutina de Piernas y Glúteos",
    description: "Entrenamiento intenso para fortalecer piernas y glúteos",
    exercises: [
      {
        exerciseId: "sentadillas-id",
        sets: 4,
        reps: 15,
        restTime: 60,
        notes: "Baja hasta paralelo"
      },
      {
        exerciseId: "sentadillas-salto-id",
        sets: 3,
        reps: 10,
        restTime: 90,
        notes: "Aterriza suavemente"
      },
      {
        exerciseId: "plancha-id",
        sets: 2,
        reps: 45, // 45 segundos
        restTime: 60,
        notes: "Core fuerte para la estabilidad"
      }
    ],
    estimatedDuration: 30,
    difficulty: "intermedio",
    category: "tren inferior",
    createdBy: "demo-coach-id"
  },
  {
    title: "Rutina para Principiantes",
    description: "Entrenamiento de cuerpo completo perfecto para empezar",
    exercises: [
      {
        exerciseId: "flexiones-rodillas-id",
        sets: 2,
        reps: 8,
        restTime: 60,
        notes: "Mantén la espalda recta"
      },
      {
        exerciseId: "sentadillas-id",
        sets: 3,
        reps: 10,
        restTime: 60,
        notes: "Controla el descenso"
      },
      {
        exerciseId: "plancha-id",
        sets: 2,
        reps: 20, // 20 segundos
        restTime: 60,
        notes: "Progresa gradualmente"
      }
    ],
    estimatedDuration: 20,
    difficulty: "principiante",
    category: "cuerpo completo",
    createdBy: "demo-coach-id"
  }
]

// Function to seed the database
export const seedDatabase = async () => {
  try {
    const { createExercise } = useExercises()
    const { createWorkout } = useWorkouts()
    
    console.log('🌱 Iniciando seed de la base de datos...')
    
    // Create exercises first
    const exerciseIds: { [key: string]: string } = {}
    
    for (const exercise of sampleExercises) {
      const result = await createExercise(exercise)
      if (result.success) {
        // Map exercise titles to IDs for workout creation
        const key = exercise.title.toLowerCase().replace(/\s+/g, '-')
        exerciseIds[key] = result.id!
        console.log(`✅ Ejercicio creado: ${exercise.title}`)
      } else {
        console.error(`❌ Error creando ejercicio ${exercise.title}:`, result.error)
      }
    }
    
    // Update progressions and regressions
    // Flexiones progression chain: Rodillas -> Normal -> Diamante
    // Dominadas progression: Asistidas -> Normal
    // Sentadillas progression: Normal -> Con Salto
    
    // Create workouts with real exercise IDs
    const workoutsWithRealIds = sampleWorkouts.map(workout => ({
      ...workout,
      exercises: workout.exercises.map(ex => ({
        ...ex,
        exerciseId: exerciseIds[ex.exerciseId.replace('-id', '')] || ex.exerciseId
      }))
    }))
    
    for (const workout of workoutsWithRealIds) {
      const result = await createWorkout(workout)
      if (result.success) {
        console.log(`✅ Rutina creada: ${workout.title}`)
      } else {
        console.error(`❌ Error creando rutina ${workout.title}:`, result.error)
      }
    }
    
    console.log('🎉 Seed de la base de datos completado!')
    return { success: true }
    
  } catch (error) {
    console.error('❌ Error en seed:', error)
    return { success: false, error }
  }
} 