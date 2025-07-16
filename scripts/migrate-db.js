#!/usr/bin/env node

// Database migration script for THEREPZONE
// Run with: node scripts/migrate-db.js
// IMPORTANT: Set up Firebase credentials via environment variables or service account

const { initializeApp } = require('firebase/app')
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore')

// Firebase config - Set up your credentials via environment variables
// or use service account authentication for production migrations
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Migration mapping for old fields to new fields
const migrateExerciseFields = async () => {
  console.log('🔄 Starting exercise field migration...')
  
  try {
    const exercisesCollection = collection(db, 'exercises')
    const querySnapshot = await getDocs(exercisesCollection)
    
    console.log(`📋 Found ${querySnapshot.size} exercises to migrate`)
    
    let migratedCount = 0
    let errorCount = 0
    
    for (const docSnapshot of querySnapshot.docs) {
      const exerciseData = docSnapshot.data()
      const exerciseId = docSnapshot.id
      
      console.log(`🔄 Migrating exercise: ${exerciseData.title || exerciseId}`)
      
      try {
        const updates = {}
        
        // Migrate category to muscularGroup
        if (exerciseData.category && !exerciseData.muscularGroup) {
          // Map old categories to new muscular groups
          const categoryMapping = {
            'pecho': 'tren superior',
            'espalda': 'tren superior', 
            'hombros': 'tren superior',
            'brazos': 'tren superior',
            'piernas': 'tren inferior',
            'core': 'core',
            'abdominales': 'core',
            'lumbares': 'core'
          }
          
          updates.muscularGroup = categoryMapping[exerciseData.category] || 'tren superior'
          console.log(`  📝 Mapped category "${exerciseData.category}" to muscularGroup "${updates.muscularGroup}"`)
        }
        
        // Migrate muscleGroups to primaryMuscleWorking
        if (exerciseData.muscleGroups && !exerciseData.primaryMuscleWorking) {
          updates.primaryMuscleWorking = exerciseData.muscleGroups
          console.log(`  📝 Mapped muscleGroups to primaryMuscleWorking: ${exerciseData.muscleGroups.join(', ')}`)
        }
        
        // Add empty secondaryMuscleWorking if not exists
        if (!exerciseData.secondaryMuscleWorking) {
          updates.secondaryMuscleWorking = []
          console.log(`  📝 Added empty secondaryMuscleWorking array`)
        }
        
        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
          const exerciseRef = doc(db, 'exercises', exerciseId)
          await updateDoc(exerciseRef, updates)
          migratedCount++
          console.log(`  ✅ Successfully migrated exercise: ${exerciseData.title || exerciseId}`)
        } else {
          console.log(`  ⏭️ No changes needed for exercise: ${exerciseData.title || exerciseId}`)
        }
        
      } catch (error) {
        errorCount++
        console.error(`  ❌ Error migrating exercise ${exerciseData.title || exerciseId}:`, error)
      }
    }
    
    console.log(`\n📊 Exercise Migration Summary:`)
    console.log(`✅ Successfully migrated: ${migratedCount} exercises`)
    console.log(`❌ Errors: ${errorCount} exercises`)
    console.log(`📋 Total processed: ${querySnapshot.size} exercises`)
    
    return { migratedCount, errorCount, total: querySnapshot.size }
    
  } catch (error) {
    console.error('❌ Exercise migration failed:', error)
    return { migratedCount: 0, errorCount: 1, total: 0 }
  }
}

// Migration mapping for workout fields
const migrateWorkoutFields = async () => {
  console.log('\n🔄 Starting workout field migration...')
  
  try {
    const workoutsCollection = collection(db, 'workouts')
    const querySnapshot = await getDocs(workoutsCollection)
    
    console.log(`📋 Found ${querySnapshot.size} workouts to migrate`)
    
    let migratedCount = 0
    let errorCount = 0
    
    for (const docSnapshot of querySnapshot.docs) {
      const workoutData = docSnapshot.data()
      const workoutId = docSnapshot.id
      
      console.log(`🔄 Migrating workout: ${workoutData.title || workoutId}`)
      
      try {
        const updates = {}
        
        // Migrate category to regionWorking
        if (workoutData.category && !workoutData.regionWorking) {
          // Map old categories to new region working
          const categoryMapping = {
            'fuerza': ['tren superior'],
            'cardio': ['full body'],
            'flexibilidad': ['full body'],
            'funcional': ['full body'],
            'balance': ['core'],
            'resistencia': ['full body']
          }
          
          updates.regionWorking = categoryMapping[workoutData.category] || ['full body']
          console.log(`  📝 Mapped category "${workoutData.category}" to regionWorking: ${updates.regionWorking.join(', ')}`)
        }
        
        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
          const workoutRef = doc(db, 'workouts', workoutId)
          await updateDoc(workoutRef, updates)
          migratedCount++
          console.log(`  ✅ Successfully migrated workout: ${workoutData.title || workoutId}`)
        } else {
          console.log(`  ⏭️ No changes needed for workout: ${workoutData.title || workoutId}`)
        }
        
      } catch (error) {
        errorCount++
        console.error(`  ❌ Error migrating workout ${workoutData.title || workoutId}:`, error)
      }
    }
    
    console.log(`\n📊 Workout Migration Summary:`)
    console.log(`✅ Successfully migrated: ${migratedCount} workouts`)
    console.log(`❌ Errors: ${errorCount} workouts`)
    console.log(`📋 Total processed: ${querySnapshot.size} workouts`)
    
    return { migratedCount, errorCount, total: querySnapshot.size }
    
  } catch (error) {
    console.error('❌ Workout migration failed:', error)
    return { migratedCount: 0, errorCount: 1, total: 0 }
  }
}

// Run migrations
const runMigrations = async () => {
  console.log('🚀 Starting database migrations...')
  console.log('⚠️  Make sure you have updated the Firebase config in this script!')
  
  const exerciseResults = await migrateExerciseFields()
  const workoutResults = await migrateWorkoutFields()
  
  console.log('\n🎉 All migrations completed!')
  console.log('\n📊 Final Summary:')
  console.log(`📋 Exercises: ${exerciseResults.migratedCount}/${exerciseResults.total} migrated (${exerciseResults.errorCount} errors)`)
  console.log(`📋 Workouts: ${workoutResults.migratedCount}/${workoutResults.total} migrated (${workoutResults.errorCount} errors)`)
  console.log(`📋 Total Errors: ${exerciseResults.errorCount + workoutResults.errorCount}`)
}

// Run if this file is executed directly
if (require.main === module) {
  runMigrations().catch(console.error)
}

module.exports = { migrateExerciseFields, migrateWorkoutFields, runMigrations } 