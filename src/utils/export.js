import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export const formatExamDate = (dateArray) => {
  if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) {
    return ''
  }
  // 格式化为 YYYY-MM-DD HH:mm:ss
  const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
}

/**
 * 将 HTML 元素导出为图片
 * @param {HTMLElement} element - 要导出的 HTML 元素
 * @param {string} fileName - 文件名
 */
export const exportToImage = async (element, fileName = 'export') => {
  const canvas = await html2canvas(element)
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = `${fileName}.png`
  link.click()
}

/**
 * 将 HTML 元素导出为 PDF
 * @param {HTMLElement} element - 要导出的 HTML 元素
 * @param {string} fileName - 文件名
 */
export const exportToPDF = async (element, fileName = 'export') => {
  const canvas = await html2canvas(element, {
    scale: 2, // 提高清晰度
  })

  const contentWidth = canvas.width
  const contentHeight = canvas.height

  // A4 纸张尺寸 [595.28, 841.89]
  const pageHeight = (contentWidth / 592.28) * 841.89
  let leftHeight = contentHeight
  let position = 0
  const imgWidth = 595.28
  const imgHeight = (592.28 / contentWidth) * contentHeight

  const pageData = canvas.toDataURL('image/jpeg', 1.0)
  const pdf = new jsPDF('', 'pt', 'a4')

  if (leftHeight < pageHeight) {
    pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
  } else {
    while (leftHeight > 0) {
      pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
      leftHeight -= pageHeight
      position -= 841.89
      if (leftHeight > 0) {
        pdf.addPage()
      }
    }
  }
  pdf.save(`${fileName}.pdf`)
}

/**
 * 将 ECharts 实例导出为 SVG
 * @param {Object} chartInstance - ECharts 实例
 * @param {string} fileName - 文件名
 */
export const exportToSVG = (chartInstance, fileName = 'chart') => {
  const svg = chartInstance.renderToSVGString()
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName}.svg`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * 将 原始数据导出为 CSV 文件
 * @param {string} csvContent - 原始 CSV 内容
 * @param {string} fileName - 文件名
 */
export const exportToCSV = (csvContent, fileName = 'export') => {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${fileName}.csv`)
  link.click()
  URL.revokeObjectURL(url)
}

// 导出学生成员列表
export const exportMemberExcel = (data, fileName) => {
  // 定义表头映射
  const headers = [
    { label: '序号', prop: 'id' },
    { label: '姓名', prop: 'name' },
    { label: '用户名', prop: 'username' },
    { label: '学号', prop: 'studentNo' },
    { label: '年级', prop: 'grade' },
    { label: '班级', prop: 'className' },
    { label: '性别', prop: 'gender' },
    { label: '邮箱', prop: 'email' },
    { label: '电话', prop: 'phone' },
    { label: '导师', prop: 'teacherName' },
    { label: '导师电话', prop: 'teacherPhone' },
  ]

  // 转换数据格式
  const wsData = [
    headers.map((header) => header.label),
    ...data.map((item) =>
      headers.map((header) => {
        return item[header.prop] ?? ''
      }),
    ),
  ]

  // 创建工作表
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '成员数据')

  // 生成Excel文件并下载
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `${fileName}.xlsx`)
}

// 在 export.js 文件末尾添加

/**
 * 导出考试列表为 Excel
 * @param {Array} data - 考试列表数据
 * @param {string} fileName - 文件名
 */
