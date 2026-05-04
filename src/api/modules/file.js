import request from '@/utils/request.js'
import * as XLSX from 'xlsx'

export const fileApi = {
  /**
   * 上传并解析文件（支持 Excel 和 CSV）
   */
  uploadFile(file, dataType, courseId = null) {
    return new Promise((resolve, reject) => {
      const fileExt = file.name.split('.').pop().toLowerCase()
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          let jsonData = []
          const rawData = e.target.result

          if (fileExt === 'csv') {
            // CSV 解析
            const text = rawData
            const lines = text.split(/\r?\n/)
            if (lines.length === 0) {
              reject(new Error('文件为空'))
              return
            }

            // 解析表头
            const headers = lines[0].split(/[ ,]+/).map((h) => h.trim())

            // 解析数据行
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim()
              if (line === '') continue

              const values = line.split(/[ ,]+/).map((v) => v.trim())
              const row = {}
              headers.forEach((header, idx) => {
                row[header] = values[idx] || null
              })
              jsonData.push(row)
            }
          } else {
            // Excel 解析 (xlsx, xls)
            const workbook = XLSX.read(rawData, { type: 'binary' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            jsonData = XLSX.utils.sheet_to_json(firstSheet)
          }

          if (jsonData.length === 0) {
            reject(new Error('文件中没有数据'))
            return
          }

          // 发送 JSON 数据给后端
          request({
            url: '/file/parse',
            method: 'post',
            data: {
              fileContent: JSON.stringify(jsonData),
              fileName: file.name,
              dataType: dataType,
              courseId: courseId,
            },
            timeout: 120000,
          })
            .then(resolve)
            .catch(reject)
        } catch (error) {
          console.error('文件解析失败:', error)
          reject(new Error('文件解析失败: ' + error.message))
        }
      }

      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }

      // 根据文件类型选择读取方式
      if (fileExt === 'csv') {
        reader.readAsText(file, 'UTF-8')
      } else {
        reader.readAsBinaryString(file)
      }
    })
  },

  /**
   * 确认插入数据
   * @param {string} sessionId - 会话ID
   * @param {Array} data - 确认后的数据
   * @param {boolean} confirmed - 是否确认
   */
  confirmInsert(data, type) {
    return request({
      url: '/file/confirm',
      method: 'post',
      data: { data, type },
    })
  },

  /**
   * 取消插入
   * @param {string} sessionId - 会话ID
   */
  cancelInsert(sessionId) {
    return request({
      url: `/file/cancel/${sessionId}`,
      method: 'delete',
    })
  },
}

// 辅助函数：获取文件扩展名
export function getFileExtension(filename) {
  return filename.substring(filename.lastIndexOf('.') + 1)
}
