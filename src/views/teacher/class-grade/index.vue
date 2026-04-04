<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import OverviewCard from './component/overview-card.vue'
import { exportToPDF } from '@/utils/export'

// ==================== 响应式数据 ====================
const loading = ref(false)
const searchKeyword = ref('')
const sortField = ref('score_desc')
const distributionType = ref('bar')
const showCompare = ref(true)
const totalStudents = ref(0)
const dashboardRef = ref(null)

// 筛选条件
const searchModel = ref({
  classId: '',
  examId: '',
  compareExamId: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 数据列表
const classList = ref([])
const examList = ref([])
const studentScores = ref([])
const filteredStudentScores = ref([])

// 班级统计数据
const gradeStats = reactive({
  avgScore: 0,
  highestScore: 0,
  highestStudent: '',
  lowestScore: 0,
  lowestStudent: '',
  passRate: 0,
  excellentRate: 0,
  standardDeviation: 0,
  passScore: 60,
  scoreTrend: 0
})

// 分数段数据
const scoreRanges = ref([])

// 进步/退步榜
const progressList = ref([])
const declineList = ref([])

// 学生详情
const studentDetailVisible = ref(false)
const currentStudent = ref(null)
const studentTrendData = ref(null)

// 图表实例
let distributionChart = null
let trendChart = null
let studentFullTrendChart = null

// ==================== 辅助函数 ====================
const getRankClass = (index) => {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return ''
}

const getRankBadgeClass = (index) => {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return ''
}

const getScoreClass = (score, passScore) => {
  if (!score) return ''
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= passScore) return 'score-pass'
  return 'score-fail'
}

const getStatusType = (score, passScore) => {
  if (!score) return 'info'
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= passScore) return 'warning'
  return 'danger'
}

const getStatusText = (score, passScore) => {
  if (!score) return '缺考'
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= passScore) return '及格'
  return '不及格'
}

// ==================== API 调用 ====================
// 获取班级列表
const fetchClassList = async () => {
  // GET /api/teacher/classes
  await new Promise(resolve => setTimeout(resolve, 300))
  return [
    { id: 1, name: '高三(1)班', grade: '高三', studentCount: 45 },
    { id: 2, name: '高三(2)班', grade: '高三', studentCount: 42 },
    { id: 3, name: '高三(3)班', grade: '高三', studentCount: 38 },
    { id: 4, name: '高三(4)班', grade: '高三', studentCount: 44 }
  ]
}

// 获取考试列表
const fetchExamList = async (classId) => {
  // GET /api/teacher/exams?classId=
  await new Promise(resolve => setTimeout(resolve, 300))
  return [
    { id: 1, name: '2026届高三一模考试', date: '2026-03-15', type: 'mock' },
    { id: 2, name: '月考（3月）', date: '2026-03-20', type: 'monthly' },
    { id: 3, name: '三角函数单元测试', date: '2026-03-25', type: 'unit' },
    { id: 4, name: '期中考试', date: '2026-04-15', type: 'midterm' }
  ]
}

// 获取班级成绩统计
const fetchGradeStats = async () => {
  // GET /api/teacher/class/{classId}/grade-stats?examId=
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    avgScore: 78.5,
    highestScore: 98,
    highestStudent: '张小明',
    lowestScore: 52,
    lowestStudent: '赵雷',
    passRate: 85,
    excellentRate: 32,
    standardDeviation: 12.3,
    passScore: 60,
    scoreTrend: 3.5
  }
}

// 获取分数段分布
const fetchScoreDistribution = async () => {
  // GET /api/teacher/class/{classId}/score-distribution?examId=
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    ranges: [
      { name: '90-100', min: 90, max: 100, count: 6, percent: 13.3, color: '#67c23a' },
      { name: '80-89', min: 80, max: 89, count: 14, percent: 31.1, color: '#409eff' },
      { name: '70-79', min: 70, max: 79, count: 12, percent: 26.7, color: '#909399' },
      { name: '60-69', min: 60, max: 69, count: 8, percent: 17.8, color: '#e6a23c' },
      { name: '<60', min: 0, max: 59, count: 5, percent: 11.1, color: '#f56c6c' }
    ]
  }
}

