<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import EChart from '@/components/EChart.vue'
import { exportToImage, exportToPDF } from '@/utils/export'
import { Picture } from '@element-plus/icons-vue'
import StatBox from './component/stat-box.vue'
import { authApi, dashboardApi } from '@/api/index.js'
import { ElMessage } from 'element-plus'

const dashboardRef = ref(null)
const loading = ref(false)
const dashboardData = ref(null)
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

// 数据状态
const statsData = computed(() => {
  return {
    activityScore: dashboardData.value?.activityScore || 0,
    homeworkAvgScore: dashboardData.value?.homeworkAvgScore || 0,
    avgScore: dashboardData.value?.avgScore || 0,
    latestRank: dashboardData.value?.latestRank || 0
  }
})

const knowledgeData = computed(() => {
  return dashboardData.value?.knowledgeRadarData || { 'Vue3 基础': 0, ' Pinia 状态管理': 0, 'Vue Router 路由': 0, 'ECharts 可视化': 0, 'Element Plus 组件': 0, '项目实战能力': 0 }
})

const gradeTrendData = computed(() => dashboardData.value?.scoreTrend || [{ examName: '考试一', score: 0, classRank: 0 }])

const attendanceData = ref([])

// 选项数据
const semesterOptions = ref([])
const searchModel = ref({
  semester: '',
  course: '',
})

// 加载学期列表
// const loadSemesterOptions = async () => {
//   try {
//     const res = await dashboardApi.getSemesterList(userInfo.value.id)
//     semesterOptions.value = res.data
//   } catch (error) {
//     console.error('加载学期列表失败:', error)
//     ElMessage.error('加载学期列表失败')
//   }
// }

const refreshAiSuggestions = async () => {
  await dashboardApi.getAISuggestions(userInfo.value.id)
}

const loadData = async () => {
  try {
    const res = await dashboardApi.getStudentDashbord(userInfo.value.id)
    dashboardData.value = res.data
  } catch (error) {
    console.error('数据加载失败:', error)
    ElMessage.error('加载dashboard数据加载失败')
  }
}

// 监听学期变化，重新加载课程选项
watch(() => searchModel.value.semester, async (newSemester, oldSemester) => {
  if (newSemester && newSemester !== oldSemester) {
    await refreshData()
  }
})

// 监听课程变化，刷新相关数据
watch(() => searchModel.value.course, async () => {
  await refreshData()
})

