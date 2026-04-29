import request from '@/utils/request.js'

export const unifiedAiApi = {
  // 统一AI分析接口
  analyze(params) {
    return request({
      url: '/ai/unified/analyze',
      method: 'post',
      data: params,
    })
  },
  // 强制刷新AI分析
  refresh(params) {
    return request({
      url: '/ai/unified/refresh',
      method: 'post',
      data: params,
    })
  },
}
