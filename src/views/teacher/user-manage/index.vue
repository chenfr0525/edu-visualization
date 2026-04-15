<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import StatsCard from './component/stats-card.vue'
import { userManageApi, tDashboardApi, dashboardApi, fileApi } from '@/api/index.js'
import { tr } from 'element-plus/es/locale/index.mjs'
import { exportMemberExcel } from '@/utils/export'
import StatBox from '@/views/student/dashboard/component/stat-box.vue'

//文件解析模块
const beforeUpload = (file) => {
  const isValidSize = file.size / 1024 / 1024 < 10
  if (!isValidSize) {
    ElMessage.error('文件大小不能超过 10MB')
    return false
  }
  return true
}

// 文件变化处理
const handleFileChange = (file, fileList) => {
  selectedFile.value = file.raw
  parseResult.value = null  // 清空之前的解析结果
}

// 上传文件并解析
const uploadFile = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  uploading.value = true
  try {
    const result = await fileApi.uploadFile(
      selectedFile.value,
      "学生信息",
    )
    console.log("文件上传成功", result.data)
    parseResult.value = result.data

    if (result.success) {
      ElMessage.success(`解析成功！共 ${result.data?.length || 0} 条数据`)
    } else {
      ElMessage.error('解析失败，请检查文件格式')
    }
  } catch (error) {
    console.log("解析失败", error)
    console.error('上传失败', error)
    ElMessage.error(error.message || '上传失败，请稍后重试')
  } finally {
    uploading.value = false
  }
}