// 获取成绩趋势数据
const fetchTrendData = async () => {
  // GET /api/teacher/class/{classId}/grade-trend
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    exams: ['月考1', '月考2', '期中', '月考3', '期末'],
    avgScore: [72, 75, 78, 76, 82],
    highestScore: [95, 96, 98, 97, 99],
    lowestScore: [48, 52, 55, 50, 58],
    compareAvg: [70, 73, 75, 74, 78]
  }
}

// 获取学生成绩列表
const fetchStudentScores = async () => {
  loading.value = true
  try {
    // GET /api/teacher/class/{classId}/scores?examId=&compareExamId=
    await new Promise(resolve => setTimeout(resolve, 500))
    totalStudents.value = 45
    const mockData = [
      { id: 1, studentNo: '2024001', studentName: '张小明', score: 98, previousScore: 92, improvement: 6, rankChange: -3, status: 'active', className: '高三(1)班' },
      { id: 2, studentNo: '2024002', studentName: '李华', score: 85, previousScore: 78, improvement: 7, rankChange: -5, status: 'active', className: '高三(1)班' },
      { id: 3, studentNo: '2024003', studentName: '王芳', score: 92, previousScore: 88, improvement: 4, rankChange: -2, status: 'active', className: '高三(1)班' },
      { id: 4, studentNo: '2024004', studentName: '赵雷', score: 52, previousScore: 58, improvement: -6, rankChange: 8, status: 'active', className: '高三(1)班' },
      { id: 5, studentNo: '2024005', studentName: '陈晨', score: 75, previousScore: 72, improvement: 3, rankChange: -1, status: 'active', className: '高三(1)班' },
      { id: 6, studentNo: '2024006', studentName: '刘洋', score: 88, previousScore: 82, improvement: 6, rankChange: -4, status: 'active', className: '高三(1)班' },
      { id: 7, studentNo: '2024007', studentName: '周婷', score: 62, previousScore: 65, improvement: -3, rankChange: 3, status: 'active', className: '高三(1)班' },
      { id: 8, studentNo: '2024008', studentName: '吴迪', score: 95, previousScore: 90, improvement: 5, rankChange: -3, status: 'active', className: '高三(1)班' }
    ]
    // 添加更多学生数据...
    for (let i = 9; i <= 45; i++) {
      mockData.push({
        id: i,
        studentNo: `20240${i.toString().padStart(2, '0')}`,
        studentName: `学生${i}`,
        score: Math.floor(Math.random() * 50) + 50,
        previousScore: Math.floor(Math.random() * 50) + 50,
        improvement: Math.floor(Math.random() * 20) - 10,
        rankChange: Math.floor(Math.random() * 15) - 7,
        status: 'active',
        className: '高三(1)班'
      })
    }
    studentScores.value = mockData
    pagination.total = mockData.length
    sortStudents()
    return mockData
  } finally {
    loading.value = false
  }
}

// 获取进步/退步榜
const fetchProgressAndDecline = async () => {
  // GET /api/teacher/class/{classId}/progress-rank?examId=&compareExamId=
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    progress: [
      { studentName: '李华', studentNo: '2024002', currentScore: 85, previousScore: 78, improvement: 7, rankChange: -5 },
      { studentName: '张小明', studentNo: '2024001', currentScore: 98, previousScore: 92, improvement: 6, rankChange: -3 },
      { studentName: '刘洋', studentNo: '2024006', currentScore: 88, previousScore: 82, improvement: 6, rankChange: -4 }
    ],
    decline: [
      { studentName: '赵雷', studentNo: '2024004', currentScore: 52, previousScore: 58, decline: 6, rankChange: 8 },
      { studentName: '周婷', studentNo: '2024007', currentScore: 62, previousScore: 65, decline: 3, rankChange: 3 }
    ]
  }
}

// 获取学生成绩趋势
const fetchStudentTrend = async (studentId) => {
  // GET /api/teacher/student/{studentId}/grade-trend
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    exams: ['月考1', '月考2', '期中', '月考3', '期末'],
    scores: [72, 78, 85, 82, 92],
    avgScore: 81.8,
    highestScore: 92,
    lowestScore: 72,
    trend: 20
  }
}