export const exportExamListToExcel = (data, fileName = '考试列表') => {
  // 定义表头映射
  const headers = [
    { label: '序号', prop: 'index' },
    { label: '考试名称', prop: 'name' },
    { label: '考试类型', prop: 'typeText' },
    { label: '班级', prop: 'className' },
    { label: '课程', prop: 'courseName' },
    { label: '考试日期', prop: 'examDateStr' },
    { label: '满分', prop: 'fullScore' },
    { label: '参与人数', prop: 'studentCount' },
    { label: '平均分', prop: 'avgScore' },
    { label: '最高分', prop: 'highestScore' },
    { label: '及格率', prop: 'passRate' },
    { label: '状态', prop: 'statusText' },
  ]

  // 转换数据格式
  const wsData = [
    headers.map((header) => header.label),
    ...data.map((item, idx) =>
      headers.map((header) => {
        if (header.prop === 'index') return idx + 1
        if (header.prop === 'examDateStr') {
          if (item.examDate && Array.isArray(item.examDate)) {
            return formatExamDate(item.examDate)
          }
          return item.examDate || ''
        }
        if (header.prop === 'passRate') {
          return item.passRate ? `${item.passRate}%` : '-'
        }
        if (header.prop === 'avgScore') {
          return item.avgScore?.toFixed(1) || '-'
        }
        return item[header.prop] ?? ''
      }),
    ),
  ]

  // 创建工作表
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // 设置列宽
  ws['!cols'] = [
    { wch: 8 }, // 序号
    { wch: 25 }, // 考试名称
    { wch: 12 }, // 考试类型
    { wch: 15 }, // 班级
    { wch: 15 }, // 课程
    { wch: 20 }, // 考试日期
    { wch: 8 }, // 满分
    { wch: 10 }, // 参与人数
    { wch: 10 }, // 平均分
    { wch: 10 }, // 最高分
    { wch: 10 }, // 及格率
    { wch: 10 }, // 状态
  ]

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '考试列表')

  // 生成Excel文件并下载
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `${fileName}.xlsx`)
}

/**
 * 导出考试成绩为 Excel
 * @param {Object} examInfo - 考试信息（名称、班级等）
 * @param {Array} scores - 成绩列表
 * @param {string} fileName - 文件名
 */
export const exportExamScoresToExcel = (examInfo, scores, fileName = '考试成绩') => {
  // 定义表头映射
  const headers = [
    { label: '序号', prop: 'index' },
    { label: '学号', prop: 'studentNo' },
    { label: '姓名', prop: 'studentName' },
    { label: '成绩', prop: 'score' },
    { label: '班级排名', prop: 'classRank' },
    { label: '状态', prop: 'status' },
    { label: '备注', prop: 'remark' },
    { label: '成绩趋势', prop: 'scoreTrendText' },
  ]

  // 转换数据格式
  const wsData = [
    // 添加考试信息头
    ['考试名称', examInfo.name || ''],
    ['班级', examInfo.className || ''],
    ['考试日期', formatExamDate(examInfo.examDate) || ''],
    ['满分', examInfo.fullScore || ''],
    ['及格线', examInfo.passScore || ''],
    [],
    headers.map((header) => header.label),
    ...scores.map((item, idx) =>
      headers.map((header) => {
        if (header.prop === 'index') return idx + 1
        if (header.prop === 'status') {
          if (!item.score) return '未录入'
          return item.score >= (examInfo.passScore || 60) ? '及格' : '不及格'
        }
        if (header.prop === 'scoreTrendText') {
          if (item.scoreTrend === 'UP') return '上升'
          if (item.scoreTrend === 'STABLE') return '平稳'
          if (item.scoreTrend === 'DOWN') return '下降'
          return '-'
        }
        return item[header.prop] ?? ''
      }),
    ),
  ]

  // 创建工作表
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // 设置列宽
  ws['!cols'] = [
    { wch: 8 }, // 序号
    { wch: 15 }, // 学号
    { wch: 12 }, // 姓名
    { wch: 10 }, // 成绩
    { wch: 12 }, // 班级排名
    { wch: 10 }, // 状态
    { wch: 20 }, // 备注
    { wch: 10 }, // 成绩趋势
  ]

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '考试成绩')

  // 生成Excel文件并下载
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  const finalFileName = `${fileName}_${examInfo.name}_${new Date().toLocaleDateString()}`
  saveAs(blob, `${finalFileName}.xlsx`)
}

/**
 * 批量导出多个考试的成绩
 * @param {Array} examsData - 包含考试信息和成绩的数组
 */
