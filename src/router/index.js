import { useAuthStore } from '@/stores'
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
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => {
          const authStore = useAuthStore()
          return authStore.userRole === 'TEACHER'
            ? import('@/views/teacher/dashboard/index.vue')
            : import('@/views/student/dashboard/index.vue')
        },
        icon: 'Monitor',
        meta: { title: '控制台', keepAlive: true },
      },
      {
        name: 'knowledge-mastery',
        path: 'knowledge-mastery',
        component: () => import('@/views/student/knowledge-mastery/index.vue'),
        icon: 'Star',
        meta: { title: '知识点掌握', roles: ['student'] },
      },
      {
        name: 'course-overview',
        path: 'course-overview',
        component: () => import('@/views/student/course-overview/index.vue'),
        icon: 'Memo',
        meta: { title: '课程概览', roles: ['student'] },
      },
      {
        name: 'homework-tracking',
        path: 'homework-tracking',
        component: () => import('@/views/student/homework-tracking/index.vue'),
        icon: 'Files',
        meta: { title: '作业跟踪', roles: ['student'] },
      },
      {
        name: 'grade-analysis',
        path: 'grade-analysis',
        component: () => import('@/views/student/grade-analysis/index.vue'),
        icon: 'TrendCharts',
        meta: { title: '成绩分析', roles: ['student'] },
      },
      {
        name: 'personal-center',
        path: '/personal-center',
        component: () => import('@/views/personal-center/index.vue'),
        icon: 'User',
        meta: { title: '个人中心' },
      },
      {
        name: 'user-manage',
        path: 'user-manage',
        component: () => import('@/views/teacher/user-manage/index.vue'),
        icon: 'User',
        meta: { title: '学生管理', roles: ['teacher'] },
      },
      {
        name: 'work-manage',
        path: 'work-manage',
        component: () => import('@/views/teacher/work-manage/index.vue'),
        icon: 'MessageBox',
        meta: { title: '作业管理', roles: ['teacher'] },
      },
      {
        name: 'exam-manage',
        path: 'exam-manage',
        component: () => import('@/views/teacher/exam-manage/index.vue'),
        icon: 'Calendar',
        meta: { title: '考试管理', roles: ['teacher'] },
      },
      {
        name: 'course-analysis',
        path: 'course-analysis',
        component: () => import('@/views/teacher/course-analysis/index.vue'),
        icon: 'Memo',
        meta: { title: '课程分析', roles: ['teacher'] },
      },
      {
        name: 'class-grade',
        path: 'class-grade',
        component: () => import('@/views/teacher/class-grade/index.vue'),
        icon: 'Star',
        meta: { title: '班级成绩', roles: ['teacher'] },
      },
      {
        name: 'activity-monitor',
        path: 'activity-monitor',
        component: () => import('@/views/teacher/activity-monitor/index.vue'),
        icon: 'Monitor',
        meta: { title: '活跃度监控', roles: ['teacher'] },
      },
    ],
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
