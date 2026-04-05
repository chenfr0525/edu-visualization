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
  ],
}

// 作业列表数据
const homeworkListData = [
  {
    id: 1,
    title: '函数与导数专题练习',
    className: '高三(1)班',
    classId: 1,
    deadline: '2026-03-25 23:59:59',
    status: 'ongoing',
    questionCount: 5,
    totalCount: 45,
    submittedCount: 28,
    gradedCount: 0,
    submitRate: 62,
    avgScore: null,
    createTime: '2026-03-18 10:00:00',
  },
  {
    id: 2,
    title: '三角函数综合测试',
    className: '高三(1)班',
    classId: 1,
    deadline: '2026-03-20 23:59:59',
    status: 'pending',
    questionCount: 8,
    totalCount: 45,
    submittedCount: 42,
    gradedCount: 15,
    submitRate: 93,
    avgScore: null,
    createTime: '2026-03-15 14:30:00',
  },
  {
    id: 3,
    title: '数列求和专项练习',
    className: '高三(2)班',
    classId: 2,
    deadline: '2026-03-18 23:59:59',
    status: 'completed',
    questionCount: 6,
    totalCount: 42,
    submittedCount: 40,
    gradedCount: 40,
    submitRate: 95,
    avgScore: 78.5,
    createTime: '2026-03-12 09:00:00',
  },
  {
    id: 4,
    title: '向量与几何综合',
    className: '高三(1)班',
    classId: 1,
    deadline: '2026-03-28 23:59:59',
    status: 'ongoing',
    questionCount: 7,
    totalCount: 45,
    submittedCount: 15,
    gradedCount: 0,
    submitRate: 33,
    avgScore: null,
    createTime: '2026-03-20 16:00:00',
  },
  {
    id: 5,
    title: '概率统计练习题',
    className: '高三(2)班',
    classId: 2,
    deadline: '2026-03-22 23:59:59',
    status: 'pending',
    questionCount: 5,
    totalCount: 42,
    submittedCount: 38,
    gradedCount: 20,
    submitRate: 90,
    avgScore: null,
    createTime: '2026-03-16 11:00:00',
  },
  {
    id: 6,
    title: '立体几何证明题',
    className: '高三(3)班',
    classId: 3,
    deadline: '2026-03-15 23:59:59',
    status: 'expired',
    questionCount: 4,
    totalCount: 44,
    submittedCount: 30,
    gradedCount: 30,
    submitRate: 68,
    avgScore: 72.3,
    createTime: '2026-03-10 08:30:00',
  },
]

// 统计数据
const statisticsData = {
  total: 12,
  ongoing: 3,
  pending: 2,
  completed: 7,
  avgScore: 76.8,
}

