<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { nextTick } from 'vue'

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
    if (!chartRef.value) {
    console.warn('chartRef is not ready')
    return
  }
  try {
    // 销毁旧实例
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  // 创建新实例
    chartInstance = echarts.init(chartRef.value, null, {
      renderer: props.options.renderer || 'canvas'
    })
    
    // 验证 options 是否有效
    if (!props.options || Object.keys(props.options).length === 0) {
      console.warn('options is empty')
      return
    }
    
    chartInstance.setOption(props.options, true)

  // 绑定点击事件
  chartInstance.on('click', (params) => {
    emit('click', params)
  })
  } catch (error) {
    console.error('ECharts 初始化失败:', error)
  }
}

const handleResize = () => {
  if (chartInstance && !chartInstance.isDisposed()) {
    chartInstance.resize()
  }
}

// 监听 options 变化
watch(() => props.options, (newOptions, oldOptions) => {
  if (!chartInstance || chartInstance.isDisposed()) {
    initChart()
    return
  }
  
  if (newOptions && Object.keys(newOptions).length > 0) {
    try {
      chartInstance.setOption(newOptions, true)
    } catch (error) {
      console.error('ECharts 更新失败:', error)
      // 如果更新失败，重新初始化
      initChart()
    }
  }
}, { deep: true, immediate: false })


onMounted(() => {
  nextTick(() => {
    initChart()
  })
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance && !chartInstance.isDisposed()) {
    chartInstance.dispose()
    chartInstance = null
  }
})

watch(() => props.options, (newOptions) => {
  if (chartInstance) {
    chartInstance.setOption(newOptions)
  }
}, { deep: true })

defineExpose({
  getChartInstance: () => chartInstance,
  resize: handleResize
})
</script>

<template>
  <div ref="chartRef" :style="{ height, width }"></div>
</template>

<style scoped></style>
