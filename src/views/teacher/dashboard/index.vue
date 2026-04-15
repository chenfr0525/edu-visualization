<script setup>
import { ref, onMounted, computed } from 'vue'
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
const dashboardData = ref({})
const moredashboardData = ref({})
const searchModel = ref({
  classId: '',
})
const aiSuggestions = ref([])
const classList = ref([])
const stats = computed(() => {
  return { ...dashboardData.value?.classHomeworkStats, studentCount: dashboardData.value?.studentCount || 0, classAverageScore: dashboardData.value?.classAverageScore || 0 } || {}
})

const knowledgeView = ref('bar')
const heatmapView = ref('student')
const gradeEchartData = ref({})
const activityChartData = ref({})
const examChartData = ref({})
const weaknessChartData = ref({})
const heatmapChartData = ref({})


const fetchClassList = async () => {
  const res = await tDashboardApi.getClassList()
  if (res && res.data) {
    classList.value = res.data
    if (res.data.length) {
      searchModel.value.classId = res.data[0].id
      await fetchDashboardData()
      await fetchMoreData()
    }
  }
}

const fetchAISuggestions = async () => {
  const res = await tDashboardApi.getAISuggestions(searchModel.value.classId)
  aiSuggestions.value = res.data
  console.log('AI建议', aiSuggestions.value)
}

const refreshAISuggestions = async () => {
  await tDashboardApi.refreshAISuggestions(searchModel.value.classId)
}
const fetchDashboardData = async () => {
  if (!searchModel.value.classId) return
  const res = await tDashboardApi.getDashboardData(searchModel.value.classId)
  if (res && res.data) {
    dashboardData.value = res.data
  }
}

const fetchMoreData = async () => {
  const res = await tDashboardApi.getMoreData(searchModel.value.classId)
  if (res && res.data) {
    moredashboardData.value = res.data
    console.log('看板更多数据:', moredashboardData.value)
  }
}

// const fetchCourseList = async () => {
//   const res = await tDashboardApi.getCourseList()
//   if (res && res.data) {
//     courseList.value = res.data
//     if (res.data.length) {
//       searchModel.value.course = res.data[0].id
//     }
//   }
// }
// 成绩分布数据
const fetchGradeDistribution = async () => {
  if (!searchModel.value.classId) return
  const res = await tDashboardApi.getGradeDistribution(
    searchModel.value.classId,
  )
  if (res && res.data) {
    return res.data
  }
  return { categories: [], data: [], colors: [] }
}

// 高频错题数据
const fetchExamData = async () => {
  if (!searchModel.value.classId) return
  const res = await tDashboardApi.getExamLists(
    searchModel.value.classId,
  )
  if (res && res.data) {
    return res.data
  }
  return { highestScores: [], lowestScores: [], avgScores: [], examNames: [], passRates: [] }
}

const fetchHomeworkData = async () => {
  if (!searchModel.value.classId) return
  const res = await tDashboardApi.getHomeworkData(
    searchModel.value.classId,
  )
  if (res && res.data) {
    return res.data
  }
  return {}
}

const fetchActivityData = async () => {
  if (!searchModel.value.classId) return
  const res = await tDashboardApi.getActivityData(
    searchModel.value.classId,
  )
  if (res && res.data) {
    return res.data
  }
  return {}
}

// 薄弱知识点数据
const fetchWeakKnowledge = async () => {
  if (!searchModel.value.classId) return
  const res = await tDashboardApi.getWeakKnowledge(searchModel.value.classId)
  if (res && res.data) {
    return res.data
  }
  return { knowledgePoints: [], errorRates: [], masteryLevels: [] }
}

// 活跃度热力图数据
const fetchActivityHeatmap = async () => {
  if (!searchModel.value.classId) return
  const res = await tDashboardApi.getActivityHeatmap(
    searchModel.value.classId,
    heatmapView.value
  )
  if (res && res.data) {
    return res.data
  }
  return { type: 'student', students: [], dates: [], data: [] }
}

