<template>
  <label class="inline-flex items-center cursor-pointer select-none">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="onChange"
      :disabled="disabled"
      class="sr-only"
    />
    <span
      class="w-6 h-6 flex items-center justify-center rounded-lg border-2 transition-colors duration-200"
      :class="[
        modelValue ? 'bg-orange-600 border-orange-600' : 'bg-slate-800 border-slate-500',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      ]"
    >
      <svg v-if="modelValue" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  </label>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
  modelValue: Boolean,
  disabled: Boolean
})
const emit = defineEmits(['update:modelValue'])

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script> 