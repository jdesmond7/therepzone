<template>
  <div class="space-y-4">
    <!-- Table Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Left side: Search and Filters -->
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
        
        <!-- Additional Filters Slot -->
        <slot name="filters" />
      </div>

      <!-- Right side controls -->
      <div class="flex items-center gap-2">
        <!-- Additional Actions Slot -->
        <slot name="actions" />
        
        <!-- View Toggle -->
        <AppButtonSecondary
          @click="viewMode = 'table'"
          :class="viewMode === 'table' ? '!bg-slate-700 !text-white !border-slate-600' : ''"
          class="!w-12 !h-12 !p-0 !min-w-12 !min-h-12"
          title="Vista de tabla"
        >
          <UIcon name="i-heroicons-table-cells" class="w-5 h-5" />
        </AppButtonSecondary>
        <AppButtonSecondary
          @click="viewMode = 'grid'"
          :class="viewMode === 'grid' ? '!bg-slate-700 !text-white !border-slate-600' : ''"
          class="!w-12 !h-12 !p-0 !min-w-12 !min-h-12"
          title="Vista de cuadrícula"
        >
          <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5" />
        </AppButtonSecondary>
      </div>
    </div>

    <!-- Table View -->
    <div v-if="viewMode === 'table'" class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
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
          {{ searchTerm ? 'Prueba ajustando los filtros de búsqueda' : 'No hay datos disponibles' }}
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
import AppButtonSecondary from '~/components/AppButtonSecondary.vue'

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