import Mock from 'mockjs'
import { success } from '../utils'

// 模拟当前教师ID
let currentTeacherId = 2

export function setCurrentTeacherId(id) {
  currentTeacherId = id
}

// 课程列表
const courseListData = {
  2: [
    {
      id: 1,
      name: '数学',
      description: '高中数学课程，涵盖函数、几何、概率等',
      icon: 'calculator',
      teacher: '李华',
    },
    {
      id: 2,
      name: '语文',
      description: '高中语文课程，涵盖文言文、现代文、写作等',
      icon: 'book',
      teacher: '王芳',
    },
    {
      id: 3,
      name: '英语',
      description: '高中英语课程，涵盖语法、阅读、写作等',
      icon: 'language',
      teacher: '张伟',
    },
    {
      id: 4,
      name: '物理',
      description: '高中物理课程，涵盖力学、电磁学等',
      icon: 'flask',
      teacher: '刘强',
    },
    {
      id: 5,
      name: '化学',
      description: '高中化学课程，涵盖无机、有机化学等',
      icon: 'atom',
      teacher: '陈丽',
    },
  ],
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

// 课程概览统计数据
const courseOverviewData = {
  1: {
    // 数学
    avgScore: 78.5,
    passRate: 85,
    excellentRate: 32,
    homeworkCompletion: 91,
    scoreTrend: 5.2,
  },
  2: {
    // 语文
    avgScore: 82.3,
    passRate: 88,
    excellentRate: 38,
    homeworkCompletion: 93,
    scoreTrend: 3.5,
  },
  3: {
    // 英语
    avgScore: 76.8,
    passRate: 82,
    excellentRate: 28,
    homeworkCompletion: 89,
    scoreTrend: 2.8,
  },
  4: {
    // 物理
    avgScore: 74.2,
    passRate: 78,
    excellentRate: 24,
    homeworkCompletion: 86,
    scoreTrend: 4.2,
  },
  5: {
    // 化学
    avgScore: 75.5,
    passRate: 80,
    excellentRate: 26,
    homeworkCompletion: 88,
    scoreTrend: 3.8,
  },
}

// 知识点掌握数据（按课程）
const knowledgePointsData = {
  1: {
    // 数学
    knowledgePoints: [
      { name: '函数与导数', mastery: 82, errorRate: 18, questionCount: 12, avgScoreRate: 82 },
      { name: '三角函数', mastery: 68, errorRate: 32, questionCount: 10, avgScoreRate: 68 },
      { name: '数列', mastery: 75, errorRate: 25, questionCount: 8, avgScoreRate: 75 },
      { name: '立体几何', mastery: 58, errorRate: 42, questionCount: 15, avgScoreRate: 58 },
      { name: '解析几何', mastery: 62, errorRate: 38, questionCount: 12, avgScoreRate: 62 },
      { name: '概率统计', mastery: 85, errorRate: 15, questionCount: 8, avgScoreRate: 85 },
      { name: '复数', mastery: 90, errorRate: 10, questionCount: 5, avgScoreRate: 90 },
    ],
    weakPoints: [
      { name: '立体几何', mastery: 58, errorRate: 42, rank: 1 },
      { name: '解析几何', mastery: 62, errorRate: 38, rank: 2 },
      { name: '三角函数', mastery: 68, errorRate: 32, rank: 3 },
      { name: '数列', mastery: 75, errorRate: 25, rank: 4 },
      { name: '函数与导数', mastery: 82, errorRate: 18, rank: 5 },
    ],
  },
  2: {
    // 语文
    knowledgePoints: [
      { name: '文言文阅读', mastery: 75, errorRate: 25, questionCount: 15, avgScoreRate: 75 },
      { name: '现代文阅读', mastery: 80, errorRate: 20, questionCount: 12, avgScoreRate: 80 },
      { name: '古诗鉴赏', mastery: 65, errorRate: 35, questionCount: 10, avgScoreRate: 65 },
      { name: '作文', mastery: 70, errorRate: 30, questionCount: 8, avgScoreRate: 70 },
      { name: '基础知识', mastery: 85, errorRate: 15, questionCount: 20, avgScoreRate: 85 },
    ],
    weakPoints: [
      { name: '古诗鉴赏', mastery: 65, errorRate: 35, rank: 1 },
      { name: '作文', mastery: 70, errorRate: 30, rank: 2 },
      { name: '文言文阅读', mastery: 75, errorRate: 25, rank: 3 },
    ],
  },
  3: {
    // 英语
    knowledgePoints: [
      { name: '语法', mastery: 72, errorRate: 28, questionCount: 20, avgScoreRate: 72 },
      { name: '词汇', mastery: 78, errorRate: 22, questionCount: 30, avgScoreRate: 78 },
      { name: '阅读理解', mastery: 70, errorRate: 30, questionCount: 15, avgScoreRate: 70 },
      { name: '完形填空', mastery: 65, errorRate: 35, questionCount: 10, avgScoreRate: 65 },
      { name: '写作', mastery: 68, errorRate: 32, questionCount: 8, avgScoreRate: 68 },
    ],
    weakPoints: [
      { name: '完形填空', mastery: 65, errorRate: 35, rank: 1 },
      { name: '写作', mastery: 68, errorRate: 32, rank: 2 },
      { name: '阅读理解', mastery: 70, errorRate: 30, rank: 3 },
    ],
  },
  4: {
    // 物理
    knowledgePoints: [
      { name: '力学', mastery: 72, errorRate: 28, questionCount: 25, avgScoreRate: 72 },
      { name: '电磁学', mastery: 60, errorRate: 40, questionCount: 20, avgScoreRate: 60 },
      { name: '热学', mastery: 75, errorRate: 25, questionCount: 10, avgScoreRate: 75 },
      { name: '光学', mastery: 80, errorRate: 20, questionCount: 8, avgScoreRate: 80 },
      { name: '近代物理', mastery: 55, errorRate: 45, questionCount: 12, avgScoreRate: 55 },
    ],
    weakPoints: [
      { name: '近代物理', mastery: 55, errorRate: 45, rank: 1 },
      { name: '电磁学', mastery: 60, errorRate: 40, rank: 2 },
      { name: '力学', mastery: 72, errorRate: 28, rank: 3 },
    ],
  },
  5: {
    // 化学
    knowledgePoints: [
      { name: '无机化学', mastery: 75, errorRate: 25, questionCount: 20, avgScoreRate: 75 },
      { name: '有机化学', mastery: 65, errorRate: 35, questionCount: 18, avgScoreRate: 65 },
      { name: '化学反应原理', mastery: 70, errorRate: 30, questionCount: 15, avgScoreRate: 70 },
      { name: '化学实验', mastery: 80, errorRate: 20, questionCount: 12, avgScoreRate: 80 },
      { name: '化学计算', mastery: 68, errorRate: 32, questionCount: 10, avgScoreRate: 68 },
    ],
    weakPoints: [
      { name: '有机化学', mastery: 65, errorRate: 35, rank: 1 },
      { name: '化学计算', mastery: 68, errorRate: 32, rank: 2 },
      { name: '化学反应原理', mastery: 70, errorRate: 30, rank: 3 },
    ],
  },
}

// 成绩趋势数据
const trendData = {
  1: {
    // 数学
    exams: ['月考1', '月考2', '期中', '月考3', '期末'],
    avgScore: [72, 75, 78, 76, 82],
    highestScore: [95, 96, 98, 97, 99],
    passRate: [68, 72, 78, 75, 85],
  },
  2: {
    // 语文
    exams: ['月考1', '月考2', '期中', '月考3', '期末'],
    avgScore: [78, 80, 82, 81, 85],
    highestScore: [92, 94, 95, 93, 96],
    passRate: [75, 78, 82, 80, 88],
  },
  3: {
    // 英语
    exams: ['月考1', '月考2', '期中', '月考3', '期末'],
    avgScore: [70, 73, 76, 75, 80],
    highestScore: [90, 92, 94, 91, 95],
    passRate: [65, 70, 75, 72, 82],
  },
  4: {
    // 物理
    exams: ['月考1', '月考2', '期中', '月考3', '期末'],
    avgScore: [68, 70, 74, 72, 78],
    highestScore: [88, 90, 92, 89, 94],
    passRate: [62, 66, 72, 70, 78],
  },
  5: {
    // 化学
    exams: ['月考1', '月考2', '期中', '月考3', '期末'],
    avgScore: [70, 72, 75, 74, 80],
    highestScore: [89, 91, 93, 90, 95],
    passRate: [64, 68, 74, 72, 80],
  },
}

// 班级对比数据
const classCompareData = {
  1: [
    // 数学
    { className: '高三(1)班', avgScore: 78.5, passRate: 85, excellentRate: 32, rank: 1 },
    { className: '高三(2)班', avgScore: 72.3, passRate: 76, excellentRate: 24, rank: 3 },
    { className: '高三(3)班', avgScore: 75.8, passRate: 81, excellentRate: 28, rank: 2 },
    { className: '高三(4)班', avgScore: 70.2, passRate: 72, excellentRate: 20, rank: 4 },
  ],
  2: [
    // 语文
    { className: '高三(1)班', avgScore: 82.3, passRate: 88, excellentRate: 38, rank: 1 },
    { className: '高三(2)班', avgScore: 78.5, passRate: 84, excellentRate: 32, rank: 2 },
    { className: '高三(3)班', avgScore: 76.2, passRate: 82, excellentRate: 28, rank: 3 },
    { className: '高三(4)班', avgScore: 74.5, passRate: 80, excellentRate: 26, rank: 4 },
  ],
  3: [
    // 英语
    { className: '高三(1)班', avgScore: 76.8, passRate: 82, excellentRate: 28, rank: 1 },
    { className: '高三(2)班', avgScore: 74.2, passRate: 80, excellentRate: 26, rank: 2 },
    { className: '高三(3)班', avgScore: 72.5, passRate: 78, excellentRate: 24, rank: 3 },
    { className: '高三(4)班', avgScore: 70.8, passRate: 76, excellentRate: 22, rank: 4 },
  ],
}

// 散点图数据
const scatterData = {
  1: {
    // 数学
    students: ['张小明', '李华', '王芳', '赵雷', '陈晨', '刘洋', '周婷', '吴迪', '郑爽', '黄涛'],
    scores: [92, 78, 85, 62, 88, 45, 95, 72, 68, 82],
    homeworkRate: [95, 85, 90, 70, 92, 60, 98, 80, 75, 88],
    improvement: [5, -2, 8, -5, 3, -10, 12, 0, -3, 4],
  },
  2: {
    // 语文
    students: ['张小明', '李华', '王芳', '赵雷', '陈晨', '刘洋', '周婷', '吴迪', '郑爽', '黄涛'],
    scores: [88, 92, 85, 78, 90, 72, 95, 82, 86, 80],
    homeworkRate: [92, 96, 88, 85, 94, 78, 98, 86, 90, 84],
    improvement: [3, 6, -1, 2, 5, -4, 8, 1, 4, -2],
  },
}

export default function mockCourseAnalyse() {
  // 获取课程列表
  Mock.mock(/\/api\/teacher\/courses/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const teacherId = url.searchParams.get('teacherId')
    const id = teacherId ? parseInt(teacherId) : currentTeacherId

    const data = courseListData[id] || courseListData[2]
    return success(data)
  })

  // 获取班级列表
  Mock.mock(/\/api\/teacher\/classes/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const teacherId = url.searchParams.get('teacherId')
    const id = teacherId ? parseInt(teacherId) : currentTeacherId

    const data = classListData[id] || classListData[2]
    return success(data)
  })

  // 获取课程概览统计
  Mock.mock(/\/api\/teacher\/course\/\d+\/overview/, 'get', (options) => {
    const url = options.url
    const courseId = parseInt(url.match(/\/course\/(\d+)\/overview/)[1])

    const data = courseOverviewData[courseId] || courseOverviewData[1]
    return success(data)
  })

  // 获取知识点掌握数据
  Mock.mock(/\/api\/teacher\/course\/\d+\/knowledge-mastery/, 'get', (options) => {
    const url = options.url
    const courseId = parseInt(url.match(/\/course\/(\d+)\/knowledge-mastery/)[1])

    const data = knowledgePointsData[courseId] || knowledgePointsData[1]
    return success(data)
  })

  // 获取成绩趋势数据
  Mock.mock(/\/api\/teacher\/course\/\d+\/trend/, 'get', (options) => {
    const url = options.url
    const courseId = parseInt(url.match(/\/course\/(\d+)\/trend/)[1])

    const data = trendData[courseId] || trendData[1]
    return success(data)
  })

  // 获取班级对比数据
  Mock.mock(/\/api\/teacher\/course\/\d+\/class-compare/, 'get', (options) => {
    const url = options.url
    const courseId = parseInt(url.match(/\/course\/(\d+)\/class-compare/)[1])

    const data = classCompareData[courseId] || classCompareData[1]
    return success(data)
  })

  // 获取散点图数据
  Mock.mock(/\/api\/teacher\/course\/\d+\/scatter/, 'get', (options) => {
    const url = options.url
    const courseId = parseInt(url.match(/\/course\/(\d+)\/scatter/)[1])

    const data = scatterData[courseId] || scatterData[1]
    return success(data)
  })
}
