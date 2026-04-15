import request from '@/utils/request'

export const tDashboardApi = {
  // 获取班级列表
  getClassList() {
    return request({
      url: '/dashboard/teacher/classes',
      method: 'get',
    })
  },

  refreshAISuggestions(classId) {
    return request({
      url: `/dashboard/teacher/ai-report/refresh`,
      method: 'post',
      params: { classId },
    })
  },

  getMoreData(classId) {
    return request({
      url: '/dashboard/teacher/data',
      method: 'get',
      params: { classId },
    })
  },
  getAISuggestions(classId) {
    return request({
      url: '/dashboard/teacher/ai-report/latest',
      method: 'get',
      params: { classId },
    })
  },

  getCourseList() {
    return request({
      url: '/dashboard/teacher/courses',
      method: 'get',
    })
  },

  getDashboardData(classId) {
    return request({
      url: `/dashboard/teacher/class/${classId}`,
      method: 'get',
    })
  },

  // 获取成绩分布
  getGradeDistribution(classId, examId) {
    return request({
      url: '/teacher/grade-distribution',
      method: 'get',
      params: { classId, examId },
    })
  },

  // 获取考试数据
  getExamLists(classId) {
    return request({
      url: `/dashboard/teacher/class/${classId}/trend`,
      method: 'get',
    })
  },

  //获取作业数据分析
  getHomeworkData(classId) {
    return request({
      url: `/dashboard/teacher/class/${classId}/summary`,
      method: 'get',
    })
  },
  getActivityData(classId) {
    return request({
      url: `/dashboard/teacher/class/${classId}/activity`,
      method: 'get',
    })
  },

  // 获取薄弱知识点
  getWeakKnowledge(classId) {
    return request({
      url: '/teacher/weak-knowledge',
      method: 'get',
      params: { classId },
    })
  },

  // 获取活跃度热力图
  getActivityHeatmap(classId, viewType) {
    return request({
      url: '/teacher/activity-heatmap',
      method: 'get',
      params: { classId, viewType },
    })
  },

  // 获取题目详情
  getQuestionDetail(questionId) {
    return request({
      url: '/teacher/question-detail',
      method: 'get',
      params: { questionId },
    })
  },

  // 获取学生详情
  getStudentDetail(studentId) {
    return request({
      url: '/teacher/student-detail',
      method: 'get',
      params: { studentId },
    })
  },
}

