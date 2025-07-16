<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
    <!-- Sidebar -->
    <aside class="fixed top-0 left-0 w-64 h-screen flex flex-col z-30 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700">
      <div class="flex-1 flex flex-col">
        <div class="px-4 py-6">
          <TheLogo />
          <div class="mt-4 p-3 bg-slate-700/50 rounded-lg">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-slate-300 text-sm">👋 Hola,</span>
              <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-600 text-white rounded-full">
                {{ userProfile?.role === 'client' ? 'Atleta' : (userProfile?.role || 'Cliente') }}
              </span>
            </div>
            <span class="text-white font-bold text-lg block max-w-xs whitespace-pre-line break-words overflow-hidden" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
              {{ userProfile?.nickname || userProfile?.fullName || 'Cliente' }}
            </span>
          </div>
        </div>
        
        <nav class="px-4 space-y-2">
          <button 
            @click="currentView = 'overview'"
            :class="currentView === 'overview' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium"
          >
            <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
            Resumen
          </button>
          
          <button 
            @click="currentView = 'workouts'"
            :class="currentView === 'workouts' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium"
          >
            <UIcon name="i-heroicons-fire" class="w-5 h-5" />
            Mis Entrenamientos
            <span v-if="assignedWorkouts.length > 0" class="ml-auto bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
              {{ assignedWorkouts.length }}
            </span>
          </button>
          
          <button 
            @click="currentView = 'progress'"
            :class="currentView === 'progress' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium"
          >
            <UIcon name="i-heroicons-chart-pie" class="w-5 h-5" />
            Mi Progreso
          </button>
          
          <button 
            @click="currentView = 'exercises'"
            :class="currentView === 'exercises' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium"
          >
            <UIcon name="i-heroicons-academic-cap" class="w-5 h-5" />
            Ejercicios
          </button>
          
          <button 
            @click="currentView = 'profile'"
            :class="currentView === 'profile' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium"
          >
            <UIcon name="i-heroicons-user" class="w-5 h-5" />
            Mi Perfil
          </button>
        </nav>
      </div>
      <div class="px-4 mb-6 mt-auto">
        <button 
          @click="logout"
          class="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
        >
          <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col ml-64">
      <!-- Header -->
      <header class="px-4 py-6 border-b border-slate-700">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h1 class="text-2xl font-black text-white">{{ currentViewTitle }}</h1>
            <p class="text-slate-400">{{ getCurrentDate() }}</p>
          </div>
          <div class="flex items-end gap-12">
            <div class="text-right">
              <p class="text-white font-semibold text-2xl italic">{{ motivationalPhrase }}</p>
            </div>
            <div class="text-right">
              <p class="text-slate-400 text-sm">Racha actual</p>
              <p class="text-orange-600 font-bold text-xl">{{ stats.streak }} días 🔥</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Dashboard Content -->
      <div class="flex-1 px-4 py-6 overflow-y-auto">
        <!-- Overview Section -->
        <div v-if="currentView === 'overview'" class="space-y-6">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div class="flex items-center gap-4">
                <div class="text-4xl">🎯</div>
                <div>
                  <p class="text-2xl font-black text-white">{{ assignedWorkouts.length }}</p>
                  <p class="text-slate-400 text-sm">Entrenamientos Asignados</p>
                </div>
              </div>
            </div>
            
            <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div class="flex items-center gap-4">
                <div class="text-4xl">✅</div>
                <div>
                  <p class="text-2xl font-black text-white">{{ stats.completedWorkouts }}</p>
                  <p class="text-slate-400 text-sm">Completados</p>
                </div>
              </div>
            </div>
            
            <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div class="flex items-center gap-4">
                <div class="text-4xl">🔥</div>
                <div>
                  <p class="text-2xl font-black text-white">{{ stats.streak }}</p>
                  <p class="text-slate-400 text-sm">Días Seguidos</p>
                </div>
              </div>
            </div>
            
            <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div class="flex items-center gap-4">
                <div class="text-4xl">⏱️</div>
                <div>
                  <p class="text-2xl font-black text-white">{{ stats.totalMinutes }}</p>
                  <p class="text-slate-400 text-sm">Minutos Total</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Segunda Fila: Esta Semana + Entrenamientos de Hoy | Progreso Reciente -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Columna Izquierda: Esta Semana + Entrenamientos de Hoy -->
            <div class="space-y-6">
              <!-- Esta Semana -->
              <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 text-blue-500" />
                  Esta Semana
                </h3>
                <div class="grid grid-cols-7 gap-2">
                  <div 
                    v-for="day in weekDays" 
                    :key="day.date"
                    :class="[
                      'flex flex-col items-center p-3 rounded-lg transition-colors',
                      day.isToday ? 'bg-orange-600 text-white' : 'bg-slate-700/50 text-slate-300'
                    ]"
                  >
                    <div class="mb-1">
                      <UIcon 
                        v-if="day.hasWorkout"
                        name="i-heroicons-check-circle" 
                        class="w-5 h-5 text-green-500"
                      />
                      <UIcon 
                        v-else-if="day.isToday"
                        name="i-heroicons-clock" 
                        class="w-5 h-5 text-white"
                      />
                      <div v-else class="w-5 h-5"></div>
                    </div>
                    <span class="text-sm font-bold">{{ day.day }}</span>
                    <span class="text-xs uppercase">{{ day.weekday }}</span>
                  </div>
                </div>
              </div>

              <!-- Entrenamientos de Hoy -->
              <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <UIcon name="i-heroicons-fire" class="w-6 h-6 text-orange-600" />
                  Entrenamientos de Hoy
                </h3>
                <div v-if="todaysWorkout" class="space-y-4">
                  <div class="flex items-center gap-4">
                    <div class="text-4xl">💪</div>
                    <div class="flex-1">
                      <h4 class="text-lg font-bold text-white">{{ todaysWorkout.title }}</h4>
                      <p class="text-slate-400">{{ todaysWorkout.description }}</p>
                      <div class="flex items-center gap-4 mt-2 text-sm">
                        <span class="text-slate-400">⏱️ {{ todaysWorkout.estimatedDuration }} min</span>
                        <span class="text-slate-400">🏋️ {{ todaysWorkout.exercises?.length || 0 }} ejercicios</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <button 
                      @click="startWorkout(todaysWorkout)"
                      class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors flex-1"
                    >
                      ▶️ Empezar Ahora
                    </button>
                    <button class="h-12 bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 rounded-lg transition-colors">
                      👁️ Ver Detalles
                    </button>
                  </div>
                </div>
                <div v-else class="text-center py-6">
                  <div class="text-4xl mb-3">🎯</div>
                  <h4 class="text-lg font-bold text-white mb-2">No hay entrenamientos para hoy</h4>
                  <p class="text-slate-400 mb-4">¡Revisa tus entrenamientos asignados!</p>
                  <button 
                    @click="currentView = 'workouts'"
                    class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-lg transition-colors"
                  >
                    Ver Entrenamientos
                  </button>
                </div>
              </div>
            </div>

            <!-- Columna Derecha: Progreso Reciente -->
            <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 self-start">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-green-500" />
                Progreso Reciente
              </h3>
              <div class="space-y-4">
                <div 
                  v-for="achievement in recentAchievements" 
                  :key="achievement.id"
                  class="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg"
                >
                  <div class="text-2xl">{{ achievement.emoji }}</div>
                  <div class="flex-1">
                    <h4 class="font-bold text-white text-sm">{{ achievement.title }}</h4>
                    <p class="text-slate-400 text-xs">{{ achievement.date }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-orange-600 font-bold">{{ achievement.value }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Workouts Section -->
        <div v-else-if="currentView === 'workouts'" class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-white">Mis Entrenamientos</h2>
            <div class="flex gap-3">
              <select 
                v-model="workoutFilter"
                class="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendientes</option>
                <option value="completed">Completados</option>
              </select>
            </div>
          </div>

          <!-- Workout Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              v-for="assignment in filteredWorkouts" 
              :key="assignment.id"
              class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-orange-600/50 transition-colors"
            >
              <div v-if="assignment.workout" class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-white mb-2">{{ assignment.workout.title }}</h3>
                  <p class="text-slate-400 text-sm mb-3">{{ assignment.workout.description }}</p>
                  <div class="flex items-center gap-4 text-sm">
                    <span class="text-slate-400">⏱️ {{ assignment.workout.estimatedDuration }} min</span>
                    <span class="text-slate-400">🏋️ {{ assignment.workout.exercises?.length || 0 }} ejercicios</span>
                    <span 
                      :class="{
                        'text-green-500': assignment.workout.difficulty === 'principiante',
                        'text-yellow-500': assignment.workout.difficulty === 'intermedio',
                        'text-red-500': assignment.workout.difficulty === 'avanzado'
                      }"
                    >
                      📊 {{ assignment.workout.difficulty }}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <span 
                    :class="{
                      'bg-green-500/20 text-green-400': assignment.status === 'completed',
                      'bg-orange-500/20 text-orange-400': assignment.status === 'pending',
                      'bg-slate-500/20 text-slate-400': assignment.status === 'skipped'
                    }"
                    class="px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {{ getStatusText(assignment.status) }}
                  </span>
                </div>
              </div>
              
              <div class="flex gap-3">
                <button 
                  v-if="assignment.status === 'pending' && assignment.workout"
                  @click="startWorkout(assignment.workout)"
                  class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex-1"
                >
                  ▶️ Empezar
                </button>
                <button 
                  v-else-if="assignment.status === 'completed'"
                  class="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex-1"
                >
                  ✅ Completado
                </button>
                <button class="h-12 bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 rounded-lg transition-colors">
                  👁️ Detalles
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="assignedWorkouts.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">🎯</div>
            <h3 class="text-xl font-bold text-white mb-2">No tienes entrenamientos asignados</h3>
            <p class="text-slate-400 mb-6">Tu coach te asignará entrenamientos personalizados pronto.</p>
            <button 
              @click="currentView = 'exercises'"
              class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
            >
              Explorar Ejercicios
            </button>
          </div>
        </div>

        <!-- Exercises Section -->
        <div v-else-if="currentView === 'exercises'" class="space-y-6">
          <!-- Controls -->
          <div class="flex items-center justify-between gap-4">
            <!-- Filters -->
            <div class="flex flex-wrap gap-4 flex-1">
              <div class="min-w-[200px]">
                <CustomSelect
                  v-model="selectedRegion"
                  :options="regionOptions"
                  placeholder="Todas las regiones"
                  @update:model-value="filterExercises"
                />
              </div>

              <div class="min-w-[200px]">
                <CustomSelect
                  v-model="selectedDifficulty"
                  :options="difficultyOptions"
                  placeholder="Todas las dificultades"
                  @update:model-value="filterExercises"
                />
              </div>

              <input 
                v-model="searchTerm" 
                @input="filterExercises"
                type="text" 
                autocomplete="off"
                placeholder="Buscar ejercicios..."
                class="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
            </div>
          </div>

          <!-- Exercises Grid -->
          <div v-if="filteredExercises.length > 0" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 justify-items-start">
            <div 
              v-for="exercise in filteredExercises" 
              :key="exercise.id"
              @click="viewExercise(exercise)"
              class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden hover:border-orange-500/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer max-w-[320px] group"
            >
              <!-- Exercise Image -->
              <div 
                v-if="exercise.photo || exercise.photoUrl" 
                class="h-48 bg-cover bg-center relative group-hover:scale-105 transition-transform duration-300"
                :style="{ backgroundImage: `url(${exercise.photo || exercise.photoUrl})` }"
              >
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                <span 
                  :class="{
                    'bg-green-500/90 text-green-100': exercise.difficulty === 'principiante',
                    'bg-yellow-500/90 text-yellow-100': exercise.difficulty === 'intermedio',
                    'bg-red-500/90 text-red-100': exercise.difficulty === 'avanzado'
                  }"
                  class="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                >
                  {{ exercise.difficulty }}
                </span>
              </div>
              
              <!-- Content -->
              <div class="p-6">
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">{{ exercise.title }}</h3>
                    <span 
                      v-if="!exercise.photo && !exercise.photoUrl"
                      :class="{
                        'bg-green-500/20 text-green-400': exercise.difficulty === 'principiante',
                        'bg-yellow-500/20 text-yellow-400': exercise.difficulty === 'intermedio',
                        'bg-red-500/20 text-red-400': exercise.difficulty === 'avanzado'
                      }"
                      class="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {{ exercise.difficulty }}
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-2 mb-3">
                    <span class="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
                      {{ exercise.regionWorking.charAt(0).toUpperCase() + exercise.regionWorking.slice(1) }}
                    </span>
                  </div>

                  <p class="text-slate-400 text-sm mb-3 line-clamp-2">{{ exercise.description }}</p>
                  
                  <div class="mb-3">
                    <p class="text-slate-400 text-xs mb-1">Músculos trabajados:</p>
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="muscle in exercise.primaryMuscleWorking.slice(0, 3)" 
                        :key="muscle"
                        class="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs"
                      >
                        {{ muscle }}
                      </span>
                      <span 
                        v-if="exercise.primaryMuscleWorking.length > 3"
                        class="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs"
                      >
                        +{{ exercise.primaryMuscleWorking.length - 3 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!exerciseLoading" class="text-center py-12">
            <div class="text-6xl mb-4">🏋️</div>
            <h3 class="text-xl font-bold text-white mb-2">No se encontraron ejercicios</h3>
            <p class="text-slate-400 mb-6">
              {{ searchTerm || selectedRegion || selectedDifficulty ? 'Prueba ajustando los filtros' : 'No hay ejercicios disponibles en este momento' }}
            </p>
          </div>

          <!-- Loading State -->
          <div v-else class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </div>

        <!-- Other Views Placeholder -->
        <ProfileView v-else-if="currentView === 'profile'" />
        <div v-else class="text-center py-12">
          <div class="text-6xl mb-4">🚧</div>
          <h2 class="text-2xl font-bold text-white mb-2">{{ currentViewTitle }}</h2>
          <p class="text-slate-400">Esta sección estará disponible pronto...</p>
        </div>
      </div>
    </main>

    <!-- Exercise Details Modal -->
    <div v-if="selectedExercise" @click="selectedExercise = null" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div @click.stop class="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">{{ selectedExercise.title }}</h3>
          <button 
            @click="selectedExercise = null"
            class="text-slate-400 hover:text-white cursor-pointer"
          >
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>

        <!-- Exercise Image -->
        <div 
          v-if="selectedExercise.photo || selectedExercise.photoUrl" 
          @click="showImageFullscreen(selectedExercise.photo || selectedExercise.photoUrl)"
          class="mb-6 h-64 bg-cover bg-center rounded-lg relative cursor-pointer hover:opacity-90 transition-opacity"
          :style="{ backgroundImage: `url(${selectedExercise.photo || selectedExercise.photoUrl})` }"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent rounded-lg"></div>
          <div class="absolute bottom-3 left-3 text-white text-sm bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
            🔍 Click para ver en tamaño completo
          </div>
        </div>

        <!-- Tabs -->
        <div class="mb-6">
          <div class="flex w-full rounded-lg bg-slate-900 border border-slate-600 p-1">
            <button
              type="button"
              @click="exerciseModalTab = 'guidance'"
              :class="[
                'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                exerciseModalTab === 'guidance' 
                  ? 'text-white bg-orange-600 border border-orange-600' 
                  : 'text-slate-400 hover:text-slate-200'
              ]"
            >
              Orientación
            </button>
            <button
              type="button"
              @click="exerciseModalTab = 'progress'"
              :class="[
                'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                exerciseModalTab === 'progress' 
                  ? 'text-white bg-orange-600 border border-orange-600' 
                  : 'text-slate-400 hover:text-slate-200'
              ]"
            >
              Progreso
            </button>
          </div>
        </div>

        <!-- Guidance Tab Content -->
        <div v-if="exerciseModalTab === 'guidance'" class="space-y-6">
          <div class="flex items-center gap-4">
            <span 
              :class="{
                'bg-green-500/20 text-green-400': selectedExercise.difficulty === 'principiante',
                'bg-yellow-500/20 text-yellow-400': selectedExercise.difficulty === 'intermedio',
                'bg-red-500/20 text-red-400': selectedExercise.difficulty === 'avanzado'
              }"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ selectedExercise.difficulty.charAt(0).toUpperCase() + selectedExercise.difficulty.slice(1) }}
            </span>
            <span class="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
              {{ selectedExercise.regionWorking.charAt(0).toUpperCase() + selectedExercise.regionWorking.slice(1) }}
            </span>
          </div>

          <div>
            <p class="text-slate-400 mb-2">Descripción:</p>
            <p class="text-white">{{ selectedExercise.description }}</p>
          </div>

          <div>
            <p class="text-slate-400 mb-2">Músculos trabajados:</p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="muscle in selectedExercise.primaryMuscleWorking" 
                :key="muscle"
                class="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm"
              >
                {{ muscle }}
              </span>
            </div>
          </div>

          <div v-if="selectedExercise.instructions && selectedExercise.instructions.length > 0">
            <p class="text-slate-400 mb-2">Instrucciones:</p>
            <ol class="space-y-2">
              <li 
                v-for="(instruction, index) in selectedExercise.instructions" 
                :key="index"
                class="flex gap-3"
              >
                <span class="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {{ index + 1 }}
                </span>
                <span class="text-slate-300">{{ instruction }}</span>
              </li>
            </ol>
          </div>

          <!-- Notes Section -->
          <div>
            <p class="text-slate-400 mb-2">Mis Notas:</p>
            <textarea
              v-model="exerciseNotes"
              @input="debouncedSaveNotes"
              rows="4"
              placeholder="Agrega tus notas personales sobre este ejercicio..."
              class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 resize-none"
            ></textarea>
            <p v-if="isSavingNotes" class="text-xs text-orange-400 mt-1">Guardando...</p>
          </div>

          <!-- Progression/Regression Actions -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
            <!-- Regresión -->
            <button class="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-orange-500/70 transition-colors overflow-hidden">
              <div class="flex-shrink-0">
                <UIcon name="i-heroicons-arrow-left" class="w-8 h-8 text-slate-400" />
              </div>
              <div class="flex flex-col items-start min-w-0">
                <span class="text-xs text-slate-400 font-medium mb-1">Regresión</span>
                <span class="text-white font-bold text-base truncate max-w-[160px]">{{ regressionTitle }}</span>
              </div>
            </button>
            <!-- Progresión -->
            <button class="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-orange-500/70 transition-colors overflow-hidden justify-end">
              <div class="flex flex-col items-end min-w-0">
                <span class="text-xs text-slate-400 font-medium mb-1">Progresión</span>
                <span class="text-white font-bold text-base truncate max-w-[160px] text-right">{{ progressionTitle }}</span>
              </div>
              <div class="flex-shrink-0">
                <UIcon name="i-heroicons-arrow-right" class="w-8 h-8 text-slate-400" />
              </div>
            </button>
          </div>
        </div>

        <!-- Progress Tab Content -->
        <div v-else-if="exerciseModalTab === 'progress'" class="space-y-6">
          <!-- Récord Personal Card -->
          <div class="bg-slate-700/50 rounded-lg p-6">
            <h4 class="text-lg font-bold text-white mb-4">🏆 Récord Personal</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="flex justify-between items-center">
                <span class="text-slate-400">Peso máximo:</span>
                <span class="text-white font-bold text-xl">{{ getExerciseProgress(selectedExercise.id!).personalBest.weight }} kg</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-400">Repeticiones:</span>
                <span class="text-white font-bold text-xl">{{ getExerciseProgress(selectedExercise.id!).personalBest.reps }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-400">Fecha:</span>
                <span class="text-white">{{ new Date(getExerciseProgress(selectedExercise.id!).personalBest.date).toLocaleDateString('es-ES') }}</span>
              </div>
            </div>
          </div>

          <!-- Progress Chart Area -->
          <div class="bg-slate-700/50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <h4 class="text-lg font-bold text-white">📈 Progreso</h4>
              <div class="flex items-center gap-4">
                <!-- Metric Dropdown -->
                <div class="min-w-[200px]">
                  <CustomSelect
                    v-model="selectedMetric"
                    :options="metricOptions"
                    placeholder="Seleccionar métrica"
                  />
                </div>
              </div>
            </div>

            <!-- Period Tabs -->
            <div class="flex w-full rounded-lg bg-slate-900 border border-slate-600 p-1 mb-6">
              <button
                type="button"
                @click="selectedPeriod = 'weekly'"
                :class="[
                  'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                  selectedPeriod === 'weekly' 
                    ? 'text-white bg-orange-600 border border-orange-600' 
                    : 'text-slate-400 hover:text-slate-200'
                ]"
              >
                Semanal
              </button>
              <button
                type="button"
                @click="selectedPeriod = 'monthly'"
                :class="[
                  'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                  selectedPeriod === 'monthly' 
                    ? 'text-white bg-orange-600 border border-orange-600' 
                    : 'text-slate-400 hover:text-slate-200'
                ]"
              >
                Mensual
              </button>
              <button
                type="button"
                @click="selectedPeriod = 'yearly'"
                :class="[
                  'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                  selectedPeriod === 'yearly' 
                    ? 'text-white bg-orange-600 border border-orange-600' 
                    : 'text-slate-400 hover:text-slate-200'
                ]"
              >
                Anual
              </button>
            </div>

            <!-- Chart -->
            <div class="h-64">
              <ExerciseProgressChart 
                :data="getChartData()"
                :metric="selectedMetric"
                :period="selectedPeriod"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para ver imagen en tamaño completo -->
    <div v-if="fullscreenImage" @click="fullscreenImage = null" class="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
      <div class="relative max-w-full max-h-full">
        <button 
          @click="fullscreenImage = null"
          class="absolute top-4 right-4 w-[46px] h-[46px] text-white bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors cursor-pointer flex items-center justify-center"
        >
          <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
        </button>
        <img 
          :src="fullscreenImage" 
          alt="Imagen del ejercicio en tamaño completo"
          class="max-w-full max-h-full object-contain rounded-lg"
          @click.stop
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUsers, useWorkoutAssignments, useWorkouts, useExercises, type User, type WorkoutAssignment, type Workout, type Exercise } from '~/composables/firestore'
import { debounce } from 'lodash-es'
import ProfileView from '~/components/ProfileView.vue'
import { useUserStore } from '~/stores/user'
import { storeToRefs } from 'pinia'

