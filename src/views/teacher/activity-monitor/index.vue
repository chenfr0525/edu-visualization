<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { exportToPDF, exportActivityDataToExcel, exportActivityWarningToExcel, exportActivityRankingToExcel } from '@/utils/export'
import OverviewCard from './component/overview-card.vue'
import StatItem from './component/stat-item.vue'
import { tActivityMonitorApi, tDashboardApi } from '@/api/index.js'
import { useAuthStore } from '@/stores/index.js'

const authStore = useAuthStore()
const loading = ref(false)
const dashboardRef = ref(null)

// 筛选条件
const searchModel = ref({
  classId: '',
})

// 视图切换
const trendMetric = ref('activityScore')
const hourlyType = ref('bar')
const heatmapMetric = ref('duration')
const behaviorMetric = ref('login')

// 数据列表
const classList = ref([])
const studentList = ref([])
const studentPagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})
const overallStats = reactive({
  totalStudents: 0,
  avgActivityScore: 0,
  highActivityCount: 0,
  lowActivityCount: 0,
  criticalCount: 0
})

// 趋势数据
const trendData = ref([])
const hourlyData = ref([])
const peakHour = ref('')

// 热力图数据
const heatmapData = ref([])

// 排行榜数据
const activeRanking = ref([])
const lowActivityWarnings = ref([])

// 班级对比数据
const classComparison = ref([])

// 学生详情相关
const studentDetailVisible = ref(false)
const currentStudent = ref(null)
const studentStatistics = ref(null)
const studentTrendData = ref([])
const studentTypeDistribution = ref([])
const studentRanking = ref([])
let studentDailyChart = null
let studentBehaviorChart = null

// 导入相关
const importDialogVisible = ref(false)
const importType = ref('') // STUDY_DURATION 或 RESOURCE
const uploadRef = ref(null)
const selectedFile = ref(null)
const uploading = ref(false)
const parseResult = ref(null)
const saving = ref(false)

// 图表实例
let trendChart = null
let classComparisonChart = null
let hourlyChart = null
let heatmapChart = null
let behaviorChart = null

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '本学期',
    value: () => {
      const end = new Date()
      const start = new Date(new Date().getFullYear(), 2, 1)
      return [start, end]
    }
  }
]

// 辅助方法
const getRankClass = (index) => {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return ''
}

const getActivityLevelType = (level) => {
  const map = { HIGH: 'success', MEDIUM: 'warning', LOW: 'danger', CRITICAL: 'info' }
  return map[level] || 'info'
}

const getActivityLevelText = (level) => {
  const map = { HIGH: '高活跃', MEDIUM: '中活跃', LOW: '低活跃', CRITICAL: '极低' }
  return map[level] || level
}

// ==================== 数据获取方法 ====================

