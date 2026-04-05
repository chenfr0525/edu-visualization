<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { exportToPDF } from '@/utils/export'
import StatCard from './component/stat-card.vue'
import { tDashboardApi, tCourseApi } from '@/api/index.js'
import { useAuthStore } from '@/stores/index.js'

const authStore = useAuthStore()
const loading = ref(false)
const containerRef = ref(null)

// 筛选条件
const searchModel = ref({
  courseId: '',
  classId: '',
  dateRange: [],
})

// 视图切换
const knowledgeView = ref('radar')
const trendMetric = ref('avgScore')
const compareMetric = ref('avgScore')
const scatterMetric = ref('score')

// 数据列表
const courseList = ref([])
const classList = ref([])
const currentCourse = ref(null)

const overviewStats = reactive({
  avgScore: 0,
  passRate: 0,
  excellentRate: 0,
  homeworkCompletion: 0,
  scoreTrend: 0
})

const knowledgePoints = ref([])
const weakKnowledgePoints = ref([])

const trendData = ref([])
const classCompareData = ref([])
const scatterData = ref([])

// 图表实例
let knowledgeChart = null
let trendChart = null
let classCompareChart = null
let scatterChart = null

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

const getRankClass = (index) => {
  if (index === 0) return 'rank-first'
  if (index === 1) return 'rank-second'
  if (index === 2) return 'rank-third'
  return ''
}

const getErrorRateColor = (rate) => {
  if (rate >= 70) return '#f56c6c'
  if (rate >= 50) return '#e6a23c'
  if (rate >= 30) return '#409eff'
  return '#67c23a'
}

const getMasteryClass = (level) => {
  if (level >= 80) return 'mastery-high'
  if (level >= 60) return 'mastery-medium'
  return 'mastery-low'
}

const fetchCourseList = async () => {
  try {
    const res = await tCourseApi.getCourseList(authStore.userId)
    if (res && res.data) {
      courseList.value = res.data
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
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

const fetchCourseOverview = async () => {
  if (!searchModel.value.courseId) return null
  try {
    const res = await tCourseApi.getCourseOverview(searchModel.value.courseId)
    if (res && res.data) {
      return res.data
    }
  } catch (error) {
    console.error('获取课程概览失败:', error)
  }
  return null
}

const fetchKnowledgePoints = async () => {
  if (!searchModel.value.courseId) return null
  try {
    const res = await tCourseApi.getKnowledgeMastery(searchModel.value.courseId)
    if (res && res.data) {
      return res.data
    }
  } catch (error) {
    console.error('获取知识点数据失败:', error)
  }
  return null
}

const fetchTrendData = async () => {
  if (!searchModel.value.courseId) return null
  try {
    const res = await tCourseApi.getCourseTrend(searchModel.value.courseId)
    if (res && res.data) {
      return res.data
    }
  } catch (error) {
    console.error('获取趋势数据失败:', error)
  }
  return null
}

const fetchClassCompare = async () => {
  if (!searchModel.value.courseId) return null
  try {
    const res = await tCourseApi.getClassCompare(searchModel.value.courseId)
    if (res && res.data) {
      return res.data
    }
  } catch (error) {
    console.error('获取班级对比失败:', error)
  }
  return null
}

const fetchScatterData = async () => {
  if (!searchModel.value.courseId) return null
  try {
    const res = await tCourseApi.getScatterData(searchModel.value.courseId)
    if (res && res.data) {
      return res.data
    }
  } catch (error) {
    console.error('获取散点图数据失败:', error)
  }
  return null
}

const initKnowledgeChart = async () => {
  const data = await fetchKnowledgePoints()
  if (!data) return

  knowledgePoints.value = data.knowledgePoints || []
  weakKnowledgePoints.value = data.weakPoints || []

  const chartDom = document.getElementById('knowledgeRadarChart')
  if (!chartDom) return
  if (knowledgeChart) knowledgeChart.dispose()
  knowledgeChart = echarts.init(chartDom)

  if (knowledgeView.value === 'radar') {
    knowledgeChart.setOption({
      tooltip: { trigger: 'item' },
      radar: {
        indicator: knowledgePoints.value.map(kp => ({
          name: kp.name,
          max: 100
        })),
        shape: 'circle',
        center: ['50%', '50%'],
        radius: '65%',
        name: { textStyle: { fontSize: 11, color: '#1e293b' } }
      },
      series: [{
        type: 'radar',
        data: [{ value: knowledgePoints.value.map(kp => kp.mastery), name: '掌握度' }],
        areaStyle: { color: 'rgba(64, 158, 255, 0.2)' },
        lineStyle: { color: '#409eff', width: 2 },
        itemStyle: { color: '#409eff' }
      }]
    })
  } else {
    knowledgeChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '12%', containLabel: true },
      xAxis: { type: 'value', name: '掌握度(%)', max: 100 },
      yAxis: { type: 'category', data: knowledgePoints.value.map(kp => kp.name) },
      series: [{
        type: 'bar',
        data: knowledgePoints.value.map(kp => kp.mastery),
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: (params) => {
            const value = params.data
            if (value >= 80) return '#67c23a'
            if (value >= 60) return '#409eff'
            return '#f56c6c'
          }
        },
        label: { show: true, position: 'right', formatter: '{c}%' }
      }]
    })
  }
}

