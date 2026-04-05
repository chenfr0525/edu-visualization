import Mock from 'mockjs'
import { success, error } from '../utils'

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

// 考试列表数据
let examListData = [
  {
    id: 1,
    name: '2026届高三一模考试',
    type: 'mock',
    className: '高三(1)班',
    classId: 1,
    examDate: '2026-03-15',
    fullScore: 150,
    passScore: 90,
    totalStudents: 45,
    avgScore: 78.5,
    highestScore: 98,
    lowestScore: 52,
    passRate: 85,
    excellentRate: 32,
    status: 'completed',
    description: '全区统一模拟考试',
  },
  {
    id: 2,
    name: '三角函数单元测试',
    type: 'unit',
    className: '高三(1)班',
    classId: 1,
    examDate: '2026-03-25',
    fullScore: 100,
    passScore: 60,
    totalStudents: 45,
    avgScore: null,
    highestScore: null,
    lowestScore: null,
    passRate: null,
    excellentRate: null,
    status: 'upcoming',
    description: '第三章单元测试',
  },
  {
    id: 3,
    name: '月考（3月）',
    type: 'monthly',
    className: '高三(2)班',
    classId: 2,
    examDate: '2026-03-20',
    fullScore: 120,
    passScore: 72,
    totalStudents: 42,
    avgScore: 72.3,
    highestScore: 95,
    lowestScore: 48,
    passRate: 76,
    excellentRate: 24,
    status: 'ongoing',
    description: '3月月考',
  },
  {
    id: 4,
    name: '期中考试',
    type: 'midterm',
    className: '高三(1)班',
    classId: 1,
    examDate: '2026-04-15',
    fullScore: 150,
    passScore: 90,
    totalStudents: 45,
    avgScore: null,
    highestScore: null,
    lowestScore: null,
    passRate: null,
    excellentRate: null,
    status: 'upcoming',
    description: '2025-2026学年第二学期期中考试',
  },
  {
    id: 5,
    name: '期末考试',
    type: 'final',
    className: '高三(2)班',
    classId: 2,
    examDate: '2026-07-05',
    fullScore: 150,
    passScore: 90,
    totalStudents: 42,
    avgScore: null,
    highestScore: null,
    lowestScore: null,
    passRate: null,
    excellentRate: null,
    status: 'upcoming',
    description: '期末考试',
  },
  {
    id: 6,
    name: '二模考试',
    type: 'mock',
    className: '高三(3)班',
    classId: 3,
    examDate: '2026-04-10',
    fullScore: 150,
    passScore: 90,
    totalStudents: 44,
    avgScore: 75.8,
    highestScore: 97,
    lowestScore: 51,
    passRate: 81,
    excellentRate: 28,
    status: 'completed',
    description: '第二次模拟考试',
  },
]

// 学生成绩数据（按考试ID）
let scoresData = {
  1: [
    {
      id: 1,
      studentId: 1,
      studentNo: '2024001',
      studentName: '张小明',
      score: 98,
      rank: 1,
      remark: '表现优秀',
      status: 'graded',
    },
    {
      id: 2,
      studentId: 2,
      studentNo: '2024002',
      studentName: '李华',
      score: 95,
      rank: 2,
      remark: '',
      status: 'graded',
    },
    {
      id: 3,
      studentId: 3,
      studentNo: '2024003',
      studentName: '王芳',
      score: 92,
      rank: 3,
      remark: '',
      status: 'graded',
    },
    {
      id: 4,
      studentId: 4,
      studentNo: '2024004',
      studentName: '赵雷',
      score: 88,
      rank: 4,
      remark: '',
      status: 'graded',
    },
    {
      id: 5,
      studentId: 5,
      studentNo: '2024005',
      studentName: '陈晨',
      score: 85,
      rank: 5,
      remark: '',
      status: 'graded',
    },
    {
      id: 6,
      studentId: 6,
      studentNo: '2024006',
      studentName: '刘洋',
      score: 82,
      rank: 6,
      remark: '',
      status: 'graded',
    },
    {
      id: 7,
      studentId: 7,
      studentNo: '2024007',
      studentName: '周婷',
      score: 78,
      rank: 7,
      remark: '',
      status: 'graded',
    },
    {
      id: 8,
      studentId: 8,
      studentNo: '2024008',
      studentName: '吴迪',
      score: 75,
      rank: 8,
      remark: '',
      status: 'graded',
    },
    {
      id: 9,
      studentId: 9,
      studentNo: '2024009',
      studentName: '郑爽',
      score: 72,
      rank: 9,
      remark: '',
      status: 'graded',
    },
    {
      id: 10,
      studentId: 10,
      studentNo: '2024010',
      studentName: '黄涛',
      score: 68,
      rank: 10,
      remark: '',
      status: 'graded',
    },
  ],
  2: [
    {
      id: 1,
      studentId: 1,
      studentNo: '2024001',
      studentName: '张小明',
      score: null,
      rank: null,
      remark: '',
      status: 'pending',
    },
    {
      id: 2,
      studentId: 2,
      studentNo: '2024002',
      studentName: '李华',
      score: null,
      rank: null,
      remark: '',
      status: 'pending',
    },
    {
      id: 3,
      studentId: 3,
      studentNo: '2024003',
      studentName: '王芳',
      score: null,
      rank: null,
      remark: '',
      status: 'pending',
    },
  ],
  3: [
    {
      id: 1,
      studentId: 11,
      studentNo: '2024101',
      studentName: '孙晓明',
      score: 88,
      rank: 1,
      remark: '',
      status: 'graded',
    },
    {
      id: 2,
      studentId: 12,
      studentNo: '2024102',
      studentName: '林婉清',
      score: 85,
      rank: 2,
      remark: '',
      status: 'graded',
    },
    {
      id: 3,
      studentId: 13,
      studentNo: '2024103',
      studentName: '郭子轩',
      score: 78,
      rank: 3,
      remark: '',
      status: 'graded',
    },
  ],
}