// 提交记录数据（按作业ID）
const submissionsData = {
  1: [
    {
      id: 101,
      studentId: 1,
      studentName: '张小明',
      studentNo: '2024001',
      submitTime: '2026-03-22 18:30:00',
      status: 'pending',
      content: '已完成所有题目，第3题不太确定...',
      totalScore: 100,
      gradeTime: null,
      answers: [
        {
          title: '求函数f(x)=x²+2x+1的导数',
          score: 20,
          studentAnswer: '2x+2',
          referenceAnswer: '2x+2',
          givenScore: null,
          comment: '',
        },
        {
          title: '证明函数f(x)=x³在R上单调递增',
          score: 20,
          studentAnswer: "f'(x)=3x²≥0，所以单调递增",
          referenceAnswer: "f'(x)=3x²≥0，所以单调递增",
          givenScore: null,
          comment: '',
        },
        {
          title: '求函数y=sin(2x+π/3)的周期',
          score: 20,
          studentAnswer: '周期为π',
          referenceAnswer: '周期为π',
          givenScore: null,
          comment: '',
        },
        {
          title: '已知函数f(x)=ax³+bx²+cx+d，求导',
          score: 20,
          studentAnswer: "f'(x)=3ax²+2bx+c",
          referenceAnswer: "f'(x)=3ax²+2bx+c",
          givenScore: null,
          comment: '',
        },
        {
          title: '求曲线y=x³-3x²+2x在x=1处的切线方程',
          score: 20,
          studentAnswer: 'y=-x+1',
          referenceAnswer: 'y=-x+1',
          givenScore: null,
          comment: '',
        },
      ],
    },
    {
      id: 102,
      studentId: 2,
      studentName: '李华',
      studentNo: '2024002',
      submitTime: '2026-03-22 20:15:00',
      status: 'pending',
      content: '完成',
      totalScore: 100,
      gradeTime: null,
      answers: [
        {
          title: '求函数f(x)=x²+2x+1的导数',
          score: 20,
          studentAnswer: '2x+1',
          referenceAnswer: '2x+2',
          givenScore: null,
          comment: '',
        },
        {
          title: '证明函数f(x)=x³在R上单调递增',
          score: 20,
          studentAnswer: '不会',
          referenceAnswer: "f'(x)=3x²≥0，所以单调递增",
          givenScore: null,
          comment: '',
        },
        {
          title: '求函数y=sin(2x+π/3)的周期',
          score: 20,
          studentAnswer: '2π',
          referenceAnswer: '周期为π',
          givenScore: null,
          comment: '',
        },
        {
          title: '已知函数f(x)=ax³+bx²+cx+d，求导',
          score: 20,
          studentAnswer: "f'(x)=3ax²+bx+c",
          referenceAnswer: "f'(x)=3ax²+2bx+c",
          givenScore: null,
          comment: '',
        },
        {
          title: '求曲线y=x³-3x²+2x在x=1处的切线方程',
          score: 20,
          studentAnswer: 'y=2x-1',
          referenceAnswer: 'y=-x+1',
          givenScore: null,
          comment: '',
        },
      ],
    },
    {
      id: 103,
      studentId: 3,
      studentName: '王芳',
      studentNo: '2024003',
      submitTime: '2026-03-23 09:00:00',
      status: 'pending',
      content: '题目有点难，部分不会',
      totalScore: 100,
      gradeTime: null,
      answers: [
        {
          title: '求函数f(x)=x²+2x+1的导数',
          score: 20,
          studentAnswer: '2x+2',
          referenceAnswer: '2x+2',
          givenScore: null,
          comment: '',
        },
        {
          title: '证明函数f(x)=x³在R上单调递增',
          score: 20,
          studentAnswer: "f'(x)=3x²≥0，成立",
          referenceAnswer: "f'(x)=3x²≥0，所以单调递增",
          givenScore: null,
          comment: '',
        },
        {
          title: '求函数y=sin(2x+π/3)的周期',
          score: 20,
          studentAnswer: 'π',
          referenceAnswer: '周期为π',
          givenScore: null,
          comment: '',
        },
        {
          title: '已知函数f(x)=ax³+bx²+cx+d，求导',
          score: 20,
          studentAnswer: "f'(x)=3ax²+2bx+c",
          referenceAnswer: "f'(x)=3ax²+2bx+c",
          givenScore: null,
          comment: '',
        },
        {
          title: '求曲线y=x³-3x²+2x在x=1处的切线方程',
          score: 20,
          studentAnswer: 'y=-x+1',
          referenceAnswer: 'y=-x+1',
          givenScore: null,
          comment: '',
        },
      ],
    },
  ],
  2: [
    {
      id: 201,
      studentId: 1,
      studentName: '张小明',
      studentNo: '2024001',
      submitTime: '2026-03-19 14:30:00',
      status: 'graded',
      content: '已完成',
      totalScore: 100,
      gradeTime: '2026-03-20 10:00:00',
      score: 85,
      answers: [
        {
          title: '求函数f(x)=x²+2x+1的导数',
          score: 10,
          studentAnswer: '2x+2',
          referenceAnswer: '2x+2',
          givenScore: 10,
          comment: '正确',
        },
        {
          title: '证明函数f(x)=x³在R上单调递增',
          score: 15,
          studentAnswer: "f'(x)=3x²≥0，所以单调递增",
          referenceAnswer: "f'(x)=3x²≥0，所以单调递增",
          givenScore: 15,
          comment: '正确',
        },
        {
          title: '求函数y=sin(2x+π/3)的周期和对称轴',
          score: 15,
          studentAnswer: '周期π，对称轴x=π/12+kπ/2',
          referenceAnswer: '周期π，对称轴x=π/12+kπ/2',
          givenScore: 12,
          comment: '对称轴公式正确',
        },
      ],
    },
    {
      id: 202,
      studentId: 2,
      studentName: '李华',
      studentNo: '2024002',
      submitTime: '2026-03-19 16:00:00',
      status: 'graded',
      content: '完成',
      totalScore: 100,
      gradeTime: '2026-03-20 10:30:00',
      score: 72,
      answers: [
        {
          title: '求函数f(x)=x²+2x+1的导数',
          score: 10,
          studentAnswer: '2x+1',
          referenceAnswer: '2x+2',
          givenScore: 5,
          comment: '常数项求导错误',
        },
        {
          title: '证明函数f(x)=x³在R上单调递增',
          score: 15,
          studentAnswer: '不会',
          referenceAnswer: "f'(x)=3x²≥0，所以单调递增",
          givenScore: 0,
          comment: '未作答',
        },
        {
          title: '求函数y=sin(2x+π/3)的周期和对称轴',
          score: 15,
          studentAnswer: '周期2π',
          referenceAnswer: '周期π，对称轴x=π/12+kπ/2',
          givenScore: 5,
          comment: '周期计算错误',
        },
      ],
    },
  ],
}