const initTrendChart = async () => {
  const data = await fetchTrendData()
  if (!data) return

  trendData.value = data

  const chartDom = document.getElementById('trendChart')
  if (!chartDom) return
  if (trendChart) trendChart.dispose()
  trendChart = echarts.init(chartDom)

  const metricMap = {
    avgScore: { name: '平均分', data: data.avgScore, color: '#409eff' },
    highestScore: { name: '最高分', data: data.highestScore, color: '#e6a23c' },
    passRate: { name: '及格率(%)', data: data.passRate, color: '#67c23a' }
  }
  const metric = metricMap[trendMetric.value]

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.exams },
    yAxis: { type: 'value', name: metric.name },
    series: [{
      type: 'line',
      data: metric.data,
      smooth: true,
      lineStyle: { color: metric.color, width: 3 },
      areaStyle: { opacity: 0.1, color: metric.color },
      symbol: 'circle',
      symbolSize: 8,
      label: { show: true, position: 'top', formatter: '{c}' }
    }]
  })
}

const initCompareChart = async () => {
  const data = await fetchClassCompare()
  if (!data) return

  classCompareData.value = data

  const chartDom = document.getElementById('classCompareChart')
  if (!chartDom) return
  if (classCompareChart) classCompareChart.dispose()
  classCompareChart = echarts.init(chartDom)

  const metricMap = {
    avgScore: { name: '平均分', data: data.map(c => c.avgScore), color: '#409eff' },
    passRate: { name: '及格率(%)', data: data.map(c => c.passRate), color: '#67c23a' },
    excellentRate: { name: '优秀率(%)', data: data.map(c => c.excellentRate), color: '#e6a23c' }
  }
  const metric = metricMap[compareMetric.value]

  classCompareChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: data.map(c => c.className), axisLabel: { rotate: 15 } },
    yAxis: { type: 'value', name: metric.name },
    series: [{
      type: 'bar',
      data: metric.data,
      itemStyle: {
        borderRadius: [8, 8, 0, 0],
        color: metric.color
      },
      label: { show: true, position: 'top', formatter: '{c}' }
    }]
  })
}

const initScatterPlot = async () => {
  const data = await fetchScatterData()
  if (!data) return

  scatterData.value = data

  const chartDom = document.getElementById('scatterPlotChart')
  if (!chartDom) return
  if (scatterChart) scatterChart.dispose()
  scatterChart = echarts.init(chartDom)

  let seriesData = []
  let xAxisName = ''
  let yAxisName = ''

  if (scatterMetric.value === 'score') {
    seriesData = data.students.map((name, i) => ({
      name,
      value: [data.scores[i], data.homeworkRate[i]]
    }))
    xAxisName = '成绩'
    yAxisName = '作业完成率(%)'
  } else {
    seriesData = data.students.map((name, i) => ({
      name,
      value: [data.scores[i], data.improvement[i]]
    }))
    xAxisName = '成绩'
    yAxisName = '进步幅度'
  }

  scatterChart.setOption({
    tooltip: { formatter: (params) => `${params.data.name}<br/>${xAxisName}: ${params.data.value[0]}<br/>${yAxisName}: ${params.data.value[1]}` },
    xAxis: { name: xAxisName, nameLocation: 'middle', nameGap: 35 },
    yAxis: { name: yAxisName, nameLocation: 'middle', nameGap: 35 },
    series: [{
      type: 'scatter',
      data: seriesData,
      symbolSize: 12,
      itemStyle: { color: '#409eff' },
      label: { show: true, formatter: (params) => params.data.name, position: 'right', fontSize: 10 }
    }]
  })
}

