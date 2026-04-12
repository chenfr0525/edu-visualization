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

  // 获取用户菜单
  getMenus(role) {
    return request({
      url: '/menu/list',
      params: {
        role,
      },
      method: 'get',
    })
  },

  getUserInfo() {
    return request({
      url: '/user/info',
      method: 'get',
    })
  },
}
