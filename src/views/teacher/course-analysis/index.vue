<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import { exportToPDF, exportCourseAnalysisToExcel } from '@/utils/export'
import { tCourseApi, tDashboardApi, teacherManageApi } from '@/api/index.js'
import { useAuthStore } from '@/stores/index.js'

const authStore = useAuthStore()
const loading = ref(false)
const containerRef = ref(null)

// 筛选条件
const searchModel = ref({
  courseId: '',
})

// 数据列表
const courseList = ref([])
const classList = ref([])
const knowledgePoints = ref([])
const courseDetail = ref(null)

// 统计卡片数据
const statistics = reactive({
  studentCount: 0,
  avgScore: 0,
  passRate: 0,
  knowledgePointCount: 0
})

// 图表数据
let knowledgeChart = null
let trendChart = null
let distributionChart = null

// 图表数据存储
const chartData = ref({
  scoreTrend: [],
  radarChart: { indicators: [], classAvg: [] },
  scoreDistribution: { excellent: 0, good: 0, medium: 0, pass: 0, fail: 0 },
  homeworkExamComparison: []
})

// AI分析数据
const aiAnalysis = ref(null)
const aiAnalysisDialogVisible = ref(false)

// 知识点弹窗
const kpDialogVisible = ref(false)
const kpFormRef = ref(null)
const kpSubmitting = ref(false)
const isEditKp = ref(false)
const kpForm = reactive({
  id: null,
  name: '',
  description: '',
  parentId: null,
  level: 0,
  sortOrder: 0
})

// 课程弹窗（仅管理员）
const courseDialogVisible = ref(false)
const courseFormRef = ref(null)
const courseSubmitting = ref(false)
const courseForm = reactive({
  id: null,
  name: '',
  description: '',
  teacherId: '',
  credit: 2,
  status: 'ONGOING'
})

// 教师列表（用于课程添加）
const teacherList = ref([])

// 知识点导入相关
const kpImportDialogVisible = ref(false)
const kpUploadRef = ref(null)
const selectedKpFile = ref(null)
const kpUploading = ref(false)
const kpParseResult = ref(null)
const kpSaving = ref(false)

// 权限判断
const isAdmin = computed(() => authStore.userRole === 'ADMIN')

