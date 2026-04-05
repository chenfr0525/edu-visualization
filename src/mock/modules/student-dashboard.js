import Mock from 'mockjs'
import { success } from '../utils'

// 模拟当前登录学生的ID（实际应该从token中获取）
let currentStudentId = 1

// 设置当前学生ID的函数（在登录时调用）
export function setCurrentStudentId(id) {
  currentStudentId = id
}

// 获取当前学生ID
export function getCurrentStudentId() {
  return currentStudentId
}

// 模拟学生基础信息
const studentInfo = {
  1: {
    id: 1,
    name: '张小明',
    studentId: '20213733',
    className: '高三(1)班',
    grade: '高三',
    avatar: 'https://via.placeholder.com/100',
    email: 'zhangxiaoming@edu.com',
    phone: '13812341234',
  },
  3: {
    id: 3,
    name: 'Ruby Chen',
    studentId: '20213734',
    className: '高三(1)班',
    grade: '高三',
    avatar: 'https://via.placeholder.com/100',
    email: 'ruby@edu.com',
    phone: '13812341235',
  },
}

// 模拟学期列表
const semesterList = {
  1: [
    {
      value: '2023-2024-1',
      label: '2023-2024 第一学期',
      startDate: '2023-09-01',
      endDate: '2024-01-15',
      isCurrent: false,
    },
    {
      value: '2023-2024-2',
      label: '2023-2024 第二学期',
      startDate: '2024-02-20',
      endDate: '2024-07-10',
      isCurrent: false,
    },
    {
      value: '2024-2025-1',
      label: '2024-2025 第一学期',
      startDate: '2024-09-01',
      endDate: '2025-01-15',
      isCurrent: true,
    },
    {
      value: '2024-2025-2',
      label: '2024-2025 第二学期',
      startDate: '2025-02-20',
      endDate: '2025-07-10',
      isCurrent: false,
    },
  ],
  3: [
    {
      value: '2023-2024-1',
      label: '2023-2024 第一学期',
      startDate: '2023-09-01',
      endDate: '2024-01-15',
      isCurrent: false,
    },
    {
      value: '2023-2024-2',
      label: '2023-2024 第二学期',
      startDate: '2024-02-20',
      endDate: '2024-07-10',
      isCurrent: false,
    },
    {
      value: '2024-2025-1',
      label: '2024-2025 第一学期',
      startDate: '2024-09-01',
      endDate: '2025-01-15',
      isCurrent: true,
    },
    {
      value: '2024-2025-2',
      label: '2024-2025 第二学期',
      startDate: '2025-02-20',
      endDate: '2025-07-10',
      isCurrent: false,
    },
  ],
}

// 模拟课程选项（根据学期动态变化）
const courseOptionsBySemester = {
  '2023-2024-1': {
    1: [
      { value: 'vue-basic', label: 'Vue.js 基础入门', teacher: '李华', credit: 3 },
      { value: 'js-advanced', label: 'JavaScript 高级编程', teacher: '王芳', credit: 4 },
    ],
    3: [
      { value: 'vue-basic', label: 'Vue.js 基础入门', teacher: '李华', credit: 3 },
      { value: 'js-advanced', label: 'JavaScript 高级编程', teacher: '王芳', credit: 4 },
    ],
  },
  '2023-2024-2': {
    1: [
      { value: 'vue-advanced', label: 'Vue.js 高级开发', teacher: '李华', credit: 3 },
      { value: 'echarts', label: 'ECharts 数据可视化', teacher: '张伟', credit: 2 },
      { value: 'webpack', label: '前端工程化', teacher: '刘强', credit: 3 },
    ],
    3: [
      { value: 'vue-advanced', label: 'Vue.js 高级开发', teacher: '李华', credit: 3 },
      { value: 'echarts', label: 'ECharts 数据可视化', teacher: '张伟', credit: 2 },
    ],
  },
  '2024-2025-1': {
    1: [
      { value: 'vue3-composition', label: 'Vue3 Composition API', teacher: '李华', credit: 3 },
      { value: 'pinia', label: 'Pinia 状态管理', teacher: '王芳', credit: 2 },
      { value: 'router', label: 'Vue Router 路由', teacher: '张伟', credit: 2 },
      { value: 'typescript', label: 'TypeScript 实战', teacher: '刘强', credit: 3 },
    ],
    3: [
      { value: 'vue3-composition', label: 'Vue3 Composition API', teacher: '李华', credit: 3 },
      { value: 'pinia', label: 'Pinia 状态管理', teacher: '王芳', credit: 2 },
      { value: 'router', label: 'Vue Router 路由', teacher: '张伟', credit: 2 },
    ],
  },
  '2024-2025-2': {
    1: [
      { value: 'project-practice', label: '项目实战', teacher: '李华', credit: 4 },
      { value: 'interview-prep', label: '面试准备', teacher: '王芳', credit: 2 },
    ],
    3: [
      { value: 'project-practice', label: '项目实战', teacher: '李华', credit: 4 },
      { value: 'interview-prep', label: '面试准备', teacher: '王芳', credit: 2 },
    ],
  },
}

