import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

export const useAppStore = defineStore('app', () => {
  // 侧边栏状态
  const sidebarOpened = ref(true)
  const menuList = ref([])
  function toggleSidebar() {
    sidebarOpened.value = !sidebarOpened.value
  }
  function getMenuList(role) {
    return menuList.value
  }
  // 响应式窗口大小
  const { width } = useWindowSize()
  const isMobile = computed(() => width.value < 768)
  const isTablet = computed(() => width.value >= 768 && width.value < 1024)

  return {
    sidebarOpened,
    toggleSidebar,
    menuList,
    getMenuList,
    isMobile,
    isTablet,
  }
})
