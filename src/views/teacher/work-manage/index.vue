<script setup>
import { ref, reactive, onMounted, watch, computed, nextTick } from 'vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import StatsCard from '../user-manage/component/stats-card.vue'
import { exportHomeworkListToExcel, exportHomeworkGradesToExcel, exportHomeworkAnalysisToExcel, formatExamDate } from '@/utils/export'
import { tHomeworkApi, tDashboardApi, unifiedAiApi, fileApi, tCourseApi } from '@/api/index.js'
import AiAnalysis from '@/components/AiAnalysis.vue'

// ==================== 作业批量导入相关 ====================
const homeworkImportDialogVisible = ref(false)
const homeworkUploadRef = ref(null)
const selectedHomeworkFile = ref(null)
const homeworkUploading = ref(false)
const homeworkParseResult = ref(null)
const homeworkSaving = ref(false)
// 文件上传前的校验
const beforeUpload = (file) => {
  const isValidSize = file.size / 1024 / 1024 < 10
  if (!isValidSize) {
    ElMessage.error('文件大小不能超过 10MB')
    return false
  }
  const isValidType = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')
  if (!isValidType) {
    ElMessage.error('仅支持 .xlsx, .xls, .csv 格式文件')
    return false
  }
  return true
}

// 打开作业批量导入弹窗
const showHomeworkImportDialog = () => {
  homeworkParseResult.value = null
  selectedHomeworkFile.value = null
  homeworkImportDialogVisible.value = true
  setTimeout(() => {
    homeworkUploadRef.value?.clearFiles()
  }, 100)
}