// ==================== 图表初始化 ====================
// 成绩分布图
const initDistributionChart = async () => {
  const data = await fetchScoreDistribution()
  scoreRanges.value = data.ranges

  const chartDom = document.getElementById('distributionChart')
  if (!chartDom) return
  if (distributionChart) distributionChart.dispose()
  distributionChart = echarts.init(chartDom)

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: data.ranges.map(r => r.name) },
    yAxis: { type: 'value', name: '人数' },
    series: [{
      type: distributionType.value,
      data: data.ranges.map(r => r.count),
      itemStyle: {
        borderRadius: distributionType.value === 'bar' ? [8, 8, 0, 0] : 0,
        color: (params) => data.ranges[params.dataIndex].color
      },
      label: { show: true, position: distributionType.value === 'bar' ? 'top' : 'right', formatter: '{c}人' },
      smooth: distributionType.value === 'line'
    }]
  }
  distributionChart.setOption(option)
}


// 趋势图
const initTrendChart = async () => {
  const data = await fetchTrendData()
  const chartDom = document.getElementById('trendChart')
  if (!chartDom) return
  if (trendChart) trendChart.dispose()
  trendChart = echarts.init(chartDom)

  const series = [
    { name: '本班平均分', type: 'line', data: data.avgScore, smooth: true, lineStyle: { color: '#409eff', width: 3 }, symbol: 'circle', symbolSize: 8, areaStyle: { opacity: 0.1 } }
  ]
  if (showCompare.value && data.compareAvg) {
    series.push({
      name: '年级平均分', type: 'line', data: data.compareAvg, smooth: true,
      lineStyle: { color: '#e6a23c', width: 2, type: 'dashed' }, symbol: 'diamond', symbolSize: 6
    })
  }

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: series.map(s => s.name) },
    xAxis: { type: 'category', data: data.exams },
    yAxis: { type: 'value', name: '分数' },
    series
  })
}


// 完整趋势图
const initFullTrendChart = async (studentId) => {
  const data = await fetchStudentTrend(studentId)
  studentTrendData.value = data
  const chartDom = document.getElementById('studentFullTrendChart')
  if (!chartDom) return
  if (studentFullTrendChart) studentFullTrendChart.dispose()
  studentFullTrendChart = echarts.init(chartDom)
  studentFullTrendChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.exams },
    yAxis: { type: 'value', name: '分数' },
    series: [{
      type: 'line', data: data.scores, smooth: true,
      lineStyle: { color: '#409eff', width: 3 },
      areaStyle: { opacity: 0.2 },
      symbol: 'circle', symbolSize: 8,
      label: { show: true, position: 'top', formatter: '{c}' }
    }]
  })
}

// ==================== 事件处理 ====================
const handleFilterChange = async () => {
  pagination.page = 1
  await refreshData()
}

const handleSearch = () => {
  sortStudents()
}

const sortStudents = () => {
  let sorted = [...studentScores.value]
  switch (sortField.value) {
    case 'score_desc':
      sorted.sort((a, b) => b.score - a.score)
      break
    case 'score_asc':
      sorted.sort((a, b) => a.score - b.score)
      break
    case 'studentNo':
      sorted.sort((a, b) => a.studentNo.localeCompare(b.studentNo))
      break
    case 'name':
      sorted.sort((a, b) => a.studentName.localeCompare(b.studentName))
      break
    case 'improvement':
      sorted.sort((a, b) => (b.improvement || 0) - (a.improvement || 0))
      break
  }

  if (searchKeyword.value) {
    sorted = sorted.filter(s =>
      s.studentName.includes(searchKeyword.value) ||
      s.studentNo.includes(searchKeyword.value)
    )
  }

  filteredStudentScores.value = sorted
  pagination.total = sorted.length
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
}

const handlePageChange = (page) => {
  pagination.page = page
}

const updateDistributionChart = () => {
  initDistributionChart()
}

const updateTrendChart = () => {
  initTrendChart()
}

