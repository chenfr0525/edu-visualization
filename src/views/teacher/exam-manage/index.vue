<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import InfoItem from './component/info-item.vue'
import { exportToPDF } from '@/utils/export'
import StatCard from './component/stat-card.vue'
import { tExamApi, tDashboardApi } from '@/api/index.js'
import { useAuthStore } from '@/stores/index.js'

const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)
const analysisContentRef = ref(null)

// 筛选条件
const searchModel = ref({
  classId: '',
  examType: '',
  keyword: ''
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

const examDialogVisible = ref(false)
const scoreEntryVisible = ref(false)
const analysisDialogVisible = ref(false)
const compareDialogVisible = ref(false)
const viewScoresDialogVisible = ref(false)

const examFormRef = ref(null)
const examForm = reactive({
  id: null,
  name: '',
  type: '',
  classId: '',
  examDate: '',
  fullScore: 100,
  passScore: 60,
  description: ''
})

const dialogTitle = computed(() => examForm.id ? '编辑考试' : '创建考试')

const examRules = {
  name: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择考试类型', trigger: 'change' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  examDate: [{ required: true, message: '请选择考试日期', trigger: 'change' }],
  fullScore: [{ required: true, message: '请输入满分', trigger: 'blur' }]
}

const currentExam = ref(null)
const scoreList = ref([])
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

const analysisData = ref(null)

const compareExamId = ref(null)
const compareClassIds = ref([])
const compareData = ref([])

// 图表实例
let histogramChart = null
let pieChart = null
let rangeBarChart = null
let compareChart = null

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

const fetchExamList = async () => {
  loading.value = true
  try {
    const res = await tExamApi.getExamLists({
      page: pagination.page,
      pageSize: pagination.pageSize,
      classId: searchModel.value.classId,
      type: searchModel.value.examType,
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

const fetchCompareData = async (examId, classIds) => {
  const res = await tExamApi.getExamCompare(examId, classIds)
  if (res && res.data) {
    return res.data
  }
  return []
}

const getExamTypeTag = (type) => {
  const map = { midterm: 'primary', final: 'danger', monthly: 'warning', mock: 'info', unit: 'success' }
  return map[type] || 'info'
}

const getExamTypeText = (type) => {
  const map = { midterm: '期中', final: '期末', monthly: '月考', mock: '模拟考', unit: '单元测试' }
  return map[type] || type
}

const getExamTypeColor = (type) => {
  const map = { midterm: '#409eff', final: '#f56c6c', monthly: '#e6a23c', mock: '#909399', unit: '#67c23a' }
  return map[type] || '#909399'
}

const getStatusType = (status) => {
  const map = { upcoming: 'info', ongoing: 'warning', completed: 'success' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { upcoming: '待开始', ongoing: '录入中', completed: '已完成' }
  return map[status] || status
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
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchExamList()
}

const handlePageChange = (page) => {
  pagination.page = page
  fetchExamList()
}

const showCreateDialog = () => {
  resetExamForm()
  examDialogVisible.value = true
}

const editExam = (exam) => {
  Object.assign(examForm, {
    id: exam.id,
    name: exam.name,
    type: exam.type,
    classId: exam.classId,
    examDate: exam.examDate,
    fullScore: exam.fullScore || 100,
    passScore: exam.passScore || 60,
    description: exam.description || ''
  })
  examDialogVisible.value = true
}

const resetExamForm = () => {
  Object.assign(examForm, {
    id: null,
    name: '',
    type: '',
    classId: '',
    examDate: '',
    fullScore: 100,
    passScore: 60,
    description: ''
  })
  examFormRef.value?.resetFields()
}

const submitExam = async () => {
  await examFormRef.value?.validate()
  let success
  if (examForm.id) {
    success = await updateExam(examForm)
  } else {
    success = await createExam(examForm)
  }
  if (success) {
    examDialogVisible.value = false
    await fetchExamList()
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
    case 'compare':
      openCompareDialog(exam)
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
        }
      }).catch(() => {})
      break
  }
}

const enterScores = async (exam) => {
  currentExam.value = exam
  const res = await fetchScores(exam.id)
  scoreList.value = res.list
  scoreEntryVisible.value = true
}

const continueScoreEntry = async (exam) => {
  await enterScores(exam)
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
  const res = await fetchScores(exam.id)
  scoreList.value = res.list
  viewScoresDialogVisible.value = true
}

const viewAnalysis = async (exam) => {
  const data = await fetchExamAnalysis(exam.id)
  analysisData.value = data
  analysisDialogVisible.value = true
  setTimeout(() => {
    initAnalysisCharts()
  }, 100)
}

const initAnalysisCharts = () => {
  if (!analysisData.value) return

  // 成绩分布直方图
  const histogramDom = document.getElementById('scoreHistogramChart')
  if (histogramDom && analysisData.value.scoreDistribution?.length) {
    if (histogramChart) histogramChart.dispose()
    histogramChart = echarts.init(histogramDom)
    histogramChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'category', data: analysisData.value.scoreDistribution.map(d => d.range) },
      yAxis: { type: 'value', name: '人数' },
      series: [{
        type: 'bar',
        data: analysisData.value.scoreDistribution.map(d => d.count),
        itemStyle: { borderRadius: [8, 8, 0, 0], color: '#1d4e7c' },
        label: { show: true, position: 'top' }
      }]
    })
  }

  // 分数段占比饼图
  const pieDom = document.getElementById('scorePieChart')
  if (pieDom && analysisData.value.gradeDistribution?.length) {
    if (pieChart) pieChart.dispose()
    pieChart = echarts.init(pieDom)
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        type: 'pie',
        radius: '55%',
        data: analysisData.value.gradeDistribution.map(g => ({
          name: g.name,
          value: g.count,
          itemStyle: { color: g.color }
        })),
        label: { show: true, formatter: '{b}: {d}%' }
      }]
    })
  }

   // 分数段条形图
  const rangeBarDom = document.getElementById('scoreRangeBarChart')
  if (rangeBarDom && analysisData.value.scoreDistribution?.length) {
    if (rangeBarChart) rangeBarChart.dispose()
    rangeBarChart = echarts.init(rangeBarDom)
    rangeBarChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: analysisData.value.scoreDistribution.map(d => d.range) },
      yAxis: { type: 'value', name: '人数' },
      series: [{
        type: 'bar',
        data: analysisData.value.scoreDistribution.map(d => d.count),
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: (params) => {
            const colors = ['#f56c6c', '#e6a23c', '#409eff', '#67c23a', '#67c23a']
            return colors[params.dataIndex] || '#409eff'
          }
        }
      }]
    })
  }
    // 班级对比图
  if (analysisData.value.classCompare?.length) {
    const compareDom = document.getElementById('classCompareChart')
    if (compareDom) {
      if (compareChart) compareChart.dispose()
      compareChart = echarts.init(compareDom)
      compareChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['平均分', '及格率(%)', '优秀率(%)'] },
        xAxis: { type: 'category', data: analysisData.value.classCompare.map(c => c.className) },
        yAxis: { type: 'value', name: '分数/百分比' },
        series: [
          { name: '平均分', type: 'line', data: analysisData.value.classCompare.map(c => c.avgScore), smooth: true },
          { name: '及格率(%)', type: 'bar', data: analysisData.value.classCompare.map(c => c.passRate) },
          { name: '优秀率(%)', type: 'bar', data: analysisData.value.classCompare.map(c => c.excellentRate) }
        ]
      })
    }
  }
}
const openCompareDialog = async (exam) => {
  compareExamId.value = exam.id
  compareClassIds.value = [exam.classId]
  await loadCompareData()
  compareDialogVisible.value = true
}

