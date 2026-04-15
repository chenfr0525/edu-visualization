<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { exportToImage, exportToPDF } from '@/utils/export'
import EChart from '@/components/EChart.vue'
import { Picture } from '@element-plus/icons-vue'
import { authApi, homeworkApi, knowledgeApi } from '@/api/index'
import { ElMessage } from 'element-plus'
import KnowledgeDetail from './component/knowledge-detail.vue'
import StatBox from '../dashboard/component/stat-box.vue'

const containerRef = ref(null)
const loading = ref(false)
const userInfo = ref(null)
const overallSuggestion = ref({
  summary: '',
  suggestions: ""
})
// 统计卡片配置
// 统计数据
const statsData = ref({
  overallMasteryRate: 0,
  strongKnowledgePoints: 0,
  totalKnowledgePoints: 0,
  weakKnowledgePoints: 0
})
const statBoxes = computed(() => [
  {
    rate: statsData.value.overallMasteryRate,
    title: '整体掌握率',
  },
  {
    statNum: statsData.value.strongKnowledgePoints,
    title: '强知识点',
  },
  {
    statNum: statsData.value.weakKnowledgePoints,
    title: '弱知识点',
  },
  {
    statNum: statsData.value.totalKnowledgePoints,
    title: '知识点总数',
  }
])
// 数据状态
const courseOptions = ref([])
const treeData = ref([])
const donutData = ref([])
const radarData = ref({
  indicators: [],
  values: []
})

const searchModel = ref({
  courseId: '',
})

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

