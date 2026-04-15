<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { exportToImage, exportToPDF } from '@/utils/export'
import { Picture } from '@element-plus/icons-vue'
import TestBox from './component/test-box.vue'
import EChart from '@/components/EChart.vue'
import { authApi, gradeApi, homeworkApi } from '@/api/index'
import { useAuthStore } from '@/stores/index.js'
import { ElMessage } from 'element-plus'
import StatBox from '../dashboard/component/stat-box.vue'

const containerRef = ref(null)
const authStore = useAuthStore()
const loading = ref(false)
const userInfo = ref(null)
const statBoxes = ref({})
const detailDrawerVisible = ref(false)
const currentExam = ref(null)
const overallSuggestion = ref({
  summary: '',
  suggestions: ""
})
const statusCardData = computed(() => [
  {
    statNum: statBoxes.value.totalExams,
    title: '考试总数',
  },
  {
    statNum: statBoxes.value.aboveAvgCount,
    title: '超平均分考试数',
  },
  {
    statNum: statBoxes.value.avgRank,
    title: '平均排名',
  },
  {
    statNum: statBoxes.value.avgScore,
    title: '平均分',
  },
])

// 搜索表单
const searchModel = ref({
  status: '',
  courseId: '',
})
// 选项数据
const statusOptions = ref([{ value: 'UPCOMING', label: '未开始' }, { value: 'ONGOING', label: '进行中' }, { value: 'COMPLETED', label: '已完成' }])
const courseOptions = ref([])

// 考试列表
const examList = ref([])

// 成绩分布数据
const gradeDistribution = ref({
  distribution: [0, 0, 0, 0, 0],
  stats: {
    average: 0,
    highest: 0,
    lowest: 0,
    passRate: 0,
    excellentRate: 0
  }
})

// 我的成绩趋势
const myGradeTrend = ref([])

// 成绩分布图表配置
const gradeChartOption = computed(() => ({
  title: {
    text: '成绩分布快速预览',
    left: 'center',
    textStyle: {
      fontSize: 14,
      fontWeight: 'normal'
    }
  },
  tooltip: {
    trigger: 'axis',
    formatter: '{b}<br/>人数: {c}人',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '10%',
    right: '5%',
    top: '15%',
    bottom: '5%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['<60', '60-69', '70-79', '80-89', '90-100'],
    axisLabel: {
      fontSize: 12
    }
  },
  yAxis: {
    type: 'value',
    name: '人数',
    axisLabel: {
      fontSize: 11
    }
  },
  series: [
    {
      type: 'bar',
      data: gradeDistribution.value.distribution,
      itemStyle: {
        color: '#1d4e7c',
        borderRadius: [6, 6, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}人'
      }
    }
  ]
}))

// 成绩趋势图表配置
const gradeTrendOption = computed(() => {
  return {
    title: {
      text: `${myGradeTrend.value?.courseName || '课程'} - 成绩趋势`,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['我的成绩', '班级平均分', '我的排名'],
      left: 'left'
    },
    grid: {
      left: '10%',
      right: '5%',
      top: '15%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: myGradeTrend.value?.examNames || [],
      axisLabel: {
        rotate: 15,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      name: '分数',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}分'
      }
    },
    series: [
      {
        name: '我的成绩',
        type: 'line',
        data: myGradeTrend.value?.myScores || [],
        smooth: true,
        lineStyle: { color: '#409EFF', width: 3 },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#409EFF' },
        areaStyle: {
          color: 'rgba(64, 158, 255, 0.1)'
        }
      },
      {
        name: '班级平均分',
        type: 'line',
        data: myGradeTrend.value?.classAvgs || [],
        smooth: true,
        lineStyle: { color: '#E6A23C', width: 2, type: 'dashed' },
        symbol: 'diamond',
        symbolSize: 8,
        itemStyle: { color: '#E6A23C' }
      },
      {
        name: '我的排名',
        type: 'line',
        data: myGradeTrend.value?.myRanks || [],
        smooth: true,
        lineStyle: { color: '#2D7E5E', width: 2, type: 'dashed' },
        symbol: 'diamond',
        symbolSize: 8,
        itemStyle: { color: '#2D7E5E' }
      }
    ]
  }
})

const loadOverallSuggestion = async () => {
  try {
    const res = await gradeApi.getOverallSuggestionExam(userInfo.value.id)
    if (res && res.data) {
      overallSuggestion.value = res.data
    }
  } catch (error) {
    console.error('加载整体建议失败:', error)
  }
}


