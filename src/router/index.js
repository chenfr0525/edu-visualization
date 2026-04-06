import { createRouter, createWebHistory } from 'vue-router'

// 基础路由配置
const baseRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false, title: '登录' },
  },
  {
    path: '/',
    name: 'layout',
    component: () => import('@/layout/index.vue'),
    meta: { requiresAuth: false, title: '布局' },
    redirect: '/dashboard',
    children: [],
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { requiresAuth: false, title: '404' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: baseRoutes,
})

// 导出路由初始化方法
export function setupRouter(app) {
  app.use(router)
  return router
}

export default router
