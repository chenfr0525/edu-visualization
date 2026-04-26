import request from '@/utils/request'
import { getFileExtension } from './file'

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
  // 上传作业文件并解析
  uploadHomeworkFile: (file, type) => {
    return new Promise((resolve, reject) => {
      // 读取文件并转为 Base64
      const reader = new FileReader()

      reader.onload = () => {
        // 去掉 data:xxx;base64, 前缀，只保留 base64 字符串
        const base64Content = reader.result.split(',')[1]

        const requestData = {
          fileContent: base64Content,
          fileName: file.name,
          fileType: file.type || getFileExtension(file.name),
          dataType: type,
        }

        // 发送请求
        request({
          url: '/homework/import/parse',
          method: 'post',
          data: requestData,
          timeout: 120000, // 文件上传超时时间设置长一点
        })
          .then(resolve)
          .catch(reject)
      }

      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }

      // 读取文件为 Base64
      reader.readAsDataURL(file)
    })
  },

  // 确认导入作业
  confirmHomeworkInsert: (data, type) => {
    return request({
      url: '/homework/import/confirm',
      method: 'post',
      data: { data, type },
    })
  },

  // 上传作业成绩文件并解析
  uploadHomeworkGradeFile: (file, type) => {
    return new Promise((resolve, reject) => {
      // 读取文件并转为 Base64
      const reader = new FileReader()

      reader.onload = () => {
        // 去掉 data:xxx;base64, 前缀，只保留 base64 字符串
        const base64Content = reader.result.split(',')[1]

        const requestData = {
          fileContent: base64Content,
          fileName: file.name,
          fileType: file.type || getFileExtension(file.name),
          dataType: type,
        }

        // 发送请求
        request({
          url: '/homework/grades/import/parse',
          method: 'post',
          data: requestData,
          timeout: 120000, // 文件上传超时时间设置长一点
        })
          .then(resolve)
          .catch(reject)
      }

      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }

      // 读取文件为 Base64
      reader.readAsDataURL(file)
    })
  },

  // 确认导入作业成绩
  confirmHomeworkGradeInsert: (homeworkId, data, type) => {
    return request({
      url: `/homework/${homeworkId}/grades/import/confirm`,
      method: 'post',
      data: { data, type },
    })
  },
  getHomeworkList(params) {
    return request({
      url: '/homework/list',
      method: 'get',
      params,
    })
  },

  // 获取作业统计数据
  getHomeworkStatistics(params) {
    return request({
      url: '/homework/statistics',
      method: 'get',
      params,
    })
  },
  //创建作业
  createHomework(data) {
    return request({
      url: '/homework/create',
      method: 'post',
      data,
    })
  },
  //编辑作业
  updateHomework(homeworkId, data) {
    return request({
      url: `/homework/update/${homeworkId}`,
      method: 'put',
      data,
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
      url: `/homework/${homeworkId}/detail`,
      method: 'get',
    })
  },

  // 删除作业
  deleteHomework(homeworkId) {
    return request({
      url: `/homework/${homeworkId}`,
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
}

export const tExamApi = {
  uploadGradeFile: (file, dataType) => {
    return new Promise((resolve, reject) => {
      // 读取文件并转为 Base64
      const reader = new FileReader()

      reader.onload = () => {
        // 去掉 data:xxx;base64, 前缀，只保留 base64 字符串
        const base64Content = reader.result.split(',')[1]

        const requestData = {
          fileContent: base64Content,
          fileName: file.name,
          fileType: file.type || getFileExtension(file.name),
          dataType: dataType,
        }

        // 发送请求
        request({
          url: '/exam-import/grade/parse',
          method: 'post',
          data: requestData,
          timeout: 120000, // 文件上传超时时间设置长一点
        })
          .then(resolve)
          .catch(reject)
      }

      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }

      // 读取文件为 Base64
      reader.readAsDataURL(file)
    })
  },

  // 确认导入成绩
  confirmGradeInsert: (examId, data, type) => {
    console.log('123', examId, data, type)
    return request({
      url: `/exam-import/grade/confirm/${examId}`,
      method: 'post',
      data: {
        type: type,
        data: data,
      },
    })
  },
  uploadFile(file, dataType) {
    return new Promise((resolve, reject) => {
      // 读取文件并转为 Base64
      const reader = new FileReader()

      reader.onload = () => {
        // 去掉 data:xxx;base64, 前缀，只保留 base64 字符串
        const base64Content = reader.result.split(',')[1]

        const requestData = {
          fileContent: base64Content,
          fileName: file.name,
          fileType: file.type || getFileExtension(file.name),
          dataType: dataType,
        }

        // 发送请求
        request({
          url: '/exam-import/parse',
          method: 'post',
          data: requestData,
          timeout: 120000, // 文件上传超时时间设置长一点
        })
          .then(resolve)
          .catch(reject)
      }

      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }

      // 读取文件为 Base64
      reader.readAsDataURL(file)
    })
  },
  confirmInsert(data, type) {
    return request({
      url: '/exam-import/confirm',
      method: 'post',
      data: { data, type },
    })
  },
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
      params,
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

// teacher.js - 添加课程分析相关API

export const tCourseApi = {
  // 获取课程列表
  getCourseList() {
    return request({
      url: '/course/list',
      method: 'get',
    })
  },

  // 获取课程详情
  getCourseDetail(courseId) {
    return request({
      url: `/course/${courseId}/detail`,
      method: 'get',
    })
  },

  // 获取课程统计卡片数据
  getCourseStatistics(courseId) {
    return request({
      url: `/course/${courseId}/statistics`,
      method: 'get',
    })
  },

  // 获取知识点列表（树形结构）
  getKnowledgePoints(courseId) {
    return request({
      url: `/course/${courseId}/knowledge-points`,
      method: 'get',
    })
  },

  // 获取知识点详情
  getKnowledgePointDetail(courseId, kpId) {
    return request({
      url: `/course/${courseId}/knowledge-point/${kpId}/detail`,
      method: 'get',
    })
  },

  // 手动创建知识点
  createKnowledgePoint(data) {
    return request({
      url: '/course/knowledge-point/create',
      method: 'post',
      data,
    })
  },

  // 编辑知识点
  updateKnowledgePoint(kpId, data) {
    return request({
      url: `/course/knowledge-point/update/${kpId}`,
      method: 'put',
      data,
    })
  },

  // 删除知识点
  deleteKnowledgePoint(kpId) {
    return request({
      url: `/course/knowledge-point/${kpId}`,
      method: 'delete',
    })
  },

  // 获取课程图表数据（包含成绩趋势、雷达图等）
  getChartData(courseId) {
    return request({
      url: `/course/${courseId}/chart-data`,
      method: 'get',
    })
  },

  // 获取AI分析报告
  getAiAnalysis(courseId) {
    return request({
      url: `/course/${courseId}/ai-analysis`,
      method: 'get',
    })
  },

  // 创建课程（仅管理员）
  createCourse(data) {
    return request({
      url: '/course/create',
      method: 'post',
      data,
    })
  },

  // AI解析知识点文件（返回解析结果给前端预览）
  parseKnowledgePointFile(file, courseId) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64Content = reader.result.split(',')[1]
        request({
          url: '/course/knowledge-point/import/parse',
          method: 'post',
          data: {
            fileContent: base64Content,
            fileName: file.name,
            courseId: courseId,
          },
          timeout: 120000,
        })
          .then(resolve)
          .catch(reject)
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(file)
    })
  },

  // 确认导入知识点
  confirmKnowledgePointImport(courseId, data) {
    return request({
      url: `/course/${courseId}/knowledge-point/import/confirm`,
      method: 'post',
      data: { data },
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
  // 获取学生活跃度列表（分页）
  getStudentActivityList(params) {
    return request({
      url: '/activity-monitor/student-list',
      method: 'get',
      params,
    })
  },

  // 获取统计卡片数据
  getStatistics(classId) {
    return request({
      url: '/activity-monitor/statistics',
      method: 'get',
      params: { classId },
    })
  },

  // 获取图表数据（排行榜、预警、对比等）
  getChartData(classId) {
    return request({
      url: '/activity-monitor/chart-data',
      method: 'get',
      params: { classId },
    })
  },

  // 获取学生活跃度详情
  getStudentActivityDetail(studentId) {
    return request({
      url: `/activity-monitor/student/${studentId}/detail`,
      method: 'get',
    })
  },

  // AI解析活跃度数据文件
  parseActivityFile(file, activityType) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64Content = reader.result.split(',')[1]
        request({
          url: '/activity-monitor/import/parse',
          method: 'post',
          data: {
            fileContent: base64Content,
            fileName: file.name,
            activityType: activityType,
          },
          timeout: 120000,
        })
          .then(resolve)
          .catch(reject)
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(file)
    })
  },

  // 确认导入活跃度数据
  confirmActivityImport(data) {
    return request({
      url: '/activity-monitor/import/confirm',
      method: 'post',
      data: { data },
    })
  },
}

export const teacherManageApi = {
  // 获取教师列表
  getTeacherList(data) {
    return request({
      url: '/teacher-manage/list',
      method: 'post',
      data,
    })
  },

  // 获取统计数据
  getStats() {
    return request({
      url: '/teacher-manage/stats',
      method: 'get',
    })
  },

  // 获取教师详情
  getTeacherById(id) {
    return request({
      url: `/teacher-manage/${id}`,
      method: 'get',
    })
  },

  // 新增教师
  addTeacher(data) {
    return request({
      url: '/teacher-manage',
      method: 'post',
      data,
    })
  },

  // 更新教师
  updateTeacher(id, data) {
    return request({
      url: `/teacher-manage/${id}`,
      method: 'put',
      data,
    })
  },

  // 删除教师
  deleteTeacher(id) {
    return request({
      url: `/teacher-manage/${id}`,
      method: 'delete',
    })
  },

  // 重置密码
  resetPassword(id) {
    return request({
      url: `/teacher-manage/${id}/reset-password`,
      method: 'post',
    })
  },

  // 转为管理员
  promoteToAdmin(id) {
    return request({
      url: `/teacher-manage/${id}/promote-admin`,
      method: 'post',
    })
  },
}
