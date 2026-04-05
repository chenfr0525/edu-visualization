<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { exportToImage, exportToPDF } from '@/utils/export'
import EChart from '@/components/EChart.vue'
import { Picture } from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api/index'
import { useAuthStore } from '@/stores/index.js'
import { ElMessage } from 'element-plus'
import KnowledgeDetail from './component/knowledge-detail.vue'

const containerRef = ref(null)
const authStore = useAuthStore()
const loading = ref(false)

// 数据状态
const courseOptions = ref([])
const treeData = ref([])
const donutData = ref([])
const radarData = ref({
  indicators: [],
  values: []
})
const recommendations = ref([])

const searchModel = ref({
  course: '',
})

// 加载课程列表
const loadCourses = async () => {
  try {
    const res = await knowledgeApi.getCourses(authStore.userId)
    if (res && res.data) {
      courseOptions.value = res.data
      // 默认选中第一个课程
      if (res.data.length > 0) {
        searchModel.value.course = res.data[0].value
        await loadAllData()
      }
    }
  } catch (error) {
    console.error('加载课程列表失败:', error)
    ElMessage.error('加载课程列表失败')
  }
}

// 加载知识点树形数据
const loadKnowledgeTree = async () => {
  if (!searchModel.value.course) return
  
  try {
    const res = await knowledgeApi.getKnowledgeTree(authStore.userId, searchModel.value.course)
    if (res && res.data) {
      treeData.value = res.data
    }
  } catch (error) {
    console.error('加载知识点树失败:', error)
  }
}

// 加载环图数据
const loadDonutData = async () => {
  if (!searchModel.value.course) return
  
  try {
    const res = await knowledgeApi.getDonutData(authStore.userId, searchModel.value.course)
    if (res && res.data) {
      donutData.value = res.data
    }
  } catch (error) {
    console.error('加载环图数据失败:', error)
  }
}

// 加载雷达图数据
const loadRadarData = async () => {
  if (!searchModel.value.course) return
  
  try {
    const res = await knowledgeApi.getRadarData(authStore.userId, searchModel.value.course)
    if (res && res.data) {
      radarData.value = res.data
    }
  } catch (error) {
    console.error('加载雷达图数据失败:', error)
  }
}

// 加载推荐资源
const loadRecommendations = async () => {
  if (!searchModel.value.course) return
  
  try {
    const res = await knowledgeApi.getRecommendations(authStore.userId, searchModel.value.course)
    if (res && res.data) {
      recommendations.value = res.data
    }
  } catch (error) {
    console.error('加载推荐资源失败:', error)
  }
}


