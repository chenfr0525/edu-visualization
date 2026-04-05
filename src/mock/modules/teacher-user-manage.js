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
    { id: 4, name: '高二(1)班', grade: '高二', studentCount: 48 },
  ],
}

// 学生列表数据
const studentListData = {
  1: [
    // 高三(1)班
    {
      id: 1,
      studentNo: '2024001',
      name: '张小明',
      gender: 'M',
      classId: 1,
      className: '高三(1)班',
      email: 'zhangxm@edu.com',
      phone: '13800138001',
      status: 'active',
      lastLoginTime: '2026-03-22 14:30:00',
      createTime: '2024-09-01 00:00:00',
      avatar: null,
    },
    {
      id: 2,
      studentNo: '2024002',
      name: '李华',
      gender: 'M',
      classId: 1,
      className: '高三(1)班',
      email: 'lihua@edu.com',
      phone: '13800138002',
      status: 'active',
      lastLoginTime: '2026-03-21 09:15:00',
      createTime: '2024-09-01 00:00:00',
      avatar: null,
    },
    {
      id: 3,
      studentNo: '2024003',
      name: '王芳',
      gender: 'F',
      classId: 1,
      className: '高三(1)班',
      email: 'wangfang@edu.com',
      phone: '13800138003',
      status: 'frozen',
      lastLoginTime: '2026-03-10 16:20:00',
      createTime: '2024-09-01 00:00:00',
      avatar: null,
    },
    {
      id: 4,
      studentNo: '2024004',
      name: '赵雷',
      gender: 'M',
      classId: 1,
      className: '高三(1)班',
      email: 'zhaolei@edu.com',
      phone: '13800138004',
      status: 'pending',
      lastLoginTime: null,
      createTime: '2026-03-01 00:00:00',
      avatar: null,
    },
    {
      id: 5,
      studentNo: '2024005',
      name: '陈思琪',
      gender: 'F',
      classId: 1,
      className: '高三(1)班',
      email: 'chensq@edu.com',
      phone: '13800138005',
      status: 'active',
      lastLoginTime: '2026-03-22 08:30:00',
      createTime: '2024-09-01 00:00:00',
      avatar: null,
    },
    {
      id: 6,
      studentNo: '2024006',
      name: '周杰',
      gender: 'M',
      classId: 1,
      className: '高三(1)班',
      email: 'zhoujie@edu.com',
      phone: '13800138006',
      status: 'active',
      lastLoginTime: '2026-03-21 20:00:00',
      createTime: '2024-09-01 00:00:00',
      avatar: null,
    },
    {
      id: 7,
      studentNo: '2024007',
      name: '吴婷婷',
      gender: 'F',
      classId: 1,
      className: '高三(1)班',
      email: 'wutt@edu.com',
      phone: '13800138007',
      status: 'active',
      lastLoginTime: '2026-03-20 18:45:00',
      createTime: '2024-09-01 00:00:00',
      avatar: null,
    },
    {
      id: 8,
      studentNo: '2024008',
      name: '郑浩然',
      gender: 'M',
      classId: 1,
      className: '高三(1)班',
      email: 'zhenghr@edu.com',
      phone: '13800138008',
      status: 'frozen',
      lastLoginTime: '2026-03-15 11:20:00',
      createTime: '2024-09-01 00:00:00',
      avatar: null,
    },
  ],
  2: [
    // 高三(2)班
    {
      id: 9,
      studentNo: '2024101',
      name: '孙晓明',
      gender: 'M',
      classId: 2,
      className: '高三(2)班',
      email: 'sunxm@edu.com',
      phone: '13800138101',
      status: 'active',
      lastLoginTime: '2026-03-22 10:30:00',
      createTime: '2024-09-01 00:00:00',
      avatar: null,
    },
    {
      id: 10,
      studentNo: '2024102',
      name: '林婉清',
      gender: 'F',
      classId: 2,
      className: '高三(2)班',
      email: 'linwq@edu.com',
      phone: '13800138102',
      status: 'active',
      lastLoginTime: '2026-03-21 15:20:00',
      createTime: '2024-09-01 00:00:00',
      avatar: null,
    },
    {
      id: 11,
      studentNo: '2024103',
      name: '郭子轩',
      gender: 'M',
      classId: 2,
      className: '高三(2)班',
      email: 'guozx@edu.com',
      phone: '13800138103',
      status: 'pending',
      lastLoginTime: null,
      createTime: '2026-03-05 00:00:00',
      avatar: null,
    },
  ],
  3: [
    // 高三(3)班
    {
      id: 12,
      studentNo: '2024201',
      name: '唐雅欣',
      gender: 'F',
      classId: 3,
      className: '高三(3)班',
      email: 'tangyx@edu.com',
      phone: '13800138201',
      status: 'active',
      lastLoginTime: '2026-03-22 09:00:00',
      createTime: '2024-09-01 00:00:00',
      avatar: null,
    },
    {
      id: 13,
      studentNo: '2024202',
      name: '沈梦辰',
      gender: 'F',
      classId: 3,
      className: '高三(3)班',
      email: 'shenmc@edu.com',
      phone: '13800138202',
      status: 'active',
      lastLoginTime: '2026-03-21 16:30:00',
      createTime: '2024-09-01 00:00:00',
      avatar: null,
    },
  ],
}

