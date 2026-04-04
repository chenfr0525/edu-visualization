<script setup>
import { ref, onMounted } from 'vue'
import EChart from '@/components/EChart.vue'
import 'echarts-wordcloud'
import { exportToCSV, exportToImage, exportToPDF } from '@/utils/export'
import StatBox from '@/views/student/dashboard/component/stat-box.vue'

// ==================== 响应式数据 ====================
const containerRef = ref(null)
const loading = ref(false)
const searchModel = ref({
  class: '',
  exam: '',
  dateRange: []
})
const classList = ref([])
const examList = ref([])
const knowledgeView = ref('bar')
const heatmapView = ref('student')
const gradeEchartData = ref({})
const errorChartData = ref({})
const weaknessChartData = ref({})
const heatmapChartData = ref({})


// ==================== 模拟API数据 ====================
// 实际开发中替换为真实API调用
const fetchClassList = async () => {
  // GET /api/teacher/classes
  return [
    { id: 1, name: '高三(1)班' },
    { id: 2, name: '高三(2)班' },
    { id: 3, name: '高三(3)班' }
  ]
}

const fetchExamList = async (classId) => {
  // GET /api/teacher/exams?classId=1
  return [
    { id: 1, name: '期中考试' },
    { id: 2, name: '一模考试' },
    { id: 3, name: '二模考试' }
  ]
}

// 成绩分布数据
const fetchGradeDistribution = async (params) => {
  // GET /api/teacher/grade-distribution
  return {
    categories: ['优(≥90)', '良(75-89)', '中(60-74)', '差(<60)'],
    data: [8, 14, 10, 3],
    colors: ['#67c23a', '#409eff', '#e6a23c', '#f56c6c']
  }
}

// 高频错题数据
const fetchHighFrequencyErrors = async (params) => {
  // GET /api/teacher/high-frequency-errors
  return {
    questions: ['第5题 (三角函数)', '第8题 (函数单调性)', '第2题 (数列求和)', '第10题 (立体几何)', '第3题 (概率计算)'],
    errorRates: [85, 60, 45, 38, 32],
    questionIds: [5, 8, 2, 10, 3]
  }
}

// 薄弱知识点数据
const fetchWeakKnowledge = async (params) => {
  // GET /api/teacher/weak-knowledge
  return {
    knowledgePoints: ['三角函数诱导公式', '函数奇偶性判断', '数列通项公式', '立体几何三视图', '概率古典概型'],
    errorRates: [72, 68, 55, 48, 35],
    masteryLevels: [28, 32, 45, 52, 65]
  }
}

// 活跃度热力图数据
const fetchActivityHeatmap = async (params) => {
  // GET /api/teacher/activity-heatmap
  if (heatmapView.value === 'student') {
    return {
      type: 'student',
      students: ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'],
      dates: ['3/16', '3/17', '3/18', '3/19', '3/20', '3/21', '3/22'],
      data: [
        [45, 52, 38, 42, 78, 85, 62],  // 张三
        [28, 35, 42, 38, 55, 48, 52],  // 李四
        [72, 68, 85, 78, 92, 88, 95],  // 王五
        [15, 22, 18, 25, 32, 28, 35],  // 赵六
        [55, 48, 52, 58, 62, 55, 60],  // 钱七
        [38, 42, 35, 48, 52, 58, 55],  // 孙八
        [82, 78, 85, 88, 92, 85, 90],  // 周九
        [25, 32, 28, 35, 38, 42, 40]   // 吴十
      ]
    }
  } else {
    return {
      type: 'date',
      dates: ['第1周', '第2周', '第3周', '第4周'],
      metrics: ['访问次数', '学习时长(min)', '互动次数'],
      data: [
        [245, 328, 412, 385],   // 访问次数
        [1890, 2450, 3100, 2850], // 学习时长
        [89, 112, 145, 128]     // 互动次数
      ]
    }
  }
}

