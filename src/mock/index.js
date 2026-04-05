import Mock from 'mockjs'
import { USE_MOCK } from '@/config/env'

// 配置 Mock 延迟
Mock.setup({
  timeout: '200-600',
})

import mockAuth from './modules/auth'
import mockPersonalCenter from './modules/personal-center'
import mockStudentDashboard from './modules/student-dashboard'
import mockStudentKnowledge from './modules/student-knowledge'
import mockStudentCourse from './modules/student-course'
import mockStudentHomework from './modules/student-homework'
import mockStudentGrade from './modules/student-grade'

// 注册所有 mock
export function setupMock() {
  // 只在开发环境启用
  if (USE_MOCK) {
    mockAuth()
    mockPersonalCenter()
    mockStudentDashboard()
    mockStudentKnowledge()
    mockStudentCourse()
    mockStudentHomework()
    mockStudentGrade()

    console.log('✅ Mock 数据已启用')
  }
}

//下面数据后面删除
// 模拟成绩分布数据 (箱线图用)
export const getGradeBoxData = () => {
  return Mock.mock({
    'data|5': [
      {
        'subject|+1': ['语文', '数学', '英语', '物理', '化学'],
        'values|100': ['@integer(40, 100)'],
      },
    ],
  }).data
}

// 模拟出勤热力图数据
export const getAttendanceHeatmapData = () => {
  const data = []
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    data.push([dateStr, Math.floor(Math.random() * 100)])
  }
  return data
}

// 模拟课程满意度数据 (雷达图)
export const getCourseSatisfactionData = () => {
  return Mock.mock({
    'data|6': [
      {
        'name|+1': ['教学内容', '授课方式', '互动程度', '难易程度', '作业量', '平台稳定性'],
        value: '@integer(60, 100)',
      },
    ],
  }).data
}

// 模拟教学资源使用数据 (漏斗图)
export const getResourceFunnelData = () => {
  return [
    { value: 100, name: '资源浏览' },
    { value: 80, name: '资源下载' },
    { value: 60, name: '在线学习' },
    { value: 40, name: '课后练习' },
    { value: 20, name: '完成评估' },
  ]
}

// 模拟学习行为轨迹数据 (桑基图)
export const getLearningBehaviorSankeyData = () => {
  return {
    nodes: [
      { name: '登录平台' },
      { name: '查看课程' },
      { name: '观看视频' },
      { name: '下载课件' },
      { name: '提交作业' },
      { name: '参与讨论' },
      { name: '退出系统' },
    ],
    links: [
      { source: '登录平台', target: '查看课程', value: 80 },
      { source: '查看课程', target: '观看视频', value: 50 },
      { source: '查看课程', target: '下载课件', value: 30 },
      { source: '观看视频', target: '提交作业', value: 40 },
      { source: '下载课件', target: '参与讨论', value: 10 },
      { source: '提交作业', target: '退出系统', value: 40 },
      { source: '参与讨论', target: '退出系统', value: 10 },
    ],
  }
}

// 模拟学生预警数据
export const getBehaviorWarningData = () => {
  return Mock.mock({
    'data|5-10': [
      {
        id: '@id',
        name: '@cname',
        'level|1': ['高危', '中危', '低危'],
        'reason|1': ['缺勤过多', '成绩下滑严重', '学习时长偏低', '作业多次未交'],
        date: '@date',
      },
    ],
  }).data
}

// 模拟个性化推荐
export const getRecommendationData = () => {
  return Mock.mock({
    'data|4': [
      {
        id: '@id',
        'title|1': [
          'Vue3 进阶实战',
          '深度学习与教育大数据',
          '高性能可视化组件开发',
          '前端架构师之路',
        ],
        'type|1': ['课程', '资料', '讲座'],
        match: '@integer(80, 99)',
      },
    ],
  }).data
}

// 拦截请求 (如果需要演示 XHR)
Mock.setup({ timeout: '200-600' })
