import Mock from 'mockjs'
import { success } from '../utils'

// 模拟当前教师ID
let currentTeacherId = 2

export function setCurrentTeacherId(id) {
  currentTeacherId = id
}

// 班级列表
const classListData = {
  2: [
    { id: 1, name: '高三(1)班', grade: '高三', studentCount: 45 },
    { id: 2, name: '高三(2)班', grade: '高三', studentCount: 42 },
    { id: 3, name: '高三(3)班', grade: '高三', studentCount: 44 },
    { id: 4, name: '高三(4)班', grade: '高三', studentCount: 43 },
  ],
}

// 考试列表（按班级）
const examListData = {
  1: [
    // 高三(1)班
    {
      id: 1,
      name: '2026届高三一模考试',
      date: '2026-03-15',
      type: 'mock',
      fullScore: 150,
      passScore: 90,
    },
    {
      id: 2,
      name: '月考（3月）',
      date: '2026-03-20',
      type: 'monthly',
      fullScore: 120,
      passScore: 72,
    },
    {
      id: 3,
      name: '三角函数单元测试',
      date: '2026-03-25',
      type: 'unit',
      fullScore: 100,
      passScore: 60,
    },
    { id: 4, name: '期中考试', date: '2026-04-15', type: 'midterm', fullScore: 150, passScore: 90 },
  ],
  2: [
    {
      id: 5,
      name: '2026届高三一模考试',
      date: '2026-03-15',
      type: 'mock',
      fullScore: 150,
      passScore: 90,
    },
    {
      id: 6,
      name: '月考（3月）',
      date: '2026-03-20',
      type: 'monthly',
      fullScore: 120,
      passScore: 72,
    },
    { id: 7, name: '期中考试', date: '2026-04-15', type: 'midterm', fullScore: 150, passScore: 90 },
  ],
}

// 班级成绩统计数据
const gradeStatsData = {
  '1_1': {
    // 高三(1)班_一模考试
    avgScore: 78.5,
    highestScore: 98,
    highestStudent: '张小明',
    lowestScore: 52,
    lowestStudent: '赵雷',
    passRate: 85,
    excellentRate: 32,
    standardDeviation: 12.3,
    passScore: 90,
    scoreTrend: 3.5,
  },
  '1_2': {
    // 高三(1)班_月考
    avgScore: 75.2,
    highestScore: 95,
    highestStudent: '张小明',
    lowestScore: 48,
    lowestStudent: '周婷',
    passRate: 78,
    excellentRate: 28,
    standardDeviation: 11.8,
    passScore: 72,
    scoreTrend: 2.1,
  },
  '2_5': {
    // 高三(2)班_一模考试
    avgScore: 72.3,
    highestScore: 95,
    highestStudent: '林婉清',
    lowestScore: 48,
    lowestStudent: '郭子轩',
    passRate: 76,
    excellentRate: 24,
    standardDeviation: 13.1,
    passScore: 90,
    scoreTrend: -1.2,
  },
}

// 分数段分布数据
const scoreDistributionData = {
  '1_1': {
    ranges: [
      { name: '135-150', min: 135, max: 150, count: 3, percent: 6.7, color: '#67c23a' },
      { name: '120-134', min: 120, max: 134, count: 8, percent: 17.8, color: '#409eff' },
      { name: '105-119', min: 105, max: 119, count: 12, percent: 26.7, color: '#909399' },
      { name: '90-104', min: 90, max: 104, count: 15, percent: 33.3, color: '#e6a23c' },
      { name: '<90', min: 0, max: 89, count: 7, percent: 15.6, color: '#f56c6c' },
    ],
  },
  '1_2': {
    ranges: [
      { name: '108-120', min: 108, max: 120, count: 5, percent: 11.1, color: '#67c23a' },
      { name: '96-107', min: 96, max: 107, count: 10, percent: 22.2, color: '#409eff' },
      { name: '84-95', min: 84, max: 95, count: 14, percent: 31.1, color: '#909399' },
      { name: '72-83', min: 72, max: 83, count: 10, percent: 22.2, color: '#e6a23c' },
      { name: '<72', min: 0, max: 71, count: 6, percent: 13.3, color: '#f56c6c' },
    ],
  },
}

// 成绩趋势数据
const trendData = {
  1: {
    exams: ['月考1', '月考2', '期中', '月考3', '期末'],
    avgScore: [72, 75, 78, 76, 82],
    highestScore: [95, 96, 98, 97, 99],
    lowestScore: [48, 52, 55, 50, 58],
    compareAvg: [70, 73, 75, 74, 78],
  },
  2: {
    exams: ['月考1', '月考2', '期中', '月考3', '期末'],
    avgScore: [68, 70, 74, 72, 78],
    highestScore: [92, 93, 95, 94, 96],
    lowestScore: [45, 48, 50, 46, 52],
    compareAvg: [70, 73, 75, 74, 78],
  },
}