// 作业分析数据（按作业ID）
const analysisData = {
  1: {
    avgScore: null,
    highestScore: null,
    lowestScore: null,
    passRate: null,
    submitRate: 62,
    scoreDistribution: [],
    questionAccuracy: [
      { index: 1, accuracy: 85, correctCount: 34, totalCount: 40 },
      { index: 2, accuracy: 72, correctCount: 29, totalCount: 40 },
      { index: 3, accuracy: 45, correctCount: 18, totalCount: 40 },
      { index: 4, accuracy: 68, correctCount: 27, totalCount: 40 },
      { index: 5, accuracy: 92, correctCount: 37, totalCount: 40 },
    ],
    wrongQuestions: [
      {
        index: 3,
        title: '已知函数f(x)=ax³+bx²+cx+d，求导并求极值点',
        errorRate: 55,
        wrongCount: 22,
      },
      { index: 2, title: '求函数y=sin(2x+π/3)的周期和对称轴', errorRate: 28, wrongCount: 11 },
      { index: 4, title: '证明：对于任意实数x，有e^x ≥ x+1', errorRate: 32, wrongCount: 13 },
    ],
  },
  2: {
    avgScore: 78.5,
    highestScore: 98,
    lowestScore: 45,
    passRate: 85,
    submitRate: 93,
    scoreDistribution: [
      { range: '90-100', count: 8 },
      { range: '80-89', count: 12 },
      { range: '70-79', count: 10 },
      { range: '60-69', count: 5 },
      { range: '<60', count: 5 },
    ],
    questionAccuracy: [
      { index: 1, accuracy: 85, correctCount: 34, totalCount: 40 },
      { index: 2, accuracy: 72, correctCount: 29, totalCount: 40 },
      { index: 3, accuracy: 45, correctCount: 18, totalCount: 40 },
      { index: 4, accuracy: 68, correctCount: 27, totalCount: 40 },
      { index: 5, accuracy: 92, correctCount: 37, totalCount: 40 },
      { index: 6, accuracy: 78, correctCount: 31, totalCount: 40 },
      { index: 7, accuracy: 62, correctCount: 25, totalCount: 40 },
      { index: 8, accuracy: 55, correctCount: 22, totalCount: 40 },
    ],
    wrongQuestions: [
      { index: 8, title: '综合应用题：函数与导数的实际应用', errorRate: 45, wrongCount: 18 },
      { index: 3, title: '三角恒等变换证明题', errorRate: 55, wrongCount: 22 },
      { index: 7, title: '数列与不等式综合', errorRate: 38, wrongCount: 15 },
    ],
  },
  3: {
    avgScore: 78.5,
    highestScore: 98,
    lowestScore: 45,
    passRate: 85,
    submitRate: 95,
    scoreDistribution: [
      { range: '90-100', count: 8 },
      { range: '80-89', count: 12 },
      { range: '70-79', count: 10 },
      { range: '60-69', count: 5 },
      { range: '<60', count: 5 },
    ],
    questionAccuracy: [
      { index: 1, accuracy: 88, correctCount: 35, totalCount: 40 },
      { index: 2, accuracy: 75, correctCount: 30, totalCount: 40 },
      { index: 3, accuracy: 52, correctCount: 21, totalCount: 40 },
      { index: 4, accuracy: 70, correctCount: 28, totalCount: 40 },
      { index: 5, accuracy: 82, correctCount: 33, totalCount: 40 },
      { index: 6, accuracy: 65, correctCount: 26, totalCount: 40 },
    ],
    wrongQuestions: [
      { index: 3, title: '复杂数列求和问题', errorRate: 48, wrongCount: 19 },
      { index: 6, title: '数学归纳法证明', errorRate: 35, wrongCount: 14 },
    ],
  },
}

