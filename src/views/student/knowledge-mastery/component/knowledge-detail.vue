<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { knowledgeApi } from '@/api/index.js'
import { useAuthStore } from '@/stores/index.js'
import EChart from '@/components/EChart.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  currentNode: {
    type: Object,
    default: null
  },
  courseId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:visible'])

const authStore = useAuthStore()

const drawerVisible = computed({
  get: () => props.visible,
  set: (val) => {
    if (!val) {
      emit('update:visible', false)
    }
  }
})

const trendChartData=computed(() => { 
   const trendData = detailData.value.learningTrend || []
   return {
    tooltip: { 
      trigger: 'axis',
      formatter: '{b}<br/>掌握度: {c}%'
    },
    xAxis: {
      type: 'category',
      data: trendData.map(item => item.week || item.date),
      axisLabel: {
        rotate: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '掌握度 (%)',
      max: 100,
      min: 0,
      axisLabel: {
        formatter: '{value}%'
      }
    },
   grid: {
      left: '12%',      // 增加左侧空间给 Y 轴标签
      right: '8%',
      top: '15%',
      bottom: '10%',
      containLabel: false  // 改为 false，手动控制边距
    },
    series: [{
      data: trendData.map(item => item.score),
      type: 'line',
      smooth: true,
      lineStyle: { color: '#409EFF', width: 3 },
      areaStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ])
      },
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#409EFF' },
      markPoint: {
        data: [
          { type: 'max', name: '最高点' },
          { type: 'min', name: '最低点' }
        ]
      }
    }]
  }
})

// 详情数据
const detailData = ref({
  id: '',
  name: '',
  masteryRate: 0,
  masteryLevel: '',
  weakPoints: [],
  suggestions: [],
  resources: [],
  learningTrend: []
})

const loading = ref(false)

const masteryClass = computed(() => {
  const rate = detailData.value.masteryRate || 0
  if (rate >= 80) return 'good'
  if (rate >= 60) return 'warning'
  return 'poor'
})

const masteryTagType = computed(() => {
  const rate = detailData.value.masteryRate || 0
  if (rate >= 80) return 'success'
  if (rate >= 60) return 'warning'
  return 'danger'
})

const masteryText = computed(() => {
  const rate = detailData.value.masteryRate || 0
  if (rate >= 80) return '良好'
  if (rate >= 60) return '待提升'
  return '需加强'
})

const progressColor = computed(() => {
  const rate = detailData.value.masteryRate || 0
  if (rate >= 80) return '#67C23A'
  if (rate >= 60) return '#E6A23C'
  return '#F56C6C'
})

// 获取知识点详情
const fetchKnowledgeDetail = async () => {
  if (!props.currentNode?.id) return
  
  loading.value = true
  try {
    const res = await knowledgeApi.getKnowledgeDetail(
      authStore.userId,
      props.currentNode.id,
      props.courseId
    )
    if (res && res.data) {
      detailData.value = res.data
    }
  } catch (error) {
    console.error('获取知识点详情失败:', error)
    ElMessage.error('加载知识点详情失败')
  } finally {
    loading.value = false
  }
}

// 开始学习资源
const goToResource = (resource) => {
  ElMessage.success(`开始学习：${resource.title}`)
  // 可以跳转到资源详情页或打开新窗口
  // window.open(resource.url, '_blank')
}

// 监听弹窗打开
watch(() => props.visible, (newVal) => {
  if (newVal && props.currentNode) {
    fetchKnowledgeDetail()
  } 
})

// 监听当前节点变化
watch(() => props.currentNode, (newVal, oldVal) => {
  if (props.visible && newVal && newVal.id !== oldVal?.id) {
    fetchKnowledgeDetail()
  }
})
</script>

