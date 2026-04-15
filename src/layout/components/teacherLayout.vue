<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/index.js'
import { useAppStore } from '@/stores/index.js'
import {
  Monitor,
  ArrowDown,
  Fold,
  Expand,
  Moon,
  User,
  Memo,
  Warning,
  Star,
  Files,
  MessageBox
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { authApi } from '@/api'

const props = defineProps({
  menuList: {
    type: Array,
    default: () => [],
  },
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()
const userInfo = ref(null)
const loadUserInfo = async () => {
  try {
    const res = await authApi.getUserInfo()
    if (res && res.data) {
      userInfo.value = res.data?.user
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}
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

const isCollapse = computed(() => !appStore.sidebarOpened)
const asideWidth = computed(() => (appStore.isMobile ? '0px' : isCollapse.value ? '64px' : '220px'))
onMounted(async () => {
  await loadUserInfo()
})
</script>

<template>
  <el-container class="teacher-layout">
    <el-aside :width="asideWidth" class="aside"
      :class="{ 'aside-collapsed': isCollapse, 'aside-mobile': appStore.isMobile }">
      <div class="logo">
        <span class="logo-icon" v-if="isCollapse"><i class="fas fa-chart-pie"></i></span>
        <h3 v-else>EduVision · 智慧教育</h3>
      </div>
      <el-menu :default-active="activeMenu" class="el-menu-vertical" text-color="var(--el-text-color-regular)"
        active-text-color="#fff" router :collapse="isCollapse">
        <el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <template #title>{{ item.name }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="fold-btn" @click="appStore.toggleSidebar">
            <component :is="isCollapse ? Expand : Fold" style="color: var(--el-text-color-regular);" />
          </el-icon>
          <el-breadcrumb separator="/" v-if="!appStore.isMobile">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.name || route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="username" v-if="!appStore.isMobile">{{ userInfo?.user?.name }} (教师)</span>
              <el-icon>
                <ArrowDown />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
.teacher-layout {
  height: 100vh;
  width: 100%;

  .aside {
    background-color: #fff;
    transition: width 0.3s;
    overflow: hidden;
    z-index: 1001;

    .logo {
      height: 60px;
      line-height: 60px;
      text-align: center;
      color: #fff;
      background-color: var(--el-text-color-regular);
      ;
      white-space: nowrap;

      h3 {
        margin: 0;
        font-size: 16px;
      }
    }

    .el-menu-vertical {
      border-right: none;

      .el-menu-item,
      .el-sub-menu {
        margin: 6px;

        :deep(.el-menu-tooltip__trigger) {
          padding: 0 !important;
          justify-content: center !important;
          border-radius: 0px !important;
        }

        &,
        &__title {
          border-radius: 30px;
          overflow: hidden;

          span {
            margin-left: 10px;
          }
        }
      }

      .el-menu-item.is-active {
        background-color: var(--el-color-primary);
      }

      :deep(.el-menu-item.is-active) .svg_icon {
        fill: var(--el-color-primary) !important;
      }

      .el-sub-menu.is-active {
        :deep(.el-sub-menu__title) {
          border-left: 4px solidvar(--el-color-primary);
          background-color: var(--el-color-primary);
          color: var(--el-color-primary);

          .svg_icon {
            fill: var(--el-color-primary) !important;
          }
        }

        .el-menu-item.is-active {
          border: none;

          :deep(.el-menu-item.is-active) .svg_icon {
            background-color: var(--el-color-primary);
            fill: var(--el-color-primary) !important;
          }
        }
      }

    }

    &.aside-mobile {
      position: fixed;
      height: 100%;
      left: -220px;

      &.aside-collapsed {
        left: 0;
        width: 220px !important;
      }
    }
  }

  .header {
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;

      .fold-btn {
        font-size: 20px;
        cursor: pointer;
        color: var(--el-text-color-primary);
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;

      .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;
        gap: 8px;

        .username {
          font-size: 14px;
          color: var(--el-text-color-primary);
        }
      }
    }
  }

  .main {
    background-color: #f5f7fa;
    padding: 20px;
    overflow-y: auto;

    :deep(.el-card) {
      width: 100%;
      height: 100%;
      border-radius: 30px;
      padding: 10px;

      .el-card__body {
        padding: 8px 28px;
      }
    }
  }
}
</style>