export const userManageApi = {
  // 获取学生列表
  getStudentList(data) {
    return request({
      url: '/student-manage/list',
      method: 'post',
      data,
    })
  },

  // 获取统计数据
  getStudentStatistics(classId, courseId) {
    return request({
      url: '/student-manage/stats',
      method: 'get',
      params: { classId, courseId },
    })
  },

  // 新增学生
  addStudent(data) {
    return request({
      url: '/student-manage',
      method: 'post',
      data,
    })
  },

  // 更新学生
  updateStudent(id, data) {
    return request({
      url: `/student-manage/${id}`,
      method: 'put',
      data,
    })
  },

  // 删除学生
  deleteStudent(id) {
    return request({
      url: `/student-manage/${id}`,
      method: 'delete',
    })
  },

  // 批量操作
  batchOperation(data) {
    return request({
      url: '/teacher/students/batch',
      method: 'post',
      data,
    })
  },

  // 重置密码
  resetPassword(studentId) {
    return request({
      url: `/student-manage/${studentId}/reset-password`,
      method: 'post',
    })
  },

  // 批量重置密码
  batchResetPassword(ids, password) {
    return request({
      url: '/teacher/students/batch-reset-pwd',
      method: 'post',
      data: { ids, password },
    })
  },

  // 获取学生活动数据
  getStudentActivity(studentId) {
    return request({
      url: '/teacher/student-activity',
      method: 'get',
      params: { studentId },
    })
  },

  // 导入学生数据
  importStudents(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request({
      url: '/teacher/students/import',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 获取统计数据（教学看板用）
  getStats(classId) {
    return request({
      url: '/teacher/stats',
      method: 'get',
      params: { classId },
    })
  },

  // 获取成绩分布
  getGradeDistribution(classId, examId) {
    return request({
      url: '/teacher/grade-distribution',
      method: 'get',
      params: { classId, examId },
    })
  },

  // 获取高频错题
  getHighFrequencyErrors(classId, examId) {
    return request({
      url: '/teacher/high-frequency-errors',
      method: 'get',
      params: { classId, examId },
    })
  },

  // 获取薄弱知识点
  getWeakKnowledge(classId) {
    return request({
      url: '/teacher/weak-knowledge',
      method: 'get',
      params: { classId },
    })
  },

  // 获取活跃度热力图
  getActivityHeatmap(classId, viewType) {
    return request({
      url: '/teacher/activity-heatmap',
      method: 'get',
      params: { classId, viewType },
    })
  },

  // 获取题目详情
  getQuestionDetail(questionId) {
    return request({
      url: '/teacher/question-detail',
      method: 'get',
      params: { questionId },
    })
  },

  // 获取学生详情
  getStudentDetail(studentId) {
    return request({
      url: '/teacher/student-detail',
      method: 'get',
      params: { studentId },
    })
  },
}

export const tHomeworkApi = {
  getHomeworkList(params) {
    return request({
      url: '/teacher/homeworks',
      method: 'get',
      params,
    })
  },

  // 获取作业统计数据
  getHomeworkStatistics() {
    return request({
      url: '/teacher/homeworks/statistics',
      method: 'get',
    })
  },

  // 获取作业提交列表
  getHomeworkSubmissions(homeworkId) {
    return request({
      url: `/teacher/homework/${homeworkId}/submissions`,
      method: 'get',
    })
  },

  // 提交批改
  submitGrade(submissionId, data) {
    return request({
      url: `/teacher/homework/submission/${submissionId}/grade`,
      method: 'post',
      data,
    })
  },

  // 获取作业分析数据
  getHomeworkAnalysis(homeworkId) {
    return request({
      url: `/teacher/homework/${homeworkId}/analysis`,
      method: 'get',
    })
  },

  // 删除作业
  deleteHomework(homeworkId) {
    return request({
      url: `/teacher/homework/${homeworkId}`,
      method: 'delete',
    })
  },

  // 发布作业
  publishHomework(data) {
    return request({
      url: '/teacher/homework',
      method: 'post',
      data,
    })
  },

  // 更新作业
  updateHomework(homeworkId, data) {
    return request({
      url: `/teacher/homework/${homeworkId}`,
      method: 'put',
      data,
    })
  },
}

export const tExamApi = {
  getScoreList(params) {
    return request({
      url: `/exam-manage/${params.examId}/grades`,
      method: 'get',
      params,
    })
  },
  // 获取考试列表
  getExamLists(data) {
    return request({
      url: '/exam-manage/list',
      method: 'post',
      data,
    })
  },

  // 创建考试
  createExam(data) {
    return request({
      url: '/exam-manage/create',
      method: 'post',
      data,
    })
  },
  getExamStatistics(params) {
    return request({
      url: '/exam-manage/stats',
      method: 'get',
      params: { params },
    })
  },

  // 更新考试
  updateExam(examId, data) {
    return request({
      url: `/exam-manage/update/${examId}`,
      method: 'put',
      data,
    })
  },

  // 删除考试
  deleteExam(examId) {
    return request({
      url: `/exam-manage/${examId}`,
      method: 'delete',
    })
  },

  // 获取成绩列表
  getExamScores(examId) {
    return request({
      url: `/exam-manage/${examId}/detail`,
      method: 'get',
    })
  },

  // 保存成绩
  saveExamScores(examId, scores) {
    return request({
      url: `/teacher/exam/${examId}/scores`,
      method: 'post',
      data: { scores },
    })
  },

  // 获取考试分析数据
  getExamAnalysis(examId) {
    return request({
      url: `/exam-manage/${examId}/detail`,
      method: 'get',
    })
  },
}

export const tCourseApi = {
  getCourseList(teacherId) {
    return request({
      url: '/teacher/courses',
      method: 'get',
      params: { teacherId },
    })
  },

  // 获取课程概览统计
  getCourseOverview(courseId) {
    return request({
      url: `/teacher/course/${courseId}/overview`,
      method: 'get',
    })
  },

  // 获取知识点掌握数据
  getKnowledgeMastery(courseId) {
    return request({
      url: `/teacher/course/${courseId}/knowledge-mastery`,
      method: 'get',
    })
  },

  // 获取成绩趋势数据
  getCourseTrend(courseId) {
    return request({
      url: `/teacher/course/${courseId}/trend`,
      method: 'get',
    })
  },

  // 获取班级对比数据
  getClassCompare(courseId) {
    return request({
      url: `/teacher/course/${courseId}/class-compare`,
      method: 'get',
    })
  },

  // 获取散点图数据
  getScatterData(courseId) {
    return request({
      url: `/teacher/course/${courseId}/scatter`,
      method: 'get',
    })
  },
}

export const tClassGradeApi = {
  getGradeStats(classId, examId) {
    return request({
      url: `/teacher/class/${classId}/grade-stats`,
      method: 'get',
      params: { examId },
    })
  },

  // 获取分数段分布
  getScoreDistribution(classId, examId) {
    return request({
      url: `/teacher/class/${classId}/score-distribution`,
      method: 'get',
      params: { examId },
    })
  },

  // 获取班级成绩趋势
  getClassGradeTrend(classId) {
    return request({
      url: `/teacher/class/${classId}/grade-trend`,
      method: 'get',
    })
  },

  // 获取学生成绩列表
  getStudentScores(classId, examId, compareExamId) {
    return request({
      url: `/teacher/class/${classId}/scores`,
      method: 'get',
      params: { examId, compareExamId },
    })
  },

  // 获取进步/退步榜
  getProgressRank(classId, examId, compareExamId) {
    return request({
      url: `/teacher/class/${classId}/progress-rank`,
      method: 'get',
      params: { examId, compareExamId },
    })
  },

  // 获取学生个人成绩趋势
  getStudentGradeTrend(studentId) {
    return request({
      url: `/teacher/student/${studentId}/grade-trend`,
      method: 'get',
    })
  },
}

export const tActivityMonitorApi = {
  getActivityOverview(classId) {
    return request({
      url: '/teacher/activity/overview',
      method: 'get',
      params: { classId },
    })
  },

  // 获取活跃度趋势
  getActivityTrend(classId) {
    return request({
      url: '/teacher/activity/trend',
      method: 'get',
      params: { classId },
    })
  },

  // 获取时段分布数据
  getActivityHourly(classId) {
    return request({
      url: '/teacher/activity/hourly',
      method: 'get',
      params: { classId },
    })
  },

  // 获取热力图数据
  getActivityHeatmap(classId, metric) {
    return request({
      url: '/teacher/activity/heatmap',
      method: 'get',
      params: { classId, metric },
    })
  },

  // 获取活跃度排行榜
  getActivityRanking(classId) {
    return request({
      url: '/teacher/activity/ranking',
      method: 'get',
      params: { classId },
    })
  },

  // 获取不活跃学生列表
  getInactiveStudents(classId) {
    return request({
      url: '/teacher/activity/inactive',
      method: 'get',
      params: { classId },
    })
  },

  // 获取行为分析数据
  getBehaviorAnalysis(classId) {
    return request({
      url: '/teacher/activity/behavior',
      method: 'get',
      params: { classId },
    })
  },

  // 获取学生每日活跃数据
  getStudentDailyActivity(studentId) {
    return request({
      url: '/teacher/activity/student-daily',
      method: 'get',
      params: { studentId },
    })
  },

  // 获取学生学习行为分布
  getStudentBehavior(studentId) {
    return request({
      url: '/teacher/activity/student-behavior',
      method: 'get',
      params: { studentId },
    })
  },

  // 发送提醒
  sendReminder(data) {
    return request({
      url: '/teacher/activity/send-reminder',
      method: 'post',
      data,
    })
  },
}