const loadCompareData = async () => {
  if (!compareExamId.value) return
  const data = await fetchCompareData(compareExamId.value, compareClassIds.value)
  compareData.value = data
  setTimeout(() => {
    initCompareChart()
  }, 100)
}

const initCompareChart = () => {
  const compareDom = document.getElementById('compareChart')
  if (!compareDom) return
  if (compareChart) compareChart.dispose()
  compareChart = echarts.init(compareDom)
  compareChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['平均分', '最高分', '及格率(%)'] },
    xAxis: { type: 'category', data: compareData.value.map(c => c.className) },
    yAxis: { type: 'value', name: '分数/百分比' },
    series: [
      { name: '平均分', type: 'bar', data: compareData.value.map(c => c.avgScore), itemStyle: { color: '#409eff' } },
      { name: '最高分', type: 'bar', data: compareData.value.map(c => c.highestScore), itemStyle: { color: '#e6a23c' } },
      { name: '及格率(%)', type: 'line', data: compareData.value.map(c => c.passRate), smooth: true, lineStyle: { color: '#67c23a' } }
    ]
  })
}

const exportScores = (exam) => {
  window.open(`/api/teacher/exam/${exam.id}/export`, '_blank')
}

const exportExamsData = () => {
  const params = {
    classId: searchModel.value.classId || '',
    type: searchModel.value.examType || '',
    keyword: searchModel.value.keyword || ''
  }
  tExamApi.exportExamsData(params)
}

