import Mock from 'mockjs'
import { success } from '../utils'

// 模拟当前学生ID
let currentStudentId = 1

export function setCurrentStudentId(id) {
  currentStudentId = id
}

export function getCurrentStudentId() {
  return currentStudentId
}

// 课程列表数据
const coursesData = {
  1: [
    {
      id: 1,
      title: '高等数学',
      icon: 'fa-square-root-alt',
      progress: 80,
      status: '进行中',
      meta: [
        { label: '进度', value: '80%', icon: 'far fa-clock' },
        { label: '作业', value: '8/10', icon: 'fas fa-pencil-alt' },
        { label: '视频', value: '32/40', icon: 'fas fa-video' },
      ],
      teacherExtra: {
        classAvg: '72%',
        laggingCount: 3,
        status: '3人滞后',
        teacherName: '张教授',
        nextClass: '2025-01-15 14:00',
      },
      modules: [
        { name: '函数与极限', completed: true, score: 85 },
        { name: '导数与微分', completed: true, score: 92 },
        { name: '微分中值定理', completed: true, score: 78 },
        { name: '不定积分', completed: false, score: null },
        { name: '定积分', completed: false, score: null },
      ],
    },
    {
      id: 2,
      title: '大学英语',
      icon: 'fa-language',
      progress: 55,
      status: '进行中',
      meta: [
        { label: '进度', value: '55%', icon: 'far fa-clock' },
        { label: '作业', value: '6/12', icon: 'fas fa-pencil-alt' },
        { label: '视频', value: '18/30', icon: 'fas fa-video' },
      ],
      teacherExtra: {
        classAvg: '63%',
        laggingCount: 2,
        status: '2人滞后',
        teacherName: '李教授',
        nextClass: '2025-01-16 10:00',
      },
      modules: [
        { name: 'Unit 1: Campus Life', completed: true, score: 88 },
        { name: 'Unit 2: Technology', completed: true, score: 85 },
        { name: 'Unit 3: Environment', completed: true, score: 76 },
        { name: 'Unit 4: Culture', completed: false, score: null },
        { name: 'Unit 5: Career', completed: false, score: null },
      ],
    },
    {
      id: 3,
      title: 'Python程序设计',
      icon: 'fa-code',
      progress: 35,
      status: '进行中',
      meta: [
        { label: '进度', value: '35%', icon: 'far fa-clock' },
        { label: '项目', value: '1/3', icon: 'fas fa-project-diagram' },
        { label: '视频', value: '8/24', icon: 'fas fa-video' },
      ],
      teacherExtra: {
        classAvg: '42%',
        laggingCount: 0,
        status: '5人超前',
        teacherName: '王教授',
        nextClass: '2025-01-17 15:30',
      },
      modules: [
        { name: 'Python基础语法', completed: true, score: 90 },
        { name: '流程控制', completed: true, score: 85 },
        { name: '函数与模块', completed: false, score: null },
        { name: '面向对象编程', completed: false, score: null },
      ],
    },
    {
      id: 4,
      title: '物理实验',
      icon: 'fa-flask',
      progress: 72,
      status: '进行中',
      meta: [
        { label: '进度', value: '72%', icon: 'far fa-clock' },
        { label: '实验', value: '8/12', icon: 'fas fa-flask' },
        { label: '报告', value: '1/2', icon: 'fas fa-file-alt' },
      ],
      teacherExtra: {
        classAvg: '68%',
        laggingCount: 1,
        status: '1人未提交',
        teacherName: '陈教授',
        nextClass: '2025-01-18 09:00',
      },
      modules: [
        { name: '力学基础实验', completed: true, score: 88 },
        { name: '热学实验', completed: true, score: 82 },
        { name: '电磁学实验', completed: true, score: 75 },
        { name: '光学实验', completed: false, score: null },
      ],
    },
  ],
  3: [
    {
      id: 1,
      title: '高等数学',
      icon: 'fa-square-root-alt',
      progress: 68,
      status: '进行中',
      meta: [
        { label: '进度', value: '68%', icon: 'far fa-clock' },
        { label: '作业', value: '6/10', icon: 'fas fa-pencil-alt' },
        { label: '视频', value: '28/40', icon: 'fas fa-video' },
      ],
      teacherExtra: {
        classAvg: '72%',
        laggingCount: 3,
        status: '3人滞后',
        teacherName: '张教授',
        nextClass: '2025-01-15 14:00',
      },
      modules: [
        { name: '函数与极限', completed: true, score: 78 },
        { name: '导数与微分', completed: true, score: 82 },
        { name: '微分中值定理', completed: false, score: null },
        { name: '不定积分', completed: false, score: null },
      ],
    },
    {
      id: 2,
      title: '大学英语',
      icon: 'fa-language',
      progress: 48,
      status: '进行中',
      meta: [
        { label: '进度', value: '48%', icon: 'far fa-clock' },
        { label: '作业', value: '5/12', icon: 'fas fa-pencil-alt' },
        { label: '视频', value: '15/30', icon: 'fas fa-video' },
      ],
      teacherExtra: {
        classAvg: '63%',
        laggingCount: 2,
        status: '2人滞后',
        teacherName: '李教授',
        nextClass: '2025-01-16 10:00',
      },
      modules: [
        { name: 'Unit 1: Campus Life', completed: true, score: 82 },
        { name: 'Unit 2: Technology', completed: true, score: 78 },
        { name: 'Unit 3: Environment', completed: false, score: null },
      ],
    },
  ],
}