// 获取班级列表
const fetchClassList = async () => {
  try {
    const res = await tDashboardApi.getClassList()
    if (res && res.data) {
      classList.value = res.data
      if (classList.value.length > 0 && !searchModel.value.classId) {
        searchModel.value.classId = classList.value[0].id
        await fetchAllData()
      }
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
    ElMessage.error('获取班级列表失败')
  }
}

// 获取学生活跃度列表
const fetchStudentList = async () => {
  if (!searchModel.value.classId) return

  loading.value = true
  try {
    const res = await tActivityMonitorApi.getStudentActivityList({
      classId: searchModel.value.classId,
      keyword: '',
      page: studentPagination.page - 1,
      size: studentPagination.pageSize
    })
    if (res && res.data) {
      studentList.value = res.data.records || []
      studentPagination.total = res.data.total || 0
      if (res.data.overallStats) {
        Object.assign(overallStats, res.data.overallStats)
      }
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
  } finally {
    loading.value = false
  }
}

// 获取图表数据
const fetchChartData = async () => {
  if (!searchModel.value.classId) return

  try {
    const res = await tActivityMonitorApi.getChartData(searchModel.value.classId)
    if (res && res.data) {
      // 活跃度排行榜
      activeRanking.value = res.data.activityRanking || []
      // 低活跃度预警
      lowActivityWarnings.value = res.data.lowActivityWarnings || []
      // 班级对比
      classComparison.value = res.data.classComparison || []
      // 趋势数据
      if (res.data.trendData && res.data.trendData.length > 0) {
        trendData.value = res.data.trendData
        await initTrendChart()
      }
    }
  } catch (error) {
    console.error('获取图表数据失败:', error)
  }
}

// 获取统计卡片
const fetchStatistics = async () => {
  if (!searchModel.value.classId) return

  try {
    const res = await tActivityMonitorApi.getStatistics(searchModel.value.classId)
    if (res && res.data) {
      Object.assign(overallStats, res.data)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取所有数据
const fetchAllData = async () => {
  if (!searchModel.value.classId) {
    if (classList.value.length > 0) {
      searchModel.value.classId = classList.value[0].id
    } else {
      return
    }
  }

  await Promise.all([
    fetchStudentList(),
    fetchStatistics(),
    fetchChartData()
  ])
}

// ==================== 图表初始化 ====================

// 趋势图
const initTrendChart = async () => {
  const chartDom = document.getElementById('trendChart')
  if (!chartDom || !trendData.value.length) return
  if (trendChart) trendChart.dispose()
  trendChart = echarts.init(chartDom)

  const metricMap = {
    activityScore: { name: '活跃度得分', data: trendData.value.map(d => d.avgActivityScore), color: '#409eff', yAxisName: '得分' },
    loginCount: { name: '登录次数', data: trendData.value.map(d => d.totalLoginCount), color: '#67c23a', yAxisName: '次数' },
    studyDuration: { name: '学习时长(分钟)', data: trendData.value.map(d => d.totalStudyDuration), color: '#e6a23c', yAxisName: '分钟' }
  }
  const metric = metricMap[trendMetric.value] || metricMap.activityScore

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: trendData.value.map(d => d.date) },
    yAxis: { type: 'value', name: metric.yAxisName },
    series: [{
      type: 'line',
      name: metric.name,
      data: metric.data,
      smooth: true,
      lineStyle: { color: metric.color, width: 3 },
      areaStyle: { opacity: 0.2, color: metric.color },
      symbol: 'circle',
      symbolSize: 8,
      label: { show: true, position: 'top', formatter: (params) => metric.name === '活跃度得分' ? params.value : params.value }
    }]
  })
}

// 班级对比图
const initClassComparisonChart = () => {
  const chartDom = document.getElementById('classComparisonChart')
  if (!chartDom || !classComparison.value.length) return

  if (classComparisonChart) classComparisonChart.dispose()
  classComparisonChart = echarts.init(chartDom)
  classComparisonChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: classComparison.value.map(c => c.className), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '平均活跃度得分' },
    series: [{
      type: 'bar',
      name: '平均活跃度',
      data: classComparison.value.map(c => c.avgActivityScore),
      itemStyle: {
        borderRadius: [8, 8, 0, 0],
        color: (params) => {
          const value = params.data
          if (value >= 70) return '#67c23a'
          if (value >= 50) return '#409eff'
          return '#f56c6c'
        }
      },
      label: { show: true, position: 'top', formatter: '{c}' }
    }]
  })
}

// ==================== 学生详情 ====================

const viewStudentActivity = async (student) => {
  currentStudent.value = student
  studentDetailVisible.value = true

  try {
    const res = await tActivityMonitorApi.getStudentActivityDetail(student.studentId)
    if (res && res.data) {
      const detail = res.data
      studentStatistics.value = detail.statistics
      studentTrendData.value = detail.trendData || []
      studentTypeDistribution.value = detail.typeDistribution || []
      studentRanking.value = detail.classRanking || []

      await nextTick()
      initStudentTrendChart()
      initStudentDistributionChart()
    }
  } catch (error) {
    console.error('获取学生详情失败:', error)
    ElMessage.error('获取学生详情失败')
  }
}

