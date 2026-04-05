<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import StatsCard from './component/stats-card.vue'
import { userManageApi, tDashboardApi } from '@/api/index.js'
import { useAuthStore } from '@/stores/index.js'

const authStore = useAuthStore()
const loading = ref(false)
const selectedRows = ref([])

const searchModel = ref({
  classId: '',
  status: '',
  keyword: ""
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const studentList = ref([])
const classList = ref([])

const statistics = reactive({
  total: 0,
  active: 0,
  frozen: 0,
  pending: 0,
  todayActive: 0
})

// 弹窗控制
const dialogVisible = ref(false)
const dialogTitle = ref('新增学生')
const importDialogVisible = ref(false)
const detailDrawerVisible = ref(false)
const resetPwdDialogVisible = ref(false)

// 表单数据
const formRef = ref(null)
const formData = reactive({
  id: null,
  studentNo: '',
  name: '',
  gender: 'M',
  classId: '',
  email: '',
  phone: '',
  password: '',
  status: 'active'
})

const resetPwdForm = reactive({
  studentId: null,
  password: '',
  confirmPassword: ''
})

const currentStudent = ref(null)
let studentActivityChart = null

// 表单验证规则
const formRules = {
  studentNo: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 6, max: 20, message: '学号长度为6-20位', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度为2-20位', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  classId: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const fetchClassList = async () => {
  try {
    const res = await tDashboardApi.getClassList(authStore.userId)
    if (res && res.data) {
      classList.value = res.data
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
  }
}

const fetchStudentList = async () => {
  loading.value = true
  try {
    const res = await userManageApi.getStudentList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchModel.value.keyword,
      classId: searchModel.value.classId,
      status: searchModel.value.status
    })
    if (res && res.data) {
      studentList.value = res.data.list || []
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const res = await userManageApi.getStudentStatistics(searchModel.value.classId)
    if (res && res.data) {
      Object.assign(statistics, res.data)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 新增学生
const addStudent = async (data) => {
  const res = await userManageApi.addStudent(data)
  if (res && res.code === 200) {
    ElMessage.success('新增成功')
    return true
  }
  return false
}

// 更新学生
const updateStudent = async (data) => {
  const res = await userManageApi.updateStudent(data.id, data)
  if (res && res.code === 200) {
    ElMessage.success('更新成功')
    return true
  }
  return false
}

// 删除学生
const deleteStudent = async (id) => {
  const res = await userManageApi.deleteStudent(id)
  if (res && res.code === 200) {
    ElMessage.success('删除成功')
    return true
  }
  return false
}

// 批量操作
const batchOperation = async (command, ids) => {
  const res = await userManageApi.batchOperation({ command, ids })
  if (res && res.code === 200) {
    ElMessage.success(res.message || `批量${command}成功`)
    return true
  }
  return false
}

// 重置密码
const resetPassword = async (studentId, newPassword) => {
  const res = await userManageApi.resetPassword(studentId, newPassword)
  if (res && res.code === 200) {
    ElMessage.success(res.message || '密码重置成功')
    return true
  }
  return false
}

// 获取学生活动数据
const fetchStudentActivity = async (studentId) => {
  try {
    const res = await userManageApi.getStudentActivity(studentId)
    if (res && res.data) {
      return res.data
    }
  } catch (error) {
    console.error('获取学生活动数据失败:', error)
  }
  return { dates: ['03-16', '03-17', '03-18', '03-19', '03-20', '03-21', '03-22'], minutes: [] }
}

// 批量导入
const importStudents = async (file) => {
  const res = await userManageApi.importStudents(file)
  if (res && res.code === 200) {
    return { success: true, count: res.data?.count || 0 }
  }
  return { success: false, count: 0 }
}

const getStatusType = (status) => {
  const map = {
    active: 'success',
    frozen: 'danger',
    pending: 'warning'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    active: '正常',
    frozen: '冻结',
    pending: '待激活'
  }
  return map[status] || status
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return dateTime
}

const handleSearch = () => {
  pagination.page = 1
  fetchStudentList()
}

const handleFilterChange = () => {
  pagination.page = 1
  fetchStudentList()
  fetchStatistics()
}
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchStudentList()
}

const handlePageChange = (page) => {
  pagination.page = page
  fetchStudentList()
}

const handleBatchCommand = (command) => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择学生')
    return
  }
  const ids = selectedRows.value.map(row => row.id)
  const commands = {
    activate: () => {
      ElMessageBox.confirm(`确认激活选中的 ${ids.length} 名学生吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(async () => {
        await batchOperation('activate', ids)
        await fetchStudentList()
        await fetchStatistics()
      })
    },
    freeze: () => {
      ElMessageBox.confirm(`确认冻结选中的 ${ids.length} 名学生吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await batchOperation('freeze', ids)
        await fetchStudentList()
        await fetchStatistics()
      })
    },
    resetPwd: () => {
      ElMessageBox.prompt('请输入新密码', '批量重置密码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{6,}$/,
        inputErrorMessage: '密码长度不能小于6位'
      }).then(async ({ value }) => {
        // 批量重置密码需要单独处理
        for (const id of ids) {
          await resetPassword(id, value)
        }
        ElMessage.success(`已为 ${ids.length} 名学生重置密码`)
      })
    },
    delete: () => {
      ElMessageBox.confirm(`确认删除选中的 ${ids.length} 名学生吗？此操作不可恢复！`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        let successCount = 0
        for (const id of ids) {
          const success = await deleteStudent(id)
          if (success) successCount++
        }
        ElMessage.success(`成功删除 ${successCount} 名学生`)
        await fetchStudentList()
        await fetchStatistics()
      })
    }
  }
  commands[command]?.()
}

