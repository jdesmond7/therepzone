<template>
  <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-orange-600/50 transition-colors group">
    <div class="flex items-start justify-between mb-4">
      <div class="text-4xl">{{ exercise.image }}</div>
      <span 
        class="px-3 py-1 rounded-full text-xs font-bold border"
        :class="getDifficultyColor(exercise.difficulty)"
      >
        {{ exercise.difficulty.toUpperCase() }}
      </span>
    </div>

    <h3 class="text-xl font-black text-white mb-2 group-hover:text-orange-600 transition-colors">
      {{ exercise.name }}
    </h3>

    <p class="text-slate-400 text-sm mb-4">{{ exercise.description }}</p>

    <div class="flex items-center justify-between">
      <span class="text-green-500 font-semibold text-sm">{{ exercise.category }}</span>
      <button class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">
        REGISTRAR
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Exercise {
  id: number
  name: string
  category: string
  difficulty: string
  image: string
  description: string
}

interface Props {
  exercise: Exercise
}

const props = defineProps<Props>()

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "principiante":
      return "text-green-500 bg-green-500/10 border-green-500/20"
    case "intermedio":
      return "text-orange-500 bg-orange-500/10 border-orange-500/20"
    case "avanzado":
      return "text-red-500 bg-red-500/10 border-red-500/20"
    default:
      return "text-slate-500 bg-slate-500/10 border-slate-500/20"
  }
}
</script> 