const initStudentTrendChart = () => {
  const chartDom = document.getElementById('studentTrendChart')
  if (!chartDom || !studentTrendData.value.length) return
  if (studentDailyChart) studentDailyChart.dispose()
  studentDailyChart = echarts.init(chartDom)

  studentDailyChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: studentTrendData.value.map(d => d.date) },
    yAxis: { type: 'value', name: '活跃度得分' },
    series: [{
      type: 'line',
      data: studentTrendData.value.map(d => d.activityScore),
      smooth: true,
      lineStyle: { color: '#409eff', width: 2 },
      areaStyle: { opacity: 0.2 },
      symbol: 'circle'
    }]
  })
}

const initStudentDistributionChart = () => {
  const chartDom = document.getElementById('studentDistributionChart')
  if (!chartDom || !studentTypeDistribution.value.length) return
  if (studentBehaviorChart) studentBehaviorChart.dispose()
  studentBehaviorChart = echarts.init(chartDom)

  studentBehaviorChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '55%',
      data: studentTypeDistribution.value.map(item => ({ name: item.typeName, value: item.count })),
      label: { show: true, formatter: '{b}: {d}%' }
    }]
  })
}

// ==================== 导入功能 ====================

const showImportDialog = (type) => {
  importType.value = type
  parseResult.value = null
  selectedFile.value = null
  importDialogVisible.value = true
  setTimeout(() => {
    uploadRef.value?.clearFiles()
  }, 100)
}

const handleFileChange = (file) => {
  selectedFile.value = file.raw
  parseResult.value = null
}

const uploadFile = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  uploading.value = true
  try {
    const res = await tActivityMonitorApi.parseActivityFile(
      selectedFile.value,
      importType.value
    )
    parseResult.value = res.data

    if (parseResult.value.success) {
      ElMessage.success(`解析成功！共 ${parseResult.value.data?.length || 0} 条数据`)
    } else {
      ElMessage.error('解析失败，请检查文件格式')
    }
  } catch (error) {
    console.error('解析失败:', error)
    ElMessage.error(error.message || '解析失败')
  } finally {
    uploading.value = false
  }
}