// 处理作业文件变化
const handleHomeworkFileChange = (file) => {
  selectedHomeworkFile.value = file.raw
  homeworkParseResult.value = null
}
// 上传并解析作业文件
const uploadHomeworkFile = async () => {
  if (!selectedHomeworkFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  homeworkUploading.value = true
  try {
    const result = await fileApi.uploadFile(selectedHomeworkFile.value, "homework")
    homeworkParseResult.value = result.data

    // 为每行数据添加默认值
    if (homeworkParseResult.value.data) {
      for (const row of homeworkParseResult.value.data) {
        row.totalScore = row.totalScore || 100
        row.knowledgePointIds = row.knowledgePointIds || []
        // 如果AI返回了知识点名称，尝试匹配知识点ID
        if (row.knowledgePointNames && !row.knowledgePointIds?.length) {
          const kpNames = Array.isArray(row.knowledgePointNames)
            ? row.knowledgePointNames
            : row.knowledgePointNames.split(/[,，、]/)

          const matchedIds = []
          const courseKps = courseKnowledgePointsMap.value.get(row.courseId) || []

          for (const kpName of kpNames) {
            const matched = courseKps.find(kp =>
              kp.name === kpName || kp.name.includes(kpName) || kpName.includes(kp.name)
            )
            if (matched) {
              matchedIds.push(matched.id)
            }
          }
          row.knowledgePointIds = matchedIds
        }
      }
    }

    if (homeworkParseResult.value.success) {
      ElMessage.success(`解析成功！共 ${homeworkParseResult.value.data?.length || 0} 条数据`)
    } else {
      ElMessage.error('解析失败，请检查文件格式')
    }
  } catch (error) {
    console.error('上传失败', error)
    ElMessage.error(error.message || '上传失败，请稍后重试')
  } finally {
    homeworkUploading.value = false
  }
}

// 确认导入作业
const confirmHomeworkImport = async () => {
  if (!homeworkParseResult.value?.data || homeworkParseResult.value.data.length === 0) {
    ElMessage.warning('没有可导入的数据')
    return
  }

  // 校验所有行的必填字段
  const invalidRows = []
  homeworkParseResult.value.data.forEach((row, index) => {
    if (!row.name || !row.courseId || !row.deadline) {
      invalidRows.push(index + 1)
    }
  })

  if (invalidRows.length > 0) {
    ElMessage.error(`第 ${invalidRows.join(', ')} 行存在未填写的必填项，请补充完整后再导入`)
    return
  }
  try {
    await ElMessageBox.confirm(`确认导入 ${homeworkParseResult.value.data.length} 条作业数据吗？`, '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    homeworkSaving.value = true
    // 准备导入数据
    const importData = homeworkParseResult.value.data.map(row => ({
      name: row.name,
      courseId: row.courseId,
      deadline: row.deadline,
      classId: row.classId || null,
      totalScore: row.totalScore || 100,
      description: row.description || null,
      knowledgePointIds: row.knowledgePointIds || null
    }))

    const res = await fileApi.confirmInsert(importData, "homework")

    if (res.data && res.data.success) {
      ElMessage.success(res.data.message || '导入成功')
      homeworkImportDialogVisible.value = false
      homeworkParseResult.value = null
      selectedHomeworkFile.value = null
      homeworkUploadRef.value?.clearFiles()
      // 刷新列表
      await fetchHomeworkList()
      await fetchStatistics()
    } else {
      ElMessageBox.alert(
        res.data?.message || '导入完成，但存在失败项',
        '导入结果详情',
        {
          confirmButtonText: '知道了',
          type: 'warning',
          dangerouslyUseHTMLString: false
        }
      )
    }
  } catch (error) {
    ElMessageBox.alert(
      error?.message || '导入完成，但存在失败项',
      '导入结果详情',
      {
        confirmButtonText: '知道了',
        type: 'warning',
        dangerouslyUseHTMLString: false
      }
    )
  } finally {
    homeworkSaving.value = false
  }
}

// 取消导入
const cancelHomeworkImport = async () => {
  try {
    await ElMessageBox.confirm('确认要取消导入吗？取消后数据将消失', '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    homeworkParseResult.value = null
    selectedHomeworkFile.value = null
    homeworkUploadRef.value?.clearFiles()
    homeworkImportDialogVisible.value = false
    ElMessage.success('已取消')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消失败', error)
    }
  }
}

// 清空文件
const clearHomeworkFile = () => {
  selectedHomeworkFile.value = null
  homeworkParseResult.value = null
  homeworkUploadRef.value?.clearFiles()
}

// 重置导入弹窗数据
const resetHomeworkImportData = () => {
  homeworkParseResult.value = null
  selectedHomeworkFile.value = null
  homeworkUploadRef.value?.clearFiles()
}

// ==================== 作业成绩批量导入相关 ====================
const homeworkGradeImportDialogVisible = ref(false)
const homeworkGradeUploadRef = ref(null)
const selectedHomeworkGradeFile = ref(null)
const homeworkGradeUploading = ref(false)
const homeworkGradeParseResult = ref(null)
const homeworkGradeSaving = ref(false)
const selectedHomeworkForGrade = ref(null)
const selectedHomeworkGradeInfo = ref(null)

// 打开作业成绩导入弹窗
const showHomeworkGradeImportDialog = (homework) => {
  // 如果没有作业列表，先加载
  if (homeworkList.value.length === 0) {
    fetchHomeworkList()
  }
  homeworkGradeParseResult.value = null
  selectedHomeworkGradeFile.value = null
  selectedHomeworkForGrade.value = homework?.id || null
  selectedHomeworkGradeInfo.value = null
  homeworkGradeImportDialogVisible.value = true
  setTimeout(() => {
    homeworkGradeUploadRef.value?.clearFiles()
  }, 100)
}
// 选择作业后获取作业信息
const handleHomeworkGradeChange = (homeworkId) => {
  const homework = homeworkList.value.find(h => h.id === homeworkId)
  if (homework) {
    selectedHomeworkGradeInfo.value = {
      id: homework.id,
      name: homework.name,
      totalScore: homework.totalScore || 100,
      courseName: homework.courseName
    }
  }
}

// 处理文件变化
const handleHomeworkGradeFileChange = (file) => {
  selectedHomeworkGradeFile.value = file.raw
  homeworkGradeParseResult.value = null
}

// 上传并解析作业成绩文件
const uploadHomeworkGradeFile = async () => {
  if (!selectedHomeworkGradeFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  if (!selectedHomeworkForGrade.value) {
    ElMessage.warning('请先选择作业')
    return
  }

  homeworkGradeUploading.value = true
  try {
    const result = await fileApi.uploadFile(selectedHomeworkGradeFile.value, "homework_grade")
    homeworkGradeParseResult.value = result.data

    if (homeworkGradeParseResult.value.success) {
      ElMessage.success(`解析成功！共 ${homeworkGradeParseResult.value.data?.length || 0} 条数据`)
    } else {
      ElMessage.error('解析失败，请检查文件格式')
    }
  } catch (error) {
    console.error('上传失败', error)
    ElMessage.error(error.message || '上传失败，请稍后重试')
  } finally {
    homeworkGradeUploading.value = false
  }
}

// 确认导入作业成绩
const confirmHomeworkGradeImport = async () => {
  if (!homeworkGradeParseResult.value?.data || homeworkGradeParseResult.value.data.length === 0) {
    ElMessage.warning('没有可导入的数据')
    return
  }

  if (!selectedHomeworkForGrade.value) {
    ElMessage.warning('请选择作业')
    return
  }

  // 校验所有行的必填字段
  const invalidRows = []
  homeworkGradeParseResult.value.data.forEach((row, index) => {
    if (!row.studentName || row.score === undefined || row.score === null) {
      invalidRows.push(index + 1)
    }
  })

  if (invalidRows.length > 0) {
    ElMessage.error(`第 ${invalidRows.join(', ')} 行存在未填写的必填项，请补充完整后再导入`)
    return
  }

  try {
    await ElMessageBox.confirm(`确认将 ${homeworkGradeParseResult.value.data.length} 条成绩导入到作业「${selectedHomeworkGradeInfo.value?.name}」吗？`, '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    homeworkGradeSaving.value = true
    // 准备导入数据
    const importData = homeworkGradeParseResult.value.data.map(row => ({
      studentName: row.studentName,
      score: row.score,
      feedback: row.feedback || null
    }))

    const res = await tHomeworkApi.confirmHomeworkGradeInsert(
      selectedHomeworkForGrade.value,
      importData,
      "homework_grade"
    )

    if (res.data && res.data.success) {
      ElMessage.success(res.data.message || '成绩导入成功')
      homeworkGradeImportDialogVisible.value = false
      homeworkGradeParseResult.value = null
      selectedHomeworkGradeFile.value = null
      selectedHomeworkForGrade.value = null
      selectedHomeworkGradeInfo.value = null
      homeworkGradeUploadRef.value?.clearFiles()
      // 刷新作业列表（更新统计数据）
      await fetchHomeworkList()
      await fetchStatistics()
    } else {
      ElMessageBox.alert(
        res.data?.message || '导入完成，但存在失败项',
        '导入结果详情',
        {
          confirmButtonText: '知道了',
          type: 'warning',
          dangerouslyUseHTMLString: false
        }
      )
    }
  } catch (error) {
    ElMessageBox.alert(
      error?.message || '导入完成，但存在失败项',
      '导入结果详情',
      {
        confirmButtonText: '知道了',
        type: 'warning',
        dangerouslyUseHTMLString: false
      }
    )
  } finally {
    homeworkGradeSaving.value = false
  }
}

// 取消导入
const cancelHomeworkGradeImport = async () => {
  try {
    await ElMessageBox.confirm('确认要取消导入吗？取消后数据将消失', '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    homeworkGradeParseResult.value = null
    selectedHomeworkGradeFile.value = null
    homeworkGradeUploadRef.value?.clearFiles()
    homeworkGradeImportDialogVisible.value = false
    ElMessage.success('已取消')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消失败', error)
    }
  }
}
// 清空文件
const clearHomeworkGradeFile = () => {
  selectedHomeworkGradeFile.value = null
  homeworkGradeParseResult.value = null
  homeworkGradeUploadRef.value?.clearFiles()
}

// 重置导入弹窗数据
const resetHomeworkGradeImportData = () => {
  homeworkGradeParseResult.value = null
  selectedHomeworkGradeFile.value = null
  selectedHomeworkForGrade.value = null
  selectedHomeworkGradeInfo.value = null
  homeworkGradeUploadRef.value?.clearFiles()
}

// 当前课程的知识点列表
const currentCourseKnowledgePoints = ref([])

// 课程切换时加载知识点
const onHomeworkCourseChange = async (courseId) => {
  if (!courseId) {
    currentCourseKnowledgePoints.value = []
    homeworkForm.value.knowledgePointIds = []
    return
  }
  homeworkForm.value.knowledgePointIds = []
  if (courseKnowledgePointsMap.value.has(courseId)) {
    currentCourseKnowledgePoints.value = courseKnowledgePointsMap.value.get(courseId)
  } else {
    try {
      const res = await tCourseApi.getKnowledgePoints(courseId)
      console.log('获取知识点成功1 Test', res)
      currentCourseKnowledgePoints.value = res.data || []
      courseKnowledgePointsMap.value.set(courseId, currentCourseKnowledgePoints.value)
    } catch (error) {
      console.error('加载知识点失败:', error)
    }
  }
}

// 课程知识点映射（用于快速查找）
const courseKnowledgePointsMap = ref(new Map())
// 加载所有知识点（按课程分组）
const fetchAllKnowledgePoints = async () => {
  try {
    const promises = courseList.value.map(async (course) => {
      const res = await tCourseApi.getKnowledgePoints(course.id)
      return { courseId: course.id, list: res.data || [] }
    })
    const results = await Promise.all(promises)
    const map = new Map()
    results.forEach(result => {
      map.set(result.courseId, result.list)
    })
    courseKnowledgePointsMap.value = map
  } catch (error) {
    console.error('加载知识点失败:', error)
  }
}

// 获取单次作业的AI分析
const fetchHomeworkAiAnalysis = async (homeworkId, forceRefresh = false) => {
  if (!homeworkId) return

  homeworkAiLoading.value = true
  try {
    const api = forceRefresh ? unifiedAiApi.refresh : unifiedAiApi.analyze
    const res = await api({
      targetType: 'HOMEWORK',
      targetId: homeworkId,
      reportType: 'HOMEWORK_ANALYSIS',
      forceRefresh: forceRefresh
    })
    if (res && res.data) {
      homeworkAiAnalysis.value = res.data
    }
  } catch (error) {
    console.error('获取作业AI分析失败:', error)
  } finally {
    homeworkAiLoading.value = false
  }
}

// 刷新作业AI分析
const refreshHomeworkAiAnalysis = () => {
  if (analysisData.value?.id) {
    fetchHomeworkAiAnalysis(analysisData.value.id, true)
  }
}

// 作业分析弹窗中的AI数据
const homeworkAiAnalysis = ref({})
const homeworkAiLoading = ref(false)



const loading = ref(false)
const activeGradeTab = ref('pending')
const analysisRef = ref(null)

// 筛选条件
const searchModel = ref({
  classId: '',
  courseId: '',
  keyword: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 列表数据
const homeworkList = ref([])
const classList = ref([])
const courseList = ref([])

// 统计数据
const statistics = reactive({
  totalHomework: 0,
  avgScore: 0,
  avgPassRate: 0,
  onTimeRate: 0
})

// 弹窗控制
const analysisDialogVisible = ref(false)


// 批改相关
const currentHomework = ref(null)
const currentSubmission = ref(null)
const submissionsList = ref([])
const gradedCount = computed(() => {
  return submissionsList.value.filter(s => s.status === 'graded').length
})
const pendingSubmissions = computed(() => {
  return submissionsList.value.filter(s => s.status === 'pending')
})
const gradedSubmissions = computed(() => {
  return submissionsList.value.filter(s => s.status === 'graded')
})

// 分析数据
const analysisData = ref(null)
let scoreChart = null


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

const fetchCourseList = async () => {
  try {
    const res = await tDashboardApi.getCourseList()
    if (res && res.data) {
      courseList.value = res.data
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
}
const fetchHomeworkList = async () => {
  loading.value = true
  try {
    const res = await tHomeworkApi.getHomeworkList({
      page: pagination.page - 1,
      size: pagination.pageSize,
      classId: searchModel.value.classId,
      courseId: searchModel.value.courseId,
      keyword: searchModel.value.keyword
    })
    if (res && res.data) {
      homeworkList.value = res.data.list || []
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取作业列表失败:', error)
    ElMessage.error('获取作业列表失败')
  } finally {
    loading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    const res = await tHomeworkApi.getHomeworkStatistics({ courseId: searchModel.value.courseId })
    if (res && res.data) {
      Object.assign(statistics, res.data)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 删除作业
const deleteHomework = async (homework) => {
  ElMessageBox.confirm(`确认删除作业 "${homework?.name}" 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await tHomeworkApi.deleteHomework(homework?.id)
    if (res && res.code === 200) {
      ElMessage.success('删除成功')
      await fetchHomeworkList()
      await fetchStatistics()
    }
  }).catch(() => { })
}
const fetchHomeworkAnalysis = async (homeworkId) => {
  const res = await tHomeworkApi.getHomeworkAnalysis(homeworkId)
  if (res && res.data) {
    return res.data
  }
  return null
}

const getStatusType = (status) => {
  const map = {
    "COMPLETED": 'primary',
    "PENDING": 'warning',
    "COMPLETED": 'success',
    "GRADED": 'info'
  }
  return map[status] || 'info'
}

const calculateTotalScore = () => {
  if (!currentSubmission.value) return 0
  return currentSubmission.value.answers.reduce((sum, q) => sum + (q.givenScore || 0), 0)
}

const totalScore = computed(() => {
  if (!currentSubmission.value) return 0
  return currentSubmission.value.answers.reduce((sum, q) => sum + q.score, 0)
})

const handleSearch = () => {
  pagination.page = 1
  fetchHomeworkList()
  fetchStatistics()
}

const handleFilterChange = () => {
  pagination.page = 1
  fetchHomeworkList()
  fetchStatistics()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchHomeworkList()
}

const handlePageChange = (page) => {
  pagination.page = page
  fetchHomeworkList()
}

// ==================== 创建/编辑作业相关 ====================
const homeworkDialogVisible = ref(false)
const homeworkFormRef = ref(null)
const homeworkSubmitting = ref(false)

const homeworkForm = ref({
  id: null,
  name: '',
  description: '',
  knowledgePointIds: [],
  courseId: '',
  totalScore: 100,
  deadline: ''
})

const homeworkDialogTitle = computed(() => homeworkForm.value.id ? '编辑作业' : '创建作业')

const homeworkRules = {
  name: [{ required: true, message: '请输入作业名称', trigger: 'blur' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  totalScore: [{ required: true, message: '请输入总分', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择截止时间', trigger: 'change' }]
}

// 显示创建作业弹窗
const showCreateDialog = () => {
  resetHomeworkForm()
  homeworkDialogVisible.value = true
}

// 编辑作业
const editHomework = (homework) => {
  homeworkForm.value = {
    id: homework.id,
    name: homework.name,
    description: homework.description || '',
    knowledgePointIds: homework.knowledgePointIds || [],
    courseId: homework.courseId,
    totalScore: homework.totalScore || 100,
    deadline: homework.deadline || ''
  }
  if (homework.courseId) {
    onHomeworkCourseChange(homework.courseId)
  }
  homeworkDialogVisible.value = true
}

// 重置表单
const resetHomeworkForm = () => {
  homeworkForm.value = {
    id: null,
    name: '',
    description: '',
    knowledgePointIds: [],
    courseId: '',
    totalScore: 100,
    deadline: ''
  }
  currentCourseKnowledgePoints.value = []
  homeworkFormRef.value?.resetFields()
}

// 创建作业
const createHomework = async (data) => {
  const res = await tHomeworkApi.createHomework(data)
  if (res && res.code === 200) {
    ElMessage.success('作业创建成功')
    return true
  }
  return false
}

// 更新作业
const updateHomework = async (data) => {
  const res = await tHomeworkApi.updateHomework(data.id, data)
  if (res && res.code === 200) {
    ElMessage.success('更新成功')
    return true
  }
  return false
}

// 提交作业表单
const submitHomework = async () => {
  await homeworkFormRef.value?.validate()

  homeworkSubmitting.value = true
  try {
    let success
    if (homeworkForm.value.id) {
      success = await updateHomework(homeworkForm.value)
    } else {
      success = await createHomework(homeworkForm.value)
    }

    if (success) {
      homeworkDialogVisible.value = false
      await fetchHomeworkList()
      await fetchStatistics()
    }
  } catch (error) {
    console.error('保存作业失败:', error)
    ElMessage.error(error.message || '保存失败')
  } finally {
    homeworkSubmitting.value = false
  }
}

const viewAnalysis = async (homework) => {
  await fetchHomeworkAiAnalysis(homework?.id)
  analysisDialogVisible.value = true
  const data = await fetchHomeworkAnalysis(homework?.id)
  analysisData.value = data
  setTimeout(() => {
    initAnalysisCharts()
  }, 100)
}
const scoreDistributionArray = computed(() => {
  if (!analysisData.value.scoreDistribution) return []

  const dist = analysisData.value.scoreDistribution
  return [
    { range: '0-59', count: dist.failCount || 0 },
    { range: '60-69', count: dist.passCount || 0 },
    { range: '70-79', count: dist.mediumCount || 0 },
    { range: '80-89', count: dist.goodCount || 0 },
    { range: '90-100', count: dist.excellentCount || 0 }
  ]
})
const initAnalysisCharts = () => {
  if (!analysisData.value) return

  // 成绩分布图
  const scoreChartDom = document.getElementById('scoreDistributionChart')
  if (scoreChartDom && analysisData.value.scoreDistribution) {
    if (scoreChart) scoreChart.dispose()
    scoreChart = echarts.init(scoreChartDom)
    scoreChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: scoreDistributionArray.value.map(d => d.range)
      },
      yAxis: {
        type: 'value',
        name: '人数'
      },
      series: [{
        type: 'bar',
        data: scoreDistributionArray.value.map(d => d.count),
        itemStyle: { borderRadius: [8, 8, 0, 0], color: '#1d4e7c' },
        label: { show: true, position: 'top' }
      }]
    })
  }
}

const exportAnalysisReport = async () => {
  if (!analysisRef.value) return
  const loading = ElLoading.service({
    text: '正在生成PDF，请稍候...',
    fullscreen: true
  })

  try {
    const element = analysisRef.value

    // 确保表格完全渲染
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 500))

    // 保存原始样式
    const originalOverflow = element.style.overflow
    const originalHeight = element.style.height

    element.style.overflow = 'visible'
    element.style.height = 'auto'

    // 强制表格重新计算布局
    const tables = element.querySelectorAll('.el-table__body-wrapper')
    tables.forEach(table => {
      table.style.overflow = 'visible'
      table.style.height = 'auto'
    })

    await new Promise(resolve => setTimeout(resolve, 300))

    // 获取 ECharts 配置
    const chartDom = document.querySelector('#scoreDistributionChart')
    let chartOption = null
    if (chartDom && window.echarts) {
      const chart = window.echarts.getInstanceByDom(chartDom)
      if (chart) {
        chartOption = chart.getOption()
      }
    }

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      logging: true,
      onclone: (clonedDoc, clonedElement) => {
        // 修复克隆文档中的表格样式
        const clonedTables = clonedDoc.querySelectorAll('.el-table__body-wrapper')
        clonedTables.forEach(table => {
          table.style.overflow = 'visible'
          table.style.height = 'auto'
          table.style.maxHeight = 'none'
        })

        // 重建图表
        const clonedChart = clonedDoc.querySelector('#scoreDistributionChart')
        if (clonedChart && chartOption && window.echarts) {
          const newChart = window.echarts.init(clonedChart)
          newChart.setOption(chartOption)
        }
      }
    })

    // 恢复原始样式
    element.style.overflow = originalOverflow
    element.style.height = originalHeight

    tables.forEach(table => {
      table.style.overflow = ''
      table.style.height = ''
    })

    const imgWidth = 595.28
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const pageData = canvas.toDataURL('image/jpeg', 1.0)
    const pdf = new jsPDF('p', 'pt', 'a4')

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= 841.89

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= 841.89
    }

    pdf.save('作业分析报告.pdf')
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  } finally {
    loading.close()
  }
}
// 添加导出作业列表的方法
const exportHomeworkList = () => {
  try {
    if (homeworkList.value.length === 0) {
      ElMessage.warning('没有可导出的数据')
      return
    }

    const exportData = homeworkList.value.map(item => ({
      ...item,
      deadlineStr: item.deadline,
      submitRate: item.totalStudents ? ((item.submittedCount / item.totalStudents) * 100).toFixed(1) : 0
    }))

    exportHomeworkListToExcel(exportData, `作业列表_${new Date().toLocaleDateString()}`)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 添加导出作业成绩单的方法
const exportHomeworkGrades = async (homework) => {
  try {
    loading.value = true
    // 获取作业的详细成绩数据
    const analysisRes = await tHomeworkApi.getHomeworkAnalysis(homework.id)

    if (analysisRes?.data) {
      const analysisData = analysisRes.data
      const grades = analysisData.studentGrades || []

      if (grades.length === 0) {
        ElMessage.warning('暂无成绩数据可导出')
        return
      }

      const homeworkInfo = {
        name: homework.name,
        courseName: homework.courseName,
        deadline: homework.deadline,
        totalScore: homework.totalScore,
        submittedCount: homework.submittedCount,
        totalStudents: homework.totalStudents,
        avgScore: homework.avgScore,
        passRate: homework.passRate,
        passScore: 60
      }

      exportHomeworkGradesToExcel(homeworkInfo, grades, `作业成绩单`)
      ElMessage.success('导出成功')
    } else {
      ElMessage.warning('暂无成绩数据可导出')
    }
  } catch (error) {
    console.error('导出成绩单失败:', error)
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

// 添加导出分析报告的方法（Excel格式）
const exportAnalysisReportExcel = () => {
  if (!analysisData.value) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  exportHomeworkAnalysisToExcel(analysisData.value, '作业分析报告')
  ElMessage.success('导出成功')
}


onMounted(async () => {
  await fetchClassList()
  await fetchCourseList()
  await fetchStatistics()
  await fetchHomeworkList()
  await fetchAllKnowledgePoints()
})
</script>

<template>
  <div class="work-manage-container">
    <div class="action-bar">
      <div class="action-left">
        <el-select size="large" v-model="searchModel.courseId" placeholder="按课程筛选" clearable style="width: 150px"
          @change="handleFilterChange">
          <el-option v-for="cls in courseList" :key="cls.id" :label="cls.name" :value="cls.id" />
        </el-select>
        <el-input v-model="searchModel.keyword" placeholder="搜索作业名称" prefix-icon="Search" clearable style="width: 220px"
          @clear="handleSearch" @keyup.enter="handleSearch" />
      </div>
      <div class="action-right">
        <el-button type="primary" @click="handleSearch">
          <i class="fas fa-search"></i> 搜索
        </el-button>
        <el-button type="primary" @click="showCreateDialog">
          <i class="fas fa-plus"></i> 创建作业
        </el-button>
        <el-button @click="showHomeworkImportDialog">
          <i class="fas fa-upload"></i> 批量导入
        </el-button>
        <el-button @click="exportHomeworkList">
          <i class="fas fa-file-excel"></i> 导出数据
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <stats-card type="total" icon="fa-book-open" title="作业总数" :value="statistics.totalHomework" />
      </el-col>
      <el-col :span="6">
        <stats-card type="avg-score" icon="fa-clock" title="平均分" :value="statistics.avgScore" />
      </el-col>
      <el-col :span="6">
        <stats-card type="completed" icon="fa-check-circle" title="及格率" :value="statistics.avgPassRate" />
      </el-col>
      <el-col :span="6">
        <stats-card type="pending" icon="fa-chart-line" title="提交率" :value="statistics.onTimeRate" />
      </el-col>
    </el-row>

    <div class="table-container" style="margin-top:20px;">
      <el-table :data="homeworkList" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="name" label="作业名称" width="200" />
        <el-table-column prop="courseName" label="课程" width="130" />
        <el-table-column prop="submittedCount" label="提交量" width="120">
          <template #default="{ row }">
            <div class="info-row">
              <span><i class="fas fa-user-check"></i> {{ row.submittedCount }}/{{ row.totalStudents }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="avgScore" label="平均分/总分" min-width="120">
          <template #default="{ row }">
            <div class="info-row">
              <span><i class="fas fa-check-double"></i> {{ row.avgScore || 0 }}/{{ row.totalScore }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="passRate" label="通过率" min-width="70">
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止时间" width="180" sortable>
          <template #default="{ row }">
            {{ formatExamDate(row.deadline) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewAnalysis(row)">
              <i class="fas fa-eye"></i> 查看详情
            </el-button>
            <el-button link type="primary" size="small" @click="editHomework(row)">
              <i class="fas fa-edit"></i> 编辑
            </el-button>
            <el-button link type="primary" size="small" @click="deleteHomework(row)">
              <i class="fas fa-trash"></i> 删除
            </el-button>
            <el-button link type="primary" size="small" @click="showHomeworkGradeImportDialog(row)">
              <i class="fas fa-edit"></i> 录入成绩
            </el-button>
            <el-button link type="primary" size="small" @click="exportHomeworkGrades(row)">
              <i class="fas fa-download"></i> 导出成绩单
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

    <!-- 作业分析弹窗 -->
    <el-dialog v-model="analysisDialogVisible" title="作业分析报告" width="800px" :close-on-click-modal="false">

      <div v-if="analysisData" class="analysis-content" ref="analysisRef">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="作业名称">{{ analysisData?.name }}</el-descriptions-item>
          <el-descriptions-item label="课程">{{ analysisData?.courseName }}</el-descriptions-item>
          <el-descriptions-item v-if="analysisData?.description" label="描述">{{ analysisData?.description || '无'
          }}</el-descriptions-item>
        </el-descriptions>
        <!-- 概览卡片 -->
        <div class="analysis-stats" style="margin-top: 20px;">
          <div class="stat-item">
            <div class="stat-value">{{ analysisData.avgScore }}分</div>
            <div class="stat-label">平均分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ analysisData?.scoreDistribution?.highestScore }}分</div>
            <div class="stat-label">最高分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ analysisData?.scoreDistribution?.lowestScore }}分</div>
            <div class="stat-label">最低分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ analysisData?.passRate }}%</div>
            <div class="stat-label">及格率</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ analysisData?.submitRate }}%</div>
            <div class="stat-label">提交率</div>
          </div>
        </div>
        <el-row :gutter="20" style="margin-top: 20px;margin-bottom: 20px;">
          <el-col :span="24">
            <el-card shadow="always">
              <template #header>
                <div class="card-header">
                  <span>🤖 AI 分析</span>
                  <el-button size="small" type="primary" @click="refreshHomeworkAiAnalysis"
                    :loading="homeworkAiLoading">
                    <i class="fas fa-sync-alt"></i> 刷新分析
                  </el-button>
                </div>
              </template>
              <div v-loading="homeworkAiLoading">
                <AiAnalysis :ai-analysis="homeworkAiAnalysis" />
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 成绩分布图 -->
        <div class="analysis-chart">
          <h4>成绩分布</h4>
          <div id="scoreDistributionChart" style="height: 280px"></div>
        </div>
        <!-- 作业成绩列表 -->
        <div class="analysis-table">
          <h4>作业成绩列表</h4>
          <el-table :data="analysisData.studentGrades" stripe>
            <el-table-column prop="studentNo" label="学号" />
            <el-table-column prop="studentName" label="学生姓名" />
            <el-table-column prop="score" label="得分" width="100" />
            <el-table-column prop="feedback" label="批注" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.feedback || '无' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="analysisDialogVisible = false">关闭</el-button>
        <!-- <el-button type="primary" @click="exportAnalysisReport(analysisData)">
          <i class="fas fa-file-pdf"></i> 导出报告
        </el-button> -->
        <el-button type="success" @click="exportAnalysisReportExcel">
          <i class="fas fa-file-excel"></i> 导出Excel报告
        </el-button>
      </template>
    </el-dialog>
    <!-- 创建/编辑作业弹窗 -->
    <el-dialog v-model="homeworkDialogVisible" :title="homeworkDialogTitle" width="700px" @close="resetHomeworkForm"
      body-class="form-dialog">
      <el-form ref="homeworkFormRef" :model="homeworkForm" :rules="homeworkRules" label-width="100px">
        <el-form-item label="作业名称" prop="name">
          <el-input v-model="homeworkForm.name" placeholder="请输入作业名称" />
        </el-form-item>

        <el-form-item label="所属课程" prop="courseId">
          <el-select v-model="homeworkForm.courseId" placeholder="请选择课程" style="width: 100%"
            @change="onHomeworkCourseChange">
            <el-option v-for="course in courseList" :key="course.id" :label="course.name" :value="course.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="知识点" prop="knowledgePointIds">
          <el-select v-model="homeworkForm.knowledgePointIds" multiple collapse-tags placeholder="请选择知识点（可多选）"
            filterable clearable style="width: 100%">
            <el-option v-for="kp in currentCourseKnowledgePoints" :key="kp.id" :label="kp.name" :value="kp.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="总分" prop="totalScore">
          <el-input-number v-model="homeworkForm.totalScore" :min="0" :max="1000" :step="10" style="width: 100%" />
        </el-form-item>

        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker v-model="homeworkForm.deadline" type="datetime" placeholder="选择截止时间"
            format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%" />
        </el-form-item>

        <el-form-item label="作业描述" prop="description">
          <el-input v-model="homeworkForm.description" type="textarea" :rows="4" placeholder="请输入作业描述（可选）" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="homeworkDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitHomework" :loading="homeworkSubmitting">保存</el-button>
      </template>
    </el-dialog>

    <!-- 作业批量导入弹窗 -->
    <el-dialog v-model="homeworkImportDialogVisible" title="批量导入作业" width="1000px" @close="resetHomeworkImportData">
      <div class="import-content">
        <div class="import-tips">
          <i class="fas fa-info-circle"></i>
          <div>
            <h4>作业信息导入说明</h4>
            <p>必填：作业名称、课程名称、截止时间 <span style="color: #f56c6c;">*</span><br>
              非必填：班级、总分、描述<br>
              默认：总分=100，状态根据截止时间自动判断<br>
              支持格式：.xlsx, .xls, .csv</p>
          </div>
        </div>

        <div class="import-actions">
          <el-upload ref="homeworkUploadRef" class="upload-demo" drag :auto-upload="false"
            :on-change="handleHomeworkFileChange" :before-upload="beforeUpload" :limit="1" accept=".xlsx,.xls,.csv">
            <i class="fas fa-cloud-upload-alt"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持 .xlsx, .csv 格式文件，文件大小不超过10MB</div>
            </template>
          </el-upload>
          <div v-if="selectedHomeworkFile" class="file-info">
            <el-alert :title="`已选择文件：${selectedHomeworkFile.name}`" type="info" :closable="false" />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div v-if="selectedHomeworkFile" class="action-buttons">
          <el-button type="primary" @click="uploadHomeworkFile" :loading="homeworkUploading">
            <el-icon>
              <Upload />
            </el-icon> 开始解析
          </el-button>
          <el-button @click="clearHomeworkFile">清空</el-button>
        </div>

        <!-- 解析结果展示 -->
        <div v-if="homeworkParseResult" class="parse-result">
          <el-divider>解析结果</el-divider>

          <el-alert v-if="homeworkParseResult.success" title="解析成功" type="success" :closable="false" />
          <el-alert v-else title="解析失败" type="error" :closable="false">
            <template #default>
              <div v-for="(error, idx) in homeworkParseResult.errors" :key="idx" class="error-item">
                {{ error.errorMessage }}
              </div>
            </template>
          </el-alert>

          <div class="summary"><strong>摘要：</strong>{{ homeworkParseResult.summary }}</div>

          <!-- 解析出的数据表格 -->
          <div v-if="homeworkParseResult.data && homeworkParseResult.data.length > 0" class="data-table">
            <h4>解析出的数据（请确认，<span style="color: #f56c6c;">*</span>为必填项）</h4>
            <el-table :data="homeworkParseResult.data" border stripe max-height="400" style="width: 100%">

              <!-- 作业名称 -->
              <el-table-column label="作业名称" width="180">
                <template #default="{ row }">
                  <el-input v-model="row.name" size="small" placeholder="必填" :class="{ 'is-error': !row.name }" />
                </template>
              </el-table-column>

              <!-- 课程（下拉选择） -->
              <el-table-column label="课程" width="150">
                <template #default="{ row }">
                  <el-select v-model="row.courseId" size="small" placeholder="请选择课程" filterable clearable
                    :class="{ 'is-error': !row.courseId }" style="width: 100%">
                    <el-option v-for="course in courseList" :key="course.id" :label="course.name" :value="course.id" />
                  </el-select>
                </template>
              </el-table-column>

              <!-- 知识点（多选） -->
              <el-table-column label="知识点" width="180">
                <template #default="{ row }">
                  <el-select v-model="row.knowledgePointIds" multiple collapse-tags size="small"
                    placeholder="请选择知识点（可多选）" filterable clearable style="width: 100%" :disabled="!row.courseId">
                    <el-option v-for="kp in courseKnowledgePointsMap.get(row.courseId) || []" :key="kp.id"
                      :label="kp.name" :value="kp.id" />
                  </el-select>
                </template>
              </el-table-column>

              <!-- 截止时间 -->
              <el-table-column label="截止时间" width="160">
                <template #default="{ row }">
                  <el-date-picker v-model="row.deadline" type="datetime" size="small" placeholder="必填"
                    format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DDTHH:mm:ss"
                    :class="{ 'is-error': !row.deadline }" style="width: 100%" />
                </template>
              </el-table-column>

              <!-- 班级（下拉选择，可选） -->
              <el-table-column label="班级" width="130">
                <template #default="{ row }">
                  <el-select v-model="row.classId" size="small" placeholder="可选" clearable filterable
                    style="width: 100%">
                    <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
                  </el-select>
                </template>
              </el-table-column>

              <!-- 总分 -->
              <el-table-column label="总分" width="80">
                <template #default="{ row }">
                  <el-input-number v-model="row.totalScore" :min="0" :max="200" :step="10" size="small"
                    controls-position="right" style="width: 100%" />
                </template>
              </el-table-column>

              <!-- 描述 -->
              <el-table-column label="描述" min-width="150">
                <template #default="{ row }">
                  <el-input v-model="row.description" size="small" placeholder="可选" />
                </template>
              </el-table-column>

              <!-- 状态提示 -->
              <el-table-column label="状态" width="80" fixed="right">
                <template #default="{ row }">
                  <el-tag v-if="!row.name || !row.courseId || !row.deadline" type="danger" size="small">
                    缺必填
                  </el-tag>
                  <el-tag v-else type="success" size="small">就绪</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 确认按钮 -->
          <div v-if="homeworkParseResult.data && homeworkParseResult.data.length > 0" class="confirm-buttons">
            <el-button type="success" @click="confirmHomeworkImport" :loading="homeworkSaving">
              <el-icon>
                <Check />
              </el-icon> 确认导入 ({{ homeworkParseResult.data.length }}条)
            </el-button>
            <el-button type="danger" @click="cancelHomeworkImport">取消</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 作业成绩批量导入弹窗 -->
    <el-dialog v-model="homeworkGradeImportDialogVisible" title="批量导入作业成绩" width="1000px"
      @close="resetHomeworkGradeImportData">
      <div class="import-content">
        <div class="import-tips">
          <i class="fas fa-info-circle"></i>
          <div>
            <h4>作业成绩导入说明</h4>
            <p>必填：学生（学号或姓名）、成绩 <span style="color: #f56c6c;">*</span><br>
              非必填：批注<br>
              成绩范围：0-作业总分（默认总分100）<br>
              匹配规则：优先按学号匹配，其次按姓名<br>
              支持格式：.xlsx, .xls, .csv</p>
          </div>
        </div>

        <!-- 选择作业 -->
        <div class="select-homework" style="margin-bottom: 20px;">
          <el-form-item label="选择作业" label-width="80px" required>
            <el-select v-model="selectedHomeworkForGrade" placeholder="请选择要导入成绩的作业" filterable clearable
              style="width: 350px" @change="handleHomeworkGradeChange">
              <el-option v-for="homework in homeworkList" :key="homework.id"
                :label="`${homework.name} (${homework.courseName})`" :value="homework.id" />
            </el-select>
          </el-form-item>
          <div v-if="selectedHomeworkGradeInfo" class="homework-info">
            <el-tag type="info">作业名称：{{ selectedHomeworkGradeInfo.name }}</el-tag>
            <el-tag type="success">总分：{{ selectedHomeworkGradeInfo.totalScore || 100 }}</el-tag>
          </div>
        </div>

        <div class="import-actions">
          <el-upload ref="homeworkGradeUploadRef" class="upload-demo" drag :auto-upload="false"
            :on-change="handleHomeworkGradeFileChange" :before-upload="beforeUpload" :limit="1"
            accept=".xlsx,.xls,.csv">
            <i class="fas fa-cloud-upload-alt"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持 .xlsx, .csv 格式文件，文件大小不超过10MB</div>
            </template>
          </el-upload>
          <div v-if="selectedHomeworkGradeFile" class="file-info">
            <el-alert :title="`已选择文件：${selectedHomeworkGradeFile.name}`" type="info" :closable="false" />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div v-if="selectedHomeworkGradeFile" class="action-buttons">
          <el-button type="primary" @click="uploadHomeworkGradeFile" :loading="homeworkGradeUploading">
            <el-icon>
              <Upload />
            </el-icon> 开始解析
          </el-button>
          <el-button @click="clearHomeworkGradeFile">清空</el-button>
        </div>

        <!-- 解析结果展示 -->
        <div v-if="homeworkGradeParseResult" class="parse-result">
          <el-divider>解析结果</el-divider>

          <el-alert v-if="homeworkGradeParseResult.success" title="解析成功" type="success" :closable="false" />
          <el-alert v-else title="解析失败" type="error" :closable="false">
            <template #default>
              <div v-for="(error, idx) in homeworkGradeParseResult.errors" :key="idx" class="error-item">
                {{ error.errorMessage }}
              </div>
            </template>
          </el-alert>

          <div class="summary"><strong>摘要：</strong>{{ homeworkGradeParseResult.summary }}</div>

          <!-- 解析出的数据表格 -->
          <div v-if="homeworkGradeParseResult.data && homeworkGradeParseResult.data.length > 0" class="data-table">
            <h4>解析出的数据（请确认，<span style="color: #f56c6c;">*</span>为必填项）</h4>
            <el-table :data="homeworkGradeParseResult.data" border stripe max-height="400" style="width: 100%">

              <!-- 学生（学号或姓名） -->
              <el-table-column label="学生" width="150">
                <template #default="{ row }">
                  <el-input v-model="row.studentName" size="small" placeholder="学号或姓名"
                    :class="{ 'is-error': !row.studentName }" />
                  <div v-if="row.studentId" class="match-success">✓ 已匹配</div>
                  <div v-if="row._error_studentName" class="match-error">{{ row._error_studentName }}</div>
                </template>
              </el-table-column>

              <!-- 成绩 -->
              <el-table-column label="成绩" width="120">
                <template #default="{ row }">
                  <el-input-number v-model="row.score" :min="0" :max="selectedHomeworkGradeInfo?.totalScore || 100"
                    :step="1" size="small" controls-position="right" style="width: 100%"
                    :class="{ 'is-error': row.score === undefined || row.score === null }" />
                </template>
              </el-table-column>

              <!-- 批注 -->
              <el-table-column label="批注" min-width="200">
                <template #default="{ row }">
                  <el-input v-model="row.feedback" size="small" placeholder="可选" />
                </template>
              </el-table-column>

              <!-- 状态提示 -->
              <el-table-column label="状态" width="100" fixed="right">
                <template #default="{ row }">
                  <el-tag v-if="!row.studentName || row.score === undefined" type="danger" size="small">
                    缺必填
                  </el-tag>
                  <el-tag v-else-if="!row.studentId" type="warning" size="small">
                    学生待匹配
                  </el-tag>
                  <el-tag v-else type="success" size="small">就绪</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 确认按钮 -->
          <div v-if="homeworkGradeParseResult.data && homeworkGradeParseResult.data.length > 0" class="confirm-buttons">
            <el-button type="success" @click="confirmHomeworkGradeImport" :loading="homeworkGradeSaving">
              <el-icon>
                <Check />
              </el-icon> 确认导入 ({{ homeworkGradeParseResult.data.length }}条)
            </el-button>
            <el-button type="danger" @click="cancelHomeworkGradeImport">取消</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.work-manage-container {
  width: 100%;
  min-height: 100vh;

  .action-bar {
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

    .action-left {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .action-right {
      display: flex;
      gap: 12px;
    }
  }

  .table-container {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .info-row {
      font-size: 0.85rem;
      color: #5f6b7a;

      i {
        width: 20px;
        margin-right: 4px;
        color: #8b9bb0;
      }
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

/* 发布作业 - 题目编辑器 */
.questions-editor {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  background: #fafbfc;
}

.question-item {
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.question-index {
  font-weight: 600;
  color: #1d4e7c;
}

.question-extra {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  align-items: center;
}

/* 批改作业抽屉 */
.grade-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.grade-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.grade-header h3 {
  margin: 0 0 12px 0;
  font-size: 1.2rem;
}

.grade-stats {
  display: flex;
  gap: 24px;
  font-size: 0.9rem;
  color: #5f6b7a;
}

/* 批改表单 */
.grade-form {
  max-height: 60vh;
  overflow-y: auto;
}

.submission-info {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.submission-content {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  border: 1px solid #e2e8f0;
}

.questions-grading {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.question-grade-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
}

.question-title {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 12px;
}

.question-score {
  color: #e6a23c;
}

.student-answer,
.reference-answer {
  margin-bottom: 12px;
}

.answer-content {
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px;
  margin-top: 4px;
  font-family: monospace;
}

.grade-input {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.total-score {
  text-align: right;
  font-size: 1.2rem;
  font-weight: 600;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.total-score .score-value {
  font-size: 1.5rem;
  color: #1d4e7c;
}

/* 分析弹窗 */
.analysis-content {
  max-height: 70vh;
  overflow-y: auto;
}

.analysis-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.analysis-stats .stat-item {
  text-align: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.analysis-stats .stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1d4e7c;
}

.analysis-chart {
  margin-bottom: 24px;
}

.analysis-chart h4,
.analysis-table h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1e293b;
}

.import-content {
  padding: 20px 0;

  .import-tips {
    background: #ecf5ff;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #1d4e7c;

    i {
      font-size: 18px;
    }

    span {
      font-size: 13px;
      line-height: 1.5;
    }
  }

  .import-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;

    .upload-demo {
      width: 100%;
    }
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 16px 0;
}

.parse-result {
  margin-top: 20px;

  .summary {
    margin: 12px 0;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 6px;
    font-size: 13px;
  }

  .data-table {
    margin-top: 16px;
    width: 100%;

    h4 {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
    }
  }

  .confirm-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 20px;
  }
}

.file-info {
  margin-top: 12px;
  width: 100%;
}

.error-item {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
}

.match-success {
  font-size: 11px;
  color: #67c23a;
  margin-top: 2px;
}

.match-error {
  font-size: 11px;
  color: #f56c6c;
  margin-top: 2px;
}

.select-homework {
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  .homework-info {
    display: flex;
    gap: 12px;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .action-left,
  .action-right {
    justify-content: stretch;
  }

  .action-left .el-input,
  .action-left .el-select {
    width: 100% !important;
  }

  .homework-grid {
    grid-template-columns: 1fr;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>