// 整体进度统计
const overallStatsData = {
  1: {
    overallProgress: 68,
    completedModules: 24,
    totalModules: 35,
    remainingModules: 11,
    stats: [
      { label: '平均GPA', value: '3.8', number: '3.8' },
      { label: '学习小时', value: '128', number: '128' },
      { label: '作业提交率', value: '87%', number: '87%' },
    ],
  },
  3: {
    overallProgress: 58,
    completedModules: 18,
    totalModules: 31,
    remainingModules: 13,
    stats: [
      { label: '平均GPA', value: '3.5', number: '3.5' },
      { label: '学习小时', value: '98', number: '98' },
      { label: '作业提交率', value: '76%', number: '76%' },
    ],
  },
}

// 学习动态数据
const timelineData = {
  1: [
    {
      id: 1,
      icon: 'fas fa-check',
      title: '完成高等数学第三章练习',
      time: '今天 09:30',
      detail: '得分 92% · 用时 45分钟',
      type: 'exercise',
    },
    {
      id: 2,
      icon: 'fas fa-video',
      title: '观看英语听力视频',
      time: '昨天 15:20',
      detail: 'Unit 4 · 时长 45分钟',
      type: 'video',
    },
    {
      id: 3,
      icon: 'fas fa-pencil-alt',
      title: '提交程序设计作业',
      time: '前天 10:15',
      detail: '项目一: 猜数字游戏 (待评分)',
      type: 'homework',
    },
    {
      id: 4,
      icon: 'fas fa-users',
      title: '参与小组讨论',
      time: '3天前',
      detail: '物理实验数据处理',
      type: 'discussion',
    },
    {
      id: 5,
      icon: 'fas fa-chart-line',
      title: '成绩更新',
      time: '5天前',
      detail: '高等数学期中考试 85分',
      type: 'grade',
    },
    {
      id: 6,
      icon: 'fas fa-calendar',
      title: '新课程发布',
      time: '1周前',
      detail: 'Python数据分析课程已上线',
      type: 'course',
    },
  ],
  3: [
    {
      id: 1,
      icon: 'fas fa-check',
      title: '完成高等数学第二章练习',
      time: '今天 10:30',
      detail: '得分 85% · 用时 40分钟',
      type: 'exercise',
    },
    {
      id: 2,
      icon: 'fas fa-pencil-alt',
      title: '提交英语作文',
      time: '昨天 14:20',
      detail: 'Unit 3 作文 (待评分)',
      type: 'homework',
    },
    {
      id: 3,
      icon: 'fas fa-video',
      title: '观看Python基础视频',
      time: '3天前',
      detail: '变量与数据类型 · 时长 30分钟',
      type: 'video',
    },
  ],
}

// 近7天学习时间分布
const studyTimeData = {
  1: [2.5, 3.0, 2.8, 3.2, 2.0, 4.5, 3.5],
  3: [1.8, 2.2, 2.0, 2.5, 1.5, 3.5, 2.8],
}

// 课程状态筛选选项
const courseStatusOptions = [
  { value: 'all', label: '全部课程' },
  { value: 'ongoing', label: '进行中' },
  { value: 'not_started', label: '未开始' },
  { value: 'completed', label: '已结课' },
]

// Mock 接口
export default function mockCourseOverview() {
  // 获取课程列表
  Mock.mock(/\/api\/course\/list/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const status = url.searchParams.get('status')
    const id = studentId ? parseInt(studentId) : currentStudentId

    let data = coursesData[id] || coursesData[1]

    // 根据状态筛选
    if (status && status !== 'all') {
      const statusMap = {
        ongoing: '进行中',
        not_started: '未开始',
        completed: '已结课',
      }
      const filterStatus = statusMap[status]
      if (filterStatus) {
        data = data.filter((course) => course.status === filterStatus)
      }
    }

    return success(data)
  })

  // 获取整体进度统计
  Mock.mock(/\/api\/course\/overall-stats/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = overallStatsData[id] || overallStatsData[1]
    return success(data)
  })

  // 获取学习动态
  Mock.mock(/\/api\/course\/timeline/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 5
    const id = studentId ? parseInt(studentId) : currentStudentId

    let data = timelineData[id] || timelineData[1]

    // 分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = data.slice(start, end)

    return success({
      list: paginatedData,
      total: data.length,
      page,
      pageSize,
    })
  })

  // 获取近7天学习时间分布
  Mock.mock(/\/api\/course\/study-time/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = studyTimeData[id] || studyTimeData[1]
    return success({
      days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      hours: data,
    })
  })

  // 获取课程状态选项
  Mock.mock(/\/api\/course\/status-options/, 'get', () => {
    return success(courseStatusOptions)
  })

  // 获取课程详情
  Mock.mock(/\/api\/course\/detail/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const courseId = parseInt(url.searchParams.get('courseId'))
    const id = studentId ? parseInt(studentId) : currentStudentId

    const courses = coursesData[id] || coursesData[1]
    const course = courses.find((c) => c.id === courseId)

    if (!course) {
      return error('课程不存在', 404)
    }

    return success(course)
  })

  // 获取课程模块详情
  Mock.mock(/\/api\/course\/modules/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const courseId = parseInt(url.searchParams.get('courseId'))
    const id = studentId ? parseInt(studentId) : currentStudentId

    const courses = coursesData[id] || coursesData[1]
    const course = courses.find((c) => c.id === courseId)

    if (!course) {
      return error('课程不存在', 404)
    }

    return success(course.modules || [])
  })
}
