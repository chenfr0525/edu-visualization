<script setup>
import { computed } from 'vue'
import teacherLayout from './components/teacherLayout.vue'
import studentLayout from './components/studentLayout.vue'

// 假设从 store 或 props 获取角色
const userRole = computed(() => {
  // 这里可以从 Pinia/Vuex 获取，或者从 localStorage 获取
  return 'teacher' // 示例：'teacher' 或 'student'
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