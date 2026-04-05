<script setup>
import { ref, onMounted } from 'vue'
import EChart from '@/components/EChart.vue'
import 'echarts-wordcloud'
import { exportToCSV, exportToImage, exportToPDF } from '@/utils/export'
import StatBox from '@/views/student/dashboard/component/stat-box.vue'
import { tDashboardApi, tExamApi } from '@/api/index.js'
import { useAuthStore } from '@/stores/index.js'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'

const containerRef = ref(null)
const loading = ref(false)
const authStore = useAuthStore()

const searchModel = ref({
  class: '',
  exam: '',
  dateRange: []
})
const classList = ref([])
const examList = ref([])
const stats = ref({
  studentCount: 0,
  avgScore: 0,
  passRate: 0,
  pendingHomework: 0
})
const knowledgeView = ref('bar')
const heatmapView = ref('student')
const gradeEchartData = ref({})
const errorChartData = ref({})
const weaknessChartData = ref({})
const heatmapChartData = ref({})


const fetchClassList = async () => {
  const res = await tDashboardApi.getClassList(authStore.userId)
  if (res && res.data) {
    classList.value = res.data
    if (res.data.length) {
      searchModel.value.class = res.data[0].id
      await fetchExamList(searchModel.value.class)
    }
  }
}

const fetchExamList = async (classId) => {
  const res = await tDashboardApi.getExamList(classId)
  if (res && res.data) {
    examList.value = res.data
    if (res.data.length) {
      searchModel.value.exam = res.data[0].id
    }
  }
}

const fetchStats = async () => {
  if (!searchModel.value.class) return
  const res = await tDashboardApi.getStats(searchModel.value.class)
  if (res && res.data) {
    stats.value = res.data
  }
}

// 成绩分布数据
const fetchGradeDistribution = async () => {
  if (!searchModel.value.class) return
  const res = await tDashboardApi.getGradeDistribution(
    searchModel.value.class,
    searchModel.value.exam
  )
  if (res && res.data) {
    return res.data
  }
  return { categories: [], data: [], colors: [] }
}

// 高频错题数据
const fetchHighFrequencyErrors = async () => {
  if (!searchModel.value.class) return
  const res = await tDashboardApi.getHighFrequencyErrors(
    searchModel.value.class,
    searchModel.value.exam
  )
  if (res && res.data) {
    return res.data
  }
  return { questions: [], errorRates: [], questionIds: [] }
}

// 薄弱知识点数据
const fetchWeakKnowledge = async () => {
  if (!searchModel.value.class) return
  const res = await tDashboardApi.getWeakKnowledge(searchModel.value.class)
  if (res && res.data) {
    return res.data
  }
  return { knowledgePoints: [], errorRates: [], masteryLevels: [] }
}

// 活跃度热力图数据
const fetchActivityHeatmap = async () => {
  if (!searchModel.value.class) return
  const res = await tDashboardApi.getActivityHeatmap(
    searchModel.value.class,
    heatmapView.value
  )
  if (res && res.data) {
    return res.data
  }
  return { type: 'student', students: [], dates: [], data: [] }
}

