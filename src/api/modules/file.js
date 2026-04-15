// src/api/file.js
import request from '@/utils/request.js'

export const fileApi = {
  /**
   * 方式1：Base64 方式上传（支持任意格式文件）
   * @param {File} file - 文件对象
   * @param {string} dataType - 数据类型（如：学生信息、成绩数据）
   */
  uploadFile(file, dataType) {
    return new Promise((resolve, reject) => {
      // 读取文件并转为 Base64
      const reader = new FileReader()

      reader.onload = () => {
        // 去掉 data:xxx;base64, 前缀，只保留 base64 字符串
        const base64Content = reader.result.split(',')[1]

        const requestData = {
          fileContent: base64Content,
          fileName: file.name,
          fileType: file.type || getFileExtension(file.name),
          dataType: dataType,
        }

        // 发送请求
        request({
          url: '/file/parse',
          method: 'post',
          data: requestData,
          timeout: 120000, // 文件上传超时时间设置长一点
        })
          .then(resolve)
          .catch(reject)
      }

      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }

      // 读取文件为 Base64
      reader.readAsDataURL(file)
    })
  },

  /**
   * 方式2：FormData 方式上传（更标准，推荐）
   * @param {File} file - 文件对象
   * @param {string} dataType - 数据类型
   */
  uploadFileWithFormData(file, dataType) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('dataType', dataType)

    // 需要单独设置 Content-Type，让浏览器自动处理 FormData 的边界
    return request({
      url: '/file/upload',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000,
    })
  },

  /**
   * 确认插入数据
   * @param {string} sessionId - 会话ID
   * @param {Array} data - 确认后的数据
   * @param {boolean} confirmed - 是否确认
   */
  confirmInsert(sessionId, data, confirmed = true) {
    return request({
      url: '/file/confirm',
      method: 'post',
      data: {
        sessionId: sessionId,
        data: data,
        confirmed: confirmed,
      },
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
function getFileExtension(filename) {
  return filename.substring(filename.lastIndexOf('.') + 1)
}
