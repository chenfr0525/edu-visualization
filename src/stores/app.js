import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDark, useToggle, useWindowSize } from '@vueuse/core'

export const useAppStore = defineStore('app', () => {
  // 暗黑模式支持
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: 'light'
  })
  const toggleDark = useToggle(isDark)

  // 侧边栏状态
  const sidebarOpened = ref(true)
  function toggleSidebar() {
    sidebarOpened.value = !sidebarOpened.value
  }

  // 响应式窗口大小
  const { width } = useWindowSize()
  const isMobile = computed(() => width.value < 768)
  const isTablet = computed(() => width.value >= 768 && width.value < 1024)

  // 全局筛选状态 (时间范围、年级、学科、班级)
  const globalFilter = ref({
    timeRange: [],
    grade: 'all',
    subject: 'all',
    class: 'all'
  })

  function setFilter(newFilter) {
    globalFilter.value = { ...globalFilter.value, ...newFilter }
  }

  return {
    isDark,
    toggleDark,
    sidebarOpened,
    toggleSidebar,
    isMobile,
    isTablet,
    globalFilter,
    setFilter
  }
})