const handleRowCommand = (command, row) => {
  switch (command) {
    case 'resetPwd':
      resetPwdForm.studentId = row.id
      resetPwdDialogVisible.value = true
      break
    case 'activate':
      updateStudent({ ...row, status: 'active' }).then(() => {
        fetchStudentList()
        fetchStatistics()
      })
      break
    case 'freeze':
      updateStudent({ ...row, status: 'frozen' }).then(() => {
        fetchStudentList()
        fetchStatistics()
      })
      break
    case 'viewGrades':
      viewStudentGrades(row)
      break
    case 'viewActivity':
      viewStudentActivity(row)
      break
    case 'delete':
      ElMessageBox.confirm(`确认删除学生 ${row.name} 吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await deleteStudent(row.id)
        await fetchStudentList()
        await fetchStatistics()
      })
      break
  }
}

const showAddDialog = () => {
  dialogTitle.value = '新增学生'
  resetForm()
  dialogVisible.value = true
}

const editStudent = (row) => {
  dialogTitle.value = '编辑学生'
  Object.assign(formData, {
    id: row.id,
    studentNo: row.studentNo,
    name: row.name,
    gender: row.gender,
    classId: row.classId,
    email: row.email,
    phone: row.phone,
    status: row.status
  })
  dialogVisible.value = true
}

const viewDetail = (row) => {
  currentStudent.value = row
  detailDrawerVisible.value = true
  setTimeout(() => {
    initStudentActivityChart(row.id)
  }, 100)
}

const viewStudentGrades = (row) => {
  console.log('查看成绩:', row)
  // 可以跳转到成绩分析页面
  // router.push({ path: '/grade-analysis', query: { studentId: row.id } })
}

const viewStudentActivity = (row) => {
  console.log('学习记录:', row)
  // 可以跳转到活跃度监控页面
}

const initStudentActivityChart = async (studentId) => {
  const chartDom = document.getElementById('studentActivityChart')
  if (!chartDom) return
  if (studentActivityChart) {
    studentActivityChart.dispose()
  }
  
  const data = await fetchStudentActivity(studentId)
  
  studentActivityChart = echarts.init(chartDom)
  studentActivityChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.dates
    },
    yAxis: { type: 'value', name: '学习时长(分钟)' },
    series: [{
      type: 'line',
      data: data.minutes,
      smooth: true,
      areaStyle: { opacity: 0.3 },
      lineStyle: { color: '#1d4e7c', width: 2 },
      symbol: 'circle',
      symbolSize: 8
    }]
  })
}

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    studentNo: '',
    name: '',
    gender: 'M',
    classId: '',
    email: '',
    phone: '',
    password: '',
    status: 'active'
  })
  formRef.value?.resetFields()
}

const submitForm = async () => {
  await formRef.value?.validate()
  let success
  if (dialogTitle.value === '新增学生') {
    success = await addStudent(formData)
  } else {
    success = await updateStudent(formData)
  }
  if (success) {
    dialogVisible.value = false
    await fetchStudentList()
    await fetchStatistics()
  }
}

const confirmResetPassword = async () => {
  if (resetPwdForm.password !== resetPwdForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  if (resetPwdForm.password.length < 6) {
    ElMessage.error('密码长度不能小于6位')
    return
  }
  const success = await resetPassword(resetPwdForm.studentId, resetPwdForm.password)
  if (success) {
    resetPwdDialogVisible.value = false
    resetPwdForm.password = ''
    resetPwdForm.confirmPassword = ''
  }
}

const showImportDialog = () => {
  importDialogVisible.value = true
}

const downloadTemplate = () => {
  const link = document.createElement('a')
  link.download = '学生导入模板.xlsx'
  link.href = '/templates/student_import_template.xlsx'
  link.click()
}

const beforeUpload = (file) => {
  const isValid = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel'
  if (!isValid) {
    ElMessage.error('请上传Excel文件')
    return false
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }
  return true
}

const onImportSuccess = async (response) => {
  if (response.code === 200) {
    ElMessage.success(`导入成功，共导入 ${response.data?.count || 0} 名学生`)
    importDialogVisible.value = false
    await fetchStudentList()
    await fetchStatistics()
  } else {
    ElMessage.error(response.message || '导入失败')
  }
}

const onImportError = () => {
  ElMessage.error('导入失败，请检查文件格式或网络')
}

const exportToExcel = () => {
  const params = {
    classId: searchModel.value.classId || '',
    status: searchModel.value.status || '',
    keyword: searchModel.value.keyword || ''
  }
  userManageApi.exportStudents(params)
}

watch([() => searchModel.value.classId, () => searchModel.value.status], () => {
  handleFilterChange()
})

onMounted(async () => {
  await fetchClassList()
  await fetchStudentList()
  await fetchStatistics()
})
</script>

<template>
  <div class="student-manage-container">
    <div class="action-bar">
      <div class="action-left">
        <el-input v-model="searchModel.keyword" placeholder="搜索姓名/学号" prefix-icon="Search" clearable
          style="width: 260px" @clear="handleSearch" @keyup.enter="handleSearch" />
        <el-select size="large" v-model="searchModel.classId" placeholder="按班级筛选" clearable style="width: 150px"
          @change="handleFilterChange">
          <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
        </el-select>
        <el-select size="large" v-model="searchModel.status" placeholder="账号状态" clearable style="width: 120px"
          @change="handleFilterChange">
          <el-option label="正常" value="active" />
          <el-option label="冻结" value="frozen" />
          <el-option label="待激活" value="pending" />
        </el-select>
      </div>
      <div class="action-right">
        <el-button type="primary" @click="showAddDialog">
          <i class="fas fa-plus"></i> 新增学生
        </el-button>
        <el-button @click="showImportDialog">
          <i class="fas fa-upload"></i> 批量导入
        </el-button>
        <el-button @click="exportToExcel">
          <i class="fas fa-file-excel"></i> 导出Excel
        </el-button>
        <el-dropdown @command="handleBatchCommand">
          <el-button>
            批量操作 <i class="fas fa-chevron-down"></i>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="activate">批量激活</el-dropdown-item>
              <el-dropdown-item command="freeze">批量冻结</el-dropdown-item>
              <el-dropdown-item command="resetPwd">批量重置密码</el-dropdown-item>
              <el-dropdown-item command="delete" divided>批量删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" :style="{ marginBottom: '20px' }">
      <el-col :span="6">
        <StatsCard type="total" icon="fa-users" title="学生总数" :value="statistics.total" />
      </el-col>
      <el-col :span="6">
        <StatsCard type="active" icon="fa-user-check" title="正常" :value="statistics.active" />
      </el-col>
      <el-col :span="6">
        <StatsCard type="frozen" icon="fa-user-lock" title="冻结" :value="statistics.frozen" />
      </el-col>
      <el-col :span="6">
        <StatsCard type="pending" icon="fa-user-clock" title="待激活" :value="statistics.pending" />
      </el-col>
    </el-row>

    <!-- 学生列表表格 -->
    <div class="table-container">
      <el-table :data="studentList" v-loading="loading" stripe border @selection-change="handleSelectionChange"
        style="width: 100%">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="studentNo" label="学号" width="120" sortable />
        <el-table-column prop="name" label="姓名" width="120">
          <template #default="{ row }">
            <div class="student-name">
              <el-avatar :size="32" :src="row.avatar">
                {{ row.name?.charAt(0) || 'U' }}
              </el-avatar>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="60">
          <template #default="{ row }">
            <span>{{ row.gender === 'M' ? '男' : '女' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="班级" width="100" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="130" sortable>
          <template #default="{ row }">
            {{ formatDateTime(row.lastLoginTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="110" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">
              <i class="fas fa-eye"></i> 详情
            </el-button>
            <el-button link type="primary" size="small" @click="editStudent(row)">
              <i class="fas fa-edit"></i> 编辑
            </el-button>
            <el-dropdown @command="(cmd) => handleRowCommand(cmd, row)">
              <el-button link type="primary" size="small">
                更多 <i class="fas fa-chevron-down"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="resetPwd">重置密码</el-dropdown-item>
                  <el-dropdown-item :command="row.status === 'active' ? 'freeze' : 'activate'">
                    {{ row.status === 'active' ? '冻结账号' : '激活账号' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="viewGrades">查看成绩</el-dropdown-item>
                  <el-dropdown-item command="viewActivity">学习记录</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handlePageChange" />
      </div>
    </div>

    <!-- 新增/编辑学生弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="resetForm" body-class="form-dialog">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="学号" prop="studentNo">
          <el-input v-model="formData.studentNo" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio value="M">男</el-radio>
            <el-radio value="F">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="班级" prop="classId">
          <el-select v-model="formData.classId" placeholder="请选择班级" style="width: 100%">
            <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="初始密码" prop="password" v-if="dialogTitle === '新增学生'">
          <el-input v-model="formData.password" placeholder="默认密码为123456" show-password />
        </el-form-item>
        <el-form-item label="账号状态" prop="status" v-if="dialogTitle === '编辑学生'">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="正常" value="active" />
            <el-option label="冻结" value="frozen" />
            <el-option label="待激活" value="pending" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog v-model="importDialogVisible" title="批量导入学生" width="600px">
      <div class="import-content">
        <div class="import-tips">
          <i class="fas fa-info-circle"></i>
          <span>请下载模板，按照模板格式填写后上传</span>
        </div>
        <div class="import-actions">
          <el-button type="primary" plain @click="downloadTemplate">
            <i class="fas fa-download"></i> 下载导入模板
          </el-button>
          <el-upload class="upload-demo" drag action="/api/teacher/students/import" :before-upload="beforeUpload"
            :on-success="onImportSuccess" :on-error="onImportError" accept=".xlsx,.xls">
            <i class="fas fa-cloud-upload-alt"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">
                支持 .xlsx 和 .xls 格式，文件大小不超过10MB
              </div>
            </template>
          </el-upload>
        </div>
      </div>
    </el-dialog>

    <!-- 学生详情弹窗 -->
    <el-drawer v-model="detailDrawerVisible" title="学生详情" direction="rtl" size="500px">
      <div class="student-detail" v-if="currentStudent">
        <div class="detail-avatar">
          <el-avatar :size="80" :src="currentStudent.avatar">
            {{ currentStudent.name?.charAt(0) }}
          </el-avatar>
          <h3>{{ currentStudent.name }}</h3>
          <p>{{ currentStudent.studentNo }}</p>
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="性别">
            {{ currentStudent.gender === 'M' ? '男' : '女' }}
          </el-descriptions-item>
          <el-descriptions-item label="班级">
            {{ currentStudent.className }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ currentStudent.email || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ currentStudent.phone || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="账号状态">
            <el-tag :type="getStatusType(currentStudent.status)" size="small">
              {{ getStatusText(currentStudent.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后登录">
            {{ formatDateTime(currentStudent.lastLoginTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">
            {{ currentStudent.createTime }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-charts">
          <h4>近7天学习数据</h4>
          <div id="studentActivityChart" style="height: 200px"></div>
        </div>
      </div>
    </el-drawer>

    <!-- 重置密码弹窗 -->
    <el-dialog v-model="resetPwdDialogVisible" title="重置密码" width="400px" body-class="form-dialog">
      <el-form :model="resetPwdForm" label-width="100px">
        <el-form-item label="新密码">
          <el-input v-model="resetPwdForm.password" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="resetPwdForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPwdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmResetPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.student-manage-container {
  width: 100%;
  min-height: 100vh;

  .action-bar {
    background: white;
    border-radius: 16px;
    padding: 16px 24px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .action-left {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .action-right {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  .table-container {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .student-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .import-content {
    padding: 20px 0;

    .import-tips {
      background: #ecf5ff;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1d4e7c;

      i {
        font-size: 18px;
      }
    }


    .import-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;

      .upload-demo {
        width: 100%;
      }
    }
  }

  .student-detail {
    padding: 0 8px;

    .detail-avatar {
      text-align: center;
      margin-bottom: 24px;

      h3 {
        margin: 12px 0 4px;
        font-size: 20px;
      }

      p {
        color: #64748b;
        font-size: 14px;
      }
    }

    .detail-charts {
      margin-top: 24px;
    }
  }

  :deep(.form-dialog) {
    padding: 20px 15px 20px 0;
  }

}



@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;

    .action-left,
    .action-right {
      justify-content: stretch;
    }

    .action-left .el-input,
    .action-left .el-select {
      width: 100% !important;
    }

  }

}
</style>