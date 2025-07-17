<template>
  <div class="relative w-full" ref="selectContainer">
    <div :class="[(isOpen || isFocused) ? 'ring-2 ring-orange-600 border-orange-600 rounded-lg' : '']">
      <!-- Main select button -->
      <button
        type="button"
        @click="toggleDropdown"
        :disabled="disabled"
        :class="[
          'w-full h-12 pl-4 pr-4 bg-slate-900 border rounded-lg text-white focus:outline-none focus:border-transparent transition-all duration-200 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center gap-2',
          error
            ? (isOpen ? 'border-transparent' : 'border-red-500')
            : (isOpen ? 'border-transparent' : 'border-slate-600')
        ]"
        style="outline: none !important; box-shadow: none !important;"
        :tabindex="disabled ? -1 : 0"
        @focus="handleFocus"
        @blur="handleBlur"
        ref="buttonRef"
      >
        <div class="flex flex-nowrap gap-1 items-center flex-1 min-h-[24px] overflow-hidden" ref="badgeContainer">
          <template v-if="selectedOptions.length">
            <span
              v-for="(option, i) in visibleBadges"
              :key="option.value"
              class="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 flex-shrink-0"
              ref="el => badgeRefs.value[i] = el"
            >
              {{ option.label }}
              <button type="button" @click.stop="removeOption(option.value)" class="focus:outline-none hover:cursor-pointer">
                <svg class="w-3 h-3 text-slate-400 hover:text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 20 20"><path stroke-linecap="round" stroke-linejoin="round" d="M6 6l8 8M14 6l-8 8"/></svg>
              </button>
            </span>
            <span
              v-if="hiddenBadges.length > 0"
              class="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 flex-shrink-0 cursor-help"
              @mouseenter="showOverflowTooltip = true"
              @mouseleave="showOverflowTooltip = false"
            >
              +{{ hiddenBadges.length }}
              <div v-if="showOverflowTooltip" class="absolute left-0 top-full mt-2 z-50 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs whitespace-nowrap">
                {{ hiddenBadges.map(b => b.label).join(', ') }}
              </div>
            </span>
          </template>
          <span v-if="!selectedOptions.length" class="text-slate-400 select-none">{{ placeholder }}</span>
        </div>
        <UIcon 
          name="i-heroicons-chevron-down"
          class="w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0"
          :class="{ 'rotate-180': isOpen }"
        />
      </button>
    </div>
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
        >
          <!-- Search input inside dropdown -->
          <div class="px-4 pt-3 pb-2 bg-slate-800 sticky top-0 z-10">
            <input
              ref="searchInput"
              v-model="search"
              @keydown.stop
              @keydown.enter.prevent
              @keydown.esc="closeDropdown"
              type="text"
              class="w-full bg-transparent border-none outline-none text-white text-base px-0 py-0 focus:ring-0 focus:border-none placeholder-slate-400"
              placeholder="Buscar..."
              autocomplete="off"
            />
            <div class="border-b border-slate-700 mt-2"></div>
          </div>
          <div class="py-2">
            <button
              v-for="option in filteredOptions"
              :key="option.value"
              type="button"
              @click="toggleOption(option.value)"
              class="w-full px-4 py-2 text-left hover:bg-slate-700 focus:bg-slate-700 focus:outline-none transition-colors duration-150 text-white flex items-center justify-between"
              :class="{
                'bg-slate-700': (modelValue as string[]).includes(option.value),
                'opacity-50 cursor-not-allowed': option.disabled
              }"
              :disabled="option.disabled"
            >
              <span>{{ option.label }}</span>
              <UIcon 
                v-if="(modelValue as string[]).includes(option.value)"
                name="i-heroicons-check" 
                class="w-4 h-4 text-white"
              />
            </button>
            <div v-if="!filteredOptions.length" class="px-4 py-2 text-slate-400 text-sm">Sin opciones</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { onBeforeUnmount } from 'vue'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Selecciona opciones' },
  disabled: { type: Boolean, default: false },
  error: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const selectContainer = ref<HTMLElement>()
