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
  ],
}

// 活跃度概览统计数据
const overviewStatsData = {
  1: {
    avgDailyDuration: 48.5,
    avgDailyVisits: 3.2,
    avgDailyInteractions: 1.8,
    activeRate: 78,
    peakHour: '20:00',
    durationTrend: 5.2,
  },
  2: {
    avgDailyDuration: 42.3,
    avgDailyVisits: 2.8,
    avgDailyInteractions: 1.5,
    activeRate: 72,
    peakHour: '19:30',
    durationTrend: 2.8,
  },
  3: {
    avgDailyDuration: 45.8,
    avgDailyVisits: 3.0,
    avgDailyInteractions: 1.6,
    activeRate: 75,
    peakHour: '20:15',
    durationTrend: 3.5,
  },
}

// 趋势数据
const trendData = {
  1: {
    dates: ['03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22'],
    duration: [45, 52, 48, 55, 62, 58, 65],
    visits: [3.2, 3.5, 3.1, 3.8, 4.2, 3.9, 4.5],
    interactions: [1.5, 1.8, 1.6, 2.0, 2.3, 2.1, 2.5],
  },
  2: {
    dates: ['03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22'],
    duration: [38, 42, 40, 45, 48, 46, 50],
    visits: [2.5, 2.8, 2.6, 3.0, 3.2, 3.1, 3.5],
    interactions: [1.2, 1.4, 1.3, 1.6, 1.8, 1.7, 2.0],
  },
  3: {
    dates: ['03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22'],
    duration: [42, 46, 44, 50, 52, 49, 55],
    visits: [2.8, 3.0, 2.9, 3.3, 3.5, 3.4, 3.8],
    interactions: [1.3, 1.5, 1.4, 1.7, 1.9, 1.8, 2.1],
  },
}

// 时段分布数据
const hourlyData = {
  1: {
    hours: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    data: [5, 3, 2, 1, 1, 2, 5, 15, 25, 35, 45, 50, 48, 52, 55, 58, 62, 68, 75, 82, 78, 65, 48, 32],
  },
  2: {
    hours: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    data: [4, 2, 1, 1, 1, 1, 4, 12, 20, 28, 38, 42, 40, 45, 48, 50, 52, 55, 60, 65, 62, 52, 38, 25],
  },
  3: {
    hours: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    data: [4, 2, 1, 1, 1, 2, 4, 13, 22, 30, 40, 45, 44, 48, 50, 52, 55, 58, 65, 70, 68, 58, 42, 28],
  },
}

