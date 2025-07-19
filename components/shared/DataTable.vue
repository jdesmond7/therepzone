<template>
  <div class="space-y-4">
    <!-- Table Controls -->
    <div class="flex flex-col gap-4">
      <!-- Top row: Controls (Filters and Views) - Mobile first -->
      <div class="flex flex-col sm:hidden gap-4">
        <!-- Controls row -->
        <div class="flex items-center justify-between w-full">
          <!-- Filter Button (Left) -->
          <div class="relative">
            <button
              @click="toggleFilterMenu('mobile')"
              class="w-12 h-12 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg text-white hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all duration-200"
              title="Filtros"
              data-filter-button="mobile"
            >
              <UIcon name="i-heroicons-funnel" class="w-5 h-5" />
            </button>
            
            <!-- Filter Menu Dropdown -->
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
                  v-if="showFilterMenu"
                  class="fixed bg-slate-800/95 border border-slate-600 rounded-lg shadow-2xl backdrop-blur-sm z-50 filter-dropdown"
                  :style="filterDropdownStyle"
                >
                  <div class="p-4">
                    <h3 class="text-sm font-medium text-white mb-3">Filtros de columna</h3>
                    <div class="space-y-2">
                      <div
                        v-for="column in availableColumns"
                        :key="column.key"
                        class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer"
                        @click="toggleColumnFilter(column)"
                      >
                        <RoundedCheckbox
                          :model-value="isColumnFiltered(column.key)"
                          @update:model-value="toggleColumnFilter(column)"
                          @click.stop
                        />
                        <span class="text-sm text-slate-300">{{ column.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </Teleport>
          </div>
          
          <!-- View Toggle (Right) -->
          <div class="flex items-center gap-2">
            <button
              @click="viewMode = 'table'"
              :class="viewMode === 'table' ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-800 text-slate-400 border-slate-700'"
              class="w-12 h-12 flex items-center justify-center border rounded-lg hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all duration-200"
              title="Vista de tabla"
            >
              <UIcon name="i-heroicons-table-cells" :class="viewMode === 'table' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-400'" />
            </button>
            <button
              @click="viewMode = 'grid'"
              :class="viewMode === 'grid' ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-800 text-slate-400 border-slate-700'"
              class="w-12 h-12 flex items-center justify-center border rounded-lg hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all duration-200"
              title="Vista de cuadrícula"
            >
              <UIcon name="i-heroicons-squares-2x2" :class="viewMode === 'grid' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-400'" />
            </button>
          </div>
        </div>
      </div>

      <!-- Second row: Search - Mobile first -->
      <div class="flex flex-col sm:hidden gap-4">
        <!-- Search -->
        <div class="w-full">
          <AppInput
            v-model="searchTerm"
            placeholder="Buscar..."
            @input="handleSearch"
            class="w-full"
          >
            <template #prefix>
              <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-slate-400" />
            </template>
          </AppInput>
        </div>
      </div>

      <!-- Third row: Actions (Create button, etc.) - Mobile first -->
      <div class="flex flex-col sm:hidden gap-4">
        <!-- Actions -->
        <div class="w-full">
          <slot name="actions" />
        </div>
      </div>

      <!-- Desktop layout -->
      <div class="hidden sm:flex sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- Left side: Search -->
        <div class="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:gap-4 sm:flex-1">
          <!-- Search -->
          <div class="flex-1 max-w-sm">
            <AppInput
              v-model="searchTerm"
              placeholder="Buscar..."
              @input="handleSearch"
              class="w-full"
            >
              <template #prefix>
                <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-slate-400" />
              </template>
            </AppInput>
          </div>
        </div>

        <!-- Right side controls -->
        <div class="flex items-center gap-2">
          <!-- Create Button (Desktop only) -->
          <div class="hidden sm:block">
            <slot name="actions" />
          </div>
          
          <!-- Filter Button -->
          <div class="relative">
            <button
              @click="toggleFilterMenu('desktop')"
              class="w-12 h-12 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg text-white hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all duration-200"
              title="Filtros"
              data-filter-button="desktop"
            >
              <UIcon name="i-heroicons-funnel" class="w-5 h-5" />
            </button>
            
            <!-- Filter Menu Dropdown -->
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
                  v-if="showFilterMenu"
                  class="fixed bg-slate-800/95 border border-slate-600 rounded-lg shadow-2xl backdrop-blur-sm z-50 filter-dropdown"
                  :style="filterDropdownStyle"
                >
                  <div class="p-4">
                    <h3 class="text-sm font-medium text-white mb-3">Filtros de columna</h3>
                    <div class="space-y-2">
                      <div
                        v-for="column in availableColumns"
                        :key="column.key"
                        class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer"
                        @click="toggleColumnFilter(column)"
                      >
                        <RoundedCheckbox
                          :model-value="isColumnFiltered(column.key)"
                          @update:model-value="toggleColumnFilter(column)"
                          @click.stop
                        />
                        <span class="text-sm text-slate-300">{{ column.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </Teleport>
          </div>
          
          <!-- View Toggle -->
          <div class="flex items-center gap-2">
            <button
              @click="viewMode = 'table'"
              :class="viewMode === 'table' ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-800 text-slate-400 border-slate-700'"
              class="w-12 h-12 flex items-center justify-center border rounded-lg hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all duration-200"
              title="Vista de tabla"
            >
              <UIcon name="i-heroicons-table-cells" :class="viewMode === 'table' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-400'" />
            </button>
            <button
              @click="viewMode = 'grid'"
              :class="viewMode === 'grid' ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-800 text-slate-400 border-slate-700'"
              class="w-12 h-12 flex items-center justify-center border rounded-lg hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all duration-200"
              title="Vista de cuadrícula"
            >
              <UIcon name="i-heroicons-squares-2x2" :class="viewMode === 'grid' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-400'" />
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom row: Active Filters -->
      <div v-if="activeFilters.length > 0" class="flex flex-wrap gap-2">
        <div
          v-for="filter in activeFilters"
          :key="filter.columnKey"
          class="relative"
        >
          <div class="relative">
            <button
              @click="toggleFilterDropdown(filter.columnKey)"
              :data-filter="filter.columnKey"
              class="flex items-center gap-2 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1 cursor-pointer hover:bg-slate-600/50 transition-colors"
            >
              <span class="text-sm text-slate-300">{{ filter.columnLabel }}</span>
              <span v-if="filter.selectedOptions.length > 0" class="text-xs bg-slate-600 text-white rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                {{ filter.selectedOptions.length }}
              </span>
              <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-slate-400" />
            </button>
            
            <!-- Filter Options Dropdown -->
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
                  v-if="filter.showDropdown"
                  class="fixed bg-slate-800/95 border border-slate-600 rounded-lg shadow-2xl backdrop-blur-sm z-50"
                  :style="getFilterDropdownStyle(filter.columnKey)"
                  @click.stop
                >
                  <div class="p-4">
                    <div class="mb-3">
                      <h4 class="text-sm font-medium text-white">{{ filter.columnLabel }}</h4>
                    </div>
                    
                    <!-- Filter Options -->
                    <div class="space-y-2">
                      <div
                        v-for="option in getFilterOptions(filter.columnKey)"
                        :key="option.value"
                        class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer"
                        @click.stop="toggleFilterOption(filter.columnKey, option.value)"
                      >
                        <RoundedCheckbox
                          :model-value="isFilterOptionSelected(filter.columnKey, option.value)"
                          @update:model-value="toggleFilterOption(filter.columnKey, option.value)"
                          @click.stop
                          @mousedown.stop
                        />
                        <span class="text-sm text-slate-300">{{ option.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </Teleport>
          </div>
        </div>
      </div>
    </div>



    <!-- Table View -->
    <div v-if="viewMode === 'table'" class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
      <div :class="filteredData.length === 0 ? '' : 'overflow-x-auto'">
        <table class="w-full">
          <thead class="bg-slate-700/50">
            <tr>
              <th
                v-for="(column, index) in columns"
                :key="column.key"
                @click="handleSort(column.key)"
                :class="[
                  'px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600/50 transition-colors relative',
                  column.sortable !== false ? 'hover:text-white' : 'cursor-default'
                ]"
                :style="{ width: columnWidths[column.key] || 'auto' }"
              >
                <div class="flex items-center gap-2">
                  <span>{{ column.label }}</span>
                  <UIcon
                    v-if="column.sortable !== false"
                    :name="getSortIcon(column.key)"
                    class="w-4 h-4"
                    :class="sortKey === column.key ? 'text-orange-400' : 'text-slate-400'"
                  />
                </div>
                <!-- Resize handle -->
                <div
                  v-if="index < columns.length - 1"
                  @mousedown="startResize($event, column.key)"
                  class="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-orange-400 transition-colors"
                  :class="{ 'bg-orange-400': isResizing === column.key }"
                ></div>
              </th>

            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700">
            <tr
              v-for="(item, index) in paginatedData"
              :key="item.id || index"
              class="hover:bg-slate-700/30 transition-colors cursor-pointer"
              @click="$emit('view', item)"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                class="px-6 py-4 whitespace-nowrap text-sm"
              >
                <slot :name="`cell-${column.key}`" :item="item" :value="item[column.key]">
                  <span class="text-slate-300">{{ formatCellValue(item[column.key], column) }}</span>
                </slot>
              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredData.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📋</div>
        <h3 class="text-xl font-bold text-white mb-2">No se encontraron resultados</h3>
        <p class="text-slate-400">
          {{ searchTerm || activeFilters.length > 0 ? 'Prueba ajustando los filtros de búsqueda' : 'No hay datos disponibles' }}
        </p>
      </div>
    </div>

    <!-- Grid View -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <slot name="grid-item" :items="paginatedData">
        <!-- Default grid item template -->
        <div
          v-for="(item, index) in paginatedData"
          :key="item.id || index"
          class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 hover:border-orange-500/50 transition-colors"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-bold text-white">{{ item[columns[0]?.key] || 'Sin título' }}</h3>
          </div>
          <div class="space-y-2">
            <div
              v-for="column in columns.slice(1, 3)"
              :key="column.key"
              class="flex justify-between text-sm"
            >
              <span class="text-slate-400">{{ column.label }}:</span>
              <span class="text-slate-300">{{ formatCellValue(item[column.key], column) }}</span>
            </div>
          </div>
        </div>
      </slot>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination && totalPages > 1" class="flex items-center justify-between">
      <div class="text-sm text-slate-400">
        Mostrando {{ startIndex + 1 }} - {{ endIndex }} de {{ filteredData.length }} resultados
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          :class="currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700'"
          class="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 transition-colors"
        >
          <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
        </button>
        
        <div class="flex items-center gap-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            :class="page === currentPage ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
            class="px-3 py-2 border border-slate-700 rounded-lg transition-colors"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          :class="currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700'"
          class="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 transition-colors"
        >
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButtonSecondary from '~/components/shared/AppButtonSecondary.vue'
import RoundedCheckbox from '~/components/shared/RoundedCheckbox.vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
  type?: 'text' | 'number' | 'date' | 'badge' | 'image'
  format?: (value: any) => string
}

interface Props {
  data: any[]
  columns: Column[]
  itemsPerPage?: number
  showPagination?: boolean
  searchable?: boolean
  sortable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
  showPagination: true,
  searchable: true,
  sortable: true
})

const emit = defineEmits<{
  view: [item: any]
  search: [term: string]
  sort: [key: string, direction: 'asc' | 'desc']
}>()

// Reactive state
const searchTerm = ref('')
const currentPage = ref(1)
const sortKey = ref('')
const sortDirection = ref<'asc' | 'desc'>('asc')
const viewMode = ref<'table' | 'grid'>('table')

// Filter state
const showFilterMenu = ref(false)
const activeFilters = ref<Array<{
  columnKey: string
  columnLabel: string
  selectedOptions: string[]
  showDropdown: boolean
}>>([])

// Column resizing state
const columnWidths = ref<Record<string, string>>({})
const isResizing = ref<string | null>(null)
const resizeStartX = ref(0)
const resizeStartWidth = ref(0)

// Computed properties
const filteredData = computed(() => {
  let filtered = [...props.data]
  
  // Apply search filter
  if (searchTerm.value && props.searchable) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(item => {
      return props.columns.some(column => {
        const value = item[column.key]
        if (value == null) return false
        return String(value).toLowerCase().includes(search)
      })
    })
  }
  
  // Apply column filters
  activeFilters.value.forEach(filter => {
    if (filter.selectedOptions.length > 0) {
      filtered = filtered.filter(item => {
        const value = String(item[filter.columnKey] || '')
        
        // Special handling for muscle columns
        if (filter.columnKey === 'musculosPrimarios' || filter.columnKey === 'musculosSecundarios') {
          const muscles = value.split(',').map(muscle => 
            muscle.trim().charAt(0).toUpperCase() + muscle.trim().slice(1).toLowerCase()
          )
          // Check if any of the selected muscles are in this item's muscles
          return filter.selectedOptions.some(selectedMuscle => 
            muscles.includes(selectedMuscle)
          )
        }
        
        // Regular filtering for other columns
        return filter.selectedOptions.includes(value)
      })
    }
  })
  
  // Apply sorting
  if (sortKey.value && props.sortable) {
    filtered.sort((a, b) => {
      const aVal = a[sortKey.value]
      const bVal = b[sortKey.value]
      
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      
      let comparison = 0
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal)
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else {
        comparison = String(aVal).localeCompare(String(bVal))
      }
      
      return sortDirection.value === 'asc' ? comparison : -comparison
    })
  }
  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / props.itemsPerPage))

const startIndex = computed(() => (currentPage.value - 1) * props.itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + props.itemsPerPage, filteredData.value.length))

