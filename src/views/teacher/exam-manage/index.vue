<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import InfoItem from './component/info-item.vue'
import { exportToPDF, formatExamDate } from '@/utils/export'
import StatCard from './component/stat-card.vue'
import { tExamApi, tDashboardApi } from '@/api/index.js'
import { useAuthStore } from '@/stores/index.js'
import StatsCard from '../user-manage/component/stats-card.vue'

const loading = ref(false)
const saving = ref(false)
const analysisContentRef = ref(null)

// 筛选条件
const searchModel = ref({
  classId: '',
  courseId: "",
  keyword: ''
})

const statistics = ref({
  totalExamCount: 0,
  overallAvgScore: 0,
  overallPassRate: 0,
  overallExcellentRate: 0,
})

const scoreListSearch = ref(null)
const scoreList = ref([])
const scoreMoreData = ref(null)
const scoreListPage = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 列表数据
const examList = ref([])
const classList = ref([])
const courseList = ref([])

const examDialogVisible = ref(false)
const scoreEntryVisible = ref(false)
const analysisDialogVisible = ref(false)
const drawerVisible = ref(false)
const analysisDetailData = ref(null)
const viewScoresDialogVisible = ref(false)

const examFormRef = ref(null)
const examForm = ref({
  id: null,
  name: '',
  type: '',
  classId: '',
  examDate: '',
  fullScore: 100,
  passScore: 60,
  description: ''
})

const dialogTitle = computed(() => examForm.value.id ? '编辑考试' : '创建考试')

const examRules = {
  name: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择考试类型', trigger: 'change' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  examDate: [{ required: true, message: '请选择考试日期', trigger: 'change' }],
  fullScore: [{ required: true, message: '请输入满分', trigger: 'blur' }]
}

const currentExam = ref(null)
const enteredCount = computed(() => {
  return scoreList.value.filter(s => s.score !== null && s.score !== '').length
})

const entryProgressColor = computed(() => {
  const total = currentExam.value?.totalStudents || 1
  const percent = (enteredCount.value / total) * 100
  if (percent >= 100) return '#67c23a'
  if (percent >= 50) return '#409eff'
  return '#e6a23c'
})