const handleFilterChange = () => {
  refreshData()
}

const refreshData = async () => {
  loading.value = true
  try {
    const overview = await fetchCourseOverview()
    if (overview) {
      Object.assign(overviewStats, overview)
    }

    await Promise.all([
      initKnowledgeChart(),
      initTrendChart(),
      initCompareChart(),
      initScatterPlot()
    ])
  } catch (error) {
    console.error('刷新数据失败:', error)
  } finally {
    loading.value = false
  }
}

const updateKnowledgeChart = () => {
  initKnowledgeChart()
}

const updateTrendChart = () => {
  initTrendChart()
}

const updateCompareChart = () => {
  initCompareChart()
}

const updateScatterPlot = () => {
  initScatterPlot()
}

const exportReport = () => {
  exportToPDF(containerRef.value, `${currentCourse.value?.name || '课程'}_分析报告`)
}

onMounted(async () => {
  await Promise.all([
    fetchCourseList(),
    fetchClassList()
  ])

  if (courseList.value.length > 0) {
    searchModel.value.courseId = courseList.value[0].id
    currentCourse.value = courseList.value[0]
    await refreshData()
  }
})

onUnmounted(() => {
  [knowledgeChart, trendChart, classCompareChart, scatterChart].forEach(chart => {
    if (chart) chart.dispose()
  })
})
</script>