console.log('🏠 Dashboard script ejecutándose...')
const { user } = useAuth()
const userStore = useUserStore()
const { userProfile, isLoading } = storeToRefs(userStore)

// Reactive state
const currentView = ref('overview')
const workoutFilter = ref('all')
const isLoadingDashboard = ref(true)

// Data
const assignedWorkouts = ref<(WorkoutAssignment & { workout?: Workout })[]>([])
const todaysWorkout = ref<Workout | null>(null)

// Exercise data
const allExercises = ref<Exercise[]>([])
const filteredExercises = ref<Exercise[]>([])
const selectedExercise = ref<Exercise | null>(null)
const exerciseLoading = ref(false)
const fullscreenImage = ref<string | null>(null)

// Exercise modal tabs
const exerciseModalTab = ref<'guidance' | 'progress'>('guidance')

// Exercise notes
const exerciseNotes = ref('')
const isSavingNotes = ref(false)

// Exercise progress chart controls
const selectedMetric = ref<'weight' | 'time' | 'reps'>('weight')
const selectedPeriod = ref<'weekly' | 'monthly' | 'yearly'>('weekly')

// Exercise filters
const selectedRegion = ref('')
const selectedDifficulty = ref('')
const searchTerm = ref('')

// Exercise options
const regionOptions = ref([
  { value: '', label: 'Todas las regiones' },
  { value: 'Tren Superior', label: 'Tren Superior' },
  { value: 'Tren Inferior', label: 'Tren Inferior' },
  { value: 'Core', label: 'Core' }
])