const paginatedData = computed(() => {
  if (!props.showPagination) return filteredData.value
  return filteredData.value.slice(startIndex.value, endIndex.value)
})

// Filter computed properties
const availableColumns = computed(() => props.columns)

const isColumnFiltered = (columnKey: string) => {
  return activeFilters.value.some(filter => filter.columnKey === columnKey)
}

const isFilterOptionSelected = (columnKey: string, optionValue: string) => {
  const filter = activeFilters.value.find(f => f.columnKey === columnKey)
  return filter?.selectedOptions.includes(optionValue) || false
}

const getFilterOptions = (columnKey: string) => {
  const column = props.columns.find(col => col.key === columnKey)
  if (!column) return []
  
  // Special handling for muscle columns - split into individual muscles
  if (columnKey === 'musculosPrimarios' || columnKey === 'musculosSecundarios') {
    const allMuscles = new Set<string>()
    
    // Collect all muscles from all exercises
    props.data.forEach(item => {
      const muscleValue = item[columnKey]
      if (muscleValue) {
        const muscles = String(muscleValue).split(',').map(muscle => 
          muscle.trim().charAt(0).toUpperCase() + muscle.trim().slice(1).toLowerCase()
        )
        muscles.forEach(muscle => allMuscles.add(muscle))
      }
    })
    
    // Return individual muscles as options
    return Array.from(allMuscles).sort().map(muscle => ({
      value: muscle,
      label: muscle,
      count: props.data.filter(item => {
        const muscleValue = item[columnKey]
        if (!muscleValue) return false
        const muscles = String(muscleValue).split(',').map(m => 
          m.trim().charAt(0).toUpperCase() + m.trim().slice(1).toLowerCase()
        )
        return muscles.includes(muscle)
      }).length
    }))
  }
  
  // Get unique values for other columns
  const uniqueValues = [...new Set(props.data.map(item => item[columnKey]).filter(val => val != null))]
  
  return uniqueValues.map(value => {
    let label = String(value)
    
    // Apply TitleCase for specific columns
    if (['dificultad', 'regionTrabajada', 'creado'].includes(columnKey)) {
      label = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()
    }
    
    return {
      value: String(value),
      label: label,
      count: props.data.filter(item => item[columnKey] === value).length
    }
  })
}

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  const halfVisible = Math.floor(maxVisible / 2)
  
  let start = Math.max(1, currentPage.value - halfVisible)
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const handleSearch = () => {
  currentPage.value = 1
  emit('search', searchTerm.value)
}

