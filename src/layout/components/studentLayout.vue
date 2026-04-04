<script setup>
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import {
  Monitor,
  ArrowDown,
  Moon,
  User,
  Memo,
  Star,
  Files,
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出吗？',
    {
      title: '温馨提示',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      showClose: true
    }
  )
    .then(() => {
      authStore.logout()
      router.push('/login')
      ElMessage({
        type: 'success',
        message: '退出成功',
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消',
      })
    })
}

const activeMenu = computed(() => route.path)

// 侧边栏菜单项配置
const menuItems = [
  { name: '个人驾驶舱', path: '/', icon: Monitor, roles: ['student'] },
  { name: '知识点掌握', path: '/knowledge-mastery', icon: Star, roles: ['student'] },
  { name: '课程概览', path: '/course-overview', icon: Memo, roles: ['student'] },
  { name: '作业跟踪', path: '/homework-tracking', icon: Files, roles: ['student'] },
  { name: '成绩分析', path: '/grade-analysis', icon: Moon, roles: ['student'] },
  { name: '个人中心', path: '/personal-center', icon: User, roles: ['student'] },
]
</script>

<template>
  <el-container class="student-layout">
    <el-header class="layout-header">
      <div class="logo-area">
        <span class="logo-icon"><i class="fas fa-chart-pie"></i></span>
        <span>EduVision · 智慧教育</span>
      </div>
      <div class="header-right">
        <i class="fas fa-bell"></i>
        <el-dropdown>
          <div class="user-info">
            <div class="avatar">张</div>
            <span>张小明</span>
            <el-icon>
              <ArrowDown />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container class="layout-main">
      <el-header class="main-menu">
        <el-card>
          <el-menu :default-active="activeMenu" ellipsis class="el-menu-popper-demo" mode="horizontal"
            :popper-offset="16" style="max-width: 100%" router>
            <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <template #title>{{ item.name }}</template>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-header>
      <el-main class="main-content">
        <el-card shadow="never">
          <router-view />
        </el-card>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
.student-layout {
  width: 100%;
  height: 100%;
  background: var(--el-fill-color);

  .layout-header {
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 28px;

    .logo-area {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 1.3rem;
      color: var(--el-text-color-primary);

      .logo-icon {
        background: var(--el-text-color-regular);
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 25px;

      i {
        font-size: 1.2rem;
        color: var(--el-text-color-secondary);
        cursor: default;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 5px;

        .avatar {
          width: 42px;
          height: 42px;
          background: var(--el-text-color-regular);
          color: white;
          border-radius: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

      }
    }



  }

  .layout-main {
    flex: 1;
    padding: 20px;

    :deep(.el-card) {
      width: 100%;
      height: 100%;
      border-radius: 60px;
      padding: 0;

      .el-card__body {
        padding: 8px 28px;
      }
    }

    .main-menu {
      height: 60px;
      padding: 0px;
      display: flex;
      align-items: center;
      justify-content: center;

      .el-menu--horizontal.el-menu {
        height: 43px;
        border-bottom: none;
        display: flex;
        align-items: center;
        gap: 20px;


        .el-menu-item {
          height: 100%;
          line-height: 44px;
          border-radius: 44px;

          &.is-active {
            background-color: var(--el-color-primary);
            border-bottom: none;
            color: #fff !important;
          }
        }
      }
    }

    .main-content {
      margin-top: 20px;
      padding: 0px;

      :deep(.el-card) {
        border-radius: 24px;
      }
    }


  }
}
</style>