const difficultyOptions = ref([
  { value: '', label: 'Todas las dificultades' },
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' }
])

const metricOptions = ref([
  { value: 'weight', label: 'Peso máximo levantado' },
  { value: 'time', label: 'Menor tiempo del set' },
  { value: 'reps', label: 'Máximas repeticiones' }
])

const stats = reactive({
  completedWorkouts: 0,
  streak: 7,
  totalMinutes: 420
})

const recentAchievements = ref([
  {
    id: 1,
    title: "Primera semana completada",
    emoji: "🎉",
    value: "¡7 días!",
    date: "Hace 2 días"
  },
  {
    id: 2,
    title: "Nuevo récord personal",
    emoji: "💪",
    value: "25 flexiones",
    date: "Hace 3 días"
  },
  {
    id: 3,
    title: "Meta semanal alcanzada",
    emoji: "🎯",
    value: "4/4 entrenamientos",
    date: "Hace 5 días"
  }
])

// Frases motivacionales
const motivationalPhrases = [
  // Cortas y potentes
  "Una repetición más. Siempre.",
  "El dolor es temporal. El orgullo es para siempre.",
  "Hazlo por ti. Nadie más lo hará.",
  "No es suerte. Es disciplina.",
  "Sé más fuerte que tus excusas.",
  // Inspiradoras
  "Cada día cuenta. Cada rep suma.",
  "No tienes que ser el mejor. Solo mejor que ayer.",
  "No hay límites. Solo metas más grandes.",
  "El esfuerzo de hoy es el resultado de mañana.",
  "Entrena como si tu vida dependiera de ello. Porque depende.",
  // Identidad de marca
  "Esto es The Repzone. Aquí se viene a mejorar.",
  "No colecciones excusas. Colecciona repeticiones.",
  "Cada zona, cada rep, te define.",
  "El cambio empieza con la primera repetición.",
  "Construye tu cuerpo. Moldea tu mente. Zona por zona."
]