const initGradeChart = async () => {
  const data = await fetchGradeDistribution()
  if (!data.categories?.length) return
  
  gradeEchartData.value = {
    title: { text: '班级成绩分布直方图' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const percent = data.percentages?.[params[0].dataIndex] || 0
        return `${params[0].name}<br/>人数: ${params[0].value} 人<br/>占比: ${percent}%`
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.categories, axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', name: '人数', nameLocation: 'middle', nameGap: 40 },
    series: [{
      type: 'bar',
      data: data.data,
      itemStyle: { borderRadius: [8, 8, 0, 0], color: (params) => data.colors[params.dataIndex] },
      label: { show: true, position: 'top', fontWeight: 'bold' }
    }]
  }
}

const initErrorChart = async () => {
  const data = await fetchHighFrequencyErrors()
  if (!data.questions?.length) return
  
  errorChartData.value = {
    title: { text: '高频错题排行' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => `${params[0].name}<br/>错误率: ${params[0].value}%<br/>建议: 重点讲解`
    },
    grid: { left: '12%', containLabel: true },
    xAxis: { type: 'value', name: '错误率(%)', max: 100, axisLabel: { formatter: '{value}%' } },
    yAxis: { type: 'category', data: data.questions, axisLabel: { fontSize: 12 } },
    series: [{
      type: 'bar',
      data: data.errorRates,
      itemStyle: { borderRadius: [0, 8, 8, 0], color: '#e6a23c' },
      label: { show: true, position: 'right', formatter: '{c}%' }
    }]
  }
}

const initKnowledgeChart = async () => {
  const data = await fetchWeakKnowledge()
  if (!data.knowledgePoints?.length) return
  
  if (knowledgeView.value === 'bar') {
    weaknessChartData.value = {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => `${params[0].name}<br/>错误率: ${params[0].value}%<br/>掌握度: ${100 - params[0].value}%`
      },
      grid: { left: '12%', containLabel: true },
      xAxis: { type: 'value', name: '错误率 (%)', max: 100 },
      yAxis: { type: 'category', data: data.knowledgePoints, axisLabel: { fontSize: 12 } },
      series: [{
        type: 'bar',
        data: data.errorRates,
        itemStyle: { borderRadius: [0, 8, 8, 0], color: '#f56c6c' },
        label: { show: true, position: 'right', formatter: '{c}%' }
      }]
    }
  } else {
    weaknessChartData.value = {
      title: { text: '知识点错误率词云', left: 'center', top: 5 },
      tooltip: { trigger: 'item', formatter: (params) => `${params.name}<br/>错误率: ${params.value}%` },
      series: [{
        type: 'wordCloud',
        shape: 'star',
        width: '90%',
        height: '85%',
        sizeRange: [16, 50],
        rotationRange: [-45, 45],
        textStyle: {
          fontFamily: 'sans-serif',
          color: (value) => {
            const errorRate = value.data[1]
            if (errorRate > 60) return '#f56c6c'
            if (errorRate > 30) return '#e6a23c'
            return '#409eff'
          }
        },
        data: data.knowledgePoints.map((name, i) => ({ name, value: data.errorRates[i] }))
      }]
    }
  }
}

const initHeatmapChart = async () => {
  const data = await fetchActivityHeatmap()
  if (!data) return

  if (heatmapView.value === 'student' && data.type === 'student') {
    const xAxisData = data.dates
    const yAxisData = data.students
    const seriesData = []
    data.data.forEach((row, i) => {
      row.forEach((value, j) => {
        seriesData.push([j, i, value])
      })
    })
    heatmapChartData.value = {
      tooltip: {
        position: 'top',
        formatter: (params) => `${yAxisData[params.value[1]]}<br/>${xAxisData[params.value[0]]}<br/>学习时长: ${params.value[2]}分钟`
      },
      xAxis: { type: 'category', data: xAxisData, splitArea: { show: true } },
      yAxis: { type: 'category', data: yAxisData, splitArea: { show: true } },
      visualMap: {
        min: 0, max: 100, calculable: true, orient: 'horizontal',
        left: 'center', bottom: 0,
        inRange: { color: ['#b3cde0', '#5f9bc0', '#1d4e7c'] }
      },
      series: [{ type: 'heatmap', data: seriesData, label: { show: false } }]
    }
  } else {
    heatmapChartData.value = {
      tooltip: { trigger: 'axis' },
      legend: { data: data.metrics },
      xAxis: { type: 'category', data: data.dates },
      yAxis: [
        { type: 'value', name: '访问次数', position: 'left' },
        { type: 'value', name: '学习时长(min)', position: 'right' }
      ],
      series: [
        { name: data.metrics[0], type: 'line', data: data.data[0], smooth: true, lineStyle: { color: '#409eff' } },
        { name: data.metrics[1], type: 'line', data: data.data[1], smooth: true, yAxisIndex: 1, lineStyle: { color: '#67c23a' } },
        { name: data.metrics[2], type: 'bar', data: data.data[2], barWidth: '30%', itemStyle: { color: '#e6a23c', borderRadius: [4, 4, 0, 0] } }
      ]
    }
  }
}

const handleExportImage = () => {
  exportToImage(containerRef.value, '教学看板')
}

const handleExportPDF = () => {
  exportToPDF(containerRef.value, `${searchModel.class} 教学看板`)
}

const exportDataCSV = async () => {
  const gradeData = await fetchGradeDistribution()
  const errorData = await fetchHighFrequencyErrors()
  const knowledgeData = await fetchWeakKnowledge()

  let csvContent = '=== 成绩分布 ===\n'
  csvContent += '等级,人数\n'
  gradeData.categories?.forEach((cat, i) => {
    csvContent += `${cat},${gradeData.data[i]}\n`
  })
  csvContent += '\n=== 高频错题 ===\n'
  csvContent += '题目,错误率(%)\n'
  errorData.questions?.forEach((q, i) => {
    csvContent += `${q},${errorData.errorRates[i]}\n`
  })
  csvContent += '\n=== 薄弱知识点 ===\n'
  csvContent += '知识点,错误率(%)\n'
  knowledgeData.knowledgePoints?.forEach((kp, i) => {
    csvContent += `${kp},${knowledgeData.errorRates[i]}\n`
  })
  exportToCSV(csvContent, '教学看板数据')
}