// 下一个作业ID
let nextHomeworkId = 10

// Mock 接口
export default function mockHomeworkManage() {
  // 获取班级列表
  Mock.mock(/\/api\/teacher\/classes/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const teacherId = url.searchParams.get('teacherId')
    const id = teacherId ? parseInt(teacherId) : currentTeacherId

    const data = classListData[id] || classListData[2]
    return success(data)
  })

  // 获取作业列表
  Mock.mock(/\/api\/teacher\/homeworks/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
    const classId = url.searchParams.get('classId')
    const status = url.searchParams.get('status')
    const keyword = url.searchParams.get('keyword') || ''

    let filtered = [...homeworkListData]

    if (classId) {
      filtered = filtered.filter((h) => h.classId === parseInt(classId))
    }
    if (status) {
      filtered = filtered.filter((h) => h.status === status)
    }
    if (keyword) {
      filtered = filtered.filter((h) => h.title.includes(keyword))
    }

    const total = filtered.length
    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize)

    return success({ list, total, page, pageSize })
  })

  // 获取统计数据
  Mock.mock(/\/api\/teacher\/homeworks\/statistics/, 'get', () => {
    return success(statisticsData)
  })

  // 获取作业提交列表
  Mock.mock(/\/api\/teacher\/homework\/\d+\/submissions/, 'get', (options) => {
    const url = options.url
    const homeworkId = parseInt(url.match(/\/homework\/(\d+)\/submissions/)[1])

    const data = submissionsData[homeworkId] || []
    return success({ list: data })
  })

  // 提交批改
  Mock.mock(/\/api\/teacher\/homework\/submission\/\d+\/grade/, 'post', (options) => {
    const body = JSON.parse(options.body)
    const url = options.url
    const submissionId = parseInt(url.match(/\/submission\/(\d+)\/grade/)[1])

    // 更新提交记录状态
    for (const key in submissionsData) {
      const submission = submissionsData[key].find((s) => s.id === submissionId)
      if (submission) {
        submission.status = 'graded'
        submission.gradeTime = new Date().toISOString().replace('T', ' ').slice(0, 19)
        submission.score = body.totalScore
        submission.answers = body.answers
        break
      }
    }

    return success(null, '批改成功')
  })

  // 获取作业分析数据
  Mock.mock(/\/api\/teacher\/homework\/\d+\/analysis/, 'get', (options) => {
    const url = options.url
    const homeworkId = parseInt(url.match(/\/homework\/(\d+)\/analysis/)[1])

    const data = analysisData[homeworkId] || {
      avgScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passRate: 0,
      submitRate: 0,
      scoreDistribution: [],
      questionAccuracy: [],
      wrongQuestions: [],
    }
    return success(data)
  })

  // 删除作业
  Mock.mock(/\/api\/teacher\/homework\/\d+/, 'delete', (options) => {
    const url = options.url
    const homeworkId = parseInt(url.match(/\/homework\/(\d+)/)[1])

    const index = homeworkListData.findIndex((h) => h.id === homeworkId)
    if (index !== -1) {
      homeworkListData.splice(index, 1)
      return success(null, '删除成功')
    }
    return error('作业不存在', 404)
  })

  // 发布作业
  Mock.mock(/\/api\/teacher\/homework/, 'post', (options) => {
    const body = JSON.parse(options.body)
    const newHomework = {
      id: nextHomeworkId++,
      title: body.title,
      className: classListData[2].find((c) => c.id === body.classId)?.name || '未知班级',
      classId: body.classId,
      deadline: body.deadline,
      status: 'ongoing',
      questionCount: body.questions?.length || 0,
      totalCount: classListData[2].find((c) => c.id === body.classId)?.studentCount || 45,
      submittedCount: 0,
      gradedCount: 0,
      submitRate: 0,
      avgScore: null,
      createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }
    homeworkListData.unshift(newHomework)
    return success(newHomework, '发布成功')
  })

  // 更新作业
  Mock.mock(/\/api\/teacher\/homework\/\d+/, 'put', (options) => {
    const url = options.url
    const homeworkId = parseInt(url.match(/\/homework\/(\d+)/)[1])
    const body = JSON.parse(options.body)

    const index = homeworkListData.findIndex((h) => h.id === homeworkId)
    if (index !== -1) {
      homeworkListData[index] = { ...homeworkListData[index], ...body }
      return success(homeworkListData[index], '更新成功')
    }
    return error('作业不存在', 404)
  })
}
