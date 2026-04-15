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