const initGradeChart = async () => {
  const data = await fetchHomeworkData()
  const gradeLevels = {
    'A': { label: '优秀 (90-100)', color: '#67c23a' },
    'B': { label: '良好 (80-89)', color: '#409eff' },
    'C': { label: '中等 (70-79)', color: '#e6a23c' },
    'D': { label: '及格 (60-69)', color: '#f56c6c' },
    'F': { label: '不及格 (<60)', color: '#909399' }
  }

  const categories = Object.keys(data.gradeDistribution).map(key => gradeLevels[key].label)
  const values = Object.values(data.gradeDistribution)


  gradeEchartData.value = {
    title: {
      text: `${data.className} 成绩等级分布`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        return `${params[0].name}<br/>📊 人数: ${params[0].value} 人<br/>📈 占比: ${((params[0].value / data.studentCount) * 100).toFixed(1)}%`
      }
    },
    grid: {
      left: '10%',
      right: '5%',
      bottom: '5%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { fontSize: 12, rotate: 0 }
    },
    yAxis: {
      type: 'value',
      name: '学生人数（人）',
      minInterval: 1
    },
    series: [{
      name: '学生人数',
      type: 'bar',
      data: values,
      barWidth: '50%',
      itemStyle: {
        borderRadius: [8, 8, 0, 0],
        color: (params) => {
          const colors = ['#67c23a', '#409eff', '#e6a23c', '#f56c6c', '#909399']
          return colors[params.dataIndex]
        }
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c} 人',
        fontWeight: 'bold'
      }
    }]
  }
}

const initActivityChart = async () => {
  const data = await fetchActivityData()
  if (data?.lastWeekAvgActivity === 0 && data?.thisWeekAvgActivity === 0) {
    activityChartData.value = {
      title: {
        text: '班级活跃度对比',
        left: 'center',
        top: 'top',
        textStyle: {
          fontSize: 16,
          color: '#909399'
        }
      },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '暂无活跃数据\n请等待学生参与活动',
            fill: '#c0c4cc',
            fontSize: 14,
            lineHeight: 22,
            textAlign: 'center'
          },
          z: 100
        }
      ],
      series: [{
        type: 'pie',
        radius: ['45%', '65%'],
        center: ['50%', '50%'],
        data: [
          { value: 0, name: '上周平均活跃度', itemStyle: { color: '#e4e6eb' } },
          { value: 0, name: '本周平均活跃度', itemStyle: { color: '#f0f2f5' } }
        ],
        label: { show: true, formatter: '{b}\n暂无数据', color: '#909399' },
        emphasis: { scale: false },
        avoidLabelOverlap: false
      }]
    }
    return
  }
  const dailyActivity = data.dailyActivity
  // 提取日期和活跃数据
  const dates = dailyActivity.map(item => item.date.slice(5)) // 只显示月-日
  const avgActivity = dailyActivity.map(item => item.avgActivity)
  const activeCount = dailyActivity.map(item => item.activeCount)
  const activeRate = dailyActivity.map(item => item.activeRate)

  activityChartData.value = {
    title: {
      text: '班级活跃趋势分析',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const index = params[0].dataIndex
        return `
          📅 日期: ${dailyActivity[index].date}<br/>
          👥 活跃人数: ${activeCount[index]} 人<br/>
          📊 平均活跃度: ${avgActivity[index]} 分<br/>
          📈 活跃率: ${activeRate[index]}%
        `
      }
    },
    legend: {
      data: ['平均活跃度', '活跃人数', '活跃率'],
      top: '8%'
    },
    grid: {
      left: '10%',
      right: '8%',
      top: '18%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { rotate: 45, fontSize: 10, interval: 5 }
    },
    yAxis: [
      {
        type: 'value',
        name: '活跃度 / 人数',
        min: 0
      },
      {
        type: 'value',
        name: '活跃率 (%)',
        min: 0,
        max: 100,
        axisLabel: { formatter: '{value}%' }
      }
    ],
    series: [
      {
        name: '平均活跃度',
        type: 'line',
        data: avgActivity,
        smooth: true,
        lineStyle: { color: '#409eff', width: 3 },
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        }
      },
      {
        name: '活跃人数',
        type: 'bar',
        data: activeCount,
        barWidth: '30%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: '#67c23a'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}人'
        }
      },
      {
        name: '活跃率',
        type: 'line',
        yAxisIndex: 1,
        data: activeRate,
        smooth: true,
        lineStyle: { color: '#e6a23c', width: 2, type: 'dashed' },
        symbol: 'diamond',
        symbolSize: 6
      }
    ]
  }
}

