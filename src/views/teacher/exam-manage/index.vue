<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import InfoItem from './component/info-item.vue'
import { exportExamListToExcel, exportExamScoresToExcel, formatExamDate } from '@/utils/export'
import { tExamApi, tDashboardApi, unifiedAiApi, fileApi, tCourseApi } from '@/api/index.js'
import StatsCard from '../user-manage/component/stats-card.vue'
import AiAnalysis from '@/components/AiAnalysis.vue'

const loading = ref(false)
const examImportDialogVisible = ref(false)
const examUploadRef = ref(null)
const selectedExamFile = ref(null)
const examUploading = ref(false)
const examParseResult = ref(null)
const examSaving = ref(false)
// 课程知识点映射（用于快速查找）
const courseKnowledgePointsMap = ref(new Map())
const allKnowledgePoints = ref([])

// 加载所有知识点（按课程分组）
const fetchAllKnowledgePoints = async () => {
  try {
    // 获取所有课程的知识点
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

    // 同时保存扁平化的所有知识点
    allKnowledgePoints.value = results.flatMap(r => r.list)
  } catch (error) {
    console.error('加载知识点失败:', error)
  }
}
// 打开考试导入弹窗
const showExamImportDialog = () => {
  examParseResult.value = null
  selectedExamFile.value = null
  examImportDialogVisible.value = true
  setTimeout(() => {
    examUploadRef.value?.clearFiles()
  }, 100)
}

// 处理文件变化
const handleExamFileChange = (file) => {
  selectedExamFile.value = file.raw
  examParseResult.value = null
}

