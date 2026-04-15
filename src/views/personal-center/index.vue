<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/index.js'
import { authApi, userApi } from '@/api/index.js'
import { ElMessage } from 'element-plus'
import EditInfoDialog from './component/edit-info-dialog.vue'
import EditPasswordDialog from './component/edit-password-dialog.vue'

const authStore = useAuthStore()
const userRole = computed(() => authStore.userRole)

// 用户信息
const userInfo = ref({
  id: '',
  name: '',
  avatar: '',
  username: '',
  email: '',
  phone: '',
  role: '',
  updatedAt: ""
})

// 弹窗控制
const editDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res = await authApi.getUserInfo()
    if (res && res.data) {
      userInfo.value = { ...res.data?.user?.user, id: res.data?.user.id }
      console.log('用户信息:', userInfo.value)
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    ElMessage.error('加载用户信息失败')
  }
}

// 更新信息
const handleUpdateInfo = async (data) => {
  try {
    const res = await userApi.updateUserInfo(data)
    if (res && res.code === 200) {
      ElMessage.success('信息更新成功')
      editDialogVisible.value = false
      await loadUserInfo()
    }
  } catch (error) {
    console.error('更新信息失败:', error)
    ElMessage.error('更新信息失败')
  }
}

// 修改密码
const handleChangePassword = async (data) => {
  try {
    const res = await userApi.changePassword(data)
    if (res && res.code === 200) {
      ElMessage.success('密码修改成功')
      passwordDialogVisible.value = false
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.response?.data?.message || '修改密码失败')
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  return time.slice(0, 3).join('-')
}

onMounted(async () => {
  await loadUserInfo()
})
</script>

<template>
  <div class="personal-center">
    <h4>个人中心</h4>
    <el-card class="personal-card" shadow="never">
      <el-row :gutter="20">
        <el-col :span="8" class="info-left">
          <el-avatar shape="square" :size="100" fit="cover" v-if="userInfo.avatar" :src="userInfo.avatar" />
          <el-avatar shape="square" :size="100" v-else>{{ userInfo.name?.slice(0, 1) || 'U' }}</el-avatar>
          <h3>{{ userInfo.name }}</h3>
          <p v-if="userRole === 'student'">学号: {{ userInfo.studentId || userInfo.id }}</p>
          <p v-if="userRole === 'teacher'">工号: {{ userInfo.teacherId || userInfo.id }}</p>
          <p v-if="userRole === 'student'">班级: {{ userInfo.className }}</p>
          <p v-if="userRole === 'teacher'">部门: {{ userInfo.department }}</p>
          <p v-if="userRole === 'teacher'">职称: {{ userInfo.title }}</p>
        </el-col>
        <el-col :span="16" class="info-right">
          <el-card shadow="never" style="background: #f9fcff;">
            <h4>账号信息</h4>
            <div class="info-content">
              <div class="info-row">
                <span class="label">用户名</span>
                <span class="value">{{ userInfo.username }}</span>
                <span class="label">邮箱</span>
                <span class="value">{{ userInfo.email }}</span>
              </div>
              <div class="info-row">
                <span class="label">手机号</span>
                <span class="value">{{ userInfo.phone || '未设置' }}</span>
                <span class="label">注册时间</span>
                <span class="value">{{ formatTime(userInfo.updatedAt) }}</span>
              </div>
              <div class="info-row" v-if="userRole === 'student'">
                <span class="label">年级</span>
                <span class="value">{{ userInfo.grade }}</span>
                <span class="label">性别</span>
                <span class="value">{{ userInfo.gender || '未设置' }}</span>
              </div>
              <div class="info-row" v-if="userRole === 'teacher'">
                <span class="label">性别</span>
                <span class="value">{{ userInfo.gender || '未设置' }}</span>
                <span class="label">办公室</span>
                <span class="value">{{ userInfo.office || '未设置' }}</span>
              </div>
            </div>
          </el-card>
          <div class="btn-group">
            <el-button size="large" type="primary" @click="editDialogVisible = true">
              <i class="fas fa-edit"></i> 编辑资料
            </el-button>
            <el-button size="large" @click="passwordDialogVisible = true">
              <i class="fas fa-key"></i> 修改密码
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <EditInfoDialog v-model:visible="editDialogVisible" :user-info="userInfo" :user-role="userRole"
      @submit="handleUpdateInfo" />
    <EditPasswordDialog v-model:visible="passwordDialogVisible" @submit="handleChangePassword" />
  </div>
</template>

<style scoped lang="scss">
.personal-card {
  width: 100%;
  border: 1px solid #e2effb;

  .info-left {
    display: flex;
    align-items: center;
    flex-direction: column;

    :deep(.el-avatar) {
      font-size: 40px;
      background: linear-gradient(135deg, #1d4e7c, #2d6a9f);
    }
  }

  .info-right {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .info-content {
      .info-row {
        display: grid;
        grid-template-columns: 80px 1fr 80px 1fr;
        gap: 12px;
        margin-bottom: 16px;

        .label {
          color: #6b7280;
          font-size: 13px;
        }

        .value {
          color: #1f2937;
          font-weight: 500;
        }
      }
    }

    .btn-group {
      display: flex;
      justify-content: flex-end;
      gap: 10px;

    }
  }
}

@media (max-width: 768px) {
  .personal-center {
    padding: 10px;

    .personal-card {
      .info-left {
        border-right: none;
        border-bottom: 1px solid #e2effb;
        padding-bottom: 20px;
        margin-bottom: 20px;
      }

      .info-right .info-card .info-content .info-row {
        grid-template-columns: 1fr 1fr;
        gap: 8px;

        .label:nth-child(3),
        .value:nth-child(4) {
          display: none;
        }
      }
    }
  }
}
</style>