// 统计数据的映射
const statisticsMap = {
  1: { total: 8, active: 5, frozen: 2, pending: 1, todayActive: 3 },
  2: { total: 3, active: 2, frozen: 0, pending: 1, todayActive: 2 },
  3: { total: 2, active: 2, frozen: 0, pending: 0, todayActive: 2 },
  all: { total: 13, active: 9, frozen: 2, pending: 2, todayActive: 7 },
}

// 学生活动数据
const studentActivityData = {
  1: [45, 52, 38, 42, 78, 85, 62],
  2: [38, 45, 42, 48, 55, 52, 58],
  3: [25, 32, 28, 35, 38, 42, 40],
  4: [52, 48, 55, 58, 62, 60, 65],
  5: [65, 68, 72, 70, 75, 78, 80],
  6: [42, 38, 45, 48, 52, 50, 55],
  7: [78, 82, 85, 88, 85, 90, 92],
  8: [35, 42, 38, 45, 48, 52, 50],
}

// 下一个学生ID
let nextStudentId = 100

// Mock 接口
export default function mockStudentManage() {
  // 获取班级列表
  Mock.mock(/\/api\/teacher\/classes/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const teacherId = url.searchParams.get('teacherId')
    const id = teacherId ? parseInt(teacherId) : currentTeacherId

    const data = classListData[id] || classListData[2]
    return success(data)
  })

  // 获取学生列表
  Mock.mock(/\/api\/teacher\/students/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 20
    const keyword = url.searchParams.get('keyword') || ''
    const classId = url.searchParams.get('classId')
    const status = url.searchParams.get('status')

    // 收集所有学生
    let allStudents = []
    for (const key in studentListData) {
      allStudents = allStudents.concat(studentListData[key])
    }

    // 筛选
    let filtered = [...allStudents]
    if (classId) {
      filtered = filtered.filter((s) => s.classId === parseInt(classId))
    }
    if (status) {
      filtered = filtered.filter((s) => s.status === status)
    }
    if (keyword) {
      filtered = filtered.filter((s) => s.name.includes(keyword) || s.studentNo.includes(keyword))
    }

    // 分页
    const total = filtered.length
    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize)

    return success({
      list,
      total,
      page,
      pageSize,
    })
  })

  // 获取统计数据
  Mock.mock(/\/api\/teacher\/students\/statistics/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const classId = url.searchParams.get('classId')

    let data
    if (classId) {
      data = statisticsMap[parseInt(classId)] || {
        total: 0,
        active: 0,
        frozen: 0,
        pending: 0,
        todayActive: 0,
      }
    } else {
      data = statisticsMap.all
    }
    return success(data)
  })

  // 新增学生
  Mock.mock(/\/api\/teacher\/student/, 'post', (options) => {
    const body = JSON.parse(options.body)
    const newStudent = {
      id: nextStudentId++,
      studentNo: body.studentNo,
      name: body.name,
      gender: body.gender,
      classId: body.classId,
      className: classListData[2].find((c) => c.id === body.classId)?.name || '未知班级',
      email: body.email,
      phone: body.phone,
      status: 'pending',
      lastLoginTime: null,
      createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      avatar: null,
    }

    // 添加到对应班级
    if (!studentListData[body.classId]) {
      studentListData[body.classId] = []
    }
    studentListData[body.classId].push(newStudent)

    // 更新统计数据
    const classStats = statisticsMap[body.classId]
    if (classStats) {
      classStats.total++
      classStats.pending++
    }
    statisticsMap.all.total++
    statisticsMap.all.pending++

    return success(newStudent, '新增成功')
  })

  // 更新学生
  Mock.mock(/\/api\/teacher\/student\/\d+/, 'put', (options) => {
    const url = options.url
    const id = parseInt(url.match(/\/student\/(\d+)/)[1])
    const body = JSON.parse(options.body)

    // 查找并更新学生
    let updatedStudent = null
    for (const key in studentListData) {
      const index = studentListData[key].findIndex((s) => s.id === id)
      if (index !== -1) {
        const oldStatus = studentListData[key][index].status
        studentListData[key][index] = {
          ...studentListData[key][index],
          ...body,
          className:
            classListData[2].find((c) => c.id === body.classId)?.name ||
            studentListData[key][index].className,
        }
        updatedStudent = studentListData[key][index]

        // 更新统计数据
        if (oldStatus !== body.status) {
          const classStats = statisticsMap[body.classId]
          if (classStats) {
            if (oldStatus === 'active') classStats.active--
            if (oldStatus === 'frozen') classStats.frozen--
            if (oldStatus === 'pending') classStats.pending--
            if (body.status === 'active') classStats.active++
            if (body.status === 'frozen') classStats.frozen++
            if (body.status === 'pending') classStats.pending++
          }
          // 更新总数
          if (oldStatus === 'active') statisticsMap.all.active--
          if (oldStatus === 'frozen') statisticsMap.all.frozen--
          if (oldStatus === 'pending') statisticsMap.all.pending--
          if (body.status === 'active') statisticsMap.all.active++
          if (body.status === 'frozen') statisticsMap.all.frozen++
          if (body.status === 'pending') statisticsMap.all.pending++
        }
        break
      }
    }

    return success(updatedStudent, '更新成功')
  })

  // 删除学生
  Mock.mock(/\/api\/teacher\/student\/\d+/, 'delete', (options) => {
    const url = options.url
    const id = parseInt(url.match(/\/student\/(\d+)/)[1])

    for (const key in studentListData) {
      const index = studentListData[key].findIndex((s) => s.id === id)
      if (index !== -1) {
        const student = studentListData[key][index]
        studentListData[key].splice(index, 1)

        // 更新统计数据
        const classStats = statisticsMap[parseInt(key)]
        if (classStats) {
          classStats.total--
          if (student.status === 'active') classStats.active--
          if (student.status === 'frozen') classStats.frozen--
          if (student.status === 'pending') classStats.pending--
        }
        statisticsMap.all.total--
        if (student.status === 'active') statisticsMap.all.active--
        if (student.status === 'frozen') statisticsMap.all.frozen--
        if (student.status === 'pending') statisticsMap.all.pending--

        return success(null, '删除成功')
      }
    }
    return error('学生不存在', 404)
  })

  // 批量操作
  Mock.mock(/\/api\/teacher\/students\/batch/, 'post', (options) => {
    const body = JSON.parse(options.body)
    const { command, ids } = body

    let count = 0
    for (const id of ids) {
      for (const key in studentListData) {
        const student = studentListData[key].find((s) => s.id === id)
        if (student) {
          if (command === 'activate' && student.status !== 'active') {
            const oldStatus = student.status
            student.status = 'active'
            // 更新统计
            const classStats = statisticsMap[parseInt(key)]
            if (classStats) {
              if (oldStatus === 'frozen') classStats.frozen--
              if (oldStatus === 'pending') classStats.pending--
              classStats.active++
            }
            if (oldStatus === 'frozen') statisticsMap.all.frozen--
            if (oldStatus === 'pending') statisticsMap.all.pending--
            statisticsMap.all.active++
            count++
          } else if (command === 'freeze' && student.status !== 'frozen') {
            const oldStatus = student.status
            student.status = 'frozen'
            const classStats = statisticsMap[parseInt(key)]
            if (classStats) {
              if (oldStatus === 'active') classStats.active--
              if (oldStatus === 'pending') classStats.pending--
              classStats.frozen++
            }
            if (oldStatus === 'active') statisticsMap.all.active--
            if (oldStatus === 'pending') statisticsMap.all.pending--
            statisticsMap.all.frozen++
            count++
          }
          break
        }
      }
    }

    const message = command === 'activate' ? `已激活 ${count} 名学生` : `已冻结 ${count} 名学生`
    return success({ count }, message)
  })

  // 重置密码
  Mock.mock(/\/api\/teacher\/student\/\d+\/reset-password/, 'post', (options) => {
    const url = options.url
    const id = parseInt(url.match(/\/student\/(\d+)/)[1])
    const body = JSON.parse(options.body)

    return success({ studentId: id }, `密码已重置为：${body.password || '123456'}`)
  })

  // 批量重置密码
  Mock.mock(/\/api\/teacher\/students\/batch-reset-pwd/, 'post', (options) => {
    const body = JSON.parse(options.body)
    const { ids, password } = body

    return success({ count: ids.length }, `已为 ${ids.length} 名学生重置密码`)
  })

  // 获取学生活动数据（用于详情页图表）
  Mock.mock(/\/api\/teacher\/student-activity/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = parseInt(url.searchParams.get('studentId'))

    const data = studentActivityData[studentId] || [30, 35, 32, 40, 45, 42, 38]
    return success({
      dates: ['03-16', '03-17', '03-18', '03-19', '03-20', '03-21', '03-22'],
      minutes: data,
    })
  })

  // 导出学生数据
  Mock.mock(/\/api\/teacher\/students\/export/, 'get', (options) => {
    // 返回成功，实际项目中会返回文件流
    return success(null, '导出成功')
  })

  // 导入学生数据
  Mock.mock(/\/api\/teacher\/students\/import/, 'post', (options) => {
    // 模拟导入成功
    return success({ count: 10 }, '导入成功，共导入10名学生')
  })
}