const refreshData = async () => {
  loading.value = true
  try {
    const [stats, progressData] = await Promise.all([
      fetchGradeStats(),
      fetchProgressAndDecline()
    ])
    Object.assign(gradeStats, stats)
    progressList.value = progressData.progress
    declineList.value = progressData.decline

    await Promise.all([
      fetchStudentScores(),
      initDistributionChart(),
      initTrendChart(),
    ])
  } finally {
    loading.value = false
  }
}

const viewStudentDetail = async (student) => {
  currentStudent.value = student
  studentDetailVisible.value = true
  setTimeout(() => {
    initFullTrendChart(student.id)
  }, 100)
}

const exportGradeReport = () => {
  exportToPDF(dashboardRef.value, "班级成绩可视化报告")
}

const exportGradeSheet = () => {
  //设置导出excel文件
  // window.open(`/api/teacher/class/${searchModel.value.classId}/grade-sheet?examId=${searchModel.value.examId}`, '_blank')
}

const exportProgressList = () => {
  //设置导出excel文件
  // window.open(`/api/teacher/class/${searchModel.value.classId}/progress-list`, '_blank')
}

const exportDeclineList = () => {
  //设置导出excel文件
  // window.open(`/api/teacher/class/${searchModel.value.classId}/decline-list`, '_blank')
}

// ==================== 生命周期 ====================
onMounted(async () => {
  const classes = await fetchClassList()
  classList.value = classes
  if (classes.length > 0) {
    searchModel.value.classId = classes[0].id
    const exams = await fetchExamList(searchModel.value.classId)
    examList.value = exams
    if (exams.length > 0) {
      searchModel.value.examId = exams[0].id
    }
    await refreshData()
  }
})

watch(() => searchModel.value.classId, async (newVal) => {
  if (newVal) {
    const exams = await fetchExamList(newVal)
    examList.value = exams
    if (exams.length > 0) {
      searchModel.value.examId = exams[0].id
    }
    await refreshData()
  }
})
</script>

