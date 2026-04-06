import router from '@/router'
import { useAuthStore, useMenuStore } from '@/stores/index.js'
import { setupDynamicRoutes } from '@/utils/router.js'
import NProgress from '@/utils/nprogress'

export function setupPermission() {
  // 白名单路由
  const whiteList = ['/login']

  router.beforeEach(async (to, from) => {
    NProgress.start() // 开始进度条

    const authStore = useAuthStore()
    const menuStore = useMenuStore()

    //判断是否登录
    const isLogin = authStore.token && authStore.userRole

    if (isLogin) {
      if (to.path === '/login') {
        authStore.logout()
        return '/login'
      } else {
        // 判断路由是否加载完成
        if (menuStore.isRoutesLoaded) {
          if (to.matched.length === 0) {
            // 路由未匹配，跳转到404
            return '/404'
          } else {
            return true
          }
        } else {
          // 动态路由加载
          try {
            const success = await setupDynamicRoutes(router)
            return success ? { ...to, replace: true } : '/login'
          } catch (error) {
            // 路由加载失败，重置 token 并重定向到登录页
            userStore.logout()
            return '/login'
          }
        }
      }
    } else {
      // 未登录，判断是否在白名单中
      if (whiteList.includes(to.path)) {
        return true
      } else {
        // 跳转到登录页
        return '/login'
      }
    }
  })

  router.afterEach(() => {
    NProgress.done()
  })
}
