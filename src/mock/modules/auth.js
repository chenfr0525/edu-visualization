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

  // 登出
  Mock.mock(/\/api\/auth\/logout/, 'post', () => {
    return success(null, '登出成功')
  })
}