// 考试分析数据
const analysisData = {
  1: {
    examId: 1,
    examName: '2026届高三一模考试',
    className: '高三(1)班',
    examDate: '2026-03-15',
    avgScore: 78.5,
    highestScore: 98,
    lowestScore: 52,
    passRate: 85,
    excellentRate: 32,
    standardDeviation: 12.3,
    scoreDistribution: [
      { range: '0-59', count: 5, percentage: 11.1 },
      { range: '60-69', count: 8, percentage: 17.8 },
      { range: '70-79', count: 12, percentage: 26.7 },
      { range: '80-89', count: 14, percentage: 31.1 },
      { range: '90-100', count: 6, percentage: 13.3 },
    ],
    gradeDistribution: [
      { name: '优秀 (≥90)', count: 6, percentage: 13.3, color: '#67c23a' },
      { name: '良好 (75-89)', count: 18, percentage: 40.0, color: '#409eff' },
      { name: '及格 (60-74)', count: 14, percentage: 31.1, color: '#e6a23c' },
      { name: '不及格 (<60)', count: 7, percentage: 15.6, color: '#f56c6c' },
    ],
    topStudents: [
      { rank: 1, studentName: '张小明', studentNo: '2024001', score: 98, improvement: 5 },
      { rank: 2, studentName: '李华', studentNo: '2024002', score: 95, improvement: 8 },
      { rank: 3, studentName: '王芳', studentNo: '2024003', score: 92, improvement: -2 },
      { rank: 4, studentName: '赵雷', studentNo: '2024004', score: 88, improvement: 3 },
      { rank: 5, studentName: '陈晨', studentNo: '2024005', score: 85, improvement: 0 },
    ],
    classCompare: [
      {
        className: '高三(1)班',
        avgScore: 78.5,
        highestScore: 98,
        passRate: 85,
        excellentRate: 32,
        rank: 1,
      },
      {
        className: '高三(2)班',
        avgScore: 72.3,
        highestScore: 95,
        passRate: 76,
        excellentRate: 24,
        rank: 3,
      },
      {
        className: '高三(3)班',
        avgScore: 75.8,
        highestScore: 97,
        passRate: 81,
        excellentRate: 28,
        rank: 2,
      },
      {
        className: '高三(4)班',
        avgScore: 70.2,
        highestScore: 92,
        passRate: 72,
        excellentRate: 20,
        rank: 4,
      },
    ],
  },
  6: {
    examId: 6,
    examName: '二模考试',
    className: '高三(3)班',
    examDate: '2026-04-10',
    avgScore: 75.8,
    highestScore: 97,
    lowestScore: 51,
    passRate: 81,
    excellentRate: 28,
    standardDeviation: 11.5,
    scoreDistribution: [
      { range: '0-59', count: 6, percentage: 13.6 },
      { range: '60-69', count: 9, percentage: 20.5 },
      { range: '70-79', count: 11, percentage: 25.0 },
      { range: '80-89', count: 12, percentage: 27.3 },
      { range: '90-100', count: 6, percentage: 13.6 },
    ],
    gradeDistribution: [
      { name: '优秀 (≥90)', count: 6, percentage: 13.6, color: '#67c23a' },
      { name: '良好 (75-89)', count: 16, percentage: 36.4, color: '#409eff' },
      { name: '及格 (60-74)', count: 15, percentage: 34.1, color: '#e6a23c' },
      { name: '不及格 (<60)', count: 7, percentage: 15.9, color: '#f56c6c' },
    ],
    topStudents: [
      { rank: 1, studentName: '唐雅欣', studentNo: '2024201', score: 97, improvement: 6 },
      { rank: 2, studentName: '沈梦辰', studentNo: '2024202', score: 94, improvement: 4 },
      { rank: 3, studentName: '欧阳雪', studentNo: '2024203', score: 91, improvement: -1 },
    ],
    classCompare: [
      {
        className: '高三(1)班',
        avgScore: 78.5,
        highestScore: 98,
        passRate: 85,
        excellentRate: 32,
        rank: 1,
      },
      {
        className: '高三(2)班',
        avgScore: 72.3,
        highestScore: 95,
        passRate: 76,
        excellentRate: 24,
        rank: 3,
      },
      {
        className: '高三(3)班',
        avgScore: 75.8,
        highestScore: 97,
        passRate: 81,
        excellentRate: 28,
        rank: 2,
      },
      {
        className: '高三(4)班',
        avgScore: 70.2,
        highestScore: 92,
        passRate: 72,
        excellentRate: 20,
        rank: 4,
      },
    ],
  },
}