// 图表实例
let histogramChart = null
let pieChart = null
let rangeBarChart = null

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

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const res = await tExamApi.getExamStatistics(searchModel.value.classId, searchModel.value.courseId)
    if (res && res.data) {
      statistics.value = res.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchExamList = async () => {
  loading.value = true
  try {
    const res = await tExamApi.getExamLists({
      page: pagination.page - 1,
      pageSize: pagination.pageSize,
      classId: searchModel.value.classId,
      courseId: searchModel.value.courseId,
      keyword: searchModel.value.keyword
    })
    if (res && res.data) {
      examList.value = res.data.list || []
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取考试列表失败:', error)
    ElMessage.error('获取考试列表失败')
  } finally {
    loading.value = false
  }
}


const loadExamScoreData = async () => {
  const res = await tExamApi.getScoreList({
    page: scoreListPage.value.page - 1,
    size: scoreListPage.value.pageSize,
    examId: currentExam.value?.id,
    classId: currentExam.value?.classId,
    courseId: currentExam.value?.courseId,
    keyword: scoreListSearch.value
  })
  if (res?.data) {
    scoreMoreData.value = { ...res.data, ...currentExam.value }
    console.log('scoreList', scoreMoreData.value)
    scoreList.value = res.data?.records
    scoreListPage.value.total = res.data?.total || 0
  }
}

const createExam = async (data) => {
  const res = await tExamApi.createExam(data)
  if (res && res.code === 200) {
    ElMessage.success('考试创建成功')
    return true
  }
  return false
}

const updateExam = async (data) => {
  const res = await tExamApi.updateExam(data.id, data)
  if (res && res.code === 200) {
    ElMessage.success('更新成功')
    return true
  }
  return false
}

const deleteExam = async (id) => {
  const res = await tExamApi.deleteExam(id)
  if (res && res.code === 200) {
    ElMessage.success('删除成功')
    return true
  }
  return false
}

const fetchScores = async (examId) => {
  const res = await tExamApi.getExamScores(examId)
  if (res && res.data) {
    return { list: res.data.list || [] }
  }
  return { list: [] }
}

const saveScoresApi = async (examId, scores) => {
  const res = await tExamApi.saveExamScores(examId, scores)
  if (res && res.code === 200) {
    ElMessage.success('成绩保存成功')
    return true
  }
  return false
}

const publishScoresApi = async (examId) => {
  const res = await tExamApi.publishExamScores(examId)
  if (res && res.code === 200) {
    ElMessage.success('成绩已发布')
    return true
  }
  return false
}

const fetchExamAnalysis = async (examId) => {
  const res = await tExamApi.getExamAnalysis(examId)
  if (res && res.data) {
    return res.data
  }
  return null
}

const getExamTypeTag = (type) => {
  const map = { "MIDTERM": 'primary', "FINAL": 'danger', "MONTHLY": 'warning', "MOCK": 'info', "UNIT": 'success' }
  return map[type] || 'info'
}



const getExamTypeColor = (type) => {
  const map = { "MIDTERM": '#409eff', "FINAL": '#f56c6c', "MONTHLY": '#e6a23c', "MOCK": '#909399', "UNIT": '#67c23a' }
  return map[type] || '#909399'
}

const getStatusType = (status) => {
  const map = { "UPCOMING": 'info', "ONGOING": 'warning', 'COMPLETED': 'success' }
  return map[status] || 'info'
}

const progressColor = (rate) => {
  if (rate >= 80) return '#67C23A'
  if (rate >= 60) return '#E6A23C'
  return '#F56C6C'
}

const getScoreClass = (score, fullScore) => {
  if (!score) return ''
  const percent = (score / fullScore) * 100
  if (percent >= 85) return 'score-excellent'
  if (percent >= 70) return 'score-good'
  if (percent >= 60) return 'score-pass'
  return 'score-fail'
}

const getScoreStatusType = (score, passScore) => {
  if (!score) return 'info'
  return score >= passScore ? 'success' : 'danger'
}

const getScoreStatus = (score, passScore) => {
  if (!score) return '未录入'
  return score >= passScore ? '及格' : '不及格'
}

const onScoreChange = (row, index) => {
  // 自动计算排名（可选）
  console.log('分数变化:', row.studentName, row.score)
}

const handleSearch = () => {
  pagination.page = 1
  fetchExamList()
}

const handleFilterChange = () => {
  pagination.page = 1
  fetchExamList()
  fetchStatistics()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchExamList()
}

const handlePageChange = (page) => {
  pagination.page = page
  fetchExamList()
}

const handleScoreSizeChange = (size) => {
  scoreListPage.pageSize = size
  loadExamScoreData()
}

const handleScorePageChange = (page) => {
  scoreListPage.pageSize = size
    .page = page
  loadExamScoreData()
}

const showCreateDialog = () => {
  resetExamForm()
  examDialogVisible.value = true
}

const editExam = (exam) => {
  examForm.value = {
    id: exam.id,
    name: exam.name,
    type: exam.type,
    classId: exam.classId,
    courseId: exam.courseId,
    examTime: formatExamDate(exam.examDate),
    duration: 120,
    fullScore: exam.fullScore || 100,
    passScore: exam.passScore || 60,
    description: exam.description || ''
  }
  examDialogVisible.value = true
}

const resetExamForm = () => {
  examForm.value = {
    id: null,
    name: '',
    type: '',
    classId: '',
    courseId: '',
    examDate: '',
    fullScore: 100,
    passScore: 60,
    description: '',
    duration: 120
  }
  examFormRef.value?.resetFields()
}

const submitExam = async () => {
  await examFormRef.value?.validate()
  let success
  if (examForm.value.id) {
    success = await updateExam(examForm.value)
  } else {
    success = await createExam(examForm.value)
  }
  if (success) {
    examDialogVisible.value = false
    await fetchExamList()
    await fetchStatistics()
  }
}

const handleExamCommand = (command, exam) => {
  switch (command) {
    case 'edit':
      editExam(exam)
      break
    case 'viewScores':
      viewExamScores(exam)
      break
    case 'viewExamAnalysis':
      viewExamDetail(exam)
      break
    case 'export':
      exportScores(exam)
      break
    case 'delete':
      ElMessageBox.confirm(`确认删除考试 "${exam.name}" 吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const success = await deleteExam(exam.id)
        if (success) {
          await fetchExamList()
          await fetchStatistics()
        }
      }).catch(() => { })
      break
  }
}

const enterScores = async (exam) => {
  currentExam.value = exam
  const res = await fetchScores(exam.id)
  scoreList.value = res.list
  scoreEntryVisible.value = true
}
const resetScoreForm = () => {
  scoreList.value = []
  currentExam.value = null
  saving.value = false
}

const saveScores = async () => {
  saving.value = true
  try {
    const scores = scoreList.value.map(s => ({
      id: s.id,
      studentId: s.studentId,
      score: s.score,
      remark: s.remark
    }))
    const success = await saveScoresApi(currentExam.value.id, scores)
    if (success) {
      // 更新当前考试状态
      currentExam.value.status = 'ongoing'
      await fetchExamList()
      await fetchStatistics()
    }
  } finally {
    saving.value = false
  }
}

const completeScoreEntry = async () => {
  await saveScores()
  const success = await publishScoresApi(currentExam.value.id)
  if (success) {
    scoreEntryVisible.value = false
    await fetchExamList()
  }
}

const importScores = () => {
  ElMessage.info('批量导入功能开发中')
}

const exportScoreTemplate = () => {
  window.open(`/api/teacher/exam/${currentExam.value.id}/template`, '_blank')
}

const viewExamScores = async (exam) => {
  currentExam.value = exam
  await loadExamScoreData()
  viewScoresDialogVisible.value = true
}


const initAnalysisCharts = () => {
  if (!analysisDetailData.value) return
  // 成绩分布直方图
  const histogramDom = document.getElementById('scoreHistogramChart')
  if (histogramDom && analysisDetailData.value?.scoreDistribution) {
    if (histogramChart) histogramChart.dispose()
    histogramChart = echarts.init(histogramDom)
    histogramChart.setOption({
      title: { text: '成绩分布', left: 'center' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: ['优秀(≥90)', '良好(80-89)', '中等(70-79)', '及格(60-69)', '不及格(<60)'],
        axisLabel: { rotate: 0 }
      },
      yAxis: { type: 'value', name: '人数' },
      series: [{
        type: 'bar',
        data: [
          analysisDetailData.value?.scoreDistribution.excellentCount,
          analysisDetailData.value?.scoreDistribution.goodCount,
          analysisDetailData.value?.scoreDistribution.mediumCount,
          analysisDetailData.value?.scoreDistribution.passCount,
          analysisDetailData.value?.scoreDistribution.failCount
        ],
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: (params) => {
            const colors = ['#67c23a', '#409eff', '#e6a23c', '#f56c6c', '#f56c6c']
            return colors[params.dataIndex]
          }
        },
        label: { show: true, position: 'top' }
      }]
    })
  }

  // 成绩仪表盘（环形图）
  const pieDom = document.getElementById('scorePieChart')
  if (pieDom && analysisDetailData.value?.stats) {
    if (pieChart) pieChart.dispose()
    pieChart = echarts.init(pieDom)
    pieChart.setOption({
      series: [
        {
          name: '平均分',
          type: 'gauge',
          center: ['25%', '50%'],
          radius: '70%',
          min: 0,
          max: 100,
          detail: { formatter: '{value}分' },
          data: [{ value: analysisDetailData.value?.stats.avgScore, name: '平均分' }],
          axisLabel: { show: false }
        },
        {
          name: '及格率',
          type: 'gauge',
          center: ['75%', '50%'],
          radius: '70%',
          min: 0,
          max: 100,
          detail: { formatter: '{value}%' },
          data: [{ value: analysisDetailData.value?.stats.passRate, name: '及格率' }],
          axisLabel: { show: false }
        }
      ]
    })
  }

  // 知识点掌握雷达图
  const rangeBarDom = document.getElementById('scoreRangeBarChart')
  if (rangeBarDom && analysisDetailData.value?.knowledgePointAnalysis) {
    if (rangeBarChart) rangeBarChart.dispose()
    rangeBarChart = echarts.init(rangeBarDom)
    rangeBarChart.setOption({
      title: { text: '知识点掌握雷达图', left: 'center' },
      tooltip: { trigger: 'item' },
      radar: {
        indicator: analysisDetailData.value?.knowledgePointAnalysis.map(kp => ({
          name: kp.knowledgePointName,
          max: 100
        })),
        center: ['50%', '50%'],
        radius: '65%',
        name: { textStyle: { fontSize: 10, color: '#406e96' } }
      },
      series: [{
        type: 'radar',
        data: [{ value: analysisDetailData.value?.knowledgePointAnalysis.map(kp => kp.classAvgRate), name: '班级平均得分率' }],
        areaStyle: { color: 'rgba(64, 158, 255, 0.2)' },
        lineStyle: { color: '#409eff', width: 2 },
        itemStyle: { color: '#409eff' }
      }]
    })
  }
}
const viewExamDetail = async (exam) => {
  await loadDetailData(exam?.id)
  drawerVisible.value = true
}

const loadDetailData = async (examId) => {
  const res = await tExamApi.getExamAnalysis(examId)
  analysisDetailData.value = res?.data || {}
  setTimeout(() => {
    initAnalysisCharts()
  }, 100)
}

const exportScores = (exam) => {
  window.open(`/api/teacher/exam/${exam.id}/export`, '_blank')
}

const importScore = (exam) => {
  console.log('importScore')
}

const exportExamsData = () => {
  const params = {
    classId: searchModel.value.classId || '',
    courseId: searchModel.value.courseId || '',
    type: searchModel.value.examType || '',
    keyword: searchModel.value.keyword || ''
  }
  tExamApi.exportExamsData(params)
}

onMounted(async () => {
  await fetchClassList()
  await fetchCourseList()
  await fetchExamList()
  await fetchStatistics()
})
</script>

<template>
  <div class="exam-manage-container">
    <div class="action-bar">
      <div class="action-left">
        <el-select size="large" v-model="searchModel.classId" placeholder="选择班级" style="width: 140px"
          @change="handleFilterChange">
          <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
        </el-select>
        <el-select size="large" v-model="searchModel.courseId" placeholder="按课程筛选" clearable style="width: 150px"
          @change="handleFilterChange">
          <el-option v-for="cls in courseList" :key="cls.id" :label="cls.name" :value="cls.id" />
        </el-select>
        <el-input v-model="searchModel.keyword" placeholder="搜索考试名称" prefix-icon="Search" clearable style="width: 200px"
          @clear="handleSearch" @keyup.enter="handleSearch" />
      </div>
      <div class="action-right">
        <el-button type="primary" @click="showCreateDialog">
          <i class="fas fa-plus"></i> 创建考试
        </el-button>
        <el-button @click="exportExamsData">
          <i class="fas fa-file-excel"></i> 导出数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" :style="{ marginBottom: '20px' }">
      <el-col :span="6">
        <stats-card type="total" icon="fa-users" title="考试总数" :value="statistics.totalExamCount" />
      </el-col>
      <el-col :span="6">
        <StatsCard type="active" icon="fa-user-check" title="平均分" :value="statistics.overallAvgScore" />
      </el-col>
      <el-col :span="6">
        <StatsCard type="frozen" icon="fa-user-lock" title="及格率" :value="statistics.overallPassRate" />
      </el-col>
      <el-col :span="6">
        <StatsCard type="pending" icon="fa-user-clock" title="优秀率" :value="statistics.overallExcellentRate" />
      </el-col>
    </el-row>

    <div class="exam-table-container">
      <el-table :data="examList" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="name" label="考试名称" min-width="180">
          <template #default="{ row }">
            <div class="exam-name">
              <i class="fas fa-file-alt" :style="{ color: getExamTypeColor(row.type) }"></i>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getExamTypeTag(row.type)" size="small">
              {{ row.typeText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="班级" width="100" />
        <el-table-column prop="courseName" label="课程" width="100" />
        <el-table-column prop="examDate" label="考试日期" width="110">
          <template #default="{ row }">
            {{ row.examDate.slice(0, 3).join('-') }}
          </template>
        </el-table-column>
        <el-table-column prop="fullScore" label="满分" width="90" align="center" />
        <el-table-column prop="studentCount" label="参与人数" width="90" align="center" />
        <el-table-column prop="avgScore" label="平均分" width="80" sortable>
          <template #default="{ row }">
            <span :class="getScoreClass(row.avgScore, row.fullScore)">
              {{ row.avgScore?.toFixed(1) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="highestScore" label="最高分" width="80">
          <template #default="{ row }">
            <span class="highest">{{ row.highestScore || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="passRate" label="及格率" width="90">
          <template #default="{ row }">
            <el-progress :percentage="row.passRate" :stroke-width="6" :show-text="false"
              style="width: 60px; display: inline-block" />
            <span style="margin-left: 8px">{{ row.passRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="enterScores(row)">
              <i class="fas fa-edit"></i> 录入成绩
            </el-button>
            <el-dropdown @click.stop @command="(cmd) => handleExamCommand(cmd, row)">
              <el-button link size="small">
                更多 <i class="fas fa-chevron-down"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑考试</el-dropdown-item>
                  <el-dropdown-item command="viewScores">查看成绩单</el-dropdown-item>
                  <el-dropdown-item command="viewExamAnalysis">查看考试详情</el-dropdown-item>
                  <el-dropdown-item command="export">导出成绩</el-dropdown-item>
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
          :page-sizes="[10, 20, 50]" :total="pagination.total" layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange" @current-change="handlePageChange" />
      </div>
    </div>

    <!-- 创建/编辑考试弹窗 -->
    <el-dialog v-model="examDialogVisible" :title="dialogTitle" width="600px" @close="resetExamForm"
      body-class="form-dialog">
      <el-form ref="examFormRef" :model="examForm" :rules="examRules" label-width="100px">
        <el-form-item label="考试名称" prop="name">
          <el-input v-model="examForm.name" placeholder="请输入考试名称" />
        </el-form-item>
        <el-form-item label="考试类型" prop="type">
          <el-select v-model="examForm.type" placeholder="请选择考试类型" style="width: 100%">
            <el-option label="期中考试" value="MIDTERM" />
            <el-option label="期末考试" value="FINAL" />
            <el-option label="月考" value="MONTHLY" />
            <el-option label="模拟考" value="MOCK" />
            <el-option label="单元测试" value="UNIT" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属班级" prop="classId">
          <el-select v-model="examForm.classId" placeholder="请选择班级" style="width: 100%">
            <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程" prop="classId">
          <el-select v-model="examForm.courseId" placeholder="请选择课程" style="width: 100%">
            <el-option v-for="cls in courseList" :key="cls.id" :label="cls.name" :value="cls.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试日期" prop="examDate">
          <el-date-picker v-model="examForm.examDate" type="datetime" placeholder="选择考试时间" format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="满分" prop="fullScore">
          <el-input-number v-model="examForm.fullScore" :min="0" :max="750" :step="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="及格线" prop="passScore">
          <el-input-number v-model="examForm.passScore" :min="0" :max="examForm.fullScore" :step="10"
            style="width: 100%" />
        </el-form-item>
        <el-form-item label="考试说明" prop="description">
          <el-input v-model="examForm.description" type="textarea" :rows="3" placeholder="请输入考试说明（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="examDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitExam">保存</el-button>
      </template>
    </el-dialog>

    <!-- 成绩录入弹窗 -->
    <el-dialog v-model="scoreEntryVisible" :title="`成绩录入 - ${currentExam?.name}`" width="80%"
      :close-on-click-modal="false" @close="resetScoreForm" :style="{ marginTop: '10px' }">
      <div class="score-entry-container">
        <!-- 考试信息 -->
        <div class="exam-info-bar">
          <info-item label="班级：" :value="currentExam?.className" />
          <info-item label="考试日期：" :value="formatExamDate(currentExam?.examDate)" />
          <info-item label="满分：" :value="currentExam?.fullScore" />
          <info-item label="已录入：" :value="`${enteredCount}/${currentExam?.totalStudents}`" />
          <div class="info-actions">
            <el-button size="small" @click="importScores">
              <i class="fas fa-upload"></i> 批量导入
            </el-button>
            <el-button size="small" @click="exportScoreTemplate">
              <i class="fas fa-download"></i> 下载模板
            </el-button>
          </div>
        </div>

        <el-table :data="scoreList" stripe border height="500px" style="width: 100%">
          <el-table-column prop="studentNo" label="学号" width="120" />
          <el-table-column prop="studentName" label="姓名" width="100" />
          <el-table-column prop="score" label="成绩" width="150">
            <template #default="{ row, $index }">
              <el-input-number v-model="row.score" :min="0" :max="currentExam?.fullScore" :precision="0.5"
                :controls="false" placeholder="请输入成绩" style="width: 100%" @change="onScoreChange(row, $index)" />
            </template>
          </el-table-column>
          <el-table-column prop="rank" label="班级排名" width="100">
            <template #default="{ row }">
              {{ row.rank || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="getScoreStatusType(row.score, currentExam?.passScore)" size="small">
                {{ getScoreStatus(row.score, currentExam?.passScore) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150">
            <template #default="{ row }">
              <el-input v-model="row.remark" placeholder="备注（可选）" size="small" />
            </template>
          </el-table-column>
        </el-table>

        <!-- 录入进度 -->
        <div class="entry-progress">
          <div class="progress-info">
            <span>录入进度</span>
            <span>{{ enteredCount }}/{{ currentExam?.totalStudents }}</span>
          </div>
          <el-progress :percentage="(enteredCount / currentExam?.totalStudents) * 100" :stroke-width="10"
            :color="entryProgressColor" />
        </div>
      </div>
      <template #footer>
        <el-button @click="scoreEntryVisible = false">暂存后关闭</el-button>
        <el-button type="primary" @click="saveScores" :loading="saving">
          <i class="fas fa-save"></i> 保存所有成绩
        </el-button>
        <el-button type="success" @click="completeScoreEntry">
          <i class="fas fa-check-circle"></i> 完成录入并发布
        </el-button>
      </template>
    </el-dialog>

    <!-- 成绩查看弹窗 -->
    <el-dialog v-model="viewScoresDialogVisible" :title="`成绩查看 - ${scoreMoreData?.name}`" width="80%"
      :style="{ marginTop: '20px' }">
      <div class="score-entry-container">
        <div class="exam-info-bar">
          <info-item label="班级：" :value="scoreMoreData?.className" />
          <info-item label="考试日期：" :value="formatExamDate(scoreMoreData?.examDate)" />
          <info-item label="满分：" :value="scoreMoreData?.fullScore" />
          <info-item label="学生人数：" :value="`${scoreMoreData?.studentCount}`" />
        </div>
        <el-row :gutter="20" :style="{ marginBottom: '20px' }">
          <el-col :span="6">
            <stats-card type="total" icon="fa-users" title="平均分" :value="scoreMoreData?.statistics.avgScore" />
          </el-col>
          <el-col :span="6">
            <StatsCard type="active" icon="fa-user-check" title="最高分" :value="scoreMoreData?.statistics.highestScore" />
          </el-col>
          <el-col :span="6">
            <StatsCard type="frozen" icon="fa-user-lock" title="最低分" :value="scoreMoreData?.statistics.lowestScore" />
          </el-col>
          <el-col :span="6">
            <StatsCard type="pending" icon="fa-user-clock" title="及格人数" :value="scoreMoreData?.statistics.passCount" />
          </el-col>
        </el-row>
        <el-input v-model="scoreListSearch" placeholder="搜索学生..." prefix-icon="Search" clearable style="width: 200px"
          @clear="loadExamScoreData" @keyup.enter="loadExamScoreData" />
        <!-- 成绩查看表格 -->
        <el-table :data="scoreList" stripe border height="500px" style="width: 100%">
          <el-table-column prop="classRank" label="排名" width="120" sortable />
          <el-table-column prop="studentNo" label="学号" width="120" />
          <el-table-column prop="studentName" label="姓名" width="100" />
          <el-table-column prop="score" label="成绩" width="100" />
          <el-table-column prop="remark" label="备注" min-width="150">
          </el-table-column>
          <el-table-column prop="scoreTrend" label="趋势" min-width="150">
            <template #default="{ row }">{{ row?.scoreTrend === 'UP' ? "上升" : row?.scoreTrend === 'STABLE' ? "平稳" : "下降"
            }}</template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination v-model:current-page="scoreListPage.page" v-model:page-size="scoreListPage.pageSize"
            :page-sizes="[10, 20, 50]" :total="scoreListPage.total" layout="total, sizes, prev, pager, next"
            @size-change="handleScoreSizeChange" @current-change="handleScorePageChange" />
        </div>
      </div>
      <template #footer>
        <el-button @click="viewScoresDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 考试详情图 -->
    <el-drawer v-model="drawerVisible"
      :title="`班级成绩分析：${analysisDetailData?.courseName || ''} - ${analysisDetailData?.name || ''}`" direction="rtl"
      size="1300px" destroy-on-close :close-on-click-modal="true" :close-on-press-escape="true" v-loading="loading">
      <div class="knowledge-detail" v-if="analysisDetailData?.id">
        <!-- 掌握度卡片 -->
        <div class="mastery-card" :class="masteryClass">
          <div class="mastery-rate">
            <h3>优秀率</h3>
            <el-progress type="circle" :percentage="analysisDetailData?.stats?.excellentRate"
              :color="progressColor(analysisDetailData?.stats?.excellentRate)" :width="120" :stroke-width="12" />
          </div>
          <div class="mastery-rate">
            <h3>及格率</h3>
            <el-progress type="circle" :percentage="analysisDetailData?.stats?.passRate"
              :color="progressColor(analysisDetailData?.stats?.passRate)" :width="120" :stroke-width="12" />
          </div>
          <div class="mastery-info">
            <h3>学生人数</h3>
            <p class="rate">{{ analysisDetailData?.stats?.totalStudents }}人</p>
          </div>
        </div>

        <el-descriptions :column="2" border style="margin-top: 20px;">
          <el-descriptions-item label="类型">{{ analysisDetailData?.typeText }}</el-descriptions-item>
          <el-descriptions-item label="考试时间">{{ formatExamDate(analysisDetailData?.examDate) }}</el-descriptions-item>
          <el-descriptions-item label="分数">
            <div>
              <h4 style="display: flex;align-items: center; height: 20px;">班级平均分：<p>{{ analysisDetailData?.classAvgScore
                ||
                '-' }}</p>
              </h4>
              <h4 style="display: flex;align-items: center; height: 20px;">最高分:<p>{{ analysisDetailData?.highestScore ||
                '-'
                  }}</p>
              </h4>
              <h4 style="display: flex;align-items: center; height: 20px;">最低分:<p>{{ analysisDetailData?.lowestScore ||
                '-'
                  }}</p>
              </h4>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="描述">{{ analysisDetailData?.description || '无' }}</el-descriptions-item>
        </el-descriptions>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <div class="chart-card">
              <h4>成绩分布直方图</h4>
              <div id="scoreHistogramChart" style="height: 320px"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-card">
              <h4>成绩仪表盘</h4>
              <div id="scorePieChart" style="height: 320px"></div>
            </div>
          </el-col>
        </el-row>

        <el-row style="margin-top: 20px;" v-if="analysisDetailData.value?.knowledgePointAnalysis?.length > 0">
          <el-col :span="24">
            <div class="chart-card">
              <h4>知识点掌握雷达图</h4>
              <div id="scoreRangeBarChart" style="height: 280px"></div>
            </div>
          </el-col>
        </el-row>
      </div>
      <!-- 无数据状态 -->
      <div v-else class="empty-state">
        <i class="fas fa-database"></i>
        <p>暂无数据</p>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.exam-manage-container {
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
    }
  }

  .exam-table-container {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .exam-name {
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        font-size: 18px;
      }

      span {
        font-weight: 500;
      }
    }


    .score-excellent {
      color: #67c23a;
      font-weight: bold;
    }

    .score-good {
      color: #409eff;
    }

    .score-pass {
      color: #e6a23c;
    }

    .score-fail {
      color: #f56c6c;
    }

    .highest {
      color: #f56c6c;
      font-weight: bold;
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .score-entry-container {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .exam-info-bar {
      background: #f8fafc;
      border-radius: 12px;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;

      .info-actions {
        margin-left: auto;
        display: flex;
        gap: 8px;
      }
    }

    .entry-progress {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #ecf1f6;

      .progress-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 0.85rem;
        color: #5f6b7a;
      }
    }
  }

  .analysis-container {
    max-height: 80vh;
    overflow-y: auto;
    padding: 0 8px;

    .analysis-header {
      margin-bottom: 24px;

      .title-section {
        h2 {
          margin: 0 0 4px 0;
          font-size: 1.5rem;
          color: #1e293b;

        }

        p {
          margin: 0;
          color: #5f6b7a;
        }
      }

      .stats-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 16px;
        margin-top: 20px;
      }
    }

    .chart-card {
      background: white;
      border: 1px solid #ecf1f6;
      border-radius: 12px;
      padding: 16px;

      h4 {
        margin: 0 0 12px 0;
        font-size: 1rem;
        font-weight: 600;
        color: #1e293b;
      }

      .improve-up {
        color: #67c23a;
      }

      .improve-down {
        color: #f56c6c;
      }

      .improve-stable {
        color: #909399;
      }

      .grade-bars {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .grade-item {
          display: flex;
          align-items: center;
          gap: 12px;

          .grade-name {
            width: 80px;
            font-size: 0.85rem;
            font-weight: 500;
          }

          .grade-bar-container {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 8px;

            .grade-bar {
              height: 24px;
              border-radius: 12px;
              transition: width 0.3s ease;
            }

            .grade-count {
              font-size: 0.85rem;
              color: #5f6b7a;
              min-width: 50px;
            }
          }

          .grade-percent {
            width: 50px;
            font-size: 0.85rem;
            font-weight: 500;
            text-align: right;
          }
        }
      }
    }
  }

  .compare-container {
    padding: 0 8px;

    .compare-filters {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ecf1f6;
    }

    .compare-stats {
      margin-top: 20px;
      padding: 0 16px;
    }
  }

  :deep(.form-dialog) {
    padding: 20px 15px 20px 0;
  }

  .knowledge-detail {
    padding: 0 20px;

    h4 {
      font-size: 16px;
      margin: 20px 0 15px;
      color: #1f2937;

      i {
        margin-right: 8px;
        color: #409EFF;
      }
    }

    .mastery-card {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 30px 20px;
      border-radius: 16px;
      background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);

      &.good {
        background: linear-gradient(135deg, #e8f5e9 0%, #fff 100%);
      }

      &.warning {
        background: linear-gradient(135deg, #fff3e0 0%, #fff 100%);
      }

      &.poor {
        background: linear-gradient(135deg, #ffebee 0%, #fff 100%);
      }

      .mastery-info {
        text-align: center;

        h3 {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 10px;
        }

        .rate {
          font-size: 32px;
          font-weight: 700;
          margin: 10px 0;
        }
      }
    }

    .weak-points {
      ul {
        list-style: none;
        padding: 0;

        li {
          padding: 12px;
          background: #fef3c7;
          border-radius: 8px;
          margin-bottom: 10px;

          i {
            margin-right: 10px;
            color: #f59e0b;
          }
        }
      }
    }

    .suggestion-content {
      p {
        padding: 10px 12px;
        background: #f0f9ff;
        border-radius: 8px;
        margin-bottom: 10px;
        border-left: 3px solid #409EFF;
      }
    }

    .related-resources {
      .resource-list {
        .resource-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transform: translateX(4px);
          }

          .resource-icon {
            width: 40px;
            height: 40px;
            background: #409EFF10;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;

            i {
              font-size: 20px;
              color: #409EFF;
            }
          }

          .resource-info {
            flex: 1;

            .resource-title {
              font-weight: 500;
              margin-bottom: 4px;
            }

            .resource-meta {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              font-size: 12px;
              color: #6b7280;
            }
          }
        }
      }
    }

    .learning-trend {
      margin-bottom: 20px;
    }
  }
}







/* 响应式 */
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

  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
  }

  .exam-info-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-actions {
    margin-left: 0;
  }
}
</style>