// 热力图数据
const heatmapData = {
  1: {
    students: [
      '张小明',
      '李华',
      '王芳',
      '赵雷',
      '陈晨',
      '刘洋',
      '周婷',
      '吴迪',
      '郑爽',
      '黄涛',
      '孙明',
      '周杰',
      '吴婷婷',
      '郑浩然',
      '林晓',
      '郭峰',
      '宋阳',
      '唐雅欣',
      '沈梦辰',
      '欧阳雪',
    ],
    dates: ['03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22'],
    durationData: [
      [45, 52, 48, 55, 62, 58, 65],
      [38, 42, 40, 45, 48, 46, 50],
      [52, 48, 55, 58, 62, 60, 65],
      [25, 32, 28, 35, 38, 42, 40],
      [55, 58, 52, 60, 65, 62, 68],
      [42, 45, 48, 50, 52, 48, 55],
      [78, 82, 75, 85, 88, 85, 90],
      [35, 38, 32, 40, 42, 45, 48],
      [62, 65, 60, 68, 72, 70, 75],
      [48, 52, 45, 55, 58, 56, 60],
      [40, 42, 38, 45, 48, 46, 50],
      [50, 52, 48, 55, 58, 56, 60],
      [70, 72, 68, 75, 78, 76, 80],
      [30, 32, 28, 35, 38, 36, 40],
      [55, 58, 52, 60, 62, 60, 65],
      [45, 48, 42, 50, 52, 50, 55],
      [38, 40, 35, 42, 45, 43, 48],
      [60, 62, 58, 65, 68, 66, 70],
      [50, 52, 48, 55, 58, 56, 60],
      [42, 45, 40, 48, 50, 48, 52],
    ],
    visitsData: [
      [3, 4, 3, 4, 5, 4, 5],
      [2, 3, 2, 3, 3, 3, 4],
      [4, 3, 4, 4, 5, 4, 5],
      [2, 2, 2, 3, 3, 3, 3],
      [4, 4, 3, 4, 5, 4, 5],
      [3, 3, 3, 3, 4, 3, 4],
      [6, 6, 5, 6, 7, 6, 7],
      [2, 3, 2, 3, 3, 3, 3],
      [4, 5, 4, 5, 5, 4, 5],
      [3, 4, 3, 4, 4, 3, 4],
      [3, 3, 2, 3, 4, 3, 3],
      [4, 4, 3, 4, 5, 4, 4],
      [5, 5, 4, 5, 6, 5, 6],
      [2, 2, 2, 3, 3, 2, 3],
      [4, 4, 3, 4, 5, 4, 4],
      [3, 3, 3, 4, 4, 3, 4],
      [2, 3, 2, 3, 3, 3, 3],
      [5, 4, 4, 5, 5, 4, 5],
      [4, 4, 3, 4, 4, 3, 4],
      [3, 3, 3, 3, 4, 3, 3],
    ],
    interactionsData: [
      [2, 3, 2, 3, 4, 3, 4],
      [1, 2, 1, 2, 2, 2, 3],
      [3, 2, 3, 3, 4, 3, 4],
      [1, 1, 1, 2, 2, 2, 2],
      [3, 3, 2, 3, 4, 3, 4],
      [2, 2, 2, 2, 3, 2, 3],
      [5, 5, 4, 5, 6, 5, 6],
      [1, 2, 1, 2, 2, 2, 2],
      [3, 4, 3, 4, 4, 3, 4],
      [2, 3, 2, 3, 3, 2, 3],
      [2, 2, 1, 2, 3, 2, 2],
      [3, 3, 2, 3, 4, 3, 3],
      [4, 4, 3, 4, 5, 4, 5],
      [1, 1, 1, 2, 2, 1, 2],
      [3, 3, 2, 3, 4, 3, 3],
      [2, 2, 2, 3, 3, 2, 3],
      [1, 2, 1, 2, 2, 2, 2],
      [4, 3, 3, 4, 4, 3, 4],
      [3, 3, 2, 3, 3, 2, 3],
      [2, 2, 2, 2, 3, 2, 2],
    ],
  },
}

