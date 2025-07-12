// Script temporal para agregar ejercicios en lote
import { useExercises } from '~/composables/firestore'

export const addBulkExercises = async (userId: string) => {
  const { createExercise } = useExercises()
  
  const exercises = [
    {
      title: "Squats",
      category: "piernas",
      difficulty: "principiante" as const,
      description: "Ejercicio fundamental para trabajar piernas y glúteos con peso corporal",
      instructions: [
        "Colócate de pie con los pies al ancho de los hombros",
        "Baja flexionando las rodillas y caderas como si te fueras a sentar",
        "Mantén el pecho arriba y el core contraído",
        "Desciende hasta que los muslos estén paralelos al suelo y luego sube"
      ],
      muscleGroups: [
        "cuádriceps",
        "glúteos",
        "isquiotibiales",
        "pantorrillas",
        "core"
      ],
      progressions: [],
      regressions: [],
      createdBy: userId
    },
    {
      title: "Pistol Squats",
      category: "piernas",
      difficulty: "avanzado" as const,
      description: "Sentadilla a una pierna que mejora fuerza, equilibrio y control",
      instructions: [
        "Párate erguido con un pie ligeramente elevado frente a ti",
        "Baja lentamente flexionando la pierna de apoyo manteniendo el equilibrio",
        "Llega lo más abajo posible sin perder la postura",
        "Sube con control hasta la posición inicial y repite con la otra pierna"
      ],
      muscleGroups: [
        "cuádriceps",
        "glúteos",
        "core",
        "isquiotibiales",
        "pantorrillas"
      ],
      progressions: [],
      regressions: [],
      createdBy: userId
    },
    {
      title: "Push-ups",
      category: "pecho",
      difficulty: "principiante" as const,
      description: "Ejercicio clásico para fortalecer pecho, tríceps y core",
      instructions: [
        "Colócate boca abajo con las manos al ancho de los hombros",
        "Mantén el cuerpo alineado desde la cabeza hasta los pies",
        "Baja el pecho controladamente hasta casi tocar el piso",
        "Empuja fuerte hacia arriba para volver a la posición inicial"
      ],
      muscleGroups: [
        "pectoral mayor",
        "tríceps",
        "deltoides anteriores",
        "core"
      ],
      progressions: [],
      regressions: [],
      createdBy: userId
    },
    {
      title: "Dips",
      category: "pecho",
      difficulty: "intermedio" as const,
      description: "Ejercicio de empuje en paralelas que trabaja el pecho, tríceps y deltoides",
      instructions: [
        "Colócate entre dos barras paralelas y sujétalas con los brazos extendidos",
        "Flexiona los codos y baja el cuerpo lentamente hasta que los hombros estén al nivel de los codos",
        "Empuja hacia arriba extendiendo los brazos hasta volver a la posición inicial"
      ],
      muscleGroups: [
        "pectorales",
        "tríceps",
        "deltoides anteriores",
        "core"
      ],
      progressions: [],
      regressions: [],
      createdBy: userId
    },
    {
      title: "Press con Pesa Rusa",
      category: "hombros",
      difficulty: "intermedio" as const,
      description: "Press de hombro con pesa rusa que fortalece deltoides, tríceps y core",
      instructions: [
        "Sujeta una kettlebell a la altura del hombro con la palma mirando al frente",
        "Presiona hacia arriba hasta extender completamente el brazo por encima de la cabeza",
        "Baja lentamente la kettlebell hasta la posición inicial con control"
      ],
      muscleGroups: [
        "deltoides",
        "tríceps",
        "core",
        "trapecio superior"
      ],
      progressions: [],
      regressions: [],
      createdBy: userId
    },
    {
      title: "Remo con Pesa Rusa",
      category: "espalda",
      difficulty: "intermedio" as const,
      description: "Remo con pesa rusa que activa la espalda, bíceps y core estabilizador",
      instructions: [
        "Coloca una mano y una rodilla sobre un banco para apoyar el cuerpo",
        "Con la otra mano, sujeta la kettlebell y déjala colgar hacia el suelo con el brazo extendido",
        "Tira de la kettlebell hacia tu torso manteniendo el codo pegado al cuerpo",
        "Baja lentamente y repite"
      ],
      muscleGroups: [
        "dorsales",
        "romboides",
        "bíceps",
        "deltoides posteriores",
        "core"
      ],
      progressions: [],
      regressions: [],
      createdBy: userId
    }
  ]

  console.log('🚀 Iniciando creación de ejercicios en lote...')
  
  const results = []
  for (const exercise of exercises) {
    try {
      console.log(`📝 Creando ejercicio: ${exercise.title}`)
      const result = await createExercise(exercise)
      
      if (result.success) {
        console.log(`✅ ${exercise.title} creado exitosamente`)
        results.push({ success: true, title: exercise.title, id: result.id })
      } else {
        console.error(`❌ Error creando ${exercise.title}:`, result.error)
        results.push({ success: false, title: exercise.title, error: result.error })
      }
    } catch (error) {
      console.error(`💥 Error inesperado creando ${exercise.title}:`, error)
      results.push({ success: false, title: exercise.title, error: error })
    }
  }
  
  console.log('📊 Resumen de creación de ejercicios:')
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log(`✅ Exitosos: ${successful.length}`)
  console.log(`❌ Fallidos: ${failed.length}`)
  
  if (failed.length > 0) {
    console.log('❌ Ejercicios que fallaron:')
    failed.forEach(f => console.log(`- ${f.title}: ${f.error}`))
  }
  
  return {
    successful: successful.length,
    failed: failed.length,
    results
  }
} 