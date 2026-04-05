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
    { id: 1, name: '高三(1)班', studentCount: 45, grade: '高三' },
    { id: 2, name: '高三(2)班', studentCount: 42, grade: '高三' },
    { id: 3, name: '高三(3)班', studentCount: 44, grade: '高三' },
    { id: 4, name: '高二(1)班', studentCount: 48, grade: '高二' },
  ],
}

// 考试列表
const examListData = {
  1: [
    // 高三(1)班的考试
    { id: 1, name: '期中考试', date: '2026-03-15', type: 'midterm' },
    { id: 2, name: '一模考试', date: '2026-03-20', type: 'mock' },
    { id: 3, name: '二模考试', date: '2026-04-10', type: 'mock' },
    { id: 4, name: '期末考试', date: '2026-01-15', type: 'final' },
  ],
  2: [
    // 高三(2)班的考试
    { id: 1, name: '期中考试', date: '2026-03-14', type: 'midterm' },
    { id: 2, name: '一模考试', date: '2026-03-19', type: 'mock' },
    { id: 3, name: '期末考试', date: '2026-01-14', type: 'final' },
  ],
  3: [
    // 高三(3)班的考试
    { id: 1, name: '期中考试', date: '2026-03-16', type: 'midterm' },
    { id: 2, name: '一模考试', date: '2026-03-21', type: 'mock' },
    { id: 3, name: '期末考试', date: '2026-01-16', type: 'final' },
  ],
}

// 统计数据
const statsData = {
  1: {
    // 高三(1)班
    studentCount: 45,
    avgScore: 82.5,
    passRate: 88.9,
    excellentRate: 42.2,
    pendingHomework: 8,
    lowScoreCount: 3,
    highScoreCount: 19,
  },
  2: {
    // 高三(2)班
    studentCount: 42,
    avgScore: 78.3,
    passRate: 83.3,
    excellentRate: 35.7,
    pendingHomework: 6,
    lowScoreCount: 5,
    highScoreCount: 15,
  },
  3: {
    // 高三(3)班
    studentCount: 44,
    avgScore: 80.1,
    passRate: 86.4,
    excellentRate: 38.6,
    pendingHomework: 7,
    lowScoreCount: 4,
    highScoreCount: 17,
  },
}

// 成绩分布数据
const gradeDistributionData = {
  1: {
    // 高三(1)班
    categories: ['优(≥90)', '良(75-89)', '中(60-74)', '差(<60)'],
    data: [12, 18, 10, 5],
    colors: ['#67c23a', '#409eff', '#e6a23c', '#f56c6c'],
    percentages: [26.7, 40.0, 22.2, 11.1],
  },
  2: {
    categories: ['优(≥90)', '良(75-89)', '中(60-74)', '差(<60)'],
    data: [8, 16, 12, 6],
    colors: ['#67c23a', '#409eff', '#e6a23c', '#f56c6c'],
    percentages: [19.0, 38.1, 28.6, 14.3],
  },
  3: {
    categories: ['优(≥90)', '良(75-89)', '中(60-74)', '差(<60)'],
    data: [10, 17, 11, 6],
    colors: ['#67c23a', '#409eff', '#e6a23c', '#f56c6c'],
    percentages: [22.7, 38.6, 25.0, 13.6],
  },
}

// 高频错题数据（按班级和考试）
const highFrequencyErrorsData = {
  '1_1': {
    // 高三(1)班_期中考试
    questions: [
      '第5题 (三角函数)',
      '第8题 (函数单调性)',
      '第12题 (数列求和)',
      '第15题 (立体几何)',
      '第3题 (概率计算)',
    ],
    errorRates: [85, 60, 45, 38, 32],
    questionIds: [5, 8, 12, 15, 3],
  },
  '1_2': {
    // 高三(1)班_一模考试
    questions: [
      '第3题 (函数定义域)',
      '第7题 (向量运算)',
      '第10题 (解析几何)',
      '第14题 (导数应用)',
      '第2题 (复数运算)',
    ],
    errorRates: [78, 55, 48, 42, 28],
    questionIds: [3, 7, 10, 14, 2],
  },
  '2_1': {
    // 高三(2)班_期中考试
    questions: [
      '第2题 (函数奇偶性)',
      '第6题 (三角函数)',
      '第11题 (数列)',
      '第13题 (立体几何)',
      '第4题 (不等式)',
    ],
    errorRates: [82, 65, 52, 44, 35],
    questionIds: [2, 6, 11, 13, 4],
  },
}