const handleSort = (key: string) => {
  if (!props.sortable) return
  
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
  
  emit('sort', key, sortDirection.value)
}

const getSortIcon = (key: string) => {
  if (sortKey.value !== key) return 'i-heroicons-arrows-up-down'
  return sortDirection.value === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down'
}

const formatCellValue = (value: any, column: Column) => {
  if (value == null || value === '') return '-'
  
  if (column.format) {
    return column.format(value)
  }
  
  switch (column.type) {
    case 'date':
      return new Date(value).toLocaleDateString('es-ES')
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : value
    case 'badge':
      return value
    default:
      return String(value)
  }
}

// Column resizing methods
const startResize = (event: MouseEvent, columnKey: string) => {
  event.preventDefault()
  isResizing.value = columnKey
  resizeStartX.value = event.clientX
  
  const th = event.target as HTMLElement
  const table = th.closest('table')
  if (table) {
    const thElement = th.closest('th') as HTMLElement
    if (thElement) {
      resizeStartWidth.value = thElement.offsetWidth
    }
  }
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (event: MouseEvent) => {
  if (!isResizing.value) return
  
  const deltaX = event.clientX - resizeStartX.value
  const newWidth = Math.max(100, resizeStartWidth.value + deltaX) // Minimum width of 100px
  
  columnWidths.value[isResizing.value] = `${newWidth}px`
}

const stopResize = () => {
  isResizing.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// Watch for data changes to reset pagination
watch(() => props.data, () => {
  currentPage.value = 1
}, { deep: true })

// Watch for search term changes
watch(searchTerm, () => {
  currentPage.value = 1
})

// Close filter menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    
    // Close main filter menu if clicking outside
    if (!target.closest('[data-filter-button]') && !target.closest('.filter-dropdown')) {
      showFilterMenu.value = false
    }
    
    // Close individual filter dropdowns if clicking outside
    // Don't close if clicking on the badge itself or inside the dropdown
    if (!target.closest('[data-filter]') && !target.closest('.filter-dropdown')) {
      activeFilters.value.forEach(filter => {
        filter.showDropdown = false
      })
    }
  })
})

