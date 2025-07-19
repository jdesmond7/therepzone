<template>
  <div class="w-full">
    <textarea
      v-model="modelValueProxy"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      @input="$emit('update:modelValue', modelValueProxy)"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
      class="w-full px-4 py-3 bg-slate-900 border rounded-lg text-white placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[
        error ? 'border-red-500 focus:ring-red-500' : 'border-slate-600',
        resize || 'resize-none'
      ]"
    ></textarea>
    <div v-if="error && errorMessage" class="text-xs text-red-500 mt-1">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 3
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  resize: {
    type: String,
    default: 'resize-none'
  }
})
const emit = defineEmits(['update:modelValue', 'focus', 'blur'])
const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val)
})
</script>

<style scoped>
</style> 