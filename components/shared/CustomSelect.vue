<template>
  <div class="relative" ref="selectContainer">
    <!-- Main select button -->
    <button
      type="button"
      @click="toggleDropdown"
      @keydown="handleButtonKeyDown"
      :disabled="disabled"
      :class="[
        'w-full h-12 pl-4 pr-4 bg-slate-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center gap-2',
        props.error 
          ? 'border-red-500 focus:ring-red-500' 
          : 'border-slate-600 focus:ring-orange-600'
      ]"
      ref="buttonRef"
      tabindex="0"
    >
      <span class="flex-1 truncate" :class="{ 'text-slate-400': !selectedOption }">
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <UIcon 
        name="i-heroicons-chevron-down" 
        class="w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0"
        :class="{ 'rotate-180': isOpen }"
      />
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
          class="fixed bg-slate-800/95 border border-slate-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto custom-scrollbar backdrop-blur-sm"
          :style="dropdownStyle"
          @keydown="handleKeyDown"
          tabindex="0"
        >
          <div class="py-2">
            <button
              v-for="(option, index) in options"
              :key="option.value"
              type="button"
              @click="selectOption(option)"
              :data-option-value="option.value"
              :data-option-index="index"
              class="w-full px-4 py-2 text-left hover:bg-slate-700 focus:bg-slate-700 focus:outline-none transition-colors duration-150 text-white"
              :class="{ 
                'bg-orange-600 hover:bg-orange-700': selectedOption?.value === option.value,
                'bg-slate-600': highlightedIndex === index && selectedOption?.value !== option.value
              }"
            >
              <div class="flex items-center justify-between">
                <span>{{ option.label }}</span>
                <UIcon 
                  v-if="selectedOption?.value === option.value"
                  name="i-heroicons-check" 
                  class="w-4 h-4 text-white"
                />
              </div>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface SelectOption {
  value: string
  label: string
}

interface Props {
  options: SelectOption[]
  modelValue: string
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Selecciona una opción',
  disabled: false,
  error: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectContainer = ref<HTMLElement>()

const isOpen = ref(false)
const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const highlightedIndex = ref(-1)

const selectedOption = computed(() => 
  props.options.find(option => option.value === props.modelValue)
)

const selectId = Math.random().toString(36).slice(2)

const toggleDropdown = () => {
  if (!props.disabled) {
    if (!isOpen.value) {
      // Only dispatch the event if we're not inside a date picker
      const isInsideDatePicker = buttonRef.value?.closest('.date-picker-overlay')
      if (!isInsideDatePicker) {
        window.dispatchEvent(new CustomEvent('custom-select-or-multiselect-open', { detail: selectId }))
      }
    }
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      searchQuery.value = ''
      highlightedIndex.value = -1
    }
  }
}

function closeDropdown() {
  // Don't close if we're inside a date picker and the date picker is still open
  const isInsideDatePicker = buttonRef.value?.closest('.date-picker-overlay')
  const datePickerIsOpen = document.querySelector('.date-picker-overlay')
  
  if (isInsideDatePicker && datePickerIsOpen) {
    // Don't close the select dropdown when inside an open date picker
    return
  }
  
  isOpen.value = false
  searchQuery.value = ''
  highlightedIndex.value = -1
}

function handleGlobalOpen(e: CustomEvent) {
  if (e.detail !== selectId) {
    // Don't close if we're inside a date picker
    const isInsideDatePicker = buttonRef.value?.closest('.date-picker-overlay')
    if (!isInsideDatePicker) {
      closeDropdown()
    }
  }
}

const selectOption = (option: SelectOption) => {
  emit('update:modelValue', option.value)
  
  // Don't close the dropdown if we're inside a date picker
  const isInsideDatePicker = buttonRef.value?.closest('.date-picker-overlay')
  const datePickerIsOpen = document.querySelector('.date-picker-overlay')
  
  if (!isInsideDatePicker || !datePickerIsOpen) {
    closeDropdown()
  }
}

