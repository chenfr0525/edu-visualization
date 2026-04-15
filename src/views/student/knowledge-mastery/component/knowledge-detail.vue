<script setup>
import { ref, computed, } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  currentNode: {
    type: Object,
    default: {}
  },
  // courseId: {
  //   type: String,
  //   default: ''
  // }
})

const emit = defineEmits(['update:visible'])
const loading = ref(false)

const drawerVisible = computed({
  get: () => props.visible,
  set: (val) => {
    if (!val) {
      emit('update:visible', false)
    }
  }
})

const masteryClass = computed(() => {
  const rate = props.currentNode.masteryRate || 0
  if (rate >= 80) return 'good'
  if (rate >= 60) return 'warning'
  return 'poor'
})

const masteryTagType = computed(() => {
  const rate = props.currentNode.masteryRate || 0
  if (rate >= 80) return 'success'
  if (rate >= 60) return 'warning'
  return 'danger'
})

const masteryText = computed(() => {
  const getText = (level) => {
    const textMap = {
      poor: '待提升',
      warning: '待提升',
      good: '良好'
    }
    return textMap[level] || ''
  }
  return getText(props.currentNode.masteryLevel)
})

const progressColor = (rate) => {
  if (rate >= 80) return '#67C23A'
  if (rate >= 60) return '#E6A23C'
  return '#F56C6C'
}
</script>

<template>
  <el-drawer v-model="drawerVisible"
    :title="`知识点详情：${currentNode?.courseName || ''} - ${currentNode?.knowledgePointName || ''}`" direction="rtl"
    size="700px" destroy-on-close :close-on-click-modal="true" :close-on-press-escape="true" v-loading="loading">
    <div class="knowledge-detail" v-if="currentNode?.courseId">
      <!-- 掌握度卡片 -->
      <div class="mastery-card" :class="masteryClass">
        <div class="mastery-rate">
          <h3>我的掌握程度</h3>
          <el-progress type="circle" :percentage="currentNode?.masteryRate"
            :color="progressColor(currentNode.masteryRate)" :width="120" :stroke-width="12" />
        </div>
        <div class="mastery-rate">
          <h3>班级平均掌握程度</h3>
          <el-progress type="circle" :percentage="currentNode?.classAvgMasteryRate"
            :color="progressColor(currentNode.classAvgMasteryRate)" :width="120" :stroke-width="12" />
        </div>
        <div class="mastery-info">
          <h3>掌握程度</h3>
          <p class="rate">{{ currentNode?.masteryRate }}%</p>
          <el-tag :type="masteryTagType">{{ masteryText }}</el-tag>
        </div>
      </div>

      <el-descriptions v-if="currentNode?.sourceDetails?.length > 0" :column="1" border style="margin-top: 20px;">
        <el-descriptions-item v-for="item in currentNode?.sourceDetails" :label="item.sourceName">
          <div>
            <h4>我的得分：{{ item.myScore }}</h4>
            <h4>班级平均分：{{ item.classAvgScoreRate }}</h4>
            <h4>满分: {{ item.fullScore }}</h4>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 薄弱点分析 -->
      <div class="weak-points" v-if="currentNode?.weakPoints?.length > 0">
        <h4>
          <i class="fas fa-exclamation-triangle"></i>
          薄弱点分析
        </h4>
        <ul>
          <li v-for="point in currentNode.weakPoints" :key="point">
            <i class="fas fa-lightbulb"></i>
            {{ point }}
          </li>
        </ul>
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
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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