// Seleccionar frase motivacional aleatoria
const motivationalPhrase = ref('')

const getRandomMotivationalPhrase = () => {
  const randomIndex = Math.floor(Math.random() * motivationalPhrases.length)
  motivationalPhrase.value = motivationalPhrases[randomIndex]
}

// Computed
const currentViewTitle = computed(() => {
  const titles: Record<string, string> = {
    'overview': 'Resumen',
    'workouts': 'Mis Entrenamientos',
    'progress': 'Mi Progreso',
    'exercises': 'Ejercicios',
    'profile': 'Mi Perfil'
  }
  return titles[currentView.value] || 'Dashboard'
})

const filteredWorkouts = computed(() => {
  if (workoutFilter.value === 'all') return assignedWorkouts.value
  return assignedWorkouts.value.filter(w => w.status === workoutFilter.value)
})

const weekDays = computed(() => {
  const today = new Date()
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    
    return {
      date: date.toISOString().split('T')[0],
      day: date.getDate().toString(),
      weekday: date.toLocaleDateString('es-ES', { weekday: 'short' }),
      isToday: date.toDateString() === new Date().toDateString(),
      hasWorkout: Math.random() > 0.6 // Simulated workout data
    }
  })
})

// Methods
const getCurrentDate = () => {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'Pendiente',
    'completed': 'Completado',
    'skipped': 'Omitido'
  }
  return statusMap[status] || status
}

