<template>
  <div class="w-full">
    <input
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement)?.value)"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
      class="w-full h-12 px-4 bg-slate-900 border rounded-lg text-white placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[
        error ? 'border-red-500 focus:ring-red-500' : 'border-slate-600',
      ]"
      autocomplete="off"
    />
    <div v-if="error && errorMessage" class="text-xs text-red-500 mt-1">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  disabled: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'focus', 'blur'])
</script> 