const handleFilterChange = async () => {
  if (searchModel.value.class) {
    await fetchExamList(searchModel.value.class)
    refreshData()
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchStats(),
      initGradeChart(),
      initErrorChart(),
      initKnowledgeChart(),
      initHeatmapChart()
    ])
    ElMessage.success('数据已刷新')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

const updateKnowledgeChart = () => {
  initKnowledgeChart()
}

const updateHeatmapChart = () => {
  initHeatmapChart()
}

onMounted(async () => {
  await fetchClassList()
  await refreshData()
})
</script>

<template>
  <div class="dashboard-container" ref="containerRef">
    <div class="container-header">
      <el-form inline label-width="80" :model="searchModel" class="select-box">
        <el-form-item label="班级" prop="class">
          <el-select size="large" placeholder="请选择班级" style="width: 240px" v-model="searchModel.class"
            @change="handleFilterChange">
            <el-option v-for="item in classList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试" prop="exam">
          <el-select size="large" placeholder="请选择考试" style="width: 240px" v-model="searchModel.exam"  @change="handleFilterChange">
            <el-option v-for="item in examList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" prop="dateRange">
          <el-date-picker v-model="searchModel.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" @change="handleFilterChange" />
        </el-form-item>
      </el-form>
      <div class="export-btns">
        <el-button size="large" type="success" @click="refreshData" style="margin-right: 10px;">搜索
          <template #icon>
            <i class="fas fa-sync-alt"></i>
          </template>
        </el-button>
        <el-button-group>
          <el-button size="large" type="primary" :icon="Picture" @click="handleExportImage">导出图片</el-button>
          <el-button size="large" @click="handleExportPDF">导出PDF
            <template #icon>
              <i class="fas fa-file-pdf"></i>
            </template>
          </el-button>
          <el-button size="large" type="success" @click="exportDataCSV">
            <i class="fas fa-database"></i> 导出原始数据(CSV)
          </el-button>
        </el-button-group>
      </div>
    </div>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <StatBox icon="fa-users" title="班级人数" :stat-num="45" />
      </el-col>
      <el-col :span="6">
        <StatBox icon="fa-chart-line" title="平均分" :stat-num="82.5" />
      </el-col>
      <el-col :span="6">
        <StatBox icon="fa-star" title="及格率" :rate="98" />
      </el-col>
      <el-col :span="6">
        <StatBox icon="fa-tasks" title="待批改作业" :stat-num="14" />
      </el-col>
    </el-row>

    <!-- 第一行：成绩分布 + 高频错题 -->
    <el-row :gutter="20" style="margin-top: 20px;" v-loading="loading">
      <el-col :span="12">
        <el-card shadow="hover">
          <EChart :options="gradeEchartData" height="400px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <EChart :options="errorChartData" height="400px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行：薄弱知识点分析 -->
    <el-row style="margin-top: 20px;" v-loading="loading">
      <el-col :span="24">
        <el-card shadow="hover">
          <div class="chart-header">
            <h3>薄弱知识点分析 <span class="subtitle">(按错误率排序)</span></h3>
            <el-radio-group v-model="knowledgeView" @change="updateKnowledgeChart">
              <el-radio-button label="bar">条形图</el-radio-button>
              <el-radio-button label="wordcloud">词云</el-radio-button>
            </el-radio-group>
          </div>
          <EChart :options="weaknessChartData" height="400px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 第三行：学生学习活跃度监控 -->
    <el-row style="margin-top: 20px;" v-loading="loading">
      <el-col :span="24">
        <el-card shadow="hover">
          <div class="chart-header">
            <h3>学生学习活跃度监控 <span class="subtitle">(近30天学习时长)</span></h3>
            <el-radio-group v-model="heatmapView" @change="updateHeatmapChart">
              <el-radio-button label="student">按学生</el-radio-button>
              <el-radio-button label="day">按日期</el-radio-button>
            </el-radio-group>
          </div>
          <EChart :options="heatmapChartData" height="400px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.dashboard-container {
  width: 100%;

  .container-header {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 120px;

    .select-box {
      width: 100%;
      display: flex;
      justify-content: space-between;

      :deep(.el-form-item__label) {
        height: 50px !important;
        align-items: center !important;
      }
    }

    .export-btns {
      display: flex;
      align-items: center;
      align-self: end;
      gap: 12px;
    }
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;

    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .subtitle {
      font-size: 0.85rem;
      font-weight: normal;
      color: #64748b;
      margin-left: 8px;
    }

  }
}
</style>