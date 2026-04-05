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

// 课程选项
const courseOptionsData = {
  1: [
    { label: '全部课程', value: 'all' },
    { label: '高等数学', value: '高等数学' },
    { label: '大学英语', value: '大学英语' },
    { label: 'Python程序设计', value: 'Python程序设计' },
    { label: '物理实验', value: '物理实验' },
    { label: '数据结构', value: '数据结构' },
    { label: '算法', value: '算法' },
    { label: '软件工程', value: '软件工程' },
    { label: '计算机网络', value: '计算机网络' },
    { label: '操作系统', value: '操作系统' },
    { label: '数据库', value: '数据库' },
  ],
  3: [
    { label: '全部课程', value: 'all' },
    { label: '高等数学', value: '高等数学' },
    { label: '大学英语', value: '大学英语' },
    { label: 'Python程序设计', value: 'Python程序设计' },
  ],
}

// 状态选项
const statusOptions = [
  { label: '全部作业', value: 'all' },
  { label: '待提交', value: 'pending' },
  { label: '已提交', value: 'submitted' },
  { label: '已批改', value: 'graded' },
  { label: '已逾期', value: 'overdue' },
]

// 统计数据
const statsData = {
  1: {
    pending: 3,
    graded: 8,
    avgScore: 85.6,
    onTimeRate: 92,
  },
  3: {
    pending: 4,
    graded: 5,
    avgScore: 82.3,
    onTimeRate: 88,
  },
}

// 作业列表数据
const homeworkListData = {
  1: [
    {
      id: 1,
      assignmentName: '函数与极限练习题',
      course: '高等数学',
      deadline: '2026-03-20 23:59:59',
      status: 'pending',
      statusText: '待提交',
      score: null,
      submitTime: null,
      feedback: null,
      description: '完成第三章课后习题1-10题',
      attachment: 'homework_1.pdf',
      difficulty: '中等',
    },
    {
      id: 2,
      assignmentName: '导数与微分应用',
      course: '高等数学',
      deadline: '2026-03-22 23:59:59',
      status: 'pending',
      statusText: '待提交',
      score: null,
      submitTime: null,
      feedback: null,
      description: '利用导数解决实际问题',
      attachment: null,
      difficulty: '困难',
    },
    {
      id: 3,
      assignmentName: 'Unit 3 作文',
      course: '大学英语',
      deadline: '2026-03-18 23:59:59',
      status: 'overdue',
      statusText: '已逾期',
      score: null,
      submitTime: null,
      feedback: null,
      description: '写一篇关于环保的英语作文，字数不少于200词',
      attachment: null,
      difficulty: '中等',
    },
    {
      id: 4,
      assignmentName: 'Python基础语法练习',
      course: 'Python程序设计',
      deadline: '2026-03-15 23:59:59',
      status: 'submitted',
      statusText: '已提交',
      score: null,
      submitTime: '2026-03-14 15:30:00',
      feedback: null,
      description: '完成变量、条件语句、循环语句的练习',
      attachment: 'python_homework.py',
      difficulty: '简单',
    },
    {
      id: 5,
      assignmentName: '力学实验报告',
      course: '物理实验',
      deadline: '2026-03-10 23:59:59',
      status: 'graded',
      statusText: '已批改',
      score: 88,
      submitTime: '2026-03-09 20:15:00',
      feedback: '实验数据记录完整，分析合理，结论正确。建议：可以进一步思考误差来源。',
      attachment: 'physics_report.docx',
      difficulty: '中等',
    },
    {
      id: 6,
      assignmentName: '期中考试复习题',
      course: '高等数学',
      deadline: '2026-03-25 23:59:59',
      status: 'pending',
      statusText: '待提交',
      score: null,
      submitTime: null,
      feedback: null,
      description: '完成期中考试模拟试卷',
      attachment: 'midterm_review.pdf',
      difficulty: '困难',
    },
    {
      id: 7,
      assignmentName: 'Unit 2 听力练习',
      course: '大学英语',
      deadline: '2026-03-12 23:59:59',
      status: 'graded',
      statusText: '已批改',
      score: 92,
      submitTime: '2026-03-11 10:00:00',
      feedback: '听力理解准确率高，继续加油！',
      attachment: null,
      difficulty: '简单',
    },
    {
      id: 8,
      assignmentName: '面向对象编程项目',
      course: 'Python程序设计',
      deadline: '2026-03-28 23:59:59',
      status: 'pending',
      statusText: '待提交',
      score: null,
      submitTime: null,
      feedback: null,
      description: '设计一个学生管理系统',
      attachment: 'project_requirements.pdf',
      difficulty: '困难',
    },
    {
      id: 9,
      assignmentName: '光学实验报告',
      course: '物理实验',
      deadline: '2026-03-05 23:59:59',
      status: 'graded',
      statusText: '已批改',
      score: 85,
      submitTime: '2026-03-04 18:30:00',
      feedback: '实验操作规范，数据分析正确。',
      attachment: 'optics_report.docx',
      difficulty: '中等',
    },
    {
      id: 10,
      assignmentName: '链表实现',
      course: '数据结构',
      deadline: '2026-03-30 23:59:59',
      status: 'pending',
      statusText: '待提交',
      score: null,
      submitTime: null,
      feedback: null,
      description: '用C++实现单链表的基本操作',
      attachment: null,
      difficulty: '中等',
    },
    {
      id: 11,
      assignmentName: '排序算法实现',
      course: '算法',
      deadline: '2026-03-08 23:59:59',
      status: 'submitted',
      statusText: '已提交',
      score: null,
      submitTime: '2026-03-07 22:00:00',
      feedback: null,
      description: '实现快速排序、归并排序算法',
      attachment: 'sort_algorithm.py',
      difficulty: '困难',
    },
    {
      id: 12,
      assignmentName: '需求分析文档',
      course: '软件工程',
      deadline: '2026-03-16 23:59:59',
      status: 'graded',
      statusText: '已批改',
      score: 90,
      submitTime: '2026-03-15 14:00:00',
      feedback: '需求分析全面，文档规范。',
      attachment: 'requirements.docx',
      difficulty: '中等',
    },
  ],
  3: [
    {
      id: 1,
      assignmentName: '函数与极限练习题',
      course: '高等数学',
      deadline: '2026-03-20 23:59:59',
      status: 'pending',
      statusText: '待提交',
      score: null,
      submitTime: null,
      feedback: null,
      description: '完成第三章课后习题1-10题',
      attachment: 'homework_1.pdf',
      difficulty: '中等',
    },
    {
      id: 2,
      assignmentName: 'Unit 3 作文',
      course: '大学英语',
      deadline: '2026-03-18 23:59:59',
      status: 'submitted',
      statusText: '已提交',
      score: null,
      submitTime: '2026-03-17 16:00:00',
      feedback: null,
      description: '写一篇关于环保的英语作文',
      attachment: null,
      difficulty: '中等',
    },
    {
      id: 3,
      assignmentName: 'Python基础语法练习',
      course: 'Python程序设计',
      deadline: '2026-03-15 23:59:59',
      status: 'graded',
      statusText: '已批改',
      score: 85,
      submitTime: '2026-03-14 14:30:00',
      feedback: '完成度不错，注意代码规范',
      attachment: 'python_homework.py',
      difficulty: '简单',
    },
  ],
}