<template>
  <el-drawer
    v-model="drawerVisible"
    :title="`知识点详情：${detailData.name || (currentNode && currentNode.label) || ''}`"
    direction="rtl"
    size="500px"
    destroy-on-close
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    v-loading="loading"
  >
    <div class="knowledge-detail" v-if="detailData.id">
      <!-- 掌握度卡片 -->
      <div class="mastery-card" :class="masteryClass">
        <div class="mastery-rate">
          <el-progress
            type="circle"
            :percentage="detailData.masteryRate"
            :color="progressColor"
            :width="120"
            :stroke-width="12"
          />
        </div>
        <div class="mastery-info">
          <h3>掌握程度</h3>
          <p class="rate">{{ detailData.masteryRate }}%</p>
          <el-tag :type="masteryTagType">{{ masteryText }}</el-tag>
        </div>
      </div>

      <!-- 薄弱点分析 -->
      <div class="weak-points" v-if="detailData.weakPoints && detailData.weakPoints.length">
        <h4>
          <i class="fas fa-exclamation-triangle"></i>
          薄弱点分析
        </h4>
        <ul>
          <li v-for="point in detailData.weakPoints" :key="point">
            <i class="fas fa-lightbulb"></i>
            {{ point }}
          </li>
        </ul>
      </div>

      <!-- 学习建议 -->
      <div class="suggestions" v-if="detailData.suggestions && detailData.suggestions.length">
        <h4>
          <i class="fas fa-graduation-cap"></i>
          学习建议
        </h4>
        <div class="suggestion-content">
          <p v-for="(suggestion, index) in detailData.suggestions" :key="index">
            {{ suggestion }}
          </p>
        </div>
      </div>

      <!-- 相关资源 -->
      <div class="related-resources" v-if="detailData.resources && detailData.resources.length">
        <h4>
          <i class="fas fa-book"></i>
          推荐学习资源
        </h4>
        <div class="resource-list">
          <div 
            v-for="resource in detailData.resources" 
            :key="resource.id"
            class="resource-item"
            @click="goToResource(resource)"
          >
            <div class="resource-icon">
              <i :class="['fas', resource.icon || 'fa-book']"></i>
            </div>
            <div class="resource-info">
              <div class="resource-title">{{ resource.title }}</div>
              <div class="resource-meta">
                <el-tag size="small" :type="resource.difficulty === '困难' ? 'danger' : resource.difficulty === '中等' ? 'warning' : 'success'">
                  {{ resource.type }}
                </el-tag>
                <span class="duration" v-if="resource.duration">{{ resource.duration }}</span>
                <el-tag v-if="resource.difficulty" size="small" type="info">{{ resource.difficulty }}</el-tag>
              </div>
            </div>
            <el-button type="primary" link>开始学习</el-button>
          </div>
        </div>
      </div>

      <!-- 学习轨迹 -->
      <div class="learning-trend" v-if="detailData.learningTrend && detailData.learningTrend.length">
        <h4>
          <i class="fas fa-chart-line"></i>
          学习轨迹
        </h4>
        <e-chart :options="trendChartData" height="300px" />
      </div>
    </div>
    
    <!-- 无数据状态 -->
    <div v-else class="empty-state">
      <i class="fas fa-database"></i>
      <p>暂无知识点数据</p>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.knowledge-detail {
  padding: 0 20px;
  
  h4 {
    font-size: 16px;
    margin: 20px 0 15px;
    color: #1f2937;
    
    i {
      margin-right: 8px;
      color: #409EFF;
    }
  }
  
  .mastery-card {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 30px 20px;
    border-radius: 16px;
    background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
    
    &.good {
      background: linear-gradient(135deg, #e8f5e9 0%, #fff 100%);
    }
    
    &.warning {
      background: linear-gradient(135deg, #fff3e0 0%, #fff 100%);
    }
    
    &.poor {
      background: linear-gradient(135deg, #ffebee 0%, #fff 100%);
    }
    
    .mastery-info {
      text-align: center;
      
      h3 {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 10px;
      }
      
      .rate {
        font-size: 32px;
        font-weight: 700;
        margin: 10px 0;
      }
    }
  }
  
  .weak-points {
    ul {
      list-style: none;
      padding: 0;
      
      li {
        padding: 12px;
        background: #fef3c7;
        border-radius: 8px;
        margin-bottom: 10px;
        
        i {
          margin-right: 10px;
          color: #f59e0b;
        }
      }
    }
  }
  
  .suggestion-content {
    p {
      padding: 10px 12px;
      background: #f0f9ff;
      border-radius: 8px;
      margin-bottom: 10px;
      border-left: 3px solid #409EFF;
    }
  }
  
  .related-resources {
    .resource-list {
      .resource-item {
        display: flex;
        align-items: center;
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transform: translateX(4px);
        }
        
        .resource-icon {
          width: 40px;
          height: 40px;
          background: #409EFF10;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          
          i {
            font-size: 20px;
            color: #409EFF;
          }
        }
        
        .resource-info {
          flex: 1;
          
          .resource-title {
            font-weight: 500;
            margin-bottom: 4px;
          }
          
          .resource-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            font-size: 12px;
            color: #6b7280;
          }
        }
      }
    }
  }
  
  .learning-trend {
    margin-bottom: 20px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  
  i {
    font-size: 64px;
    color: #d1d5db;
    margin-bottom: 16px;
  }
  
  p {
    color: #9ca3af;
    font-size: 14px;
  }
}

// 响应式
@media (max-width: 768px) {
  .knowledge-detail {
    padding: 0 12px;
    
    .mastery-card {
      flex-direction: column;
      gap: 20px;
    }
    
    .resource-item {
      flex-wrap: wrap;
    }
  }
}
</style>