const initExamChart = async () => {
  const data = await fetchExamData()

  examChartData.value = {
    title: { text: '历次考试成绩分析' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const examName = params[0].name
        const index = data.examNames.indexOf(examName)
        return `
          ${examName}<br/>
          📊 最高分: ${data.highestScores[index]}分<br/>
          📉 最低分: ${data.lowestScores[index]}分<br/>
          📈 平均分: ${data.avgScores[index]}分<br/>
          ✅ 及格率: ${data.passRates[index]}%
        `
      }
    },
    grid: {
      left: '12%',
      right: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '分数',
      max: 100,
      axisLabel: { formatter: '{value}分' }
    },
    yAxis: {
      type: 'category',
      data: data.examNames,
      axisLabel: { fontSize: 12 },
      nameLocation: 'top',
    },
    series: [
      {
        name: '最高分',
        type: 'bar',
        data: data.highestScores,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: '#67c23a'
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}分',
          color: '#67c23a'
        }
      },
      {
        name: '平均分',
        type: 'bar',
        data: data.avgScores,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: '#409eff'
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}分',
          color: '#409eff'
        }
      },
      {
        name: '最低分',
        type: 'bar',
        data: data.lowestScores,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: '#f56c6c'
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}分',
          color: '#f56c6c'
        }
      }
    ]
  }
}