export const exportMultipleExamScores = async (examsData) => {
  for (const exam of examsData) {
    const fileName = `${exam.examName}_${exam.className}`
    exportExamScoresToExcel(
      { name: exam.examName, className: exam.className, ...exam.examInfo },
      exam.scores,
      fileName,
    )
    // 添加延迟避免浏览器阻止多次下载
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
}

// 在 export.js 文件末尾添加

/**
 * 导出作业列表为 Excel
 * @param {Array} data - 作业列表数据
 * @param {string} fileName - 文件名
 */
export const exportHomeworkListToExcel = (data, fileName = '作业列表') => {
  // 定义表头映射
  const headers = [
    { label: '序号', prop: 'index' },
    { label: '作业名称', prop: 'name' },
    { label: '课程', prop: 'courseName' },
    { label: '题目数量', prop: 'questionCount' },
    { label: '总分', prop: 'totalScore' },
    { label: '提交人数', prop: 'submittedCount' },
    { label: '学生总数', prop: 'totalStudents' },
    { label: '提交率', prop: 'submitRate' },
    { label: '平均分', prop: 'avgScore' },
    { label: '通过率', prop: 'passRate' },
    { label: '状态', prop: 'statusText' },
    { label: '截止时间', prop: 'deadlineStr' },
  ]

  // 转换数据格式
  const wsData = [
    headers.map((header) => header.label),
    ...data.map((item, idx) =>
      headers.map((header) => {
        if (header.prop === 'index') return idx + 1
        if (header.prop === 'submitRate') {
          return item.totalStudents
            ? `${((item.submittedCount / item.totalStudents) * 100).toFixed(1)}%`
            : '-'
        }
        if (header.prop === 'passRate') {
          return item.passRate ? `${item.passRate}%` : '-'
        }
        if (header.prop === 'avgScore') {
          return item.avgScore?.toFixed(1) || '-'
        }
        if (header.prop === 'deadlineStr') {
          return formatExamDate(item.deadline) || '-'
        }
        return item[header.prop] ?? '-'
      }),
    ),
  ]

  // 创建工作表
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // 设置列宽
  ws['!cols'] = [
    { wch: 8 }, // 序号
    { wch: 30 }, // 作业名称
    { wch: 15 }, // 课程
    { wch: 10 }, // 题目数量
    { wch: 8 }, // 总分
    { wch: 10 }, // 提交人数
    { wch: 10 }, // 学生总数
    { wch: 10 }, // 提交率
    { wch: 10 }, // 平均分
    { wch: 10 }, // 通过率
    { wch: 10 }, // 状态
    { wch: 20 }, // 截止时间
  ]

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '作业列表')

  // 生成Excel文件并下载
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `${fileName}.xlsx`)
}

/**
 * 导出作业成绩单为 Excel
 * @param {Object} homeworkInfo - 作业信息
 * @param {Array} grades - 成绩列表
 * @param {string} fileName - 文件名
 */
export const exportHomeworkGradesToExcel = (homeworkInfo, grades, fileName = '作业成绩单') => {
  // 定义表头映射
  const headers = [
    { label: '序号', prop: 'index' },
    { label: '学号', prop: 'studentNo' },
    { label: '姓名', prop: 'studentName' },
    { label: '得分', prop: 'score' },
    { label: '总分', prop: 'totalScore' },
    { label: '得分率', prop: 'scoreRate' },
    { label: '状态', prop: 'status' },
    { label: '提交时间', prop: 'submitTime' },
    { label: '批改时间', prop: 'gradeTime' },
    { label: '批注', prop: 'feedback' },
  ]

  // 转换数据格式
  const wsData = [
    // 添加作业信息头
    ['作业名称', homeworkInfo.name || ''],
    ['课程', homeworkInfo.courseName || ''],
    ['截止时间', formatExamDate(homeworkInfo.deadline) || ''],
    ['总分', homeworkInfo.totalScore || ''],
    ['提交人数', `${homeworkInfo.submittedCount || 0}/${homeworkInfo.totalStudents || 0}`],
    ['平均分', homeworkInfo.avgScore?.toFixed(1) || '-'],
    ['通过率', homeworkInfo.passRate ? `${homeworkInfo.passRate}%` : '-'],
    [],
    headers.map((header) => header.label),
    ...grades.map((item, idx) =>
      headers.map((header) => {
        if (header.prop === 'index') return idx + 1
        if (header.prop === 'scoreRate') {
          return item.totalScore ? `${((item.score / item.totalScore) * 100).toFixed(1)}%` : '-'
        }
        if (header.prop === 'status') {
          if (!item.score && item.score !== 0) return '未批改'
          return item.score >= (homeworkInfo.passScore || 60) ? '及格' : '不及格'
        }
        if (header.prop === 'submitTime') {
          return formatExamDate(item.submitTime) || '-'
        }
        if (header.prop === 'gradeTime') {
          return formatExamDate(item.gradeTime) || '-'
        }
        return item[header.prop] ?? '-'
      }),
    ),
  ]

  // 创建工作表
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // 设置列宽
  ws['!cols'] = [
    { wch: 8 }, // 序号
    { wch: 15 }, // 学号
    { wch: 12 }, // 姓名
    { wch: 10 }, // 得分
    { wch: 8 }, // 总分
    { wch: 10 }, // 得分率
    { wch: 10 }, // 状态
    { wch: 20 }, // 提交时间
    { wch: 20 }, // 批改时间
    { wch: 30 }, // 批注
  ]

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '作业成绩')

  // 生成Excel文件并下载
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  const finalFileName = `${fileName}_${homeworkInfo.name}_${new Date().toLocaleDateString()}`
  saveAs(blob, `${finalFileName}.xlsx`)
}

