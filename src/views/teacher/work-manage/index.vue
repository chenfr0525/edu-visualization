<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import StatsCard from '../user-manage/component/stats-card.vue'
import { exportToPDF } from '@/utils/export'
import { tHomeworkApi,tDashboardApi } from '@/api/index.js'
import { useAuthStore } from '@/stores/index.js'

const authStore = useAuthStore()
const loading = ref(false)
const activeGradeTab = ref('pending')
const analysisRef = ref(null)

// 筛选条件
const searchModel = ref({
  classId: '',
  status: '',
  keyword: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 6,
  total: 0
})

// 列表数据
const homeworkList = ref([])
const classList = ref([])

// 统计数据
const statistics = reactive({
  total: 0,
  ongoing: 0,
  pending: 0,
  completed: 0,
  avgScore: 0
})

// 弹窗控制
const gradeDrawerVisible = ref(false)
const gradeFormVisible = ref(false)
const analysisDialogVisible = ref(false)


// 批改相关
const currentHomework = ref(null)
const currentSubmission = ref(null)
const submissionsList = ref([])
const gradedCount = computed(() => {
  return submissionsList.value.filter(s => s.status === 'graded').length
})
const pendingSubmissions = computed(() => {
  return submissionsList.value.filter(s => s.status === 'pending')
})
const gradedSubmissions = computed(() => {
  return submissionsList.value.filter(s => s.status === 'graded')
})

// 分析数据
const analysisData = ref(null)
let scoreChart = null
let accuracyChart = null

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