// 薄弱知识点数据
const weakKnowledgeData = {
  1: {
    knowledgePoints: [
      '三角函数诱导公式',
      '函数奇偶性判断',
      '数列通项公式',
      '立体几何三视图',
      '概率古典概型',
    ],
    errorRates: [72, 68, 55, 48, 35],
    masteryLevels: [28, 32, 45, 52, 65],
  },
  2: {
    knowledgePoints: ['三角函数图像', '函数单调性', '数列求和', '空间向量', '排列组合'],
    errorRates: [75, 65, 58, 45, 38],
    masteryLevels: [25, 35, 42, 55, 62],
  },
  3: {
    knowledgePoints: ['三角函数公式', '函数值域', '数列极限', '立体几何证明', '概率计算'],
    errorRates: [70, 62, 50, 46, 32],
    masteryLevels: [30, 38, 50, 54, 68],
  },
}

// 学生活跃度热力图数据
const activityHeatmapData = {
  1: {
    // 高三(1)班
    type: 'student',
    students: ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '陈十二'],
    dates: ['3/16', '3/17', '3/18', '3/19', '3/20', '3/21', '3/22'],
    data: [
      [45, 52, 38, 42, 78, 85, 62],
      [28, 35, 42, 38, 55, 48, 52],
      [72, 68, 85, 78, 92, 88, 95],
      [15, 22, 18, 25, 32, 28, 35],
      [55, 48, 52, 58, 62, 55, 60],
      [38, 42, 35, 48, 52, 58, 55],
      [82, 78, 85, 88, 92, 85, 90],
      [25, 32, 28, 35, 38, 42, 40],
      [62, 58, 65, 68, 72, 70, 75],
      [48, 52, 45, 50, 55, 58, 52],
    ],
  },
  2: {
    type: 'student',
    students: ['李明', '王红', '张伟', '刘芳', '陈强', '赵敏', '周涛', '吴迪'],
    dates: ['3/16', '3/17', '3/18', '3/19', '3/20', '3/21', '3/22'],
    data: [
      [38, 45, 42, 48, 55, 52, 58],
      [52, 48, 55, 58, 62, 60, 65],
      [25, 32, 28, 35, 38, 42, 40],
      [65, 68, 72, 70, 75, 78, 80],
      [42, 38, 45, 48, 52, 50, 55],
      [78, 82, 85, 88, 85, 90, 92],
      [35, 42, 38, 45, 48, 52, 50],
      [55, 58, 62, 60, 65, 68, 72],
    ],
  },
}

// 日期趋势数据
const dateTrendData = {
  1: {
    type: 'date',
    dates: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周'],
    metrics: ['访问次数', '学习时长(min)', '互动次数'],
    data: [
      [245, 328, 412, 385, 456, 489],
      [1890, 2450, 3100, 2850, 3420, 3680],
      [89, 112, 145, 128, 156, 168],
    ],
  },
}

// Mock 接口
export default function mockTeacherDashboard() {
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

  // 获取统计数据
  Mock.mock(/\/api\/teacher\/stats/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.searchParams.get('classId'))

    const data = statsData[classId] || statsData[1]
    return success(data)
  })

  // 获取成绩分布
  Mock.mock(/\/api\/teacher\/grade-distribution/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.searchParams.get('classId'))
    const examId = url.searchParams.get('examId')

    const data = gradeDistributionData[classId] || gradeDistributionData[1]
    return success(data)
  })

  // 获取高频错题
  Mock.mock(/\/api\/teacher\/high-frequency-errors/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.searchParams.get('classId'))
    const examId = url.searchParams.get('examId')

    const key = `${classId}_${examId || 1}`
    const data = highFrequencyErrorsData[key] || highFrequencyErrorsData['1_1']
    return success(data)
  })

  // 获取薄弱知识点
  Mock.mock(/\/api\/teacher\/weak-knowledge/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.searchParams.get('classId'))

    const data = weakKnowledgeData[classId] || weakKnowledgeData[1]
    return success(data)
  })

  // 获取活跃度热力图
  Mock.mock(/\/api\/teacher\/activity-heatmap/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.searchParams.get('classId'))
    const viewType = url.searchParams.get('viewType') || 'student'

    if (viewType === 'student') {
      const data = activityHeatmapData[classId] || activityHeatmapData[1]
      return success(data)
    } else {
      return success(dateTrendData[classId] || dateTrendData[1])
    }
  })

  // 获取题目详情
  Mock.mock(/\/api\/teacher\/question-detail/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const questionId = parseInt(url.searchParams.get('questionId'))

    return success({
      id: questionId,
      title: `第${questionId}题`,
      content: '这是一道关于三角函数的题目...',
      answer: '正确答案是A',
      analysis: '本题考察三角函数诱导公式的应用...',
      errorRate: 85,
      similarQuestions: [
        { id: 101, title: '类似题目1' },
        { id: 102, title: '类似题目2' },
      ],
    })
  })

  // 获取学生详情
  Mock.mock(/\/api\/teacher\/student-detail/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')

    return success({
      id: studentId,
      name: '张三',
      studentId: '20210001',
      className: '高三(1)班',
      avgScore: 85.5,
      rank: 8,
      totalStudents: 45,
      weakPoints: ['三角函数', '数列'],
      recentScores: [82, 88, 85, 90, 92],
    })
  })
}