// 刷新所有数据
const refreshData = async () => {
  loading.value = true
  try {
    await loadData()
    ElMessage.success('数据已刷新')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

// 知识点掌握雷达图数据
const radarOption = computed(() => {
  const indicators = Object.keys(knowledgeData.value).map(name => ({ name, max: 100 }));
  const currentData = Object.values(knowledgeData.value);
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

// 学习成绩趋势折线图数据
const lineOption = computed(() => {

  const scores = gradeTrendData.value.map(item => item.score);
  const exams = gradeTrendData.value.map(item => item.examName);
  const classRank = gradeTrendData.value.map(item => item.classRank);

  return {
    title: {
      text: '学习成绩趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['我的成绩', '班级排名'],
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
      data: exams,
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
        data: scores,
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
        name: '班级排名',
        data: classRank,
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

// 班级排名仪表盘数据
const gaugeOption = computed(() => {
  const percent = statsData.value.latestRank > 0
    ? Math.round((1 - statsData.value.latestRank / 45) * 100)
    : 0

  return {
    title: {
      text: '班级排名位置',
      left: 'center'
    },
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
    },
    series: [
      {
        name: '排名',
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 5,
        progress: {
          show: true,
          width: 18,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#409EFF' },
                { offset: 1, color: '#67C23A' }
              ]
            }
          }
        },
        axisLine: {
          lineStyle: {
            width: 18,
            color: [[1, '#E6E6E6']]
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        pointer: {
          show: false
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}%',
          fontSize: 24,
          offsetCenter: [0, 20],
          color: '#1d4e7c'
        },
        title: {
          show: false
        },
        data: [
          {
            value: percent,
            name: '击败全班同学'
          }
        ]
      }
    ]
  }
})

// 出勤热力图配置
const heatmapOption = computed(() => {
  return {
    title: {
      top: 30,
      left: 'center',
      text: '学生年度出勤热力图'
    },
    tooltip: {
      formatter: (params) => {
        if (params && params.value) {
          return `${params.value[0]}: ${params.value[1]}% 出勤率`
        }
        return ''
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      type: 'piecewise',
      orient: 'horizontal',
      left: 'center',
      top: 65,
      pieces: [
        { min: 95, label: '全勤', color: '#67C23A' },
        { min: 85, max: 95, label: '良好', color: '#409EFF' },
        { min: 70, max: 85, label: '一般', color: '#E6A23C' },
        { max: 70, label: '预警', color: '#F56C6C' }
      ]
    },
    calendar: {
      top: 120,
      left: 30,
      right: 30,
      cellSize: ['auto', 13],
      range: '2025',
      itemStyle: {
        borderWidth: 0.5,
        borderColor: '#ddd'
      },
      yearLabel: { show: false },
      dayLabel: {
        firstDay: 1,
        nameMap: 'cn'
      },
      monthLabel: {
        nameMap: 'cn'
      }
    },
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: Array.isArray(attendanceData.value) ? attendanceData.value : []
    }
  }
})

const handleExportImage = () => {
  exportToImage(dashboardRef.value, '学生个人学习驾驶舱')
}

const handleExportPDF = () => {
  exportToPDF(dashboardRef.value, '学生个人学习驾驶舱')
}

const handleSearch = async () => {
  refreshData()
  await refreshAiSuggestions(userInfo.value.id)
}

onMounted(async () => {
  loading.value = true
  try {
    // 先加载学期选项
    await loadUserInfo()
    await loadSemesterOptions()
    // 然后加载所有数据
    await refreshData()
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('页面初始化失败')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="dashboard-container" ref="dashboardRef" v-loading="loading">
    <div class="container-header">
      <!-- <el-form inline label-width="80" :model="searchModel" class="select-box">
        <el-form-item label="学期" prop="semester">
          <el-select size="large" v-model="searchModel.semester" placeholder="请选择学期" style="width: 240px">
            <el-option v-for="item in semesterOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form> -->
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

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <StatBox icon="fa-book-open" title="活动得分" :stat-num="statsData.activityScore" />
      </el-col>
      <el-col :span="6">
        <StatBox icon="fa-clock" title="作业平均分" :stat-num="statsData.homeworkAvgScore" />
      </el-col>
      <el-col :span="6">
        <StatBox icon="fa-pencil-alt" title="平均分" :stat-num="statsData.avgScore" />
      </el-col>
      <el-col :span="6">
        <StatBox icon="fa-trophy" title="班级排名" :stat-num="statsData.latestRank" />
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;" v-loading="loading">
      <el-col :span="24">
        <el-card shadow="hover" header="🤖 AI 学习建议">
          <div class="ai-suggestions">
            <div class="ai-content">{{ dashboardData?.aiSuggestions || '暂无AI建议，请先完成更多学习活动' }}</div>
            <div class="ai-content" v-if="dashboardData?.aiSummary">
              <h4>总结:</h4>{{ dashboardData?.aiSummary }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <EChart :options="radarOption" height="400px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <el-row>
            <el-col :span="17">
              <EChart :options="gaugeOption" height="400px" />
            </el-col>
            <el-col :span="7">
              <div class="echart-desc">
                <div style="font-size: 3rem; font-weight: 700; color: #1d4e7c">
                  {{ statsData.latestRank }}
                </div>
                <div style="font-size: 1.1rem; margin-top: 8px">
                  超过全班 <strong>{{ Math.round((1 - statsData.latestRank / 45) * 100) }}%</strong> 的同学
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <EChart :options="lineOption" height="400px" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover" header="出勤统计">
          <EChart :options="heatmapOption" height="300px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.dashboard-container {
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

  .echart-desc {
    padding-top: 80px;
  }

  .ai-suggestions {
    .ai-content {
      white-space: pre-wrap;
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 8px;
      line-height: 1.6;
      color: #606266;
    }
  }
}
</style>