const startWorkout = (workout: Workout) => {
  // TODO: Implement workout starting logic
  console.log('Starting workout:', workout.title)
  alert(`¡Iniciando ${workout.title}! (Funcionalidad en desarrollo)`)
}

const loadClientData = async () => {
  if (!user.value?.uid) return

  isLoadingDashboard.value = true
  try {
    // Load user profile
    await userStore.loadUserProfile(user.value.uid)

    // Load assigned workouts
    const { getClientAssignments } = useWorkoutAssignments()
    const { getWorkoutById } = useWorkouts()
    
    const assignmentsResult = await getClientAssignments(user.value.uid)
    if (assignmentsResult.success && assignmentsResult.assignments) {
      // Get workout details for each assignment
             const workoutsWithDetails = await Promise.all(
         assignmentsResult.assignments.map(async (assignment) => {
           const workoutResult = await getWorkoutById(assignment.workoutId)
           return {
             ...assignment,
             workout: workoutResult.success ? workoutResult.workout : undefined
           }
         })
       )
      
      assignedWorkouts.value = workoutsWithDetails

      // Set today's workout (first pending workout)
      const pendingWorkout = workoutsWithDetails.find(w => w.status === 'pending')
      if (pendingWorkout?.workout) {
        todaysWorkout.value = pendingWorkout.workout
      }
      
      // Update stats
      stats.completedWorkouts = workoutsWithDetails.filter(w => w.status === 'completed').length
    }
  } catch (error) {
    console.error('Error loading client data:', error)
  } finally {
    isLoadingDashboard.value = false
  }
}