// Filter methods
const filterDropdownStyle = ref('')

const toggleFilterMenu = (type: 'mobile' | 'desktop') => {
  // Close all filter dropdowns when opening the main filter menu
  activeFilters.value.forEach(filter => {
    filter.showDropdown = false
  })
  
  showFilterMenu.value = !showFilterMenu.value
  if (showFilterMenu.value) {
    nextTick(() => {
      updateFilterDropdownPosition(type)
    })
  }
}

const updateFilterDropdownPosition = (type: 'mobile' | 'desktop') => {
  const button = document.querySelector(`[data-filter-button="${type}"]`) as HTMLElement
  if (!button) return
  
  const rect = button.getBoundingClientRect()
  const margin = 24
  const width = 256 // 16rem = 256px
  const viewportWidth = window.innerWidth
  
  // Calculate left position with margin
  let left = rect.left
  
  // Check if dropdown would go beyond right edge
  if (left + width > viewportWidth - margin) {
    left = viewportWidth - width - margin
  }
  
  // Ensure minimum margin from left edge
  if (left < margin) {
    left = margin
  }
  
  const top = rect.bottom + 8
  
  filterDropdownStyle.value = `left: ${left}px; top: ${top}px; width: 16rem;`
}

const getFilterDropdownStyle = (columnKey: string) => {
  const button = document.querySelector(`[data-filter="${columnKey}"]`) as HTMLElement
  if (!button) return ''
  
  const rect = button.getBoundingClientRect()
  const margin = 24
  const width = 256 // 16rem = 256px
  const viewportWidth = window.innerWidth
  
  // Calculate left position with margin
  let left = rect.left
  
  // Check if dropdown would go beyond right edge
  if (left + width > viewportWidth - margin) {
    left = viewportWidth - width - margin
  }
  
  // Ensure minimum margin from left edge
  if (left < margin) {
    left = margin
  }
  
  const top = rect.bottom + 8
  
  return `left: ${left}px; top: ${top}px; width: 16rem;`
}