// 活跃度排行榜数据
const activeRankingData = {
  1: [
    {
      id: 1,
      studentName: '张小明',
      studentNo: '2024001',
      totalDuration: 485,
      avgDailyDuration: 69,
      visitCount: 32,
      interactionCount: 18,
      activityLevel: 'high',
    },
    {
      id: 2,
      studentName: '李华',
      studentNo: '2024002',
      totalDuration: 452,
      avgDailyDuration: 64,
      visitCount: 28,
      interactionCount: 15,
      activityLevel: 'high',
    },
    {
      id: 3,
      studentName: '王芳',
      studentNo: '2024003',
      totalDuration: 428,
      avgDailyDuration: 61,
      visitCount: 25,
      interactionCount: 12,
      activityLevel: 'high',
    },
    {
      id: 4,
      studentName: '刘洋',
      studentNo: '2024006',
      totalDuration: 385,
      avgDailyDuration: 55,
      visitCount: 22,
      interactionCount: 10,
      activityLevel: 'medium',
    },
    {
      id: 5,
      studentName: '陈晨',
      studentNo: '2024005',
      totalDuration: 362,
      avgDailyDuration: 52,
      visitCount: 20,
      interactionCount: 8,
      activityLevel: 'medium',
    },
    {
      id: 6,
      studentName: '吴迪',
      studentNo: '2024008',
      totalDuration: 345,
      avgDailyDuration: 49,
      visitCount: 18,
      interactionCount: 7,
      activityLevel: 'medium',
    },
    {
      id: 7,
      studentName: '黄涛',
      studentNo: '2024010',
      totalDuration: 328,
      avgDailyDuration: 47,
      visitCount: 16,
      interactionCount: 6,
      activityLevel: 'medium',
    },
    {
      id: 8,
      studentName: '周婷',
      studentNo: '2024007',
      totalDuration: 298,
      avgDailyDuration: 42,
      visitCount: 14,
      interactionCount: 5,
      activityLevel: 'low',
    },
    {
      id: 9,
      studentName: '郑爽',
      studentNo: '2024009',
      totalDuration: 275,
      avgDailyDuration: 39,
      visitCount: 12,
      interactionCount: 4,
      activityLevel: 'low',
    },
    {
      id: 10,
      studentName: '赵雷',
      studentNo: '2024004',
      totalDuration: 85,
      avgDailyDuration: 12,
      visitCount: 5,
      interactionCount: 1,
      activityLevel: 'veryLow',
    },
  ],
  2: [
    {
      id: 11,
      studentName: '孙晓明',
      studentNo: '2024101',
      totalDuration: 420,
      avgDailyDuration: 60,
      visitCount: 26,
      interactionCount: 14,
      activityLevel: 'high',
    },
    {
      id: 12,
      studentName: '林婉清',
      studentNo: '2024102',
      totalDuration: 395,
      avgDailyDuration: 56,
      visitCount: 24,
      interactionCount: 12,
      activityLevel: 'high',
    },
  ],
}

// 不活跃学生数据
const inactiveStudentsData = {
  1: [
    {
      id: 4,
      studentName: '赵雷',
      studentNo: '2024004',
      totalDuration: 85,
      lastActiveTime: '2026-03-15',
      inactiveDays: 7,
      className: '高三(1)班',
    },
    {
      id: 7,
      studentName: '周婷',
      studentNo: '2024007',
      totalDuration: 112,
      lastActiveTime: '2026-03-16',
      inactiveDays: 6,
      className: '高三(1)班',
    },
    {
      id: 9,
      studentName: '郑爽',
      studentNo: '2024009',
      totalDuration: 145,
      lastActiveTime: '2026-03-14',
      inactiveDays: 8,
      className: '高三(1)班',
    },
  ],
  2: [
    {
      id: 13,
      studentName: '郭子轩',
      studentNo: '2024103',
      totalDuration: 68,
      lastActiveTime: '2026-03-12',
      inactiveDays: 10,
      className: '高三(2)班',
    },
  ],
  3: [],
}

// 行为分析数据
const behaviorData = {
  1: {
    dates: ['03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22'],
    video: [125, 142, 138, 155, 168, 162, 175],
    homework: [38, 42, 40, 45, 48, 46, 52],
    discussion: [15, 18, 16, 22, 25, 23, 28],
  },
  2: {
    dates: ['03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22'],
    video: [98, 105, 102, 115, 125, 120, 130],
    homework: [28, 32, 30, 35, 38, 36, 40],
    discussion: [10, 12, 11, 15, 17, 16, 18],
  },
  3: {
    dates: ['03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22'],
    video: [110, 118, 115, 128, 135, 130, 140],
    homework: [32, 35, 33, 38, 42, 40, 44],
    discussion: [12, 14, 13, 16, 18, 17, 20],
  },
}

// 学生每日活跃数据
const studentDailyActivityData = {
  1: {
    dates: ['03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22'],
    duration: [45, 52, 48, 55, 62, 58, 65],
    visits: [3, 4, 3, 4, 5, 4, 5],
    interactions: [2, 3, 2, 3, 4, 3, 4],
  },
  2: {
    dates: ['03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22'],
    duration: [38, 42, 40, 45, 48, 46, 50],
    visits: [2, 3, 2, 3, 3, 3, 4],
    interactions: [1, 2, 1, 2, 2, 2, 3],
  },
}

