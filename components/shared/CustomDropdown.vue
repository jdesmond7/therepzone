<template>
  <div class="relative" ref="dropdownContainer">
    <!-- Trigger button -->
    <button
      type="button"
      @click="toggleDropdown"
      :disabled="disabled"
      :class="[
        'flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed',
        props.error 
          ? 'border-red-500 focus:ring-red-500' 
          : 'border-slate-600 focus:ring-orange-600'
      ]"
      ref="buttonRef"
    >
      <slot name="trigger">
        <span class="text-sm">{{ triggerText }}</span>
        <UIcon 
          name="i-heroicons-chevron-down" 
          class="w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0"
          :class="{ 'rotate-180': isOpen }"
        />
      </slot>
    </button>

    <!-- Dropdown menu -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          class="fixed bg-slate-800/95 border border-slate-600 rounded-lg shadow-2xl backdrop-blur-sm"
          :style="dropdownStyle"
          @keydown="handleKeyDown"
          tabindex="0"
        >
          <div class="py-2">
            <slot name="content" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface Props {
  triggerText?: string
  disabled?: boolean
  error?: boolean
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  triggerText: 'Opciones',
  disabled: false,
  error: false,
  width: 'auto'
})

const emit = defineEmits<{
  'toggle': [isOpen: boolean]
}>()

const dropdownContainer = ref<HTMLElement>()
const isOpen = ref(false)
const buttonRef = ref<HTMLElement>()
const dropdownStyle = ref('')

const dropdownId = Math.random().toString(36).slice(2)

const toggleDropdown = () => {
  if (!props.disabled) {
    if (!isOpen.value) {
      window.dispatchEvent(new CustomEvent('custom-dropdown-open', { detail: dropdownId }))
    }
    isOpen.value = !isOpen.value
    emit('toggle', isOpen.value)
  }
}

function closeDropdown() {
  isOpen.value = false
  emit('toggle', false)
}

function handleGlobalOpen(e: CustomEvent) {
  if (e.detail !== dropdownId) {
    closeDropdown()
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDropdown()
  }
}

watch(isOpen, (open) => {
  if (open) {
    nextTick(() => {
      updateDropdownPosition()
      window.addEventListener('scroll', updateDropdownPosition, true)
      window.addEventListener('resize', updateDropdownPosition)
    })
  } else {
    window.removeEventListener('scroll', updateDropdownPosition, true)
    window.removeEventListener('resize', updateDropdownPosition)
  }
})

function updateDropdownPosition() {
  if (!buttonRef.value) return
  const rect = buttonRef.value.getBoundingClientRect()
  
  // Check if we're inside a modal and adjust z-index accordingly
  const isInsideModal = buttonRef.value.closest('[style*="z-index: 9999"], [style*="z-[9999]"], [class*="z-[9999]"]')
  const zIndex = isInsideModal ? 10000 : 50
  
  const width = props.width === 'auto' ? rect.width : props.width
  const margin = 24 // 24px margin from screen edges
  
  // Calculate available space
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // Parse width to number
  let widthNum: number
  if (typeof width === 'string') {
    if (width.includes('rem')) {
      // Convert rem to pixels (1rem = 16px)
      widthNum = parseInt(width) * 16
    } else if (width.includes('px')) {
      widthNum = parseInt(width)
    } else {
      widthNum = parseInt(width) || rect.width
    }
  } else {
    widthNum = width
  }
  
  // Calculate left position with margin
  let left = rect.left
  
  // Check if dropdown would go beyond right edge
  if (left + widthNum > viewportWidth - margin) {
    // Position from right edge with margin
    left = viewportWidth - widthNum - margin
  }
  
  // Ensure minimum margin from left edge
  if (left < margin) {
    left = margin
  }
  
  // Calculate top position with margin
  let top = rect.bottom + 8 // Add some space between button and dropdown
  
  // Estimate dropdown height (adjust based on content)
  const dropdownHeight = 250
  
  // Check if dropdown would go below viewport
  if (top + dropdownHeight > viewportHeight - margin) {
    // Show above the button
    top = rect.top - dropdownHeight - 8
  }
  
  // Ensure minimum margin from top edge
  if (top < margin) {
    top = margin
  }
  
  // Ensure minimum margin from bottom edge
  if (top + dropdownHeight > viewportHeight - margin) {
    top = viewportHeight - dropdownHeight - margin
  }
  
  dropdownStyle.value = `z-index: ${zIndex}; position: fixed; left: ${left}px; top: ${top}px; width: ${width}px; background-color: rgb(30 41 59 / 0.95); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(71, 85, 105, 0.5);`
  
  // Debug positioning
  console.log('Dropdown positioning:', {
    buttonLeft: rect.left,
    buttonTop: rect.top,
    buttonBottom: rect.bottom,
    viewportWidth,
    viewportHeight,
    originalWidth: width,
    widthNum,
    calculatedLeft: left,
    calculatedTop: top,
    margin,
    wouldGoBeyondRight: left + widthNum > viewportWidth - margin,
    rightEdge: viewportWidth - margin
  })
}

onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownContainer.value && !dropdownContainer.value.contains(event.target as Node)) {
      closeDropdown()
    }
  }
  
  document.addEventListener('click', handleClickOutside, true)
  window.addEventListener('custom-dropdown-open', handleGlobalOpen as EventListener)

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeDropdown()
    }
  }
  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside, true)
    window.removeEventListener('custom-dropdown-open', handleGlobalOpen as EventListener)
    document.removeEventListener('keydown', handleEscape)
    window.removeEventListener('scroll', updateDropdownPosition, true)
    window.removeEventListener('resize', updateDropdownPosition)
  })
})

// Expose methods for parent components
defineExpose({
  open: () => {
    isOpen.value = true
    emit('toggle', true)
  },
  close: closeDropdown,
  toggle: toggleDropdown
})
</script>

<style scoped>
/* Ensure dropdowns are always on top */
.relative {
  position: relative;
  z-index: 50;
}

/* Force the dropdown to be above everything */
.absolute {
  position: absolute !important;
  z-index: 50 !important;
  isolation: isolate;
}

/* Additional stacking context for the container */
.relative[style*="z-index"] {
  position: relative !important;
  z-index: 50 !important;
}
</style> 