// 学生成绩列表
const studentScoresData = {
  '1_1': (() => {
    const students = [
      {
        id: 1,
        studentNo: '2024001',
        studentName: '张小明',
        score: 98,
        previousScore: 92,
        improvement: 6,
        rankChange: -3,
        status: 'active',
        className: '高三(1)班',
      },
      {
        id: 2,
        studentNo: '2024002',
        studentName: '李华',
        score: 85,
        previousScore: 78,
        improvement: 7,
        rankChange: -5,
        status: 'active',
        className: '高三(1)班',
      },
      {
        id: 3,
        studentNo: '2024003',
        studentName: '王芳',
        score: 92,
        previousScore: 88,
        improvement: 4,
        rankChange: -2,
        status: 'active',
        className: '高三(1)班',
      },
      {
        id: 4,
        studentNo: '2024004',
        studentName: '赵雷',
        score: 52,
        previousScore: 58,
        improvement: -6,
        rankChange: 8,
        status: 'active',
        className: '高三(1)班',
      },
      {
        id: 5,
        studentNo: '2024005',
        studentName: '陈晨',
        score: 75,
        previousScore: 72,
        improvement: 3,
        rankChange: -1,
        status: 'active',
        className: '高三(1)班',
      },
      {
        id: 6,
        studentNo: '2024006',
        studentName: '刘洋',
        score: 88,
        previousScore: 82,
        improvement: 6,
        rankChange: -4,
        status: 'active',
        className: '高三(1)班',
      },
      {
        id: 7,
        studentNo: '2024007',
        studentName: '周婷',
        score: 62,
        previousScore: 65,
        improvement: -3,
        rankChange: 3,
        status: 'active',
        className: '高三(1)班',
      },
      {
        id: 8,
        studentNo: '2024008',
        studentName: '吴迪',
        score: 95,
        previousScore: 90,
        improvement: 5,
        rankChange: -3,
        status: 'active',
        className: '高三(1)班',
      },
      {
        id: 9,
        studentNo: '2024009',
        studentName: '郑爽',
        score: 68,
        previousScore: 70,
        improvement: -2,
        rankChange: 2,
        status: 'active',
        className: '高三(1)班',
      },
      {
        id: 10,
        studentNo: '2024010',
        studentName: '黄涛',
        score: 82,
        previousScore: 76,
        improvement: 6,
        rankChange: -4,
        status: 'active',
        className: '高三(1)班',
      },
    ]
    // 生成更多学生
    for (let i = 11; i <= 45; i++) {
      students.push({
        id: i,
        studentNo: `2024${String(i).padStart(3, '0')}`,
        studentName: `学生${i}`,
        score: Math.floor(Math.random() * 50) + 50,
        previousScore: Math.floor(Math.random() * 50) + 50,
        improvement: Math.floor(Math.random() * 20) - 10,
        rankChange: Math.floor(Math.random() * 15) - 7,
        status: 'active',
        className: '高三(1)班',
      })
    }
    return students
  })(),
  '1_2': [
    {
      id: 1,
      studentNo: '2024001',
      studentName: '张小明',
      score: 88,
      previousScore: 82,
      improvement: 6,
      rankChange: -2,
      status: 'active',
      className: '高三(1)班',
    },
    {
      id: 2,
      studentNo: '2024002',
      studentName: '李华',
      score: 76,
      previousScore: 70,
      improvement: 6,
      rankChange: -3,
      status: 'active',
      className: '高三(1)班',
    },
    {
      id: 3,
      studentNo: '2024003',
      studentName: '王芳',
      score: 82,
      previousScore: 78,
      improvement: 4,
      rankChange: -1,
      status: 'active',
      className: '高三(1)班',
    },
  ],
}

// 进步/退步榜数据
const progressDeclineData = {
  '1_1': {
    progress: [
      {
        studentName: '李华',
        studentNo: '2024002',
        currentScore: 85,
        previousScore: 78,
        improvement: 7,
        rankChange: -5,
      },
      {
        studentName: '张小明',
        studentNo: '2024001',
        currentScore: 98,
        previousScore: 92,
        improvement: 6,
        rankChange: -3,
      },
      {
        studentName: '刘洋',
        studentNo: '2024006',
        currentScore: 88,
        previousScore: 82,
        improvement: 6,
        rankChange: -4,
      },
      {
        studentName: '黄涛',
        studentNo: '2024010',
        currentScore: 82,
        previousScore: 76,
        improvement: 6,
        rankChange: -4,
      },
      {
        studentName: '吴迪',
        studentNo: '2024008',
        currentScore: 95,
        previousScore: 90,
        improvement: 5,
        rankChange: -3,
      },
    ],
    decline: [
      {
        studentName: '赵雷',
        studentNo: '2024004',
        currentScore: 52,
        previousScore: 58,
        decline: 6,
        rankChange: 8,
      },
      {
        studentName: '周婷',
        studentNo: '2024007',
        currentScore: 62,
        previousScore: 65,
        decline: 3,
        rankChange: 3,
      },
      {
        studentName: '郑爽',
        studentNo: '2024009',
        currentScore: 68,
        previousScore: 70,
        decline: 2,
        rankChange: 2,
      },
    ],
  },
}