// 模拟统计数据
const statData = {
  1: {
    courseCount: 12,
    studyHours: 562,
    avgScore: 86.5,
    classRank: 14,
    totalStudents: 45,
  },
  3: {
    courseCount: 12,
    studyHours: 548,
    avgScore: 84.2,
    classRank: 18,
    totalStudents: 45,
  },
}

// 模拟知识点掌握数据（雷达图）
const knowledgeMasteryData = {
  1: {
    current: [85, 70, 90, 65, 80, 75],
    classAvg: [75, 65, 80, 70, 75, 65],
    indicators: [
      'Vue3 基础',
      'Pinia 状态管理',
      'Vue Router 路由',
      'ECharts 可视化',
      'Element Plus 组件',
      '项目实战能力',
    ],
  },
  3: {
    current: [82, 68, 88, 70, 78, 72],
    classAvg: [75, 65, 80, 70, 75, 65],
    indicators: [
      'Vue3 基础',
      'Pinia 状态管理',
      'Vue Router 路由',
      'ECharts 可视化',
      'Element Plus 组件',
      '项目实战能力',
    ],
  },
}

// 模拟学习成绩趋势数据
const gradeTrendData = {
  1: {
    exams: ['第一次作业', '第二次作业', '期中考试', '第三次作业', '第四次作业', '期末考试'],
    scores: [82, 88, 76, 92, 85, 94],
    classAvg: [78, 82, 80, 85, 83, 88],
  },
  3: {
    exams: ['第一次作业', '第二次作业', '期中考试', '第三次作业', '第四次作业', '期末考试'],
    scores: [78, 85, 72, 88, 82, 90],
    classAvg: [78, 82, 80, 85, 83, 88],
  },
}

// 生成出勤热力图数据
export function getAttendanceHeatmapData(studentId = null) {
  const id = studentId || currentStudentId
  const data = []
  const startDate = new Date(2025, 0, 1)

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateStr = Mock.mock('@date("yyyy-mm-dd")')

    // 周末出勤率稍低
    const dayOfWeek = date.getDay()
    let attendanceRate

    if (id === 1) {
      // 张小明出勤数据
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        attendanceRate = Mock.mock('@integer(85, 95)')
      } else {
        attendanceRate = Mock.mock('@integer(92, 100)')
      }
      // 随机缺勤几天
      if ([15, 32, 48, 67, 89, 120, 156, 189, 210, 245, 278, 310, 335, 350].includes(i)) {
        attendanceRate = Mock.mock('@integer(0, 60)')
      }
    } else {
      // Ruby Chen 出勤数据
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        attendanceRate = Mock.mock('@integer(80, 95)')
      } else {
        attendanceRate = Mock.mock('@integer(90, 100)')
      }
      if ([22, 45, 67, 89, 112, 145, 178, 201, 234, 267, 290, 323, 345].includes(i)) {
        attendanceRate = Mock.mock('@integer(0, 55)')
      }
    }

    data.push([dateStr, attendanceRate])
  }

  return data
}

// 模拟课程列表
const courseList = {
  1: [
    {
      id: 1,
      name: 'Vue.js 前端开发',
      teacher: '李华',
      progress: 75,
      score: 88,
      homeworkCount: 12,
      completedHomework: 10,
      nextClass: '2025-01-15 14:00',
    },
    {
      id: 2,
      name: '数据可视化 ECharts',
      teacher: '王芳',
      progress: 60,
      score: 85,
      homeworkCount: 8,
      completedHomework: 6,
      nextClass: '2025-01-16 10:00',
    },
    {
      id: 3,
      name: '前端工程化',
      teacher: '张伟',
      progress: 45,
      score: 78,
      homeworkCount: 6,
      completedHomework: 3,
      nextClass: '2025-01-17 15:30',
    },
    {
      id: 4,
      name: 'TypeScript 实战',
      teacher: '刘强',
      progress: 80,
      score: 92,
      homeworkCount: 10,
      completedHomework: 9,
      nextClass: '2025-01-18 09:00',
    },
  ],
  3: [
    {
      id: 1,
      name: 'Vue.js 前端开发',
      teacher: '李华',
      progress: 70,
      score: 82,
      homeworkCount: 12,
      completedHomework: 9,
      nextClass: '2025-01-15 14:00',
    },
    {
      id: 2,
      name: '数据可视化 ECharts',
      teacher: '王芳',
      progress: 55,
      score: 80,
      homeworkCount: 8,
      completedHomework: 5,
      nextClass: '2025-01-16 10:00',
    },
  ],
}

