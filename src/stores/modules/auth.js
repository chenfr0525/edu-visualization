import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import { useMenuStore } from './menu'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref('')
    const user = ref(null)
    const userRole = ref('')

    const isAuthenticated = computed(() => !!token.value)
    const userName = computed(() => user.value?.name || '')
    const userId = computed(() => user.value?.id || null)
    // 登录
    async function login(data) {
      try {
        const res = await authApi.login(data)
        const { token: newToken, user } = res.data
        token.value = newToken
        user.value = user
        console.log(res.data, 'user', user.value)
        userRole.value = user?.role || ''
        return user
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
    },
  },
)
