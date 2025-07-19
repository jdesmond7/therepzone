<template>
  <div :class="[
    'flex items-center gap-3',
    { 'flex-col gap-2': vertical }
  ]">
    <div class="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
      <span class="text-white font-black text-lg">RZ</span>
    </div>
    <span class="text-2xl font-black text-white tracking-tight">
      THE<span class="text-orange-600">REP</span>ZONE
    </span>
  </div>
</template>

<script setup lang="ts">
// Logo component for THEREPZONE
defineProps({
  vertical: {
    type: Boolean,
    default: false
  }
})
</script> 