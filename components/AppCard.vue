<template>
  <div 
    :class="[
      'bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6',
      fullWidth ? 'w-full' : '',
      className
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  fullWidth?: boolean
  className?: string
}

defineProps<Props>()
</script> 