// 上传并解析考试文件
const uploadExamFile = async () => {
  if (!selectedExamFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  examUploading.value = true
  try {
    const result = await fileApi.uploadFile(selectedExamFile.value, "exam")
    examParseResult.value = result.data

    // 为每行数据添加默认值
    if (examParseResult.value.data) {
      for (const row of examParseResult.value.data) {
        row.fullScore = row.fullScore || 100
        row.passScore = row.passScore || Math.floor(row.fullScore * 0.6)
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



    if (examParseResult.value.success) {
      ElMessage.success(`解析成功！共 ${examParseResult.value.data?.length || 0} 条数据`)
    } else {
      ElMessage.error('解析失败，请检查文件格式')
    }
  } catch (error) {
    console.error('上传失败', error)
    ElMessage.error(error.message || '上传失败，请稍后重试')
  } finally {
    examUploading.value = false
  }
}

// 确认导入考试
const confirmExamImport = async () => {
  if (!examParseResult.value?.data || examParseResult.value.data.length === 0) {
    ElMessage.warning('没有可导入的数据')
    return
  }

  // 校验所有行的必填字段
  const invalidRows = []
  examParseResult.value.data.forEach((row, index) => {
    if (!row.name || !row.type || !row.courseId || !row.examDate) {
      invalidRows.push(index + 1)
    }
  })

  if (invalidRows.length > 0) {
    ElMessage.error(`第 ${invalidRows.join(', ')} 行存在未填写的必填项，请补充完整后再导入`)
    return
  }

  try {
    await ElMessageBox.confirm(`确认导入 ${examParseResult.value.data.length} 条考试数据吗？`, '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    examSaving.value = true
    // 准备导入数据
    const importData = examParseResult.value.data.map(row => ({
      name: row.name,
      type: row.type,
      courseId: row.courseId,
      examDate: row.examDate,
      classId: row.classId || null,
      fullScore: row.fullScore || 100,
      passScore: row.passScore || Math.floor((row.fullScore || 100) * 0.6),
      description: row.description || null,
      knowledgePointIds: row.knowledgePointIds || null
    }))

    const res = await fileApi.confirmInsert(importData, "exam")

    if (res.data && res.data.success) {
      ElMessage.success(res.data.message || '导入成功')
      examImportDialogVisible.value = false
      examParseResult.value = null
      selectedExamFile.value = null
      examUploadRef.value?.clearFiles()
      // 刷新列表
      await fetchExamList()
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
    examSaving.value = false
  }
  波
}

// 取消导入
const cancelExamImport = async () => {
  try {
    await ElMessageBox.confirm('确认要取消导入吗？取消后数据将消失', '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    examParseResult.value = null
    selectedExamFile.value = null
    examUploadRef.value?.clearFiles()
    examImportDialogVisible.value = false
    ElMessage.success('已取消')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消失败', error)
    }
  }
}

// 清空文件
const clearExamFile = () => {
  selectedExamFile.value = null
  examParseResult.value = null
  examUploadRef.value?.clearFiles()
}

// 重置导入弹窗数据
const resetExamImportData = () => {
  examParseResult.value = null
  selectedExamFile.value = null
  examUploadRef.value?.clearFiles()
}

const beforeUpload = (file) => {
  // 可选的文件校验逻辑
  const isValid = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel' ||
    file.type === 'text/csv'
  if (!isValid) {
    ElMessage.error('只支持 .xlsx, .xls, .csv 格式的文件')
  }
  return isValid
}

// ==================== 考试成绩导入相关 ====================
const scoreImportDialogVisible = ref(false)
const scoreUploadRef = ref(null)
const selectedScoreFile = ref(null)
const scoreUploading = ref(false)
const scoreParseResult = ref(null)
const scoreSaving = ref(false)
const currentExamForImport = ref(null)  // 当前要导入成绩的考试
const selectedExamForScore = ref(null)
const selectedExamInfo = ref(null)


// 选择考试后获取考试信息
const handleExamChange = (examId) => {
  const exam = examList.value.find(e => e.id === examId)
  if (exam) {
    selectedExamInfo.value = {
      id: exam.id,
      name: exam.name,
      fullScore: exam.fullScore || 100,
      passScore: exam.passScore || 60,
      className: exam.className
    }
  }
}

// 处理文件变化
const handleScoreFileChange = (file) => {
  selectedScoreFile.value = file.raw
  scoreParseResult.value = null
}

// 上传并解析成绩文件
const uploadScoreFile = async () => {
  if (!selectedScoreFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  if (!selectedExamForScore.value) {
    ElMessage.warning('请先选择考试')
    return
  }

  scoreUploading.value = true
  try {
    const result = await fileApi.uploadFile(selectedScoreFile.value, "exam_grade")
    scoreParseResult.value = result.data

    if (scoreParseResult.value.success) {
      ElMessage.success(`解析成功！共 ${scoreParseResult.value.data?.length || 0} 条数据`)
    } else {
      ElMessage.error('解析失败，请检查文件格式')
    }
  } catch (error) {
    console.error('上传失败', error)
    ElMessage.error(error.message || '上传失败，请稍后重试')
  } finally {
    scoreUploading.value = false
  }
}

const masteryClass = computed(() => {
  const excellentRate = analysisDetailData.value?.stats?.excellentRate || 0
  if (excellentRate >= 80) return 'good'
  if (excellentRate >= 60) return 'warning'
  return 'poor'
})

// 确认导入成绩
const confirmScoreImport = async () => {
  if (!scoreParseResult.value?.data || scoreParseResult.value.data.length === 0) {
    ElMessage.warning('没有可导入的数据')
    return
  }

  if (!selectedExamForScore.value) {
    ElMessage.warning('请选择考试')
    return
  }

  // 校验所有行的必填字段
  const invalidRows = []
  scoreParseResult.value.data.forEach((row, index) => {
    if (!row.studentName || row.score === undefined || row.score === null) {
      invalidRows.push(index + 1)
    }
  })

  if (invalidRows.length > 0) {
    ElMessage.error(`第 ${invalidRows.join(', ')} 行存在未填写的必填项，请补充完整后再导入`)
    return
  }

  try {
    await ElMessageBox.confirm(`确认将 ${scoreParseResult.value.data.length} 条成绩导入到考试「${selectedExamInfo.value?.name}」吗？`, '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    scoreSaving.value = true
    // 准备导入数据
    const importData = scoreParseResult.value.data.map(row => ({
      studentName: row.studentName,
      score: row.score,
      remark: row.remark || null
    }))

    const res = await tExamApi.confirmGradeInsert(selectedExamForScore.value, importData, "exam_grade")

    if (res.data === "数据导入成功") {
      ElMessage.success(res.data.message || '成绩导入成功')
      scoreImportDialogVisible.value = false
      scoreParseResult.value = null
      selectedScoreFile.value = null
      selectedExamForScore.value = null
      selectedExamInfo.value = null
      scoreUploadRef.value?.clearFiles()
      // 刷新数据
      await fetchExamList()
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
    scoreSaving.value = false
  }
}

// 取消导入
const cancelScoreImport = async () => {
  try {
    await ElMessageBox.confirm('确认要取消导入吗？取消后数据将消失', '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    scoreParseResult.value = null
    selectedScoreFile.value = null
    scoreUploadRef.value?.clearFiles()
    scoreImportDialogVisible.value = false
    ElMessage.success('已取消')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消失败', error)
    }
  }
}

// 清空文件
const clearScoreFile = () => {
  selectedScoreFile.value = null
  scoreParseResult.value = null
  scoreUploadRef.value?.clearFiles()
}

// 重置导入弹窗数据
const resetScoreImportData = () => {
  scoreParseResult.value = null
  selectedScoreFile.value = null
  selectedExamForScore.value = null
  selectedExamInfo.value = null
  scoreUploadRef.value?.clearFiles()
}

// 当前课程的知识点列表
const currentCourseKnowledgePoints = ref([])

// 课程切换时加载知识点
const onExamFormCourseChange = async (courseId) => {
  if (!courseId) {
    currentCourseKnowledgePoints.value = []
    examForm.value.knowledgePointIds = []
    return
  }
  examForm.value.knowledgePointIds = []

  // 先从缓存获取
  if (courseKnowledgePointsMap.value.has(courseId)) {
    currentCourseKnowledgePoints.value = courseKnowledgePointsMap.value.get(courseId)
  } else {
    try {
      const res = await tCourseApi.getKnowledgePoints(courseId)
      currentCourseKnowledgePoints.value = res.data || []
      courseKnowledgePointsMap.value.set(courseId, currentCourseKnowledgePoints.value)
    } catch (error) {
      console.error('加载知识点失败:', error)
    }
  }
}



// 考试AI分析数据
const examAiAnalysis = ref({})
const examAiLoading = ref(false)

// 获取单次考试的AI分析
const fetchExamAiAnalysis = async (examId, forceRefresh = false) => {
  if (!examId) return

  examAiLoading.value = true
  try {
    const api = forceRefresh ? unifiedAiApi.refresh : unifiedAiApi.analyze
    const res = await api({
      targetType: 'EXAM',
      targetId: examId,
      reportType: 'EXAM_ANALYSIS',
      forceRefresh: forceRefresh
    })
    if (res && res.data) {
      examAiAnalysis.value = res.data
    }
  } catch (error) {
    console.error('获取考试AI分析失败:', error)
  } finally {
    examAiLoading.value = false
  }
}

// 刷新考试AI分析
const refreshExamAiAnalysis = () => {
  if (analysisDetailData.value?.id) {
    fetchExamAiAnalysis(analysisDetailData.value.id, true)
  }
}

// 筛选条件
const searchModel = ref({
  classId: '',
  courseId: "",
  keyword: ''
})

const statistics = ref({
  totalExamCount: 0,
  overallAvgScore: 0,
  overallPassRate: 0,
  overallExcellentRate: 0,
})

const scoreListSearch = ref(null)
const scoreList = ref([])
const scoreMoreData = ref(null)
const scoreListPage = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 列表数据
const examList = ref([])
const classList = ref([])
const courseList = ref([])

const examDialogVisible = ref(false)
const drawerVisible = ref(false)
const analysisDetailData = ref(null)
const viewScoresDialogVisible = ref(false)

const examFormRef = ref(null)
const examForm = ref({
  id: null,
  name: '',
  type: '',
  classId: '',
  examDate: '',
  fullScore: 100,
  passScore: 60,
  description: ''
})

const dialogTitle = computed(() => examForm.value.id ? '编辑考试' : '创建考试')

const examRules = {
  name: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择考试类型', trigger: 'change' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  examDate: [{ required: true, message: '请选择考试日期', trigger: 'change' }],
  fullScore: [{ required: true, message: '请输入满分', trigger: 'blur' }]
}

const currentExam = ref(null)

// 图表实例
let histogramChart = null
let pieChart = null
let rangeBarChart = null

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

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const res = await tExamApi.getExamStatistics({ classId: searchModel.value.classId, courseId: searchModel.value.courseId })
    if (res && res.data) {
      statistics.value = res.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchExamList = async () => {
  loading.value = true
  try {
    const res = await tExamApi.getExamLists({
      page: pagination.page - 1,
      pageSize: pagination.pageSize,
      classId: searchModel.value.classId,
      courseId: searchModel.value.courseId,
      keyword: searchModel.value.keyword
    })
    if (res && res.data) {
      examList.value = res.data.list || []
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取考试列表失败:', error)
    ElMessage.error('获取考试列表失败')
  } finally {
    loading.value = false
  }
}


const loadExamScoreData = async () => {
  const res = await tExamApi.getScoreList({
    page: scoreListPage.value.page - 1,
    size: scoreListPage.value.pageSize,
    examId: currentExam.value?.id || currentExamForImport.value?.id,
    classId: currentExam.value?.classId,
    courseId: currentExam.value?.courseId,
    keyword: scoreListSearch.value
  })
  if (res?.data) {
    scoreMoreData.value = { ...res.data, ...currentExam.value }
    console.log('scoreList', scoreMoreData.value)
    scoreList.value = res.data?.records
    scoreListPage.value.total = res.data?.total || 0
  }
}

const createExam = async (data) => {
  const submitData = {
    name: data.name,
    type: data.type,
    classId: data.classId,
    courseId: data.courseId,
    examDate: data.examDate,
    fullScore: data.fullScore,
    passScore: data.passScore,
    description: data.description,
    knowledgePointIds: data.knowledgePointIds || []  // 添加知识点ID
  }
  const res = await tExamApi.createExam(submitData)
  if (res && res.code === 200) {
    ElMessage.success('考试创建成功')
    return true
  }
  return false
}

const updateExam = async (data) => {
  const submitData = {
    id: data.id,
    name: data.name,
    type: data.type,
    classId: data.classId,
    courseId: data.courseId,
    examDate: data.examDate,
    fullScore: data.fullScore,
    passScore: data.passScore,
    description: data.description,
    knowledgePointIds: data.knowledgePointIds || []  // 添加知识点ID
  }
  const res = await tExamApi.updateExam(data.id, submitData)
  if (res && res.code === 200) {
    ElMessage.success('更新成功')
    return true
  }
  return false
}

const deleteExam = async (id) => {
  const res = await tExamApi.deleteExam(id)
  if (res && res.code === 200) {
    ElMessage.success('删除成功')
    return true
  }
  return false
}


const getExamTypeTag = (type) => {
  const map = { "MIDTERM": 'primary', "FINAL": 'danger', "MONTHLY": 'warning', "MOCK": 'info', "UNIT": 'success' }
  return map[type] || 'info'
}



const getExamTypeColor = (type) => {
  const map = { "MIDTERM": '#409eff', "FINAL": '#f56c6c', "MONTHLY": '#e6a23c', "MOCK": '#909399', "UNIT": '#67c23a' }
  return map[type] || '#909399'
}

const getStatusType = (status) => {
  const map = { "UPCOMING": 'info', "ONGOING": 'warning', 'COMPLETED': 'success' }
  return map[status] || 'info'
}

const progressColor = (rate) => {
  if (rate >= 80) return '#67C23A'
  if (rate >= 60) return '#E6A23C'
  return '#F56C6C'
}

const getScoreClass = (score, fullScore) => {
  if (!score) return ''
  const percent = (score / fullScore) * 100
  if (percent >= 85) return 'score-excellent'
  if (percent >= 70) return 'score-good'
  if (percent >= 60) return 'score-pass'
  return 'score-fail'
}



const handleSearch = async () => {
  pagination.page = 1
  await fetchExamList()
  await fetchStatistics()
}

const handleFilterChange = async () => {
  pagination.page = 1
  await fetchExamList()
  await fetchStatistics()
}

const handleSizeChange = async (size) => {
  pagination.pageSize = size
  await fetchExamList()
  await fetchStatistics()
}

const handlePageChange = (page) => {
  pagination.page = page
  fetchExamList()
}

const handleScoreSizeChange = (size) => {
  scoreListPage.pageSize = size
  loadExamScoreData()
}

const handleScorePageChange = (page) => {
  scoreListPage.pageSize = page
  loadExamScoreData()
}

const showCreateDialog = () => {
  resetExamForm()
  examDialogVisible.value = true
}

const editExam = (exam) => {
  examForm.value = {
    id: exam.id,
    name: exam.name,
    type: exam.type,
    classId: exam.classId,
    courseId: exam.courseId,
    examDate: exam.examDate,
    fullScore: exam.fullScore || 100,
    passScore: exam.passScore || 60,
    description: exam.description || '',
    knowledgePointIds: exam.knowledgePointIds || []
  }
  if (exam.courseId) {
    onExamFormCourseChange(exam.courseId)
  }
  examDialogVisible.value = true
}

const resetExamForm = () => {
  examForm.value = {
    id: null,
    name: '',
    type: '',
    classId: '',
    courseId: '',
    examDate: '',
    fullScore: 100,
    passScore: 60,
    description: '',
    knowledgePointIds: []  // 添加知识点ID列表
  }
  currentCourseKnowledgePoints.value = []
  examFormRef.value?.resetFields()
}

const submitExam = async () => {
  await examFormRef.value?.validate()
  let success
  if (examForm.value.id) {
    success = await updateExam(examForm.value)
  } else {
    success = await createExam(examForm.value)
  }
  if (success) {
    examDialogVisible.value = false
    await fetchExamList()
    await fetchStatistics()
  }
}

const handleExamCommand = (command, exam) => {
  switch (command) {
    case 'edit':
      editExam(exam)
      break
    case 'viewScores':
      viewExamScores(exam)
      break
    case 'viewExamAnalysis':
      viewExamDetail(exam)
      break
    case 'export':
      exportScores(exam)
      break
    case 'delete':
      ElMessageBox.confirm(`确认删除考试 "${exam.name}" 吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const success = await deleteExam(exam.id)
        if (success) {
          await fetchExamList()
          await fetchStatistics()
        }
      }).catch(() => { })
      break
  }
}


const viewExamScores = async (exam) => {
  currentExam.value = exam
  await loadExamScoreData()
  viewScoresDialogVisible.value = true
}


const initAnalysisCharts = () => {
  if (!analysisDetailData.value) return
  // 成绩分布直方图
  const histogramDom = document.getElementById('scoreHistogramChart')
  if (histogramDom && analysisDetailData.value?.scoreDistribution) {
    if (histogramChart) histogramChart.dispose()
    histogramChart = echarts.init(histogramDom)
    histogramChart.setOption({
      title: { text: '成绩分布', left: 'center' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: ['优秀(≥90)', '良好(80-89)', '中等(70-79)', '及格(60-69)', '不及格(<60)'],
        axisLabel: { rotate: 0 }
      },
      yAxis: { type: 'value', name: '人数' },
      series: [{
        type: 'bar',
        data: [
          analysisDetailData.value?.scoreDistribution.excellentCount,
          analysisDetailData.value?.scoreDistribution.goodCount,
          analysisDetailData.value?.scoreDistribution.mediumCount,
          analysisDetailData.value?.scoreDistribution.passCount,
          analysisDetailData.value?.scoreDistribution.failCount
        ],
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: (params) => {
            const colors = ['#67c23a', '#409eff', '#e6a23c', '#f56c6c', '#f56c6c']
            return colors[params.dataIndex]
          }
        },
        label: { show: true, position: 'top' }
      }]
    })
  }

  // 成绩仪表盘（环形图）
  const pieDom = document.getElementById('scorePieChart')
  if (pieDom && analysisDetailData.value?.stats) {
    if (pieChart) pieChart.dispose()
    pieChart = echarts.init(pieDom)
    pieChart.setOption({
      series: [
        {
          name: '平均分',
          type: 'gauge',
          center: ['25%', '50%'],
          radius: '70%',
          min: 0,
          max: 100,
          detail: { formatter: '{value}分' },
          data: [{ value: analysisDetailData.value?.stats.avgScore, name: '平均分' }],
          axisLabel: { show: false }
        },
        {
          name: '及格率',
          type: 'gauge',
          center: ['75%', '50%'],
          radius: '70%',
          min: 0,
          max: 100,
          detail: { formatter: '{value}%' },
          data: [{ value: analysisDetailData.value?.stats.passRate, name: '及格率' }],
          axisLabel: { show: false }
        }
      ]
    })
  }

  // 知识点掌握雷达图
  const rangeBarDom = document.getElementById('scoreRangeBarChart')
  if (rangeBarDom && analysisDetailData.value?.knowledgePointAnalysis) {
    if (rangeBarChart) rangeBarChart.dispose()
    rangeBarChart = echarts.init(rangeBarDom)
    rangeBarChart.setOption({
      title: { text: '知识点掌握雷达图', left: 'center' },
      tooltip: { trigger: 'item' },
      radar: {
        indicator: analysisDetailData.value?.knowledgePointAnalysis.map(kp => ({
          name: kp.knowledgePointName,
          max: 100
        })),
        center: ['50%', '50%'],
        radius: '65%',
        name: { textStyle: { fontSize: 10, color: '#406e96' } }
      },
      series: [{
        type: 'radar',
        data: [{ value: analysisDetailData.value?.knowledgePointAnalysis.map(kp => kp.classAvgRate), name: '班级平均得分率' }],
        areaStyle: { color: 'rgba(64, 158, 255, 0.2)' },
        lineStyle: { color: '#409eff', width: 2 },
        itemStyle: { color: '#409eff' }
      }]
    })
  }
}
const viewExamDetail = async (exam) => {
  await loadDetailData(exam?.id)
  drawerVisible.value = true
  fetchExamAiAnalysis(exam?.id)
}

const loadDetailData = async (examId) => {
  const res = await tExamApi.getExamAnalysis(examId)
  analysisDetailData.value = res?.data || {}
  setTimeout(() => {
    initAnalysisCharts()
  }, 100)
}

// 在查看成绩的弹窗中添加导出功能
const exportCurrentScores = () => {
  if (scoreList.value.length === 0) {
    ElMessage.warning('暂无成绩数据可导出')
    return
  }

  exportExamScoresToExcel(
    {
      name: scoreMoreData.value?.name,
      className: scoreMoreData.value?.className,
      examDate: scoreMoreData.value?.examDate,
      fullScore: scoreMoreData.value?.fullScore,
      passScore: scoreMoreData.value?.passScore
    },
    scoreList.value,
    `考试成绩_${scoreMoreData.value?.name}`
  )
  ElMessage.success('导出成功')
}

const exportScores = async (exam) => {
  try {
    loading.value = true
    // 获取完整的成绩数据
    const res = await tExamApi.getScoreList({
      page: 0,
      size: 10000, // 获取所有成绩
      examId: exam.id,
      classId: exam.classId,
      courseId: exam.courseId
    })

    if (res?.data?.records && res.data.records.length > 0) {
      exportExamScoresToExcel(
        {
          name: exam.name,
          className: exam.className,
          examDate: exam.examDate,
          fullScore: exam.fullScore,
          passScore: exam.passScore
        },
        res.data.records,
        `考试成绩_${exam.name}`
      )
      ElMessage.success('导出成功')
    } else {
      ElMessage.warning('暂无成绩数据可导出')
    }
  } catch (error) {
    console.error('导出成绩失败:', error)
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

const importScore = (exam) => {
  selectedExamForScore.value = exam.id
  selectedExamInfo.value = {
    id: exam.id,
    name: exam.name,
    fullScore: exam.fullScore || 100,
    passScore: exam.passScore || 60,
    className: exam.className
  }
  scoreParseResult.value = null
  selectedScoreFile.value = null
  scoreImportDialogVisible.value = true
  setTimeout(() => {
    scoreUploadRef.value?.clearFiles()
  }, 100)
}

const exportExamsList = () => {
  try {
    if (examList.value.length === 0) {
      ElMessage.warning('没有可导出的数据')
      return
    }

    // 准备导出数据
    const exportData = examList.value.map(item => ({
      ...item,
      examDateStr: formatExamDate(item.examDate),
      avgScore: item.avgScore,
      passRate: item.passRate
    }))

    exportExamListToExcel(exportData, `考试列表_${new Date().toLocaleDateString()}`)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

onMounted(async () => {
  await fetchClassList()
  await fetchCourseList()
  await fetchExamList()
  await fetchStatistics()
  await fetchAllKnowledgePoints()
})
</script>

<template>
  <div class="exam-manage-container">
    <div class="action-bar">
      <div class="action-left">
        <el-select size="large" v-model="searchModel.classId" placeholder="选择班级" style="width: 140px"
          @change="handleFilterChange" clearable>
          <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
        </el-select>
        <el-select size="large" v-model="searchModel.courseId" placeholder="按课程筛选" clearable style="width: 150px"
          @change="handleFilterChange">
          <el-option v-for="cls in courseList" :key="cls.id" :label="cls.name" :value="cls.id" />
        </el-select>
        <el-input v-model="searchModel.keyword" placeholder="搜索考试名称" prefix-icon="Search" clearable style="width: 200px"
          @clear="handleSearch" @keyup.enter="handleSearch" />
      </div>
      <div class="action-right">
        <el-button type="primary" @click="showCreateDialog">
          <i class="fas fa-plus"></i> 创建考试
        </el-button>
        <el-button @click="showExamImportDialog">
          <i class="fas fa-upload"></i> 批量导入
        </el-button>
        <el-button @click="exportExamsList">
          <i class="fas fa-file-excel"></i> 导出数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" :style="{ marginBottom: '20px' }">
      <el-col :span="6">
        <stats-card type="total" icon="fa-users" title="考试总数" :value="statistics.totalExamCount" />
      </el-col>
      <el-col :span="6">
        <StatsCard type="active" icon="fa-user-check" title="平均分" :value="statistics.overallAvgScore" />
      </el-col>
      <el-col :span="6">
        <StatsCard type="frozen" icon="fa-user-lock" title="及格率" :value="statistics.overallPassRate" />
      </el-col>
      <el-col :span="6">
        <StatsCard type="pending" icon="fa-user-clock" title="优秀率" :value="statistics.overallExcellentRate" />
      </el-col>
    </el-row>

    <div class="exam-table-container">
      <el-table :data="examList" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="name" label="考试名称" min-width="180">
          <template #default="{ row }">
            <div class="exam-name">
              <i class="fas fa-file-alt" :style="{ color: getExamTypeColor(row.type) }"></i>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getExamTypeTag(row.type)" size="small">
              {{ row.typeText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="班级" width="100" />
        <el-table-column prop="courseName" label="课程" width="100" />
        <el-table-column prop="examDate" label="考试日期" width="110">
          <template #default="{ row }">
            {{ row.examDate.slice(0, 3).join('-') }}
          </template>
        </el-table-column>
        <el-table-column prop="fullScore" label="满分" width="90" align="center" />
        <el-table-column prop="studentCount" label="参与人数" width="90" align="center" />
        <el-table-column prop="avgScore" label="平均分" width="80" sortable>
          <template #default="{ row }">
            <span :class="getScoreClass(row.avgScore, row.fullScore)">
              {{ row.avgScore?.toFixed(1) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="highestScore" label="最高分" width="80">
          <template #default="{ row }">
            <span class="highest">{{ row.highestScore || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="passRate" label="及格率" width="90">
          <template #default="{ row }">
            <el-progress :percentage="row.passRate" :stroke-width="6" :show-text="false"
              style="width: 60px; display: inline-block" />
            <span style="margin-left: 8px">{{ row.passRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="importScore(row)">
              <i class="fas fa-edit"></i> 录入成绩
            </el-button>
            <el-dropdown @click.stop @command="(cmd) => handleExamCommand(cmd, row)">
              <el-button link size="small">
                更多 <i class="fas fa-chevron-down"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑考试</el-dropdown-item>
                  <el-dropdown-item command="viewScores">查看成绩单</el-dropdown-item>
                  <el-dropdown-item command="viewExamAnalysis">查看考试详情</el-dropdown-item>
                  <el-dropdown-item command="export">导出成绩</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]" :total="pagination.total" layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange" @current-change="handlePageChange" />
      </div>
    </div>

    <!-- 创建/编辑考试弹窗 -->
    <el-dialog v-model="examDialogVisible" :title="dialogTitle" width="600px" @close="resetExamForm"
      body-class="form-dialog">
      <el-form ref="examFormRef" :model="examForm" :rules="examRules" label-width="100px">

        <!-- 原有字段保持不变 -->
        <el-form-item label="考试名称" prop="name">
          <el-input v-model="examForm.name" placeholder="请输入考试名称" />
        </el-form-item>

        <el-form-item label="考试类型" prop="type">
          <el-select v-model="examForm.type" placeholder="请选择考试类型" style="width: 100%">
            <el-option label="期中考试" value="MIDTERM" />
            <el-option label="期末考试" value="FINAL" />
            <el-option label="月考" value="MONTHLY" />
            <el-option label="模拟考" value="MOCK" />
            <el-option label="单元测试" value="UNIT" />
          </el-select>
        </el-form-item>

        <el-form-item label="所属班级" prop="classId">
          <el-select v-model="examForm.classId" placeholder="请选择班级" style="width: 100%">
            <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="课程" prop="courseId">
          <el-select v-model="examForm.courseId" placeholder="请选择课程" style="width: 100%"
            @change="onExamFormCourseChange">
            <el-option v-for="cls in courseList" :key="cls.id" :label="cls.name" :value="cls.id" />
          </el-select>
        </el-form-item>

        <!-- 知识点（多选） -->
        <el-form-item label="知识点" prop="knowledgePointIds">
          <el-select v-model="examForm.knowledgePointIds" multiple collapse-tags placeholder="请选择知识点（可多选）" filterable
            clearable style="width: 100%">
            <el-option v-for="kp in currentCourseKnowledgePoints" :key="kp.id" :label="kp.name" :value="kp.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="考试日期" prop="examDate">
          <el-date-picker v-model="examForm.examDate" type="datetime" placeholder="选择考试时间" format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%" />
        </el-form-item>

        <el-form-item label="满分" prop="fullScore">
          <el-input-number v-model="examForm.fullScore" :min="0" :max="750" :step="10" style="width: 100%" />
        </el-form-item>

        <el-form-item label="及格线" prop="passScore">
          <el-input-number v-model="examForm.passScore" :min="0" :max="examForm.fullScore" :step="10"
            style="width: 100%" />
        </el-form-item>

        <el-form-item label="考试说明" prop="description">
          <el-input v-model="examForm.description" type="textarea" :rows="3" placeholder="请输入考试说明（可选）" />
        </el-form-item>

      </el-form>
      <template #footer>
        <el-button @click="examDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitExam">保存</el-button>
      </template>
    </el-dialog>

    <!-- 考试批量导入弹窗 -->
    <el-dialog v-model="examImportDialogVisible" title="批量导入考试" width="1000px" @close="resetExamImportData">
      <div class="import-content">
        <div class="import-tips">
          <i class="fas fa-info-circle"></i>
          <div>
            <h4>考试信息导入说明</h4>
            <p>必填：考试名称、考试类型、课程名称、考试日期 <span style="color: #f56c6c;">*</span><br>
              非必填：班级、总分、及格分、描述<br>
              默认：总分=100，及格分=总分的60%，状态根据考试日期自动判断<br>
              考试类型：MOCK(模拟考)/UNIT(单元测试)/MONTHLY(月考)/MIDTERM(期中)/FINAL(期末)<br>
              支持格式：.xlsx, .xls, .csv</p>
          </div>
        </div>

        <div class="import-actions">
          <el-upload ref="examUploadRef" class="upload-demo" drag :auto-upload="false" :on-change="handleExamFileChange"
            :before-upload="beforeUpload" :limit="1" accept=".xlsx,.xls,.csv">
            <i class="fas fa-cloud-upload-alt"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持 .xlsx, .csv 格式文件，文件大小不超过10MB</div>
            </template>
          </el-upload>
          <div v-if="selectedExamFile" class="file-info">
            <el-alert :title="`已选择文件：${selectedExamFile.name}`" type="info" :closable="false" />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div v-if="selectedExamFile" class="action-buttons">
          <el-button type="primary" @click="uploadExamFile" :loading="examUploading">
            <el-icon>
              <Upload />
            </el-icon> 开始解析
          </el-button>
          <el-button @click="clearExamFile">清空</el-button>
        </div>

        <!-- 解析结果展示 -->
        <div v-if="examParseResult" class="parse-result">
          <el-divider>解析结果</el-divider>

          <el-alert v-if="examParseResult.success" title="解析成功" type="success" :closable="false" />
          <el-alert v-else title="解析失败" type="error" :closable="false">
            <template #default>
              <div v-for="(error, idx) in examParseResult.errors" :key="idx" class="error-item">
                {{ error.errorMessage }}
              </div>
            </template>
          </el-alert>

          <div class="summary"><strong>摘要：</strong>{{ examParseResult.summary }}</div>

          <!-- 解析出的数据表格 -->
          <div v-if="examParseResult.data && examParseResult.data.length > 0" class="data-table">
            <h4>解析出的数据（请确认，<span style="color: #f56c6c;">*</span>为必填项）</h4>
            <el-table :data="examParseResult.data" border stripe max-height="400" style="width: 100%">

              <!-- 考试名称 -->
              <el-table-column label="考试名称" width="150">
                <template #default="{ row }">
                  <el-input v-model="row.name" size="small" placeholder="必填" :class="{ 'is-error': !row.name }" />
                </template>
              </el-table-column>

              <!-- 考试类型（下拉选择） -->
              <el-table-column label="考试类型" width="110">
                <template #default="{ row }">
                  <el-select v-model="row.type" size="small" placeholder="必填" style="width: 100%"
                    :class="{ 'is-error': !row.type }">
                    <el-option label="期中考试" value="MIDTERM" />
                    <el-option label="期末考试" value="FINAL" />
                    <el-option label="月考" value="MONTHLY" />
                    <el-option label="模拟考" value="MOCK" />
                    <el-option label="单元测试" value="UNIT" />
                  </el-select>
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

              <!-- 考试日期 -->
              <el-table-column label="考试日期" width="140">
                <template #default="{ row }">
                  <el-date-picker v-model="row.examDate" type="datetime" size="small" placeholder="必填"
                    format="YYYY-MM-DD" value-format="YYYY-MM-DDTHH:mm:ss" :class="{ 'is-error': !row.examDate }"
                    style="width: 100%" />
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
                  <el-input-number v-model="row.fullScore" :min="0" :max="200" :step="10" size="small"
                    controls-position="right" style="width: 100%" />
                </template>
              </el-table-column>

              <!-- 及格分 -->
              <el-table-column label="及格分" width="80">
                <template #default="{ row }">
                  <el-input-number v-model="row.passScore" :min="0" :max="row.fullScore || 100" :step="10" size="small"
                    controls-position="right" style="width: 100%" />
                </template>
              </el-table-column>

              <el-table-column label="知识点" width="200">
                <template #default="{ row }">
                  <el-select v-model="row.knowledgePointIds" multiple collapse-tags size="small"
                    placeholder="请选择知识点（可多选）" filterable clearable style="width: 100%">
                    <el-option v-for="kp in courseKnowledgePointsMap.get(row.courseId) || []" :key="kp.id"
                      :label="kp.name" :value="kp.id" />
                  </el-select>
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
                  <el-tag v-if="!row.name || !row.type || !row.courseId || !row.examDate" type="danger" size="small">
                    缺必填
                  </el-tag>
                  <el-tag v-else type="success" size="small">就绪</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 确认按钮 -->
          <div v-if="examParseResult.data && examParseResult.data.length > 0" class="confirm-buttons">
            <el-button type="success" @click="confirmExamImport" :loading="examSaving">
              <el-icon>
                <Check />
              </el-icon> 确认导入 ({{ examParseResult.data.length }}条)
            </el-button>
            <el-button type="danger" @click="cancelExamImport">取消</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 成绩查看弹窗 -->
    <el-dialog v-model="viewScoresDialogVisible" :title="`成绩查看 - ${scoreMoreData?.name}`" width="80%"
      :style="{ marginTop: '20px' }">
      <div class="score-entry-container">
        <div class="exam-info-bar">
          <info-item label="班级：" :value="scoreMoreData?.className" />
          <info-item label="考试日期：" :value="formatExamDate(scoreMoreData?.examDate)" />
          <info-item label="满分：" :value="scoreMoreData?.fullScore" />
          <info-item label="学生人数：" :value="`${scoreMoreData?.studentCount}`" />
        </div>
        <el-row :gutter="20" :style="{ marginBottom: '20px' }">
          <el-col :span="6">
            <stats-card type="total" icon="fa-users" title="平均分" :value="scoreMoreData?.statistics.avgScore" />
          </el-col>
          <el-col :span="6">
            <StatsCard type="active" icon="fa-user-check" title="最高分" :value="scoreMoreData?.statistics.highestScore" />
          </el-col>
          <el-col :span="6">
            <StatsCard type="frozen" icon="fa-user-lock" title="最低分" :value="scoreMoreData?.statistics.lowestScore" />
          </el-col>
          <el-col :span="6">
            <StatsCard type="pending" icon="fa-user-clock" title="及格人数" :value="scoreMoreData?.statistics.passCount" />
          </el-col>
        </el-row>
        <el-input v-model="scoreListSearch" placeholder="搜索学生..." prefix-icon="Search" clearable style="width: 200px"
          @clear="loadExamScoreData" @keyup.enter="loadExamScoreData" />
        <!-- 成绩查看表格 -->
        <el-table :data="scoreList" stripe border height="500px" style="width: 100%">
          <el-table-column prop="classRank" label="排名" width="120" sortable />
          <el-table-column prop="studentNo" label="学号" width="120" />
          <el-table-column prop="studentName" label="姓名" width="100" />
          <el-table-column prop="score" label="成绩" width="100" />
          <el-table-column prop="remark" label="备注" min-width="150">
          </el-table-column>
          <el-table-column prop="scoreTrend" label="趋势" min-width="150">
            <template #default="{ row }">{{ row?.scoreTrend === 'UP' ? "上升" : row?.scoreTrend === 'STABLE' ? "平稳" : "下降"
            }}</template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination v-model:current-page="scoreListPage.page" v-model:page-size="scoreListPage.pageSize"
            :page-sizes="[10, 20, 50]" :total="scoreListPage.total" layout="total, sizes, prev, pager, next"
            @size-change="handleScoreSizeChange" @current-change="handleScorePageChange" />
        </div>
      </div>
      <template #footer>
        <el-button @click="exportCurrentScores">导出成绩</el-button>
        <el-button @click="viewScoresDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 考试成绩批量导入弹窗 -->
    <el-dialog v-model="scoreImportDialogVisible" title="批量导入考试成绩" width="1000px" @close="resetScoreImportData">
      <div class="import-content">
        <div class="import-tips">
          <i class="fas fa-info-circle"></i>
          <div>
            <h4>考试成绩导入说明</h4>
            <p>必填：学生（学号或姓名）、成绩 <span style="color: #f56c6c;">*</span><br>
              非必填：备注<br>
              成绩范围：0-考试总分（默认总分100）<br>
              匹配规则：优先按学号匹配，其次按姓名<br>
              支持格式：.xlsx, .xls, .csv</p>
          </div>
        </div>

        <!-- 选择考试 -->
        <div class="select-exam" style="margin-bottom: 20px;">
          <el-form-item label="选择考试" label-width="80px" required>
            <el-select v-model="selectedExamForScore" placeholder="请选择要导入成绩的考试" filterable clearable
              style="width: 300px" @change="handleExamChange">
              <el-option v-for="exam in examList" :key="exam.id" :label="`${exam.name} (${exam.className || '无班级'})`"
                :value="exam.id" />
            </el-select>
          </el-form-item>
          <div v-if="selectedExamInfo" class="exam-info">
            <el-tag type="info">考试名称：{{ selectedExamInfo.name }}</el-tag>
            <el-tag type="success">总分：{{ selectedExamInfo.fullScore || 100 }}</el-tag>
            <el-tag type="warning">及格分：{{ selectedExamInfo.passScore || 60 }}</el-tag>
          </div>
        </div>

        <div class="import-actions">
          <el-upload ref="scoreUploadRef" class="upload-demo" drag :auto-upload="false"
            :on-change="handleScoreFileChange" :before-upload="beforeUpload" :limit="1" accept=".xlsx,.xls,.csv">
            <i class="fas fa-cloud-upload-alt"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持 .xlsx, .csv 格式文件，文件大小不超过10MB</div>
            </template>
          </el-upload>
          <div v-if="selectedScoreFile" class="file-info">
            <el-alert :title="`已选择文件：${selectedScoreFile.name}`" type="info" :closable="false" />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div v-if="selectedScoreFile" class="action-buttons">
          <el-button type="primary" @click="uploadScoreFile" :loading="scoreUploading">
            <el-icon>
              <Upload />
            </el-icon> 开始解析
          </el-button>
          <el-button @click="clearScoreFile">清空</el-button>
        </div>

        <!-- 解析结果展示 -->
        <div v-if="scoreParseResult" class="parse-result">
          <el-divider>解析结果</el-divider>

          <el-alert v-if="scoreParseResult.success" title="解析成功" type="success" :closable="false" />
          <el-alert v-else title="解析失败" type="error" :closable="false">
            <template #default>
              <div v-for="(error, idx) in scoreParseResult.errors" :key="idx" class="error-item">
                {{ error.errorMessage }}
              </div>
            </template>
          </el-alert>

          <div class="summary"><strong>摘要：</strong>{{ scoreParseResult.summary }}</div>

          <!-- 解析出的数据表格 -->
          <div v-if="scoreParseResult.data && scoreParseResult.data.length > 0" class="data-table">
            <h4>解析出的数据（请确认，<span style="color: #f56c6c;">*</span>为必填项）</h4>
            <el-table :data="scoreParseResult.data" border stripe max-height="400" style="width: 100%">

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
                  <el-input-number v-model="row.score" :min="0" :max="selectedExamInfo?.fullScore || 100" :step="1"
                    size="small" controls-position="right" style="width: 100%"
                    :class="{ 'is-error': row.score === undefined || row.score === null }" />
                </template>
              </el-table-column>

              <!-- 备注 -->
              <el-table-column label="备注" min-width="200">
                <template #default="{ row }">
                  <el-input v-model="row.remark" size="small" placeholder="可选" />
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
          <div v-if="scoreParseResult.data && scoreParseResult.data.length > 0" class="confirm-buttons">
            <el-button type="success" @click="confirmScoreImport" :loading="scoreSaving">
              <el-icon>
                <Check />
              </el-icon> 确认导入 ({{ scoreParseResult.data.length }}条)
            </el-button>
            <el-button type="danger" @click="cancelScoreImport">取消</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 考试详情图 -->
    <el-drawer v-model="drawerVisible"
      :title="`班级成绩分析：${analysisDetailData?.courseName || ''} - ${analysisDetailData?.name || ''}`" direction="rtl"
      size="1300px" destroy-on-close :close-on-click-modal="true" :close-on-press-escape="true" v-loading="loading">
      <div class="knowledge-detail" v-if="analysisDetailData?.id">
        <!-- 掌握度卡片 -->
        <div class="mastery-card" :class="masteryClass">
          <div class="mastery-rate">
            <h3>优秀率</h3>
            <el-progress type="circle" :percentage="analysisDetailData?.stats?.excellentRate"
              :color="progressColor(analysisDetailData?.stats?.excellentRate)" :width="120" :stroke-width="12" />
          </div>
          <div class="mastery-rate">
            <h3>及格率</h3>
            <el-progress type="circle" :percentage="analysisDetailData?.stats?.passRate"
              :color="progressColor(analysisDetailData?.stats?.passRate)" :width="120" :stroke-width="12" />
          </div>
          <div class="mastery-info">
            <h3>学生人数</h3>
            <p class="rate">{{ analysisDetailData?.stats?.totalStudents }}人</p>
          </div>
        </div>

        <el-descriptions :column="2" border style="margin-top: 20px;">
          <el-descriptions-item label="类型">{{ analysisDetailData?.typeText }}</el-descriptions-item>
          <el-descriptions-item label="考试时间">{{ formatExamDate(analysisDetailData?.examDate) }}</el-descriptions-item>
          <el-descriptions-item label="分数">
            <div>
              <h4 style="display: flex;align-items: center; height: 20px;">班级平均分：<p>{{ analysisDetailData?.classAvgScore
                ||
                '-' }}</p>
              </h4>
              <h4 style="display: flex;align-items: center; height: 20px;">最高分:<p>{{ analysisDetailData?.highestScore ||
                '-'
              }}</p>
              </h4>
              <h4 style="display: flex;align-items: center; height: 20px;">最低分:<p>{{ analysisDetailData?.lowestScore ||
                '-'
              }}</p>
              </h4>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="描述">{{ analysisDetailData?.description || '无' }}</el-descriptions-item>
        </el-descriptions>

        <el-card shadow="always" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>🤖 AI 成绩分析</span>
              <el-button size="small" type="primary" @click="refreshExamAiAnalysis" :loading="examAiLoading">
                <i class="fas fa-sync-alt"></i> 刷新分析
              </el-button>
            </div>
          </template>
          <div v-loading="examAiLoading">
            <AiAnalysis :ai-analysis="examAiAnalysis" />
          </div>
        </el-card>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <div class="chart-card">
              <h4>成绩分布直方图</h4>
              <div id="scoreHistogramChart" style="height: 320px"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-card">
              <h4>成绩仪表盘</h4>
              <div id="scorePieChart" style="height: 320px"></div>
            </div>
          </el-col>
        </el-row>

        <el-row style="margin-top: 20px;" v-if="analysisDetailData.value?.knowledgePointAnalysis?.length > 0">
          <el-col :span="24">
            <div class="chart-card">
              <h4>知识点掌握雷达图</h4>
              <div id="scoreRangeBarChart" style="height: 280px"></div>
            </div>
          </el-col>
        </el-row>
      </div>
      <!-- 无数据状态 -->
      <div v-else class="empty-state">
        <i class="fas fa-database"></i>
        <p>暂无数据</p>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.exam-manage-container {
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

  .exam-table-container {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .exam-name {
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        font-size: 18px;
      }

      span {
        font-weight: 500;
      }
    }


    .score-excellent {
      color: #67c23a;
      font-weight: bold;
    }

    .score-good {
      color: #409eff;
    }

    .score-pass {
      color: #e6a23c;
    }

    .score-fail {
      color: #f56c6c;
    }

    .highest {
      color: #f56c6c;
      font-weight: bold;
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .score-entry-container {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .exam-info-bar {
      background: #f8fafc;
      border-radius: 12px;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;

      .info-actions {
        margin-left: auto;
        display: flex;
        gap: 8px;
      }
    }

    .entry-progress {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #ecf1f6;

      .progress-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 0.85rem;
        color: #5f6b7a;
      }
    }
  }

  .analysis-container {
    max-height: 80vh;
    overflow-y: auto;
    padding: 0 8px;

    .analysis-header {
      margin-bottom: 24px;

      .title-section {
        h2 {
          margin: 0 0 4px 0;
          font-size: 1.5rem;
          color: #1e293b;

        }

        p {
          margin: 0;
          color: #5f6b7a;
        }
      }

      .stats-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 16px;
        margin-top: 20px;
      }
    }

    .chart-card {
      background: white;
      border: 1px solid #ecf1f6;
      border-radius: 12px;
      padding: 16px;

      h4 {
        margin: 0 0 12px 0;
        font-size: 1rem;
        font-weight: 600;
        color: #1e293b;
      }

      .improve-up {
        color: #67c23a;
      }

      .improve-down {
        color: #f56c6c;
      }

      .improve-stable {
        color: #909399;
      }

      .grade-bars {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .grade-item {
          display: flex;
          align-items: center;
          gap: 12px;

          .grade-name {
            width: 80px;
            font-size: 0.85rem;
            font-weight: 500;
          }

          .grade-bar-container {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 8px;

            .grade-bar {
              height: 24px;
              border-radius: 12px;
              transition: width 0.3s ease;
            }

            .grade-count {
              font-size: 0.85rem;
              color: #5f6b7a;
              min-width: 50px;
            }
          }

          .grade-percent {
            width: 50px;
            font-size: 0.85rem;
            font-weight: 500;
            text-align: right;
          }
        }
      }
    }
  }

  .compare-container {
    padding: 0 8px;

    .compare-filters {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ecf1f6;
    }

    .compare-stats {
      margin-top: 20px;
      padding: 0 16px;
    }
  }

  :deep(.form-dialog) {
    padding: 20px 15px 20px 0;
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

  .knowledge-detail {
    padding: 0 20px;

    h4 {
      font-size: 16px;
      margin: 20px 0 15px;
      color: #1f2937;

      i {
        margin-right: 8px;
        color: #409EFF;
      }
    }

    .mastery-card {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 30px 20px;
      border-radius: 16px;
      background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);

      &.good {
        background: linear-gradient(135deg, #e8f5e9 0%, #fff 100%);
      }

      &.warning {
        background: linear-gradient(135deg, #fff3e0 0%, #fff 100%);
      }

      &.poor {
        background: linear-gradient(135deg, #ffebee 0%, #fff 100%);
      }

      .mastery-info {
        text-align: center;

        h3 {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 10px;
        }

        .rate {
          font-size: 32px;
          font-weight: 700;
          margin: 10px 0;
        }
      }
    }

    .weak-points {
      ul {
        list-style: none;
        padding: 0;

        li {
          padding: 12px;
          background: #fef3c7;
          border-radius: 8px;
          margin-bottom: 10px;

          i {
            margin-right: 10px;
            color: #f59e0b;
          }
        }
      }
    }

    .suggestion-content {
      p {
        padding: 10px 12px;
        background: #f0f9ff;
        border-radius: 8px;
        margin-bottom: 10px;
        border-left: 3px solid #409EFF;
      }
    }

    .related-resources {
      .resource-list {
        .resource-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transform: translateX(4px);
          }

          .resource-icon {
            width: 40px;
            height: 40px;
            background: #409EFF10;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;

            i {
              font-size: 20px;
              color: #409EFF;
            }
          }

          .resource-info {
            flex: 1;

            .resource-title {
              font-weight: 500;
              margin-bottom: 4px;
            }

            .resource-meta {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              font-size: 12px;
              color: #6b7280;
            }
          }
        }
      }
    }

    .learning-trend {
      margin-bottom: 20px;
    }
  }
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

.select-exam {
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  .exam-info {
    display: flex;
    gap: 12px;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;

    .action-left,
    .action-right {
      justify-content: stretch;
    }

    .action-left .el-input,
    .action-left .el-select {
      width: 100% !important;
    }
  }

  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
  }

  .exam-info-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-actions {
    margin-left: 0;
  }
}
</style>