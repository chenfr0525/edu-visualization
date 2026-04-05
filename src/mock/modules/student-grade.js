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

// 学期选项
const termOptionsData = {
  1: [
    { value: 'all', label: '全部学期' },
    { value: '2024-2025-1', label: '2024-2025 第一学期' },
    { value: '2024-2025-2', label: '2024-2025 第二学期' },
    { value: '2023-2024-1', label: '2023-2024 第一学期' },
    { value: '2023-2024-2', label: '2023-2024 第二学期' },
  ],
  3: [
    { value: 'all', label: '全部学期' },
    { value: '2024-2025-1', label: '2024-2025 第一学期' },
    { value: '2024-2025-2', label: '2024-2025 第二学期' },
  ],
}

// 状态选项
const statusOptions = [
  { value: 'all', label: '全部考试' },
  { value: 'ongoing', label: '进行中' },
  { value: 'completed', label: '已结束' },
  { value: 'upcoming', label: '未开始' },
]

// 课程选项
const courseOptionsData = {
  1: [
    { value: 'all', label: '全部课程' },
    { value: '高等数学', label: '高等数学' },
    { value: '大学英语', label: '大学英语' },
    { value: 'Python程序设计', label: 'Python程序设计' },
    { value: '物理实验', label: '物理实验' },
    { value: '数据结构', label: '数据结构' },
    { value: '算法', label: '算法' },
  ],
  3: [
    { value: 'all', label: '全部课程' },
    { value: '高等数学', label: '高等数学' },
    { value: '大学英语', label: '大学英语' },
    { value: 'Python程序设计', label: 'Python程序设计' },
  ],
}

// 考试列表数据
const examListData = {
  1: [
    {
      id: 1,
      course: '高等数学',
      type: '期中考试',
      status: 'ongoing',
      statusText: '进行中',
      className: '高三(1)班',
      date: '2026-03-20',
      startTime: '09:00',
      endTime: '11:30',
      duration: 150,
      submittedCount: 32,
      totalStudents: 45,
      averageScore: null,
      myScore: null,
      rank: null,
      location: '教学楼A-201',
    },
    {
      id: 2,
      course: '大学英语',
      type: '月考',
      status: 'completed',
      statusText: '已结束',
      className: '高三(1)班',
      date: '2026-03-10',
      startTime: '14:00',
      endTime: '16:00',
      duration: 120,
      submittedCount: null,
      totalStudents: null,
      averageScore: 78.5,
      myScore: 85,
      rank: 12,
      location: '教学楼B-305',
    },
    {
      id: 3,
      course: '高等数学',
      type: '单元测试',
      status: 'upcoming',
      statusText: '未开始',
      className: '高三(1)班',
      date: '2026-03-25',
      startTime: '10:00',
      endTime: '11:40',
      duration: 100,
      submittedCount: null,
      totalStudents: null,
      averageScore: null,
      myScore: null,
      rank: null,
      location: '教学楼A-201',
    },
    {
      id: 4,
      course: 'Python程序设计',
      type: '期中考试',
      status: 'completed',
      statusText: '已结束',
      className: '高三(1)班',
      date: '2026-03-05',
      startTime: '08:30',
      endTime: '10:30',
      duration: 120,
      submittedCount: null,
      totalStudents: null,
      averageScore: 82.3,
      myScore: 90,
      rank: 8,
      location: '计算机楼C-101',
    },
    {
      id: 5,
      course: '物理实验',
      type: '实验考核',
      status: 'completed',
      statusText: '已结束',
      className: '高三(1)班',
      date: '2026-02-28',
      startTime: '13:00',
      endTime: '15:00',
      duration: 120,
      submittedCount: null,
      totalStudents: null,
      averageScore: 85.6,
      myScore: 88,
      rank: 15,
      location: '实验楼D-302',
    },
    {
      id: 6,
      course: '数据结构',
      type: '期末考试',
      status: 'upcoming',
      statusText: '未开始',
      className: '高三(1)班',
      date: '2026-04-10',
      startTime: '09:00',
      endTime: '11:30',
      duration: 150,
      submittedCount: null,
      totalStudents: null,
      averageScore: null,
      myScore: null,
      rank: null,
      location: '教学楼A-103',
    },
    {
      id: 7,
      course: '算法',
      type: '期中考试',
      status: 'ongoing',
      statusText: '进行中',
      className: '高三(1)班',
      date: '2026-03-22',
      startTime: '14:30',
      endTime: '17:00',
      duration: 150,
      submittedCount: 28,
      totalStudents: 45,
      averageScore: null,
      myScore: null,
      rank: null,
      location: '教学楼A-305',
    },
  ],
  3: [
    {
      id: 1,
      course: '高等数学',
      type: '期中考试',
      status: 'ongoing',
      statusText: '进行中',
      className: '高三(2)班',
      date: '2026-03-20',
      startTime: '09:00',
      endTime: '11:30',
      duration: 150,
      submittedCount: 30,
      totalStudents: 42,
      averageScore: null,
      myScore: null,
      rank: null,
      location: '教学楼A-201',
    },
    {
      id: 2,
      course: '大学英语',
      type: '月考',
      status: 'completed',
      statusText: '已结束',
      className: '高三(2)班',
      date: '2026-03-10',
      startTime: '14:00',
      endTime: '16:00',
      duration: 120,
      submittedCount: null,
      totalStudents: null,
      averageScore: 76.2,
      myScore: 82,
      rank: 15,
      location: '教学楼B-305',
    },
    {
      id: 3,
      course: 'Python程序设计',
      type: '期中考试',
      status: 'completed',
      statusText: '已结束',
      className: '高三(2)班',
      date: '2026-03-05',
      startTime: '08:30',
      endTime: '10:30',
      duration: 120,
      submittedCount: null,
      totalStudents: null,
      averageScore: 80.5,
      myScore: 86,
      rank: 10,
      location: '计算机楼C-101',
    },
  ],
}