const exportAnalysisReport = () => {
  if (analysisData.value) {
    exportToPDF(analysisContentRef.value, `${analysisData.value.examName}_成绩分析报告`)
  }
}

const exportScoreSheet = () => {
  if (analysisData.value) {
    window.open(`/api/teacher/exam/${analysisData.value.examId}/score-sheet`, '_blank')
  }
}

onMounted(async () => {
  await fetchClassList()
  await fetchExamList()
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
        <el-select size="large" v-model="searchModel.examType" placeholder="考试类型" clearable style="width: 120px"
          @change="handleFilterChange">
          <el-option label="期中考试" value="midterm" />
          <el-option label="期末考试" value="final" />
          <el-option label="月考" value="monthly" />
          <el-option label="模拟考" value="mock" />
          <el-option label="单元测试" value="unit" />
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
              {{ getExamTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="班级" width="100" />
        <el-table-column prop="examDate" label="考试日期" width="110" sortable />
        <el-table-column prop="totalStudents" label="参考人数" width="90" align="center" />
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
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'upcoming'" link type="primary" size="small" @click.stop="enterScores(row)">
              <i class="fas fa-edit"></i> 录入成绩
            </el-button>
            <el-button v-if="row.status === 'ongoing'" link type="primary" size="small"
              @click.stop="continueScoreEntry(row)">
              <i class="fas fa-pen"></i> 继续录入
            </el-button>
            <el-button v-if="row.status === 'completed'" link type="primary" size="small"
              @click.stop="viewAnalysis(row)">
              <i class="fas fa-chart-line"></i> 成绩分析
            </el-button>
            <el-dropdown @click.stop @command="(cmd) => handleExamCommand(cmd, row)">
              <el-button link size="small">
                更多 <i class="fas fa-chevron-down"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑考试</el-dropdown-item>
                  <el-dropdown-item command="viewScores">查看成绩单</el-dropdown-item>
                  <el-dropdown-item command="compare">班级对比</el-dropdown-item>
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
            <el-option label="期中考试" value="midterm" />
            <el-option label="期末考试" value="final" />
            <el-option label="月考" value="monthly" />
            <el-option label="模拟考" value="mock" />
            <el-option label="单元测试" value="unit" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属班级" prop="classId">
          <el-select v-model="examForm.classId" placeholder="请选择班级" style="width: 100%">
            <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试日期" prop="examDate">
          <el-date-picker v-model="examForm.examDate" type="date" placeholder="选择考试日期" style="width: 100%" />
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
          <info-item label="考试日期：" :value="currentExam?.examDate" />
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
    <el-dialog v-model="viewScoresDialogVisible" :title="`成绩查看 - ${currentExam?.name}`" width="80%"
      :style="{ marginTop: '20px' }">
      <div class="score-entry-container">
        <div class="exam-info-bar">
          <info-item label="班级：" :value="currentExam?.className" />
          <info-item label="考试日期：" :value="currentExam?.examDate" />
          <info-item label="满分：" :value="currentExam?.fullScore" />
          <info-item label="已录入：" :value="`${enteredCount}/${currentExam?.totalStudents}`" />
        </div>
        <!-- 成绩查看表格 -->
        <el-table :data="scoreList" stripe border height="500px" style="width: 100%">
          <el-table-column prop="studentNo" label="学号" width="120" />
          <el-table-column prop="studentName" label="姓名" width="100" />
          <el-table-column prop="score" label="成绩" width="150" />
          <el-table-column prop="rank" label="班级排名" width="100" sortable>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150">
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="viewScoresDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 成绩分析弹窗 -->
    <el-dialog v-model="analysisDialogVisible" title="成绩分析报告" width="900px" :close-on-click-modal="false" fullscreen>
      <div v-if="analysisData" class="analysis-container" ref="analysisContentRef">
        <div class="analysis-header">
          <div class="title-section">
            <h2>{{ analysisData.examName }}</h2>
            <p>{{ analysisData.className }} · {{ analysisData.examDate }}</p>
          </div>
          <div class="stats-cards">
            <stat-card label="平均分" :value="analysisData.avgScore" />
            <stat-card label="最高分" :value="analysisData.highestScore" />
            <stat-card label="最低分" :value="analysisData.lowestScore" />
            <stat-card label="及格率" :rate="analysisData.passRate" />
            <stat-card label="优秀率" :rate="analysisData.excellentRate" />
            <stat-card label="标准差" :rate="analysisData.standardDeviation" />
          </div>
        </div>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <div class="chart-card">
              <h4>成绩分布直方图</h4>
              <div id="scoreHistogramChart" style="height: 320px"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-card">
              <h4>分数段占比饼图</h4>
              <div id="scorePieChart" style="height: 320px"></div>
            </div>
          </el-col>
        </el-row>

        <el-row style="margin-top: 20px;">
          <el-col :span="24">
            <div class="chart-card">
              <h4>分数段人数统计</h4>
              <div id="scoreRangeBarChart" style="height: 280px"></div>
            </div>
          </el-col>
        </el-row>

        <el-row v-if="analysisData.classCompare" style="margin-top: 20px;">
          <el-col :span="24">
            <div class="chart-card">
              <h4>班级成绩对比</h4>
              <div id="classCompareChart" style="height: 320px"></div>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <div class="chart-card">
              <h4>成绩排名 (前10名)</h4>
              <el-table :data="analysisData.topStudents" stripe size="small">
                <el-table-column prop="rank" label="排名" width="50" />
                <el-table-column prop="studentName" label="姓名" width="120" />
                <el-table-column prop="studentNo" label="学号" width="150" />
                <el-table-column prop="score" label="成绩" width="100" sortable />
                <el-table-column prop="improvement" label="进步情况" width="100">
                  <template #default="{ row }">
                    <span v-if="row.improvement > 0" class="improve-up">
                      <i class="fas fa-arrow-up"></i> +{{ row.improvement }}
                    </span>
                    <span v-else-if="row.improvement < 0" class="improve-down">
                      <i class="fas fa-arrow-down"></i> {{ row.improvement }}
                    </span>
                    <span v-else class="improve-stable">持平</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-card">
              <h4>分数段分析</h4>
              <div class="grade-bars">
                <div v-for="grade in analysisData.gradeDistribution" :key="grade.name" class="grade-item">
                  <div class="grade-name">{{ grade.name }}</div>
                  <div class="grade-bar-container">
                    <div class="grade-bar" :style="{ width: grade.percentage + '%', backgroundColor: grade.color }">
                    </div>
                    <span class="grade-count">{{ grade.count }}人</span>
                  </div>
                  <div class="grade-percent">{{ grade.percentage }}%</div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button @click="analysisDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="exportAnalysisReport">
          <i class="fas fa-file-pdf"></i> 导出分析报告
        </el-button>
        <el-button @click="exportScoreSheet">
          <i class="fas fa-file-excel"></i> 导出成绩单
        </el-button>
      </template>
    </el-dialog>

    <!-- 班级对比弹窗 -->
    <el-dialog v-model="compareDialogVisible" title="班级成绩对比" width="800px" :style="{ marginTop: '20px' }">
      <div class="compare-container">
        <div class="compare-filters">
          <el-select v-model="compareExamId" placeholder="选择考试" style="width: 200px" @change="loadCompareData">
            <el-option v-for="exam in examList" :key="exam.id" :label="exam.name" :value="exam.id" />
          </el-select>
          <el-select v-model="compareClassIds" multiple placeholder="选择对比班级" style="width: 300px; margin-left: 12px"
            @change="loadCompareData">
            <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
          </el-select>
        </div>
        <div id="compareChart" style="height: 400px; margin-top: 20px"></div>
        <div class="compare-stats">
          <el-table :data="compareData" stripe size="small">
            <el-table-column prop="className" label="班级" width="120" />
            <el-table-column prop="avgScore" label="平均分" width="100" sortable />
            <el-table-column prop="highestScore" label="最高分" width="100" />
            <el-table-column prop="passRate" label="及格率" width="100">
              <template #default="{ row }">{{ row.passRate }}%</template>
            </el-table-column>
            <el-table-column prop="excellentRate" label="优秀率" width="100">
              <template #default="{ row }">{{ row.excellentRate }}%</template>
            </el-table-column>
            <el-table-column prop="rank" label="年级排名" width="100" />
          </el-table>
        </div>
      </div>
    </el-dialog>
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