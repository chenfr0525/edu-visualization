<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { exportToPDF } from '@/utils/export'
import OverviewCard from './component/overview-card.vue'
import StatItem from './component/stat-item.vue'

// ==================== 响应式数据 ====================
const loading = ref(false)
const dashboardRef = ref(null)

// 筛选条件
const searchModel = ref({
  classId: '',
  dateRange: [],
  granularity: 'day'
})

// 视图切换
const trendMetric = ref('duration')
const hourlyType = ref('bar')
const heatmapMetric = ref('duration')
const behaviorMetric = ref('video')

// 数据列表
const classList = ref([])
const overviewStats = reactive({
  avgDailyDuration: 0,
  avgDailyVisits: 0,
  avgDailyInteractions: 0,
  activeRate: 0,
  peakHour: '',
  durationTrend: 0
})

// 趋势数据
const trendData = ref([])
const hourlyData = ref([])
const peakHour = ref('')

// 热力图数据
const heatmapData = ref([])

// 排行榜数据
const activeRanking = ref([])
const inactiveStudents = ref([])

// 行为分析数据
const behaviorData = ref([])

// 学生详情
const studentDetailVisible = ref(false)
const currentStudent = ref(null)
let studentDailyChart = null
let studentBehaviorChart = null

// 提醒相关
const reminderDialogVisible = ref(false)
const reminderStudents = ref([])
const reminderForm = reactive({
  content: ''
})

// 图表实例
let trendChart = null
let hourlyChart = null
let heatmapChart = null
let behaviorChart = null

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周', value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一月', value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '本学期', value: () => {
      const end = new Date()
      const start = new Date(new Date().getFullYear(), 2, 1)
      return [start, end]
    }
  }
]

// ==================== 辅助函数 ====================
const getRankClass = (index) => {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return ''
}

const getActivityLevelType = (level) => {
  const map = { high: 'success', medium: 'warning', low: 'danger', veryLow: 'info' }
  return map[level] || 'info'
}

const getActivityLevelText = (level) => {
  const map = { high: '高活跃', medium: '中活跃', low: '低活跃', veryLow: '极低' }
  return map[level] || level
}

// ==================== API 调用 ====================
// 获取班级列表
const fetchClassList = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return [
    { id: 1, name: '高三(1)班', grade: '高三', studentCount: 45 },
    { id: 2, name: '高三(2)班', grade: '高三', studentCount: 42 },
    { id: 3, name: '高三(3)班', grade: '高三', studentCount: 38 }
  ]
}

// 获取活跃度概览
const fetchOverviewStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    avgDailyDuration: 48.5,
    avgDailyVisits: 3.2,
    avgDailyInteractions: 1.8,
    activeRate: 78,
    peakHour: '20:00',
    durationTrend: 5.2
  }
}

// 获取趋势数据
const fetchTrendData = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const days = ['03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22']
  return {
    dates: days,
    duration: [45, 52, 48, 55, 62, 58, 65],
    visits: [3.2, 3.5, 3.1, 3.8, 4.2, 3.9, 4.5],
    interactions: [1.5, 1.8, 1.6, 2.0, 2.3, 2.1, 2.5]
  }
}

// 获取时段分布数据
const fetchHourlyData = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const data = [
    5, 3, 2, 1, 1, 2, 5, 15, 25, 35, 45, 50,
    48, 52, 55, 58, 62, 68, 75, 82, 78, 65, 48, 32
  ]
  return { hours, data }
}

// 获取热力图数据
const fetchHeatmapData = async () => {
  await new Promise(resolve => setTimeout(resolve, 400))
  const students = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  const dates = ['03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22']
  const data = []
  for (let i = 0; i < students.length; i++) {
    const row = []
    for (let j = 0; j < dates.length; j++) {
      let value
      if (heatmapMetric.value === 'duration') {
        value = Math.floor(Math.random() * 100) + 10
      } else if (heatmapMetric.value === 'visits') {
        value = Math.floor(Math.random() * 8) + 1
      } else {
        value = Math.floor(Math.random() * 5)
      }
      row.push(value)
    }
    data.push(row)
  }
  return { students, dates, data }
}