// 学生学习行为分布
const studentBehaviorData = {
  1: {
    categories: ['视频观看', '作业提交', '讨论互动', '资料下载', '测验练习'],
    values: [65, 18, 12, 8, 22],
  },
  2: {
    categories: ['视频观看', '作业提交', '讨论互动', '资料下载', '测验练习'],
    values: [55, 22, 15, 6, 18],
  },
}

// Mock 接口
export default function mockActivityMonitor() {
  // 获取班级列表
  Mock.mock(/\/api\/teacher\/classes/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const teacherId = url.searchParams.get('teacherId')
    const id = teacherId ? parseInt(teacherId) : currentTeacherId

    const data = classListData[id] || classListData[2]
    return success(data)
  })

  // 获取活跃度概览
  Mock.mock(/\/api\/teacher\/activity\/overview/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.searchParams.get('classId'))

    const data = overviewStatsData[classId] || overviewStatsData[1]
    return success(data)
  })

  // 获取趋势数据
  Mock.mock(/\/api\/teacher\/activity\/trend/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.searchParams.get('classId'))

    const data = trendData[classId] || trendData[1]
    return success(data)
  })

  // 获取时段分布数据
  Mock.mock(/\/api\/teacher\/activity\/hourly/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.searchParams.get('classId'))

    const data = hourlyData[classId] || hourlyData[1]
    return success(data)
  })

  // 获取热力图数据
  Mock.mock(/\/api\/teacher\/activity\/heatmap/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.searchParams.get('classId'))
    const metric = url.searchParams.get('metric') || 'duration'

    const baseData = heatmapData[classId] || heatmapData[1]
    let data
    if (metric === 'duration') {
      data = baseData.durationData
    } else if (metric === 'visits') {
      data = baseData.visitsData
    } else {
      data = baseData.interactionsData
    }

    return success({
      students: baseData.students,
      dates: baseData.dates,
      data: data,
    })
  })

  // 获取活跃度排行榜
  Mock.mock(/\/api\/teacher\/activity\/ranking/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.searchParams.get('classId'))

    const data = activeRankingData[classId] || activeRankingData[1]
    return success(data)
  })

  // 获取不活跃学生列表
  Mock.mock(/\/api\/teacher\/activity\/inactive/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.searchParams.get('classId'))

    const data = inactiveStudentsData[classId] || []
    return success(data)
  })

  // 获取行为分析数据
  Mock.mock(/\/api\/teacher\/activity\/behavior/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = parseInt(url.searchParams.get('classId'))

    const data = behaviorData[classId] || behaviorData[1]
    return success(data)
  })

  // 获取学生每日活跃数据
  Mock.mock(/\/api\/teacher\/activity\/student-daily/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = parseInt(url.searchParams.get('studentId'))

    const data = studentDailyActivityData[studentId] || studentDailyActivityData[1]
    return success(data)
  })

  // 获取学生学习行为分布
  Mock.mock(/\/api\/teacher\/activity\/student-behavior/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = parseInt(url.searchParams.get('studentId'))

    const data = studentBehaviorData[studentId] || studentBehaviorData[1]
    return success(data)
  })

  // 发送提醒
  Mock.mock(/\/api\/teacher\/activity\/send-reminder/, 'post', (options) => {
    const body = JSON.parse(options.body)
    return success(
      { count: body.studentIds?.length || 0 },
      `已向 ${body.studentIds?.length || 0} 名学生发送提醒`,
    )
  })

  // 导出热力图
  Mock.mock(/\/api\/teacher\/activity\/heatmap\/export/, 'get', () => {
    return success(null, '导出成功')
  })

  // 导出排行榜
  Mock.mock(/\/api\/teacher\/activity\/ranking\/export/, 'get', () => {
    return success(null, '导出成功')
  })
}
