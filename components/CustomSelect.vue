<template>
  <div class="relative" ref="selectContainer" style="z-index: 999999;">
    <!-- Main select button -->
    <button
      type="button"
      @click="toggleDropdown"
      :disabled="disabled"
      :class="[
        'w-full h-12 pl-4 pr-4 bg-slate-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center gap-2',
        props.error 
          ? 'border-red-500 focus:ring-red-500' 
          : 'border-slate-600 focus:ring-orange-600'
      ]"
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
        class="absolute top-full left-0 right-0 mt-1 bg-slate-800/95 border border-slate-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto custom-scrollbar backdrop-blur-sm"
        style="z-index: 999999; background-color: rgb(30 41 59 / 0.95); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(71, 85, 105, 0.5);"
      >
        <div class="py-2">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            @click="selectOption(option)"
            class="w-full px-4 py-2 text-left hover:bg-slate-700 focus:bg-slate-700 focus:outline-none transition-colors duration-150 text-white"
            :class="{ 'bg-orange-600 hover:bg-orange-700': selectedOption?.value === option.value }"
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

const selectedOption = computed(() => 
  props.options.find(option => option.value === props.modelValue)
)

const selectId = Math.random().toString(36).slice(2)

const toggleDropdown = () => {
  if (!props.disabled) {
    if (!isOpen.value) {
      window.dispatchEvent(new CustomEvent('custom-select-or-multiselect-open', { detail: selectId }))
    }
    isOpen.value = !isOpen.value
  }
}

function closeDropdown() {
  isOpen.value = false
}

function handleGlobalOpen(e: CustomEvent) {
  if (e.detail !== selectId) {
    closeDropdown()
  }
}

const selectOption = (option: SelectOption) => {
  emit('update:modelValue', option.value)
  closeDropdown()
}

onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (selectContainer.value && !selectContainer.value.contains(event.target as Node)) {
      closeDropdown()
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
  z-index: 999999;
}

/* Force the dropdown to be above everything */
.absolute {
  position: absolute !important;
  z-index: 999999 !important;
  isolation: isolate;
}

/* Additional stacking context for the container */
.relative[style*="z-index"] {
  position: relative !important;
  z-index: 999999 !important;
}
</style> 