// 确认插入数据库
const confirmInsert = async () => {
  if (!parseResult.value || !parseResult.value.sessionId) {
    ElMessage.error('数据无效，请重新上传')
    return
  }

  try {
    await ElMessageBox.confirm('确认要将这些数据插入数据库吗？', '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    confirming.value = true

    // 确认插入
    await fileApi.confirmInsert(
      parseResult.value.sessionId,
      parseResult.value.data,
      true
    )

    ElMessage.success('数据已成功插入数据库')
    parseResult.value = null
    selectedFile.value = null
    uploadRef.value?.clearFiles()

  } catch (error) {
    if (error !== 'cancel') {
      console.error('插入失败', error)
      ElMessage.error(error.message || '插入失败')
    }
  } finally {
    confirming.value = false
  }
}

// 取消插入
const cancelInsert = async () => {
  if (!parseResult.value || !parseResult.value.sessionId) return

  try {
    await ElMessageBox.confirm('确认要取消并删除这些数据吗？', '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await fileApi.cancelInsert(parseResult.value.sessionId)
    ElMessage.success('已取消，临时数据已清理')
    parseResult.value = null
    selectedFile.value = null
    uploadRef.value?.clearFiles()

  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消失败', error)
    }
  }
}

// 清空文件
const clearFile = () => {
  selectedFile.value = null
  parseResult.value = null
  uploadRef.value?.clearFiles()
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

// 响应式数据
const uploadRef = ref(null)
const selectedFile = ref(null)
const uploading = ref(false)
const confirming = ref(false)
const parseResult = ref(null)



const loading = ref(false)
const currentStudentDashboardData = ref({})
const searchModel = ref({
  classId: '',
  courseId: '',
  keyword: ""
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const studentList = ref([])
const classList = ref([])
const courseList = ref([])
const statistics = reactive({
  totalStudentCount: 0,
  avgActivityScore: 0,
  lowActivityCount: 0,
  avgExamScore: 0
})

// 弹窗控制
const dialogVisible = ref(false)
const dialogTitle = ref('新增学生')
const importDialogVisible = ref(false)
const detailDrawerVisible = ref(false)

// 表单数据
const formRef = ref(null)
const formData = ref({
  id: null,
  studentNo: '',
  name: '',
  gender: '男',
  classId: '',
  email: '',
  phone: '',
  password: '',
  grade: '大一',
})

const currentStudent = ref(null)
let studentActivityChart = null
let studentRadarChart = null

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
    const res = await tDashboardApi.getClassList()
    if (res && res.data) {
      classList.value = res.data
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
  }
}

const fetchCourseList = async () => {
  try {
    const res = await tDashboardApi.getCourseList()
    if (res && res.data) {
      courseList.value = res.data
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
}

const fetchStudentList = async () => {
  loading.value = true
  try {
    const res = await userManageApi.getStudentList({
      page: pagination.page - 1,
      size: pagination.pageSize,
      keyword: searchModel.value.keyword,
      classId: searchModel.value.classId,
      courseId: searchModel.value.courseId
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
    const res = await userManageApi.getStudentStatistics(searchModel.value.classId, searchModel.value.courseId)
    if (res && res.data) {
      Object.assign(statistics, res.data)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}


// 获取学生详情图表
const fetchStudentDashboard = async (studentId) => {
  try {
    const res = await dashboardApi.getStudentDashbord(studentId)
    if (res && res.data) {
      currentStudentDashboardData.value = res.data
      console.log('dashborad', currentStudentDashboardData.value)
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
  ElMessage.error(res?.message || '新增失败')
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


const handleSearch = () => {
  pagination.page = 1
  fetchStudentList()
}

const handleFilterChange = () => {
  pagination.page = 1
  fetchStudentList()
  fetchStatistics()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchStudentList()
}

const handlePageChange = (page) => {
  pagination.page = page
  fetchStudentList()
}

const handleRowCommand = (command, row) => {
  switch (command) {
    case 'resetPwd':
      ElMessageBox.confirm(`确认重置${row.user.name}密码吗?`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await userManageApi.resetPassword(row.id)
        ElMessage.success(`已为 ${row.user.name} 学生重置密码`)
      })
      break
    case 'delete':
      ElMessageBox.confirm(`确认删除学生 ${row.user.name} 吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await userManageApi.deleteStudent(row.id)
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

  formData.value = {
    id: row.id,
    studentNo: row.studentNo,
    name: row.user.name,
    gender: row.user.gender,
    classId: row.classInfo.id,
    email: row.user.email,
    phone: row.user.phone,
  }
  dialogVisible.value = true
}
const viewDetail = async (row) => {
  await fetchStudentDashboard(row.id)
  currentStudent.value = row
  detailDrawerVisible.value = true
  setTimeout(() => {
    initStudentActivityChart()
    initRadarChart()
  }, 100)
}
const knowledgeData = computed(() => {
  return currentStudentDashboardData.value?.knowledgeRadarData
})
const initRadarChart = async () => {
  const chartDom = document.getElementById('studentRadarChart')
  if (!chartDom) return
  if (studentRadarChart) {
    studentRadarChart.dispose()
  }
  const indicators = Object.keys(knowledgeData.value).map(name => ({ name, max: 100 }));
  const currentData = Object.values(knowledgeData.value);
  studentRadarChart = echarts.init(chartDom)
  studentRadarChart.setOption({
    title: {
      text: '知识点掌握程度',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: ['当前掌握程度'],
      left: 'left'
    },
    radar: {
      indicator: indicators,
      shape: 'circle',
      center: ['50%', '50%'],
      radius: '65%',
      name: {
        textStyle: {
          fontSize: 12
        }
      }
    },
    series: [
      {
        name: '知识点掌握情况',
        type: 'radar',
        data: [
          {
            value: currentData,
            name: '当前掌握程度',
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.3)'
            },
            lineStyle: {
              color: '#409EFF',
              width: 2
            },
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
      }
    ]
  }
  )
}
const gradeTrendData = computed(() => currentStudentDashboardData.value?.scoreTrend || [{ examName: '考试一', score: 0, classRank: 0 }])
const initStudentActivityChart = async () => {
  const chartDom = document.getElementById('studentActivityChart')
  if (!chartDom) return
  if (studentActivityChart) {
    studentActivityChart.dispose()
  }
  const scores = gradeTrendData.value.map(item => item.score);
  const exams = gradeTrendData.value.map(item => item.examName);
  const classRank = gradeTrendData.value.map(item => item.classRank);

  studentActivityChart = echarts.init(chartDom)
  studentActivityChart.setOption({
    title: {
      text: '学习成绩趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['我的成绩', '班级排名'],
      left: 'left'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: exams,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      max: 100,
      name: '分数'
    },
    series: [
      {
        name: '我的成绩',
        data: scores,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#409EFF',
          width: 3
        },
        areaStyle: {
          color: 'rgba(64, 158, 255, 0.1)'
        },
        markPoint: {
          data: [
            { type: 'max', name: '最高分' },
            { type: 'min', name: '最低分' }
          ]
        },
        markLine: {
          data: [{ type: 'average', name: '平均值' }]
        }
      },
      {
        name: '班级排名',
        data: classRank,
        type: 'line',
        smooth: true,
        symbol: 'diamond',
        symbolSize: 8,
        lineStyle: {
          color: '#67C23A',
          width: 2,
          type: 'dashed'
        }
      }
    ]
  })
}

const resetForm = () => {
  formData.value = {
    id: null,
    studentNo: '',
    name: '',
    gender: '男',
    classId: '',
    email: '',
    phone: '',
    password: '',
  }
  formRef.value?.resetFields()
}

const submitForm = async () => {
  await formRef.value?.validate()
  let success
  if (dialogTitle.value === '新增学生') {
    success = await addStudent(formData.value)
  } else {
    success = await updateStudent(formData.value)
  }
  if (success) {
    dialogVisible.value = false
    await fetchStudentList()
    await fetchStatistics()
  }
}

const showImportDialog = () => {
  importDialogVisible.value = true
}


const exportToExcel = () => {
  try {
    console.log('qwe', studentList.value)
    const exportData = studentList.value?.map((item, index) => ({
      id: index + 1,
      name: item?.user.name || '',
      username: item?.user.username || "",
      studentNo: item?.studentNo,
      grade: item?.grade,
      email: item?.user?.email || '',
      gender: item?.user?.gender || "未知",
      phone: item?.user?.phone || '',
      className: item?.classInfo?.name || '',
      teacherName: item?.classInfo?.teacher?.user?.name || '',
      teacherPhone: item?.classInfo?.teacher?.user?.phone || ''
    })) || []
    if (exportData.length === 0) {
      ElMessage.warning('没有可导出的数据')
      return
    }
    //导出数据
    exportMemberExcel(exportData, `学生数据_${new Date().toLocaleDateString()}`)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error(`导出失败: ${error.message}`)
  }
}

watch([() => searchModel.value.classId, () => searchModel.value.courseId], () => {
  handleFilterChange()
})

watch([() => formData.value?.classId], () => {
  if (formData.value?.classId) {
    const selectedClass = classList.value.find(cls => cls.id === formData.value.classId)
    if (selectedClass) {
      formData.value.grade = selectedClass.grade
    }
  } else {
    formData.value.grade = '大一'
  }
})

onMounted(async () => {
  await fetchClassList()
  await fetchCourseList()
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
        <el-select size="large" v-model="searchModel.courseId" placeholder="按课程筛选" clearable style="width: 150px"
          @change="handleFilterChange">
          <el-option v-for="cls in courseList" :key="cls.id" :label="cls.name" :value="cls.id" />
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
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" :style="{ marginBottom: '20px' }">
      <el-col :span="6">
        <StatsCard type="total" icon="fa-users" title="学生总数" :value="statistics.totalStudentCount" />
      </el-col>
      <el-col :span="6">
        <StatsCard type="active" icon="fa-user-check" title="平均活动分数" :value="statistics.avgActivityScore" />
      </el-col>
      <el-col :span="6">
        <StatsCard type="frozen" icon="fa-user-lock" title="低活跃人数" :value="statistics.lowActivityCount" />
      </el-col>
      <el-col :span="6">
        <StatsCard type="pending" icon="fa-user-clock" title="平均考试成绩" :value="statistics.avgExamScore" />
      </el-col>
    </el-row>

    <!-- 学生列表表格 -->
    <div class="table-container">
      <el-table :data="studentList" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="user.username" label="用户名" width="120" />
        <el-table-column prop="user" label="姓名" width="120">
          <template #default="{ row }">
            <div class="student-name">
              <el-avatar :size="32" :src="row.avatar">
                {{ row.user.name?.charAt(0) || 'U' }}
              </el-avatar>
              <span>{{ row.user.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="60">
          <template #default="{ row }">
            <span>{{ row.user.gender }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="classInfo.name" label="班级" width="100" />
        <el-table-column prop="user.email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="user.phone" label="手机号" width="120" />
        <el-table-column prop="lastLoginTime" label="最后登录" width="130">
          <template #default="{ row }">
            {{ row.user.lastLoginTime?.slice(0, 3).join('.') }}
          </template>
        </el-table-column>
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
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
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
          <span>包含基本学生信息，否则导入不成功！</span>
        </div>
        <div class="import-actions">
          <el-upload ref="uploadRef" class="upload-demo" drag :auto-upload="false" :on-change="handleFileChange"
            :before-upload="beforeUpload" :limit="1" accept=".xlsx,.xls,.csv,.txt,.pdf,.doc,.docx">
            <i class="fas fa-cloud-upload-alt"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">
                支持 .xlsx, .csv, .txt, .pdf, .docx 格式文件，文件大小不超过10MB
              </div>
            </template>
          </el-upload>
          <!-- 选中的文件信息 -->
          <div v-if="selectedFile" class="file-info">
            <el-alert :title="`已选择文件：${selectedFile.name}`" type="info" :closable="false" />
          </div>
        </div>
      </div>
      <!-- 操作按钮 -->
      <div v-if="selectedFile" class="action-buttons">
        <el-button type="primary" @click="uploadFile" :loading="uploading">
          <el-icon>
            <Upload />
          </el-icon>
          开始解析
        </el-button>
        <el-button @click="clearFile">清空</el-button>
      </div>

      <!-- 解析结果展示 -->
      <div v-if="parseResult" class="parse-result">
        <el-divider>解析结果</el-divider>

        <!-- 成功提示 -->
        <el-alert v-if="parseResult.success" title="解析成功" type="success" :closable="false" />

        <!-- 错误提示 -->
        <el-alert v-else title="解析失败" type="error" :closable="false">
          <template #default>
            <div v-for="(error, idx) in parseResult.errors" :key="idx" class="error-item">
              {{ error.errorMessage }}
            </div>
          </template>
        </el-alert>

        <!-- 数据摘要 -->
        <div class="summary">
          <strong>摘要：</strong>{{ parseResult.summary }}
        </div>

        <!-- 解析出的数据表格 -->
        <div v-if="parseResult.data && parseResult.data.length > 0" class="data-table">
          <h4>解析出的数据（请确认）</h4>
          <el-table :data="parseResult.data" border stripe height="300">
            <el-table-column v-for="col in Object.keys(parseResult.data[0])" :key="col" :prop="col" :label="col"
              width="150">
              <template #default="{ row }">
                <el-input v-model="row[col]" size="small" />
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 确认按钮 -->
        <div v-if="parseResult.data" class="confirm-buttons">
          <el-button type="success" @click="confirmInsert" :loading="confirming">
            <el-icon>
              <Check />
            </el-icon>
            确认插入数据库
          </el-button>
          <el-button type="danger" @click="cancelInsert">
            <el-icon>
              <Close />
            </el-icon>
            取消
          </el-button>
        </div>
      </div>

    </el-dialog>

    <!-- 学生详情弹窗 -->
    <el-drawer v-model="detailDrawerVisible" title="学生详情" direction="rtl" size="1200px">
      <div class="student-detail" v-if="currentStudent">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="名字">
            <div class="detail-avatar">
              <el-avatar :size="80" :src="currentStudent.avatar">
                {{ currentStudent.user.name?.charAt(0) }}
              </el-avatar>
              <h3>{{ currentStudent.user.name }}</h3>
              <p>{{ currentStudent.studentNo }}</p>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ currentStudent?.user?.gender || '未知' }}
          </el-descriptions-item>
          <el-descriptions-item label="班级">
            {{ currentStudent.classInfo.name }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ currentStudent.user.email || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ currentStudent.user.phone || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ currentStudent.user.phone || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="导师">
            {{ currentStudent?.classInfo?.teacher?.user?.name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="导师电话">
            {{ currentStudent?.classInfo?.teacher?.user?.phone || '-' }}
          </el-descriptions-item>
        </el-descriptions>
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="6">
            <StatBox icon="fa-book-open" title="活动得分" :stat-num="currentStudentDashboardData.activityScore" />
          </el-col>
          <el-col :span="6">
            <StatBox icon="fa-clock" title="作业平均分" :stat-num="currentStudentDashboardData.homeworkAvgScore" />
          </el-col>
          <el-col :span="6">
            <StatBox icon="fa-pencil-alt" title="平均分" :stat-num="currentStudentDashboardData.avgScore" />
          </el-col>
          <el-col :span="6">
            <StatBox icon="fa-trophy" title="作业完成数" :stat-num="currentStudentDashboardData.completedHomework" />
          </el-col>
        </el-row>
        <div class="detail-charts">
          <div id="studentActivityChart" style="height: 200px"></div>
        </div>
        <div class="detail-charts" v-if="Object.keys(knowledgeData || {}).length > 0">
          <div id="studentRadarChart" style="height: 200px"></div>
        </div>
      </div>
    </el-drawer>
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