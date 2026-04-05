import Mock from 'mockjs'

// 生成随机头像
export const generateAvatar = (name) => {
  const colors = ['#1d4e7c', '#2d6a9f', '#3a7ca5', '#4a8db5', '#5a9ec5']
  const color = colors[Math.floor(Math.random() * colors.length)]
  return `https://ui-avatars.com/api/?background=${color.slice(1)}&color=fff&name=${encodeURIComponent(name)}`
}

// 响应包装器
export const success = (data, message = 'success') => ({
  code: 200,
  message,
  data,
  timestamp: Date.now(),
})

export const error = (message, code = 400) => ({
  code,
  message,
  data: null,
  timestamp: Date.now(),
})

// Mock 延迟
export const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// 分页数据生成
export const paginate = (data, pageNum = 1, pageSize = 10) => {
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  return {
    list: data.slice(start, end),
    total: data.length,
    pageNum,
    pageSize,
  }
}

// 随机分数（正态分布）
export const randomScore = (mean = 75, std = 10) => {
  let u = 0,
    v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return Math.min(100, Math.max(0, Math.round(mean + std * z)))
}

// 生成日期范围内的随机日期
export const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}
