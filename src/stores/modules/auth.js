import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import { useMenuStore } from './menu'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref('')
    const user = ref(null)

    const isAuthenticated = computed(() => !!token.value)
    const userRole = computed(() => user.value?.role || '')
    const userName = computed(() => user.value?.name || '')
    const userId = computed(() => user.value?.id || null)

    // 登录
    async function login(data) {
      try {
        const res = await authApi.login(data)
        const { token: newToken, userInfo } = res.data

        token.value = newToken
        user.value = userInfo

        return userInfo
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    }

    // 注册
    async function register(data) {
      try {
        const res = await authApi.register(data)
        return res.data
      } catch (error) {
        console.error('注册失败:', error)
        throw error
      }
    }

    // 登出
    function logout() {
      const menuStore = useMenuStore()
      token.value = ''
      user.value = null
      menuStore.clearRoutes()
    }

    return {
      token,
      user,
      isAuthenticated,
      userRole,
      userName,
      userId,
      login,
      register,
      logout,
    }
  },
  {
    persist: {
      key: 'edu_auth', // 存储的 key 名称
      paths: ['token', 'user'], // 需要持久化的字段
    },
  },
)