// Mock 接口
export default function mockHomeworkTracking() {
  // 获取课程选项
  Mock.mock(/\/api\/homework\/courses/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = courseOptionsData[id] || courseOptionsData[1]
    return success(data)
  })

  // 获取状态选项
  Mock.mock(/\/api\/homework\/status-options/, 'get', () => {
    return success(statusOptions)
  })

  // 获取统计数据
  Mock.mock(/\/api\/homework\/stats/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = statsData[id] || statsData[1]
    return success(data)
  })

  // 获取作业列表
  Mock.mock(/\/api\/homework\/list/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const course = url.searchParams.get('course')
    const status = url.searchParams.get('status')
    const keyword = url.searchParams.get('keyword')
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10

    const id = studentId ? parseInt(studentId) : currentStudentId
    let data = homeworkListData[id] || homeworkListData[1]

    // 按课程筛选
    if (course && course !== 'all') {
      data = data.filter((item) => item.course === course)
    }

    // 按状态筛选
    if (status && status !== 'all') {
      data = data.filter((item) => item.status === status)
    }

    // 按关键词搜索
    if (keyword) {
      data = data.filter(
        (item) => item.assignmentName.includes(keyword) || item.course.includes(keyword),
      )
    }

    // 分页
    const total = data.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = data.slice(start, end)

    return success({
      list,
      total,
      page,
      pageSize,
    })
  })

  // 获取作业详情
  Mock.mock(/\/api\/homework\/detail/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const homeworkId = parseInt(url.searchParams.get('homeworkId'))
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = homeworkListData[id] || homeworkListData[1]
    const homework = data.find((item) => item.id === homeworkId)

    if (!homework) {
      return error('作业不存在', 404)
    }

    return success(homework)
  })

  // 提交作业
  Mock.mock(/\/api\/homework\/submit/, 'post', (options) => {
    const body = JSON.parse(options.body)
    const { homeworkId, content, files } = body

    return success(
      {
        homeworkId,
        submitTime: new Date().toISOString(),
        status: 'submitted',
        message: '作业提交成功，请等待老师批改',
      },
      '提交成功',
    )
  })

  // 查看作业解析
  Mock.mock(/\/api\/homework\/analysis/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const homeworkId = parseInt(url.searchParams.get('homeworkId'))

    return success({
      homeworkId,
      analysis: '这是一份详细的作业解析...',
      keyPoints: ['知识点1', '知识点2', '知识点3'],
      commonMistakes: ['常见错误1', '常见错误2'],
      referenceAnswer: '参考答案内容...',
    })
  })

  // 获取作业统计（按时率趋势等）
  Mock.mock(/\/api\/homework\/trend/, 'get', () => {
    return success({
      onTimeTrend: [
        { month: '9月', rate: 85 },
        { month: '10月', rate: 88 },
        { month: '11月', rate: 90 },
        { month: '12月', rate: 87 },
        { month: '1月', rate: 92 },
        { month: '2月', rate: 89 },
      ],
      scoreDistribution: [
        { range: '90-100', count: 5 },
        { range: '80-89', count: 8 },
        { range: '70-79', count: 4 },
        { range: '60-69', count: 2 },
        { range: '<60', count: 1 },
      ],
    })
  })
}