const confirmImport = async () => {
  if (!parseResult.value?.data || parseResult.value.data.length === 0) {
    ElMessage.warning('没有可导入的数据')
    return
  }

  try {
    await ElMessageBox.confirm(`确认导入 ${parseResult.value.data.length} 条数据吗？`, '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    saving.value = true
    const res = await tActivityMonitorApi.confirmActivityImport(parseResult.value.data)

    if (res.data && res.data.success) {
      ElMessage.success(res.data.message || '导入成功')
      parseResult.value = null
      selectedFile.value = null
      importDialogVisible.value = false
      uploadRef.value?.clearFiles()
      // 刷新数据
      await fetchAllData()
    } else {
      ElMessage.error(res.data?.message || '导入失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('导入失败:', error)
      ElMessage.error(error.message || '导入失败')
    }
  } finally {
    saving.value = false
  }
}

const cancelImport = () => {
  parseResult.value = null
  selectedFile.value = null
  uploadRef.value?.clearFiles()
  importDialogVisible.value = false
  ElMessage.info('已取消导入')
}

const clearFile = () => {
  selectedFile.value = null
  parseResult.value = null
  uploadRef.value?.clearFiles()
}

// ==================== 导出功能 ====================

// 导出全部活跃度数据
const exportData = () => {
  if (studentList.value.length === 0 && studentPagination.total === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  const loadingInstance = ElLoading.service({ text: '正在导出数据...', fullscreen: true })

  try {
    const className = classList.value.find(c => c.id === searchModel.value.classId)?.name || '全部班级'
    exportActivityDataToExcel(studentList.value, overallStats, className, '活跃度数据')
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    loadingInstance.close()
  }
}

// 导出预警学生数据
const exportWarningData = () => {
  if (lowActivityWarnings.value.length === 0) {
    ElMessage.warning('没有预警数据可导出')
    return
  }

  const loadingInstance = ElLoading.service({ text: '正在导出预警数据...', fullscreen: true })

  try {
    const className = classList.value.find(c => c.id === searchModel.value.classId)?.name || '全部班级'
    exportActivityWarningToExcel(lowActivityWarnings.value, className, '不活跃学生预警')
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    loadingInstance.close()
  }
}

// 导出排行榜数据
const exportRankingData = () => {
  if (activeRanking.value.length === 0) {
    ElMessage.warning('没有排行榜数据可导出')
    return
  }

  const loadingInstance = ElLoading.service({ text: '正在导出排行榜...', fullscreen: true })

  try {
    const className = classList.value.find(c => c.id === searchModel.value.classId)?.name || '全部班级'
    exportActivityRankingToExcel(activeRanking.value, className, '活跃度排行榜')
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    loadingInstance.close()
  }
}

const exportReport = () => {
  exportToPDF(dashboardRef.value, `${searchModel.value.classId}_活跃度监控报告`)
}

// 导出命令处理
const handleExportCommand = (command) => {
  switch (command) {
    case 'all':
      exportData()
      break
    case 'warning':
      exportWarningData()
      break
    case 'ranking':
      exportRankingData()
      break
    default:
      break
  }
}

// ==================== 刷新和筛选 ====================

const refreshData = async () => {
  await fetchAllData()
}

const handleClassChange = () => {
  studentPagination.page = 1
  fetchAllData()
}

const handlePageChange = (page) => {
  studentPagination.page = page
  fetchStudentList()
}

const handleSizeChange = (size) => {
  studentPagination.pageSize = size
  studentPagination.page = 1
  fetchStudentList()
}

const updateTrendChart = () => {
  initTrendChart()
}

// ==================== 生命周期 ====================

onMounted(async () => {
  await fetchClassList()

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (trendChart) trendChart.resize()
    if (classComparisonChart) classComparisonChart.resize()
    if (studentDailyChart) studentDailyChart.resize()
    if (studentBehaviorChart) studentBehaviorChart.resize()
  })
})

onUnmounted(() => {
  [trendChart, studentDailyChart, studentBehaviorChart, classComparisonChart].forEach(chart => {
    if (chart) chart.dispose()
  })
  window.removeEventListener('resize', () => { })
})

// 监听班级变化重新初始化班级对比图
watch(classComparison, () => {
  nextTick(() => {
    initClassComparisonChart()
  })
}, { deep: true })
</script>

<template>
  <div class="activity-monitor-container">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select size="large" v-model="searchModel.classId" placeholder="请选择班级" style="width: 180px"
        @change="handleClassChange" filterable>
        <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
      </el-select>

      <div class="filter-right">
        <el-button type="primary" plain @click="showImportDialog('STUDY_DURATION')">
          <i class="fas fa-clock"></i> 导入学习时长
        </el-button>
        <el-button type="primary" plain @click="showImportDialog('RESOURCE')">
          <i class="fas fa-database"></i> 导入资源访问
        </el-button>
        <el-dropdown @command="handleExportCommand">
          <el-button>
            <i class="fas fa-download"></i> 导出数据 <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="all">导出全部活跃度数据</el-dropdown-item>
              <el-dropdown-item command="warning">导出预警学生数据</el-dropdown-item>
              <el-dropdown-item command="ranking">导出活跃度排行榜</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button @click="exportReport">
          <i class="fas fa-file-pdf"></i> 导出报告
        </el-button>
        <el-button type="primary" @click="refreshData" :loading="loading">
          <i class="fas fa-sync-alt"></i> 刷新
        </el-button>
      </div>
    </div>

    <div ref="dashboardRef">
      <!-- 统计卡片 -->
      <div class="activity-overview">
        <overview-card icon="fa-users" iconColor="blue" label="总学生数" :value="overallStats.totalStudents">
        </overview-card>
        <overview-card icon="fa-chart-line" iconColor="green" label="平均活跃度"
          :value="`${overallStats.avgActivityScore}分`">
        </overview-card>
        <overview-card icon="fa-star" iconColor="orange" label="高活跃学生" :value="overallStats.highActivityCount">
        </overview-card>
        <overview-card icon="fa-exclamation-triangle" iconColor="red" label="低活跃学生"
          :value="overallStats.lowActivityCount">
        </overview-card>
        <overview-card icon="fa-bell" iconColor="purple" label="严重预警" :value="overallStats.criticalCount">
        </overview-card>
      </div>

      <!-- 图表行 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="14">
          <el-card>
            <div class="chart-card">
              <div class="chart-header">
                <h3>活跃度趋势</h3>
                <div class="chart-actions">
                  <el-radio-group v-model="trendMetric" size="small" @change="updateTrendChart">
                    <el-radio-button label="activityScore">活跃度得分</el-radio-button>
                    <el-radio-button label="loginCount">登录次数</el-radio-button>
                    <el-radio-button label="studyDuration">学习时长</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <div id="trendChart" class="chart-container" style="height: 320px"></div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card>
            <div class="chart-card">
              <div class="chart-header">
                <h3>班级活跃度</h3>
              </div>
              <div id="classComparisonChart" class="chart-container" style="height: 320px"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 学生活跃度列表 -->
      <el-card style="margin-top: 20px;">
        <div class="chart-header">
          <h3><i class="fas fa-list"></i> 学生活跃度列表</h3>
          <span class="tip-text">共 {{ studentPagination.total }} 名学生</span>
        </div>
        <el-table :data="studentList" v-loading="loading" stripe style="width: 100%">
          <el-table-column prop="studentNo" label="学号" width="120" />
          <el-table-column prop="studentName" label="姓名" width="100" />
          <el-table-column prop="className" label="班级" width="120" />
          <el-table-column prop="loginCount" label="登录次数" width="90" align="center" />
          <el-table-column prop="homeworkCount" label="作业提交" width="90" align="center" />
          <el-table-column prop="examCount" label="考试参与" width="90" align="center" />
          <el-table-column prop="studyDuration" label="学习时长(min)" width="110" align="center">
            <template #default="{ row }">
              <span :class="row.studyDuration > 200 ? 'duration-high' : ''">{{ row.studyDuration }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="resourceAccessCount" label="资源访问" width="90" align="center" />
          <el-table-column prop="activityScore" label="活跃度得分" width="110" align="center">
            <template #default="{ row }">
              <el-progress :percentage="row.activityScore" :stroke-width="8" :show-text="false"
                :color="row.activityScore >= 70 ? '#67c23a' : row.activityScore >= 50 ? '#409eff' : '#f56c6c'" />
              <span class="score-text">{{ row.activityScore }}分</span>
            </template>
          </el-table-column>
          <el-table-column prop="activityLevel" label="活跃等级" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="getActivityLevelType(row.activityLevel)" size="small">
                {{ getActivityLevelText(row.activityLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="viewStudentActivity(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination v-model:current-page="studentPagination.page" v-model:page-size="studentPagination.pageSize"
            :page-sizes="[10, 20, 50, 100]" :total="studentPagination.total"
            layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
            @current-change="handlePageChange" />
        </div>
      </el-card>

      <!-- 不活跃学生预警 -->
      <el-card style="margin-top: 20px;" v-if="lowActivityWarnings.length > 0">
        <div class="chart-header">
          <h3><i class="fas fa-exclamation-triangle" style="color: #f56c6c"></i> 不活跃学生预警</h3>
          <el-tag type="danger" size="small">{{ lowActivityWarnings.length }} 名学生需要关注</el-tag>
        </div>
        <el-table :data="lowActivityWarnings" stripe style="width: 100%">
          <el-table-column prop="studentName" label="姓名" width="100" />
          <el-table-column prop="className" label="班级" width="120" />
          <el-table-column prop="activityScore" label="活跃度得分" width="120" align="center">
            <template #default="{ row }">
              <span class="warning-score">{{ row.activityScore }}分</span>
            </template>
          </el-table-column>
          <el-table-column prop="warningLevel" label="预警等级" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.warningLevel === 'CRITICAL' ? 'danger' : 'warning'" size="small">
                {{ row.warningLevel === 'CRITICAL' ? '严重' : '预警' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="warningReason" label="预警原因" min-width="150" />
          <el-table-column prop="suggestion" label="建议措施" min-width="150" />
        </el-table>
      </el-card>
    </div>

    <!-- 学生详情抽屉 -->
    <el-drawer v-model="studentDetailVisible" :title="`活跃度详情 - ${currentStudent?.studentName}`" direction="rtl"
      size="600px">
      <div class="student-activity-detail" v-if="currentStudent">
        <div class="detail-header">
          <el-avatar :size="60" :src="currentStudent.avatar">
            {{ currentStudent.studentName?.charAt(0) }}
          </el-avatar>
          <div class="detail-info">
            <h3>{{ currentStudent.studentName }}</h3>
            <p>{{ currentStudent.studentNo }} · {{ currentStudent.className }}</p>
          </div>
        </div>

        <div class="detail-stats">
          <stat-item :value="studentStatistics?.totalLoginCount || 0" label="登录次数" />
          <stat-item :value="studentStatistics?.totalHomeworkCount || 0" label="作业提交" />
          <stat-item :value="studentStatistics?.totalExamCount || 0" label="考试参与" />
          <stat-item :value="studentStatistics?.totalStudyDuration || 0" label="学习时长(min)" />
          <stat-item :value="studentStatistics?.totalResourceCount || 0" label="资源访问" />
          <stat-item :value="`${studentStatistics?.avgActivityScore || 0}分`" label="活跃度得分" />
        </div>

        <div class="detail-compare" v-if="studentStatistics?.compareToClass">
          <el-alert :title="studentStatistics.compareToClass" type="info" :closable="false" />
        </div>

        <div class="detail-charts">
          <h4>近期活跃趋势</h4>
          <div id="studentTrendChart" style="height: 200px"></div>
        </div>

        <div class="detail-charts">
          <h4>活动类型分布</h4>
          <div id="studentDistributionChart" style="height: 200px"></div>
        </div>

        <div class="detail-ranking" v-if="studentRanking.length">
          <h4>班级活跃度排名</h4>
          <el-table :data="studentRanking.slice(0, 10)" size="small" stripe>
            <el-table-column prop="rank" label="排名" width="70" align="center">
              <template #default="{ $index }">
                <span :class="getRankClass($index)">{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="studentName" label="姓名" />
            <el-table-column prop="activityScore" label="活跃度得分" width="100" align="center">
              <template #default="{ row }">
                <span :class="row.isCurrentStudent ? 'current-student' : ''">{{ row.activityScore }}分</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-drawer>

    <!-- 导入数据弹窗 -->
    <el-dialog v-model="importDialogVisible" :title="importType === 'STUDY_DURATION' ? '导入学习时长数据' : '导入资源访问数据'"
      width="750px">
      <div class="import-content">
        <div class="import-tips">
          <i class="fas fa-info-circle"></i>
          <div>
            <h4>导入说明</h4>
            <p v-if="importType === 'STUDY_DURATION'">
              必填：学生（学号或姓名）、日期、学习时长（分钟）<br>
              格式示例：张三,2024-12-20,120
            </p>
            <p v-else>
              必填：学生（学号或姓名）、日期、访问次数<br>
              格式示例：张三,2024-12-20,15
            </p>
          </div>
        </div>

        <div class="import-actions">
          <el-upload ref="uploadRef" drag :auto-upload="false" :on-change="handleFileChange" :limit="1"
            accept=".xlsx,.xls,.csv,.txt">
            <i class="fas fa-cloud-upload-alt"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </el-upload>
          <div v-if="selectedFile" class="file-info">
            <el-alert :title="`已选择：${selectedFile.name}`" type="info" :closable="false" />
          </div>
        </div>

        <div v-if="selectedFile" class="action-buttons">
          <el-button type="primary" @click="uploadFile" :loading="uploading">
            开始解析
          </el-button>
          <el-button @click="clearFile">清空</el-button>
        </div>

        <!-- 解析结果 -->
        <div v-if="parseResult" class="parse-result">
          <el-divider>解析结果</el-divider>
          <el-alert :title="parseResult.success ? '解析成功' : '解析失败'" :type="parseResult.success ? 'success' : 'error'"
            :closable="false" />
          <div class="summary">{{ parseResult.summary }}</div>

          <div v-if="parseResult.data?.length" class="data-table">
            <h4>解析数据预览（请确认）</h4>
            <el-table :data="parseResult.data" border stripe max-height="300" size="small">
              <el-table-column prop="studentName" label="学生" width="120" />
              <el-table-column prop="activityDate" label="日期" width="120" />
              <el-table-column v-if="importType === 'STUDY_DURATION'" prop="studyDuration" label="学习时长(分钟)"
                width="120" />
              <el-table-column v-else prop="resourceAccessCount" label="访问次数" width="120" />
              <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
            </el-table>
          </div>

          <div class="confirm-buttons" v-if="parseResult.data?.length">
            <el-button type="success" @click="confirmImport" :loading="saving">确认导入</el-button>
            <el-button type="danger" @click="cancelImport">取消</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.activity-monitor-container {
  width: 100%;
  min-height: 100vh;

  .filter-bar {
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

    .filter-right {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  .activity-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .chart-card {
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;

      h3 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0;
        color: #1e293b;

        i {
          margin-right: 8px;
          color: #409eff;
        }
      }

      .chart-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .duration-high {
    color: #67c23a;
    font-weight: 500;
  }

  .score-text {
    font-size: 12px;
    margin-left: 8px;
    color: #5f6b7a;
  }

  .warning-score {
    color: #f56c6c;
    font-weight: 500;
  }

  .tip-text {
    font-size: 13px;
    color: #8b9bb0;
  }

  .current-student {
    font-weight: 700;
    color: #409eff;
  }
}

// 导入弹窗样式
.import-content {
  .import-tips {
    background: #ecf5ff;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    gap: 12px;
    margin-bottom: 20px;

    i {
      font-size: 24px;
      color: #409eff;
    }

    h4 {
      margin: 0 0 8px;
    }

    p {
      margin: 0;
      font-size: 13px;
      color: #5f6b7a;
    }
  }

  .import-actions {
    text-align: center;
    margin-bottom: 20px;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin: 16px 0;
  }

  .parse-result {
    .summary {
      margin: 12px 0;
      padding: 10px;
      background: #f5f7fa;
      border-radius: 8px;
    }

    .data-table {
      margin-top: 16px;

      h4 {
        margin: 0 0 12px;
        font-size: 14px;
      }
    }

    .confirm-buttons {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 20px;
    }
  }
}

// 学生详情抽屉样式
.student-activity-detail {
  padding: 8px;

  .detail-header {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ecf1f6;

    .detail-info {
      h3 {
        margin: 0 0 4px;
        font-size: 1.1rem;
      }

      p {
        margin: 0;
        font-size: 12px;
        color: #5f6b7a;
      }
    }
  }

  .detail-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }

  .detail-compare {
    margin-bottom: 20px;
  }

  .detail-charts {
    margin-bottom: 24px;

    h4 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #1e293b;
    }
  }

  .detail-ranking {
    margin-bottom: 20px;

    h4 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
    }
  }

  .detail-suggestion {
    .suggestion-content {
      background: #f8fafc;
      border-radius: 12px;
      padding: 16px;

      p {
        margin: 8px 0;
        font-size: 13px;
        line-height: 1.5;
      }
    }
  }
}

.rank-gold {
  font-weight: bold;
  color: #e6a23c;
}

.rank-silver {
  font-weight: bold;
  color: #67c23a;
}

.rank-bronze {
  font-weight: bold;
  color: #409eff;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;

    .filter-right {
      justify-content: flex-start;
    }
  }

  .activity-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-stats {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
</style>