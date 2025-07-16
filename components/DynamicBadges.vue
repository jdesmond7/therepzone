<template>
  <div ref="containerRef" class="flex flex-wrap gap-1">
    <span 
      v-for="item in visibleItems" 
      :key="item"
      :class="[
        'px-2 py-1 rounded text-xs',
        props.variant === 'primary' ? 'bg-slate-700 text-slate-300' : 'bg-slate-600 text-slate-300'
      ]"
    >
      {{ item }}
    </span>
    <CustomTooltip 
      v-if="hiddenItems.length > 0"
      :text="hiddenItems.join(', ')"
      position="top"
    >
      <span 
        :class="[
          'px-2 py-1 rounded text-xs cursor-help',
          props.variant === 'primary' ? 'bg-slate-700 text-slate-300' : 'bg-slate-600 text-slate-300'
        ]"
      >
        +{{ hiddenItems.length }}
      </span>
    </CustomTooltip>
  </div>
</template>

<script setup lang="ts">
import CustomTooltip from './CustomTooltip.vue'

interface Props {
  items: string[]
  maxWidth?: number
  variant?: 'primary' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 200,
  variant: 'primary'
})

const containerRef = ref<HTMLElement>()
const visibleItems = ref<string[]>([])
const hiddenItems = ref<string[]>([])

const calculateVisibleBadges = (items: string[], containerWidth: number) => {
  if (!items || items.length === 0) return { visible: [], hidden: [] }
  
  let totalWidth = 0
  let visibleCount = 0
  const badgeWidth = 80 // Ancho aproximado por badge
  const gap = 4 // Gap entre badges
  const plusBadgeWidth = 30 // Ancho del badge "+N"
  
  for (let i = 0; i < items.length; i++) {
    const itemWidth = Math.min(badgeWidth, items[i].length * 8 + 16)
    const currentTotal = totalWidth + itemWidth + (i > 0 ? gap : 0)
    
    // Si agregar este badge excede el contenedor, paramos
    if (currentTotal > containerWidth - plusBadgeWidth) {
      break
    }
    
    totalWidth = currentTotal
    visibleCount = i + 1
  }
  
  return {
    visible: items.slice(0, visibleCount),
    hidden: items.slice(visibleCount)
  }
}

const updateBadges = () => {
  if (!containerRef.value) return
  
  const containerWidth = containerRef.value.offsetWidth
  const result = calculateVisibleBadges(props.items, containerWidth)
  visibleItems.value = result.visible
  hiddenItems.value = result.hidden
}

// Observar cambios en el contenedor
onMounted(() => {
  updateBadges()
  
  // Usar ResizeObserver para detectar cambios de tamaño
  if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(() => {
      updateBadges()
    })
    
    if (containerRef.value) {
      resizeObserver.observe(containerRef.value)
    }
  }
})

// Observar cambios en los items
watch(() => props.items, updateBadges, { deep: true })
</script> 