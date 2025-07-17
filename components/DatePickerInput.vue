<template>
  <div class="date-picker-wrapper" :class="{ 'date-picker-open': showDatePicker }">
    <div class="date-picker-container">
      <div class="date-picker-input-section">
        <label v-if="label" class="block text-sm font-medium text-slate-400 mb-1">{{ label }}</label>
        <div class="relative">
          <input
            ref="inputRef"
            :id="id || 'date-input-' + Math.random().toString(36).slice(2)"
            v-model="inputValue"
            type="text"
            :placeholder="placeholder"
            autocomplete="off"
            @input="formatBirthDate"
            @keydown="handleKeyDown"
            @focus="openDatePicker"
            class="w-full h-12 pl-4 pr-12 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
            maxlength="10"
          />
          <div
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
          >
            <slot name="icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 21h15a.75.75 0 00.75-.75V6.75A2.25 2.25 0 0018 4.5H6A2.25 2.25 0 003.75 6.75v13.5c0 .414.336.75.75.75z" />
              </svg>
            </slot>
          </div>
        </div>
      </div>
      
      <!-- Date picker dropdown above all elements -->
      <Teleport to="body">
        <div v-if="showDatePicker" ref="datePickerRef" class="date-picker-overlay">
          <div class="bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-4 w-96">
            <!-- Header with navigation and selects -->
            <div class="flex items-center justify-between mb-4">
              <button type="button" @click="changeMonth(-1)" class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
              <div class="flex gap-2 justify-center">
                <div class="w-[160px]">
                  <div class="relative" data-dropdown="month">
                    <button
                      type="button"
                      @click="toggleMonthDropdown"
                      class="w-full h-8 pl-3 pr-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all duration-200 hover:border-slate-500 text-left flex items-center justify-between"
                    >
                      <span class="truncate">{{ getMonthName(selectedMonth) }}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0" :class="{ 'rotate-180': showMonthDropdown }">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    
                    <!-- Month dropdown -->
                    <div 
                      v-if="showMonthDropdown" 
                      class="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50"
                      @keydown="handleMonthKeyDown"
                      tabindex="0"
                    >
                      <button
                        v-for="option in monthOptions"
                        :key="option.value"
                        type="button"
                        @click="selectMonth(option.value)"
                        :data-month-option="option.value"
                        class="w-full px-3 py-2 text-left hover:bg-slate-700 focus:bg-slate-700 focus:outline-none transition-colors duration-150 text-white text-sm"
                        :class="{ 'bg-orange-600 hover:bg-orange-700': selectedMonth === option.value }"
                      >
                        {{ option.label }}
                      </button>
                    </div>
                  </div>
                </div>
                <div class="w-[120px]">
                  <div class="relative" data-dropdown="year">
                    <button
                      type="button"
                      @click="toggleYearDropdown"
                      class="w-full h-8 pl-3 pr-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all duration-200 hover:border-slate-500 text-left flex items-center justify-between"
                    >
                      <span class="truncate">{{ selectedYear }}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0" :class="{ 'rotate-180': showYearDropdown }">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    
                    <!-- Year dropdown -->
                    <div 
                      v-if="showYearDropdown" 
                      class="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50"
                      @keydown="handleYearKeyDown"
                      tabindex="0"
                    >
                      <button
                        v-for="option in yearOptions"
                        :key="option.value"
                        type="button"
                        @click="selectYear(option.value)"
                        :data-year-option="option.value"
                        class="w-full px-3 py-2 text-left hover:bg-slate-700 focus:bg-slate-700 focus:outline-none transition-colors duration-150 text-white text-sm"
                        :class="{ 'bg-orange-600 hover:bg-orange-700': selectedYear === option.value }"
                      >
                        {{ option.label }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button type="button" @click="changeMonth(1)" class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            </div>
            
            <!-- Calendar grid -->
            <div class="grid grid-cols-7 gap-1 mb-2">
              <div v-for="day in weekDaysShort" :key="day" class="text-xs font-medium text-slate-400 text-center py-2">{{ day }}</div>
            </div>
            <div class="grid grid-cols-7 gap-1">
              <button v-for="date in calendarDates" :key="`${date.month}-${date.day}`" type="button" @click="selectDate(date)"
                :disabled="date.isFuture"
                :class="[
                  'w-8 h-8 text-sm rounded-lg transition-colors',
                  date.isCurrentMonth ? 'text-white hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-700',
                  date.isSelected ? 'bg-orange-600 text-white hover:bg-orange-700' : '',
                  date.isToday && !date.isSelected ? 'bg-slate-700 text-orange-400 font-bold' : '',
                  date.isFuture ? 'text-slate-500 cursor-not-allowed opacity-50' : ''
                ]"
              >{{ date.day }}</button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import CustomSelect from './CustomSelect.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  id: { type: String, default: '' },
  placeholder: { type: String, default: 'dd/mm/yyyy' }
})
const emit = defineEmits(['update:modelValue', 'datepicker-open', 'datepicker-close'])