// 加载所有数据
const loadAllData = async () => {
  if (!searchModel.value.course) return
  
  loading.value = true
  try {
    await Promise.all([
      loadKnowledgeTree(),
      loadDonutData(),
      loadRadarData(),
      loadRecommendations(),
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

// 监听课程变化
watch(() => searchModel.value.course, async (newCourse, oldCourse) => {
  if (newCourse && newCourse !== oldCourse) {
    await loadAllData()
  }
})

// 获取掌握度徽章样式
const getMasteryClass = (level) => {
  const classMap = {
    good: 'good',
    warning: 'warning',
    poor: 'poor'
  }
  return classMap[level] || ''
}

// 获取掌握度文本
const getMasteryText = (level) => {
  const textMap = {
    good: '良好',
    warning: '薄弱',
    poor: '待加强'
  }
  return textMap[level] || ''
}

// 根据掌握度获取进度条颜色
const getProgressColor = (rate) => {
  if (rate >= 80) return '#10b981'
  if (rate >= 60) return '#1d4e7c'
  if (rate >= 40) return '#f59e0b'
  return '#ef4444'
}


// 添加状态
const detailDrawerVisible = ref(false)
const selectedNode = ref(null)
// 修改节点点击处理
const handleNodeClick = (data, node) => {
  // 只有叶子节点（二级节点）才显示详情
  if (node.level === 2) {
    selectedNode.value = {
      id: data.id,
      label: data.label,
      masteryRate: data.masteryRate,
      masteryLevel: data.masteryLevel,
      weakPoints: data.weakPoints || []
    }
    detailDrawerVisible.value = true
  } 
}

// 环图配置
const donutOption = computed(() => ({
  title: {
    text: '知识点掌握进度环',
    left: 'center'
  },
  tooltip: { 
    trigger: "item",
    formatter: '{b}: {d}%'
  },
  legend: { 
    show: true,
    orient: 'vertical',
    left: 'left',
    top: 'center'
  },
  series: [
    {
      name: "掌握度",
      type: "pie",
      radius: ["45%", "70%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: "#fff",
        borderWidth: 2,
      },
      label: { 
        show: true,
        formatter: '{b}: {d}%',
        fontSize: 11
      },
      emphasis: { scale: false },
      data: donutData.value.length > 0 ? donutData.value : [
        { value: 0, name: '暂无数据', itemStyle: { color: '#ccc' } }
      ]
    }
  ]
}))

// 雷达图配置
const radarOption = computed(() => ({
  title: {
    text: '细粒度知识点雷达图',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c}分'
  },
  legend: { 
    show: true,
    left: 'left'
  },
  radar: {
    indicator: radarData.value.indicators.map(name => ({ name, max: 100 })),
    center: ["50%", "50%"],
    radius: "65%",
    axisName: { color: "#406e96", fontSize: 10 },
    splitArea: {
      areaStyle: {
        color: ['rgba(64, 158, 255, 0.1)', 'rgba(64, 158, 255, 0.05)']
      }
    }
  },
  series: [
    {
      type: "radar",
      data: [{ 
        value: radarData.value.values, 
        name: "掌握度" 
      }],
      areaStyle: { color: "rgba(240, 155, 72, 0.2)" },
      lineStyle: { color: "#d97706", width: 2 },
      itemStyle: { color: "#b85e00" },
      symbol: 'circle',
      symbolSize: 6
    }
  ]
}))

const handleExportImage = () => {
  exportToImage(containerRef.value, '知识点掌握')
}

const handleExportPDF = () => {
  exportToPDF(containerRef.value, '知识点掌握')
}

const handleSearch = () => {
  loadAllData()
}

onMounted(() => {
  loadCourses()
})
</script>

<template>
  <div class="knowledge-container" ref="containerRef" v-loading="loading">
    <div class="container-header">
      <el-form inline label-width="80" :model="searchModel" class="select-box">
        <el-form-item label="课程" prop="course">
          <el-select 
            size="large" 
            v-model="searchModel.course" 
            placeholder="请选择课程" 
            style="width: 240px"
            @change="handleSearch"
          >
            <el-option 
              v-for="item in courseOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="export-btns">
        <el-button size="large" type="success" @click="handleSearch" style="margin-right: 10px;">
          刷新
          <template #icon>
            <i class="fas fa-sync-alt"></i>
          </template>
        </el-button>
        <el-button-group>
          <el-button size="large" type="primary" :icon="Picture" @click="handleExportImage">导出图片</el-button>
          <el-button size="large" @click="handleExportPDF">
            导出PDF
            <template #icon>
              <i class="fas fa-file-pdf"></i>
            </template>
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 知识点树形结构 -->
    <div class="knowledge-list">
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="hover">
            <el-tree 
              :data="treeData" 
              node-key="id" 
              :highlight-current="true" 
              :default-expand-all="true"
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <div class="custom-tree-node">
                  <!-- 展开/折叠图标 -->
                  <i :class="[
                    'node-icon',
                    node.expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right'
                  ]" :style="node.level === 2 ? 'font-size: 8px' : ''"></i>

                  <!-- 节点标签 -->
                  <span class="node-label">{{ node.label }}</span>

                  <span v-if="node.level === 1" class="node-desc">
                    整体掌握度
                  </span>

                  <!-- 掌握度徽章（仅子节点显示） -->
                  <span v-if="node.level === 2 && data.masteryLevel"
                    :class="['mastery-badge', getMasteryClass(data.masteryLevel)]">
                    {{ getMasteryText(data.masteryLevel) }}
                  </span>

                  <!-- 掌握度百分比 -->
                  <span v-if="data.masteryRate !== undefined" class="percentage">
                    {{ data.masteryRate }}%
                  </span>

                  <!-- 进度条 -->
                  <div v-if="data.masteryRate !== undefined" class="progress-bar">
                    <div class="progress-fill" :style="{
                      width: `${data.masteryRate}%`,
                      background: getProgressColor(data.masteryRate)
                    }">
                    </div>
                  </div>
                </div>
              </template>
            </el-tree>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="echart-container" style="margin-top: 20px;">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="hover">
            <EChart :options="donutOption" height="400px" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <EChart :options="radarOption" height="400px" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 个性化学习资源推荐 -->
    <div class="recommendation-source" style="margin-top: 20px;">
      <el-card shadow="hover" header="个性化学习资源推荐">
        <el-row :gutter="20">
          <el-col v-for="item in recommendations" :key="item.id" :xs="24" :sm="12" :md="6">
            <el-card shadow="hover" class="recom-card">
              <template #header>
                <div class="recom-header">
                  <el-tag size="small" :type="item.difficulty === '困难' ? 'danger' : item.difficulty === '中等' ? 'warning' : 'success'">
                    {{ item.type }}
                  </el-tag>
                  <el-tag size="small" type="info">{{ item.difficulty }}</el-tag>
                </div>
                <h3 class="recom-title">{{ item.title }}</h3>
              </template>
              <div class="recom-body">
                <el-progress type="dashboard" :percentage="item.match" :color="item.match >= 85 ? '#67C23A' : '#E6A23C'" />
                <p class="match-text">匹配度: {{ item.match }}%</p>
              </div>
              <div class="recom-footer">
                <el-button type="primary" link>查看详情</el-button>
                <el-button type="success" link>开始学习</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row v-if="recommendations.length === 0" style="text-align: center; padding: 40px;">
          <el-col :span="24">
            <p>暂无推荐资源</p>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <KnowledgeDetail
    v-model:visible="detailDrawerVisible"
    :current-node="selectedNode"
    :course-id="searchModel.course"
  />
  </div>
</template>

<style scoped lang="scss">
.knowledge-container {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;

  .container-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;

    .select-box {
      display: flex;
      align-items: center;

      :deep(.el-form-item) {
        margin-bottom: 0;
      }
    }
  }

  .knowledge-list {
    .custom-tree-node {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      flex-wrap: wrap;

      .node-icon {
        font-size: 12px;
        color: #6b7280;
        transition: transform 0.2s;

        &.fa-circle {
          font-size: 8px;
        }
      }

      .node-label {
        flex: 1;
        font-size: 14px;
        color: #1f2937;
        min-width: 120px;
      }

      .node-desc {
        font-size: 0.9rem;
        font-weight: 600;
        color: #6b7280;
      }

      .mastery-badge {
        padding: 2px 10px;
        border-radius: 40px;
        font-size: 0.75rem;
        font-weight: 500;

        &.good {
          background: #dcfce7;
          color: #166534;
        }

        &.warning {
          background: #fff3cd;
          color: #856404;
        }

        &.poor {
          background: #fee2e2;
          color: #991b1b;
        }
      }

      .percentage {
        font-size: 13px;
        color: #6b7280;
        min-width: 45px;
        text-align: right;
      }

      .progress-bar {
        flex: 1;
        height: 8px;
        background: #e2e8f0;
        border-radius: 10px;
        overflow: hidden;
        min-width: 100px;

        .progress-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.3s ease;
        }
      }
    }

    :deep(.el-tree) {
      background: transparent;
      padding: 20px 28px;

      .el-tree-node__expand-icon {
        display: none;
      }
      
      .el-tree-node__content {
        height: auto;
        padding: 8px 0;
        
        &:hover {
          background-color: #f5f7fa;
        }
      }
    }
  }

  .recommendation-source {
    .recom-card {
      text-align: center;
      height: 100%;
      
      .recom-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }

      .recom-title {
        margin-top: 10px;
        font-size: 14px;
        height: 40px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .recom-body {
        padding: 10px 0;
        
        .match-text {
          margin-top: 10px;
          color: #67C23A;
          font-weight: 500;
        }
      }

      .recom-footer {
        border-top: 1px solid var(--el-border-color);
        padding-top: 10px;
        display: flex;
        justify-content: space-between;
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .knowledge-container {
    padding: 10px;
    
    .container-header {
      flex-direction: column;
      align-items: stretch;
    }
    
    .knowledge-list :deep(.el-tree) {
      padding: 10px;
    }
    
    .custom-tree-node {
      .node-label {
        min-width: 80px;
      }
      
      .progress-bar {
        min-width: 60px;
      }
    }
  }
}
</style>