const fetchHomeworkList = async () => {
  loading.value = true
  try {
    const res = await tHomeworkApi.getHomeworkList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      classId: searchModel.value.classId,
      status: searchModel.value.status,
      keyword: searchModel.value.keyword
    })
    if (res && res.data) {
      homeworkList.value = res.data.list || []
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取作业列表失败:', error)
    ElMessage.error('获取作业列表失败')
  } finally {
    loading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    const res = await tHomeworkApi.getHomeworkStatistics()
    if (res && res.data) {
      Object.assign(statistics, res.data)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 删除作业
const deleteHomework = async (homework) => {
  ElMessageBox.confirm(`确认删除作业 "${homework.title}" 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await tHomeworkApi.deleteHomework(homework.id)
    if (res && res.code === 200) {
      ElMessage.success('删除成功')
      await fetchHomeworkList()
      await fetchStatistics()
    }
  }).catch(() => {})
}

// 获取作业提交列表
const fetchSubmissions = async (homeworkId) => {
  const res = await tHomeworkApi.getHomeworkSubmissions(homeworkId)
  if (res && res.data) {
    return { list: res.data.list || [] }
  }
  return { list: [] }
}

// 提交批改
const submitGradeApi = async (submissionId, answers, totalScore) => {
  const res = await tHomeworkApi.submitGrade(submissionId, { answers, totalScore })
  if (res && res.code === 200) {
    ElMessage.success('批改成功')
    return true
  }
  return false
}

const fetchHomeworkAnalysis = async (homeworkId) => {
  const res = await tHomeworkApi.getHomeworkAnalysis(homeworkId)
  if (res && res.data) {
    return res.data
  }
  return null
}

const getStatusType = (status) => {
  const map = {
    ongoing: 'primary',
    pending: 'warning',
    completed: 'success',
    expired: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    ongoing: '进行中',
    pending: '待批改',
    completed: '已批改',
    expired: '已过期'
  }
  return map[status] || status
}

const calculateTotalScore = () => {
  if (!currentSubmission.value) return 0
  return currentSubmission.value.answers.reduce((sum, q) => sum + (q.givenScore || 0), 0)
}

const totalScore = computed(() => {
  if (!currentSubmission.value) return 0
  return currentSubmission.value.answers.reduce((sum, q) => sum + q.score, 0)
})

const handleSearch = () => {
  pagination.page = 1
  fetchHomeworkList()
}

const handleFilterChange = () => {
  pagination.page = 1
  fetchHomeworkList()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchHomeworkList()
}

const handlePageChange = (page) => {
  pagination.page = page
  fetchHomeworkList()
}

const goToGrade = async (homework) => {
  currentHomework.value = homework
  const res = await fetchSubmissions(homework.id)
  submissionsList.value = res.list
  gradeDrawerVisible.value = true
}

const openGradeForm = (submission) => {
  currentSubmission.value = { ...submission }
  gradeFormVisible.value = true
}

const reGrade = (submission) => {
  openGradeForm(submission)
}

const submitGrade = async () => {
  const total = calculateTotalScore()
  const success = await submitGradeApi(
    currentSubmission.value.id,
    currentSubmission.value.answers,
    total
  )
  if (success) {
    gradeFormVisible.value = false
    // 刷新提交列表
    const res = await fetchSubmissions(currentHomework.value.id)
    submissionsList.value = res.list
  }
}

const viewAnalysis = async (homework) => {
  const data = await fetchHomeworkAnalysis(homework.id)
  analysisData.value = data
  analysisDialogVisible.value = true
  setTimeout(() => {
    initAnalysisCharts()
  }, 100)
}

const initAnalysisCharts = () => {
  if (!analysisData.value) return
  
  // 成绩分布图
  const scoreChartDom = document.getElementById('scoreDistributionChart')
  if (scoreChartDom && analysisData.value.scoreDistribution?.length) {
    if (scoreChart) scoreChart.dispose()
    scoreChart = echarts.init(scoreChartDom)
    scoreChart.setOption({
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

   const accuracyChartDom = document.getElementById('questionAccuracyChart')
  if (accuracyChartDom && analysisData.value.questionAccuracy?.length) {
    if (accuracyChart) accuracyChart.dispose()
    accuracyChart = echarts.init(accuracyChartDom)
    accuracyChart.setOption({
      tooltip: { trigger: 'axis', formatter: '{b}<br/>正确率: {c}%' },
      grid: { left: '10%', containLabel: true },
      xAxis: { type: 'category', data: analysisData.value.questionAccuracy.map(q => `第${q.index}题`) },
      yAxis: { type: 'value', name: '正确率(%)', max: 100 },
      series: [{
        type: 'bar',
        data: analysisData.value.questionAccuracy.map(q => q.accuracy),
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: (params) => {
            const value = params.data
            if (value >= 80) return '#67c23a'
            if (value >= 60) return '#409eff'
            return '#e6a23c'
          }
        },
        label: { show: true, position: 'top', formatter: '{c}%' }
      }]
    })
  }
}

const exportAnalysisReport = () => {
  if (analysisRef.value) {
    exportToPDF(analysisRef.value, '作业分析报告')
  }
}


onMounted(async () => {
  await fetchClassList()
  await fetchStatistics()
  await fetchHomeworkList()
})
</script>

<template>
  <div class="work-manage-container">
    <div class="action-bar">
      <div class="action-left">
        <el-select size="large" v-model="searchModel.classId" placeholder="选择班级" style="width: 140px"
          @change="handleFilterChange">
          <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
        </el-select>
        <el-select size="large" v-model="searchModel.status" placeholder="作业状态" clearable style="width: 120px"
          @change="handleFilterChange">
          <el-option label="进行中" value="ongoing" />
          <el-option label="待批改" value="pending" />
          <el-option label="已批改" value="completed" />
          <el-option label="已过期" value="expired" />
        </el-select>
        <el-input v-model="searchModel.keyword" placeholder="搜索作业名称" prefix-icon="Search" clearable style="width: 220px"
          @clear="handleSearch" @keyup.enter="handleSearch" />
      </div>
      <div class="action-right">
        <el-button type="primary" @click="handleSearch">
          <i class="fas fa-search"></i> 搜索
        </el-button>
      </div>
    </div>

    <el-row :gutter="10"
      :style="{ marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }">
      <el-col :span="4.8">
        <stats-card type="total" icon="fa-book-open" title="作业总数" :value="statistics.total" />
      </el-col>
      <el-col :span="4.8">
        <stats-card type="active" icon="fa-spinner" title="进行中" :value="statistics.ongoing" />
      </el-col>
      <el-col :span="4.8">
        <stats-card type="pending" icon="fa-clock" title="待批改" :value="statistics.pending" />
      </el-col>
      <el-col :span="4.8">
        <stats-card type="completed" icon="fa-check-circle" title="已批改" :value="statistics.completed" />
      </el-col>
      <el-col :span="4.8">
        <stats-card type="avg-score" icon="fa-chart-line" title="班级平均分" :value="statistics.avgScore" />
      </el-col>
    </el-row>

    <div class="table-container">
      <el-table :data="homeworkList" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="title" label="作业名称" width="200" />
        <el-table-column prop="className" label="班级" width="100" />
        <el-table-column prop="questionCount" label="题目数量" width="80" />
        <el-table-column prop="submittedCount" label="提交量" width="120">
          <template #default="{ row }">
            <div class="info-row">
              <span><i class="fas fa-user-check"></i> {{ row.submittedCount }}/{{ row.totalCount }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gradedCount" label="批改" min-width="100">
          <template #default="{ row }">
            <div class="info-row">
              <span><i class="fas fa-check-double"></i> {{ row.gradedCount }}/{{ row.submittedCount
              }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="avgScore" label="平均分" min-width="70">
          <template #default="{ row }">
            {{ row?.avgScore ? `${row.avgScore}分` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止时间" width="180" sortable>
          <template #default="{ row }">
            {{ row.deadline }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewAnalysis(row)">
              <i class="fas fa-eye"></i> 查看详情
            </el-button>
            <el-button link type="primary" size="small" @click="goToGrade(row)">
              <i class="fas fa-edit"></i> 批改作业
            </el-button>
            <el-button link type="primary" size="small" @click="deleteHomework(row)">
              <i class="fas fa-trash"></i> 删除
            </el-button>
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

    <!-- 批改作业弹窗 -->
    <el-drawer v-model="gradeDrawerVisible" title="批改作业" direction="rtl" size="45%" :close-on-click-modal="false">
      <div class="grade-container" v-if="currentHomework">
        <div class="grade-header">
          <h3>{{ currentHomework.title }}</h3>
          <div class="grade-stats">
            <span>班级: {{ currentHomework.className }}</span>
            <span>已提交: {{ currentHomework.submittedCount }}/{{ currentHomework.totalCount }}</span>
            <span>已批改: {{ gradedCount }}/{{ currentHomework.submittedCount }}</span>
          </div>
        </div>

        <el-tabs v-model="activeGradeTab">
          <el-tab-pane label="待批改列表" name="pending">
            <el-table :data="pendingSubmissions" stripe @row-click="openGradeForm" style="width: 100%">
              <el-table-column prop="studentName" label="姓名" width="100" />
              <el-table-column prop="studentNo" label="学号" width="120" />
              <el-table-column prop="submitTime" label="提交时间" width="160" />
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button link type="primary" @click.stop="openGradeForm(row)">
                    批改
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="已批改列表" name="graded">
            <el-table :data="gradedSubmissions" stripe style="width: 100%">
              <el-table-column prop="studentName" label="姓名" width="100" />
              <el-table-column prop="studentNo" label="学号" width="120" />
              <el-table-column prop="score" label="得分" width="80" sortable />
              <el-table-column prop="totalScore" label="满分" width="80" />
              <el-table-column prop="gradeTime" label="批改时间" width="160" />
              <el-table-column label="操作">
                <template #default="{ row }">
                  <el-button link type="primary" @click="reGrade(row)">
                    重新批改
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>

    <!-- 批改表单弹窗 -->
    <el-dialog v-model="gradeFormVisible" :title="`批改 - ${currentSubmission?.studentName}`" width="700px">
      <div class="grade-form" v-if="currentSubmission">
        <div class="submission-info">
          <p><strong>提交时间：</strong> {{ currentSubmission.submitTime }}</p>
          <p><strong>作业内容：</strong></p>
          <div class="submission-content">
            {{ currentSubmission.content }}
          </div>
        </div>

        <div class="questions-grading">
          <div v-for="(question, idx) in currentSubmission.answers" :key="idx" class="question-grade-item">
            <div class="question-title">
              <span>题目 {{ idx + 1 }}: {{ question.title }}</span>
              <span class="question-score">满分: {{ question.score }}分</span>
            </div>
            <div class="student-answer">
              <strong>学生答案：</strong>
              <div class="answer-content">{{ question.studentAnswer || '未作答' }}</div>
            </div>
            <div class="reference-answer">
              <strong>参考答案：</strong>
              <div class="answer-content">{{ question.referenceAnswer }}</div>
            </div>
            <div class="grade-input">
              <span>得分：</span>
              <el-input-number v-model="question.givenScore" :min="0" :max="question.score" :precision="1"
                style="width: 120px" />
              <span> / {{ question.score }}分</span>
              <el-input v-model="question.comment" placeholder="批注（可选）" style="width: 300px; margin-left: 16px" />
            </div>
          </div>
        </div>

        <div class="total-score">
          <span>总分：</span>
          <span class="score-value">{{ calculateTotalScore() }}</span>
          <span> / {{ totalScore }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="gradeFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitGrade">提交批改</el-button>
      </template>
    </el-dialog>

    <!-- 作业分析弹窗 -->
    <el-dialog v-model="analysisDialogVisible" title="作业分析报告" width="800px" :close-on-click-modal="false">
      <div v-if="analysisData" class="analysis-content" ref="analysisRef">
        <!-- 概览卡片 -->
        <div class="analysis-stats">
          <div class="stat-item">
            <div class="stat-value">{{ analysisData.avgScore }}分</div>
            <div class="stat-label">平均分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ analysisData.highestScore }}分</div>
            <div class="stat-label">最高分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ analysisData.lowestScore }}分</div>
            <div class="stat-label">最低分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ analysisData.passRate }}%</div>
            <div class="stat-label">及格率</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ analysisData.submitRate }}%</div>
            <div class="stat-label">提交率</div>
          </div>
        </div>

        <!-- 成绩分布图 -->
        <div class="analysis-chart">
          <h4>成绩分布</h4>
          <div id="scoreDistributionChart" style="height: 280px"></div>
        </div>

        <!-- 各题正确率 -->
        <div class="analysis-chart">
          <h4>各题正确率分析</h4>
          <div id="questionAccuracyChart" style="height: 300px"></div>
        </div>

        <!-- 错题排行 -->
        <div class="analysis-table">
          <h4>高频错题排行</h4>
          <el-table :data="analysisData.wrongQuestions" stripe>
            <el-table-column prop="index" label="题号" width="80" />
            <el-table-column prop="title" label="题目内容" min-width="200" show-overflow-tooltip />
            <el-table-column prop="errorRate" label="错误率" width="100">
              <template #default="{ row }">
                <el-progress :percentage="row.errorRate" :stroke-width="6" />
              </template>
            </el-table-column>
            <el-table-column prop="wrongCount" label="错误人数" width="100" />
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="analysisDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="exportAnalysisReport(analysisData)">
          <i class="fas fa-file-pdf"></i> 导出报告
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.work-manage-container {
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

  .table-container {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .info-row {
      font-size: 0.85rem;
      color: #5f6b7a;

      i {
        width: 20px;
        margin-right: 4px;
        color: #8b9bb0;
      }
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

/* 发布作业 - 题目编辑器 */
.questions-editor {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  background: #fafbfc;
}

.question-item {
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.question-index {
  font-weight: 600;
  color: #1d4e7c;
}

.question-extra {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  align-items: center;
}

/* 批改作业抽屉 */
.grade-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.grade-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.grade-header h3 {
  margin: 0 0 12px 0;
  font-size: 1.2rem;
}

.grade-stats {
  display: flex;
  gap: 24px;
  font-size: 0.9rem;
  color: #5f6b7a;
}

/* 批改表单 */
.grade-form {
  max-height: 60vh;
  overflow-y: auto;
}

.submission-info {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.submission-content {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  border: 1px solid #e2e8f0;
}

.questions-grading {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.question-grade-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
}

.question-title {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 12px;
}

.question-score {
  color: #e6a23c;
}

.student-answer,
.reference-answer {
  margin-bottom: 12px;
}

.answer-content {
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px;
  margin-top: 4px;
  font-family: monospace;
}

.grade-input {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.total-score {
  text-align: right;
  font-size: 1.2rem;
  font-weight: 600;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.total-score .score-value {
  font-size: 1.5rem;
  color: #1d4e7c;
}

/* 分析弹窗 */
.analysis-content {
  max-height: 70vh;
  overflow-y: auto;
}

.analysis-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.analysis-stats .stat-item {
  text-align: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.analysis-stats .stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1d4e7c;
}

.analysis-chart {
  margin-bottom: 24px;
}

.analysis-chart h4,
.analysis-table h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1e293b;
}

/* 响应式 */
@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .action-left,
  .action-right {
    justify-content: stretch;
  }

  .action-left .el-input,
  .action-left .el-select {
    width: 100% !important;
  }

  .homework-grid {
    grid-template-columns: 1fr;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>