<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="[
      'h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer no-underline',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      fullWidth && 'w-full',
      className
    ]"
  >
    <UIcon v-if="icon" :name="icon" class="w-5 h-5" />
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :disabled="disabled"
    :class="[
      'h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
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
  to?: string
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  disabled: false,
  fullWidth: false,
  icon: '',
  className: '',
  to: ''
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script> 