// 获取课程列表
const fetchCourseList = async () => {
  try {
    const res = await tDashboardApi.getCourseList()
    if (res && res.data) {
      courseList.value = res.data
      if (courseList.value.length > 0 && !searchModel.value.courseId) {
        searchModel.value.courseId = courseList.value[0].id
        await fetchAllData()
      }
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
    ElMessage.error('获取课程列表失败')
  }
}

// 获取班级列表
const fetchClassList = async () => {
  try {
    const res = await tDashboardApi.getClassList()
    if (res && res.data) {
      classList.value = res.data
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
  }
}

// 获取教师列表（管理员用）
const fetchTeacherList = async () => {
  if (!isAdmin.value) return
  try {
    const res = await teacherManageApi.getTeacherList({
      page: 0,
      size: 100,
    })
    if (res && res.data) {
      teacherList.value = res.data.list
    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
  }
}

// 获取课程统计卡片数据
const fetchCourseStatistics = async () => {
  if (!searchModel.value.courseId) return null
  try {
    const res = await tCourseApi.getCourseStatistics(searchModel.value.courseId)
    if (res && res.data) {
      Object.assign(statistics, res.data)
      return res.data
    }
  } catch (error) {
    console.error('获取课程统计数据失败:', error)
  }
  return null
}

// 获取课程详情
const fetchCourseDetail = async () => {
  if (!searchModel.value.courseId) return null
  try {
    const res = await tCourseApi.getCourseDetail(searchModel.value.courseId)
    if (res && res.data) {
      courseDetail.value = res.data
      return res.data
    }
  } catch (error) {
    console.error('获取课程详情失败:', error)
  }
  return null
}

// 获取知识点列表（树形结构）
const fetchKnowledgePoints = async () => {
  if (!searchModel.value.courseId) return null
  try {
    const res = await tCourseApi.getKnowledgePoints(searchModel.value.courseId)
    if (res && res.data) {
      knowledgePoints.value = res.data
      return res.data
    }
  } catch (error) {
    console.error('获取知识点列表失败:', error)
  }
  return null
}

// 获取图表数据
const fetchChartData = async () => {
  if (!searchModel.value.courseId) return null
  try {
    const res = await tCourseApi.getChartData(searchModel.value.courseId)
    if (res && res.data) {
      chartData.value = res.data
      return res.data
    }
  } catch (error) {
    console.error('获取图表数据失败:', error)
  }
  return null
}

// 获取AI分析报告
const fetchAiAnalysis = async () => {
  if (!searchModel.value.courseId) return null
  try {
    const res = await tCourseApi.getAiAnalysis(searchModel.value.courseId)
    if (res && res.data) {
      aiAnalysis.value = res.data
      return res.data
    }
  } catch (error) {
    console.error('获取AI分析失败:', error)
  }
  return null
}

// 获取所有数据
const fetchAllData = async () => {
  if (!searchModel.value.courseId) {
    ElMessage.warning('请先选择课程')
    return
  }

  loading.value = true
  try {
    await Promise.all([
      fetchCourseStatistics(),
      fetchCourseDetail(),
      fetchKnowledgePoints(),
      fetchChartData(),
      fetchAiAnalysis()
    ])

    await nextTick()
    initKnowledgeChart()
    initTrendChart()
    initDistributionChart()
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化知识点条形图
const initKnowledgeChart = () => {
  const chartDom = document.getElementById('knowledgeChart')
  if (!chartDom) return
  if (knowledgeChart) knowledgeChart.dispose()

  // 扁平化知识点列表
  const flatList = flattenKnowledgePoints(knowledgePoints.value)
  if (flatList.length === 0) return

  knowledgeChart = echarts.init(chartDom)

  // 按掌握度排序
  const sortedList = [...flatList].sort((a, b) => (b.classAvgMastery || 0) - (a.classAvgMastery || 0))

  knowledgeChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const kp = sortedList[params[0].dataIndex]
        return `${kp.name}<br/>掌握度: ${kp.classAvgMastery || 0}%<br/>${kp.description || ''}`
      }
    },
    grid: {
      left: '12%',
      right: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '掌握度(%)',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    yAxis: {
      type: 'category',
      data: sortedList.map(kp => kp.name.length > 15 ? kp.name.slice(0, 15) + '...' : kp.name),
      axisLabel: {
        fontSize: 11
      }
    },
    series: [{
      type: 'bar',
      data: sortedList.map(kp => kp.classAvgMastery || 0),
      itemStyle: {
        borderRadius: [0, 8, 8, 0],
        color: (params) => {
          const value = params.data
          if (value >= 80) return '#67c23a'
          if (value >= 60) return '#409eff'
          if (value >= 40) return '#e6a23c'
          return '#f56c6c'
        }
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%'
      }
    }]
  })

  // 点击事件
  knowledgeChart.off('click')
  knowledgeChart.on('click', (params) => {
    if (params.componentType === 'series') {
      const flatListData = flattenKnowledgePoints(knowledgePoints.value)
      const kp = flatListData[params.dataIndex]
      if (kp) {
        showKnowledgePointDetail(kp.id)
      }
    }
  })
}

// 初始化成绩趋势图
const initTrendChart = () => {
  const chartDom = document.getElementById('trendChart')
  if (!chartDom) return
  if (trendChart) trendChart.dispose()

  const trendData = chartData.value.scoreTrend || []
  if (trendData.length === 0) return

  trendChart = echarts.init(chartDom)

  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        return `${params[0].axisValue}<br/>平均分: ${params[0].value}分`
      }
    },
    xAxis: {
      type: 'category',
      data: trendData.map(item => item.name),
      axisLabel: {
        rotate: trendData.length > 6 ? 30 : 0,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '平均分',
      min: 50,
      max: 100
    },
    series: [{
      type: 'line',
      data: trendData.map(item => Number(item.score)),
      smooth: true,
      lineStyle: {
        color: '#409eff',
        width: 3
      },
      areaStyle: {
        opacity: 0.1,
        color: '#409eff'
      },
      symbol: 'circle',
      symbolSize: 8,
      label: {
        show: true,
        position: 'top',
        formatter: '{c}分'
      }
    }]
  })
}

