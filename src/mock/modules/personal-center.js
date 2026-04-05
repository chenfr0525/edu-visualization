import Mock from 'mockjs'
import { success, error } from '../utils'

// 模拟当前用户ID
let currentUserId = 1
let currentUserRole = 'student'

export function setCurrentUser(id, role) {
  currentUserId = id
  currentUserRole = role
}

// 学生个人信息
const studentInfo = {
  1: {
    id: '20213733',
    name: '张小明',
    avatar: '',
    className: '高三(1)班',
    grade: '高三',
    username: 'zhangxiaoming',
    email: 'zhangxiaoming@edu.com',
    phone: '138****1234',
    registerTime: '2024-09-01',
    studentId: '20213733',
    department: '数学学院',
    gender: '男',
    birthday: '2006-03-15',
    address: '北京市海淀区',
  },
  3: {
    id: '20213734',
    name: 'Ruby Chen',
    avatar: '',
    className: '高三(1)班',
    grade: '高三',
    username: 'rubychen',
    email: 'ruby@edu.com',
    phone: '139****5678',
    registerTime: '2024-09-01',
    studentId: '20213734',
    department: '数学学院',
    gender: '女',
    birthday: '2006-05-20',
    address: '北京市朝阳区',
  },
}

// 教师个人信息
const teacherInfo = {
  2: {
    id: 'T2024001',
    name: '李华',
    avatar: '',
    teacherId: 'T2024001',
    department: '数学教研组',
    title: '高级教师',
    username: 'teacher1',
    email: 'lihua@edu.com',
    phone: '139****1234',
    registerTime: '2023-08-15',
    gender: '男',
    birthday: '1985-10-10',
    office: '教学楼A-302',
    specialty: '高等数学、线性代数',
    joinDate: '2010-09-01',
  },
}

// 学习统计数据（学生）
const learningStats = {
  1: {
    totalCourses: 12,
    completedCourses: 8,
    studyHours: 562,
    avgScore: 86.5,
    homeworkCount: 48,
    homeworkCompleted: 42,
    rank: 14,
    totalStudents: 45,
  },
  3: {
    totalCourses: 12,
    completedCourses: 7,
    studyHours: 548,
    avgScore: 84.2,
    homeworkCount: 48,
    homeworkCompleted: 40,
    rank: 18,
    totalStudents: 45,
  },
}

// 教学统计数据（教师）
const teachingStats = {
  2: {
    totalCourses: 3,
    totalStudents: 128,
    avgScore: 82.5,
    homeworkRate: 94,
    courseRate: 88,
    publishedHomeworks: 24,
    pendingGrading: 8,
  },
}

// 最近活动
const recentActivities = {
  1: [
    {
      id: 1,
      type: 'homework',
      title: '完成高等数学作业',
      time: '2026-03-19 15:30',
      detail: '得分92分',
    },
    { id: 2, type: 'exam', title: '参加英语月考', time: '2026-03-18 10:00', detail: '成绩待公布' },
    {
      id: 3,
      type: 'course',
      title: '观看Python视频',
      time: '2026-03-17 20:00',
      detail: '第5章 面向对象',
    },
    {
      id: 4,
      type: 'achievement',
      title: '获得学习之星',
      time: '2026-03-15',
      detail: '连续打卡30天',
    },
  ],
  2: [
    {
      id: 1,
      type: 'homework',
      title: '发布高等数学作业',
      time: '2026-03-19 14:00',
      detail: '第三章练习题',
    },
    { id: 2, type: 'grading', title: '批改作业', time: '2026-03-18 16:30', detail: '已批改32份' },
    {
      id: 3,
      type: 'course',
      title: '更新课件',
      time: '2026-03-17 11:00',
      detail: '线性代数第四章',
    },
  ],
}

// Mock 接口
export default function mockPersonalCenter() {
  // 获取用户信息（根据角色返回不同数据）
  Mock.mock(/\/api\/user\/info/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const userId = url.searchParams.get('userId')
    const role = url.searchParams.get('role')

    if (role === 'student') {
      const id = userId ? parseInt(userId) : currentUserId
      const data = studentInfo[id] || studentInfo[1]
      return success({ ...data, role: 'student' })
    } else if (role === 'teacher') {
      const id = userId ? parseInt(userId) : 2
      const data = teacherInfo[id] || teacherInfo[2]
      return success({ ...data, role: 'teacher' })
    }

    return error('用户不存在', 404)
  })

  // 获取统计数据（根据角色返回不同数据）
  Mock.mock(/\/api\/user\/stats/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const userId = url.searchParams.get('userId')
    const role = url.searchParams.get('role')

    if (role === 'student') {
      const id = userId ? parseInt(userId) : currentUserId
      const data = learningStats[id] || learningStats[1]
      return success({ ...data, role: 'student' })
    } else if (role === 'teacher') {
      const id = userId ? parseInt(userId) : 2
      const data = teachingStats[id] || teachingStats[2]
      return success({ ...data, role: 'teacher' })
    }

    return success({})
  })

  // 获取最近活动
  Mock.mock(/\/api\/user\/activities/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const userId = url.searchParams.get('userId')
    const role = url.searchParams.get('role')

    if (role === 'student') {
      const id = userId ? parseInt(userId) : currentUserId
      const data = recentActivities[id] || recentActivities[1]
      return success(data)
    } else if (role === 'teacher') {
      const id = userId ? parseInt(userId) : 2
      const data = recentActivities[id] || recentActivities[2]
      return success(data)
    }

    return success([])
  })

  // 更新用户信息
  Mock.mock(/\/api\/user\/update/, 'post', (options) => {
    const body = JSON.parse(options.body)
    // 模拟更新成功
    return success(body, '信息更新成功')
  })

  // 修改密码
  Mock.mock(/\/api\/user\/change-password/, 'post', (options) => {
    const body = JSON.parse(options.body)
    const { oldPassword, newPassword } = body

    if (oldPassword === '123456') {
      return success(null, '密码修改成功')
    }
    return error('原密码错误', 400)
  })

  // 上传头像
  Mock.mock(/\/api\/user\/upload-avatar/, 'post', (options) => {
    // 模拟上传成功
    return success(
      {
        avatar: 'https://via.placeholder.com/100',
      },
      '头像上传成功',
    )
  })
}
