<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { exportToPDF } from '@/utils/export'
import StatCard from './component/stat-card.vue'

// ==================== 响应式数据 ====================
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

// 统计数据
const overviewStats = reactive({
  avgScore: 0,
  passRate: 0,
  excellentRate: 0,
  homeworkCompletion: 0,
  scoreTrend: 0
})

// 知识点数据
const knowledgePoints = ref([])
const weakKnowledgePoints = ref([])

// 成绩趋势数据
const trendData = ref([])

// 班级对比数据
const classCompareData = ref([])


// 散点图数据
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
      const start = new Date(new Date().getFullYear(), 2, 1) // 3月1日
      return [start, end]
    }
  }
]

// ==================== 辅助函数 ====================
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


// ==================== API 调用 ====================
// 获取课程列表
const fetchCourseList = async () => {
  // GET /api/teacher/courses
  await new Promise(resolve => setTimeout(resolve, 300))
  return [
    { id: 1, name: '数学', description: '高中数学课程，涵盖函数、几何、概率等', icon: 'calculator' },
    { id: 2, name: '语文', description: '高中语文课程，涵盖文言文、现代文、写作等', icon: 'book' },
    { id: 3, name: '英语', description: '高中英语课程，涵盖语法、阅读、写作等', icon: 'language' },
    { id: 4, name: '物理', description: '高中物理课程，涵盖力学、电磁学等', icon: 'flask' },
    { id: 5, name: '化学', description: '高中化学课程，涵盖无机、有机化学等', icon: 'atom' }
  ]
}

// 获取班级列表
const fetchClassList = async () => {
  // GET /api/teacher/classes
  return [
    { id: 1, name: '高三(1)班', grade: '高三', studentCount: 45 },
    { id: 2, name: '高三(2)班', grade: '高三', studentCount: 42 },
    { id: 3, name: '高三(3)班', grade: '高三', studentCount: 38 },
    { id: 4, name: '高三(4)班', grade: '高三', studentCount: 44 }
  ]
}

// 获取课程概览统计
const fetchCourseOverview = async () => {
  // GET /api/teacher/course/{courseId}/overview
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    avgScore: 78.5,
    passRate: 85,
    excellentRate: 32,
    homeworkCompletion: 91,
    scoreTrend: 5.2
  }
}

// 获取知识点掌握数据
const fetchKnowledgePoints = async () => {
  // GET /api/teacher/course/{courseId}/knowledge-mastery
  await new Promise(resolve => setTimeout(resolve, 400))
  return {
    knowledgePoints: [
      { name: '函数与导数', mastery: 82, errorRate: 18, questionCount: 12, avgScoreRate: 82 },
      { name: '三角函数', mastery: 68, errorRate: 32, questionCount: 10, avgScoreRate: 68 },
      { name: '数列', mastery: 75, errorRate: 25, questionCount: 8, avgScoreRate: 75 },
      { name: '立体几何', mastery: 58, errorRate: 42, questionCount: 15, avgScoreRate: 58 },
      { name: '解析几何', mastery: 62, errorRate: 38, questionCount: 12, avgScoreRate: 62 },
      { name: '概率统计', mastery: 85, errorRate: 15, questionCount: 8, avgScoreRate: 85 },
      { name: '复数', mastery: 90, errorRate: 10, questionCount: 5, avgScoreRate: 90 }
    ],
    weakPoints: [
      { name: '立体几何', mastery: 58, errorRate: 42, rank: 1 },
      { name: '解析几何', mastery: 62, errorRate: 38, rank: 2 },
      { name: '三角函数', mastery: 68, errorRate: 32, rank: 3 },
      { name: '数列', mastery: 75, errorRate: 25, rank: 4 },
      { name: '函数与导数', mastery: 82, errorRate: 18, rank: 5 }
    ]
  }
}

// 获取成绩趋势数据
const fetchTrendData = async () => {
  // GET /api/teacher/course/{courseId}/trend
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    exams: ['月考1', '月考2', '期中', '月考3', '期末'],
    avgScore: [72, 75, 78, 76, 82],
    highestScore: [95, 96, 98, 97, 99],
    passRate: [68, 72, 78, 75, 85]
  }
}

// 获取班级对比数据
const fetchClassCompare = async () => {
  // GET /api/teacher/course/{courseId}/class-compare
  await new Promise(resolve => setTimeout(resolve, 300))
  return [
    { className: '高三(1)班', avgScore: 78.5, passRate: 85, excellentRate: 32, rank: 1 },
    { className: '高三(2)班', avgScore: 72.3, passRate: 76, excellentRate: 24, rank: 3 },
    { className: '高三(3)班', avgScore: 75.8, passRate: 81, excellentRate: 28, rank: 2 },
    { className: '高三(4)班', avgScore: 70.2, passRate: 72, excellentRate: 20, rank: 4 }
  ]
}

// 获取散点图数据
const fetchScatterData = async () => {
  // GET /api/teacher/course/{courseId}/scatter
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    students: ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'],
    scores: [92, 78, 85, 62, 88, 45, 95, 72],
    homeworkRate: [95, 85, 90, 70, 92, 60, 98, 80],
    improvement: [5, -2, 8, -5, 3, -10, 12, 0]
  }
}

// ==================== 图表初始化 ====================
// 知识点掌握图表
const initKnowledgeChart = async () => {
  const data = await fetchKnowledgePoints()
  knowledgePoints.value = data.knowledgePoints
  weakKnowledgePoints.value = data.weakPoints

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

// 成绩趋势图表
const initTrendChart = async () => {
  const data = await fetchTrendData()
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

// 班级对比图表
const initCompareChart = async () => {
  const data = await fetchClassCompare()
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
        color: metric.color,
        label: { show: true, position: 'top', formatter: '{c}' }
      }
    }]
  })
}

// 散点图
const initScatterPlot = async () => {
  const data = await fetchScatterData()
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

// ==================== 事件处理 ====================
const handleFilterChange = () => {
  refreshData()
}

const refreshData = async () => {
  loading.value = true
  try {
    const overview = await fetchCourseOverview()
    Object.assign(overviewStats, overview)

    await Promise.all([
      initKnowledgeChart(),
      initTrendChart(),
      initCompareChart(),
      initScatterPlot()
    ])
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
  exportToPDF(containerRef.value, `${searchModel.value.classId} 教学看板`)
}


// ==================== 生命周期 ====================
onMounted(async () => {
  const [courses, classes] = await Promise.all([
    fetchCourseList(),
    fetchClassList()
  ])
  courseList.value = courses
  classList.value = classes

  if (courses.length > 0) {
    searchModel.value.courseId = courses[0].id
    currentCourse.value = courses[0]
    await refreshData()
  }
})

onUnmounted(() => {
  [knowledgeChart, trendChart, classCompareChart, scatterChart].forEach(chart => {
    chart?.dispose()
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