// 初始化成绩分布饼图
const initDistributionChart = () => {
  const chartDom = document.getElementById('distributionChart')
  if (!chartDom) return
  if (distributionChart) distributionChart.dispose()

  const dist = chartData.value.scoreDistribution || {}
  const data = [
    { name: '优秀 (90-100)', value: dist.excellent || 0, color: '#67c23a' },
    { name: '良好 (80-89)', value: dist.good || 0, color: '#409eff' },
    { name: '中等 (70-79)', value: dist.medium || 0, color: '#e6a23c' },
    { name: '及格 (60-69)', value: dist.pass || 0, color: '#f4d03f' },
    { name: '不及格 (0-59)', value: dist.fail || 0, color: '#f56c6c' }
  ].filter(item => item.value > 0)

  if (data.length === 0) return

  distributionChart = echarts.init(chartDom)

  distributionChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {d}% ({c}人)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map(item => item.name)
    },
    series: [{
      type: 'pie',
      radius: '55%',
      center: ['50%', '50%'],
      data: data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        show: true,
        formatter: '{d}%'
      },
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      color: data.map(item => item.color)
    }]
  })
}

// 扁平化知识点树
const flattenKnowledgePoints = (kpList, result = []) => {
  for (const kp of kpList) {
    result.push(kp)
    if (kp.children && kp.children.length > 0) {
      flattenKnowledgePoints(kp.children, result)
    }
  }
  return result
}

// 获取扁平化的知识点列表（用于表格展示）
const flatKnowledgePoints = computed(() => {
  return flattenKnowledgePoints(knowledgePoints.value)
})

// 显示知识点详情
const showKnowledgePointDetail = async (kpId) => {
  if (!searchModel.value.courseId) return

  const loading = ElLoading.service({ text: '加载中...' })
  try {
    const res = await tCourseApi.getKnowledgePointDetail(searchModel.value.courseId, kpId)
    if (res && res.data) {
      await showKpDetailDialog(res.data)
    }
  } catch (error) {
    console.error('获取知识点详情失败:', error)
    ElMessage.error('获取知识点详情失败')
  } finally {
    loading.close()
  }
}

// 知识点详情弹窗（简化版，使用el-dialog展示详情）
const kpDetailVisible = ref(false)
const currentKpDetail = ref(null)
let kpDetailChart = null

const showKpDetailDialog = (detail) => {
  currentKpDetail.value = detail
  kpDetailVisible.value = true
  nextTick(() => {
    initKpDetailChart()
  })
}

const initKpDetailChart = () => {
  const chartDom = document.getElementById('kpDetailChart')
  if (!chartDom || !currentKpDetail.value) return
  if (kpDetailChart) kpDetailChart.dispose()

  const trendData = currentKpDetail.value.masteryTrend || []
  if (trendData.length === 0) return

  kpDetailChart = echarts.init(chartDom)

  kpDetailChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: trendData.map(item => item.date)
    },
    yAxis: {
      type: 'value',
      name: '掌握度(%)',
      max: 100
    },
    series: [{
      type: 'line',
      data: trendData.map(item => Number(item.masteryLevel)),
      smooth: true,
      lineStyle: { color: '#409eff', width: 3 },
      areaStyle: { opacity: 0.1, color: '#409eff' },
      symbol: 'circle',
      symbolSize: 8,
      label: { show: true, position: 'top', formatter: '{c}%' }
    }]
  })
}

