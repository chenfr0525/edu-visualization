import request from '@/utils/request'

export const dashboardApi = {
  // 获取学生信息
  getStudentInfo(studentId) {
    return request({
      url: '/student/info',
      method: 'get',
      params: { studentId },
    })
  },

  // 获取统计数据
  getDashboardStats(studentId) {
    return request({
      url: '/student/dashboard/stats',
      method: 'get',
      params: { studentId },
    })
  },

  // 根据学期和课程获取统计数据
  getDashboardStatsByCourse(studentId, semester, courseId) {
    return request({
      url: '/student/dashboard/stats/by-course',
      method: 'get',
      params: { studentId, semester, courseId },
    })
  },

  // 获取知识点掌握数据
  getKnowledgeMastery(studentId) {
    return request({
      url: '/student/dashboard/knowledge',
      method: 'get',
      params: { studentId },
    })
  },

  // 根据课程获取知识点掌握数据
  getKnowledgeMasteryByCourse(studentId, courseId) {
    return request({
      url: '/student/dashboard/knowledge/by-course',
      method: 'get',
      params: { studentId, courseId },
    })
  },

  // 获取成绩趋势数据
  getGradeTrend(studentId) {
    return request({
      url: '/student/dashboard/grade-trend',
      method: 'get',
      params: { studentId },
    })
  },

  // 获取出勤数据
  getAttendanceData(studentId) {
    return request({
      url: '/student/dashboard/attendance',
      method: 'get',
      params: { studentId },
    })
  },

  // 获取学期列表
  getSemesterList(studentId) {
    return request({
      url: '/student/semesters',
      method: 'get',
      params: { studentId },
    })
  },

  // 根据学期获取课程选项
  getCourseOptions(studentId, semester) {
    return request({
      url: '/student/courses/options',
      method: 'get',
      params: { studentId, semester },
    })
  },

  // 获取课程列表
  getCourses(studentId) {
    return request({
      url: '/student/courses',
      method: 'get',
      params: { studentId },
    })
  },

  // 获取作业列表
  getHomeworks(studentId) {
    return request({
      url: '/student/homeworks',
      method: 'get',
      params: { studentId },
    })
  },

  // 提交作业
  submitHomework(data) {
    return request({
      url: '/student/homework/submit',
      method: 'post',
      data,
    })
  },

  // 获取成绩分析
  getGradeAnalysis(studentId) {
    return request({
      url: '/student/grade-analysis',
      method: 'get',
      params: { studentId },
    })
  },
}

export const knowledgeApi = {
  // 获取课程列表
  getCourses(studentId) {
    return request({
      url: '/knowledge/courses',
      method: 'get',
      params: { studentId },
    })
  },

  // 获取知识点树形数据
  getKnowledgeTree(studentId, courseId) {
    return request({
      url: '/knowledge/tree',
      method: 'get',
      params: { studentId, courseId },
    })
  },

  // 获取知识点掌握环图数据
  getDonutData(studentId, courseId) {
    return request({
      url: '/knowledge/donut',
      method: 'get',
      params: { studentId, courseId },
    })
  },

  // 获取雷达图数据
  getRadarData(studentId, courseId) {
    return request({
      url: '/knowledge/radar',
      method: 'get',
      params: { studentId, courseId },
    })
  },

  // 获取个性化学习资源推荐
  getRecommendations(studentId, courseId) {
    return request({
      url: '/knowledge/recommendations',
      method: 'get',
      params: { studentId, courseId },
    })
  },
  getKnowledgeDetail(studentId, knowledgeId, courseId) {
    return request({
      url: '/knowledge/detail',
      method: 'get',
      params: { studentId, knowledgeId, courseId },
    })
  },
}

export const courseApi = {
  // 获取课程列表
  getCourseList(studentId, status = 'all') {
    return request({
      url: '/course/list',
      method: 'get',
      params: { studentId, status },
    })
  },

  // 获取整体进度统计
  getOverallStats(studentId) {
    return request({
      url: '/course/overall-stats',
      method: 'get',
      params: { studentId },
    })
  },

  // 获取学习动态
  getTimeline(studentId, page = 1, pageSize = 5) {
    return request({
      url: '/course/timeline',
      method: 'get',
      params: { studentId, page, pageSize },
    })
  },

  // 获取近7天学习时间分布
  getStudyTime(studentId) {
    return request({
      url: '/course/study-time',
      method: 'get',
      params: { studentId },
    })
  },

  // 获取课程状态选项
  getStatusOptions() {
    return request({
      url: '/course/status-options',
      method: 'get',
    })
  },

  // 获取课程详情
  getCourseDetail(studentId, courseId) {
    return request({
      url: '/course/detail',
      method: 'get',
      params: { studentId, courseId },
    })
  },

  // 获取课程模块
  getCourseModules(studentId, courseId) {
    return request({
      url: '/course/modules',
      method: 'get',
      params: { studentId, courseId },
    })
  },
}

export const homeworkApi = {
  // 获取课程选项
  getCourseOptions(studentId) {
    return request({
      url: '/homework/courses',
      method: 'get',
      params: { studentId },
    })
  },

  // 获取状态选项
  getStatusOptions() {
    return request({
      url: '/homework/status-options',
      method: 'get',
    })
  },

  // 获取统计数据
  getStats(studentId) {
    return request({
      url: '/homework/stats',
      method: 'get',
      params: { studentId },
    })
  },

  // 获取作业列表
  getHomeworkList(studentId, params) {
    return request({
      url: '/homework/list',
      method: 'get',
      params: {
        studentId,
        ...params,
      },
    })
  },

  // 获取作业详情
  getHomeworkDetail(studentId, homeworkId) {
    return request({
      url: '/homework/detail',
      method: 'get',
      params: { studentId, homeworkId },
    })
  },

  // 提交作业
  submitHomework(data) {
    return request({
      url: '/homework/submit',
      method: 'post',
      data,
    })
  },

  // 获取作业解析
  getHomeworkAnalysis(homeworkId) {
    return request({
      url: '/homework/analysis',
      method: 'get',
      params: { homeworkId },
    })
  },

  // 获取作业趋势统计
  getHomeworkTrend() {
    return request({
      url: '/homework/trend',
      method: 'get',
    })
  },
}

export const gradeApi = {
  // 获取学期选项
  getTermOptions(studentId) {
    return request({
      url: '/grade/terms',
      method: 'get',
      params: { studentId },
    })
  },

  // 获取状态选项
  getStatusOptions() {
    return request({
      url: '/grade/status-options',
      method: 'get',
    })
  },

  // 获取课程选项
  getCourseOptions(studentId) {
    return request({
      url: '/grade/courses',
      method: 'get',
      params: { studentId },
    })
  },

  // 获取考试列表
  getExamList(studentId, params) {
    return request({
      url: '/grade/exam-list',
      method: 'get',
      params: {
        studentId,
        ...params,
      },
    })
  },

  // 获取成绩分布数据
  getGradeDistribution(studentId, course) {
    return request({
      url: '/grade/distribution',
      method: 'get',
      params: { studentId, course },
    })
  },

  // 获取我的成绩趋势
  getMyGradeTrend(studentId, course) {
    return request({
      url: '/grade/my-trend',
      method: 'get',
      params: { studentId, course },
    })
  },

  // 获取考试成绩详情
  getExamDetail(studentId, examId) {
    return request({
      url: '/grade/exam-detail',
      method: 'get',
      params: { studentId, examId },
    })
  },

  // 获取成绩分析报告
  getGradeReport(studentId, examId) {
    return request({
      url: '/grade/report',
      method: 'get',
      params: { studentId, examId },
    })
  },
}
