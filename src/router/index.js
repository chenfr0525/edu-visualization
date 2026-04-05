import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/index.js'

const baseRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false, title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => {
          const authStore = useAuthStore()
          return authStore.userRole === 'teacher'
            ? import('@/views/teacher/dashboard/index.vue')
            : import('@/views/student/dashboard/index.vue')
        },
        meta: { title: '控制台' },
      },
      {
        path: 'knowledge-mastery',
        name: 'KnowledgeMastery',
        component: () => import('@/views/student/knowledge-mastery/index.vue'),
        meta: { title: '知识点掌握', roles: ['student'] },
      },
      {
        path: 'course-overview',
        name: 'CourseOverview',
        component: () => import('@/views/student/course-overview/index.vue'),
        meta: { title: '课程概览', roles: ['student'] },
      },
      {
        path: 'homework-tracking',
        name: 'HomeworkTracking',
        component: () => import('@/views/student/homework-tracking/index.vue'),
        meta: { title: '作业跟踪', roles: ['student'] },
      },
      {
        path: 'grade-analysis',
        name: 'GradeAnalysis',
        component: () => import('@/views/student/grade-analysis/index.vue'),
        meta: { title: '成绩分析', roles: ['student'] },
      },
      {
        path: 'personal-center',
        name: 'PersonalCenter',
        component: () => import('@/views/personal-center/index.vue'),
        meta: { title: '个人中心', roles: ['student', 'teacher'] },
      },
      {
        path: 'course-analysis',
        name: 'CourseAnalysis',
        component: () => import('@/views/teacher/course-analysis/index.vue'),
        meta: { title: '课程分析', roles: ['teacher'] },
      },
      {
        path: 'class-grade',
        name: 'ClassGrade',
        component: () => import('@/views/teacher/class-grade/index.vue'),
        meta: { title: '班级成绩', roles: ['teacher'] },
      },
      {
        path: 'activity-monitor',
        name: 'ActivityMonitor',
        component: () => import('@/views/teacher/activity-monitor/index.vue'),
        meta: { title: '活跃度监控', roles: ['teacher'] },
      },
      {
        path: 'exam-manage',
        name: 'ExamManage',
        component: () => import('@/views/teacher/exam-manage/index.vue'),
        meta: { title: '考试管理', roles: ['teacher'] },
      },
      {
        path: 'user-manage',
        name: 'UserManage',
        component: () => import('@/views/teacher/user-manage/index.vue'),
        meta: { title: '学生管理', roles: ['teacher'] },
      },
      {
        path: 'work-manage',
        name: 'WorkManage',
        component: () => import('@/views/teacher/work-manage/index.vue'),
        meta: { title: '作业管理', roles: ['teacher'] },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: baseRoutes,
})

// router.beforeEach((to, from, next) => {
//   const authStore = useAuthStore()

//   if (to.meta.requiresAuth && !authStore.isAuthenticated) {
//     next('/login')
//   } else if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
//     next('/')
//   } else {
//     next()
//   }
// })

export default router