// 获取活跃度排行榜
const fetchActiveRanking = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return [
    { studentName: '张小明', studentNo: '2024001', totalDuration: 485, avgDailyDuration: 69, visitCount: 32, interactionCount: 18, activityLevel: 'high' },
    { studentName: '李华', studentNo: '2024002', totalDuration: 452, avgDailyDuration: 64, visitCount: 28, interactionCount: 15, activityLevel: 'high' },
    { studentName: '王芳', studentNo: '2024003', totalDuration: 428, avgDailyDuration: 61, visitCount: 25, interactionCount: 12, activityLevel: 'high' },
    { studentName: '刘洋', studentNo: '2024006', totalDuration: 385, avgDailyDuration: 55, visitCount: 22, interactionCount: 10, activityLevel: 'medium' },
    { studentName: '陈晨', studentNo: '2024005', totalDuration: 362, avgDailyDuration: 52, visitCount: 20, interactionCount: 8, activityLevel: 'medium' }
  ]
}

// 获取不活跃学生列表
const fetchInactiveStudents = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return [
    { id: 4, studentName: '赵雷', studentNo: '2024004', totalDuration: 85, lastActiveTime: '2026-03-15', inactiveDays: 7, className: '高三(1)班' },
    { id: 7, studentName: '周婷', studentNo: '2024007', totalDuration: 112, lastActiveTime: '2026-03-16', inactiveDays: 6, className: '高三(1)班' },
    { id: 9, studentName: '吴迪', studentNo: '2024009', totalDuration: 45, lastActiveTime: '2026-03-10', inactiveDays: 12, className: '高三(1)班' }
  ]
}

// 获取行为分析数据
const fetchBehaviorData = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const days = ['03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22']
  return {
    dates: days,
    video: [125, 142, 138, 155, 168, 162, 175],
    homework: [38, 42, 40, 45, 48, 46, 52],
    discussion: [15, 18, 16, 22, 25, 23, 28]
  }
}

// 获取学生每日活跃数据
const fetchStudentDailyActivity = async (studentId) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const days = ['03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22']
  return {
    dates: days,
    duration: [45, 52, 48, 55, 62, 58, 65],
    visits: [3, 4, 3, 4, 5, 4, 5],
    interactions: [2, 3, 2, 3, 4, 3, 4]
  }
}

// 获取学生学习行为分布
const fetchStudentBehavior = async (studentId) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    categories: ['视频观看', '作业提交', '讨论互动', '资料下载', '测验练习'],
    values: [65, 18, 12, 8, 22]
  }
}


// ==================== 图表初始化 ====================
// 趋势图
const initTrendChart = async () => {
  const data = await fetchTrendData()
  trendData.value = data

  const chartDom = document.getElementById('trendChart')
  if (!chartDom) return
  if (trendChart) trendChart.dispose()
  trendChart = echarts.init(chartDom)

  const metricMap = {
    duration: { name: '学习时长(分钟)', data: data.duration, color: '#409eff', yAxisName: '分钟' },
    visits: { name: '访问次数', data: data.visits, color: '#67c23a', yAxisName: '次数' },
    interactions: { name: '互动次数', data: data.interactions, color: '#e6a23c', yAxisName: '次数' }
  }
  const metric = metricMap[trendMetric.value]

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.dates },
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
      label: { show: true, position: 'top', formatter: '{c}' }
    }]
  })
}

// 时段分布图
const initHourlyChart = async () => {
  const data = await fetchHourlyData()
  hourlyData.value = data

  const chartDom = document.getElementById('hourlyChart')
  if (!chartDom) return
  if (hourlyChart) hourlyChart.dispose()
  hourlyChart = echarts.init(chartDom)

  const maxIndex = data.data.indexOf(Math.max(...data.data))
  peakHour.value = data.hours[maxIndex]

  hourlyChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.hours,
      axisLabel: { rotate: 45, interval: 2 }
    },
    yAxis: { type: 'value', name: '活跃人数' },
    series: [{
      type: hourlyType.value,
      data: data.data,
      itemStyle: {
        borderRadius: hourlyType.value === 'bar' ? [8, 8, 0, 0] : 0,
        color: (params) => {
          if (params.dataIndex === maxIndex) return '#e6a23c'
          return '#409eff'
        }
      },
      smooth: hourlyType.value === 'line',
      areaStyle: hourlyType.value === 'line' ? { opacity: 0.2 } : undefined
    }]
  })
}