// ==================== 图表初始化 ====================
// 成绩分布直方图
const initGradeChart = async () => {
  const data = await fetchGradeDistribution(searchModel)
  gradeEchartData.value = {
    title: {
      text: '班级成绩分布直方图'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: '{b}<br/>人数: {c} 人<br/>占比: {d}%'
    },
    legend: {
      show: true
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.categories,
      axisLabel: { fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      nameLocation: 'middle',
      nameGap: 40
    },
    series: [{
      type: 'bar',
      data: data.data,
      itemStyle: {
        borderRadius: [8, 8, 0, 0],
        color: (params) => data.colors[params.dataIndex]
      },
      label: {
        show: true,
        position: 'top',
        fontWeight: 'bold'
      }
    }]
  }
  // 绑定点击事件(后续做，点击echart图弹窗，这里gradeChart是echart图实例)
  // gradeChart.on('click', (params) => {
  //   console.log('点击了', params.name, '人数:', params.value)
  //   // 可以弹出详情弹窗
  // })
}

// 高频错题条形图
const initErrorChart = async () => {
  const data = await fetchHighFrequencyErrors(searchModel)
  errorChartData.value = {
    title: {
      text: '高频错题排行',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        return `${params[0].name}<br/>错误率: ${params[0].value}%<br/>建议: 重点讲解`
      }
    },
    grid: {
      left: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '错误率(%)',
      max: 100,
      axisLabel: { formatter: '{value}%' }
    },
    yAxis: {
      type: 'category',
      data: data.questions,
      axisLabel: { fontSize: 12 }
    },
    series: [{
      type: 'bar',
      data: data.errorRates,
      itemStyle: {
        borderRadius: [0, 8, 8, 0],
        color: '#e6a23c'
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%'
      }
    }]
  }
  // 点击条形查看题目详情
  // errorChart.on('click', (params) => {
  // const index = params.dataIndex
  // const questionId = data.questionIds[index]
  // console.log('查看题目详情:', questionId)
  // // 弹窗显示题目详情
  // showQuestionDetail(questionId)
  // })
}

// 薄弱知识点图表（支持条形图/词云切换）
const initKnowledgeChart = async () => {
  const data = await fetchWeakKnowledge(searchModel)
  if (knowledgeView.value === 'bar') {
    weaknessChartData.value = {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          return `${params[0].name}<br/>错误率: ${params[0].value}%<br/>掌握度: ${100 - params[0].value}%`
        }
      },
      grid: {
        left: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '错误率 (%)',
        max: 100
      },
      yAxis: {
        type: 'category',
        data: data.knowledgePoints,
        axisLabel: { fontSize: 12 }
      },
      series: [{
        type: 'bar',
        data: data.errorRates,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: '#f56c6c'
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%'
        }
      }]
    }
  } else {
    // 使用词云图展示知识点错误率
    weaknessChartData.value = {
      title: {
        text: '知识点错误率词云',
        left: 'center',
        top: 5,
        textStyle: {
          fontSize: 14,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          return `${params.name}<br/>错误率: ${params.value}%<br/>掌握度: ${100 - params.value}%`
        }
      },
      series: [{
        type: 'wordCloud',
        shape: 'star',  // 形状：circle, cardioid, diamond, triangle-forward, star 等
        left: 'center',
        top: 'middle',
        width: '90%',
        height: '85%',
        sizeRange: [16, 50],  // 字体大小范围
        rotationRange: [-45, 45],  // 旋转角度范围，让词云更生动
        rotationStep: 15,
        gridSize: 8,
        drawOutOfBound: false,
        layoutAnimation: true,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'normal',
          color: (value) => {
            // 根据错误率设置颜色：高错误率红色，中等橙色，低错误率蓝色
            const errorRate = value.data[1]
            if (errorRate > 60) return '#f56c6c'  // 红色 - 严重薄弱
            if (errorRate > 30) return '#e6a23c'  // 橙色 - 需要关注
            return '#409eff'  // 蓝色 - 掌握较好
          },
          fontSize: (value) => {
            // 根据错误率动态调整字体大小
            return Math.max(16, Math.min(50, value.data[1] / 2 + 20))
          }
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            fontWeight: 'bold',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        data: data.knowledgePoints.map((name, i) => ({
          name: name,
          value: data.errorRates[i]
        }))
      }]
    }
  }
}