/**
 * 导出作业分析报告为 Excel（包含详细数据）
 * @param {Object} analysisData - 分析数据
 * @param {string} fileName - 文件名
 */
export const exportHomeworkAnalysisToExcel = (analysisData, fileName = '作业分析报告') => {
  if (!analysisData) return

  // 创建工作簿
  const wb = XLSX.utils.book_new()

  // 1. 概览信息表
  const overviewData = [
    ['作业名称', analysisData.name || ''],
    ['课程', analysisData.courseName || ''],
    ['描述', analysisData.description || '无'],
    ['截止时间', formatExamDate(analysisData.deadline) || ''],
    ['总分', analysisData.totalScore || ''],
    ['提交人数', analysisData.submittedCount || 0],
    ['学生总数', analysisData.totalStudents || 0],
    ['提交率', analysisData.submitRate ? `${analysisData.submitRate}%` : '-'],
    ['平均分', analysisData.avgScore?.toFixed(1) || '-'],
    ['及格率', analysisData.passRate ? `${analysisData.passRate}%` : '-'],
    ['最高分', analysisData.scoreDistribution?.highestScore || '-'],
    ['最低分', analysisData.scoreDistribution?.lowestScore || '-'],
  ]
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData)
  XLSX.utils.book_append_sheet(wb, overviewSheet, '概览信息')

  // 2. 成绩分布表
  const distributionData = [
    ['分数段', '人数'],
    ['0-59分', analysisData.scoreDistribution?.failCount || 0],
    ['60-69分', analysisData.scoreDistribution?.passCount || 0],
    ['70-79分', analysisData.scoreDistribution?.mediumCount || 0],
    ['80-89分', analysisData.scoreDistribution?.goodCount || 0],
    ['90-100分', analysisData.scoreDistribution?.excellentCount || 0],
  ]
  const distributionSheet = XLSX.utils.aoa_to_sheet(distributionData)
  XLSX.utils.book_append_sheet(wb, distributionSheet, '成绩分布')

  // 3. 学生成绩明细表
  if (analysisData.studentGrades && analysisData.studentGrades.length > 0) {
    const gradeHeaders = [
      '序号',
      '学号',
      '姓名',
      '得分',
      '总分',
      '得分率',
      '提交时间',
      '批改时间',
      '批注',
    ]
    const gradeRows = analysisData.studentGrades.map((item, idx) => [
      idx + 1,
      item.studentNo || '-',
      item.studentName || '-',
      item.score ?? '-',
      item.totalScore || '-',
      item.totalScore ? `${((item.score / item.totalScore) * 100).toFixed(1)}%` : '-',
      formatExamDate(item.submitTime) || '-',
      formatExamDate(item.gradeTime) || '-',
      item.feedback || '无',
    ])
    const gradeSheet = XLSX.utils.aoa_to_sheet([gradeHeaders, ...gradeRows])
    // 设置列宽
    gradeSheet['!cols'] = [
      { wch: 8 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 8 },
      { wch: 10 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
    ]
    XLSX.utils.book_append_sheet(wb, gradeSheet, '学生成绩明细')
  }

  // 4. AI 分析建议表
  if (analysisData.aiSuggestions) {
    const aiData = [
      ['类型', '内容'],
      ['总结', analysisData.aiSuggestions.summary || '无'],
      ['建议', analysisData.aiSuggestions.suggestions || '无'],
    ]
    const aiSheet = XLSX.utils.aoa_to_sheet(aiData)
    XLSX.utils.book_append_sheet(wb, aiSheet, 'AI分析建议')
  }

  // 生成Excel文件并下载
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `${fileName}_${analysisData.name}_${new Date().toLocaleDateString()}.xlsx`)
}

