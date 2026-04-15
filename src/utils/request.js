import axios from 'axios'
import { useAuthStore } from '@/stores/index.js'
import router from '@/router'
import { ElMessage } from 'element-plus'
import { USE_MOCK, API_BASE_URL } from '@/config/env'

const request = axios.create({
  baseURL: USE_MOCK ? '/api' : API_BASE_URL,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
})

//请求拦截器
request.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (err) => Promise.reject(err),
)

//响应拦截器
request.interceptors.response.use(
  (res) => {
    const authStore = useAuthStore()
    if (res.data.code === 200) {
      return res.data
    }
    //else if (res.data.code === 'A0231') {
    //   router.push('/403')
    //   ElMessage.error(res.data.msg)
    // }
    //处理业务失败，给错误提示，抛出错误
    ElMessage.error(res.data.message)
    return Promise.reject(new Error(res.data.message || '操作失败'))
  },
  (err) => {
    const authStore = useAuthStore()
    if (err.response && err.response.status) {
      if (err.response.status === 403) {
        authStore.logout()
        router.push('/login')
        ElMessage.error(err.response?.msg || '登录过期，请重新登录')
      } else {
        ElMessage.error(err.response?.data?.message || '请求失败')
      }
    }
    return Promise.reject(err)
  },
)

export default request