// Exercise functions
const loadExercises = async () => {
  exerciseLoading.value = true
  try {
    const { getExercises } = useExercises()
    const result = await getExercises()
    
    if (result.success && result.exercises) {
      allExercises.value = result.exercises
      filteredExercises.value = result.exercises
    }
  } catch (error) {
    console.error('Error loading exercises:', error)
  } finally {
    exerciseLoading.value = false
  }
}

const filterExercises = () => {
  let filtered = [...allExercises.value]

  // Filter by region
  if (selectedRegion.value) {
    filtered = filtered.filter(exercise => exercise.regionWorking === selectedRegion.value)
  }

  // Filter by difficulty
  if (selectedDifficulty.value) {
    filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty.value)
  }

  // Filter by search term
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(exercise =>
      exercise.title.toLowerCase().includes(search) ||
      exercise.description.toLowerCase().includes(search) ||
      exercise.primaryMuscleWorking.some(muscle => muscle.toLowerCase().includes(search))
    )
  }

  filteredExercises.value = filtered
}

const progressionTitle = ref<string>('')
const regressionTitle = ref<string>('')

const { getExerciseById } = useExercises()

const loadProgressionRegressionTitles = async (exercise: Exercise) => {
  progressionTitle.value = ''
  regressionTitle.value = ''
  if (exercise.progressions && exercise.progressions.length > 0) {
    const result = await getExerciseById(exercise.progressions[0])
    progressionTitle.value = result.success && result.exercise ? result.exercise.title : 'Sin progresión'
  } else {
    progressionTitle.value = 'Sin progresión'
  }
  if (exercise.regressions && exercise.regressions.length > 0) {
    const result = await getExerciseById(exercise.regressions[0])
    regressionTitle.value = result.success && result.exercise ? result.exercise.title : 'Sin regresión'
  } else {
    regressionTitle.value = 'Sin regresión'
  }
}