// 导出课程分析报告到Excel
export const exportCourseAnalysisToExcel = (data, fileName) => {
  const workbook = XLSX.utils.book_new()

  // 课程概览表
  const overviewData = [
    ['课程名称', data.courseName],
    ['授课教师', data.teacherName],
    ['选课人数', data.statistics.studentCount],
    ['平均分', data.statistics.avgScore],
    ['及格率', `${data.statistics.passRate}%`],
    ['知识点数量', data.statistics.knowledgePointCount],
    ['导出时间', new Date().toLocaleString()],
  ]
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData)
  XLSX.utils.book_append_sheet(workbook, overviewSheet, '课程概览')

  // 知识点掌握表
  if (data.knowledgePoints && data.knowledgePoints.length > 0) {
    const kpData = data.knowledgePoints.map((kp) => ({
      知识点名称: kp.name,
      掌握度: `${kp.classAvgMastery}%`,
      父知识点: kp.parentName || '无',
      层级: kp.level,
      描述: kp.description || '',
    }))
    const kpSheet = XLSX.utils.json_to_sheet(kpData)
    XLSX.utils.book_append_sheet(workbook, kpSheet, '知识点掌握')
  }

  // 薄弱知识点表
  if (data.weakKnowledgePoints && data.weakKnowledgePoints.length > 0) {
    const weakData = data.weakKnowledgePoints.map((kp) => ({
      知识点名称: kp.name,
      错误率: `${kp.errorRate}%`,
      掌握度: `${kp.masteryLevel}%`,
      父知识点: kp.parentName || '无',
    }))
    const weakSheet = XLSX.utils.json_to_sheet(weakData)
    XLSX.utils.book_append_sheet(workbook, weakSheet, '薄弱知识点')
  }

  // AI分析报告
  if (data.aiAnalysis) {
    const aiData = [
      ['报告类型', 'AI课程分析报告'],
      [
        '生成时间',
        data.aiAnalysis.createdAt
          ? new Date(data.aiAnalysis.createdAt).toLocaleString()
          : new Date().toLocaleString(),
      ],
      ['核心总结', data.aiAnalysis.summary],
      ['教学优势', data.aiAnalysis.strengths?.join('；') || ''],
      ['薄弱环节', data.aiAnalysis.weaknesses?.join('；') || ''],
      ['教学建议', data.aiAnalysis.suggestions?.join('；') || ''],
    ]
    const aiSheet = XLSX.utils.aoa_to_sheet(aiData)
    XLSX.utils.book_append_sheet(workbook, aiSheet, 'AI分析报告')
  }

  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

/**
 * 导出活跃度数据为 Excel
 * @param {Array} data - 学生活跃度列表数据
 * @param {Object} statistics - 统计卡片数据（可选）
 * @param {string} className - 班级名称
 * @param {string} fileName - 文件名
 */
