<template>
  <button
    :class="[
      'border border-white text-white font-bold rounded-lg transition flex items-center justify-center gap-2 px-4 py-2 bg-transparent',
      fullWidth ? 'w-full' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      !disabled && !loading ? 'hover:bg-white hover:text-orange-600' : ''
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <slot name="icon" />
    <span v-if="!loading"><slot /></span>
    <span v-else class="flex items-center gap-2">
      <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      Cargando...
    </span>
  </button>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
  disabled: Boolean,
  loading: Boolean,
  fullWidth: Boolean
})
const emit = defineEmits(['click'])
</script> 