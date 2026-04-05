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

import mockTeacherDashboard from './modules/teacher-dashboard'
import mockTeacherUserManage from './modules/teacher-user-manage'
import mockTeacherHomework from './modules/teacher-homework'
import mockTeacherExam from './modules/teacher-exam'
import mockTeacherCourse from './modules/teacher-course'
import mockTeacherClassGrade from './modules/teacher-class-grade'
import mockTeacherActivityMonitor from './modules/teacher-actitvity-monitor.js'

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

    mockTeacherDashboard()
    mockTeacherUserManage()
    mockTeacherHomework()
    mockTeacherExam()
    mockTeacherCourse()
    mockTeacherClassGrade()
    mockTeacherActivityMonitor()

    console.log('✅ Mock 数据已启用')
  }
}