// 成绩分布数据
const gradeDistributionData = {
  1: {
    高等数学: {
      distribution: [3, 8, 15, 12, 7],
      stats: {
        average: 78.5,
        highest: 96,
        lowest: 52,
        passRate: 88.9,
        excellentRate: 42.2,
      },
    },
    大学英语: {
      distribution: [2, 6, 18, 14, 5],
      stats: {
        average: 78.5,
        highest: 94,
        lowest: 48,
        passRate: 86.7,
        excellentRate: 37.8,
      },
    },
    Python程序设计: {
      distribution: [1, 4, 12, 18, 10],
      stats: {
        average: 82.3,
        highest: 98,
        lowest: 55,
        passRate: 91.1,
        excellentRate: 48.9,
      },
    },
    物理实验: {
      distribution: [0, 3, 15, 20, 7],
      stats: {
        average: 85.6,
        highest: 95,
        lowest: 62,
        passRate: 95.6,
        excellentRate: 46.7,
      },
    },
    数据结构: {
      distribution: [4, 10, 14, 10, 7],
      stats: {
        average: 75.2,
        highest: 92,
        lowest: 45,
        passRate: 82.2,
        excellentRate: 37.8,
      },
    },
    算法: {
      distribution: [5, 12, 13, 10, 5],
      stats: {
        average: 73.8,
        highest: 94,
        lowest: 40,
        passRate: 80.0,
        excellentRate: 33.3,
      },
    },
  },
  3: {
    高等数学: {
      distribution: [5, 10, 14, 9, 4],
      stats: {
        average: 74.2,
        highest: 92,
        lowest: 48,
        passRate: 83.3,
        excellentRate: 35.7,
      },
    },
    大学英语: {
      distribution: [3, 8, 16, 11, 4],
      stats: {
        average: 76.2,
        highest: 90,
        lowest: 50,
        passRate: 85.7,
        excellentRate: 35.7,
      },
    },
    Python程序设计: {
      distribution: [2, 6, 14, 15, 5],
      statistics: {
        average: 80.5,
        highest: 96,
        lowest: 52,
        passRate: 88.1,
        excellentRate: 42.9,
      },
    },
  },
}

// 我的成绩趋势数据
const myGradeTrendData = {
  1: {
    高等数学: [
      { examName: '第一次作业', score: 82, classAvg: 78 },
      { examName: '第二次作业', score: 88, classAvg: 82 },
      { examName: '期中考试', score: 76, classAvg: 80 },
      { examName: '第三次作业', score: 92, classAvg: 85 },
      { examName: '第四次作业', score: 85, classAvg: 83 },
      { examName: '期末考试', score: 94, classAvg: 86 },
    ],
    大学英语: [
      { examName: '第一次作业', score: 85, classAvg: 80 },
      { examName: '第二次作业', score: 82, classAvg: 78 },
      { examName: '期中考试', score: 88, classAvg: 82 },
      { examName: '第三次作业', score: 90, classAvg: 85 },
      { examName: '第四次作业', score: 87, classAvg: 84 },
      { examName: '期末考试', score: 92, classAvg: 88 },
    ],
    Python程序设计: [
      { examName: '第一次作业', score: 88, classAvg: 82 },
      { examName: '第二次作业', score: 85, classAvg: 80 },
      { examName: '期中考试', score: 90, classAvg: 84 },
      { examName: '项目一', score: 92, classAvg: 86 },
      { examName: '项目二', score: 88, classAvg: 85 },
      { examName: '期末考试', score: 94, classAvg: 88 },
    ],
  },
  3: {
    高等数学: [
      { examName: '第一次作业', score: 78, classAvg: 78 },
      { examName: '第二次作业', score: 82, classAvg: 82 },
      { examName: '期中考试', score: 72, classAvg: 80 },
      { examName: '第三次作业', score: 86, classAvg: 85 },
      { examName: '第四次作业', score: 80, classAvg: 83 },
    ],
    大学英语: [
      { examName: '第一次作业', score: 80, classAvg: 80 },
      { examName: '第二次作业', score: 78, classAvg: 78 },
      { examName: '期中考试', score: 82, classAvg: 82 },
      { examName: '第三次作业', score: 85, classAvg: 85 },
    ],
  },
}