const loadOverallSuggestion = async () => {
  try {
    const res = await knowledgeApi.getOverallSuggestion(userInfo.value.id)
    if (res && res.data) {
      overallSuggestion.value = res.data
    }
  } catch (error) {
    console.error('加载整体建议失败:', error)
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await knowledgeApi.getStats(userInfo.value.id)
    if (res && res.data) {
      statsData.value = res.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}
// 加载课程选项
const loadCourseOptions = async () => {
  try {
    const res = await homeworkApi.getCourseOptionsByStudentId(userInfo.value?.id || "1")
    if (res && res.data) {
      courseOptions.value = res.data?.map((item) => item.course) || []
      // 默认选中第一个课程
      if (courseOptions.value.length > 0) {
        searchModel.value.courseId = courseOptions.value[0]?.id
        await loadAllData()
      }
    }
  } catch (error) {
    console.error('加载课程选项失败:', error)
  }
}

// 加载知识点树形数据
const loadKnowledgeTree = async () => {
  if (!searchModel.value.courseId) return
  try {
    const res = await knowledgeApi.getKnowledgeTree(userInfo.value?.id || "1", searchModel.value.courseId)
    if (res && res.data) {
      treeData.value = res.data || []
      console.log('tree', treeData.value)
    }
  } catch (error) {
    console.error('加载知识点树失败:', error)
  }
}

// 加载环图数据
const loadDonutData = async () => {
  if (!searchModel.value.courseId) return

  try {
    const res = await knowledgeApi.getDonutData(userInfo.value?.id || "1", searchModel.value.courseId)
    if (res && res.data) {
      donutData.value = res.data?.courseMasteryList.length > 0 ? [] : [
        {
          courseId: 1,
          courseName: "Java程序设计",
          masteryRate: 73.60,
          masteryLevel: "warning",
          knowledgePointCount: 5
        },
        {
          courseId: 2,
          courseName: "数据库原理",
          masteryRate: 67.50,
          masteryLevel: "warning",
          knowledgePointCount: 4
        },
        {
          courseId: 3,
          courseName: "高等数学",
          masteryRate: 73.75,
          masteryLevel: "warning",
          knowledgePointCount: 4
        }
      ]

      donutData.value = donutData.value.map(item => ({ value: item?.masteryRate, name: item?.courseName, itemStyle: { color: getItemStyleColors(item?.masteryLevel) } }))
    }
  } catch (error) {
    console.error('加载环图数据失败:', error)
  }
}

const getItemStyleColors = (level) => {
  const colors = {
    good: '#10b981',
    warning: '#f59e0b',
    poor: '#ef4444'
  }
  return colors[level] || red
}

// 加载雷达图数据
const loadRadarData = async () => {
  if (!searchModel.value.courseId) return

  try {
    const res = await knowledgeApi.getRadarData(userInfo.value?.id || "1", searchModel.value.courseId)
    if (res && res.data) {
      radarData.value = res.data
    }
  } catch (error) {
    console.error('加载雷达图数据失败:', error)
  }
}

const loadKnowledgeData = async (kpId) => {
  try {
    const res = await knowledgeApi.getKnowledgeDetail(userInfo.value?.id || "1", kpId)
    if (res && res.data) {
      selectedNode.value = res.data
      console.log('selectedNode', selectedNode.value)
    }
  } catch (error) {
    console.error('加载雷达图数据失败:', error)
  }
}


// 加载所有数据
const loadAllData = async () => {
  if (!searchModel.value.courseId) return
  loading.value = true
  try {
    await Promise.all([
      loadKnowledgeTree(),
      loadDonutData(),
      loadRadarData(),
      loadOverallSuggestion(),
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

// 监听课程变化
watch(() => searchModel.value.courseId, async (newCourseId, oldCourseId) => {
  if (newCourseId && newCourseId !== oldCourseId) {
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
const handleNodeClick = async (data, node) => {
  // 只有叶子节点（二级节点）才显示详情
  if (node.level === 2) {
    await loadKnowledgeData(data.id)
    detailDrawerVisible.value = true
  }
}

// 环图配置
const donutOption = computed(() => ({
  title: {
    text: '课程掌握进度环',
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
    text: `${radarData.value.courseName}-知识点雷达图`,
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c}分'
  },
  legend: {
    show: true,
    left: 'left',
    top: 30,
  },
  radar: {
    indicator: radarData.value.indicators.map(name => ({ name, max: 100 })),
    center: ["50%", "55%"],
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
        name: "我的掌握度"
      }],
      areaStyle: {
        color: "rgba(64, 158, 255, 0.25)"
      },
      lineStyle: {
        color: "#409eff",
        width: 2,
        type: 'solid'
      },
      itemStyle: {
        color: "#409eff",
        borderColor: "#fff",
        borderWidth: 2
      },
      symbol: 'circle',
      symbolSize: 8,
      emphasis: {
        scale: true,
        lineStyle: { width: 3 }
      }
    },
    {
      type: "radar",
      data: [{
        value: radarData.value.classAvgValues,
        name: "班级平均掌握度"
      }],
      areaStyle: {
        color: "rgba(245, 108, 108, 0.15)"
      },
      lineStyle: {
        color: "#f56c6c",
        width: 2,
        type: 'dashed'
      },
      itemStyle: {
        color: "#f56c6c",
        borderColor: "#fff",
        borderWidth: 2
      },
      symbol: 'diamond',
      symbolSize: 8,
      emphasis: {
        scale: true,
        lineStyle: { width: 3 }
      }
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

onMounted(async () => {
  await loadUserInfo()
  await loadStats()
  await loadCourseOptions()
  await loadOverallSuggestion()
})
</script>

<template>
  <div class="knowledge-container" ref="containerRef" v-loading="loading">
    <div class="container-header">
      <el-form inline label-width="80" :model="searchModel" class="select-box">
        <el-form-item label="课程" prop="courseId">
          <el-select size="large" placeholder="选择课程" style="width: 180px" v-model="searchModel.courseId"
            @change="handleSearch">
            <el-option v-for="item in courseOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="export-btns">
        <!-- <el-button size="large" type="success" @click="handleSearch" style="margin-right: 10px;">
          刷新
          <template #icon>
            <i class="fas fa-sync-alt"></i>
          </template>
</el-button> -->
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

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover" header="🤖 AI 学习建议">
          <div class="ai-suggestions">
            <div class="ai-content" v-if="overallSuggestion?.summary">
              <h4>总结:<p>{{ overallSuggestion.summary }}</p>
              </h4>
              <h4>建议:<p v-for="suggestion in overallSuggestion.suggestions">{{ suggestion }}
                </p>
              </h4>
            </div>
            <div class="ai-content" v-else>
              {{ '暂无AI建议，请先完成更多学习活动' }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 知识点树形结构 -->
    <div class="knowledge-list">
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="hover">
            <el-tree :data="treeData" node-key="id" :highlight-current="true" :default-expand-all="true"
              @node-click="handleNodeClick">
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

    <!-- 统计卡片 -->
    <div style="margin-top: 20px;">
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in statBoxes" :key="item.title">
          <StatBox :title="item.title" :stat-num="item.statNum" :rate="item.rate" />
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
    <!-- <div class="recommendation-source" style="margin-top: 20px;">
      <el-card shadow="hover" header="个性化学习资源推荐">
        <el-row :gutter="20">
          <el-col v-for="item in recommendations" :key="item.id" :xs="24" :sm="12" :md="6">
            <el-card shadow="hover" class="recom-card">
              <template #header>
                <div class="recom-header">
                  <el-tag size="small"
                    :type="item.difficulty === '困难' ? 'danger' : item.difficulty === '中等' ? 'warning' : 'success'">
                    {{ item.type }}
                  </el-tag>
                  <el-tag size="small" type="info">{{ item.difficulty }}</el-tag>
                </div>
                <h3 class="recom-title">{{ item.title }}</h3>
              </template>
              <div class="recom-body">
                <el-progress type="dashboard" :percentage="item.match"
                  :color="item.match >= 85 ? '#67C23A' : '#E6A23C'" />
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
    </div> -->

    <KnowledgeDetail v-model:visible="detailDrawerVisible" :current-node="selectedNode" />
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