// 下一个考试ID
let nextExamId = 10

// Mock 接口
export default function mockExamManage() {
  // 获取班级列表
  Mock.mock(/\/api\/teacher\/classes/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const teacherId = url.searchParams.get('teacherId')
    const id = teacherId ? parseInt(teacherId) : currentTeacherId

    const data = classListData[id] || classListData[2]
    return success(data)
  })

  // 获取考试列表
  Mock.mock(/\/api\/teacher\/examsList/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
    const classId = url.searchParams.get('classId')
    const type = url.searchParams.get('type')
    const keyword = url.searchParams.get('keyword') || ''

    let filtered = [...examListData]

    if (classId) {
      filtered = filtered.filter((e) => e.classId === parseInt(classId))
    }
    if (type) {
      filtered = filtered.filter((e) => e.type === type)
    }
    if (keyword) {
      filtered = filtered.filter((e) => e.name.includes(keyword))
    }

    const total = filtered.length
    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize)

    return success({ list, total, page, pageSize })
  })

  // 创建考试
  Mock.mock(/\/api\/teacher\/exam/, 'post', (options) => {
    const body = JSON.parse(options.body)
    const newExam = {
      id: nextExamId++,
      name: body.name,
      type: body.type,
      className: classListData[2].find((c) => c.id === body.classId)?.name || '未知班级',
      classId: body.classId,
      examDate: body.examDate,
      fullScore: body.fullScore,
      passScore: body.passScore,
      totalStudents: classListData[2].find((c) => c.id === body.classId)?.studentCount || 45,
      avgScore: null,
      highestScore: null,
      lowestScore: null,
      passRate: null,
      excellentRate: null,
      status: 'upcoming',
      description: body.description || '',
    }
    examListData.unshift(newExam)
    return success(newExam, '考试创建成功')
  })

  // 更新考试
  Mock.mock(/\/api\/teacher\/exam\/\d+/, 'put', (options) => {
    const url = options.url
    const examId = parseInt(url.match(/\/exam\/(\d+)/)[1])
    const body = JSON.parse(options.body)

    const index = examListData.findIndex((e) => e.id === examId)
    if (index !== -1) {
      examListData[index] = { ...examListData[index], ...body }
      return success(examListData[index], '更新成功')
    }
    return error('考试不存在', 404)
  })

  // 删除考试
  Mock.mock(/\/api\/teacher\/exam\/\d+/, 'delete', (options) => {
    const url = options.url
    const examId = parseInt(url.match(/\/exam\/(\d+)/)[1])

    const index = examListData.findIndex((e) => e.id === examId)
    if (index !== -1) {
      examListData.splice(index, 1)
      return success(null, '删除成功')
    }
    return error('考试不存在', 404)
  })

  // 获取成绩列表
  Mock.mock(/\/api\/teacher\/exam\/\d+\/scores/, 'get', (options) => {
    const url = options.url
    const examId = parseInt(url.match(/\/exam\/(\d+)\/scores/)[1])

    const exam = examListData.find((e) => e.id === examId)
    if (!exam) {
      return error('考试不存在', 404)
    }

    // 生成学生列表
    const students = []
    const classInfo = classListData[2].find((c) => c.id === exam.classId)
    const studentCount = classInfo?.studentCount || 45

    // 如果已有成绩数据，使用已有的
    if (scoresData[examId]) {
      return success({ list: scoresData[examId] })
    }

    // 生成空成绩列表
    for (let i = 1; i <= studentCount; i++) {
      students.push({
        id: i,
        studentId: i,
        studentNo: `2024${String(i).padStart(3, '0')}`,
        studentName: `学生${i}`,
        score: null,
        rank: null,
        remark: '',
        status: 'pending',
      })
    }
    scoresData[examId] = students
    return success({ list: students })
  })

  // 保存成绩
  Mock.mock(/\/api\/teacher\/exam\/\d+\/scores/, 'post', (options) => {
    const url = options.url
    const examId = parseInt(url.match(/\/exam\/(\d+)\/scores/)[1])
    const body = JSON.parse(options.body)
    const { scores } = body

    // 更新成绩数据
    scoresData[examId] = scores

    // 计算统计数据
    const validScores = scores.filter((s) => s.score !== null && s.score !== '')
    if (validScores.length > 0) {
      const totalScore = validScores.reduce((sum, s) => sum + s.score, 0)
      const avgScore = totalScore / validScores.length
      const highestScore = Math.max(...validScores.map((s) => s.score))
      const lowestScore = Math.min(...validScores.map((s) => s.score))

      const exam = examListData.find((e) => e.id === examId)
      if (exam) {
        const passCount = validScores.filter((s) => s.score >= exam.passScore).length
        const excellentCount = validScores.filter((s) => s.score >= exam.fullScore * 0.85).length
        exam.avgScore = parseFloat(avgScore.toFixed(1))
        exam.highestScore = highestScore
        exam.lowestScore = lowestScore
        exam.passRate = Math.round((passCount / validScores.length) * 100)
        exam.excellentRate = Math.round((excellentCount / validScores.length) * 100)
        exam.status = 'completed'
      }
    }

    return success({ count: validScores.length }, '成绩保存成功')
  })

  // 发布成绩
  Mock.mock(/\/api\/teacher\/exam\/\d+\/publish/, 'post', (options) => {
    const url = options.url
    const examId = parseInt(url.match(/\/exam\/(\d+)\/publish/)[1])

    const exam = examListData.find((e) => e.id === examId)
    if (exam) {
      exam.status = 'completed'
    }
    return success(null, '成绩已发布')
  })

  // 获取考试分析数据
  Mock.mock(/\/api\/teacher\/exam\/\d+\/analysis/, 'get', (options) => {
    const url = options.url
    const examId = parseInt(url.match(/\/exam\/(\d+)\/analysis/)[1])

    const data = analysisData[examId] || {
      examId,
      examName: examListData.find((e) => e.id === examId)?.name || '考试',
      className: examListData.find((e) => e.id === examId)?.className || '未知班级',
      examDate: examListData.find((e) => e.id === examId)?.examDate || '',
      avgScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passRate: 0,
      excellentRate: 0,
      standardDeviation: 0,
      scoreDistribution: [],
      gradeDistribution: [],
      topStudents: [],
      classCompare: [],
    }
    return success(data)
  })

  // 获取班级对比数据
  Mock.mock(/\/api\/teacher\/exam\/\d+\/compare/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const examId = parseInt(url.searchParams.get('examId'))
    const classIds = url.searchParams.get('classIds')?.split(',') || []

    const allClasses = classListData[2]
    const compareData = allClasses.map((cls) => {
      const exam = examListData.find((e) => e.classId === cls.id && e.type === 'mock')
      return {
        className: cls.name,
        avgScore: exam?.avgScore || 0,
        highestScore: exam?.highestScore || 0,
        passRate: exam?.passRate || 0,
        excellentRate: exam?.excellentRate || 0,
        rank: 0,
      }
    })

    // 排序并设置排名
    compareData.sort((a, b) => b.avgScore - a.avgScore)
    compareData.forEach((item, idx) => {
      item.rank = idx + 1
    })

    return success(compareData)
  })

  // 导出考试数据
  Mock.mock(/\/api\/teacher\/exams\/export/, 'get', () => {
    return success(null, '导出成功')
  })

  // 导出成绩
  Mock.mock(/\/api\/teacher\/exam\/\d+\/export/, 'get', () => {
    return success(null, '导出成功')
  })

  // 导出成绩单
  Mock.mock(/\/api\/teacher\/exam\/\d+\/score-sheet/, 'get', () => {
    return success(null, '导出成功')
  })

  // 下载导入模板
  Mock.mock(/\/api\/teacher\/exam\/\d+\/template/, 'get', () => {
    return success(null, '下载成功')
  })
}
