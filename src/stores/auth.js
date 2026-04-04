import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || '')

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUser(userData) {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function login(username, password) {
    // 模拟登录逻辑
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'student' && password === '123456') {
          const userData = { username: 'student', role: 'student', name: '张三' }
          const mockToken = 'mock-jwt-token-student'
          setToken(mockToken)
          setUser(userData)
          resolve(userData)
        } else if (username === 'teacher' && password === '123456') {
          const userData = { username: 'teacher', role: 'teacher', name: '王老师' }
          const mockToken = 'mock-jwt-token-teacher'
          setToken(mockToken)
          setUser(userData)
          resolve(userData)
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 500)
    })
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function switchRole(role) {
    if (role === 'student') {
      const userData = { username: 'student', role: 'student', name: '张三' }
      setUser(userData)
      setToken('mock-jwt-token-student')
    } else {
      const userData = { username: 'teacher', role: 'teacher', name: '王老师' }
      setUser(userData)
      setToken('mock-jwt-token-teacher')
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    userRole,
    login,
    logout,
    switchRole
  }
})
