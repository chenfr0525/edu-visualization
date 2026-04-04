<script setup>
import { ref, computed, onMounted } from 'vue'
const userInfo = ref({ id: "20213733", name: '张小明', avatar: '', class: '高三(1)班' })
</script>

<template>
  <div class="personal-center">
    <h4>个人中心</h4>
    <el-card class="personal-card" shadow="never">
      <el-row :gutter="20">
        <el-col :span="8" class="info-left">
          <el-avatar shape="square" :size="100" fit="cover" v-if="userInfo.avatar" :src="userInfo.avatar" />
          <el-avatar shape="square" :size="100" v-else>{{ userInfo.name.slice(0, 1) }}</el-avatar>
          <h3>{{ userInfo.name }}</h3>
          <p>学号: {{ userInfo.id }}</p>
          <p>班级: {{ userInfo.class }}</p>
          <el-button size="large" type="primary">
            <i class="fas fa-edit"></i> 更新头像
          </el-button>
        </el-col>
        <el-col :span="16" class="info-right">
          <el-card shadow="never" style="background: #f9fcff;">
            <h4>账号信息</h4>
            <div class="info-content">
              <span>用户名</span><span>zhangxiaoming</span> <span>邮箱</span><span>zhang@edu.com</span>
              <span>手机</span><span>138****1234</span> <span>注册时间</span><span>2024-09-01</span>
            </div>
          </el-card>
          <div class="btn-group">
            <el-button size="large" type="primary">
              <i class="fas fa-edit"></i> 更新信息
            </el-button>
            <el-button size="large">
              <i class="fas fa-key"></i> 修改密码
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>
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
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 15px;
      margin-top: 20px;
    }

    .btn-group {
      display: flex;
      justify-content: flex-end;
      gap: 10px;

    }
  }
}
</style>