export const exportActivityDataToExcel = (data, statistics, className, fileName = '活跃度数据') => {
  if (!data || data.length === 0) {
    console.warn('没有可导出的数据')
    return
  }

  // 创建工作簿
  const wb = XLSX.utils.book_new()

  // ==================== 1. 概览信息表 ====================
  const overviewData = [
    ['班级名称', className || '全部班级'],
    ['导出时间', new Date().toLocaleString()],
    ['总学生数', statistics?.totalStudents || 0],
    ['平均活跃度', `${statistics?.avgActivityScore || 0}分`],
    ['高活跃学生', statistics?.highActivityCount || 0],
    ['低活跃学生', statistics?.lowActivityCount || 0],
    ['严重预警', statistics?.criticalCount || 0],
    [],
  ]
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData)
  XLSX.utils.book_append_sheet(wb, overviewSheet, '概览信息')

  // ==================== 2. 学生活跃度明细表 ====================
  const headers = [
    { label: '序号', prop: 'index' },
    { label: '学号', prop: 'studentNo' },
    { label: '姓名', prop: 'studentName' },
    { label: '班级', prop: 'className' },
    { label: '登录次数', prop: 'loginCount' },
    { label: '最后登录时间', prop: 'lastLoginTime' },
    { label: '作业提交次数', prop: 'homeworkCount' },
    { label: '考试参与次数', prop: 'examCount' },
    { label: '学习时长(分钟)', prop: 'studyDuration' },
    { label: '资源访问次数', prop: 'resourceAccessCount' },
    { label: '活跃度得分', prop: 'activityScore' },
    { label: '活跃等级', prop: 'activityLevelText' },
  ]

  const wsData = [
    headers.map((h) => h.label),
    ...data.map((item, idx) =>
      headers.map((header) => {
        if (header.prop === 'index') return idx + 1
        if (header.prop === 'lastLoginTime') {
          if (!item.lastLoginTime) return '-'
          const date = new Date(item.lastLoginTime)
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
        }
        if (header.prop === 'activityLevelText') {
          const levelMap = { HIGH: '高活跃', MEDIUM: '中活跃', LOW: '低活跃', CRITICAL: '极低' }
          return levelMap[item.activityLevel] || item.activityLevel || '-'
        }
        if (header.prop === 'activityScore') {
          return item.activityScore ? `${item.activityScore}分` : '-'
        }
        return item[header.prop] ?? '-'
      }),
    ),
  ]

  const detailSheet = XLSX.utils.aoa_to_sheet(wsData)

  // 设置列宽
  detailSheet['!cols'] = [
    { wch: 8 }, // 序号
    { wch: 15 }, // 学号
    { wch: 12 }, // 姓名
    { wch: 15 }, // 班级
    { wch: 10 }, // 登录次数
    { wch: 20 }, // 最后登录时间
    { wch: 12 }, // 作业提交次数
    { wch: 12 }, // 考试参与次数
    { wch: 15 }, // 学习时长
    { wch: 12 }, // 资源访问次数
    { wch: 12 }, // 活跃度得分
    { wch: 10 }, // 活跃等级
  ]

  XLSX.utils.book_append_sheet(wb, detailSheet, '学生活跃度明细')

  // ==================== 3. 活跃等级分布统计 ====================
  const levelStats = {
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    CRITICAL: 0,
  }
  data.forEach((item) => {
    if (levelStats[item.activityLevel] !== undefined) {
      levelStats[item.activityLevel]++
    }
  })

  const distributionData = [
    ['活跃等级', '人数', '占比'],
    [
      '高活跃',
      levelStats.HIGH,
      data.length ? `${((levelStats.HIGH / data.length) * 100).toFixed(1)}%` : '0%',
    ],
    [
      '中活跃',
      levelStats.MEDIUM,
      data.length ? `${((levelStats.MEDIUM / data.length) * 100).toFixed(1)}%` : '0%',
    ],
    [
      '低活跃',
      levelStats.LOW,
      data.length ? `${((levelStats.LOW / data.length) * 100).toFixed(1)}%` : '0%',
    ],
    [
      '极低（预警）',
      levelStats.CRITICAL,
      data.length ? `${((levelStats.CRITICAL / data.length) * 100).toFixed(1)}%` : '0%',
    ],
  ]
  const distributionSheet = XLSX.utils.aoa_to_sheet(distributionData)
  XLSX.utils.book_append_sheet(wb, distributionSheet, '活跃等级分布')

  // 生成文件并下载
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `${fileName}_${className}_${new Date().toLocaleDateString()}.xlsx`)
}

/**
 * 导出不活跃学生预警数据为 Excel
 * @param {Array} data - 预警学生列表
 * @param {string} className - 班级名称
 * @param {string} fileName - 文件名
 */
