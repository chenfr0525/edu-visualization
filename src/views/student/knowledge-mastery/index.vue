<script setup>
import { ref, onMounted, computed } from 'vue'
import { getRecommendationData } from '@/mock'
import { exportToImage, exportToPDF } from '@/utils/export'
import EChart from '@/components/EChart.vue'
import ExerciseCard from './component/exercise-card.vue'
import { Picture } from '@element-plus/icons-vue'

const recommendations = ref([])
const containerRef = ref(null)
const searchModel = ref({
  course: '',
})

const options = [
  {
    value: 'Option1',
    label: 'Option1',
  },
  {
    value: 'Option2',
    label: 'Option2',
  },
  {
    value: 'Option3',
    label: 'Option3',
  },
  {
    value: 'Option4',
    label: 'Option4',
  },
  {
    value: 'Option5',
    label: 'Option5',
  },
]

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

const treeData = [
  {
    id: '1',
    label: '📐 高等数学',
    masteryRate: 72,
    children: [
      {
        id: '1-1',
        label: '函数与极限',
        masteryRate: 58,
        masteryLevel: 'warning'
      },
      {
        id: '1-2',
        label: '导数与微分',
        masteryRate: 85,
        masteryLevel: 'good'
      },
      {
        id: '1-3',
        label: '积分学',
        masteryRate: 45,
        masteryLevel: 'poor'
      }
    ]
  },
  {
    id: '2',
    label: '📐 线性代数',
    masteryRate: 88,
    children: [
      {
        id: '2-1',
        label: '函数与极限',
        masteryRate: 88,
        masteryLevel: 'warning'
      },
      {
        id: '2-2',
        label: '导数与微分',
        masteryRate: 89,
        masteryLevel: 'good'
      },
      {
        id: '2-3',
        label: '积分学',
        masteryRate: 86,
        masteryLevel: 'poor'
      }
    ]
  }
]

const handleNodeClick = (data) => {
  console.log('点击节点:', data)
}

const donutOption = computed(() => ({
  title: {
    text: '知识点掌握进度环'
  },
  tooltip: { trigger: "item" },
  legend: { show: true },
  series: [
    {
      name: "掌握度",
      type: "pie",
      radius: ["55%", "75%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: "#fff",
        borderWidth: 2,
      },
      label: { show: false },
      emphasis: { scale: false },
      data: [
        { value: 85, name: "函数", itemStyle: { color: "#2d6a9f" } },
        { value: 62, name: "几何", itemStyle: { color: "#f09b48" } },
        { value: 78, name: "代数", itemStyle: { color: "#3a9b9b" } },
        { value: 45, name: "向量", itemStyle: { color: "#8561b3" } },
      ],
    },
  ],
}))

const radarOption = computed(() => ({
  title: {
    text: '细粒度知识点雷达图'
  },
  legend: { show: true },
  radar: {
    indicator: [
      { name: "三角函数", max: 100 },
      { name: "数列", max: 100 },
      { name: "平面向量", max: 100 },
      { name: "导数", max: 100 },
      { name: "立体几何", max: 100 },
      { name: "概率统计", max: 100 },
    ],
    center: ["50%", "50%"],
    radius: "68%",
    axisName: { color: "#406e96", fontSize: 9 },
  },
  series: [
    {
      type: "radar",
      data: [{ value: [78, 92, 45, 63, 58, 81], name: "掌握度" }],
      areaStyle: { color: "rgba(240, 155, 72, 0.2)" },
      lineStyle: { color: "#d97706", width: 2 },
      itemStyle: { color: "#b85e00" },
    },
  ],
}))

const exercises = [
  { title: '三角形恒等变化', icon: 'fa-book-open', desc: '12道典型题 · 中难度', url: '' },
  { title: '三角形恒等变化', icon: 'fa-book-open', desc: '12道典型题 · 中难度', url: '' },
  { title: '三角形恒等变化', icon: 'fa-book-open', desc: '12道典型题 · 中难度', url: '' }
]


const handleExportImage = () => {
  exportToImage(containerRef.value, '知识点掌握')
}

