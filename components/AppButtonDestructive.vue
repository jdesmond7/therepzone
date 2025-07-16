<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'h-12 bg-red-600 hover:bg-red-700 text-white font-bold px-6 rounded-lg transition-colors flex items-center justify-center gap-2',
      disabled && 'opacity-50 cursor-not-allowed',
      fullWidth && 'w-full',
      className
    ]"
    @click="$emit('click', $event)"
  >
    <UIcon v-if="icon" :name="icon" class="w-5 h-5" />
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  fullWidth?: boolean
  icon?: string
  className?: string
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  disabled: false,
  fullWidth: false,
  icon: '',
  className: ''
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script> 