const viewExercise = (exercise: Exercise) => {
  selectedExercise.value = exercise
  exerciseModalTab.value = 'guidance' // Reset to guidance tab
  loadExerciseNotes(exercise.id!)
  loadProgressionRegressionTitles(exercise)
}

const showImageFullscreen = (imageUrl: string | undefined) => {
  if (imageUrl) {
    fullscreenImage.value = imageUrl
  }
}

// Exercise notes functions
const loadExerciseNotes = async (exerciseId: string) => {
  if (!user.value?.uid) return
  
  try {
    // TODO: Implement loading notes from Firestore
    // For now, we'll use localStorage as a temporary solution
    const notes = localStorage.getItem(`exercise_notes_${user.value.uid}_${exerciseId}`)
    exerciseNotes.value = notes || ''
  } catch (error) {
    console.error('Error loading exercise notes:', error)
  }
}

const saveExerciseNotes = async () => {
  if (!user.value?.uid || !selectedExercise.value?.id) return
  
  isSavingNotes.value = true
  try {
    // TODO: Implement saving notes to Firestore
    // For now, we'll use localStorage as a temporary solution
    localStorage.setItem(`exercise_notes_${user.value.uid}_${selectedExercise.value.id}`, exerciseNotes.value)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('✅ Exercise notes saved successfully')
  } catch (error) {
    console.error('Error saving exercise notes:', error)
  } finally {
    isSavingNotes.value = false
  }
}

