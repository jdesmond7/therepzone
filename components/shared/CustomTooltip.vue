<template>
  <div 
    class="relative inline-block"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <slot />
    <div
      v-if="showTooltip"
      class="absolute z-50 px-3 py-2 text-sm text-white bg-slate-900 border border-slate-700 rounded-lg shadow-lg whitespace-nowrap"
      :class="[positionClass, borderFixClass]"
      style="pointer-events: none;"
    >
      {{ text }}
      <!-- Flecha como triángulo puro -->
      <div
        v-if="props.position === 'top'"
        class="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-900"
        style="z-index: 1;"
      ></div>
      <div
        v-else-if="props.position === 'bottom'"
        class="absolute left-1/2 -top-2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-slate-900"
        style="z-index: 1;"
      ></div>
      <div
        v-else-if="props.position === 'left'"
        class="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-slate-900"
        style="z-index: 1;"
      ></div>
      <div
        v-else-if="props.position === 'right'"
        class="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-slate-900"
        style="z-index: 1;"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top'
})

const showTooltip = ref(false)

const positionClass = computed(() => {
  switch (props.position) {
    case 'top':
      return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
    case 'bottom':
      return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
    case 'left':
      return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
    case 'right':
      return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    default:
      return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
  }
})

// Quita el borde donde se une la flecha
const borderFixClass = computed(() => {
  switch (props.position) {
    case 'top':
      return 'border-b-0'
    case 'bottom':
      return 'border-t-0'
    case 'left':
      return 'border-r-0'
    case 'right':
      return 'border-l-0'
    default:
      return 'border-b-0'
  }
})
</script> 