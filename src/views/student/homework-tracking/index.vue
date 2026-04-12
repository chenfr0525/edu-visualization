<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { exportToImage, exportToPDF } from '@/utils/export'
import StatBox from '../dashboard/component/stat-box.vue'
import { homeworkApi } from '@/api/index.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authApi } from '@/api/index.js'
import EChart from '@/components/EChart.vue'

const containerRef = ref(null)
const userInfo = ref(null)
const loading = ref(false)
const detailDrawerVisible = ref(false)
const currentHomework = ref(null)
const overallSuggestion = ref({
  summary: '',
  suggestions: ""
})
const gradeTrendData = ref([])
// 搜索表单
const searchModel = ref({
  courseId: '',
  status: '',
  keyword: '',
})
// 选项数据
const courseOptions = ref([])
const statusOptions = ref([{ id: 'ONGOING', label: '进行中' }, { id: 'COMPLETED', label: '已完成' }, { id: 'DROPPED', label: '已放弃' }])
// 统计数据
const statsData = ref({
  completedCount: 0,
  totalCount: 0,
  avgScore: 0,
  onTimeRate: 0
})

// 作业列表
const homeworkList = ref([])
const pageInfo = ref({
  page: 1,
  pageSize: 10,
  total: 0,
})
// 统计卡片配置
const statBoxes = computed(() => [
  {
    statNum: statsData.value.totalCount,
    title: '作业总数',
  },
  {
    statNum: statsData.value.completedCount,
    title: '已完成',
  },
  {
    statNum: statsData.value.avgScore,
    title: '平均分',
  },
  {
    rate: statsData.value.onTimeRate,
    title: '按时率',
  },
])

// 获取状态样式
const getStatusType = (status) => {
  const typeMap = {
    'ONGOING': 'warning',
    'COMPLETED': 'success',
    'DROPPED': 'info',
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'ONGOING': '进行中',
    'COMPLETED': '已完成',
    'DROPPED': '已放弃'
  }
  return textMap[status] || status
}

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
    const res = await homeworkApi.getOverallSuggestion(userInfo.value.id)
    if (res && res.data) {
      overallSuggestion.value = res.data
    }
  } catch (error) {
    console.error('加载整体建议失败:', error)
  }
}

const loadGradeTrend = async () => {
  try {
    const res = await homeworkApi.getHomeworkTrend(userInfo.value.id, searchModel.value.courseId)
    if (res && res.data) {
      gradeTrendData.value = res.data
    }
  } catch (error) {
    console.error('加载成绩趋势数据失败:', error)
  }
}