// Handle keyboard navigation and search
const handleKeyDown = (event: KeyboardEvent) => {
  if (!isOpen.value) return
  
  const key = event.key.toLowerCase()
  
  // Handle arrow keys for navigation
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    event.stopPropagation()
    
    if (highlightedIndex.value < props.options.length - 1) {
      highlightedIndex.value++
    } else {
      highlightedIndex.value = 0 // Wrap to first
    }
    
    // Scroll to highlighted option
    const optionElement = document.querySelector(`[data-option-index="${highlightedIndex.value}"]`) as HTMLElement
    if (optionElement) {
      optionElement.scrollIntoView({ block: 'nearest' })
    }
    return
  }
  
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    event.stopPropagation()
    
    if (highlightedIndex.value > 0) {
      highlightedIndex.value--
    } else {
      highlightedIndex.value = props.options.length - 1 // Wrap to last
    }
    
    // Scroll to highlighted option
    const optionElement = document.querySelector(`[data-option-index="${highlightedIndex.value}"]`) as HTMLElement
    if (optionElement) {
      optionElement.scrollIntoView({ block: 'nearest' })
    }
    return
  }
  
  // Handle Enter key to select highlighted or matching option
  if (event.key === 'Enter') {
    event.preventDefault()
    event.stopPropagation()
    
    if (highlightedIndex.value >= 0) {
      // Select highlighted option
      selectOption(props.options[highlightedIndex.value])
    } else if (searchQuery.value) {
      // Select first matching option from search
      const matchingOption = props.options.find(option => 
        option.label.toLowerCase().startsWith(searchQuery.value.toLowerCase())
      )
      if (matchingOption) {
        selectOption(matchingOption)
      }
    }
    return
  }
  
  // Handle single character keys for search
  if (key.length === 1 && /[a-z0-9]/i.test(key)) {
    event.preventDefault()
    event.stopPropagation()
    
    // Clear previous timeout
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
    
    // Add to search query
    searchQuery.value += key
    
    // Find first option that starts with the search query
    const matchingIndex = props.options.findIndex(option => 
      option.label.toLowerCase().startsWith(searchQuery.value.toLowerCase())
    )
    
    if (matchingIndex >= 0) {
      highlightedIndex.value = matchingIndex
      // Scroll to the matching option
      const optionElement = document.querySelector(`[data-option-index="${matchingIndex}"]`) as HTMLElement
      if (optionElement) {
        optionElement.scrollIntoView({ block: 'nearest' })
      }
    }
    
    // Clear search query after 1 second
    searchTimeout.value = setTimeout(() => {
      searchQuery.value = ''
    }, 1000)
  }
}

// Handle keyboard events on the main button
const handleButtonKeyDown = (event: KeyboardEvent) => {
  if (props.disabled) return
  
  if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
    event.preventDefault()
    if (!isOpen.value) {
      toggleDropdown()
    }
  }
}

const buttonRef = ref<HTMLElement>()
const dropdownStyle = ref('')

watch(isOpen, (open) => {
  if (open) {
    nextTick(() => {
      updateDropdownPosition()
      window.addEventListener('scroll', updateDropdownPosition, true)
      window.addEventListener('resize', updateDropdownPosition)
      // Add global keyboard listener when dropdown is open
      document.addEventListener('keydown', handleKeyDown, true)
    })
  } else {
    window.removeEventListener('scroll', updateDropdownPosition, true)
    window.removeEventListener('resize', updateDropdownPosition)
    // Remove global keyboard listener when dropdown is closed
    document.removeEventListener('keydown', handleKeyDown, true)
  }
})

function updateDropdownPosition() {
  if (!buttonRef.value) return
  const rect = buttonRef.value.getBoundingClientRect()
  
  // Check if we're inside a modal and adjust z-index accordingly
  const isInsideModal = buttonRef.value.closest('[style*="z-index: 9999"], [style*="z-[9999]"], [class*="z-[9999]"]')
  const zIndex = isInsideModal ? 10000 : 50
  
  dropdownStyle.value = `z-index: ${zIndex}; position: fixed; left: ${rect.left}px; top: ${rect.bottom + 4}px; width: ${rect.width}px; background-color: rgb(30 41 59 / 0.95); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(71, 85, 105, 0.5);`
}

onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (selectContainer.value && !selectContainer.value.contains(event.target as Node)) {
      // Don't close if we're inside a date picker
      const isInsideDatePicker = buttonRef.value?.closest('.date-picker-overlay')
      if (!isInsideDatePicker) {
        closeDropdown()
      }
    }
  }
  document.addEventListener('click', handleClickOutside, true) // use capture phase
  window.addEventListener('custom-select-or-multiselect-open', handleGlobalOpen as EventListener)

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeDropdown()
    }
  }
  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside, true)
    window.removeEventListener('custom-select-or-multiselect-open', handleGlobalOpen as EventListener)
    document.removeEventListener('keydown', handleEscape)
    document.removeEventListener('keydown', handleKeyDown, true)
    window.removeEventListener('scroll', updateDropdownPosition, true)
    window.removeEventListener('resize', updateDropdownPosition)
    
    // Clear timeout on unmount
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
  })
})
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #475569 #1e293b;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #1e293b;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

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