// Mock 接口
export default function mockGradeAnalysis() {
  // 获取学期选项
  Mock.mock(/\/api\/grade\/terms/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = termOptionsData[id] || termOptionsData[1]
    return success(data)
  })

  // 获取状态选项
  Mock.mock(/\/api\/grade\/status-options/, 'get', () => {
    return success(statusOptions)
  })

  // 获取课程选项
  Mock.mock(/\/api\/grade\/courses/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = courseOptionsData[id] || courseOptionsData[1]
    return success(data)
  })

  // 获取考试列表
  Mock.mock(/\/api\/grade\/exam-list/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const term = url.searchParams.get('term')
    const status = url.searchParams.get('status')
    const course = url.searchParams.get('course')

    const id = studentId ? parseInt(studentId) : currentStudentId
    let data = examListData[id] || examListData[1]

    // 筛选逻辑
    if (term && term !== 'all') {
      // 可以根据学期筛选，这里简化处理
      data = data.filter((item) => item.date.includes(term.split('-')[0]))
    }

    if (status && status !== 'all') {
      data = data.filter((item) => item.status === status)
    }

    if (course && course !== 'all') {
      data = data.filter((item) => item.course === course)
    }

    return success(data)
  })

  // 获取成绩分布数据
  Mock.mock(/\/api\/grade\/distribution/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const course = url.searchParams.get('course')

    const id = studentId ? parseInt(studentId) : currentStudentId

    if (!course || course === 'all') {
      // 返回默认数据
      return success({
        distribution: [3, 8, 15, 12, 7],
        stats: {
          average: 78.5,
          highest: 96,
          lowest: 52,
          passRate: 88.9,
          excellentRate: 42.2,
        },
      })
    }

    const data = gradeDistributionData[id] || gradeDistributionData[1]
    const courseData = data[course] || {
      distribution: [3, 8, 15, 12, 7],
      stats: {
        average: 78.5,
        highest: 96,
        lowest: 52,
        passRate: 88.9,
        excellentRate: 42.2,
      },
    }

    return success(courseData)
  })

  // 获取我的成绩趋势
  Mock.mock(/\/api\/grade\/my-trend/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const course = url.searchParams.get('course')

    const id = studentId ? parseInt(studentId) : currentStudentId

    if (!course || course === 'all') {
      return success([])
    }

    const data = myGradeTrendData[id] || myGradeTrendData[1]
    const trendData = data[course] || []

    return success(trendData)
  })

  // 获取考试成绩详情
  Mock.mock(/\/api\/grade\/exam-detail/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const examId = parseInt(url.searchParams.get('examId'))
    const studentId = url.searchParams.get('studentId')

    const id = studentId ? parseInt(studentId) : currentStudentId
    const data = examListData[id] || examListData[1]
    const exam = data.find((item) => item.id === examId)

    if (!exam) {
      return error('考试不存在', 404)
    }

    return success(exam)
  })

  // 获取成绩分析报告
  Mock.mock(/\/api\/grade\/report/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const examId = parseInt(url.searchParams.get('examId'))

    return success({
      examId,
      analysis: '本次考试整体表现良好，在高等数学方面需要加强...',
      strengths: ['英语阅读理解', 'Python编程基础'],
      weaknesses: ['高等数学积分部分', '算法复杂度分析'],
      suggestions: ['建议加强积分计算练习', '多复习算法时间复杂度分析', '参加课后答疑辅导'],
      nextSteps: [
        { name: '完成积分专项练习', deadline: '2026-03-30' },
        { name: '参加算法辅导课', deadline: '2026-03-28' },
      ],
    })
  })
}