// 加载状态选项
const loadStatusCardData = async () => {
  try {
    const res = await gradeApi.getStatusCardData(userInfo.value?.id || "1")
    if (res && res.data) {
      statBoxes.value = res.data
    }
  } catch (error) {
    console.error('加载状态选项失败:', error)
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
// 加载考试列表
const loadExamList = async () => {
  loading.value = true
  try {
    const res = await gradeApi.getExamList(userInfo.value?.id, {
      status: searchModel.value.status,
      courseId: searchModel.value.courseId,
    })
    if (res && res.data) {
      examList.value = res.data.list
    }
  } catch (error) {
    console.error('加载考试列表失败:', error)
    ElMessage.error('加载考试列表失败')
  } finally {
    loading.value = false
  }
}

// 加载成绩分布
const loadGradeDistribution = async () => {
  try {
    const res = await gradeApi.getGradeDistribution(
      authStore.userId,
      searchModel.value.courseId === '' ? null : searchModel.value.courseId
    )
    if (res && res.data) {
      gradeDistribution.value = res.data
    }
  } catch (error) {
    console.error('加载成绩分布失败:', error)
  }
}

// 加载我的成绩趋势
const loadMyGradeTrend = async () => {
  try {
    const res = await gradeApi.getMyGradeTrend(userInfo.value?.id || "1", searchModel.value.courseId)
    if (res && res.data) {
      myGradeTrend.value = res.data
    }
  } catch (error) {
    console.error('加载成绩趋势失败:', error)
  }
}

const radarOption = computed(() => {
  const indicators = currentExam.value?.knowledgePointAnalysis.map(item => ({ name: item?.knowledgePointName, max: item?.fullScore || 10 }));
  const currentData = currentExam.value?.knowledgePointAnalysis.map(item => item?.myScore || 0);
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

// 加载详细
const loadExamDetail = async (examId) => {
  try {
    const res = await gradeApi.getExamDetail(userInfo.value?.id || "1", examId)
    if (res && res.data) {
      currentExam.value = res.data
    }
  } catch (error) {
    console.error('加载成绩详情失败:', error)
  }
}
const handleExamClick = async (exam) => {
  await loadExamDetail(exam.id)
  detailDrawerVisible.value = true
}
// 刷新所有数据
const refreshData = async () => {
  await Promise.all([
    loadExamList(),
    loadMyGradeTrend()
  ])
  ElMessage.success('数据已刷新')
}

// 搜索
const handleSearch = () => {
  refreshData()
}

const handleExportImage = () => {
  exportToImage(containerRef.value, '成绩分析')
}

const handleExportPDF = () => {
  exportToPDF(containerRef.value, '成绩分析')
}

// 监听课程变化，更新成绩趋势
watch(() => searchModel.value.courseId, () => {
  loadMyGradeTrend()
})

// 初始化
onMounted(async () => {
  await loadUserInfo()
  await loadCourseOptions()
  await loadStatusCardData()
  await loadOverallSuggestion()
  await refreshData()
})
</script>

<template>
  <div class="grade-analysis" ref="containerRef" v-loading="loading">
    <div class="section-content">
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in statusCardData" :key="item.title">
          <StatBox :title="item.title" :stat-num="item.statNum" :rate="item.rate" />
        </el-col>
      </el-row>
    </div>
    <el-row :gutter="20" style="margin-top: 20px;margin-bottom: 20px;">
      <el-col :span="24">
        <el-card shadow="always" header="🤖 AI 学习建议">
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

    <div class="container-header">
      <el-form inline label-width="80" :model="searchModel" class="select-box">
        <el-form-item label="课程" prop="course">
          <el-select size="large" placeholder="选择课程" style="width: 180px" v-model="searchModel.courseId" clearable
            @change="handleSearch">
            <el-option v-for="item in courseOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="export-btns">
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

    <div class="container-content">
      <div class="content-header">
        <h4><i class="fas fa-list"></i> 近期考试</h4>
      </div>
      <div class="content-body">
        <el-empty v-if="examList.length === 0 && !loading" description="暂无考试数据" />
        <TestBox v-for="exam in examList" :key="exam.id" :exam="exam" :status="exam?.status"
          :handleClick="handleExamClick" />
      </div>
    </div>
    <!-- <div class="container-content">
      <el-card shadow="always">
        <EChart :options="gradeChartOption" height="400px" />
        <template #footer>
          <div class="echart-desc">
            <div class="echart-desc-item">
              平均分：<p>{{ gradeDistribution.stats.average }}分</p>
            </div>
            <div class="echart-desc-item">
              最高分：<p>{{ gradeDistribution.stats.highest }}分</p>
            </div>
            <div class="echart-desc-item">
              最低分：<p>{{ gradeDistribution.stats.lowest }}分</p>
            </div>
            <div class="echart-desc-item">
              及格率：<p>{{ gradeDistribution.stats.passRate }}%</p>
            </div>
            <div class="echart-desc-item">
              优秀率：<p>{{ gradeDistribution.stats.excellentRate }}%</p>
            </div>
          </div>
        </template>
      </el-card>
    </div> -->

    <div class="container-content">
      <el-card shadow="always">
        <EChart :options="gradeTrendOption" height="400px" />
      </el-card>
    </div>

    <!-- 作业详情弹窗 -->
    <el-drawer v-model="detailDrawerVisible" title="作业详情" direction="rtl" size="800px">
      <div class="work-detail" v-if="currentExam">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="课程名称">
            {{ currentExam.courseName }}
          </el-descriptions-item>
          <el-descriptions-item label="作业名称">
            {{ currentExam.name }}
          </el-descriptions-item>
          <el-descriptions-item label="描述">
            {{ currentExam.description || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="得分情况"
            v-if="currentExam.scoreAnalysis.score && currentExam.scoreAnalysis.score !== -1">
            <div class="score-detail">
              <div class="detail-text">
                <h4>我的得分：{{ currentExam.scoreAnalysis.score }}</h4>
                <h4>班级平均分：{{ currentExam.scoreAnalysis.classAvg }}</h4>
                <h4>相差：{{ currentExam.scoreAnalysis.diffFromAvg }}</h4>
                <h4>总分：{{ currentExam.totalScore }}</h4>
              </div>
              <div class="echart-desc">
                <div style="font-size: 3rem; font-weight: 700; color: #1d4e7c">
                  {{ currentExam.scoreAnalysis.rank }}
                </div>
                <div style="font-size: 1.1rem; margin-top: 10px">
                  超过全班 <strong>{{ Math.round((1 - currentExam.scoreAnalysis.rank / 45) * 100) }}%</strong> 的同学
                </div>
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card shadow="hover" header="🤖 AI 学习建议">
              <div class="ai-suggestions">
                <div class="ai-content" v-if="currentExam.aiSuggestion">
                  <h4>总结<p>{{ currentExam.aiSuggestion.summary }}</p>
                  </h4>
                  <h4>优势<p v-for="(strength, index) in currentExam.aiSuggestion.strengths" :key="index">
                      {{ currentExam.aiSuggestion.strengths?.length > 1 ? index + 1 + "." : "" }}{{ strength }}
                    </p>
                  </h4>
                  <h4>弱点<p v-for="(weakness, index) in currentExam.aiSuggestion.weaknesses" :key="index">
                      {{ currentExam.aiSuggestion.weaknesses?.length > 1 ? index + 1 + "." : "" }}{{ weakness }}
                    </p>
                  </h4>
                  <h4>建议<div style="display: flex;flex-direction: column;">
                      <p v-for="(suggestion, index) in currentExam.aiSuggestion.suggestions" :key="index">
                        {{ currentExam.aiSuggestion.suggestions?.length > 1 ? index + 1 + "." : "" }}{{ suggestion }}
                      </p>
                    </div>
                  </h4>
                </div>
                <div class="ai-content" v-else>
                  {{ '暂无AI建议，请先完成更多学习活动' }}
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row style="margin-top: 20px;" v-if="currentExam.knowledgePointAnalysis?.length > 0">
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
.grade-analysis {
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

  .container-content {
    width: 100%;
    padding: 10px 20px;

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;

      .title {
        font-size: 1, 3rem;
        font-weight: bold;
      }
    }

    .content-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .echart-desc {
      display: flex;
      align-items: center;
      height: 40px;
      gap: 20px;
      padding-left: 32px;

      .echart-desc-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 1.2rem;
        font-weight: 700;
        color: #3f6185;

        p {
          font-size: 1rem;
          font-weight: 400;
        }
      }
    }
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
</style>