// 模拟作业列表
const homeworkList = {
  1: [
    {
      id: 1,
      courseName: 'Vue.js 前端开发',
      title: '实现一个 TodoList 应用',
      deadline: '2025-01-20 23:59',
      status: 'pending', // pending: 未提交, submitted: 已提交, graded: 已批改
      score: null,
      feedback: null,
    },
    {
      id: 2,
      courseName: 'Vue.js 前端开发',
      title: '组件通信练习',
      deadline: '2025-01-13 23:59',
      status: 'graded',
      score: 92,
      feedback: '代码规范，逻辑清晰，继续保持！',
    },
    {
      id: 3,
      courseName: '数据可视化 ECharts',
      title: '绘制销售数据图表',
      deadline: '2025-01-15 23:59',
      status: 'submitted',
      score: null,
      feedback: null,
    },
    {
      id: 4,
      courseName: '前端工程化',
      title: '配置 Webpack 开发环境',
      deadline: '2025-01-18 23:59',
      status: 'pending',
      score: null,
      feedback: null,
    },
    {
      id: 5,
      courseName: 'TypeScript 实战',
      title: '实现类型安全的 API 调用',
      deadline: '2025-01-16 23:59',
      status: 'graded',
      score: 88,
      feedback: '类型定义完善，可以进一步优化',
    },
  ],
  3: [
    {
      id: 1,
      courseName: 'Vue.js 前端开发',
      title: '实现一个 TodoList 应用',
      deadline: '2025-01-20 23:59',
      status: 'pending',
      score: null,
      feedback: null,
    },
    {
      id: 2,
      courseName: 'Vue.js 前端开发',
      title: '组件通信练习',
      deadline: '2025-01-13 23:59',
      status: 'graded',
      score: 85,
      feedback: '完成度不错，注意代码复用',
    },
  ],
}

// 模拟成绩分析数据
const gradeAnalysisData = {
  1: {
    overview: {
      totalScore: 485,
      avgScore: 86.5,
      classRank: 14,
      gradeRank: 86,
      trend: 'up', // up, down, stable
    },
    subjectScores: [
      { subject: '语文', score: 88, classAvg: 82, gradeAvg: 80 },
      { subject: '数学', score: 92, classAvg: 85, gradeAvg: 83 },
      { subject: '英语', score: 85, classAvg: 80, gradeAvg: 78 },
      { subject: '物理', score: 78, classAvg: 75, gradeAvg: 73 },
      { subject: '化学', score: 82, classAvg: 78, gradeAvg: 76 },
      { subject: '生物', score: 90, classAvg: 84, gradeAvg: 82 },
    ],
    monthlyTrend: [
      { month: '9月', score: 82, classAvg: 78 },
      { month: '10月', score: 85, classAvg: 80 },
      { month: '11月', score: 84, classAvg: 81 },
      { month: '12月', score: 88, classAvg: 83 },
      { month: '1月', score: 92, classAvg: 86 },
    ],
  },
  3: {
    overview: {
      totalScore: 470,
      avgScore: 84.2,
      classRank: 18,
      gradeRank: 95,
      trend: 'up',
    },
    subjectScores: [
      { subject: '语文', score: 86, classAvg: 82, gradeAvg: 80 },
      { subject: '数学', score: 88, classAvg: 85, gradeAvg: 83 },
      { subject: '英语', score: 90, classAvg: 80, gradeAvg: 78 },
      { subject: '物理', score: 75, classAvg: 75, gradeAvg: 73 },
      { subject: '化学', score: 80, classAvg: 78, gradeAvg: 76 },
      { subject: '生物', score: 85, classAvg: 84, gradeAvg: 82 },
    ],
    monthlyTrend: [
      { month: '9月', score: 80, classAvg: 78 },
      { month: '10月', score: 82, classAvg: 80 },
      { month: '11月', score: 83, classAvg: 81 },
      { month: '12月', score: 85, classAvg: 83 },
      { month: '1月', score: 88, classAvg: 86 },
    ],
  },
}