export const exportActivityWarningToExcel = (data, className, fileName = '不活跃学生预警') => {
  if (!data || data.length === 0) {
    console.warn('没有预警数据可导出')
    return
  }

  const headers = [
    { label: '序号', prop: 'index' },
    { label: '学号', prop: 'studentNo' },
    { label: '姓名', prop: 'studentName' },
    { label: '班级', prop: 'className' },
    { label: '活跃度得分', prop: 'activityScore' },
    { label: '预警等级', prop: 'warningLevelText' },
    { label: '预警原因', prop: 'warningReason' },
    { label: '建议措施', prop: 'suggestion' },
  ]

  const wsData = [
    headers.map((h) => h.label),
    ...data.map((item, idx) =>
      headers.map((header) => {
        if (header.prop === 'index') return idx + 1
        if (header.prop === 'warningLevelText') {
          return item.warningLevel === 'CRITICAL' ? '严重预警' : '一般预警'
        }
        if (header.prop === 'activityScore') {
          return item.activityScore ? `${item.activityScore}分` : '-'
        }
        return item[header.prop] ?? '-'
      }),
    ),
  ]

  const ws = XLSX.utils.aoa_to_sheet(wsData)
  ws['!cols'] = [
    { wch: 8 }, // 序号
    { wch: 15 }, // 学号
    { wch: 12 }, // 姓名
    { wch: 15 }, // 班级
    { wch: 12 }, // 活跃度得分
    { wch: 10 }, // 预警等级
    { wch: 30 }, // 预警原因
    { wch: 30 }, // 建议措施
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '不活跃预警学生')

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `${fileName}_${className}_${new Date().toLocaleDateString()}.xlsx`)
}

/**
 * 导出活跃度排行榜为 Excel
 * @param {Array} data - 排行榜数据
 * @param {string} className - 班级名称
 * @param {string} fileName - 文件名
 */
export const exportActivityRankingToExcel = (data, className, fileName = '活跃度排行榜') => {
  if (!data || data.length === 0) {
    console.warn('没有排行榜数据可导出')
    return
  }

  const headers = [
    { label: '排名', prop: 'rank' },
    { label: '学号', prop: 'studentNo' },
    { label: '姓名', prop: 'studentName' },
    { label: '班级', prop: 'className' },
    { label: '活跃度得分', prop: 'activityScore' },
    { label: '登录次数', prop: 'loginCount' },
    { label: '学习时长(分钟)', prop: 'studyDuration' },
  ]

  const wsData = [
    headers.map((h) => h.label),
    ...data.map((item, idx) =>
      headers.map((header) => {
        if (header.prop === 'rank') return idx + 1
        if (header.prop === 'activityScore') {
          return item.activityScore ? `${item.activityScore}分` : '-'
        }
        return item[header.prop] ?? '-'
      }),
    ),
  ]

  const ws = XLSX.utils.aoa_to_sheet(wsData)
  ws['!cols'] = [
    { wch: 8 }, // 排名
    { wch: 15 }, // 学号
    { wch: 12 }, // 姓名
    { wch: 15 }, // 班级
    { wch: 12 }, // 活跃度得分
    { wch: 10 }, // 登录次数
    { wch: 15 }, // 学习时长
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '活跃度排行榜')

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `${fileName}_${className}_${new Date().toLocaleDateString()}.xlsx`)
}

/**
 * 导出教师列表为 Excel
 * @param {Array} data - 教师列表数据
 * @param {string} fileName - 文件名
 */
export const exportTeacherExcel = (data, fileName) => {
  // 定义表头映射
  const headers = [
    { label: '序号', prop: '序号' },
    { label: '工号', prop: '工号' },
    { label: '用户名', prop: '用户名' },
    { label: '姓名', prop: '姓名' },
    { label: '性别', prop: '性别' },
    { label: '部门', prop: '部门' },
    { label: '职称', prop: '职称' },
    { label: '办公室', prop: '办公室' },
    { label: '邮箱', prop: '邮箱' },
    { label: '手机号', prop: '手机号' },
    { label: '角色', prop: '角色' },
  ]

  // 转换数据格式
  const wsData = [
    headers.map((header) => header.label),
    ...data.map((item) =>
      headers.map((header) => {
        return item[header.prop] ?? ''
      }),
    ),
  ]

  // 创建工作表
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // 设置列宽
  ws['!cols'] = [
    { wch: 8 }, // 序号
    { wch: 15 }, // 工号
    { wch: 15 }, // 用户名
    { wch: 12 }, // 姓名
    { wch: 6 }, // 性别
    { wch: 15 }, // 部门
    { wch: 12 }, // 职称
    { wch: 15 }, // 办公室
    { wch: 25 }, // 邮箱
    { wch: 15 }, // 手机号
    { wch: 8 }, // 角色
  ]

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '教师数据')

  // 生成Excel文件并下载
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `${fileName}.xlsx`)
}