// 加载课程选项
const loadCourseOptions = async () => {
  try {
    const res = await homeworkApi.getCourseOptionsByStudentId(userInfo.value?.id || "1")
    if (res && res.data) {
      courseOptions.value = res.data?.map((item) => item.course) || []
    }
  } catch (error) {
    console.error('加载课程选项失败:', error)
  }
}
// 加载统计数据
const loadStats = async () => {
  try {
    const res = await homeworkApi.getStats(userInfo.value.id)
    if (res && res.data) {
      statsData.value = res.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}
// 加载作业列表
const loadHomeworkList = async () => {
  loading.value = true
  try {
    const res = await homeworkApi.getHomeworkList(userInfo.value.id, {
      courseId: searchModel.value.courseId,
      status: searchModel.value.status,
    })
    if (res && res.data) {
      homeworkList.value = res.data || []
    }
  } catch (error) {
    console.error('加载作业列表失败:', error)
    ElMessage.error('加载作业列表失败')
  } finally {
    loading.value = false
  }
}

const LoadWorkDetail = async (homeworkId) => {
  loading.value = true
  try {

    const res = await homeworkApi.getHomeworkDetail(userInfo.value.id, homeworkId)
    if (res && res.data) {
      currentHomework.value = res.data
      console.log('作业详情数据:', currentHomework.value)
    }
  } catch (error) {
    console.error('加载作业详情失败:', error)
    ElMessage.error('加载作业详情失败')
  } finally {
    loading.value = false
  }
}

// 学习成绩趋势折线图数据
const lineOption = computed(() => {

  const classAvg = gradeTrendData.value.classAvg;
  const name = gradeTrendData.value.homeworkNames;
  const myScores = gradeTrendData.value.myScores
  return {
    title: {
      text: '作业成绩趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['我的成绩', '班级平均分'],
      left: 'left'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: name,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      max: 100,
      name: '分数'
    },
    series: [
      {
        name: '我的成绩',
        data: myScores,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#409EFF',
          width: 3
        },
        areaStyle: {
          color: 'rgba(64, 158, 255, 0.1)'
        },
        markPoint: {
          data: [
            { type: 'max', name: '最高分' },
            { type: 'min', name: '最低分' }
          ]
        },
        markLine: {
          data: [{ type: 'average', name: '平均值' }]
        }
      },
      {
        name: '班级平均分',
        data: classAvg,
        type: 'line',
        smooth: true,
        symbol: 'diamond',
        symbolSize: 8,
        lineStyle: {
          color: '#67C23A',
          width: 2,
          type: 'dashed'
        }
      }
    ]
  }
})

const radarOption = computed(() => {
  const indicators = currentHomework.value?.knowledgePointAnalysis.map(item => ({ name: item?.knowledgePointName, max: item?.fullScore || 10 }));
  const currentData = currentHomework.value?.knowledgePointAnalysis.map(item => item?.myScore || 0);
  return {
    title: {
      text: '知识点掌握程度',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: ['当前掌握程度'],
      left: 'left'
    },
    radar: {
      indicator: indicators,
      shape: 'circle',
      center: ['50%', '50%'],
      radius: '65%',
      name: {
        textStyle: {
          fontSize: 12
        }
      }
    },
    series: [
      {
        name: '知识点掌握情况',
        type: 'radar',
        data: [
          {
            value: currentData,
            name: '当前掌握程度',
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.3)'
            },
            lineStyle: {
              color: '#409EFF',
              width: 2
            },
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
      }
    ]
  }
})
// 查看作业详情
const handleViewDetail = async (row) => {
  await LoadWorkDetail(row.id)
  detailDrawerVisible.value = true
}

// 搜索
const handleSearch = () => {
  pageInfo.value.page = 1
  loadHomeworkList()
  loadGradeTrend()
}

const handleExportImage = () => {
  exportToImage(containerRef.value, '作业跟踪')
}

const handleExportPDF = () => {
  exportToPDF(containerRef.value, '作业跟踪')
}
watch(() => pageInfo.value.page, () => {
  loadHomeworkList()
})

watch(() => pageInfo.value.pageSize, () => {
  pageInfo.value.page = 1
  loadHomeworkList()
})

// 初始化
onMounted(async () => {
  await loadUserInfo()
  await loadCourseOptions()
  await loadStats()
  await loadHomeworkList()
  await loadOverallSuggestion()
  await loadGradeTrend()
})
</script>

<template>
  <div class="homework-tracking" ref="containerRef" v-loading="loading">
    <div class="container-header">
      <el-form inline label-width="80" :model="searchModel" class="select-box">
        <!-- <el-form-item label="状态" prop="status">
          <el-select size="large" placeholder="选择状态" style="width: 180px" v-model="searchModel.status" clearable
            @change="handleSearch">
            <el-option v-for="item in statusOptions" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="课程" prop="courseId">
          <el-select size="large" placeholder="选择课程" style="width: 180px" v-model="searchModel.courseId" clearable
            @change="handleSearch">
            <el-option v-for="item in courseOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <!-- <div class="export-btns">
        <el-button size="large" type="success" @click="handleSearch" style="margin-right: 10px;">搜索
          <template #icon>
            <i class="fas fa-sync-alt"></i>
          </template>
</el-button>
</div> -->
    </div>
    <!-- 统计卡片 -->
    <div class="section-content">
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in statBoxes" :key="item.title">
          <StatBox :title="item.title" :stat-num="item.statNum" :rate="item.rate" />
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <EChart :options="lineOption" height="400px" />
        </el-card>
      </el-col>
    </el-row>


    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover" header="🤖 AI 学习建议">
          <div class="ai-suggestions">
            <div class="ai-content" v-if="overallSuggestion?.summary">
              <h4>总结:<p>{{ overallSuggestion.summary }}</p>
              </h4>
              <h4>建议:<p style="white-space: pre-wrap;">{{ overallSuggestion.suggestions }}</p>
              </h4>
            </div>
            <div class="ai-content" v-else>
              {{ '暂无AI建议，请先完成更多学习活动' }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="always" class="section-content">
      <template #header>
        <span>作业列表</span>
      </template>
      <!-- 表格区域 -->
      <el-table v-loading="loading" :data="homeworkList" max-height="500px" class="content-box" stripe>
        <el-table-column label="作业名称">
          <template #default="{ row }">
            <div class="homework-name">
              <span class="name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="课程">
          <template #default="{ row }">
            <span>{{ row.courseName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="题目数量">
          <template #default="{ row }">
            <span>{{ row.questionCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总分">
          <template #default="{ row }">
            <span>{{ row.totalScore }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="myScore" label="得分">
          <template #default="{ row }">
            <span v-if="row.myScore" class="score-text">{{ row.myScore }}分</span>
            <span v-else class="no-score">未评分</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button @click="handleViewDetail(row)">
                查看作业详情
              </el-button>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无作业数据"></el-empty>
        </template>
      </el-table>
      <template #footer>
        <!-- 分页区域 -->
        <el-pagination :current-page="pageInfo.page" :page-size="pageInfo.pageSize" :total="pageInfo.total"
          :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
          @current-change="() => $emit('update:pageInfo', { page: $event, pageSize: pageInfo.pageSize })"
          @size-change="() => $emit('update:pageInfo', { page: pageInfo.page, pageSize: $event })"></el-pagination>
      </template>
    </el-card>
    <!-- 作业详情弹窗 -->
    <el-drawer v-model="detailDrawerVisible" title="作业详情" direction="rtl" size="800px">
      <div class="work-detail" v-if="currentHomework">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="课程名称">
            {{ currentHomework.courseName }}
          </el-descriptions-item>
          <el-descriptions-item label="作业名称">
            {{ currentHomework.name }}
          </el-descriptions-item>
          <el-descriptions-item label="描述">
            {{ currentHomework.description || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="得分情况"
            v-if="currentHomework.scoreAnalysis.score && currentHomework.scoreAnalysis.score !== -1">
            <div class="score-detail">
              <div class="detail-text">
                <h4>我的得分：{{ currentHomework.scoreAnalysis.score }}</h4>
                <h4>班级平均分：{{ currentHomework.scoreAnalysis.classAvg }}</h4>
                <h4>相差：{{ currentHomework.scoreAnalysis.diffFromAvg }}</h4>
                <h4>总分：{{ currentHomework.totalScore }}</h4>
              </div>
              <div class="echart-desc">
                <div style="font-size: 3rem; font-weight: 700; color: #1d4e7c">
                  {{ currentHomework.scoreAnalysis.rank }}
                </div>
                <div style="font-size: 1.1rem; margin-top: 10px">
                  超过全班 <strong>{{ Math.round((1 - currentHomework.scoreAnalysis.rank / 45) * 100) }}%</strong> 的同学
                </div>
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card shadow="hover" header="🤖 AI 学习建议">
              <div class="ai-suggestions">
                <div class="ai-content" v-if="currentHomework.aiSuggestion">
                  <h4>总结:<p>{{ currentHomework.aiSuggestion.summary }}</p>
                  </h4>
                  <h4>优势<p v-for="(strength, index) in currentHomework.aiSuggestion.strengths" :key="index">
                      {{ index + 1 }}.{{ strength }}
                    </p>
                  </h4>
                  <h4>弱点<p v-for="(weakness, index) in currentHomework.aiSuggestion.weaknesses" :key="index">
                      {{ index + 1 }}.{{ weakness }}
                    </p>
                  </h4>
                  <h4>建议<p v-for="(actionItem, index) in currentHomework.aiSuggestion.actionItems" :key="index">
                      {{ currentHomework.aiSuggestion.actionItems?.length > 1 ? index + 1 + "." : "" }}{{ actionItem }}
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
        <el-row style="margin-top: 20px;" v-if="currentHomework.knowledgePointAnalysis.length > 0">
          <el-col :span="24">
            <el-card shadow="always">
              <EChart :options="radarOption" height="400px" />
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.homework-tracking {
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

    .export-btns {
      display: flex;
      gap: 10px;
    }
  }

  .section-content {
    margin-top: 20px;
  }

  .homework-name {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    .name {
      font-weight: 500;
    }
  }

  .overdue-text {
    color: #f56c6c;
  }

  .score-text {
    color: #67c23a;
    font-weight: 500;
  }

  .no-score,
  .no-submit {
    color: #909399;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .score-detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;

    .echart-desc {
      text-align: center;
    }

    .ai-suggestions {
      .ai-content {
        white-space: pre-wrap;
        padding: 16px;
        background-color: #f5f7fa;
        border-radius: 8px;
        line-height: 1.6;
        color: #606266;

        h4 {
          display: flex;
          align-items: center;
          font-size: 1.3rem;

          p {
            margin-left: 22px;
            font-size: 1rem;
            font-weight: 400;
          }
        }
      }
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .homework-tracking {
    .container-header {
      flex-direction: column;
      align-items: stretch;
    }
  }
}

@media (max-width: 768px) {
  .homework-tracking {
    padding: 10px;

    .action-buttons {
      flex-direction: column;
    }
  }

}
</style>
