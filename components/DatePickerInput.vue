<template>
  <div class="relative">
    <label v-if="label" class="block text-sm font-bold text-white mb-2">{{ label }}</label>
    <div class="relative">
      <input
        :id="id"
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        autocomplete="off"
        @input="formatBirthDate"
        @keydown="handleKeyDown"
        @focus="showDatePicker = true"
        class="w-full h-12 pl-4 pr-12 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
        maxlength="10"
      />
      <button
        type="button"
        @click="toggleDatePicker"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors"
      >
        <slot name="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 21h15a.75.75 0 00.75-.75V6.75A2.25 2.25 0 0018 4.5H6A2.25 2.25 0 003.75 6.75v13.5c0 .414.336.75.75.75z" />
          </svg>
        </slot>
      </button>
    </div>
    <div v-if="showDatePicker" ref="datePickerRef" class="absolute z-50 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-4 w-[420px]">
      <div class="flex items-center justify-between mb-4">
        <button type="button" @click="changeMonth(-1)" class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div class="flex gap-2 justify-center">
          <div class="w-[160px]">
            <CustomSelect v-model="selectedMonth" :options="monthOptions" placeholder="Mes" @update:model-value="handleMonthChange" />
          </div>
          <div class="w-[120px]">
            <CustomSelect v-model="selectedYear" :options="yearOptions" placeholder="Año" @update:model-value="handleYearChange" />
          </div>
        </div>
        <button type="button" @click="changeMonth(1)" class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div v-for="day in weekDaysShort" :key="day" class="text-xs font-medium text-slate-400 text-center py-2">{{ day }}</div>
      </div>
      <div class="grid grid-cols-7 gap-1">
        <button v-for="date in calendarDates" :key="`${date.month}-${date.day}`" type="button" @click="selectDate(date)"
          :class="[
            'w-8 h-8 text-sm rounded-lg transition-colors',
            date.isCurrentMonth ? 'text-white hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-700',
            date.isSelected ? 'bg-orange-600 text-white hover:bg-orange-700' : '',
            date.isToday && !date.isSelected ? 'bg-slate-700 text-orange-400 font-bold' : ''
          ]"
        >{{ date.day }}</button>
      </div>
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
const emit = defineEmits(['update:modelValue'])

const inputValue = ref(props.modelValue)
watch(() => props.modelValue, v => inputValue.value = v)
watch(inputValue, v => emit('update:modelValue', v))

const showDatePicker = ref(false)
const selectedMonth = ref(new Date().getMonth().toString())
const selectedYear = ref(new Date().getFullYear().toString())
const datePickerRef = ref<HTMLElement>()

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
    dates.push({
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isCurrentMonth,
      isToday,
      isSelected,
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
const toggleDatePicker = () => {
  showDatePicker.value = !showDatePicker.value
  if (showDatePicker.value) syncDatePickerWithInput()
}
const closeDatePicker = () => { showDatePicker.value = false }
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
const handleMonthChange = (newMonth: string) => { selectedMonth.value = newMonth }
const handleYearChange = (newYear: string) => { selectedYear.value = newYear }
const selectDate = (dateInfo: any) => {
  const date = new Date(dateInfo.year, dateInfo.month, dateInfo.day)
  inputValue.value = formatDateForDisplay(date)
  selectedMonth.value = dateInfo.month.toString()
  selectedYear.value = dateInfo.year.toString()
  showDatePicker.value = false
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
    const inputElement = document.getElementById(props.id)
    // Si el click no es ni en el input ni en el datepicker, cierra
    if (!datePickerRef.value.contains(target) && !inputElement?.contains(target)) {
      showDatePicker.value = false
    }
  }
}
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script> 