// 热力图
const initHeatmap = async () => {
  const data = await fetchHeatmapData()
  heatmapData.value = data

  const chartDom = document.getElementById('heatmapChart')
  if (!chartDom) return
  if (heatmapChart) heatmapChart.dispose()
  heatmapChart = echarts.init(chartDom)

  const seriesData = []
  data.data.forEach((row, i) => {
    row.forEach((value, j) => {
      seriesData.push([j, i, value])
    })
  })

  const metricMap = {
    duration: { min: 0, max: 100, name: '学习时长(分钟)', color: ['#b3cde0', '#5f9bc0', '#1d4e7c', '#0a2f4a'] },
    visits: { min: 0, max: 8, name: '访问次数', color: ['#b3cde0', '#5f9bc0', '#1d4e7c', '#0a2f4a'] },
    interactions: { min: 0, max: 5, name: '互动次数', color: ['#b3cde0', '#5f9bc0', '#1d4e7c', '#0a2f4a'] }
  }
  const metric = metricMap[heatmapMetric.value]

  heatmapChart.setOption({
    tooltip: {
      position: 'top',
      formatter: (params) => {
        return `${data.students[params.value[1]]}<br/>${data.dates[params.value[0]]}<br/>${metric.name}: ${params.value[2]}`
      }
    },
    xAxis: { type: 'category', data: data.dates, splitArea: { show: true } },
    yAxis: { type: 'category', data: data.students, splitArea: { show: true } },
    visualMap: {
      min: metric.min,
      max: metric.max,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: { color: metric.color }
    },
    series: [{
      type: 'heatmap',
      data: seriesData,
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }
    }]
  })
}

// 行为分析图
const initBehaviorChart = async () => {
  const data = await fetchBehaviorData()
  behaviorData.value = data

  const chartDom = document.getElementById('behaviorChart')
  if (!chartDom) return
  if (behaviorChart) behaviorChart.dispose()
  behaviorChart = echarts.init(chartDom)

  const metricMap = {
    video: { name: '视频观看时长(分钟)', data: data.video, color: '#409eff' },
    homework: { name: '作业提交次数', data: data.homework, color: '#67c23a' },
    discussion: { name: '讨论互动次数', data: data.discussion, color: '#e6a23c' }
  }
  const metric = metricMap[behaviorMetric.value]

  behaviorChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.dates },
    yAxis: { type: 'value', name: metric.name },
    series: [{
      type: 'line',
      data: metric.data,
      smooth: true,
      lineStyle: { color: metric.color, width: 3 },
      areaStyle: { opacity: 0.2 },
      symbol: 'circle',
      symbolSize: 8,
      label: { show: true, position: 'top' }
    }]
  })
}

// 学生每日活跃图
const initStudentDailyChart = async (studentId) => {
  const data = await fetchStudentDailyActivity(studentId)
  const chartDom = document.getElementById('studentDailyChart')
  if (!chartDom) return
  if (studentDailyChart) studentDailyChart.dispose()
  studentDailyChart = echarts.init(chartDom)
  studentDailyChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.dates },
    yAxis: { type: 'value', name: '学习时长(分钟)' },
    series: [{
      type: 'line',
      data: data.duration,
      smooth: true,
      lineStyle: { color: '#409eff', width: 2 },
      areaStyle: { opacity: 0.2 },
      symbol: 'circle'
    }]
  })
}

// 学生学习行为分布图
const initStudentBehaviorChart = async (studentId) => {
  const data = await fetchStudentBehavior(studentId)
  const chartDom = document.getElementById('studentBehaviorChart')
  if (!chartDom) return
  if (studentBehaviorChart) studentBehaviorChart.dispose()
  studentBehaviorChart = echarts.init(chartDom)
  studentBehaviorChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '55%',
      data: data.categories.map((name, i) => ({ name, value: data.values[i] })),
      label: { show: true, formatter: '{b}: {d}%' }
    }]
  })
}