const inputValue = ref(props.modelValue)
watch(() => props.modelValue, v => inputValue.value = v)
watch(inputValue, v => emit('update:modelValue', v))

const showDatePicker = ref(false)
const selectedMonth = ref(new Date().getMonth().toString())
const selectedYear = ref(new Date().getFullYear().toString())
const datePickerRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const showMonthDropdown = ref(false)
const showYearDropdown = ref(false)

// Keyboard search functionality
const monthSearchQuery = ref('')
const yearSearchQuery = ref('')
const monthSearchTimeout = ref<NodeJS.Timeout | null>(null)
const yearSearchTimeout = ref<NodeJS.Timeout | null>(null)

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]
const weekDaysShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear - 100; year <= currentYear; year++) {
    years.push(year)
  }
  return years.reverse()
})
const monthOptions = computed(() => monthNames.map((month, i) => ({ value: i.toString(), label: month })))
const yearOptions = computed(() => availableYears.value.map(year => ({ value: year.toString(), label: year.toString() })))

const calendarDates = computed(() => {
  const year = parseInt(selectedYear.value)
  const month = parseInt(selectedMonth.value)
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - firstDay.getDay())
  const dates = []
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const selectedDate = parseDateFromInput(inputValue.value)
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.toDateString() === today.toDateString()
    const isSelected = selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    
    // Check if date is in the future (after tomorrow)
    const isFuture = date > tomorrow
    
    dates.push({
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isCurrentMonth,
      isToday,
      isSelected,
      isFuture,
      fullDate: date
    })
  }
  return dates
})

const handleKeyDown = (event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement
  const key = event.key
  if ([
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
  ].includes(key)) {
    if (key === 'Backspace') {
      const cursorPosition = target.selectionStart || 0
      const value = target.value
      if ((cursorPosition === 3 || cursorPosition === 6) && value[cursorPosition - 1] === '/') {
        event.preventDefault()
        const newValue = value.substring(0, cursorPosition - 2) + value.substring(cursorPosition)
        inputValue.value = newValue
        target.value = newValue
        nextTick(() => {
          target.setSelectionRange(cursorPosition - 2, cursorPosition - 2)
        })
        return
      }
    }
    return
  }
  if (!/\d/.test(key)) {
    event.preventDefault()
  }
}
const formatBirthDate = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '')
  if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2)
  if (value.length >= 5) value = value.substring(0, 5) + '/' + value.substring(5, 9)
  inputValue.value = value
  target.value = value
  syncDatePickerWithInput()
}
const parseDateFromInput = (dateString: string): Date | null => {
  if (!dateString || dateString.length !== 10) return null
  const [day, month, year] = dateString.split('/').map(Number)
  if (!day || !month || !year) return null
  const date = new Date(year, month - 1, day)
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) return null
  return date
}
const syncDatePickerWithInput = () => {
  const date = parseDateFromInput(inputValue.value)
  if (date) {
    selectedMonth.value = date.getMonth().toString()
    selectedYear.value = date.getFullYear().toString()
  }
}
const updateOverlayPosition = () => {
  if (!datePickerRef.value || !inputRef.value) return
  
  const inputRect = inputRef.value.getBoundingClientRect()
  const overlay = datePickerRef.value
  const overlayWidth = 384 // w-96 = 24rem = 384px
  
  // Position overlay aligned with the left edge of the input (like other selects)
  let left = inputRect.left
  
  // Ensure overlay doesn't go off-screen
  if (left + overlayWidth > window.innerWidth - 16) {
    left = window.innerWidth - overlayWidth - 16 // 16px margin from right edge
  }
  
  // Position overlay below the input
  overlay.style.left = `${left}px`
  overlay.style.top = `${inputRect.bottom + 4}px`
  overlay.style.width = `${overlayWidth}px`
}