const handleExportPDF = () => {
  exportToPDF(containerRef.value, '知识点掌握')
}

onMounted(() => {
  recommendations.value = getRecommendationData()
})
</script>

<template>
  <div class="knowledge-container" ref="containerRef">
    <div class="container-header">
      <el-form inline label-width="80" :model="searchModel" class="select-box">
        <el-form-item label="课程" prop="course">
          <el-select size="large" placeholder="请选择课程" style="width: 240px">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="export-btns">
        <el-button size="large" type="success" @click="handleSearch" style="margin-right: 10px;">搜索
          <template #icon>
            <i class="fas fa-sync-alt"></i>
          </template>
        </el-button>
        <el-button-group>
          <el-button size="large" type="primary" :icon="Picture" @click="handleExportImage">导出图片</el-button>
          <el-button size="large" @click="handleExportPDF">导出PDF
            <template #icon>
              <i class="fas fa-file-pdf"></i>
            </template>
          </el-button>
        </el-button-group>
      </div>
    </div>
    <div class="knowledge-list">
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="hover">
            <el-tree :data="treeData" node-key="id" :highlight-current="true" @node-click="handleNodeClick">
              <template #default="{ node, data }">
                <div class="custom-tree-node">
                  <!-- 展开/折叠图标 -->
                  <i :class="[
                    'node-icon',
                    node.expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right',
                    node.level === 1 ? 'fa-chevron-down' : 'fa-circle'
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
                  <span v-if="data.masteryRate" class="percentage">
                    {{ data.masteryRate }}%
                  </span>

                  <!-- 进度条 -->
                  <div v-if="data.masteryRate" class="progress-bar">
                    <div class="progress-fill" :style="{
                      width: `${data.masteryRate}%`,
                      background: getProgressColor(data.masteryRate)
                    }">
                    </div>
                  </div>
                </div>
              </template>
            </el-tree> </el-card>
        </el-col>
      </el-row>

    </div>
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
    <div class="recommendation-source" style="margin-top: 20px;">
      <el-card shadow="hover" header="个性化学习资源推荐">
        <el-row :gutter="20">
          <el-col v-for="item in recommendations" :key="item.id" :span="6">
            <el-card shadow="hover" class="recom-card">
              <template #header>
                <el-tag size="small">{{ item.type }}</el-tag>
                <h3 class="recom-title">{{ item.title }}</h3>
              </template>
              <div class="recom-body">
                <el-progress type="dashboard" :percentage="item.match" color="#67C23A" />
                <p>匹配度: {{ item.match }}%</p>
              </div>
              <div class="recom-footer">
                <el-button type="primary" link>查看详情</el-button>
                <el-button type="success" link>开始学习</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <div class="recommend-exercise" style="margin-top: 20px;">
      <el-card shadow="hover" header=" 推荐强化练习">
        <el-row :gutter="20">
          <el-col v-for="item in exercises" :key="item.id" :span="12" style="margin-bottom: 20px;">
            <ExerciseCard :title="item.title" :icon="item.icon" :desc="item.desc" :url="item.url" />
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>

</template>

<style scoped lang="scss">
.knowledge-container {
  width: 100%;

  .container-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;

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

      .node-icon {
        font-size: 12px;
        color: #6b7280;
        transition: transform 0.2s;

        &.fa-chevron-down {
          font-size: 12px;
        }

        &.fa-circle {
          font-size: 8px;
        }
      }

      .node-label {
        flex: 1;
        font-size: 14px;
        color: #1f2937;
      }

      .node-desc {
        font-size: 1rem;
        font-weight: 600;
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

    // 覆盖 Element Plus Tree 的默认样式
    :deep(.el-tree) {
      background: transparent;
      padding: 20px 28px;

      .el-tree-node {
        &__expand-icon {
          display: none; // 隐藏默认图标，使用自定义图标
        }
      }
    }
  }

  .recommendation-source {
    .recom-card {
      text-align: center;

      .recom-title {
        margin-top: 10px;
        font-size: 14px;
        height: 40px;
      }

      .recom-body {
        padding: 10px 0;
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
</style>
