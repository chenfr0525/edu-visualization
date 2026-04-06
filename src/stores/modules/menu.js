import { defineStore } from 'pinia'
import { ref } from 'vue'
import { transformRoutes } from '@/utils/router.js'
import { authApi } from '@/api/index.js'

//菜单模块
export const useMenuStore = defineStore('menu', () => {
  // 原始路由数据（转换前的后端返回数据）
  const rawRoutes = ref([])

  // 转换后的动态路由配置
  const dynamicRoutes = ref([])

  // 路由是否加载完成
  const isRoutesLoaded = ref(false)

  //生成动态路由
  const generateRoutes = async () => {
    try {
      // 从API获取菜单数据
      const res = await authApi.getMenus()
      rawRoutes.value = res.data
      // 转换路由格式
      dynamicRoutes.value = transformRoutes(rawRoutes.value)
      isRoutesLoaded.value = true
      return dynamicRoutes.value
    } catch (err) {
      isRoutesLoaded.value = true
      console.error('路由获取失败：', err)
    }
  }

  // 清除路由
  const clearRoutes = () => {
    rawRoutes.value = []
    dynamicRoutes.value = []
    isRoutesLoaded.value = false // 清除路由时重置状态
  }

  return {
    rawRoutes,
    dynamicRoutes,
    isRoutesLoaded,
    generateRoutes,
    clearRoutes,
  }
})
