<template>
  <div class="w-full relative">
    <input
      :type="show ? 'text' : 'password'"
      v-bind="filteredAttrs"
      v-model="inputValue"
      class="w-full h-12 px-4 bg-slate-900 border rounded-lg text-white placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[
        error ? 'border-red-500 focus:ring-red-500' : 'border-slate-600',
      ]"
      autocomplete="off"
    />
    <button
      type="button"
      class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 focus:outline-none"
      @click="toggleShow"
      tabindex="-1"
    >
      <svg v-if="show" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.274.832-.64 1.627-1.09 2.357M15.54 15.54A8.963 8.963 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.014 9.014 0 012.042-3.357" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.014 9.014 0 012.042-3.357m1.341-1.982A8.963 8.963 0 0112 5c4.478 0 8.268 2.943 9.542 7a8.978 8.978 0 01-4.304 5.037M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, computed, useAttrs } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  error: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const show = ref(false)
const inputValue = ref(props.modelValue)

const attrs = useAttrs()
// Filtrar las clases para que no pasen al input
const filteredAttrs = computed(() => {
  const { class: _class, ...rest } = { ...attrs }
  return rest
})

watch(() => props.modelValue, (val) => {
  inputValue.value = val
})
watch(inputValue, (val) => {
  emit('update:modelValue', val)
})

function toggleShow() {
  show.value = !show.value
}
</script> 