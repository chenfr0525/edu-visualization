<script setup>
import { computed } from 'vue'
import teacherLayout from './components/teacherLayout.vue'
import studentLayout from './components/studentLayout.vue'
import { useAuthStore, useMenuStore } from '@/stores/index.js'

const authStore = useAuthStore()
const menuStore = useMenuStore()

const userRole = computed(() => {
  return authStore.userRole
})

const menuList = computed(() => {
  return menuStore.rawRoutes.map((menu) => ({ name: menu.name, path: menu.path.startsWith('/') ? menu.path : `/${menu.path}`, icon: menu.icon }))
})

const currentLayout = computed(() => {
  const layoutMap = {
    teacher: teacherLayout,
    student: studentLayout
  }
  return layoutMap[userRole.value] || teacherLayout // 默认布局
})
</script>

<template>
  <component :is="currentLayout" :menuList="menuList" />
</template>