const searchInput = ref<HTMLInputElement>()
const isOpen = ref(false)
const isFocused = ref(false)
const search = ref('')
const selectId = Math.random().toString(36).slice(2)

const selectedOptions = computed(() => {
  return (props.options as Option[]).filter((opt) => (props.modelValue as string[]).includes(opt.value))
})
// Badge overflow logic
const badgeRefs = ref<HTMLElement[]>([])
const showOverflowTooltip = ref(false)
const badgeContainer = ref<HTMLElement>()

// Computed properties for dynamic badges
const visibleBadges = computed(() => {
  if (!selectedOptions.value || selectedOptions.value.length === 0) return []
  
  const containerWidth = badgeContainer.value?.clientWidth || 200
  const availableWidth = containerWidth - 80 // Space for chevron, padding, and potential +N badge
  let currentWidth = 0
  let visibleCount = 0
  
  for (let i = 0; i < selectedOptions.value.length; i++) {
    const option = selectedOptions.value[i]
    // Estimate badge width based on text length
    const estimatedWidth = Math.max(60, option.label.length * 8 + 40) // Minimum 60px, 8px per character + padding
    
    // Check if adding this badge would exceed available space
    if (currentWidth + estimatedWidth > availableWidth) {
      break
    }
    
    currentWidth += estimatedWidth + 4 // 4px gap
    visibleCount = i + 1
  }
  
  // Always show at least one badge if there are selected options
  if (selectedOptions.value.length > 0 && visibleCount === 0) {
    visibleCount = 1
  }
  
  return selectedOptions.value.slice(0, visibleCount)
})

const hiddenBadges = computed(() => {
  if (!selectedOptions.value) return []
  return selectedOptions.value.slice(visibleBadges.value.length)
})

// Watch for container size changes to recalculate badges
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  // Set up ResizeObserver for dynamic badge calculation
  if (typeof ResizeObserver !== 'undefined' && badgeContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      // Force reactivity update when container size changes
    })
    resizeObserver.observe(badgeContainer.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

const filteredOptions = computed(() => {
  if (!search.value) return props.options as Option[]
  return (props.options as Option[]).filter((opt) =>
    opt.label.toLowerCase().includes(search.value.toLowerCase())
  )
})

function toggleDropdown() {
  if (props.disabled) return
  if (!isOpen.value) {
    window.dispatchEvent(new CustomEvent('custom-select-or-multiselect-open', { detail: selectId }))
  }
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => searchInput.value?.focus())
  }
}
function closeDropdown() {
  isOpen.value = false
  search.value = ''
}
function toggleOption(value: string) {
  if (props.disabled) return
  const newValue = (props.modelValue as string[]).includes(value)
    ? (props.modelValue as string[]).filter((v) => v !== value)
    : [...(props.modelValue as string[]), value]
  emit('update:modelValue', newValue)
}
function removeOption(value: string) {
  if (props.disabled) return
  emit('update:modelValue', (props.modelValue as string[]).filter((v) => v !== value))
}

function handleGlobalOpen(e: CustomEvent) {
  if (e.detail !== selectId) {
    isOpen.value = false
    search.value = ''
  }
}

function handleFocus() {
  isFocused.value = true
}
function handleBlur() {
  isFocused.value = false
}

// Cerrar al hacer click fuera
function handleClickOutside(event: MouseEvent) {
  if (selectContainer.value && !selectContainer.value.contains(event.target as Node)) {
    closeDropdown()
  }
}
onMounted(() => {
  document.addEventListener('click', handleClickOutside, true) // use capture phase
  window.addEventListener('custom-select-or-multiselect-open', handleGlobalOpen as EventListener)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
  window.removeEventListener('custom-select-or-multiselect-open', handleGlobalOpen as EventListener)
})

const buttonRef = ref<HTMLElement>()
const dropdownStyle = ref('')

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
  
  dropdownStyle.value = `z-index: ${zIndex}; position: fixed; left: ${rect.left}px; top: ${rect.bottom + 4}px; width: ${rect.width}px; background-color: rgb(30 41 59 / 0.95); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(71, 85, 105, 0.5);`
}

onUnmounted(() => {
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
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
</style> 