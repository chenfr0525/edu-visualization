<script setup>
import { computed } from 'vue'
import teacherLayout from './components/teacherLayout.vue'
import studentLayout from './components/studentLayout.vue'
import { useAuthStore } from '@/stores/index.js'

const authStore = useAuthStore()

const userRole = computed(() => {
  return authStore.userRole
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
  <component :is="currentLayout" />
</template>