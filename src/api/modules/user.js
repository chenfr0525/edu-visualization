import request from '@/utils/request'

export const userApi = {
  // 获取用户信息
  // getUserInfo(userId, role) {
  //   return request({
  //     url: '/user/info',
  //     method: 'get',
  //     params: { userId, role },
  //   })
  // },

  // 获取统计数据
  getUserStats(userId, role) {
    return request({
      url: '/user/stats',
      method: 'get',
      params: { userId, role },
    })
  },

  // 获取最近活动
  getUserActivities(userId, role) {
    return request({
      url: '/user/activities',
      method: 'get',
      params: { userId, role },
    })
  },

  // 更新用户信息
  updateUserInfo(data) {
    return request({
      url: '/auth/update-info',
      method: 'post',
      data,
    })
  },

  // 修改密码
  changePassword(data) {
    return request({
      url: '/auth/update-password',
      method: 'post',
      data,
    })
  },

  // 上传头像
  uploadAvatar(formData) {
    return request({
      url: '/user/upload-avatar',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