const debouncedSaveNotes = debounce(() => {
  saveExerciseNotes()
}, 700)

// Mock progress data (TODO: Replace with real data from Firestore)
const getExerciseProgress = (exerciseId: string) => {
  return {
    personalBest: {
      weight: 85,
      reps: 12,
      date: '2024-01-15'
    },
    totalSessions: 24,
    weeklyData: [
      { date: '2024-01-08', weight: 80, reps: 10, time: 45 },
      { date: '2024-01-10', weight: 82, reps: 11, time: 48 },
      { date: '2024-01-12', weight: 85, reps: 12, time: 52 },
      { date: '2024-01-15', weight: 85, reps: 12, time: 50 },
      { date: '2024-01-17', weight: 87, reps: 10, time: 55 },
      { date: '2024-01-19', weight: 85, reps: 11, time: 51 },
      { date: '2024-01-22', weight: 90, reps: 8, time: 58 }
    ]
  }
}

// Chart data function
const getChartData = () => {
  if (!selectedExercise.value?.id) return []
  
  const progress = getExerciseProgress(selectedExercise.value.id)
  const data = progress.weeklyData.map(session => ({
    date: session.date,
    value: session[selectedMetric.value]
  }))
  
  return data
}

const logout = async () => {
  try {
    const { logout: firebaseLogout } = useAuth()
    const result = await firebaseLogout()
    if (result.success) {
      await navigateTo('/')
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    await navigateTo('/')
  }
}

// Lifecycle
onMounted(async () => {
  console.log('🏠 Dashboard mounted - Usuario llegó al dashboard exitosamente!')
  console.log('👤 User:', user.value?.uid)
  console.log('📍 Current path:', window.location.pathname)
  
  // Ensure global loading is disabled when dashboard loads
  const { setLoading } = useGlobalLoading()
  setLoading(false)
  
  getRandomMotivationalPhrase()
  if (user.value?.uid) {
    await userStore.loadUserProfile(user.value.uid)
  }
  await loadClientData()
  loadExercises()
})

// Watch for user changes
watch(user, (newUser) => {
  if (newUser?.uid) {
    userStore.loadUserProfile(newUser.uid)
    loadClientData()
  }
}, { immediate: true })

// Watch for user profile changes to ensure loading is disabled
watch(() => userStore.userProfile, (newProfile) => {
  if (newProfile) {
    const { setLoading } = useGlobalLoading()
    setLoading(false)
  }
}, { immediate: true })

// Meta
definePageMeta({
  middleware: 'auth',
  ssr: false
})

useHead({
  title: 'Mi Dashboard - THEREPZONE',
  meta: [
    { name: 'description', content: 'Tu panel personal de entrenamientos' }
  ]
})
</script> 