// ==================== 事件处理 ====================
const handleFilterChange = async () => {
  await refreshData()
}

const refreshData = async () => {
  loading.value = true
  try {
    const [stats, ranking, inactive] = await Promise.all([
      fetchOverviewStats(),
      fetchActiveRanking(),
      fetchInactiveStudents()
    ])
    Object.assign(overviewStats, stats)
    activeRanking.value = ranking
    inactiveStudents.value = inactive

    await Promise.all([
      initTrendChart(),
      initHourlyChart(),
      initHeatmap(),
      initBehaviorChart()
    ])
  } finally {
    loading.value = false
  }
}

const updateTrendChart = () => initTrendChart()
const updateHourlyChart = () => initHourlyChart()
const updateHeatmap = () => initHeatmap()
const updateBehaviorChart = () => initBehaviorChart()

const viewStudentActivity = async (student) => {
  currentStudent.value = student
  studentDetailVisible.value = true
  setTimeout(async () => {
    await initStudentDailyChart(student.id)
    await initStudentBehaviorChart(student.id)
  }, 100)
}

const sendReminder = () => {
  if (inactiveStudents.value.length === 0) {
    ElMessage.warning('暂无需要提醒的学生')
    return
  }
  reminderStudents.value = inactiveStudents.value
  reminderForm.content = '同学你好，检测到近期学习活跃度较低，请合理安排学习时间，坚持每天学习。如有困难请及时与老师沟通。'
  reminderDialogVisible.value = true
}

const exportActivityReport = () => {
  exportToPDF(dashboardRef.value, "学生学习行为可视化报告")
}

const exportHeatmap = () => {
  window.open(`/api/teacher/activity/heatmap/export?classId=${searchModel.value.classId}`, '_blank')
}

const exportActiveRanking = () => {
  window.open(`/api/teacher/activity/ranking/export?classId=${searchModel.value.classId}`, '_blank')
}

// ==================== 生命周期 ====================
onMounted(async () => {
  const classes = await fetchClassList()
  classList.value = classes
  if (classes.length > 0) {
    searchModel.value.classId = classes[0].id
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
    searchModel.value.dateRange = [start, end]
    await refreshData()
  }
})

onUnmounted(() => {
  [trendChart, hourlyChart, heatmapChart, behaviorChart, studentDailyChart, studentBehaviorChart].forEach(chart => {
    chart?.dispose()
  })
})
</script>

