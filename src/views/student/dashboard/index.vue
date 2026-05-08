<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import EChart from '@/components/EChart.vue'
import { exportToImage, exportToPDF } from '@/utils/export'
import { Picture } from '@element-plus/icons-vue'
import StatBox from './component/stat-box.vue'
import { authApi, dashboardApi, unifiedAiApi } from '@/api/index.js'
import { ElMessage } from 'element-plus'
import AiAnalysis from '@/components/AiAnalysis.vue'

const exportContentRef = ref(null)
const loading = ref(false)
const dashboardData = ref(null)
const userInfo = ref(null)
const aiAnalysis = ref({})
const aiLoading = ref(false)
const aiFetched = ref(false)

const loadUserInfo = async () => {
  try {
    const res = await authApi.getUserInfo()
    if (res && res.data) {
      userInfo.value = res.data?.user
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

// 数据状态
const statsData = computed(() => {
  return {
    activityScore: dashboardData.value?.activityScore || 0,
    homeworkAvgScore: dashboardData.value?.homeworkAvgScore || 0,
    avgScore: dashboardData.value?.avgScore || 0,
    latestRank: dashboardData.value?.latestRank || 0
  }
})

const knowledgeData = computed(() => {
  return dashboardData.value?.knowledgeRadarData || {}
})

const gradeTrendData = computed(() => dashboardData.value?.scoreTrend || [])

// 出勤热力图数据
const attendanceData = computed(() => {
  return dashboardData.value?.heatmapData || []
})

// 加载数据
const loadData = async () => {
  if (!userInfo.value?.id) return
  try {
    const res = await dashboardApi.getStudentDashbord(userInfo.value.id)
    dashboardData.value = res.data
    console.log('Dashboard数据:', dashboardData.value)
  } catch (error) {
    console.error('数据加载失败:', error)
    ElMessage.error('加载dashboard数据失败')
  }
}

// AI分析独立加载（不阻塞主数据）
const fetchAiAnalysis = async (forceRefresh = false) => {
  if (!userInfo.value?.id || aiFetched.value) return

  aiLoading.value = true
  try {
    const api = forceRefresh ? unifiedAiApi.refresh : unifiedAiApi.analyze
    const res = await api({
      targetType: 'STUDENT',
      targetId: userInfo.value.id,
      reportType: 'COMPREHENSIVE',
      forceRefresh: forceRefresh
    })
    if (res && res.data) {
      aiAnalysis.value = res.data
    }
  } catch (error) {
    console.error('获取AI分析失败:', error)
  } finally {
    aiLoading.value = false
    aiFetched.value = true
  }
}

// 刷新分析（强制刷新）
const refreshAiAnalysis = async () => {
  aiFetched.value = false
  await fetchAiAnalysis(true)
}


const handleSearch = async () => {
  await loadData()
  fetchAiAnalysis()
}

// 刷新所有数据
const refreshData = async () => {
  loading.value = true
  try {
    await loadData()
    ElMessage.success('数据已刷新')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

// 知识点掌握雷达图数据
const radarOption = computed(() => {
  const indicators = Object.keys(knowledgeData.value).map(name => ({ name, max: 100 }));
  const currentData = Object.values(knowledgeData.value);

  if (indicators.length === 0) {
    return {
      title: { text: '暂无知识点数据', left: 'center' },
      graphic: { type: 'text', left: 'center', top: 'center', style: { text: '请先完成作业和考试', fill: '#999' } }
    }
  }

  return {
    title: { text: '知识点掌握程度', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { data: ['当前掌握程度'], left: 'left' },
    radar: {
      indicator: indicators,
      shape: 'circle',
      center: ['50%', '50%'],
      radius: '65%',
      name: { textStyle: { fontSize: 12 } }
    },
    series: [{
      name: '知识点掌握情况',
      type: 'radar',
      data: [{ value: currentData, name: '当前掌握程度', areaStyle: { color: 'rgba(64, 158, 255, 0.3)' }, lineStyle: { color: '#409EFF', width: 2 }, itemStyle: { color: '#409EFF' } }]
    }]
  }
})

// 学习成绩趋势折线图数据
const lineOption = computed(() => {
  const scores = gradeTrendData.value.map(item => item.score);
  const exams = gradeTrendData.value.map(item => item.examName);

  // 如果没有成绩数据，显示空状态
  if (exams.length === 0) {
    return {
      title: { text: '暂无考试成绩', left: 'center' },
      graphic: { type: 'text', left: 'center', top: 'center', style: { text: '暂无考试数据', fill: '#999' } }
    }
  }

  return {
    title: { text: '学习成绩趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['我的成绩'],
      left: 'left'
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: exams, boundaryGap: false },
    yAxis: { type: 'value', max: 100, name: '分数' },
    series: [
      {
        name: '我的成绩',
        data: scores,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: '#409EFF', width: 3 },
        areaStyle: { color: 'rgba(64, 158, 255, 0.1)' },
        markPoint: {
          data: [
            { type: 'max', name: '最高分' },
            { type: 'min', name: '最低分' }
          ]
        },
        markLine: {
          data: [{ type: 'average', name: '平均值' }]
        }
      }
    ]
  }
})

// 班级排名仪表盘数据（活跃分数班级排名）
const gaugeOption = computed(() => {
  const rank = dashboardData.value?.latestRank || 0
  const total = dashboardData.value?.classStudentCount || 0
  const hasRank = rank > 0 && total > 0

  return {
    title: { text: hasRank ? `活跃排名 第${rank}名 / 共${total}人` : '暂无排名数据', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { formatter: `第{value}名 / 共${total}人` },
    series: [{
      name: '排名', type: 'gauge', startAngle: 180, endAngle: 0, min: 0, max: total || 1,
      progress: { show: true, width: 18, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#409EFF' }, { offset: 1, color: '#67C23A' }] } } },
      axisLine: { lineStyle: { width: 18, color: [[1, '#E6E6E6']] } },
      axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false }, pointer: { show: false },
      detail: { valueAnimation: true, formatter: hasRank ? `第{value}名` : '暂无', fontSize: 22, offsetCenter: [0, 20], color: '#1d4e7c' },
      title: { show: false },
      data: [{ value: hasRank ? rank : 0, name: '活跃排名' }]
    }]
  }
})

// 出勤热力图配置
const heatmapOption = computed(() => {
  if (!attendanceData.value || attendanceData.value.length === 0) {
    return {
      title: { top: 30, left: 'center', text: '暂无出勤数据' },
      graphic: { type: 'text', left: 'center', top: 'center', style: { text: '暂无活动记录', fill: '#999' } }
    }
  }

  // 计算过去365天的起始和结束日期（具体日期范围，而不是年份）
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 364)

  const startStr = startDate.toISOString().split('T')[0]  // 格式: 2025-04-27
  const endStr = endDate.toISOString().split('T')[0]      // 格式: 2026-04-26

  // 使用具体的日期范围
  const range = [startStr, endStr]

  return {
    title: { top: 30, left: 'center', text: '学生年度出勤热力图' },
    tooltip: {
      formatter: (params) => {
        if (params && params.value) {
          return `${params.value[0]}: ${params.value[1] === 100 ? '已打卡' : '断签了'}`
        } return ''
      }
    },
    visualMap: {
      min: 0, max: 100, type: 'piecewise', orient: 'horizontal', left: 'center', top: 65,
      pieces: [
        { min: 95, label: '已打卡', color: '#F56C6C' },
        { max: 95, label: '未打卡', color: '#409EFF' }
      ]
    },
    calendar: {
      top: 120, left: 30, right: 30, cellSize: ['auto', 13],
      range: range,  // 使用具体日期范围 ['2025-04-27', '2026-04-26']
      itemStyle: { borderWidth: 0.5, borderColor: '#ddd' },
      yearLabel: { show: true },
      dayLabel: { firstDay: 1, nameMap: 'cn' },
      monthLabel: { nameMap: 'cn' }
    },
    series: { type: 'heatmap', coordinateSystem: 'calendar', data: attendanceData.value }
  }
})

const handleExportImage = () => {
  if (exportContentRef.value) {
    exportToImage(exportContentRef.value, '学生个人学习驾驶舱')
  } else {
    ElMessage.warning('没有可导出的内容')
  }
}

const handleExportPDF = () => {
  if (exportContentRef.value) {
    exportToPDF(exportContentRef.value, '学生个人学习驾驶舱')
  } else {
    ElMessage.warning('没有可导出的内容')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await loadUserInfo()
    await loadData()
    // AI分析独立异步加载，不阻塞其他模块展示
    fetchAiAnalysis()
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('页面初始化失败')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="dashboard-container" v-loading="loading">
    <div class="container-header">
      <div class="export-btns">
        <el-button size="large" type="success" @click="handleSearch" style="margin-right: 10px;">
          刷新
          <template #icon><i class="fas fa-sync-alt"></i></template>
        </el-button>
        <el-button-group>
          <el-button size="large" type="primary" :icon="Picture" @click="handleExportImage">导出图片</el-button>
          <el-button size="large" @click="handleExportPDF">导出PDF <template #icon><i
                class="fas fa-file-pdf"></i></template></el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 导出内容区域 - 只导出这部分 -->
    <div ref="exportContentRef" class="export-content">
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="6">
          <StatBox icon="fa-book-open" title="活动得分" :stat-num="statsData.activityScore" />
        </el-col>
        <el-col :span="6">
          <StatBox icon="fa-clock" title="作业平均分" :stat-num="statsData.homeworkAvgScore" />
        </el-col>
        <el-col :span="6">
          <StatBox icon="fa-pencil-alt" title="平均分" :stat-num="statsData.avgScore" />
        </el-col>
        <el-col :span="6">
          <StatBox icon="fa-trophy" title="班级排名" :stat-num="statsData.latestRank" />
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="always">
            <template #header>
              <div class="card-header">
                <span>🤖 AI 学情分析</span>
                <el-button size="small" type="primary" @click="refreshAiAnalysis" :loading="aiLoading">
                  <i class="fas fa-sync-alt"></i> 刷新分析
                </el-button>
              </div>
            </template>
            <div v-loading="aiLoading">
              <AiAnalysis :ai-analysis="aiAnalysis" />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card shadow="hover">
            <EChart :options="radarOption" height="400px" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <el-row>
              <el-col :span="17">
                <EChart :options="gaugeOption" height="400px" />
              </el-col>
              <el-col :span="7">
                <div class="echart-desc">
                  <div style="font-size: 3rem; font-weight: 700; color: #1d4e7c">{{ dashboardData?.latestRank || '--' }}
                  </div>
                  <div style="font-size: 1.1rem; margin-top: 8px">活跃分数班级排名</div>
                  <div style="font-size: 0.9rem; margin-top: 4px; color: #909399;">共 {{ dashboardData?.classStudentCount
                    || 0
                  }} 人</div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="hover">
            <EChart :options="lineOption" height="400px" />
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="hover" header="出勤统计">
            <EChart :options="heatmapOption" height="300px" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard-container {
  width: 100%;

  .container-header {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 60px;
  }

  // 导出内容区域样式优化
  .export-content {
    background: #f5f7fa;
    padding: 20px;
    border-radius: 16px;

    .echart-desc {
      padding-top: 80px;
    }

    .ai-suggestions {
      .ai-content {
        white-space: pre-wrap;
        padding: 16px;
        background-color: #f5f7fa;
        border-radius: 8px;
        line-height: 1.6;
        color: #606266;
      }
    }
  }


}
</style>