const openDatePicker = () => {
  showDatePicker.value = true
  syncDatePickerWithInput()
  nextTick(() => {
    // Add a small delay to ensure DOM is fully updated
    setTimeout(() => {
      updateOverlayPosition()
    }, 10)
  })
  emit('datepicker-open')
}

const toggleDatePicker = () => {
  showDatePicker.value = !showDatePicker.value
  if (showDatePicker.value) {
    syncDatePickerWithInput()
    nextTick(() => {
      // Add a small delay to ensure DOM is fully updated
      setTimeout(() => {
        updateOverlayPosition()
      }, 10)
    })
    emit('datepicker-open')
  } else {
    emit('datepicker-close')
  }
}

// Removed updateContainerHeight function

const closeDatePicker = () => { 
  showDatePicker.value = false 
  emit('datepicker-close')
}
// El blur ya no cierra el datepicker, solo click fuera lo hace
const handleDateInputBlur = (event: Event) => {}
const changeMonth = (direction: number) => {
  const currentMonth = parseInt(selectedMonth.value)
  const currentYear = parseInt(selectedYear.value)
  const newMonth = currentMonth + direction
  if (newMonth < 0) {
    selectedMonth.value = '11'
    selectedYear.value = (currentYear - 1).toString()
  } else if (newMonth > 11) {
    selectedMonth.value = '0'
    selectedYear.value = (currentYear + 1).toString()
  } else {
    selectedMonth.value = newMonth.toString()
  }
}
const getMonthName = (monthIndex: string) => {
  return monthNames[parseInt(monthIndex)] || 'Mes'
}

const toggleMonthDropdown = () => {
  showMonthDropdown.value = !showMonthDropdown.value
  showYearDropdown.value = false // Close year dropdown if open
  
  if (showMonthDropdown.value) {
    monthSearchQuery.value = ''
    nextTick(() => {
      // Add global keyboard listener when dropdown is open
      document.addEventListener('keydown', handleMonthKeyDown, true)
    })
  } else {
    // Remove global keyboard listener when dropdown is closed
    document.removeEventListener('keydown', handleMonthKeyDown, true)
  }
}

const toggleYearDropdown = () => {
  showYearDropdown.value = !showYearDropdown.value
  showMonthDropdown.value = false // Close month dropdown if open
  
  if (showYearDropdown.value) {
    yearSearchQuery.value = ''
    nextTick(() => {
      // Add global keyboard listener when dropdown is open
      document.addEventListener('keydown', handleYearKeyDown, true)
    })
  } else {
    // Remove global keyboard listener when dropdown is closed
    document.removeEventListener('keydown', handleYearKeyDown, true)
  }
}

const selectMonth = (monthValue: string) => {
  selectedMonth.value = monthValue
  showMonthDropdown.value = false
}

const selectYear = (yearValue: string) => {
  selectedYear.value = yearValue
  showYearDropdown.value = false
}

// Keyboard navigation for month dropdown
const handleMonthKeyDown = (event: KeyboardEvent) => {
  if (!showMonthDropdown.value) return
  
  const key = event.key.toLowerCase()
  
  // Only handle single character keys (letters and numbers)
  if (key.length === 1 && /[a-z0-9]/i.test(key)) {
    event.preventDefault()
    event.stopPropagation()
    
    // Clear previous timeout
    if (monthSearchTimeout.value) {
      clearTimeout(monthSearchTimeout.value)
    }
    
    // Add to search query
    monthSearchQuery.value += key
    
    // Find first option that starts with the search query
    const matchingOption = monthOptions.value.find(option => 
      option.label.toLowerCase().startsWith(monthSearchQuery.value.toLowerCase())
    )
    
    if (matchingOption) {
      // Scroll to the matching option
      const optionElement = document.querySelector(`[data-month-option="${matchingOption.value}"]`) as HTMLElement
      if (optionElement) {
        optionElement.scrollIntoView({ block: 'nearest' })
      }
    }
    
    // Clear search query after 1 second
    monthSearchTimeout.value = setTimeout(() => {
      monthSearchQuery.value = ''
    }, 1000)
  }
  
  // Handle Enter key to select the first matching option
  if (event.key === 'Enter' && monthSearchQuery.value) {
    event.preventDefault()
    event.stopPropagation()
    
    const matchingOption = monthOptions.value.find(option => 
      option.label.toLowerCase().startsWith(monthSearchQuery.value.toLowerCase())
    )
    
    if (matchingOption) {
      selectMonth(matchingOption.value)
    }
  }
}

