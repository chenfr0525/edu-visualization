import { createApp } from 'vue'
import pinia from './stores/index.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { setupMock } from './mock'

import App from './App.vue'
import router from './router'

import './mock' // 引入 Mock 数据
import './styles/index.scss'
import 'element-plus/theme-chalk/dark/css-vars.css' // 引入 Element Plus 暗黑模式样式
setupMock()

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')