// Mock 接口
export default function mockStudentDashboard() {
  // 获取统计数据
  Mock.mock(/\/api\/student\/dashboard\/stats/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = statData[id] || statData[1]
    return success(data)
  })

  // 获取知识点掌握数据
  Mock.mock(/\/api\/student\/dashboard\/knowledge/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = knowledgeMasteryData[id] || knowledgeMasteryData[1]
    return success(data)
  })

  // 获取学期列表
  Mock.mock(/\/api\/student\/semesters/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = semesterList[id] || semesterList[1]
    return success(data)
  })

  // 获取课程选项（根据学期）
  Mock.mock(/\/api\/student\/courses\/options/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const semester = url.searchParams.get('semester')
    const id = studentId ? parseInt(studentId) : currentStudentId

    if (!semester) {
      return error('请选择学期', 400)
    }

    const semesterCourses = courseOptionsBySemester[semester]
    if (!semesterCourses) {
      return success([])
    }

    const data = semesterCourses[id] || semesterCourses[1] || []
    return success(data)
  })

  // 根据学期和课程获取对应的统计数据
  Mock.mock(/\/api\/student\/dashboard\/stats\/by-course/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const semester = url.searchParams.get('semester')
    const courseId = url.searchParams.get('courseId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    // 根据不同的学期和课程返回不同的数据
    // 这里可以根据实际需求返回不同的统计数据
    const baseStats = statData[id] || statData[1]

    // 模拟不同课程的数据差异
    let multiplier = 1
    if (courseId === 'vue3-composition') multiplier = 1.1
    if (courseId === 'typescript') multiplier = 0.95

    const data = {
      courseCount: baseStats.courseCount,
      studyHours: Math.round(baseStats.studyHours * multiplier),
      avgScore: Math.round(baseStats.avgScore * multiplier),
      classRank: Math.max(1, Math.min(45, Math.round(baseStats.classRank * (2 - multiplier)))),
    }

    return success(data)
  })

  // 根据学期和课程获取知识点掌握数据
  Mock.mock(/\/api\/student\/dashboard\/knowledge\/by-course/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const courseId = url.searchParams.get('courseId')

    // 根据不同课程返回不同的知识点数据
    const knowledgeByCourse = {
      'vue3-composition': {
        current: [85, 70, 90, 65, 80, 75],
        classAvg: [75, 65, 80, 70, 75, 65],
        indicators: [
          '响应式系统',
          'Composition API',
          '生命周期',
          '指令系统',
          '组件通信',
          '渲染机制',
        ],
      },
      pinia: {
        current: [88, 75, 82, 70, 85, 78],
        classAvg: [78, 68, 75, 65, 80, 72],
        indicators: ['Store 定义', 'State', 'Getters', 'Actions', '插件系统', 'Devtools'],
      },
      typescript: {
        current: [75, 80, 70, 85, 78, 72],
        classAvg: [70, 75, 68, 78, 72, 68],
        indicators: ['基础类型', '接口', '泛型', '装饰器', '类型推断', '高级类型'],
      },
      default: {
        current: [82, 75, 85, 70, 78, 80],
        classAvg: [75, 70, 78, 68, 72, 75],
        indicators: [
          'Vue3 基础',
          'Pinia 状态管理',
          'Vue Router 路由',
          'ECharts 可视化',
          'Element Plus 组件',
          '项目实战能力',
        ],
      },
    }

    const data = knowledgeByCourse[courseId] || knowledgeByCourse.default
    return success(data)
  })

  // 获取成绩趋势数据
  Mock.mock(/\/api\/student\/dashboard\/grade-trend/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = gradeTrendData[id] || gradeTrendData[1]
    return success(data)
  })

  // 获取出勤热力图数据
  Mock.mock(/\/api\/student\/dashboard\/attendance/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = getAttendanceHeatmapData(id)
    return success(data)
  })

  // 获取学生信息
  Mock.mock(/\/api\/student\/info/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = studentInfo[id] || studentInfo[1]
    return success(data)
  })

  // 获取课程列表
  Mock.mock(/\/api\/student\/courses/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = courseList[id] || courseList[1]
    return success(data)
  })

  // 获取作业列表
  Mock.mock(/\/api\/student\/homeworks/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = homeworkList[id] || homeworkList[1]
    return success(data)
  })

  // 提交作业
  Mock.mock(/\/api\/student\/homework\/submit/, 'post', (options) => {
    const body = JSON.parse(options.body)
    const { homeworkId, content, files } = body

    // 模拟提交成功
    return success(
      {
        homeworkId,
        submitTime: new Date().toISOString(),
        status: 'submitted',
      },
      '作业提交成功',
    )
  })

  // 获取成绩分析数据
  Mock.mock(/\/api\/student\/grade-analysis/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = gradeAnalysisData[id] || gradeAnalysisData[1]
    return success(data)
  })
}