<template>
  <div class="class-grade-container">
    <div class="filter-bar">
      <div class="filter-left">
        <el-select v-model="searchModel.classId" placeholder="请选择班级" style="width: 140px" @change="handleFilterChange">
          <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
        </el-select>
        <el-select v-model="searchModel.examId" placeholder="请选择考试" style="width: 150px" @change="handleFilterChange">
          <el-option v-for="exam in examList" :key="exam.id" :label="exam.name" :value="exam.id" />
        </el-select>
        <el-select v-model="searchModel.compareExamId" placeholder="选择对比考试" clearable style="width: 150px"
          @change="handleFilterChange">
          <el-option v-for="exam in examList" :key="exam.id" :label="exam.name" :value="exam.id" />
        </el-select>
      </div>
      <div class="filter-right">
        <el-button type="primary" @click="refreshData">
          <i class="fas fa-sync-alt"></i> 刷新
        </el-button>
        <el-button @click="exportGradeReport">
          <i class="fas fa-file-pdf"></i> 导出报告
        </el-button>
      </div>
    </div>
    <div ref="dashboardRef">
      <div class="grade-overview">
        <overview-card label="平均分" :value="gradeStats.avgScore" type="primary">
          <template #content>
            <div class="overview-trend" :class="gradeStats.scoreTrend > 0 ? 'up' : 'down'">
              <i :class="gradeStats.scoreTrend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              {{ Math.abs(gradeStats.scoreTrend) }}分
            </div>
          </template>
        </overview-card>
        <overview-card label="最高分" :value="gradeStats.highestScore">
          <template #content>
            <div class="overview-sub">{{ gradeStats.highestStudent }}</div>
          </template>
        </overview-card>
        <overview-card label="最低分" :value="gradeStats.lowestScore">
          <template #content>
            <div class="overview-sub">{{ gradeStats.lowestStudent }}</div>
          </template>
        </overview-card>
        <overview-card label="及格率" :rate="gradeStats.passRate">
          <template #content>
            <el-progress :percentage="gradeStats.passRate" :stroke-width="6" :show-text="false" />
          </template>
        </overview-card>
        <overview-card label="优秀率" :rate="gradeStats.excellentRate">
          <template #content>
            <el-progress :percentage="gradeStats.excellentRate" :stroke-width="6" :show-text="false" />
          </template>
        </overview-card>
      </div>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card>
            <div class="chart-card">
              <div class="chart-header">
                <h3>成绩分布直方图</h3>
                <div class="chart-actions">
                  <el-radio-group v-model="distributionType" size="small" @change="updateDistributionChart">
                    <el-radio-button label="bar">柱状图</el-radio-button>
                    <el-radio-button label="line">折线图</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <div id="distributionChart" class="chart-container" style="height: 280px"></div>
              <div class="chart-stats">
                <div v-for="range in scoreRanges" :key="range.name" class="range-stat">
                  <span class="range-name">{{ range.name }}</span>
                  <span class="range-count">{{ range.count }}人</span>
                  <span class="range-percent">{{ range.percent }}%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <div class="chart-card">
              <div class="chart-header">
                <h3>历次考试成绩趋势</h3>
                <div class="chart-actions">
                  <el-checkbox v-model="showCompare" @change="updateTrendChart">显示对比</el-checkbox>
                </div>
              </div>
              <div id="trendChart" class="chart-container" style="height: 280px"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card>
            <div class="chart-card">
              <div class="chart-header">
                <h3><i class="fas fa-arrow-up" style="color: #67c23a"></i> 进步榜 Top10</h3>
                <el-button size="small" @click="exportProgressList">导出进步榜</el-button>
              </div>
              <el-table :data="progressList" stripe style="width: 100%" max-height="320">
                <el-table-column prop="rank" label="排名" width="70" align="center">
                  <template #default="{ $index }">
                    <span class="rank-badge" :class="getRankClass($index)">{{ $index + 1 }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="studentName" label="姓名" width="100" />
                <el-table-column prop="studentNo" label="学号" width="100" />
                <el-table-column prop="currentScore" label="本次成绩" width="90" sortable />
                <el-table-column prop="previousScore" label="上次成绩" width="90" />
                <el-table-column prop="improvement" label="进步幅度" width="100">
                  <template #default="{ row }">
                    <span class="improve-up">
                      <i class="fas fa-arrow-up"></i> +{{ row.improvement }}分
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="rankChange" label="排名变化" width="90">
                  <template #default="{ row }">
                    <span class="rank-up">↑ {{ Math.abs(row.rankChange) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <div class="chart-card">
              <div class="chart-header">
                <h3><i class="fas fa-arrow-down" style="color: #f56c6c"></i> 退步榜 Top10</h3>
                <el-button size="small" @click="exportDeclineList">导出退步榜</el-button>
              </div>
              <el-table :data="declineList" stripe style="width: 100%" max-height="320">
                <el-table-column prop="rank" label="排名" width="70" align="center">
                  <template #default="{ $index }">
                    <span class="rank-badge decline">{{ $index + 1 }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="studentName" label="姓名" width="100" />
                <el-table-column prop="studentNo" label="学号" width="100" />
                <el-table-column prop="currentScore" label="本次成绩" width="90" sortable />
                <el-table-column prop="previousScore" label="上次成绩" width="90" />
                <el-table-column prop="decline" label="退步幅度" width="100">
                  <template #default="{ row }">
                    <span class="improve-down">
                      <i class="fas fa-arrow-down"></i> {{ row.decline }}分
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="rankChange" label="排名变化" width="90">
                  <template #default="{ row }">
                    <span class="rank-down">↓ {{ Math.abs(row.rankChange) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="grade-table-container">
      <div class="table-header">
        <h3>学生成绩明细</h3>
        <div class="table-actions">
          <el-input v-model="searchKeyword" placeholder="搜索姓名/学号" prefix-icon="Search" clearable style="width: 200px"
            @clear="handleSearch" @keyup.enter="handleSearch" />
          <el-select size="large" v-model="sortField" placeholder="排序方式" style="width: 120px" @change="sortStudents">
            <el-option label="按成绩降序" value="score_desc" />
            <el-option label="按成绩升序" value="score_asc" />
            <el-option label="按学号" value="studentNo" />
            <el-option label="按姓名" value="name" />
            <el-option label="按进步幅度" value="improvement" />
          </el-select>
          <el-button @click="exportGradeSheet">
            <i class="fas fa-file-excel"></i> 导出成绩单
          </el-button>
        </div>
      </div>

      <el-table :data="filteredStudentScores" stripe border style="width: 100%" v-loading="loading">
        <el-table-column prop="rank" label="排名" width="70" align="center">
          <template #default="{ $index }">
            <span :class="getRankBadgeClass($index)">{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="studentNo" label="学号" width="110" />
        <el-table-column prop="studentName" label="姓名" width="130">
          <template #default="{ row }">
            <div class="student-cell">
              <el-avatar :size="28" :src="row.avatar">
                {{ row.studentName?.charAt(0) }}
              </el-avatar>
              <span>{{ row.studentName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="成绩" width="100" sortable>
          <template #default="{ row }">
            <span :class="getScoreClass(row.score, gradeStats.passScore)">
              {{ row.score }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="previousScore" label="上次成绩" width="100" v-if="searchModel.compareExamId">
          <template #default="{ row }">
            <span>{{ row.previousScore || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="improvement" label="进步幅度" width="100" v-if="searchModel.compareExamId">
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
        <el-table-column prop="rankChange" label="排名变化" width="90" v-if="searchModel.compareExamId">
          <template #default="{ row }">
            <span v-if="row.rankChange < 0" class="rank-up">↑ {{ Math.abs(row.rankChange) }}</span>
            <span v-else-if="row.rankChange > 0" class="rank-down">↓ {{ row.rankChange }}</span>
            <span v-else class="rank-stable">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.score, gradeStats.passScore)" size="small">
              {{ getStatusText(row.score, gradeStats.passScore) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewStudentDetail(row)">
              详情
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

    <!-- 学生详情抽屉 -->
    <el-drawer v-model="studentDetailVisible" :title="`学生详情 - ${currentStudent?.studentName}`" direction="rtl"
      size="500px">
      <div class="student-detail" v-if="currentStudent">
        <div class="detail-avatar">
          <el-avatar :size="80" :src="currentStudent.avatar">
            {{ currentStudent.studentName?.charAt(0) }}
          </el-avatar>
          <h3>{{ currentStudent.studentName }}</h3>
          <p>{{ currentStudent.studentNo }}</p>
        </div>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="班级">
            {{ currentStudent.className }}
          </el-descriptions-item>
          <el-descriptions-item label="本次成绩">
            <span :class="getScoreClass(currentStudent.score, gradeStats.passScore)">
              {{ currentStudent.score }}分
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="班级排名">
            {{ currentStudent.rank }} / {{ totalStudents }}
          </el-descriptions-item>
          <el-descriptions-item label="上次成绩" v-if="currentStudent.previousScore">
            {{ currentStudent.previousScore }}分
          </el-descriptions-item>
          <el-descriptions-item label="进步幅度" v-if="currentStudent.improvement">
            <span :class="currentStudent.improvement > 0 ? 'improve-up' : 'improve-down'">
              {{ currentStudent.improvement > 0 ? '+' : '' }}{{ currentStudent.improvement }}分
            </span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-charts">
          <h4>历次考试成绩趋势</h4>
          <div id="studentFullTrendChart" style="height: 350px"></div>
          <div class="trend-summary" v-if="studentTrendData">
            <div class="summary-item">
              <span>平均分</span>
              <strong>{{ studentTrendData.avgScore }}分</strong>
            </div>
            <div class="summary-item">
              <span>最高分</span>
              <strong>{{ studentTrendData.highestScore }}分</strong>
            </div>
            <div class="summary-item">
              <span>最低分</span>
              <strong>{{ studentTrendData.lowestScore }}分</strong>
            </div>
            <div class="summary-item">
              <span>整体趋势</span>
              <strong :class="studentTrendData.trend > 0 ? 'up' : 'down'">
                {{ studentTrendData.trend > 0 ? '上升' : '下降' }}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.class-grade-container {
  width: 100%;
  min-height: 100vh;

  .filter-bar {
    background: white;
    border-radius: 16px;
    padding: 16px 24px;
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .filter-left {
      display: flex;
      align-items: center;
      gap: 8px;

    }

    .filter-right {
      margin-left: auto;
      display: flex;
      gap: 12px;
    }
  }

  .grade-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
    margin-bottom: 24px;

    .overview-trend {
      font-size: 12px;
      margin-top: 8px;

      &.up {
        color: #67c23a;
      }

      &.down {
        color: #f56c6c;
      }

    }

    .overview-sub {
      font-size: 12px;
      color: #8b9bb0;
      margin-top: 4px;
    }
  }

  .chart-card {
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0;
        color: #1e293b;
      }

      .chart-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    .chart-container {
      width: 100%;
      min-height: 280px;
    }

    /* 分数段统计 */
    .chart-stats {
      display: flex;
      justify-content: space-around;
      margin-top: 16px;
      flex-wrap: wrap;
      gap: 12px;

      .range-stat {
        text-align: center;
        padding: 8px 12px;
        background: #f8fafc;
        border-radius: 12px;
        min-width: 80px;

        .range-name {
          font-size: 12px;
          color: #5f6b7a;
          display: block;
        }

        .range-count {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          display: block;
        }

        .range-percent {
          font-size: 11px;
          color: #8b9bb0;
        }
      }
    }

    /* 排名徽章 */
    .rank-badge {
      display: inline-block;
      width: 28px;
      height: 28px;
      line-height: 28px;
      text-align: center;
      border-radius: 14px;
      font-weight: bold;

      &.rank-gold {
        background: #fdf6e3;
        color: #e6a23c;
      }

      &.rank-silver {
        background: #e8f5e9;
        color: #67c23a;
      }

      &.rank-bronze {
        background: #e6f4ff;
        color: #409eff;
      }

      &.decline {
        background: #ffebee;
        color: #f56c6c;
      }
    }



    .rank-1 {
      background: #fdf6e3;
      color: #e6a23c;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 20px;
      display: inline-block;
    }

    .rank-2 {
      background: #e8f5e9;
      color: #67c23a;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 20px;
      display: inline-block;
    }

    .rank-3 {
      background: #e6f4ff;
      color: #409eff;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 20px;
      display: inline-block;
    }

    .rank-up {
      color: #67c23a;
    }

    .rank-down {
      color: #f56c6c;
    }

    .rank-stable {
      color: #909399;
    }

  }

  .grade-table-container {
    margin-top: 20px;
    background: white;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;

      h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
      }

      .table-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .student-detail {
    padding: 8px;

    .detail-avatar {
      text-align: center;
      margin-bottom: 24px;

      h3 {
        margin: 12px 0 4px;
        font-size: 1.2rem;
      }

      p {
        color: #5f6b7a;
        font-size: 0.85rem;
      }
    }

    .detail-charts {
      margin: 24px 0;

      h4 {
        margin-bottom: 12px;
        font-size: 1rem;
      }

      .trend-summary {
        display: flex;
        justify-content: space-around;
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid #ecf1f6;

        .summary-item {
          text-align: center;

          span {
            display: block;
            font-size: 12px;
            color: #5f6b7a;
          }

          strong {
            font-size: 18px;
            color: #1e293b;

            &.up {
              color: #67c23a;
            }

            &.down {
              color: #f56c6c;
            }
          }
        }
      }
    }
  }
}

/* 成绩样式 */
.score-excellent {
  color: #67c23a;
  font-weight: bold;
}

.score-good {
  color: #409eff;
  font-weight: 500;
}

.score-pass {
  color: #e6a23c;
}

.score-fail {
  color: #f56c6c;
  font-weight: bold;
}

/* 进步/退步样式 */
.improve-up {
  color: #67c23a;
  font-weight: 500;
}

.improve-down {
  color: #f56c6c;
}

.improve-stable {
  color: #909399;
}


/* 响应式 */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;

    .filter-right {
      margin-left: 0;
    }
  }

  .grade-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .table-actions {
    justify-content: stretch;

    .el-input,
    .el-select {
      width: 100% !important;
    }
  }
}
</style>