<template>
  <div class="activity-monitor-container">

    <div class="filter-bar">
      <el-select size="large" v-model="searchModel.classId" placeholder="请选择班级" style="width: 140px"
        @change="handleFilterChange">
        <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
      </el-select>
      <el-date-picker v-model="searchModel.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
        end-placeholder="结束日期" :shortcuts="dateShortcuts" style="width: 260px" @change="handleFilterChange" />
      <el-select size="large" v-model="searchModel.granularity" style="width: 100px" @change="handleFilterChange">
        <el-option label="按天" value="day" />
        <el-option label="按周" value="week" />
        <el-option label="按月" value="month" />
      </el-select>
      <div class="filter-right">
        <el-button type="primary" @click="refreshData">
          <i class="fas fa-sync-alt"></i> 刷新
        </el-button>
        <el-button @click="exportActivityReport">
          <i class="fas fa-file-pdf"></i> 导出报告
        </el-button>
      </div>
    </div>

    <div ref="dashboardRef">
      <div class="activity-overview">
        <overview-card icon="fa-clock" iconColor="blue" label="人均日学习时长"
          :value="`${overviewStats.avgDailyDuration} min`">
          <template #content>
            <div class="overview-trend" :class="overviewStats.durationTrend > 0 ? 'up' : 'down'">
              <i :class="overviewStats.durationTrend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              {{ Math.abs(overviewStats.durationTrend) }}%
            </div>
          </template>
        </overview-card>
        <overview-card icon="fa-sign-in-alt" iconColor="green" label="人均日访问次数"
          :value="`${overviewStats.avgDailyVisits}`">
        </overview-card>
        <overview-card icon="fa-comments" iconColor="orange" label="人均日互动次数"
          :value="`${overviewStats.avgDailyInteractions}`">
        </overview-card>
        <overview-card icon="fa-user-check" iconColor="red" label="活跃率" :value="`${overviewStats.activeRate}%`">
          <template #content>
            <el-progress :percentage="overviewStats.activeRate" :stroke-width="6" :show-text="false" />
          </template>
        </overview-card>
        <overview-card icon="fa-hourglass-half" iconColor="purple" label="活跃高峰时段" :value="`${overviewStats.peakHour}`">
        </overview-card>
      </div>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card>
            <div class="chart-card">
              <div class="chart-header">
                <h3>活跃度趋势</h3>
                <div class="chart-actions">
                  <el-radio-group v-model="trendMetric" size="small" @change="updateTrendChart">
                    <el-radio-button label="duration">学习时长</el-radio-button>
                    <el-radio-button label="visits">访问次数</el-radio-button>
                    <el-radio-button label="interactions">互动次数</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <div id="trendChart" class="chart-container" style="height: 300px"></div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <div class="chart-card">
              <div class="chart-header">
                <h3>时段活跃分布</h3>
                <div class="chart-actions">
                  <el-radio-group v-model="hourlyType" size="small" @change="updateHourlyChart">
                    <el-radio-button label="bar">柱状图</el-radio-button>
                    <el-radio-button label="line">折线图</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <div id="hourlyChart" class="chart-container" style="height: 300px"></div>
              <div class="chart-footer">
                <span class="tip">💡 数据显示学生活跃高峰在 {{ peakHour }} 点</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row style="margin-top: 20px;">
        <el-col :span="24">
          <el-card>
            <div class="chart-card">
              <div class="chart-header">
                <h3>学生活跃度热力图</h3>
                <div class="chart-actions">
                  <el-radio-group v-model="heatmapMetric" size="small" @change="updateHeatmap">
                    <el-radio-button label="duration">学习时长</el-radio-button>
                    <el-radio-button label="visits">访问次数</el-radio-button>
                    <el-radio-button label="interactions">互动次数</el-radio-button>
                  </el-radio-group>
                  <el-button size="small" @click="exportHeatmap">
                    <i class="fas fa-download"></i> 导出
                  </el-button>
                </div>
              </div>
              <div id="heatmapChart" class="chart-container" style="height: 400px"></div>
              <div class="heatmap-legend">
                <span>活跃度等级：</span>
                <span><span class="legend-color low"></span> 低</span>
                <span><span class="legend-color medium"></span> 中</span>
                <span><span class="legend-color high"></span> 高</span>
                <span><span class="legend-color very-high"></span> 极高</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card>
            <div class="chart-card">
              <div class="chart-header">
                <h3><i class="fas fa-trophy" style="color: #e6a23c"></i> 活跃度排行榜 Top10</h3>
                <el-button size="small" @click="exportActiveRanking">导出排行</el-button>
              </div>
              <el-table :data="activeRanking" stripe style="width: 100%" max-height="360">
                <el-table-column prop="rank" label="排名" width="70" align="center">
                  <template #default="{ $index }">
                    <span class="rank-badge" :class="getRankClass($index)">{{ $index + 1 }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="studentName" label="姓名" width="100" />
                <el-table-column prop="studentNo" label="学号" width="100" />
                <el-table-column prop="totalDuration" label="总时长" width="100" sortable>
                  <template #default="{ row }">
                    <span class="duration-value">{{ row.totalDuration }}min</span>
                  </template>
                </el-table-column>
                <el-table-column prop="avgDailyDuration" label="日均时长" width="100">
                  <template #default="{ row }">
                    {{ row.avgDailyDuration }}min
                  </template>
                </el-table-column>
                <el-table-column prop="visitCount" label="访问次数" width="90" />
                <el-table-column prop="interactionCount" label="互动次数" width="90" />
                <el-table-column label="活跃等级" width="90">
                  <template #default="{ row }">
                    <el-tag :type="getActivityLevelType(row.activityLevel)" size="small">
                      {{ getActivityLevelText(row.activityLevel) }}
                    </el-tag>
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
                <h3><i class="fas fa-exclamation-triangle" style="color: #f56c6c"></i> 不活跃学生预警</h3>
              </div>
              <el-table :data="inactiveStudents" stripe style="width: 100%" max-height="360">
                <el-table-column prop="studentName" label="姓名" width="100" />
                <el-table-column prop="studentNo" label="学号" width="100" />
                <el-table-column prop="totalDuration" label="总时长" width="100">
                  <template #default="{ row }">
                    <span class="inactive-value">{{ row.totalDuration }}min</span>
                  </template>
                </el-table-column>
                <el-table-column prop="lastActiveTime" label="最后活跃时间" width="140" />
                <el-table-column prop="inactiveDays" label="不活跃天数" width="100">
                  <template #default="{ row }">
                    <span class="inactive-days">{{ row.inactiveDays }}天</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button link type="primary" size="small" @click="viewStudentActivity(row)">
                      查看详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="warning-tip" v-if="inactiveStudents.length > 0">
                <i class="fas fa-bell"></i>
                <span>建议对以上 {{ inactiveStudents.length }} 名学生进行关注和沟通</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row style="margin-top: 20px;">
        <el-col :span="24">
          <el-card>
            <div class="chart-card">
              <div class="chart-header">
                <h3>学习行为分析</h3>
                <div class="chart-actions">
                  <el-radio-group v-model="behaviorMetric" size="small" @change="updateBehaviorChart">
                    <el-radio-button label="video">视频观看</el-radio-button>
                    <el-radio-button label="homework">作业提交</el-radio-button>
                    <el-radio-button label="discussion">讨论互动</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <div id="behaviorChart" class="chart-container" style="height: 300px"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-drawer v-model="studentDetailVisible" :title="`活跃度详情 - ${currentStudent?.studentName}`" direction="rtl"
      size="500px">
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
          <stat-item :value="`${currentStudent.totalDuration}min`" label="总学习时长" />
          <stat-item :value="`${currentStudent.avgDailyDuration}min`" label="日均时长" />
          <stat-item :value="currentStudent.visitCount" label="总访问次数" />
          <stat-item :value="currentStudent.interactionCount" label="互动次数" />
        </div>

        <div class="detail-charts">
          <h4>每日活跃趋势</h4>
          <div id="studentDailyChart" style="height: 200px"></div>
        </div>

        <div class="detail-charts">
          <h4>学习行为分布</h4>
          <div id="studentBehaviorChart" style="height: 200px"></div>
        </div>

      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
.activity-monitor-container {
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

    .filter-right {
      margin-left: auto;
      display: flex;
      gap: 12px;
    }
  }

  .activity-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 24px;

    .overview-trend {
      font-size: 12px;
      margin-top: 4px;

      &.up {
        color: #67c23a;
      }

      &.down {
        color: #f56c6c;
      }
    }
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
      }

      .chart-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    .chart-container {
      width: 100%;
      min-height: 300px;
    }

    .chart-footer {
      margin-top: 12px;
      text-align: center;
      font-size: 12px;
      color: #8b9bb0;
    }

    /* 热力图图例 */
    .heatmap-legend {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 16px;
      font-size: 12px;
      color: #5f6b7a;

      .legend-color {
        display: inline-block;
        width: 20px;
        height: 12px;
        border-radius: 2px;
        margin-right: 4px;
        vertical-align: middle;

        &.low {
          background: #b3cde0;
        }

        &.medium {
          background: #5f9bc0;
        }

        &.high {
          background: #1d4e7c;
        }

        &.very-high {
          background: #0a2f4a;
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

    }
  }
}

.duration-value {
  font-weight: 500;
  color: #409eff;
}

.inactive-value {
  color: #f56c6c;
  font-weight: 500;
}

.inactive-days {
  color: #f56c6c;
  font-weight: bold;
}

.warning-tip {
  margin-top: 16px;
  padding: 12px;
  background: #fff3e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e6a23c;
  font-size: 13px;
}

/* 学生详情抽屉 */
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
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 24px;
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

  .activity-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>