// Keyboard navigation for year dropdown
const handleYearKeyDown = (event: KeyboardEvent) => {
  if (!showYearDropdown.value) return
  
  const key = event.key.toLowerCase()
  
  // Only handle single character keys (letters and numbers)
  if (key.length === 1 && /[a-z0-9]/i.test(key)) {
    event.preventDefault()
    event.stopPropagation()
    
    // Clear previous timeout
    if (yearSearchTimeout.value) {
      clearTimeout(yearSearchTimeout.value)
    }
    
    // Add to search query
    yearSearchQuery.value += key
    
    // Find first option that starts with the search query
    const matchingOption = yearOptions.value.find(option => 
      option.label.toLowerCase().startsWith(yearSearchQuery.value.toLowerCase())
    )
    
    if (matchingOption) {
      // Scroll to the matching option
      const optionElement = document.querySelector(`[data-year-option="${matchingOption.value}"]`) as HTMLElement
      if (optionElement) {
        optionElement.scrollIntoView({ block: 'nearest' })
      }
    }
    
    // Clear search query after 1 second
    yearSearchTimeout.value = setTimeout(() => {
      yearSearchQuery.value = ''
    }, 1000)
  }
  
  // Handle Enter key to select the first matching option
  if (event.key === 'Enter' && yearSearchQuery.value) {
    event.preventDefault()
    event.stopPropagation()
    
    const matchingOption = yearOptions.value.find(option => 
      option.label.toLowerCase().startsWith(yearSearchQuery.value.toLowerCase())
    )
    
    if (matchingOption) {
      selectYear(matchingOption.value)
    }
  }
}

const handleMonthChange = (newMonth: string) => { 
  selectedMonth.value = newMonth 
  // Don't close the date picker when changing month
}
const handleYearChange = (newYear: string) => { 
  selectedYear.value = newYear 
  // Don't close the date picker when changing year
}
const selectDate = (dateInfo: any) => {
  // Don't allow selecting future dates
  if (dateInfo.isFuture) {
    return
  }
  
  const date = new Date(dateInfo.year, dateInfo.month, dateInfo.day)
  inputValue.value = formatDateForDisplay(date)
  selectedMonth.value = dateInfo.month.toString()
  selectedYear.value = dateInfo.year.toString()
  showDatePicker.value = false
  emit('datepicker-close')
}
const formatDateForDisplay = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}


// Click outside
const handleClickOutside = (event: MouseEvent) => {
  if (showDatePicker.value && datePickerRef.value) {
    const target = event.target as HTMLElement
    
    // Si el click no es ni en el input ni en el datepicker, cierra
    if (!datePickerRef.value.contains(target) && !inputRef.value?.contains(target)) {
      showDatePicker.value = false
      emit('datepicker-close')
    }
  }
  
  // Close month and year dropdowns if clicking outside
  if (showMonthDropdown.value || showYearDropdown.value) {
    const target = event.target as HTMLElement
    const isMonthDropdown = target.closest('[data-dropdown="month"]')
    const isYearDropdown = target.closest('[data-dropdown="year"]')
    
    if (!isMonthDropdown) {
      showMonthDropdown.value = false
      document.removeEventListener('keydown', handleMonthKeyDown, true)
    }
    if (!isYearDropdown) {
      showYearDropdown.value = false
      document.removeEventListener('keydown', handleYearKeyDown, true)
    }
  }
}
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('scroll', updateOverlayPosition, true)
  window.addEventListener('resize', updateOverlayPosition)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('scroll', updateOverlayPosition, true)
  window.removeEventListener('resize', updateOverlayPosition)
  
  // Remove keyboard listeners
  document.removeEventListener('keydown', handleMonthKeyDown, true)
  document.removeEventListener('keydown', handleYearKeyDown, true)
  
  // Clear timeouts
  if (monthSearchTimeout.value) {
    clearTimeout(monthSearchTimeout.value)
  }
  if (yearSearchTimeout.value) {
    clearTimeout(yearSearchTimeout.value)
  }
})
</script>

<style scoped>
.date-picker-wrapper {
  width: 100%;
  position: relative;
}

.date-picker-container {
  width: 100%;
}

.date-picker-input-section {
  width: 100%;
}

.date-picker-overlay {
  position: fixed;
  z-index: 999999;
  /* Position will be set dynamically via JavaScript */
}
</style> 