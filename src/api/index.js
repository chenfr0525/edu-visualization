import request from '@/utils/request.js'

import { authApi } from './modules/auth'
import { userApi } from './modules/user'
import {
  tDashboardApi,
  userManageApi,
  tHomeworkApi,
  tExamApi,
  tCourseApi,
  tClassGradeApi,
  tActivityMonitorApi,
} from './modules/teacher'
import { dashboardApi, knowledgeApi, courseApi, homeworkApi, gradeApi } from './modules/student'
import { fileApi } from './modules/file'

export {
  request,
  authApi,
  userApi,
  dashboardApi,
  knowledgeApi,
  courseApi,
  homeworkApi,
  gradeApi,
  tDashboardApi,
  userManageApi,
  tHomeworkApi,
  tExamApi,
  tCourseApi,
  tClassGradeApi,
  tActivityMonitorApi,
  fileApi,
}
