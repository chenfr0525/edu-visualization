import request from '@/utils/request.js'

export const authApi = {
  // 登录
  login(data) {
    return request({
      url: '/auth/login',
      method: 'post',
      data,
    })
  },

  // 注册
  register(data) {
    return request({
      url: '/auth/register',
      method: 'post',
      data,
    })
  },

  // 登出
  logout() {
    return request({
      url: '/auth/logout',
      method: 'post',
    })
  },
}
