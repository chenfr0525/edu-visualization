import request from '@/utils/request.js'

import { authApi } from './modules/auth'
import { userApi } from './modules/user'

import { dashboardApi, knowledgeApi, courseApi, homeworkApi, gradeApi } from './modules/student'

export { request, authApi, userApi, dashboardApi, knowledgeApi, courseApi, homeworkApi, gradeApi }
