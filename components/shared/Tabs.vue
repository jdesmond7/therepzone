<template>
  <div class="flex w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-600 h-[48px]">
    <button
      v-for="option in options"
      :key="option.value"
      @click="$emit('update:modelValue', option.value)"
      :class="['flex-1 font-bold h-full transition', modelValue === option.value ? 'bg-orange-600 text-white' : 'text-slate-400']"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  options: { value: string, label: string }[]
}>()
</script> 