<template>
  <div class="course-analysis-container" ref="containerRef">
    <div class="filter-bar">
      <div class="filter-left">
        <el-select size="large" v-model="searchModel.courseId" placeholder="请选择课程" style="width: 140px"
          @change="handleFilterChange">
          <el-option v-for="course in courseList" :key="course.id" :label="course.name" :value="course.id" />
        </el-select>
        <el-select size="large" v-model="searchModel.classId" placeholder="全部班级" clearable style="width: 140px"
          @change="handleFilterChange">
          <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
        </el-select>
        <el-date-picker v-model="searchModel.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" :shortcuts="dateShortcuts" style="width: 260px" @change="handleFilterChange" />
      </div>
      <div class="filter-right">
        <el-button type="primary" @click="refreshData">
          <i class="fas fa-sync-alt"></i> 刷新
        </el-button>
        <el-button @click="exportReport">
          <i class="fas fa-file-pdf"></i> 导出报告
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <stat-card :value="overviewStats.avgScore" label="平均分">
          <template #content>
            <div class="stat-trend" :class="overviewStats.scoreTrend > 0 ? 'up' : 'down'">
              <i :class="overviewStats.scoreTrend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              {{ Math.abs(overviewStats.scoreTrend) }}%
            </div>
          </template>
        </stat-card>
      </el-col>
      <el-col :span="6">
        <stat-card :rate="overviewStats.passRate" label="及格率">
          <template #content>
            <el-progress :percentage="overviewStats.passRate" :stroke-width="6" :show-text="false" />
          </template>
        </stat-card>
      </el-col>
      <el-col :span="6">
        <stat-card :rate="overviewStats.excellentRate" label="优秀率">
          <template #content>
            <el-progress :percentage="overviewStats.excellentRate" :stroke-width="6" :show-text="false" />
          </template>
        </stat-card>
      </el-col>
      <el-col :span="6">
        <stat-card :rate="overviewStats.homeworkCompletion" label="作业提交率">
          <template #content>
            <el-progress :percentage="overviewStats.homeworkCompletion" :stroke-width="6" :show-text="false" />
          </template>
        </stat-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <div class="chart-card">
            <div class="chart-header">
              <h3>知识点掌握雷达图</h3>
              <div class="chart-actions">
                <el-radio-group v-model="knowledgeView" size="small" @change="updateKnowledgeChart">
                  <el-radio-button label="radar">雷达图</el-radio-button>
                  <el-radio-button label="bar">条形图</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div id="knowledgeRadarChart" class="chart-container" style="height: 340px"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div class="chart-card">
            <div class="chart-header">
              <h3>成绩趋势分析</h3>
              <div class="chart-actions">
                <el-select v-model="trendMetric" size="small" style="width: 100px" @change="updateTrendChart">
                  <el-option label="平均分" value="avgScore" />
                  <el-option label="最高分" value="highestScore" />
                  <el-option label="及格率" value="passRate" />
                </el-select>
              </div>
            </div>
            <div id="trendChart" class="chart-container" style="height: 340px"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <div class="chart-card">
            <div class="chart-header">
              <h3>班级成绩对比</h3>
              <div class="chart-actions">
                <el-radio-group v-model="compareMetric" size="small" @change="updateCompareChart">
                  <el-radio-button label="avgScore">平均分</el-radio-button>
                  <el-radio-button label="passRate">及格率</el-radio-button>
                  <el-radio-button label="excellentRate">优秀率</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div id="classCompareChart" class="chart-container" style="height: 300px"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div class="chart-card">
            <div class="chart-header">
              <h3>薄弱知识点排行 <span class="subtitle">(按错误率排序)</span></h3>
            </div>
            <el-table :data="weakKnowledgePoints" stripe style="width: 100%" max-height="280">
              <el-table-column prop="rank" label="排名" width="60" align="center">
                <template #default="{ $index }">
                  <span :class="getRankClass($index)">{{ $index + 1 }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="知识点" min-width="140" show-overflow-tooltip />
              <el-table-column prop="errorRate" label="错误率" width="100">
                <template #default="{ row }">
                  <el-progress :percentage="row.errorRate" :stroke-width="8"
                    :color="getErrorRateColor(row.errorRate)" />
                </template>
              </el-table-column>
              <el-table-column prop="masteryLevel" label="掌握度" width="80">
                <template #default="{ row }">
                  <span :class="getMasteryClass(row.masteryLevel)">{{ row.masteryLevel }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <div class="chart-card">
            <div class="chart-header">
              <h3>学生成绩分布散点图</h3>
              <div class="chart-actions">
                <el-radio-group v-model="scatterMetric" size="small" @change="updateScatterPlot">
                  <el-radio-button label="score">成绩 vs 作业完成率</el-radio-button>
                  <el-radio-button label="trend">成绩 vs 进步幅度</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div id="scatterPlotChart" class="chart-container" style="height: 360px"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.course-analysis-container {
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
      gap: 12px;
      flex-wrap: wrap;
    }

    .filter-right {
      margin-left: auto;
      display: flex;
      gap: 12px;
    }
  }

  .stat-trend {
    font-size: 12px;
    display: inline-block;
    padding: 2px 8px;
    border-radius: 20px;

    &.up {
      color: #67c23a;
      background: #e8f5e9;
    }

    &.down {
      color: #f56c6c;
      background: #ffebee;
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

        .subtitle {
          font-size: 0.75rem;
          font-weight: normal;
          color: #5f6b7a;
          margin-left: 6px;
        }
      }

      .chart-actions {
        display: flex;
        align-items: center;
        gap: 12px;

        i {
          font-size: 1rem;
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.2s;

          &:hover {
            color: #1d4e7c;
          }
        }
      }
    }

    .chart-container {
      width: 100%;
      min-height: 300px;
    }

    .rank-first {
      background: #fdf6e3;
      color: #e6a23c;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 20px;
      display: inline-block;
    }

    .rank-second {
      background: #e8f5e9;
      color: #67c23a;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 20px;
      display: inline-block;
    }

    .rank-third {
      background: #e6f4ff;
      color: #409eff;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 20px;
      display: inline-block;
    }

    .mastery-high {
      color: #67c23a;
      font-weight: bold;
    }

    .mastery-medium {
      color: #409eff;
    }

    .mastery-low {
      color: #f56c6c;
      font-weight: bold;
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
}
</style>