// 学生成绩趋势数据
const studentTrendData = {
  1: {
    exams: ['月考1', '月考2', '期中', '月考3', '期末'],
    scores: [72, 78, 85, 82, 92],
    avgScore: 81.8,
    highestScore: 92,
    lowestScore: 72,
    trend: 20,
  },
  2: {
    exams: ['月考1', '月考2', '期中', '月考3', '期末'],
    scores: [65, 70, 72, 68, 76],
    avgScore: 70.2,
    highestScore: 76,
    lowestScore: 65,
    trend: 11,
  },
}

// Mock 接口
export default function mockClassGrade() {
  // 获取班级列表
  Mock.mock(/\/api\/teacher\/classes/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const teacherId = url.searchParams.get('teacherId')
    const id = teacherId ? parseInt(teacherId) : currentTeacherId

    const data = classListData[id] || classListData[2]
    return success(data)
  })

  // 获取考试列表
  Mock.mock(/\/api\/teacher\/exams/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.searchParams.get('classId'))

    const data = examListData[classId] || []
    return success(data)
  })

  // 获取班级成绩统计
  Mock.mock(/\/api\/teacher\/class\/\d+\/grade-stats/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.pathname.match(/\/class\/(\d+)\/grade-stats/)[1])
    const examId = url.searchParams.get('examId')

    const key = `${classId}_${examId}`
    const data = gradeStatsData[key] || gradeStatsData['1_1']
    return success(data)
  })

  // 获取分数段分布
  Mock.mock(/\/api\/teacher\/class\/\d+\/score-distribution/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.pathname.match(/\/class\/(\d+)\/score-distribution/)[1])
    const examId = url.searchParams.get('examId')

    const key = `${classId}_${examId}`
    const data = scoreDistributionData[key] || scoreDistributionData['1_1']
    return success(data)
  })

  // 获取成绩趋势数据
  Mock.mock(/\/api\/teacher\/class\/\d+\/grade-trend/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.pathname.match(/\/class\/(\d+)\/grade-trend/)[1])

    const data = trendData[classId] || trendData[1]
    return success(data)
  })

  // 获取学生成绩列表
  Mock.mock(/\/api\/teacher\/class\/\d+\/scores/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.pathname.match(/\/class\/(\d+)\/scores/)[1])
    const examId = url.searchParams.get('examId')

    const key = `${classId}_${examId}`
    const data = studentScoresData[key] || studentScoresData['1_1']

    // 计算排名
    const sorted = [...data].sort((a, b) => b.score - a.score)
    sorted.forEach((student, index) => {
      student.rank = index + 1
    })

    return success({
      list: data,
      total: data.length,
    })
  })

  // 获取进步/退步榜
  Mock.mock(/\/api\/teacher\/class\/\d+\/progress-rank/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.pathname.match(/\/class\/(\d+)\/progress-rank/)[1])
    const examId = url.searchParams.get('examId')
    const compareExamId = url.searchParams.get('compareExamId')

    const key = `${classId}_${examId}`
    const data = progressDeclineData[key] || {
      progress: [],
      decline: [],
    }
    return success(data)
  })

  // 获取学生成绩趋势
  Mock.mock(/\/api\/teacher\/student\/\d+\/grade-trend/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = parseInt(url.pathname.match(/\/student\/(\d+)\/grade-trend/)[1])

    const data = studentTrendData[studentId] || studentTrendData[1]
    return success(data)
  })

  // 导出成绩单
  Mock.mock(/\/api\/teacher\/class\/\d+\/grade-sheet/, 'get', () => {
    return success(null, '导出成功')
  })

  // 导出进步榜
  Mock.mock(/\/api\/teacher\/class\/\d+\/progress-list/, 'get', () => {
    return success(null, '导出成功')
  })

  // 导出退步榜
  Mock.mock(/\/api\/teacher\/class\/\d+\/decline-list/, 'get', () => {
    return success(null, '导出成功')
  })
}