const closeFilterDropdown = (columnKey: string) => {
  const filter = activeFilters.value.find(f => f.columnKey === columnKey)
  if (filter) {
    filter.showDropdown = false
  }
}

const toggleColumnFilter = (column: Column) => {
  const existingFilter = activeFilters.value.find(f => f.columnKey === column.key)
  
  if (existingFilter) {
    // Remove filter
    activeFilters.value = activeFilters.value.filter(f => f.columnKey !== column.key)
  } else {
    // Add filter
    activeFilters.value.push({
      columnKey: column.key,
      columnLabel: column.label,
      selectedOptions: [],
      showDropdown: false
    })
  }
}

const toggleFilterDropdown = (columnKey: string) => {
  const filter = activeFilters.value.find(f => f.columnKey === columnKey)
  if (filter) {
    // Close all other dropdowns
    activeFilters.value.forEach(f => {
      if (f.columnKey !== columnKey) {
        f.showDropdown = false
      }
    })
    
    // Toggle current dropdown (open if closed, close if open)
    filter.showDropdown = !filter.showDropdown
  }
}



const toggleFilterOption = (columnKey: string, optionValue: string) => {
  const filter = activeFilters.value.find(f => f.columnKey === columnKey)
  if (filter) {
    const index = filter.selectedOptions.indexOf(optionValue)
    if (index > -1) {
      filter.selectedOptions.splice(index, 1)
    } else {
      filter.selectedOptions.push(optionValue)
    }
  }
}

const removeFilter = (columnKey: string) => {
  activeFilters.value = activeFilters.value.filter(f => f.columnKey !== columnKey)
}



console.log('[DATATABLE DATA]', JSON.parse(JSON.stringify(props.data)))
</script>

<style scoped>
/* Prevent text selection during resize */
.cursor-col-resize {
  user-select: none;
}

/* Smooth transitions for column width changes */
th {
  transition: width 0.1s ease;
}

/* Resize handle styling */
.cursor-col-resize:hover {
  background-color: rgb(251 146 60); /* orange-400 */
}

.cursor-col-resize:active {
  background-color: rgb(249 115 22); /* orange-500 */
}
</style> 