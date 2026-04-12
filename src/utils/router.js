import { useAuthStore, useMenuStore } from '@/stores/index.js'

const modules = import.meta.glob('../views/**/*.vue')

/**
 * 将后端菜单数据转换为前端路由格式
 * @param {Array} backendRoutes - 后端返回的菜单数据
 * @param {string} basePath - 基础路径
 * @returns {Array} 转换后的路由配置
 */
export function transformRoutes(backendRoutes, basePath = '') {
  if (!backendRoutes || !Array.isArray(backendRoutes)) return []
  const authStore = useAuthStore()
  return backendRoutes.map((menu) => {
    // 处理路径：移除重复的斜杠
    let fullPath = menu.path

    if (basePath) {
      // 拼接基础路径和当前路径
      const cleanBasePath = basePath.replace(/\/$/, '')
      const cleanPath = menu.path.replace(/^\//, '')
      fullPath = `${cleanBasePath}/${cleanPath}`
    }

    // 处理根路径
    if (fullPath === '//') fullPath = '/'

    // 判断是否是父路由（有子菜单）
    const isParentRoute = menu.children && menu.children.length > 0

    if (isParentRoute) {
      return {
        path: fullPath,
        name: menu.name || fullPath.replace(/\//g, '-').substring(1),
        meta: {
          title: menu.meta?.title || menu.name,
          icon: menu.icon,
          keepAlive: menu.meta?.keepAlive || false,
          auth: menu.auth || [],
          ...menu.meta,
        },
        component:
          modules[`../views${fullPath}/index.vue`] ||
          modules[`../views/${menu.component}`] ||
          modules[`../views/${authStore.userRole}/${fullPath}/index.vue`] ||
          (isParentRoute
            ? () => import('@/views/emptyRouter/index.vue')
            : () => import('@/views/error/404.vue')),
        children: menu.children ? transformRoutes(menu.children, fullPath) : [],
      }
    } else {
      return {
        path: fullPath,
        name: menu.name || fullPath.replace(/\//g, '-').substring(1),
        meta: {
          title: menu.meta?.title || menu.name,
          icon: menu.icon,
          keepAlive: menu.meta?.keepAlive || false,
          auth: menu.auth || [],
          hidden: menu.hidden || false,
          ...menu.meta,
        },
        component:
          modules[`../views${fullPath}/index.vue`] ||
          modules[`../views/${authStore.userRole}/${fullPath}/index.vue`] ||
          (isParentRoute
            ? () => import('@/views/emptyRouter/index.vue')
            : () => import('@/views/error/404.vue')),
      }
    }
  })
}

//动态路由添加函数
export async function setupDynamicRoutes(router) {
  const menuStore = useMenuStore()
  const authStore = useAuthStore()

  try {
    // 生成动态路由
    await menuStore.generateRoutes(authStore.userRole)
    // 清除可能存在的旧路由
    // const reservedRoutes = ['login', '404']

    // router.getRoutes().forEach((route) => {
    //   if (!reservedRoutes.includes(route.name)) {
    //     router.removeRoute(route.name)
    //   }
    // })

    menuStore.dynamicRoutes.forEach((newRoute) => {
      if (!router.getRoutes().some((r) => r.path === newRoute.path)) {
        router.addRoute('layout', newRoute) // 添加到layout路由下作为子路由
      }
    })
    // 添加404页面捕获
    router.addRoute({ path: '/:pathMatch(.*)', redirect: '/404', hidden: true })
    return true
  } catch (error) {
    console.error('动态路由加载错误', error)
    return false
  }
}