// 删除知识点
const deleteKnowledgePoint = async (kpId, kpName) => {
  try {
    await ElMessageBox.confirm(`确认删除知识点「${kpName}」吗？删除后不可恢复。`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await tCourseApi.deleteKnowledgePoint(kpId)
    if (res && res.code === 200) {
      ElMessage.success('删除成功')
      await fetchKnowledgePoints()
      await fetchChartData()
      initKnowledgeChart()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 打开添加知识点弹窗
const showAddKpDialog = () => {
  isEditKp.value = false
  Object.assign(kpForm, {
    id: null,
    name: '',
    description: '',
    parentId: null,
    level: 0,
    sortOrder: 0
  })
  kpDialogVisible.value = true
}

// 编辑知识点
const editKnowledgePoint = (kp) => {
  isEditKp.value = true
  Object.assign(kpForm, {
    id: kp.id,
    name: kp.name,
    description: kp.description || '',
    parentId: kp.parentId || null,
    level: kp.level || 0,
    sortOrder: kp.sortOrder || 0
  })
  kpDialogVisible.value = true
}

// 提交知识点
const submitKnowledgePoint = async () => {
  await kpFormRef.value?.validate()

  kpSubmitting.value = true
  try {
    let res
    const data = {
      name: kpForm.name,
      description: kpForm.description,
      courseId: searchModel.value.courseId,
      parentId: kpForm.parentId,
      level: kpForm.level,
      sortOrder: kpForm.sortOrder
    }

    if (isEditKp.value) {
      res = await tCourseApi.updateKnowledgePoint(kpForm.id, data)
    } else {
      res = await tCourseApi.createKnowledgePoint(data)
    }

    if (res && res.code === 200) {
      ElMessage.success(isEditKp.value ? '更新成功' : '创建成功')
      kpDialogVisible.value = false
      await fetchKnowledgePoints()
      await fetchChartData()
      initKnowledgeChart()
    }
  } catch (error) {
    console.error('保存知识点失败:', error)
    ElMessage.error(error.message || '保存失败')
  } finally {
    kpSubmitting.value = false
  }
}

// ==================== 课程管理（管理员） ====================

// 打开添加课程弹窗
const showAddCourseDialog = () => {
  Object.assign(courseForm, {
    id: null,
    name: '',
    description: '',
    icon: '',
    teacherId: '',
    credit: 2,
    status: 'ONGOING'
  })
  courseDialogVisible.value = true
}

// 提交课程
const submitCourse = async () => {
  await courseFormRef.value?.validate()

  courseSubmitting.value = true
  try {
    const res = await tCourseApi.createCourse(courseForm)
    if (res && res.code === 200) {
      ElMessage.success('创建成功')
      courseDialogVisible.value = false
      await fetchCourseList()
    }
  } catch (error) {
    console.error('创建课程失败:', error)
    ElMessage.error(error.message || '创建失败')
  } finally {
    courseSubmitting.value = false
  }
}

// ==================== 知识点AI导入 ====================

// 打开知识点导入弹窗
const showKpImportDialog = () => {
  kpParseResult.value = null
  selectedKpFile.value = null
  kpImportDialogVisible.value = true
  setTimeout(() => {
    kpUploadRef.value?.clearFiles()
  }, 100)
}

// 处理文件变化
const handleKpFileChange = (file) => {
  selectedKpFile.value = file.raw
  kpParseResult.value = null
}

// 上传并解析知识点文件
const uploadKpFile = async () => {
  if (!selectedKpFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  kpUploading.value = true
  try {
    const res = await tCourseApi.parseKnowledgePointFile(
      selectedKpFile.value,
      searchModel.value.courseId
    )
    kpParseResult.value = res.data

    if (kpParseResult.value.success) {
      ElMessage.success(`解析成功！共 ${kpParseResult.value.data?.length || 0} 条数据`)
    } else {
      ElMessage.error('解析失败，请检查文件格式')
    }
  } catch (error) {
    console.error('解析失败:', error)
    ElMessage.error(error.message || '解析失败')
  } finally {
    kpUploading.value = false
  }
}

// 确认导入知识点
const confirmKpImport = async () => {
  if (!kpParseResult.value?.data || kpParseResult.value.data.length === 0) {
    ElMessage.warning('没有可导入的数据')
    return
  }

  try {
    await ElMessageBox.confirm(`确认导入 ${kpParseResult.value.data.length} 条知识点数据吗？`, '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    kpSaving.value = true
    const res = await tCourseApi.confirmKnowledgePointImport(
      searchModel.value.courseId,
      kpParseResult.value.data
    )

    if (res.data && res.data.success) {
      ElMessage.success(res.data.message || '导入成功')
      kpParseResult.value = null
      selectedKpFile.value = null
      kpImportDialogVisible.value = false
      kpUploadRef.value?.clearFiles()
      // 刷新数据
      await fetchKnowledgePoints()
      await fetchChartData()
      initKnowledgeChart()
    } else {
      ElMessage.error(res.data?.message || '导入失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('导入失败:', error)
      ElMessage.error(error.message || '导入失败')
    }
  } finally {
    kpSaving.value = false
  }
}

// 取消导入
const cancelKpImport = async () => {
  try {
    await ElMessageBox.confirm('确认取消导入吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    kpParseResult.value = null
    selectedKpFile.value = null
    kpUploadRef.value?.clearFiles()
    ElMessage.success('已取消')
  } catch (error) {
    // 用户取消操作
  }
}

// 清空文件
const clearKpFile = () => {
  selectedKpFile.value = null
  kpParseResult.value = null
  kpUploadRef.value?.clearFiles()
}

// 刷新数据
const refreshData = () => {
  fetchAllData()
}

// 切换课程
const handleCourseChange = () => {
  fetchAllData()
}

// 获取掌握度等级样式
const getMasteryClass = (level) => {
  if (level >= 80) return 'mastery-high'
  if (level >= 60) return 'mastery-medium'
  if (level >= 40) return 'mastery-low-mid'
  return 'mastery-low'
}

// 获取掌握度文本
const getMasteryText = (level) => {
  if (level >= 80) return '优秀'
  if (level >= 60) return '良好'
  if (level >= 40) return '待提升'
  return '薄弱'
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 课程状态映射
const getCourseStatusText = (status) => {
  const map = {
    'ONGOING': '进行中',
    'COMPLETED': '已结课',
    'DROPPED': '已停开'
  }
  return map[status] || status
}

onMounted(async () => {
  await fetchCourseList()
  await fetchClassList()
  if (isAdmin.value) {
    await fetchTeacherList()
  }

  window.addEventListener('resize', () => {
    if (knowledgeChart) knowledgeChart.resize()
    if (trendChart) trendChart.resize()
    if (distributionChart) distributionChart.resize()
    if (kpDetailChart) kpDetailChart.resize()
  })
})

onMounted(() => {
  window.addEventListener('resize', () => {
    if (knowledgeChart) knowledgeChart?.resize()
    if (trendChart) trendChart?.resize()
    if (distributionChart) distributionChart?.resize()
    if (kpDetailChart) kpDetailChart?.resize()
  })
})
</script>

<template>
  <div class="course-analysis-container" ref="containerRef">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-left">
        <el-select size="large" v-model="searchModel.courseId" placeholder="请选择课程" style="width: 220px"
          @change="handleCourseChange" filterable>
          <el-option v-for="course in courseList" :key="course.id" :label="course.name" :value="course.id" />
        </el-select>
      </div>
      <div class="filter-right">
        <el-button v-if="isAdmin" type="primary" plain @click="showAddCourseDialog">
          <i class="fas fa-plus"></i> 添加课程
        </el-button>
        <el-button type="primary" @click="showAddKpDialog">
          <i class="fas fa-plus"></i> 添加知识点
        </el-button>
        <el-button @click="showKpImportDialog">
          <i class="fas fa-upload"></i> 批量导入知识点
        </el-button>
        <el-button @click="refreshData" :loading="loading">
          <i class="fas fa-sync-alt"></i> 刷新
        </el-button>
      </div>
    </div>

    <!-- 课程信息卡片 -->
    <el-card class="course-info-card" v-if="courseDetail" shadow="hover">
      <div class="course-info">
        <div class="course-icon" :style="{ backgroundColor: courseDetail.icon || '#409eff' }">
          <i class="fas fa-book-open"></i>
        </div>
        <div class="course-detail">
          <h2>{{ courseDetail.name }}</h2>
          <p class="course-desc">{{ courseDetail.description || '暂无描述' }}</p>
          <div class="course-meta">
            <span><i class="fas fa-chalkboard-teacher"></i> 授课教师：{{ courseDetail.teacherName }}</span>
            <span><i class="fas fa-star"></i> 学分：{{ courseDetail.credit }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon student">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.studentCount }}</div>
            <div class="stat-label">选课人数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon score">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.avgScore }}<span class="unit">分</span></div>
            <div class="stat-label">平均分</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon rate">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.passRate }}<span class="unit">%</span></div>
            <div class="stat-label">及格率</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon knowledge">
            <i class="fas fa-brain"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.knowledgePointCount }}</div>
            <div class="stat-label">知识点数量</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 知识点列表 -->
    <el-card class="knowledge-list-card" shadow="hover">
      <div class="card-header">
        <h3><i class="fas fa-tags"></i> 知识点列表</h3>
      </div>
      <el-table :data="knowledgePoints" stripe v-loading="loading" style="width: 100%" row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
        <el-table-column prop="name" label="知识点名称" min-width="200">
          <template #default="{ row }">
            <span :class="`mastery-${getMasteryClass(row.classAvgMastery)}`">
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="classAvgMastery" label="掌握度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.classAvgMastery || 0" :stroke-width="8"
              :color="row.classAvgMastery >= 60 ? '#67c23a' : '#f56c6c'" />
          </template>
        </el-table-column>
        <el-table-column prop="weaknessLevel" label="掌握等级" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.classAvgMastery >= 80 ? 'success' : row.classAvgMastery >= 60 ? 'primary' : row.classAvgMastery >= 40 ? 'warning' : 'danger'"
              size="small">
              {{ getMasteryText(row.classAvgMastery) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="childCount" label="子知识点" width="80" align="center">
          <template #default="{ row }">
            {{ row.childCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showKnowledgePointDetail(row.id)">
              <i class="fas fa-eye"></i> 详情
            </el-button>
            <el-button link type="primary" size="small" @click="editKnowledgePoint(row)">
              <i class="fas fa-edit"></i> 编辑
            </el-button>
            <el-button link type="danger" size="small" @click="deleteKnowledgePoint(row.id, row.name)">
              <i class="fas fa-trash"></i> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 可视化图表 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <div class="chart-header">
            <h3><i class="fas fa-chart-bar"></i> 知识点掌握度排行</h3>
          </div>
          <div id="knowledgeChart" class="chart-container" style="height: 400px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <div class="chart-header">
            <h3><i class="fas fa-chart-line"></i> 成绩趋势</h3>
          </div>
          <div id="trendChart" class="chart-container" style="height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <div class="chart-header">
            <h3><i class="fas fa-chart-pie"></i> 成绩分布</h3>
          </div>
          <div id="distributionChart" class="chart-container" style="height: 360px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <div class="chart-header">
            <h3><i class="fas fa-robot"></i> AI 教学建议</h3>
            <el-button type="primary" link @click="aiAnalysisDialogVisible = true" v-if="aiAnalysis">
              查看完整报告 <i class="fas fa-arrow-right"></i>
            </el-button>
          </div>
          <div class="ai-preview" v-if="aiAnalysis">
            <div class="ai-summary">
              <strong>核心总结：</strong>
              <p>{{ aiAnalysis.summary?.slice(0, 200) }}{{ aiAnalysis.summary?.length > 200 ? '...' : '' }}</p>
            </div>
            <div class="ai-suggestions">
              <strong>教学建议：</strong>
              <ul>
                <li v-for="(item, idx) in (aiAnalysis.suggestions || []).slice(0, 3)" :key="idx">{{ item }}</li>
              </ul>
            </div>
          </div>
          <div class="ai-empty" v-else>
            <el-empty description="暂无AI分析数据" :image-size="80" />
            <el-button type="primary" plain @click="fetchAiAnalysis">刷新获取</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加/编辑知识点弹窗 -->
    <el-dialog v-model="kpDialogVisible" :title="isEditKp ? '编辑知识点' : '添加知识点'" width="550px">
      <el-form ref="kpFormRef" :model="kpForm" label-width="100px" :rules="kpRules">
        <el-form-item label="知识点名称" prop="name" required>
          <el-input v-model="kpForm.name" placeholder="请输入知识点名称" />
        </el-form-item>
        <el-form-item label="父知识点">
          <el-select v-model="kpForm.parentId" placeholder="请选择父知识点（可选）" clearable style="width: 100%">
            <el-option v-for="kp in flatKnowledgePoints" :key="kp.id" :label="kp.name" :value="kp.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="层级">
          <el-input-number v-model="kpForm.level" :min="0" :max="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="kpForm.sortOrder" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="kpForm.description" type="textarea" :rows="4" placeholder="请输入知识点描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="kpDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitKnowledgePoint" :loading="kpSubmitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 知识点详情弹窗 -->
    <el-dialog v-model="kpDetailVisible" :title="currentKpDetail?.name" width="750px">
      <div v-if="currentKpDetail" class="kp-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="课程">{{ currentKpDetail.courseName }}</el-descriptions-item>
          <el-descriptions-item label="父知识点">{{ currentKpDetail.parentName || '无' }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentKpDetail.description || '暂无描述' }}</el-descriptions-item>
        </el-descriptions>

        <div class="kp-stats" v-if="currentKpDetail.stats">
          <div class="stat-item">
            <div class="stat-value">{{ currentKpDetail.stats.classAvgMastery }}%</div>
            <div class="stat-label">班级平均掌握度</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ currentKpDetail.stats.highestMastery }}%</div>
            <div class="stat-label">最高掌握度</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ currentKpDetail.stats.lowestMastery }}%</div>
            <div class="stat-label">最低掌握度</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ currentKpDetail.stats.masteredCount }}/{{ currentKpDetail.stats.totalStudents }}
            </div>
            <div class="stat-label">已掌握人数</div>
          </div>
        </div>

        <div class="kp-trend" v-if="currentKpDetail.masteryTrend?.length">
          <h4>掌握度趋势</h4>
          <div id="kpDetailChart" style="height: 280px"></div>
        </div>

        <div class="kp-suggestion" v-if="currentKpDetail.teachingSuggestion">
          <el-alert :title="currentKpDetail.teachingSuggestion" type="info" :closable="false" show-icon />
        </div>
      </div>
    </el-dialog>

    <!-- 添加课程弹窗（管理员） -->
    <el-dialog v-model="courseDialogVisible" title="添加课程" width="550px">
      <el-form ref="courseFormRef" :model="courseForm" label-width="100px">
        <el-form-item label="课程名称" prop="name" required>
          <el-input v-model="courseForm.name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="授课教师" prop="teacherId" required>
          <el-select v-model="courseForm.teacherId" placeholder="请选择授课教师" style="width: 100%">
            <el-option v-for="teacher in teacherList" :key="teacher.id" :label="teacher.name" :value="teacher.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="学分">
          <el-input-number v-model="courseForm.credit" :min="0" :max="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="courseForm.description" type="textarea" :rows="3" placeholder="请输入课程描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="courseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCourse" :loading="courseSubmitting">创建</el-button>
      </template>
    </el-dialog>

    <!-- 知识点批量导入弹窗 -->
    <el-dialog v-model="kpImportDialogVisible" title="批量导入知识点" width="850px">
      <div class="import-content">
        <div class="import-tips">
          <i class="fas fa-info-circle"></i>
          <div>
            <h4>知识点导入说明</h4>
            <p>必填：知识点名称<br>非必填：描述、父知识点名称、层级、排序<br>支持格式：.xlsx, .xls, .csv</p>
          </div>
        </div>

        <div class="import-actions">
          <el-upload ref="kpUploadRef" drag :auto-upload="false" :on-change="handleKpFileChange" :limit="1"
            accept=".xlsx,.xls,.csv">
            <i class="fas fa-cloud-upload-alt"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </el-upload>
          <div v-if="selectedKpFile" class="file-info">
            <el-alert :title="`已选择：${selectedKpFile.name}`" type="info" :closable="false" />
          </div>
        </div>

        <div v-if="selectedKpFile" class="action-buttons">
          <el-button type="primary" @click="uploadKpFile" :loading="kpUploading">
            开始解析
          </el-button>
          <el-button @click="clearKpFile">清空</el-button>
        </div>

        <!-- 解析结果 -->
        <div v-if="kpParseResult" class="parse-result">
          <el-divider>解析结果</el-divider>
          <el-alert :title="kpParseResult.success ? '解析成功' : '解析失败'" :type="kpParseResult.success ? 'success' : 'error'"
            :closable="false" />
          <div class="summary">{{ kpParseResult.summary }}</div>

          <div v-if="kpParseResult.data?.length" class="data-table">
            <h4>解析数据预览（请确认）</h4>
            <el-table :data="kpParseResult.data" border stripe max-height="300" size="small">
              <el-table-column prop="name" label="知识点名称" width="150" />
              <el-table-column prop="parentName" label="父知识点" width="120" />
              <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
              <el-table-column prop="level" label="层级" width="60" />
              <el-table-column prop="sortOrder" label="排序" width="60" />
            </el-table>
          </div>

          <div class="confirm-buttons" v-if="kpParseResult.data?.length">
            <el-button type="success" @click="confirmKpImport" :loading="kpSaving">确认导入</el-button>
            <el-button type="danger" @click="cancelKpImport">取消</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- AI分析报告弹窗 -->
    <el-dialog v-model="aiAnalysisDialogVisible" title="AI 课程分析报告" width="850px">
      <div v-if="aiAnalysis" class="ai-report">
        <div class="report-header">
          <div class="ai-icon"><i class="fas fa-robot"></i></div>
          <div>
            <h3>{{ courseDetail?.name }} - 学情分析报告</h3>
            <span class="date">{{ formatDate(aiAnalysis.createdAt) }}</span>
          </div>
        </div>

        <div class="report-section">
          <h4><i class="fas fa-chart-line"></i> 核心总结</h4>
          <div class="summary">{{ aiAnalysis.summary }}</div>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <div class="report-section strengths">
              <h4><i class="fas fa-thumbs-up"></i> 教学优势</h4>
              <ul>
                <li v-for="item in aiAnalysis.strengths" :key="item">{{ item }}</li>
              </ul>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="report-section weaknesses">
              <h4><i class="fas fa-exclamation-triangle"></i> 薄弱环节</h4>
              <ul>
                <li v-for="item in aiAnalysis.weaknesses" :key="item">{{ item }}</li>
              </ul>
            </div>
          </el-col>
        </el-row>

        <div class="report-section suggestions">
          <h4><i class="fas fa-lightbulb"></i> 教学建议</h4>
          <div class="suggestions-list">
            <div v-for="(item, idx) in aiAnalysis.suggestions" :key="idx" class="suggestion-item">
              <span class="num">{{ idx + 1 }}</span>{{ item }}
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
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
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .filter-left,
    .filter-right {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  .stat-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    height: 120px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    }

    .stat-icon {
      width: 54px;
      height: 54px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;

      &.student {
        background: linear-gradient(135deg, #409eff, #1d4e7c);
      }

      &.score {
        background: linear-gradient(135deg, #67c23a, #529b2e);
      }

      &.rate {
        background: linear-gradient(135deg, #e6a23c, #c28c2e);
      }

      &.knowledge {
        background: linear-gradient(135deg, #f56c6c, #c45656);
      }
    }

    .stat-info {
      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;

        .unit {
          font-size: 14px;
          font-weight: normal;
          margin-left: 4px;
        }
      }

      .stat-label {
        font-size: 13px;
        color: #8b9bb0;
        margin-top: 4px;
      }
    }
  }

  .course-info-card {
    margin: 20px 0;
    border-radius: 16px;

    .course-info {
      display: flex;
      gap: 20px;

      .course-icon {
        width: 70px;
        height: 70px;
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          font-size: 32px;
          color: white;
        }
      }

      .course-detail {
        flex: 1;

        h2 {
          margin: 0 0 8px;
          font-size: 20px;
        }

        .course-desc {
          color: #5f6b7a;
          margin-bottom: 12px;
        }

        .course-meta {
          display: flex;
          gap: 24px;
          font-size: 13px;
          color: #8b9bb0;

          i {
            margin-right: 6px;
          }
        }
      }
    }
  }

  .knowledge-list-card,
  .chart-card {
    margin-top: 20px;
    border-radius: 16px;

    .card-header,
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;

      h3 {
        margin: 0;
        font-size: 16px;

        i {
          margin-right: 8px;
          color: #409eff;
        }
      }
    }
  }

  .chart-container {
    width: 100%;
  }

  .ai-preview {

    .ai-summary,
    .ai-suggestions {
      margin-bottom: 16px;

      p {
        margin: 8px 0 0;
        color: #5f6b7a;
        line-height: 1.6;
      }

      ul {
        margin: 8px 0 0;
        padding-left: 20px;

        li {
          color: #5f6b7a;
          margin: 4px 0;
        }
      }
    }
  }

  .mastery-high {
    color: #67c23a;
    font-weight: 500;
  }

  .mastery-medium {
    color: #409eff;
  }

  .mastery-low-mid {
    color: #e6a23c;
  }

  .mastery-low {
    color: #f56c6c;
    font-weight: 500;
  }
}

.import-content {
  .import-tips {
    background: #ecf5ff;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    gap: 12px;

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
    margin: 20px 0;
    text-align: center;
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

.ai-report {
  .report-header {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 24px;

    .ai-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #409eff, #1d4e7c);
      border-radius: 28px;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 28px;
        color: white;
      }
    }

    h3 {
      margin: 0 0 4px;
    }

    .date {
      font-size: 12px;
      color: #8b9bb0;
    }
  }

  .report-section {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 12px;
      font-size: 15px;

      i {
        margin-right: 8px;
      }
    }

    .summary {
      background: #f0f7ff;
      padding: 16px;
      border-radius: 12px;
      line-height: 1.6;
    }

    ul {
      margin: 0;
      padding-left: 20px;

      li {
        margin: 8px 0;
      }
    }

    .suggestions-list {
      .suggestion-item {
        padding: 10px 0;
        border-bottom: 1px solid #e2e8f0;

        .num {
          display: inline-block;
          width: 24px;
          height: 24px;
          background: #409eff;
          color: white;
          border-radius: 12px;
          text-align: center;
          line-height: 24px;
          font-size: 12px;
          margin-right: 12px;
        }

        &:last-child {
          border-bottom: none;
        }
      }
    }
  }

  .strengths ul li {
    color: #67c23a;
  }

  .weaknesses ul li {
    color: #f56c6c;
  }
}

.kp-detail {
  .kp-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin: 20px 0;

    .stat-item {
      text-align: center;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;

      .stat-value {
        font-size: 22px;
        font-weight: 700;
        color: #1d4e7c;
      }

      .stat-label {
        font-size: 12px;
        color: #5f6b7a;
        margin-top: 4px;
      }
    }
  }

  .kp-trend {
    margin: 20px 0;

    h4 {
      margin: 0 0 12px;
    }
  }

  .kp-suggestion {
    margin-top: 20px;
  }
}
</style>