// 活跃度热力图
const initHeatmapChart = async () => {
  const data = await fetchActivityHeatmap(searchModel)

  if (heatmapView.value === 'student') {
    // 学生×日期热力图
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
        formatter: (params) => {
          return `${yAxisData[params.value[1]]}<br/>${xAxisData[params.value[0]]}<br/>学习时长: ${params.value[2]}分钟`
        }
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        splitArea: { show: true }
      },
      yAxis: {
        type: 'category',
        data: yAxisData,
        splitArea: { show: true }
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        inRange: {
          color: ['#b3cde0', '#5f9bc0', '#1d4e7c']
        },
        text: ['高', '低']
      },
      series: [{
        type: 'heatmap',
        data: seriesData,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.5)'
          }
        }
      }]
    }
  } else {
    // 按日期趋势图（折线图）
    heatmapChartData.value = {
      tooltip: { trigger: 'axis' },
      legend: { data: data.metrics },
      xAxis: { type: 'category', data: data.dates },
      yAxis: [
        { type: 'value', name: '访问次数', position: 'left' },
        { type: 'value', name: '学习时长(min)', position: 'right' }
      ],
      series: [
        {
          name: data.metrics[0],
          type: 'line',
          data: data.data[0],
          smooth: true,
          lineStyle: { color: '#409eff' },
          symbol: 'circle'
        },
        {
          name: data.metrics[1],
          type: 'line',
          data: data.data[1],
          smooth: true,
          yAxisIndex: 1,
          lineStyle: { color: '#67c23a' },
          symbol: 'diamond'
        },
        {
          name: data.metrics[2],
          type: 'bar',
          data: data.data[2],
          barWidth: '30%',
          itemStyle: { color: '#e6a23c', borderRadius: [4, 4, 0, 0] }
        }]
    }
  }
}

// ==================== 导出功能 ====================
// 导出单个图表为图片
const handleExportImage = () => {
  exportToImage(containerRef.value, '教学看板')
}

// 导出所有图表为PDF
const handleExportPDF = () => {
  exportToPDF(containerRef.value, `${searchModel.class} 教学看板`)
}

// 导出原始数据CSV
const exportDataCSV = async () => {
  // 收集所有数据
  const gradeData = await fetchGradeDistribution(searchModel)
  const errorData = await fetchHighFrequencyErrors(searchModel)
  const knowledgeData = await fetchWeakKnowledge(searchModel)

  // 构建CSV内容
  let csvContent = '=== 成绩分布 ===\n'
  csvContent += '等级,人数\n'
  gradeData.categories.forEach((cat, i) => {
    csvContent += `${cat},${gradeData.data[i]}\n`
  })
  csvContent += '\n=== 高频错题 ===\n'
  csvContent += '题目,错误率(%)\n'
  errorData.questions.forEach((q, i) => {
    csvContent += `${q},${errorData.errorRates[i]}\n`
  })
  csvContent += '\n=== 薄弱知识点 ===\n'
  csvContent += '知识点,错误率(%)\n'
  knowledgeData.knowledgePoints.forEach((kp, i) => {
    csvContent += `${kp},${knowledgeData.errorRates[i]}\n`
  })
  exportToCSV(csvContent, '教学看板数据')
}

// ==================== 交互事件 ====================
const handleFilterChange = () => {
  refreshData()
}

const refreshData = async () => {
  loading.value = true
  await Promise.all([
    initGradeChart(),
    initErrorChart(),
    initKnowledgeChart(),
    initHeatmapChart()
  ])
  loading.value = false
}

const updateKnowledgeChart = () => {
  initKnowledgeChart()
}

const updateHeatmapChart = () => {
  initHeatmapChart()
}

updateHeatmapChart

const showDetail = (type) => {
  console.log('查看详情:', type)
  // 可弹出详情弹窗
}

const showQuestionDetail = (questionId) => {
  console.log('显示题目详情:', questionId)
  // 弹窗显示题目内容、解析、相似题推荐等
}

// ==================== 生命周期 ====================
onMounted(() => {
  // 加载班级列表
  fetchClassList().then(res => {
    classList.value = res
    if (res.length) searchModel.value.class = res[0].id
    return fetchExamList(searchModel.value.class)
  }).then(res => {
    examList.value = res
    if (res.length) searchModel.value.exam = res[0].id
    refreshData()
  })
})
</script>

<template>
  <div class="dashboard-container" ref="containerRef">
    <div class="container-header">
      <el-form inline label-width="80" :model="searchModel" class="select-box">
        <el-form-item label="班级" prop="class">
          <el-select size="large" placeholder="请选择班级" style="width: 240px" v-model="searchModel.class"
            @click="handleFilterChange">
            <el-option v-for="item in classList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试" prop="exam">
          <el-select size="large" placeholder="请选择考试" style="width: 240px" v-model="searchModel.exam">
            <el-option v-for="item in examList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" prop="dateRange">
          <el-date-picker v-model="searchModel.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" />
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