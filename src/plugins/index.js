import pinia from '@/stores'
import { setupRouter } from '@/router'
import { setupPermission } from './permission'

export default {
  install(app) {
    // 1. 初始化Pinia
    app.use(pinia)

    // 2. 初始化路由
    setupRouter(app)

    // 3. 路由守卫 (需要在路由初始化后设置)
    setupPermission()
  },
}
