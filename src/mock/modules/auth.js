import Mock from 'mockjs'
import { success, error, generateAvatar } from '../utils'

// 模拟用户数据存储
const users = [
  {
    id: 1,
    username: 'student',
    password: '123456',
    name: '张小明',
    role: 'student',
    studentId: '20213733',
    className: '高三(1)班',
    grade: '高三',
    email: 'zhangxiaoming@edu.com',
    phone: '13812341234',
    avatar: generateAvatar('张小明'),
    createdAt: '2024-09-01T00:00:00.000Z',
  },
  {
    id: 2,
    username: 'teacher1',
    password: '123456',
    name: '李华',
    role: 'teacher',
    teacherId: 'T2024001',
    department: '数学教研组',
    title: '高级教师',
    email: 'lihua@edu.com',
    phone: '13912341234',
    avatar: generateAvatar('李华'),
    createdAt: '2023-08-15T00:00:00.000Z',
  },
  {
    id: 3,
    username: 'ruby',
    password: '123456',
    name: 'Ruby Chen',
    role: 'student',
    studentId: '20213734',
    className: '高三(1)班',
    grade: '高三',
    email: 'ruby@edu.com',
    phone: '13812341235',
    avatar: generateAvatar('Ruby Chen'),
    createdAt: '2024-09-01T00:00:00.000Z',
  },
]

//菜单
const menuConfig = {
  student: [
    {
      name: '个人驾驶舱',
      path: 'dashboard',
      component: 'student/dashboard/index.vue',
      icon: 'Monitor',
      meta: { title: '控制台', keepAlive: true },
    },
    {
      name: '知识点掌握',
      path: 'knowledge-mastery',
      component: 'student/knowledge-mastery/index.vue',
      icon: 'Star',
      meta: { title: '知识点掌握' },
    },
    {
      name: '课程概览',
      path: 'course-overview',
      component: 'student/course-overview/index.vue',
      icon: 'Memo',
      meta: { title: '课程概览' },
    },
    {
      name: '作业跟踪',
      path: 'homework-tracking',
      component: 'student/homework-tracking/index.vue',
      icon: 'Files',
      meta: { title: '作业跟踪' },
    },
    {
      name: '成绩分析',
      path: 'grade-analysis',
      component: 'student/grade-analysis/index.vue',
      icon: 'TrendCharts',
      meta: { title: '成绩分析' },
    },
    {
      name: '个人中心',
      path: '/personal-center',
      component: 'personal-center/index.vue',
      icon: 'User',
      meta: { title: '个人中心' },
    },
  ],
  teacher: [
    {
      name: '教学看板',
      path: 'dashboard',
      component: 'teacher/dashboard/index.vue',
      icon: 'Monitor',
      meta: { title: '控制台' },
    },
    {
      name: '学生管理',
      path: 'user-manage',
      component: 'teacher/user-manage/index.vue',
      icon: 'User',
      meta: { title: '学生管理' },
    },
    {
      name: '作业管理',
      path: 'work-manage',
      component: 'teacher/work-manage/index.vue',
      icon: 'MessageBox',
      meta: { title: '作业管理' },
    },
    {
      name: '考试管理',
      path: 'exam-manage',
      component: 'teacher/exam-manage/index.vue',
      icon: 'Calendar',
      meta: { title: '考试管理' },
    },
    {
      name: '课程分析',
      path: 'course-analysis',
      component: 'teacher/course-analysis/index.vue',
      icon: 'Memo',
      meta: { title: '课程分析' },
    },
    {
      name: '班级成绩',
      path: 'class-grade',
      component: 'teacher/class-grade/index.vue',
      icon: 'Star',
      meta: { title: '班级成绩' },
    },
    {
      name: '活跃度监控',
      path: 'activity-monitor',
      component: 'teacher/activity-monitor/index.vue',
      icon: 'Monitor',
      meta: { title: '活跃度监控' },
    },
    {
      name: '个人中心',
      path: '/personal-center',
      component: 'personal-center/index.vue',
      icon: 'User',
      meta: { title: '个人中心' },
    },
  ],
}

// 存储 token
const tokens = new Map()

export default function mockAuth() {
  // 登录
  Mock.mock(/\/api\/auth\/login/, 'post', (options) => {
    const body = JSON.parse(options.body)
    const { username, password, role } = body

    const user = users.find(
      (u) => u.username === username && u.password === password && u.role === role,
    )
    if (!user) {
      return error('用户名或密码错误', 401)
    }

    const token = Mock.mock('@guid')

    tokens.set(token, {
      userId: user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user

    return success({
      token,
      expiresIn: 7 * 24 * 60 * 60,
      userInfo,
    })
  })

  // 注册
  Mock.mock(/\/api\/auth\/register/, 'post', (options) => {
    const body = JSON.parse(options.body)
    const { username, password, role } = body

    const existingUser = users.find((u) => u.username === username)
    if (existingUser) {
      return error('用户名已存在', 400)
    }

    const newUser = {
      id: users.length + 1,
      username,
      password,
      name: username,
      role,
      avatar: generateAvatar(username),
      email: `${username}@edu.com`,
      phone: '',
      createdAt: new Date().toISOString(),
    }

    if (role === 'student') {
      newUser.studentId = `2024${String(users.length + 1).padStart(4, '0')}`
      newUser.className = '高一(1)班'
      newUser.grade = '高一'
    } else {
      newUser.teacherId = `T2024${String(users.length + 1).padStart(4, '0')}`
      newUser.department = '待分配'
      newUser.title = '教师'
    }

    users.push(newUser)

    const { password: _, ...userInfo } = newUser
    return success(userInfo, '注册成功')
  })

  // 获取菜单
  Mock.mock(/\/api\/menu\/list/, 'get', (options) => {
    // // 从请求头获取token
    // const token = options.headers?.Authorization?.replace('Bearer ', '')
    // console.log('token:', token)
    // if (!token) {
    //   return error('未登录', 401)
    // }

    // const tokenInfo = tokens.get(token)
    // if (!tokenInfo) {
    //   return error('token无效', 401)
    // }

    // const user = users.find((u) => u.id === tokenInfo.userId)
    // if (!user) {
    //   return error('用户不存在', 404)
    // }

    const menus = menuConfig['teacher'] || []
    return success(menus)
  })
}
