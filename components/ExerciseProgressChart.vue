<template>
  <div class="relative">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ProgressData {
  date: string
  value: number
}

interface Props {
  data: ProgressData[]
  metric: 'weight' | 'time' | 'reps'
  period: 'weekly' | 'monthly' | 'yearly'
}

const props = defineProps<Props>()

const chartCanvas = ref<HTMLCanvasElement>()

// Chart configuration
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#ea580c',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        title: (context: any) => {
          const dataIndex = context[0].dataIndex
          return new Date(props.data[dataIndex].date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        },
        label: (context: any) => {
          const value = context.parsed.y
          const metric = props.metric
          
          if (metric === 'weight') {
            return `${value} kg`
          } else if (metric === 'time') {
            return `${value} seg`
          } else {
            return `${value} reps`
          }
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(148, 163, 184, 0.1)',
        drawBorder: false
      },
      ticks: {
        color: '#94a3b8',
        font: {
          size: 12
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(148, 163, 184, 0.1)',
        drawBorder: false
      },
      ticks: {
        color: '#94a3b8',
        font: {
          size: 12
        }
      }
    }
  },
  elements: {
    point: {
      backgroundColor: '#ea580c',
      borderColor: '#ffffff',
      borderWidth: 2,
      radius: 6,
      hoverRadius: 8
    },
    line: {
      borderColor: '#ea580c',
      borderWidth: 3,
      tension: 0.4
    }
  }
}))

const chartData = computed(() => ({
  labels: props.data.map(item => 
    new Date(item.date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    })
  ),
  datasets: [
    {
      label: getMetricLabel(props.metric),
      data: props.data.map(item => item.value),
      fill: true,
      backgroundColor: 'rgba(234, 88, 12, 0.1)',
      borderColor: '#ea580c',
      borderWidth: 3,
      pointBackgroundColor: '#ea580c',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      tension: 0.4
    }
  ]
}))

const getMetricLabel = (metric: string) => {
  switch (metric) {
    case 'weight':
      return 'Peso máximo levantado'
    case 'time':
      return 'Menor tiempo del set'
    case 'reps':
      return 'Máximas repeticiones'
    default:
      return 'Progreso'
  }
}
</script>

<style scoped>
/* Custom styles for the chart container */
</style> 