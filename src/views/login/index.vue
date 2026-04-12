<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/index.js'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const activeName = ref('login')
const loginForm = ref({
  username: '',
  password: '',
  role: 'student'
})

const registerForm = ref({
  username: '',
  password: '',
  repassword: '',
  role: 'student',
  agree: false
})

const loading = ref(false)

// 登录逻辑
const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    await authStore.login(loginForm.value)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '登录失败')
    console.log('登录失败', error)
  } finally {
    loading.value = false
  }
}

// 注册逻辑
const handleRegister = async () => {
  // 表单验证
  if (!registerForm.value.username || !registerForm.value.password) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (registerForm.value.password !== registerForm.value.repassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  if (!registerForm.value.agree) {
    ElMessage.warning('请同意用户协议')
    return
  }

  loading.value = true
  try {
    await authStore.register(registerForm.value)
    ElMessage.success('注册成功')
    activeName.value = 'login' // 切换到登录页
  } catch (error) {
    console.log('注册失败', error)
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧区域 -->
      <div class="left-side">
        <div class="logo">
          <span class="logo-icon"><i class="fas fa-chart-pie"></i></span>
          <span>EduVision</span>
        </div>
        <div class="brand-tagline">
          智慧教育<br>数据可视化平台
        </div>
        <div class="brand-description">
          为师生提供深度的学习数据分析与可视化洞察，让数据驱动教学决策。
        </div>
        <ul class="feature-list">
          <li><i class="fas fa-check-circle"></i> 个人学习驾驶舱 · 实时追踪</li>
          <li><i class="fas fa-check-circle"></i> 教师教学看板 · 精准分析</li>
          <li><i class="fas fa-check-circle"></i> 多角色权限 · 差异化视图</li>
          <li><i class="fas fa-check-circle"></i> JWT 安全认证 · 数据加密</li>
        </ul>
      </div>

      <div class="right-side">
        <!-- 登录/注册切换 -->
        <div class="form-container">
          <el-tabs v-model="activeName" class="demo-tabs" default-value="login">
            <!-- 登录表单 --> <el-tab-pane label="登录" name="login">
              <el-form :model="loginForm" label-position="top">
                <el-form-item label="用户名">
                  <el-input size="large" v-model="loginForm.username" placeholder="请输入用户名">
                    <template #prefix>
                      <i class="fas fa-user"></i>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="密码">
                  <el-input size="large" v-model="loginForm.password" type="password" placeholder="请输入密码" show-password>
                    <template #prefix>
                      <i class="fas fa-lock"></i>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <el-button size="large" type="primary" class="login-button" @click="handleLogin" :loading="loading">
                    登 录
                  </el-button>
                </el-form-item>
                <el-form-item>
                  <el-divider>切换角色</el-divider>
                  <el-radio-group class="full-width-radio" v-model="loginForm.role" size="large">
                    <el-radio label="学生" value="student">
                      <i class="fas fa-user-graduate"></i>
                      学生
                    </el-radio>
                    <el-radio label="教师" value="teacher">
                      <i class="fas fa-chalkboard-teacher"></i>
                      教师
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <!-- 注册表单 -->
            <el-tab-pane label="注册" name="register">
              <el-form :model="registerForm" label-position="top">
                <el-form-item label="用户名">
                  <el-input size="large" v-model="registerForm.username" placeholder="请输入用户名">
                    <template #prefix>
                      <i class="fas fa-user"></i>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="密码">
                  <el-input size="large" v-model="registerForm.password" type="password" placeholder="请输入密码"
                    show-password>
                    <template #prefix>
                      <i class="fas fa-lock"></i>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="确认密码">
                  <el-input size="large" v-model="registerForm.repassword" type="password" placeholder="再次输入密码"
                    show-password>
                    <template #prefix>
                      <i class="fas fa-lock"></i>
                    </template></el-input>
                </el-form-item>
                <el-form-item prop="type" class="loginType" size="small" label="登录方式">
                  <el-radio-group v-model="registerForm.role">
                    <el-radio size="large" value="student" label="学生" />
                    <el-radio size="large" value="teacher" label="教师" />
                  </el-radio-group>
                </el-form-item>
                <el-form-item>
                  <el-checkbox size="large" v-model="registerForm.agree">我已阅读并同意用户协议和隐私政策</el-checkbox>
                </el-form-item>
                <el-form-item>
                  <el-button size="large" type="primary" class="login-button" @click="handleRegister"
                    :loading="loading">
                    注册
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="footer">
          © 2026 智慧教育平台
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f0fa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;


  .login-container {
    max-width: 1100px;
    width: 100%;
    height: 800px;
    background: white;
    border-radius: 48px;
    box-shadow: 0 40px 70px -25px rgba(0, 45, 80, 0.35);
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    border: 1px solid rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(2px);

    // 左侧区域
    .left-side {
      flex: 1.1;
      background: linear-gradient(145deg, #1d4e7c 0%, #133b5e 100%);
      padding: 50px 40px;
      color: white;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;

      .logo {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 50px;
        position: relative;
        z-index: 2;

        .logo-icon {
          background: white;
          color: #1d4e7c;
          width: 50px;
          height: 50px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
        }
      }

      .brand-tagline {
        font-size: 2.2rem;
        font-weight: 600;
        line-height: 1.3;
        margin-bottom: 25px;
        position: relative;
        z-index: 2;
      }

      .brand-description {
        font-size: 1rem;
        opacity: 0.85;
        margin-bottom: 40px;
        max-width: 320px;
        line-height: 1.6;
        position: relative;
        z-index: 2;
      }

      .feature-list {
        list-style: none;
        margin-top: auto;
        position: relative;
        z-index: 2;

        li {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
          font-size: 1rem;

          i {
            width: 24px;
            color: #ffd966;
          }
        }
      }

      &::before {
        content: '';
        position: absolute;
        top: -30%;
        right: -20%;
        width: 300px;
        height: 300px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 50%;
      }
    }

    //右侧区域
    .right-side {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 50px 45px;
      background: white;

      .form-container {
        flex: 1;
        overflow-y: auto;

        :deep(.el-tabs__header) {
          margin: 30px 0;

          .el-tabs__item {
            font-weight: 600 !important;
            font-size: 1.4rem !important;
            color: var(--el-text-color-placeholder);

            &.is-active {
              color: var(--el-color-primary);
            }
          }
        }

        :deep(.el-form-item) {

          .el-form-item__labe {
            font-weight: 500 !important;
            font-size: var(--el-font-size-medium);
          }

          .el-form-item__content {
            font-size: var(--el-font-size-medium);

            .el-input__wrapper {
              border-radius: var(--el-border-radius-round);

              .el-input__inner {
                font-size: var(--el-font-size-medium);
              }
            }
          }
        }

        :deep(.el-divider__text) {
          color: var(--el-text-color-placeholder);
          font-size: var(--el-font-size-medium);
        }

        :deep(.el-button) {
          width: 100%;
          font-size: 16px;
          height: 50px;
          border-radius: 50px;
          margin-top: 30px;
        }

        .full-width-radio {
          display: flex;
          width: 100%;

          :deep(.el-radio) {
            flex: 1;
            display: flex;
            justify-content: center; // 文字居中
            align-items: center;
            border: 1px solid var(--el-text-color-secondary);
            background-color: var(--el-fill-color);
            border-radius: 50px;
            padding: 12px 0;
            margin-left: 0;
            height: 50px;
            gap: 20px;

            // 选中状态样式
            &.is-checked {
              background-color: var(--el-color-primary);
              border-color: var(--el-color-primary);

              .el-radio__label {
                color: white !important;
              }
            }
          }

          // 隐藏默认的 radio 圆圈
          :deep(.el-radio__input) {
            display: none;
          }

          // 标签文字样式
          :deep(.el-radio__label) {
            font-size: 16px;
            color: var(--el-color-primary);
            padding-left: 0;
          }
        }
      }

      .footer {
        flex-shrink: 0;
        text-align: center;
        padding-top: 10px;
        color: #8ba3c0;
        font-size: 0.85rem;
      }
    }
  }

  /* 响应式 */
  @media (max-width: 850px) {
    .login-container {
      flex-direction: column;
    }
  }

}
</style>
