<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  options: {
    type: Object,
    required: true
  },
  height: {
    type: String,
    default: '300px'
  },
  width: {
    type: String,
    default: '100%'
  }
})

const chartRef = ref(null)
let chartInstance = null

const emit = defineEmits(['click'])

const initChart = () => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  // 如果 options 中有 renderer: 'svg'，则使用 SVG 渲染
  chartInstance = echarts.init(chartRef.value, null, {
    renderer: props.options.renderer || 'canvas'
  })
  chartInstance.setOption(props.options)

  // 绑定点击事件
  chartInstance.on('click', (params) => {
    emit('click', params)
  })
}

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
  }
})

watch(() => props.options, (newOptions) => {
  if (chartInstance) {
    chartInstance.setOption(newOptions)
  }
}, { deep: true })

defineExpose({
  getChartInstance: () => chartInstance
})
</script>

<template>
  <div ref="chartRef" :style="{ height, width }"></div>
</template>

<style scoped></style>