const initKnowledgeChart = async () => {
  const data = moredashboardData?.value?.topWrongQuestions
  const knowledgePoints = data.map(item => item.knowledgePointName)
  const errorRates = data.map(item => item.errorRate)
  if (knowledgeView.value === 'bar') {
    weaknessChartData.value = {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => `${params[0].name}<br/>错误率: ${params[0].value}%<br/>掌握度: ${100 - params[0].value}%`
      },
      grid: { left: '12%', containLabel: true },
      xAxis: { type: 'value', name: '错误率 (%)', max: 100 },
      yAxis: { type: 'category', data: knowledgePoints, axisLabel: { fontSize: 12 } },
      series: [{
        type: 'bar',
        data: errorRates,
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
        data: knowledgePoints.map((name, i) => ({ name, value: errorRates[i] }))
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
  exportToPDF(containerRef.value, `教学看板`)
}

// const exportDataCSV = async () => {
//   const gradeData = await fetchGradeDistribution()
//   const examData = await fetchExamData()
//   const knowledgeData = await fetchWeakKnowledge()

//   let csvContent = '=== 成绩分布 ===\n'
//   csvContent += '等级,人数\n'
//   gradeData.categories?.forEach((cat, i) => {
//     csvContent += `${cat},${gradeData.data[i]}\n`
//   })
//   csvContent += '\n=== 高频错题 ===\n'
//   csvContent += '题目,错误率(%)\n'
//   errorData.questions?.forEach((q, i) => {
//     csvContent += `${q},${errorData.errorRates[i]}\n`
//   })
//   csvContent += '\n=== 薄弱知识点 ===\n'
//   csvContent += '知识点,错误率(%)\n'
//   knowledgeData.knowledgePoints?.forEach((kp, i) => {
//     csvContent += `${kp},${knowledgeData.errorRates[i]}\n`
//   })
//   exportToCSV(csvContent, '教学看板数据')
// }

const handleFilterChange = async () => {
  if (searchModel.value.classId) {
    refreshData()
  }
}

const aiRefreshData = async () => {
  loading.value = true
  try {
    await refreshAISuggestions()
    await refreshData()
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await fetchDashboardData()
    await fetchMoreData()
    await Promise.all([
      initGradeChart(),
      initActivityChart(),
      initExamChart(),
      initKnowledgeChart(),
      fetchAISuggestions(),
      // initHeatmapChart()
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

// const updateHeatmapChart = () => {
//   initHeatmapChart()
// }

onMounted(async () => {
  await fetchClassList()
  await refreshData()
})
</script>

<template>
  <div class="dashboard-container" ref="containerRef">
    <div class="container-header">
      <el-form inline label-width="80" :model="searchModel" class="select-box">
        <el-form-item label="班级" prop="classId">
          <el-select size="large" placeholder="请选择班级" style="width: 240px" v-model="searchModel.classId"
            @change="handleFilterChange">
            <el-option v-for="item in classList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="export-btns">
        <el-button size="large" type="primary" @click="refreshData" style="margin-right: 10px;">搜索
          <template #icon>
            <i class="fas fa-search"></i>
          </template>
        </el-button>
        <el-button size="large" type="success" @click="aiRefreshData" style="margin-right: 10px;">刷新
          <template #icon>
            <i class="fas fa-refresh"></i>
          </template>
        </el-button>
        <el-button-group>
          <el-button size="large" type="primary" :icon="Picture" @click="handleExportImage">导出图片</el-button>
          <el-button size="large" @click="handleExportPDF">导出PDF
            <template #icon>
              <i class="fas fa-file-pdf"></i>
            </template>
          </el-button>
        </el-button-group>
      </div>
    </div>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <StatBox icon="fa-users" title="班级人数" :stat-num="stats.studentCount" />
      </el-col>
      <el-col :span="6">
        <StatBox icon="fa-chart-line" title="作业平均分" :stat-num="stats.averageScore" />
      </el-col>
      <el-col :span="6">
        <StatBox icon="fa-star" title="成绩平均分" :stat-num="stats.classAverageScore" />
      </el-col>
      <el-col :span="6">
        <StatBox icon="fa-tasks" title="作业总数" :stat-num="stats.totalHomework" />
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;margin-bottom: 20px;">
      <el-col :span="24">
        <el-card shadow="always" header="🤖 AI 分析">
          <div class="ai-suggestions">
            <div class="ai-content" v-if="aiSuggestions?.summary">
              <h4>总结:<p>{{ aiSuggestions.summary }}</p>
              </h4>
              <h4>建议:<p style="white-space: pre-wrap;">{{ aiSuggestions.suggestions }}</p>
              </h4>
            </div>
            <div class="ai-content" v-else>
              {{ '数据不存在,暂无AI建议' }}
            </div>
          </div>
        </el-card>
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
          <EChart :options="examChartData" height="400px" />
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px;" v-loading="loading">
      <el-col :span="12">
        <el-card shadow="hover">
          <EChart :options="activityChartData" height="400px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div class="chart-card">
            <div class="chart-header">
              <h3><i class="fas fa-exclamation-triangle" style="color: #f56c6c"></i> 不活跃学生预警</h3>
            </div>
            <el-table :data="moredashboardData?.activityMonitor?.lowActivityStudents" stripe style="width: 100%"
              max-height="360">
              <el-table-column prop="studentName" label="姓名" width="100" />
              <el-table-column prop="studentNo" label="学号" width="100" />
              <el-table-column prop="totalDuration" label="总时长">
                <template #default="{ row }">
                  <span class="inactive-value">{{ row.studyDuration }}min</span>
                </template>
              </el-table-column>
              <el-table-column prop="activityScore" label="活动得分" width="140" />
            </el-table>
            <div class="warning-tip" v-if="moredashboardData?.activityMonitor?.lowActivityStudents.length > 0">
              <i class="fas fa-bell"></i>
              <span>建议对以上 {{ moredashboardData?.activityMonitor?.lowActivityStudents.length }} 名学生进行关注和沟通</span>
            </div>
          </div>
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
    <!-- <el-row style="margin-top: 20px;" v-loading="loading">
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
    </el-row> -->
  </div>
</template>

<style scoped lang="scss">
.dashboard-container {
  width: 100%;

  .container-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 120px;

    .select-box {
      display: flex;
      justify-content: space-between;

      :deep(.el-form-item__label) {
        height: 50px !important;
        align-items: center !important;
      }
    }

    .export-btns {
      display: flex;
      gap: 12px;
    }
  }

  .chart-card {

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

  .ai-suggestions {
    .ai-content {
      white-space: pre-wrap;
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 8px;
      line-height: 1.6;
      color: #606266;

      h4 {
        display: flex;
        align-items: center;
        font-size: 1.3rem;

        p {
          margin-left: 22px;
          font-size: 1rem;
          font-weight: 400;
        }
      }
    }
  }
}
</style>